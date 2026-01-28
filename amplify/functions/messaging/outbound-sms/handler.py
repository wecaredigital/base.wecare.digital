"""
Outbound SMS Lambda Function

Purpose: Send SMS messages via AWS SNS/Pinpoint
Supports both AWS SNS and Airtel SMS gateway
"""

import os
import json
import uuid
import time
import logging
import boto3
from typing import Dict, Any
from decimal import Decimal

# Configure logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

# AWS clients
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
sns = boto3.client('sns', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
pinpoint = boto3.client('pinpoint', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
CONTACTS_TABLE = os.environ.get('CONTACTS_TABLE', 'base-wecare-digital-ContactsTable')
MESSAGES_TABLE = os.environ.get('MESSAGES_TABLE', 'base-wecare-digital-MessagesTable')
PINPOINT_APP_ID = os.environ.get('PINPOINT_APP_ID', '')
ORIGINATION_NUMBER = os.environ.get('ORIGINATION_NUMBER', '')
SENDER_ID = os.environ.get('SENDER_ID', 'WECARE')
MESSAGE_TTL_SECONDS = 30 * 24 * 60 * 60  # 30 days


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Send SMS message."""
    request_id = context.aws_request_id if context else 'local'
    
    logger.info(json.dumps({
        'event': 'outbound_sms_start',
        'requestId': request_id
    }))
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        contact_id = body.get('contactId')
        content = body.get('content', '')
        provider = body.get('provider', 'aws')  # aws or airtel
        
        if not contact_id:
            return _response(400, {'error': 'contactId is required'})
        
        if not content:
            return _response(400, {'error': 'content is required'})
        
        # Get contact details
        contact = _get_contact(contact_id)
        if not contact:
            return _response(404, {'error': 'Contact not found'})
        
        phone = contact.get('phone', '')
        if not phone:
            return _response(400, {'error': 'Contact has no phone number'})
        
        # Check opt-in status
        if not contact.get('optInSms', False) and not contact.get('allowlistSms', False):
            return _response(403, {'error': 'Contact has not opted in for SMS'})
        
        # Generate message ID
        message_id = str(uuid.uuid4())
        
        # Send SMS based on provider
        if provider == 'airtel':
            result = _send_airtel_sms(phone, content, request_id)
        else:
            result = _send_aws_sms(phone, content, request_id)
        
        if not result.get('success'):
            # Store failed message
            _store_message(message_id, contact_id, content, 'FAILED', result.get('error'))
            return _response(500, {
                'error': result.get('error', 'Failed to send SMS'),
                'messageId': message_id
            })
        
        # Store successful message
        _store_message(message_id, contact_id, content, 'SENT', None, result.get('providerMessageId'))
        
        logger.info(json.dumps({
            'event': 'sms_sent',
            'messageId': message_id,
            'contactId': contact_id,
            'provider': provider,
            'requestId': request_id
        }))
        
        return _response(200, {
            'messageId': message_id,
            'status': 'sent',
            'providerMessageId': result.get('providerMessageId')
        })
        
    except json.JSONDecodeError:
        return _response(400, {'error': 'Invalid JSON in request body'})
    except Exception as e:
        logger.error(json.dumps({
            'event': 'outbound_sms_error',
            'error': str(e),
            'requestId': request_id
        }))
        return _response(500, {'error': 'Internal server error'})


def _get_contact(contact_id: str) -> Dict[str, Any]:
    """Get contact from DynamoDB."""
    try:
        table = dynamodb.Table(CONTACTS_TABLE)
        response = table.get_item(Key={'contactId': contact_id})
        return response.get('Item', {})
    except Exception as e:
        logger.error(f"Get contact error: {str(e)}")
        return {}


def _send_aws_sms(phone: str, content: str, request_id: str) -> Dict[str, Any]:
    """Send SMS via AWS SNS/Pinpoint."""
    try:
        # Use Pinpoint if configured
        if PINPOINT_APP_ID:
            response = pinpoint.send_messages(
                ApplicationId=PINPOINT_APP_ID,
                MessageRequest={
                    'Addresses': {
                        phone: {'ChannelType': 'SMS'}
                    },
                    'MessageConfiguration': {
                        'SMSMessage': {
                            'Body': content,
                            'MessageType': 'TRANSACTIONAL',
                            'OriginationNumber': ORIGINATION_NUMBER or None,
                            'SenderId': SENDER_ID,
                        }
                    }
                }
            )
            result = response.get('MessageResponse', {}).get('Result', {}).get(phone, {})
            if result.get('StatusCode') == 200:
                return {'success': True, 'providerMessageId': result.get('MessageId')}
            return {'success': False, 'error': result.get('StatusMessage', 'Pinpoint error')}
        
        # Fallback to SNS
        response = sns.publish(
            PhoneNumber=phone,
            Message=content,
            MessageAttributes={
                'AWS.SNS.SMS.SenderID': {
                    'DataType': 'String',
                    'StringValue': SENDER_ID
                },
                'AWS.SNS.SMS.SMSType': {
                    'DataType': 'String',
                    'StringValue': 'Transactional'
                }
            }
        )
        return {'success': True, 'providerMessageId': response.get('MessageId')}
        
    except Exception as e:
        logger.error(f"AWS SMS error: {str(e)}")
        return {'success': False, 'error': str(e)}


def _send_airtel_sms(phone: str, content: str, request_id: str) -> Dict[str, Any]:
    """Send SMS via Airtel IQ API."""
    import urllib.request
    import urllib.parse
    
    try:
        airtel_api_key = os.environ.get('AIRTEL_API_KEY', '')
        airtel_sender_id = os.environ.get('AIRTEL_SENDER_ID', 'WECARE')
        
        if not airtel_api_key:
            return {'success': False, 'error': 'Airtel API key not configured'}
        
        # Airtel IQ SMS API endpoint
        url = 'https://iqsms.airtel.in/api/v1/send-sms'
        
        payload = {
            'apiKey': airtel_api_key,
            'senderId': airtel_sender_id,
            'to': phone,
            'message': content,
        }
        
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            if result.get('status') == 'success':
                return {'success': True, 'providerMessageId': result.get('messageId')}
            return {'success': False, 'error': result.get('message', 'Airtel API error')}
            
    except Exception as e:
        logger.error(f"Airtel SMS error: {str(e)}")
        return {'success': False, 'error': str(e)}


def _store_message(message_id: str, contact_id: str, content: str, status: str, 
                   error: str = None, provider_message_id: str = None) -> None:
    """Store message record in DynamoDB."""
    try:
        now = int(time.time())
        table = dynamodb.Table(MESSAGES_TABLE)
        
        item = {
            'messageId': message_id,
            'contactId': contact_id,
            'channel': 'SMS',
            'direction': 'OUTBOUND',
            'content': content,
            'status': status,
            'timestamp': Decimal(str(now)),
            'createdAt': Decimal(str(now)),
            'ttl': Decimal(str(now + MESSAGE_TTL_SECONDS)),
        }
        
        if error:
            item['errorDetails'] = error
        if provider_message_id:
            item['providerMessageId'] = provider_message_id
        
        table.put_item(Item=item)
        
    except Exception as e:
        logger.error(f"Store message error: {str(e)}")


def _response(status_code: int, body: Dict) -> Dict[str, Any]:
    """Return HTTP response with CORS headers."""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'POST,OPTIONS'
        },
        'body': json.dumps(body)
    }
