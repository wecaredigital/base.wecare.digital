"""
Inbound WhatsApp Handler Lambda Function

Purpose: Process SNS notifications for WhatsApp messages
Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.12, 15.4, 15.7

Parses AWS EUM Social event format, stores messages, downloads media,
updates contact timestamps for 24-hour customer service window.
Integrates with AI automation when enabled in SystemConfig.
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
lambda_client = boto3.client('lambda', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
# Use actual deployed DynamoDB table names
CONTACTS_TABLE = os.environ.get('CONTACTS_TABLE', 'base-wecare-digital-ContactsTable')
MESSAGES_TABLE = os.environ.get('MESSAGES_TABLE', 'base-wecare-digital-WhatsAppInboundTable')
MEDIA_FILES_TABLE = os.environ.get('MEDIA_FILES_TABLE', 'MediaFiles')
SYSTEM_CONFIG_TABLE = os.environ.get('SYSTEM_CONFIG_TABLE', 'SystemConfig')
AI_INTERACTIONS_TABLE = os.environ.get('AI_INTERACTIONS_TABLE', 'AIInteractions')
INBOUND_DLQ_URL = os.environ.get('INBOUND_DLQ_URL', '')
MEDIA_BUCKET = os.environ.get('MEDIA_BUCKET', 'auth.wecare.digital')
MEDIA_PREFIX = os.environ.get('MEDIA_INBOUND_PREFIX', 'whatsapp-media/whatsapp-media-incoming/')
SEND_MODE = os.environ.get('SEND_MODE', 'LIVE')

# AI Lambda function names
AI_QUERY_KB_FUNCTION = os.environ.get('AI_QUERY_KB_FUNCTION', 'ai-query-kb')
AI_GENERATE_RESPONSE_FUNCTION = os.environ.get('AI_GENERATE_RESPONSE_FUNCTION', 'ai-generate-response')

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
    # Note: Table uses 'id' as primary key
    message_record = {
        'id': message_id,  # Primary key - table uses 'id' not 'messageId'
        'messageId': message_id,  # Keep for backwards compatibility
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
    
    # Auto-react with thumbs up to every inbound message (skip reactions to avoid loops)
    if msg_type != 'reaction':
        _send_auto_reaction(
            contact_id=contact_id,
            whatsapp_message_id=whatsapp_message_id,
            request_id=request_id
        )
    
    # Requirements 15.4, 15.7: Process AI automation if enabled
    # Only process text messages for AI (skip media-only messages)
    if msg_type == 'text' and content:
        _process_ai_automation(
            message_id=message_id,
            contact_id=contact_id,
            content=content,
            request_id=request_id
        )


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
    
    # Note: Table uses 'id' as primary key
    # All opt-ins enabled by default for production
    contact = {
        'id': contact_id,  # Primary key - table uses 'id' not 'contactId'
        'contactId': contact_id,  # Keep for backwards compatibility
        'name': '',
        'phone': phone,
        'email': None,
        'optInWhatsApp': True,  # Default enabled
        'optInSms': True,  # Default enabled
        'optInEmail': True,  # Default enabled
        'allowlistWhatsApp': True,  # Default enabled
        'allowlistSms': True,  # Default enabled
        'allowlistEmail': True,  # Default enabled
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
        # Note: Table uses 'id' as primary key
        contacts_table.update_item(
            Key={'id': contact_id},
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
        response = social_messaging.get_whatsapp_message_media(
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
            message_id = items[0].get('id') or items[0].get('messageId')
            # Note: Table uses 'id' as primary key
            messages_table.update_item(
                Key={'id': message_id},
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


# ============================================================================
# AUTO-REACTION FEATURE
# Send thumbs up reaction to every inbound message
# ============================================================================

# Outbound WhatsApp Lambda function name
OUTBOUND_WHATSAPP_FUNCTION = os.environ.get('OUTBOUND_WHATSAPP_FUNCTION', 'wecare-outbound-whatsapp')

# Default phone number ID for reactions
DEFAULT_PHONE_NUMBER_ID = os.environ.get('WHATSAPP_PHONE_NUMBER_ID_1', 'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54')


def _send_auto_reaction(contact_id: str, whatsapp_message_id: str, request_id: str) -> None:
    """
    Send automatic thumbs up reaction to inbound message.
    Calls outbound-whatsapp Lambda with reaction parameters.
    """
    if not whatsapp_message_id:
        logger.warning(json.dumps({
            'event': 'auto_reaction_skipped',
            'reason': 'no_whatsapp_message_id',
            'contactId': contact_id,
            'requestId': request_id
        }))
        return
    
    try:
        # Build reaction request payload
        reaction_payload = {
            'body': json.dumps({
                'contactId': contact_id,
                'isReaction': True,
                'reactionMessageId': whatsapp_message_id,
                'reactionEmoji': '\U0001F44D',  # Thumbs up emoji
                'phoneNumberId': DEFAULT_PHONE_NUMBER_ID
            })
        }
        
        # Invoke outbound-whatsapp Lambda asynchronously
        response = lambda_client.invoke(
            FunctionName=OUTBOUND_WHATSAPP_FUNCTION,
            InvocationType='Event',  # Async invocation
            Payload=json.dumps(reaction_payload)
        )
        
        logger.info(json.dumps({
            'event': 'auto_reaction_triggered',
            'contactId': contact_id,
            'whatsappMessageId': whatsapp_message_id,
            'statusCode': response.get('StatusCode'),
            'requestId': request_id
        }))
        
    except Exception as e:
        # Log error but don't fail the message processing
        logger.error(json.dumps({
            'event': 'auto_reaction_error',
            'contactId': contact_id,
            'whatsappMessageId': whatsapp_message_id,
            'error': str(e),
            'requestId': request_id
        }))


# ============================================================================
# AI AUTOMATION INTEGRATION
# Requirements: 15.4, 15.7
# ============================================================================

def _is_ai_enabled() -> bool:
    """
    Check if AI automation is enabled in SystemConfig.
    Requirement 15.4: Check if AI automation is enabled
    """
    try:
        config_table = dynamodb.Table(SYSTEM_CONFIG_TABLE)
        response = config_table.get_item(Key={'configKey': 'ai_automation_enabled'})
        item = response.get('Item', {})
        return item.get('configValue', 'false').lower() == 'true'
    except Exception as e:
        logger.warning(f"Failed to check AI config, defaulting to disabled: {str(e)}")
        return False


def _process_ai_automation(
    message_id: str,
    contact_id: str,
    content: str,
    request_id: str
) -> Optional[Dict[str, Any]]:
    """
    Process AI automation for inbound message.
    
    Requirements:
    - 15.4: If AI enabled, call ai-query-kb and ai-generate-response
    - 15.7: Respect SEND_MODE - DRY_RUN prevents sending AI responses
    
    Returns AI suggestion if generated, None otherwise.
    """
    # Requirement 15.4: Check if AI automation is enabled
    if not _is_ai_enabled():
        logger.info(json.dumps({
            'event': 'ai_automation_disabled',
            'messageId': message_id,
            'requestId': request_id
        }))
        return None
    
    logger.info(json.dumps({
        'event': 'ai_automation_start',
        'messageId': message_id,
        'contactId': contact_id,
        'requestId': request_id
    }))
    
    try:
        # Step 1: Query Knowledge Base
        kb_result = _invoke_ai_query_kb(content, message_id, request_id)
        
        # Step 2: Generate response suggestion
        ai_response = _invoke_ai_generate_response(
            content=content,
            kb_context=kb_result,
            message_id=message_id,
            contact_id=contact_id,
            request_id=request_id
        )
        
        # Requirement 15.7: Log but don't send if DRY_RUN
        if SEND_MODE == 'DRY_RUN':
            logger.info(json.dumps({
                'event': 'ai_response_dry_run',
                'messageId': message_id,
                'suggestion': ai_response.get('suggestion', '')[:100] if ai_response else None,
                'requestId': request_id
            }))
        
        return ai_response
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'ai_automation_error',
            'messageId': message_id,
            'error': str(e),
            'requestId': request_id
        }))
        return None


def _invoke_ai_query_kb(query: str, message_id: str, request_id: str) -> Optional[Dict]:
    """
    Invoke ai-query-kb Lambda function.
    Requirement 15.1: Query Bedrock KB for relevant knowledge
    """
    try:
        payload = {
            'query': query,
            'messageId': message_id,
            'requestId': request_id
        }
        
        response = lambda_client.invoke(
            FunctionName=AI_QUERY_KB_FUNCTION,
            InvocationType='RequestResponse',
            Payload=json.dumps(payload)
        )
        
        response_payload = json.loads(response['Payload'].read().decode('utf-8'))
        
        if response.get('StatusCode') == 200:
            body = json.loads(response_payload.get('body', '{}'))
            logger.info(json.dumps({
                'event': 'ai_kb_query_success',
                'messageId': message_id,
                'resultsCount': len(body.get('results', [])),
                'requestId': request_id
            }))
            return body
        else:
            logger.warning(json.dumps({
                'event': 'ai_kb_query_failed',
                'messageId': message_id,
                'statusCode': response.get('StatusCode'),
                'requestId': request_id
            }))
            return None
            
    except Exception as e:
        logger.error(json.dumps({
            'event': 'ai_kb_invoke_error',
            'messageId': message_id,
            'error': str(e),
            'requestId': request_id
        }))
        return None


def _invoke_ai_generate_response(
    content: str,
    kb_context: Optional[Dict],
    message_id: str,
    contact_id: str,
    request_id: str
) -> Optional[Dict]:
    """
    Invoke ai-generate-response Lambda function.
    Requirements 15.2, 15.3: Generate response suggestion (never auto-send)
    """
    try:
        payload = {
            'messageContent': content,
            'kbContext': kb_context,
            'messageId': message_id,
            'contactId': contact_id,
            'requestId': request_id
        }
        
        response = lambda_client.invoke(
            FunctionName=AI_GENERATE_RESPONSE_FUNCTION,
            InvocationType='RequestResponse',
            Payload=json.dumps(payload)
        )
        
        response_payload = json.loads(response['Payload'].read().decode('utf-8'))
        
        if response.get('StatusCode') == 200:
            body = json.loads(response_payload.get('body', '{}'))
            
            # Store AI interaction record
            _store_ai_interaction(
                message_id=message_id,
                query=content,
                response=body.get('suggestion', ''),
                request_id=request_id
            )
            
            logger.info(json.dumps({
                'event': 'ai_response_generated',
                'messageId': message_id,
                'interactionId': body.get('interactionId'),
                'requestId': request_id
            }))
            return body
        else:
            logger.warning(json.dumps({
                'event': 'ai_response_failed',
                'messageId': message_id,
                'statusCode': response.get('StatusCode'),
                'requestId': request_id
            }))
            return None
            
    except Exception as e:
        logger.error(json.dumps({
            'event': 'ai_generate_invoke_error',
            'messageId': message_id,
            'error': str(e),
            'requestId': request_id
        }))
        return None


def _store_ai_interaction(
    message_id: str,
    query: str,
    response: str,
    request_id: str
) -> None:
    """
    Store AI interaction record.
    Requirement 15.5: Store AI interaction logs
    """
    try:
        interaction_id = str(uuid.uuid4())
        now = int(time.time())
        
        interaction_record = {
            'interactionId': interaction_id,
            'messageId': message_id,
            'query': query,
            'response': response,
            'approved': False,  # Requirement 15.3: Never auto-approve
            'feedback': None,
            'timestamp': Decimal(str(now)),
        }
        
        ai_table = dynamodb.Table(AI_INTERACTIONS_TABLE)
        ai_table.put_item(Item=interaction_record)
        
        logger.info(json.dumps({
            'event': 'ai_interaction_stored',
            'interactionId': interaction_id,
            'messageId': message_id,
            'requestId': request_id
        }))
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'ai_interaction_store_error',
            'messageId': message_id,
            'error': str(e),
            'requestId': request_id
        }))
