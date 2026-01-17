"""
Inbound WhatsApp Handler Lambda Function

Purpose: Process SNS notifications for WhatsApp messages
Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.12

Parses AWS EUM Social event format, stores messages, downloads media,
updates contact timestamps for 24-hour customer service window.
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
sqs = boto3.client('sqs', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
social_messaging = boto3.client('socialmessaging', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
s3 = boto3.client('s3', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
CONTACTS_TABLE = os.environ.get('CONTACTS_TABLE', 'Contacts')
MESSAGES_TABLE = os.environ.get('MESSAGES_TABLE', 'Messages')
MEDIA_FILES_TABLE = os.environ.get('MEDIA_FILES_TABLE', 'MediaFiles')
INBOUND_DLQ_URL = os.environ.get('INBOUND_DLQ_URL', '')
MEDIA_BUCKET = os.environ.get('MEDIA_BUCKET', 'auth.wecare.digital')
MEDIA_PREFIX = os.environ.get('MEDIA_INBOUND_PREFIX', 'whatsapp-media/whatsapp-media-incoming/')

# TTL: 30 days in seconds
MESSAGE_TTL_SECONDS = 30 * 24 * 60 * 60


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Process inbound WhatsApp messages from SNS.
    
    AWS EUM Social Event Format:
    {
        "context": { "MetaWabaIds": [...], "MetaPhoneNumberIds": [...] },
        "whatsAppWebhookEntry": "{...JSON STRING...}",
        "aws_account_id": "809904170947",
        "message_timestamp": "2026-01-17T12:00:00.000Z",
        "messageId": "uuid"
    }
    """
    request_id = context.aws_request_id if context else 'local'
    processed_count = 0
    error_count = 0
    
    logger.info(json.dumps({
        'event': 'inbound_processing_start',
        'recordCount': len(event.get('Records', [])),
        'requestId': request_id
    }))
    
    for record in event.get('Records', []):
        try:
            # Parse SNS message
            sns_message = json.loads(record.get('Sns', {}).get('Message', '{}'))
            
            # Requirement 4.1: Parse AWS EUM Social event format
            context_data = sns_message.get('context', {})
            webhook_entry_str = sns_message.get('whatsAppWebhookEntry', '{}')
            aws_message_id = sns_message.get('messageId', str(uuid.uuid4()))
            
            # Requirement 4.2: Decode whatsAppWebhookEntry JSON string
            webhook_entry = json.loads(webhook_entry_str)
            
            # Process each change in the webhook entry
            for change in webhook_entry.get('changes', []):
                value = change.get('value', {})
                metadata = value.get('metadata', {})
                
                # Process incoming messages
                for message in value.get('messages', []):
                    try:
                        _process_message(message, metadata, request_id)
                        processed_count += 1
                    except Exception as e:
                        logger.error(json.dumps({
                            'event': 'message_processing_error',
                            'messageId': message.get('id'),
                            'error': str(e),
                            'requestId': request_id
                        }))
                        error_count += 1
                
                # Process status updates
                for status in value.get('statuses', []):
                    try:
                        _process_status(status, request_id)
                    except Exception as e:
                        logger.error(json.dumps({
                            'event': 'status_processing_error',
                            'statusId': status.get('id'),
                            'error': str(e),
                            'requestId': request_id
                        }))
                        
        except Exception as e:
            logger.error(json.dumps({
                'event': 'record_processing_error',
                'error': str(e),
                'requestId': request_id
            }))
            # Requirement 4.7: Send to inbound-dlq on failure
            _send_to_dlq(record, str(e), request_id)
            error_count += 1
    
    logger.info(json.dumps({
        'event': 'inbound_processing_complete',
        'processedCount': processed_count,
        'errorCount': error_count,
        'requestId': request_id
    }))
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'processed': processed_count,
            'errors': error_count
        })
    }


def _process_message(message: Dict, metadata: Dict, request_id: str) -> None:
    """
    Process a single inbound message.
    Requirements: 4.3, 4.4, 4.5, 4.6, 4.8, 4.9
    """
    whatsapp_message_id = message.get('id')
    sender_phone = message.get('from')
    msg_type = message.get('type', 'text')
    timestamp = int(message.get('timestamp', time.time()))
    
    # Requirement 4.8: Deduplicate using whatsappMessageId
    if _message_exists(whatsapp_message_id):
        logger.info(json.dumps({
            'event': 'message_duplicate_skipped',
            'whatsappMessageId': whatsapp_message_id,
            'requestId': request_id
        }))
        return
    
    # Lookup or create contact
    contact = _get_or_create_contact(sender_phone)
    contact_id = contact.get('contactId')
    
    # Extract message content based on type
    content = _extract_content(message, msg_type)
    
    # Generate message ID and calculate TTL
    message_id = str(uuid.uuid4())
    now = int(time.time())
    expires_at = now + MESSAGE_TTL_SECONDS
    
    # Handle media messages
    media_id = None
    s3_key = None
    if msg_type in ['image', 'video', 'audio', 'document']:
        media_data = message.get(msg_type, {})
        whatsapp_media_id = media_data.get('id')
        if whatsapp_media_id:
            # Requirements 4.4, 4.5, 4.6: Download and store media
            s3_key = _download_media(whatsapp_media_id, message_id, msg_type, request_id)
            if s3_key:
                media_id = _store_media_record(message_id, s3_key, media_data, whatsapp_media_id)
    
    # Requirement 4.3: Store message in DynamoDB with TTL (30 days)
    message_record = {
        'messageId': message_id,
        'contactId': contact_id,
        'channel': 'whatsapp',
        'direction': 'inbound',
        'content': content,
        'messageType': msg_type,
        'timestamp': Decimal(str(timestamp)),
        'status': 'received',
        'whatsappMessageId': whatsapp_message_id,
        'mediaId': media_id,
        's3Key': s3_key,
        'senderPhone': sender_phone,
        'createdAt': Decimal(str(now)),
        'expiresAt': Decimal(str(expires_at)),  # TTL attribute
    }
    
    messages_table = dynamodb.Table(MESSAGES_TABLE)
    messages_table.put_item(Item={k: v for k, v in message_record.items() if v is not None})
    
    # Requirement 4.9: Update Contact.lastInboundMessageAt for 24-hour window
    _update_contact_timestamp(contact_id, now)
    
    logger.info(json.dumps({
        'event': 'message_stored',
        'messageId': message_id,
        'contactId': contact_id,
        'whatsappMessageId': whatsapp_message_id,
        'type': msg_type,
        'hasMedia': bool(media_id),
        'requestId': request_id
    }))


def _extract_content(message: Dict, msg_type: str) -> str:
    """Extract message content based on type."""
    if msg_type == 'text':
        return message.get('text', {}).get('body', '')
    elif msg_type == 'image':
        return message.get('image', {}).get('caption', '[Image]')
    elif msg_type == 'video':
        return message.get('video', {}).get('caption', '[Video]')
    elif msg_type == 'audio':
        return '[Audio]'
    elif msg_type == 'document':
        doc = message.get('document', {})
        return doc.get('filename', '[Document]')
    elif msg_type == 'location':
        loc = message.get('location', {})
        return f"[Location: {loc.get('latitude')}, {loc.get('longitude')}]"
    elif msg_type == 'contacts':
        return '[Contact Card]'
    elif msg_type == 'sticker':
        return '[Sticker]'
    elif msg_type == 'reaction':
        return message.get('reaction', {}).get('emoji', '[Reaction]')
    else:
        return f'[{msg_type}]'


def _message_exists(whatsapp_message_id: str) -> bool:
    """Check if message already exists (deduplication)."""
    if not whatsapp_message_id:
        return False
    
    try:
        messages_table = dynamodb.Table(MESSAGES_TABLE)
        # Query by GSI on whatsappMessageId if available, or scan
        response = messages_table.scan(
            FilterExpression='whatsappMessageId = :wmid',
            ExpressionAttributeValues={':wmid': whatsapp_message_id},
            Limit=1
        )
        return len(response.get('Items', [])) > 0
    except Exception:
        return False


def _get_or_create_contact(phone: str) -> Dict[str, Any]:
    """Get existing contact or create new one."""
    contacts_table = dynamodb.Table(CONTACTS_TABLE)
    
    # Search for existing contact by phone
    response = contacts_table.scan(
        FilterExpression='phone = :phone AND (attribute_not_exists(deletedAt) OR deletedAt = :null)',
        ExpressionAttributeValues={':phone': phone, ':null': None},
        Limit=1
    )
    
    items = response.get('Items', [])
    if items:
        return items[0]
    
    # Create new contact
    contact_id = str(uuid.uuid4())
    now = int(time.time())
    
    contact = {
        'contactId': contact_id,
        'name': '',
        'phone': phone,
        'email': None,
        'optInWhatsApp': False,  # Default to False per Requirement 2.1
        'optInSms': False,
        'optInEmail': False,
        'lastInboundMessageAt': Decimal(str(now)),
        'createdAt': Decimal(str(now)),
        'updatedAt': Decimal(str(now)),
    }
    
    contacts_table.put_item(Item=contact)
    
    logger.info(json.dumps({
        'event': 'contact_auto_created',
        'contactId': contact_id,
        'phone': phone
    }))
    
    return contact


def _update_contact_timestamp(contact_id: str, timestamp: int) -> None:
    """Update contact's lastInboundMessageAt for 24-hour window tracking."""
    try:
        contacts_table = dynamodb.Table(CONTACTS_TABLE)
        contacts_table.update_item(
            Key={'contactId': contact_id},
            UpdateExpression='SET lastInboundMessageAt = :ts, updatedAt = :ts',
            ExpressionAttributeValues={
                ':ts': Decimal(str(timestamp))
            }
        )
    except Exception as e:
        logger.error(f"Failed to update contact timestamp: {str(e)}")


def _download_media(whatsapp_media_id: str, message_id: str, media_type: str, request_id: str) -> Optional[str]:
    """
    Download media file from WhatsApp using AWS EUM Social API.
    Requirements 4.4, 4.5: Call GetWhatsAppMessageMedia and store in S3
    """
    try:
        # Generate S3 key
        extension = _get_media_extension(media_type)
        s3_key = f"{MEDIA_PREFIX}{message_id}{extension}"
        
        # Requirement 4.5: Call GetWhatsAppMessageMedia with destinationS3File
        response = social_messaging.get_whats_app_message_media(
            mediaId=whatsapp_media_id,
            destinationS3File={
                's3BucketName': MEDIA_BUCKET,
                's3Key': s3_key
            }
        )
        
        logger.info(json.dumps({
            'event': 'media_downloaded',
            'mediaId': whatsapp_media_id,
            's3Key': s3_key,
            'requestId': request_id
        }))
        
        return s3_key
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'media_download_error',
            'mediaId': whatsapp_media_id,
            'error': str(e),
            'requestId': request_id
        }))
        return None


def _get_media_extension(media_type: str) -> str:
    """Get file extension based on media type."""
    extensions = {
        'image': '.jpg',
        'video': '.mp4',
        'audio': '.ogg',
        'document': '.pdf',
        'sticker': '.webp'
    }
    return extensions.get(media_type, '')


def _store_media_record(message_id: str, s3_key: str, media_data: Dict, whatsapp_media_id: str) -> str:
    """Store media file record in MediaFiles table."""
    file_id = str(uuid.uuid4())
    now = int(time.time())
    
    media_record = {
        'fileId': file_id,
        'messageId': message_id,
        's3Key': s3_key,
        'contentType': media_data.get('mime_type', ''),
        'size': Decimal(str(media_data.get('file_size', 0))) if media_data.get('file_size') else None,
        'whatsappMediaId': whatsapp_media_id,
        'uploadedAt': Decimal(str(now)),
    }
    
    media_table = dynamodb.Table(MEDIA_FILES_TABLE)
    media_table.put_item(Item={k: v for k, v in media_record.items() if v is not None})
    
    return file_id


def _process_status(status: Dict, request_id: str) -> None:
    """
    Process message status update.
    Requirement 5.12: Track message status updates (sent|delivered|read|failed)
    """
    whatsapp_message_id = status.get('id')
    status_value = status.get('status')  # sent, delivered, read, failed
    timestamp = int(status.get('timestamp', time.time()))
    
    if not whatsapp_message_id or not status_value:
        return
    
    try:
        # Find message by whatsappMessageId and update status
        messages_table = dynamodb.Table(MESSAGES_TABLE)
        
        # Scan for the message (in production, use GSI)
        response = messages_table.scan(
            FilterExpression='whatsappMessageId = :wmid',
            ExpressionAttributeValues={':wmid': whatsapp_message_id},
            Limit=1
        )
        
        items = response.get('Items', [])
        if items:
            message_id = items[0].get('messageId')
            messages_table.update_item(
                Key={'messageId': message_id},
                UpdateExpression='SET #status = :status, statusUpdatedAt = :ts',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':status': status_value,
                    ':ts': Decimal(str(timestamp))
                }
            )
            
            logger.info(json.dumps({
                'event': 'status_updated',
                'messageId': message_id,
                'whatsappMessageId': whatsapp_message_id,
                'status': status_value,
                'requestId': request_id
            }))
            
    except Exception as e:
        logger.error(json.dumps({
            'event': 'status_update_error',
            'whatsappMessageId': whatsapp_message_id,
            'error': str(e),
            'requestId': request_id
        }))


def _send_to_dlq(record: Dict, error: str, request_id: str) -> None:
    """
    Send failed message to inbound-dlq.
    Requirement 4.7: Send to DLQ on processing failure
    """
    if not INBOUND_DLQ_URL:
        logger.warning("INBOUND_DLQ_URL not configured, cannot send to DLQ")
        return
    
    try:
        dlq_message = {
            'originalRecord': record,
            'error': error,
            'timestamp': int(time.time()),
            'requestId': request_id
        }
        
        sqs.send_message(
            QueueUrl=INBOUND_DLQ_URL,
            MessageBody=json.dumps(dlq_message, default=str)
        )
        
        logger.info(json.dumps({
            'event': 'sent_to_dlq',
            'queueUrl': INBOUND_DLQ_URL,
            'requestId': request_id
        }))
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'dlq_send_error',
            'error': str(e),
            'requestId': request_id
        }))
