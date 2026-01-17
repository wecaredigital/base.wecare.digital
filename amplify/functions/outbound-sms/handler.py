"""
Outbound SMS Lambda Function

Purpose: Send SMS messages via AWS Pinpoint SMS
Requirements: 3.3, 6.1-6.7

Validates SMS opt-in, checks rate limits, calls Pinpoint SMS API.
"""

import os
import json
import uuid
import time
import logging
import boto3
from typing import Dict, Any, Optional
from decimal import Decimal

# Configure logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

# AWS clients
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
pinpoint_sms = boto3.client('pinpoint-sms-voice-v2', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
SEND_MODE = os.environ.get('SEND_MODE', 'DRY_RUN')
CONTACTS_TABLE = os.environ.get('CONTACTS_TABLE', 'Contacts')
MESSAGES_TABLE = os.environ.get('MESSAGES_TABLE', 'Messages')
RATE_LIMIT_TABLE = os.environ.get('RATE_LIMIT_TABLE', 'RateLimitTrackers')
SMS_POOL_ID = os.environ.get('SMS_POOL_ID', 'pool-6fbf5a5f390d4eeeaa7dbae39d78933e')

# Constants
MAX_SMS_LENGTH = 1600  # Requirement 6.4
RATE_LIMIT_PER_SECOND = 5  # Requirement 6.5
MESSAGE_TTL_SECONDS = 30 * 24 * 60 * 60  # 30 days


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Send SMS message.
    Requirements: 3.3, 6.2-6.7
    """
    request_id = context.aws_request_id if context else 'local'
    
    logger.info(json.dumps({
        'event': 'outbound_sms_start',
        'sendMode': SEND_MODE,
        'requestId': request_id
    }))
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        contact_id = body.get('contactId')
        content = body.get('content', '')
        
        if not contact_id:
            return _error_response(400, 'contactId is required')
        
        if not content:
            return _error_response(400, 'content is required')
        
        # Retrieve contact
        contact = _get_contact(contact_id)
        if not contact:
            return _error_response(404, 'Contact not found')
        
        # Requirement 3.3: Validate SMS opt-in
        if not contact.get('optInSms'):
            _log_validation_failure(contact_id, 'sms', 'opt_in_required', request_id)
            return _error_response(400, 'SMS opt-in required')
        
        # Validate phone number exists
        recipient_phone = contact.get('phone')
        if not recipient_phone:
            return _error_response(400, 'Contact has no phone number')
        
        # Requirement 6.4: Validate length (up to 1600 chars with segmentation)
        if len(content) > MAX_SMS_LENGTH:
            return _error_response(400, f'Content exceeds {MAX_SMS_LENGTH} characters')
        
        # Requirement 6.5: Check rate limit (5 messages/second)
        if not _check_rate_limit():
            return _error_response(429, 'Rate limit exceeded. Try again later.')
        
        # Generate message ID
        message_id = str(uuid.uuid4())
        
        # Requirement 6.3: DRY_RUN mode
        if SEND_MODE == 'DRY_RUN':
            return _handle_dry_run(message_id, contact_id, recipient_phone, content, request_id)
        
        # Requirement 6.2: LIVE mode - call Pinpoint SMS
        return _handle_live_send(message_id, contact_id, recipient_phone, content, request_id)
        
    except json.JSONDecodeError:
        return _error_response(400, 'Invalid JSON in request body')
    except Exception as e:
        logger.error(json.dumps({
            'event': 'outbound_sms_error',
            'error': str(e),
            'requestId': request_id
        }))
        return _error_response(500, 'Internal server error')


def _handle_dry_run(message_id: str, contact_id: str, recipient_phone: str,
                    content: str, request_id: str) -> Dict[str, Any]:
    """Handle DRY_RUN mode."""
    _store_message_record(message_id, contact_id, content, 'dry_run')
    
    logger.info(json.dumps({
        'event': 'dry_run_sms',
        'messageId': message_id,
        'contactId': contact_id,
        'recipientPhone': recipient_phone,
        'contentLength': len(content),
        'segments': _calculate_segments(content),
        'requestId': request_id
    }))
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'messageId': message_id,
            'status': 'dry_run',
            'mode': 'DRY_RUN',
            'segments': _calculate_segments(content)
        })
    }


def _handle_live_send(message_id: str, contact_id: str, recipient_phone: str,
                      content: str, request_id: str) -> Dict[str, Any]:
    """Handle LIVE mode - call Pinpoint SMS API."""
    try:
        # Format phone number (ensure E.164 format)
        formatted_phone = _format_phone_number(recipient_phone)
        
        # Call Pinpoint SMS API
        response = pinpoint_sms.send_text_message(
            DestinationPhoneNumber=formatted_phone,
            OriginationIdentity=SMS_POOL_ID,
            MessageBody=content,
            MessageType='TRANSACTIONAL'
        )
        
        sms_message_id = response.get('MessageId', '')
        
        # Requirement 6.7: Store message record
        _store_message_record(
            message_id=message_id,
            contact_id=contact_id,
            content=content,
            status='sent',
            sms_message_id=sms_message_id
        )
        
        logger.info(json.dumps({
            'event': 'sms_sent',
            'messageId': message_id,
            'smsMessageId': sms_message_id,
            'contactId': contact_id,
            'segments': _calculate_segments(content),
            'requestId': request_id
        }))
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'messageId': message_id,
                'smsMessageId': sms_message_id,
                'status': 'sent',
                'mode': 'LIVE',
                'segments': _calculate_segments(content)
            })
        }
        
    except Exception as e:
        # Requirement 6.6: Store error details
        _store_message_record(
            message_id=message_id,
            contact_id=contact_id,
            content=content,
            status='failed',
            error_details={'type': 'api_error', 'message': str(e)}
        )
        
        logger.error(json.dumps({
            'event': 'sms_send_error',
            'messageId': message_id,
            'error': str(e),
            'requestId': request_id
        }))
        
        return _error_response(500, f'Failed to send SMS: {str(e)}')


def _calculate_segments(content: str) -> int:
    """Calculate number of SMS segments based on content length."""
    # GSM-7: 160 chars per segment, 153 for multipart
    # Unicode: 70 chars per segment, 67 for multipart
    if _is_gsm7(content):
        if len(content) <= 160:
            return 1
        return (len(content) + 152) // 153
    else:
        if len(content) <= 70:
            return 1
        return (len(content) + 66) // 67


def _is_gsm7(text: str) -> bool:
    """Check if text can be encoded in GSM-7."""
    gsm7_chars = set('@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà')
    return all(c in gsm7_chars for c in text)


def _format_phone_number(phone: str) -> str:
    """Format phone number to E.164 format."""
    # Remove spaces, dashes, parentheses
    cleaned = ''.join(c for c in phone if c.isdigit() or c == '+')
    if not cleaned.startswith('+'):
        # Assume Indian number if no country code
        if len(cleaned) == 10:
            cleaned = '+91' + cleaned
        else:
            cleaned = '+' + cleaned
    return cleaned


def _get_contact(contact_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve contact from DynamoDB."""
    try:
        contacts_table = dynamodb.Table(CONTACTS_TABLE)
        response = contacts_table.get_item(Key={'contactId': contact_id})
        item = response.get('Item')
        if item and item.get('deletedAt') is not None:
            return None
        return item
    except Exception:
        return None


def _check_rate_limit() -> bool:
    """Check rate limit for SMS (5 messages/second)."""
    try:
        rate_table = dynamodb.Table(RATE_LIMIT_TABLE)
        now = int(time.time())
        
        response = rate_table.update_item(
            Key={'channel': 'sms', 'windowStart': now},
            UpdateExpression='SET messageCount = if_not_exists(messageCount, :zero) + :inc, lastUpdatedAt = :now',
            ExpressionAttributeValues={
                ':zero': Decimal('0'),
                ':inc': Decimal('1'),
                ':now': Decimal(str(now + 86400))
            },
            ReturnValues='UPDATED_NEW'
        )
        
        count = int(response.get('Attributes', {}).get('messageCount', 0))
        return count <= RATE_LIMIT_PER_SECOND
    except Exception:
        return True


def _store_message_record(message_id: str, contact_id: str, content: str, status: str,
                          sms_message_id: str = None, error_details: Dict = None) -> None:
    """Store message record in DynamoDB."""
    now = int(time.time())
    expires_at = now + MESSAGE_TTL_SECONDS
    
    record = {
        'messageId': message_id,
        'contactId': contact_id,
        'channel': 'sms',
        'direction': 'outbound',
        'content': content,
        'messageType': 'text',
        'timestamp': Decimal(str(now)),
        'status': status,
        'smsMessageId': sms_message_id,
        'segments': _calculate_segments(content),
        'errorDetails': json.dumps(error_details) if error_details else None,
        'createdAt': Decimal(str(now)),
        'expiresAt': Decimal(str(expires_at)),
    }
    
    try:
        messages_table = dynamodb.Table(MESSAGES_TABLE)
        messages_table.put_item(Item={k: v for k, v in record.items() if v is not None})
    except Exception as e:
        logger.error(f"Failed to store message record: {str(e)}")


def _log_validation_failure(contact_id: str, channel: str, reason: str, request_id: str) -> None:
    """Log validation failure."""
    logger.warning(json.dumps({
        'event': 'validation_failure',
        'contactId': contact_id,
        'channel': channel,
        'reason': reason,
        'requestId': request_id,
        'timestamp': int(time.time())
    }))


def _error_response(status_code: int, message: str) -> Dict[str, Any]:
    """Return error response."""
    return {
        'statusCode': status_code,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'error': message})
    }
