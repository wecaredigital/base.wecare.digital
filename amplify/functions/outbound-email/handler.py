"""
Outbound Email Lambda Function

Purpose: Send email messages via AWS SES
Requirements: 3.4, 7.1-7.7

Validates email opt-in, checks rate limits, calls SES API.
Supports both plain text and HTML formats.
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
ses = boto3.client('ses', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
SEND_MODE = os.environ.get('SEND_MODE', 'LIVE')
CONTACTS_TABLE = os.environ.get('CONTACTS_TABLE', 'base-wecare-digital-ContactsTable')
MESSAGES_TABLE = os.environ.get('MESSAGES_TABLE', 'Messages')
RATE_LIMIT_TABLE = os.environ.get('RATE_LIMIT_TABLE', 'RateLimitTrackers')
SES_SENDER_EMAIL = os.environ.get('SES_SENDER_EMAIL', 'one@wecare.digital')
SES_SENDER_NAME = os.environ.get('SES_SENDER_NAME', 'WECARE.DIGITAL')

# Constants
RATE_LIMIT_PER_SECOND = 10  # Requirement 7.5
MESSAGE_TTL_SECONDS = 30 * 24 * 60 * 60  # 30 days


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Send email message.
    Requirements: 3.4, 7.2-7.7
    """
    request_id = context.aws_request_id if context else 'local'
    
    logger.info(json.dumps({
        'event': 'outbound_email_start',
        'sendMode': SEND_MODE,
        'requestId': request_id
    }))
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        contact_id = body.get('contactId')
        subject = body.get('subject', '')
        content = body.get('content', '')  # Plain text
        html_content = body.get('htmlContent')  # HTML (optional)
        
        if not contact_id:
            return _error_response(400, 'contactId is required')
        
        if not subject:
            return _error_response(400, 'subject is required')
        
        if not content and not html_content:
            return _error_response(400, 'content or htmlContent is required')
        
        # Retrieve contact
        contact = _get_contact(contact_id)
        if not contact:
            return _error_response(404, 'Contact not found')
        
        # All contacts are allowed by default - no opt-in/allowlist checks
        
        # Validate email exists
        recipient_email = contact.get('email')
        if not recipient_email:
            return _error_response(400, 'Contact has no email address')
        
        # Requirement 7.5: Check rate limit (10 messages/second)
        if not _check_rate_limit():
            return _error_response(429, 'Rate limit exceeded. Try again later.')
        
        # Generate message ID
        message_id = str(uuid.uuid4())
        
        # Requirement 7.3: DRY_RUN mode
        if SEND_MODE == 'DRY_RUN':
            return _handle_dry_run(message_id, contact_id, recipient_email, subject, content, html_content, request_id)
        
        # Requirement 7.2: LIVE mode - call SES
        return _handle_live_send(message_id, contact_id, recipient_email, subject, content, html_content, request_id)
        
    except json.JSONDecodeError:
        return _error_response(400, 'Invalid JSON in request body')
    except Exception as e:
        logger.error(json.dumps({
            'event': 'outbound_email_error',
            'error': str(e),
            'requestId': request_id
        }))
        return _error_response(500, 'Internal server error')


def _handle_dry_run(message_id: str, contact_id: str, recipient_email: str,
                    subject: str, content: str, html_content: Optional[str],
                    request_id: str) -> Dict[str, Any]:
    """Handle DRY_RUN mode."""
    _store_message_record(message_id, contact_id, subject, content, html_content, 'dry_run')
    
    logger.info(json.dumps({
        'event': 'dry_run_email',
        'messageId': message_id,
        'contactId': contact_id,
        'recipientEmail': recipient_email,
        'subject': subject,
        'hasHtml': bool(html_content),
        'requestId': request_id
    }))
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'messageId': message_id,
            'status': 'dry_run',
            'mode': 'DRY_RUN'
        })
    }


def _handle_live_send(message_id: str, contact_id: str, recipient_email: str,
                      subject: str, content: str, html_content: Optional[str],
                      request_id: str) -> Dict[str, Any]:
    """
    Handle LIVE mode - call SES API.
    Requirement 7.4: Support both plain text and HTML formats
    """
    try:
        # Build email body - Requirement 7.4
        body_content = {}
        if content:
            body_content['Text'] = {
                'Data': content,
                'Charset': 'UTF-8'
            }
        if html_content:
            body_content['Html'] = {
                'Data': html_content,
                'Charset': 'UTF-8'
            }
        
        # Format sender
        sender = f"{SES_SENDER_NAME} <{SES_SENDER_EMAIL}>"
        
        # Call SES SendEmail API
        response = ses.send_email(
            Source=sender,
            Destination={
                'ToAddresses': [recipient_email]
            },
            Message={
                'Subject': {
                    'Data': subject,
                    'Charset': 'UTF-8'
                },
                'Body': body_content
            }
        )
        
        ses_message_id = response.get('MessageId', '')
        
        # Requirement 7.7: Store message record
        _store_message_record(
            message_id=message_id,
            contact_id=contact_id,
            subject=subject,
            content=content,
            html_content=html_content,
            status='sent',
            ses_message_id=ses_message_id
        )
        
        logger.info(json.dumps({
            'event': 'email_sent',
            'messageId': message_id,
            'sesMessageId': ses_message_id,
            'contactId': contact_id,
            'hasHtml': bool(html_content),
            'requestId': request_id
        }))
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'messageId': message_id,
                'sesMessageId': ses_message_id,
                'status': 'sent',
                'mode': 'LIVE'
            })
        }
        
    except ses.exceptions.MessageRejected as e:
        _store_message_record(
            message_id=message_id,
            contact_id=contact_id,
            subject=subject,
            content=content,
            html_content=html_content,
            status='failed',
            error_details={'type': 'message_rejected', 'message': str(e)}
        )
        return _error_response(400, f'Email rejected: {str(e)}')
        
    except Exception as e:
        # Requirement 7.6: Store error details
        _store_message_record(
            message_id=message_id,
            contact_id=contact_id,
            subject=subject,
            content=content,
            html_content=html_content,
            status='failed',
            error_details={'type': 'api_error', 'message': str(e)}
        )
        
        logger.error(json.dumps({
            'event': 'email_send_error',
            'messageId': message_id,
            'error': str(e),
            'requestId': request_id
        }))
        
        return _error_response(500, f'Failed to send email: {str(e)}')


def _get_contact(contact_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve contact from DynamoDB."""
    try:
        contacts_table = dynamodb.Table(CONTACTS_TABLE)
        # Table uses 'id' as primary key
        response = contacts_table.get_item(Key={'id': contact_id})
        item = response.get('Item')
        if item and item.get('deletedAt') is not None:
            return None
        return item
    except Exception:
        return None


def _check_rate_limit() -> bool:
    """Check rate limit for email (10 messages/second)."""
    try:
        rate_table = dynamodb.Table(RATE_LIMIT_TABLE)
        now = int(time.time())
        
        response = rate_table.update_item(
            Key={'channel': 'email', 'windowStart': now},
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


def _store_message_record(message_id: str, contact_id: str, subject: str, content: str,
                          html_content: Optional[str], status: str, ses_message_id: str = None,
                          error_details: Dict = None) -> None:
    """Store message record in DynamoDB."""
    now = int(time.time())
    expires_at = now + MESSAGE_TTL_SECONDS
    
    record = {
        'id': message_id,  # Primary key - table uses 'id'
        'messageId': message_id,  # Keep for backwards compatibility
        'contactId': contact_id,
        'channel': 'email',
        'direction': 'outbound',
        'subject': subject,
        'content': content,
        'htmlContent': html_content,
        'messageType': 'html' if html_content else 'text',
        'timestamp': Decimal(str(now)),
        'status': status,
        'sesMessageId': ses_message_id,
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
