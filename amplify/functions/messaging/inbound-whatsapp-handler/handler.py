"""
Inbound WhatsApp Handler Lambda Function

Purpose: Process SNS notifications for WhatsApp messages
Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.12, 15.4, 15.7

Parses AWS EUM Social event format, stores messages, downloads media,
updates contact timestamps for 24-hour customer service window.
Tracks which WABA/phone number received the message.
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

# Environment variables - use actual table names
CONTACTS_TABLE = os.environ.get('CONTACTS_TABLE', 'base-wecare-digital-ContactsTable')
MESSAGES_TABLE = os.environ.get('MESSAGES_TABLE', 'base-wecare-digital-WhatsAppInboundTable')
MEDIA_FILES_TABLE = os.environ.get('MEDIA_FILES_TABLE', 'base-wecare-digital-MediaFilesTable')
SYSTEM_CONFIG_TABLE = os.environ.get('SYSTEM_CONFIG_TABLE', 'base-wecare-digital-SystemConfigTable')
AI_INTERACTIONS_TABLE = os.environ.get('AI_INTERACTIONS_TABLE', 'base-wecare-digital-AIInteractionsTable')
INBOUND_DLQ_URL = os.environ.get('INBOUND_DLQ_URL', '')
MEDIA_BUCKET = os.environ.get('MEDIA_BUCKET', 'auth.wecare.digital')
MEDIA_PREFIX = os.environ.get('MEDIA_INBOUND_PREFIX', 'whatsapp-media/whatsapp-media-incoming/')
SEND_MODE = os.environ.get('SEND_MODE', 'LIVE')

# AI Lambda function names
AI_QUERY_KB_FUNCTION = os.environ.get('AI_QUERY_KB_FUNCTION', 'wecare-ai-query-kb')
AI_GENERATE_RESPONSE_FUNCTION = os.environ.get('AI_GENERATE_RESPONSE_FUNCTION', 'wecare-ai-generate-response')

# Outbound WhatsApp Lambda function name
OUTBOUND_WHATSAPP_FUNCTION = os.environ.get('OUTBOUND_WHATSAPP_FUNCTION', 'wecare-outbound-whatsapp')

# WhatsApp Phone Number IDs - Map Meta phone number IDs to AWS phone number IDs
# Format: Meta phone number ID -> AWS EUM phone-number-id
PHONE_NUMBER_ID_1 = os.environ.get('WHATSAPP_PHONE_NUMBER_ID_1', 'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54')
PHONE_NUMBER_ID_2 = os.environ.get('WHATSAPP_PHONE_NUMBER_ID_2', 'phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06')

# Map display phone numbers to AWS phone number IDs for reference
PHONE_NUMBER_MAP = {
    '919330994400': PHONE_NUMBER_ID_1,  # +91 93309 94400
    '919903300044': PHONE_NUMBER_ID_2,  # +91 99033 00044
}

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
            
            # Extract WABA context - which WABA received this message
            context_data = sns_message.get('context', {})
            meta_waba_ids = context_data.get('MetaWabaIds', [])
            meta_phone_number_ids = context_data.get('MetaPhoneNumberIds', [])
            
            webhook_entry_str = sns_message.get('whatsAppWebhookEntry', '{}')
            aws_message_id = sns_message.get('messageId', str(uuid.uuid4()))
            
            # Decode whatsAppWebhookEntry JSON string
            webhook_entry = json.loads(webhook_entry_str)
            
            # Process each change in the webhook entry
            for change in webhook_entry.get('changes', []):
                value = change.get('value', {})
                metadata = value.get('metadata', {})
                
                # Extract receiving phone number info from metadata
                display_phone_number = metadata.get('display_phone_number', '')
                phone_number_id = metadata.get('phone_number_id', '')
                
                # Determine AWS phone number ID for this WABA
                aws_phone_number_id = _get_aws_phone_number_id(display_phone_number, phone_number_id)
                
                # Extract contacts info (contains profile names)
                # WhatsApp webhook format: contacts array has wa_id and profile.name
                contacts_info = value.get('contacts', [])
                contacts_map = {}
                for contact_info in contacts_info:
                    wa_id = contact_info.get('wa_id', '')
                    profile_name = contact_info.get('profile', {}).get('name', '')
                    if wa_id:
                        contacts_map[wa_id] = profile_name
                
                # Process incoming messages
                for message in value.get('messages', []):
                    try:
                        # Get sender's profile name from contacts array
                        sender_phone = message.get('from', '')
                        sender_profile_name = contacts_map.get(sender_phone, '')
                        
                        _process_message(
                            message=message,
                            metadata=metadata,
                            request_id=request_id,
                            receiving_phone=display_phone_number,
                            aws_phone_number_id=aws_phone_number_id,
                            meta_waba_ids=meta_waba_ids,
                            sender_profile_name=sender_profile_name
                        )
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


def _get_aws_phone_number_id(display_phone: str, meta_phone_id: str) -> str:
    """
    Map display phone number or Meta phone ID to AWS EUM phone number ID.
    Returns the appropriate AWS phone number ID for sending reactions.
    """
    # Clean display phone number (remove + and spaces)
    clean_phone = display_phone.replace('+', '').replace(' ', '').replace('-', '')
    
    # Check if we have a mapping for this phone number
    if clean_phone in PHONE_NUMBER_MAP:
        return PHONE_NUMBER_MAP[clean_phone]
    
    # Default to first phone number ID if no mapping found
    logger.warning(json.dumps({
        'event': 'phone_number_mapping_not_found',
        'displayPhone': display_phone,
        'metaPhoneId': meta_phone_id,
        'usingDefault': PHONE_NUMBER_ID_1
    }))
    return PHONE_NUMBER_ID_1


def _process_message(
    message: Dict,
    metadata: Dict,
    request_id: str,
    receiving_phone: str,
    aws_phone_number_id: str,
    meta_waba_ids: list,
    sender_profile_name: str = ''
) -> None:
    """
    Process a single inbound message.
    Stores which WABA/phone number received the message.
    """
    whatsapp_message_id = message.get('id')
    sender_phone = message.get('from')
    msg_type = message.get('type', 'text')
    timestamp = int(message.get('timestamp', time.time()))
    
    # Use sender profile name from contacts array (passed in)
    # Fall back to checking message.profile if not provided
    sender_name = sender_profile_name
    if not sender_name and 'profile' in message:
        sender_name = message.get('profile', {}).get('name', '')
    
    # Deduplicate using whatsappMessageId
    if _message_exists(whatsapp_message_id):
        logger.info(json.dumps({
            'event': 'message_duplicate_skipped',
            'whatsappMessageId': whatsapp_message_id,
            'requestId': request_id
        }))
        return
    
    # Lookup or create contact with sender name
    contact = _get_or_create_contact(sender_phone, sender_name)
    contact_id = contact.get('contactId') or contact.get('id')
    
    # Extract message content based on type
    content = _extract_content(message, msg_type)
    
    # Generate message ID and calculate TTL
    message_id = str(uuid.uuid4())
    now = int(time.time())
    expires_at = now + MESSAGE_TTL_SECONDS
    
    # Handle media messages (including stickers)
    media_id = None
    s3_key = None
    if msg_type in ['image', 'video', 'audio', 'document', 'sticker']:
        media_data = message.get(msg_type, {})
        whatsapp_media_id = media_data.get('id')
        if whatsapp_media_id:
            s3_key = _download_media(whatsapp_media_id, message_id, msg_type, aws_phone_number_id, request_id)
            if s3_key:
                media_id = _store_media_record(message_id, s3_key, media_data, whatsapp_media_id)
    
    # Store message in DynamoDB with WABA info and sender name
    message_record = {
        'id': message_id,
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
        'senderName': sender_name,  # Sender's WhatsApp profile name
        # WABA tracking - which number received this message
        'receivingPhone': receiving_phone,
        'awsPhoneNumberId': aws_phone_number_id,
        'metaWabaIds': meta_waba_ids if meta_waba_ids else None,
        'createdAt': Decimal(str(now)),
        'expiresAt': Decimal(str(expires_at)),
    }
    
    messages_table = dynamodb.Table(MESSAGES_TABLE)
    messages_table.put_item(Item={k: v for k, v in message_record.items() if v is not None})
    
    # Update Contact.lastInboundMessageAt for 24-hour window
    _update_contact_timestamp(contact_id, now)
    
    logger.info(json.dumps({
        'event': 'message_stored',
        'messageId': message_id,
        'contactId': contact_id,
        'senderPhone': sender_phone,
        'senderName': sender_name,
        'whatsappMessageId': whatsapp_message_id,
        'type': msg_type,
        'hasMedia': bool(media_id),
        'receivingPhone': receiving_phone,
        'awsPhoneNumberId': aws_phone_number_id,
        'requestId': request_id
    }))
    
    # Auto-react with thumbs up (skip reactions to avoid loops)
    # Use the same phone number that received the message
    if msg_type != 'reaction':
        _send_auto_reaction(
            contact_id=contact_id,
            whatsapp_message_id=whatsapp_message_id,
            phone_number_id=aws_phone_number_id,
            request_id=request_id
        )
        
        # Send read receipt to show message was received
        _send_read_receipt(
            whatsapp_message_id=whatsapp_message_id,
            phone_number_id=aws_phone_number_id,
            request_id=request_id
        )
    
    # Process AI automation if enabled (text messages only)
    if msg_type == 'text' and content:
        _process_ai_automation(
            message_id=message_id,
            contact_id=contact_id,
            content=content,
            phone_number_id=aws_phone_number_id,
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
    elif msg_type == 'interactive':
        # Interactive messages (buttons, lists, etc.)
        interactive = message.get('interactive', {})
        interactive_type = interactive.get('type', '')
        if interactive_type == 'button_reply':
            return interactive.get('button_reply', {}).get('title', '[Button Reply]')
        elif interactive_type == 'list_reply':
            return interactive.get('list_reply', {}).get('title', '[List Reply]')
        return f'[Interactive: {interactive_type}]'
    elif msg_type == 'button':
        # Quick reply button
        return message.get('button', {}).get('text', '[Button]')
    elif msg_type == 'order':
        return '[Order]'
    elif msg_type == 'system':
        # System messages (group changes, etc.)
        return '[System Message]'
    elif msg_type == 'unsupported':
        # WhatsApp marks some messages as unsupported
        return '[Unsupported Message Type]'
    else:
        return f'[{msg_type}]'


def _message_exists(whatsapp_message_id: str) -> bool:
    """Check if message already exists (deduplication)."""
    if not whatsapp_message_id:
        return False
    try:
        messages_table = dynamodb.Table(MESSAGES_TABLE)
        response = messages_table.scan(
            FilterExpression='whatsappMessageId = :wmid',
            ExpressionAttributeValues={':wmid': whatsapp_message_id},
            Limit=1
        )
        return len(response.get('Items', [])) > 0
    except Exception:
        return False


def _get_or_create_contact(phone: str, sender_name: str = '') -> Dict[str, Any]:
    """Get existing contact or create new one."""
    contacts_table = dynamodb.Table(CONTACTS_TABLE)
    
    # Clean phone for search - remove + prefix if present
    clean_phone = phone.lstrip('+')
    phone_with_plus = f'+{clean_phone}'
    
    # Search for contact with either format (with or without +)
    # Use a more robust scan - scan more items to ensure we find existing contact
    response = contacts_table.scan(
        FilterExpression='(phone = :phone1 OR phone = :phone2) AND (attribute_not_exists(deletedAt) OR deletedAt = :null)',
        ExpressionAttributeValues={
            ':phone1': clean_phone,
            ':phone2': phone_with_plus,
            ':null': None
        },
        Limit=100  # Scan up to 100 items to find matching phone
    )
    
    items = response.get('Items', [])
    if items:
        # Return the first (oldest) contact to avoid duplicates
        contact = sorted(items, key=lambda x: x.get('createdAt', 0))[0]
        # Update name if sender provided a name and contact doesn't have one or has placeholder
        current_name = contact.get('name', '')
        if sender_name and (not current_name or current_name in ['', '~', 'Unknown']):
            try:
                contacts_table.update_item(
                    Key={'id': contact.get('id')},
                    UpdateExpression='SET #name = :name, updatedAt = :now',
                    ExpressionAttributeNames={'#name': 'name'},
                    ExpressionAttributeValues={':name': sender_name, ':now': Decimal(str(int(time.time())))}
                )
                contact['name'] = sender_name
            except Exception as e:
                logger.warning(f"Failed to update contact name: {str(e)}")
        return contact
    
    # Create new contact
    contact_id = str(uuid.uuid4())
    now = int(time.time())
    
    # Ensure phone has + prefix for international format (easier for SMS)
    formatted_phone = phone if phone.startswith('+') else f'+{phone}'
    
    contact = {
        'id': contact_id,
        'contactId': contact_id,
        'name': sender_name or '',
        'phone': formatted_phone,
        'email': None,
        'optInWhatsApp': True,
        'optInSms': True,
        'optInEmail': True,
        'allowlistWhatsApp': True,
        'allowlistSms': True,
        'allowlistEmail': True,
        'lastInboundMessageAt': Decimal(str(now)),
        'createdAt': Decimal(str(now)),
        'updatedAt': Decimal(str(now)),
    }
    
    contacts_table.put_item(Item=contact)
    
    logger.info(json.dumps({
        'event': 'contact_auto_created',
        'contactId': contact_id,
        'phone': phone,
        'name': sender_name
    }))
    
    return contact


def _update_contact_timestamp(contact_id: str, timestamp: int) -> None:
    """Update contact's lastInboundMessageAt for 24-hour window tracking."""
    try:
        contacts_table = dynamodb.Table(CONTACTS_TABLE)
        contacts_table.update_item(
            Key={'id': contact_id},
            UpdateExpression='SET lastInboundMessageAt = :ts, updatedAt = :ts',
            ExpressionAttributeValues={':ts': Decimal(str(timestamp))}
        )
    except Exception as e:
        logger.error(f"Failed to update contact timestamp: {str(e)}")


def _download_media(whatsapp_media_id: str, message_id: str, media_type: str, 
                    phone_number_id: str, request_id: str) -> Optional[str]:
    """
    Download media file from WhatsApp using AWS EUM Social API.
    Per AWS docs: get_whatsapp_message_media downloads to S3 and returns mimeType + fileSize.
    Uses short filename format: wecare-digital-{8chars}.ext
    """
    try:
        # Build S3 key with short format: wecare-digital-{8chars}.ext
        short_id = message_id[:8]
        extension = _get_extension_from_type(media_type)
        s3_key = f"{MEDIA_PREFIX}wecare-digital-{short_id}{extension}"
        
        logger.info(json.dumps({
            'event': 'media_download_start',
            'mediaId': whatsapp_media_id,
            'requestedS3Key': s3_key,
            'phoneNumberId': phone_number_id,
            'requestId': request_id
        }))
        
        # Call AWS Social Messaging API to download media to S3
        response = social_messaging.get_whatsapp_message_media(
            mediaId=whatsapp_media_id,
            originationPhoneNumberId=phone_number_id,
            destinationS3File={
                'bucketName': MEDIA_BUCKET,
                'key': s3_key
            }
        )
        
        # Response contains mimeType and fileSize
        mime_type = response.get('mimeType', '')
        file_size = response.get('fileSize', 0)
        
        logger.info(json.dumps({
            'event': 'media_download_response',
            'mediaId': whatsapp_media_id,
            'mimeType': mime_type,
            'fileSize': file_size,
            'requestId': request_id
        }))
        
        # AWS EUM Social API appends WhatsApp media ID to the S3 key
        # Find the actual file that was created
        actual_s3_key = s3_key
        s3_key_prefix = f"{MEDIA_PREFIX}wecare-digital-{short_id}"
        try:
            s3_response = s3.list_objects_v2(
                Bucket=MEDIA_BUCKET,
                Prefix=s3_key_prefix,
                MaxKeys=5
            )
            if s3_response.get('Contents'):
                actual_s3_key = s3_response['Contents'][0]['Key']
                logger.info(json.dumps({
                    'event': 'media_s3_key_found',
                    'requestedPrefix': s3_key_prefix,
                    'actualS3Key': actual_s3_key,
                    'requestId': request_id
                }))
        except Exception as list_err:
            logger.warning(json.dumps({
                'event': 'media_s3_list_failed',
                'prefix': s3_key_prefix,
                'error': str(list_err),
                'usingFallback': s3_key,
                'requestId': request_id
            }))
        
        logger.info(json.dumps({
            'event': 'media_downloaded',
            'mediaId': whatsapp_media_id,
            'requestedS3Key': s3_key,
            'actualS3Key': actual_s3_key,
            'mimeType': mime_type,
            'fileSize': file_size,
            'phoneNumberId': phone_number_id,
            'requestId': request_id
        }))
        
        return actual_s3_key
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'media_download_error',
            'mediaId': whatsapp_media_id,
            'error': str(e),
            'requestId': request_id
        }))
        return None


def _get_extension_from_type(media_type: str) -> str:
    """Get file extension based on WhatsApp message type (image, video, audio, document, sticker)."""
    type_extensions = {
        'image': '.jpeg',
        'video': '.mp4',
        'audio': '.ogg',
        'document': '.pdf',
        'sticker': '.webp'
    }
    return type_extensions.get(media_type, '.bin')


def _get_extension_from_mime(mime_type: str) -> str:
    """Get file extension based on MIME type per AWS Social Messaging supported formats."""
    mime_extensions = {
        # Image formats (max 5MB)
        'image/jpeg': '.jpeg',
        'image/png': '.png',
        'image/webp': '.webp',
        
        # Video formats (max 16MB)
        'video/mp4': '.mp4',
        'video/3gpp': '.3gp',
        'video/3gp': '.3gp',
        
        # Audio formats (max 16MB)
        'audio/aac': '.aac',
        'audio/amr': '.amr',
        'audio/mpeg': '.mp3',
        'audio/mp4': '.m4a',
        'audio/ogg': '.ogg',
        
        # Document formats (max 100MB)
        'application/pdf': '.pdf',
        'text/plain': '.txt',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'application/vnd.ms-powerpoint': '.ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    }
    return mime_extensions.get(mime_type, '.bin')


def _store_media_record(message_id: str, s3_key: str, media_data: Dict, whatsapp_media_id: str) -> Optional[str]:
    """
    Store media file record in MediaFiles table.
    Returns file_id if successful, None if table doesn't exist or write fails.
    This is optional - the s3Key is stored directly in the message record.
    """
    try:
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
        
        logger.info(json.dumps({
            'event': 'media_record_stored',
            'fileId': file_id,
            'messageId': message_id,
            's3Key': s3_key
        }))
        
        return file_id
    except Exception as e:
        # MediaFile table may not exist - this is OK, s3Key is stored in message record
        logger.warning(json.dumps({
            'event': 'media_record_store_skipped',
            'messageId': message_id,
            's3Key': s3_key,
            'error': str(e),
            'note': 'MediaFile table write failed, but s3Key is stored in message record'
        }))
        return None


def _process_status(status: Dict, request_id: str) -> None:
    """
    Process message status update (sent|delivered|read|failed|payment).
    Per AWS docs: Can also send status updates back to WhatsApp to mark as read.
    
    Payment status webhooks have type='payment' with payment object containing:
    - reference_id: Order/invoice reference
    - amount: {value, offset}
    - currency: INR
    - status: pending|captured|failed
    """
    whatsapp_message_id = status.get('id')
    status_value = status.get('status')
    status_type = status.get('type', '')  # 'payment' for payment webhooks
    timestamp = int(status.get('timestamp', time.time()))
    recipient_id = status.get('recipient_id', '')
    
    if not whatsapp_message_id or not status_value:
        return
    
    # Handle payment status webhooks
    if status_type == 'payment':
        _process_payment_status(status, request_id)
        return
    
    try:
        messages_table = dynamodb.Table(MESSAGES_TABLE)
        
        response = messages_table.scan(
            FilterExpression='whatsappMessageId = :wmid',
            ExpressionAttributeValues={':wmid': whatsapp_message_id},
            Limit=1
        )
        
        items = response.get('Items', [])
        if items:
            message_id = items[0].get('id') or items[0].get('messageId')
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


def _process_payment_status(status: Dict, request_id: str) -> None:
    """
    Process payment status webhook from WhatsApp.
    
    Payment webhook format:
    {
        "id": "wamid.xxx",
        "recipient_id": "919876543210",
        "type": "payment",
        "status": "captured",  // pending, captured, failed
        "payment": {
            "reference_id": "ORDER_12345",
            "amount": {"value": 10000, "offset": 100},
            "currency": "INR",
            "transaction": {
                "id": "txn_xxx",
                "type": "upi",
                "status": "success"
            }
        },
        "timestamp": "1706140800"
    }
    """
    payment_data = status.get('payment', {})
    reference_id = payment_data.get('reference_id', '')
    payment_status = status.get('status', '')
    recipient_id = status.get('recipient_id', '')
    timestamp = int(status.get('timestamp', time.time()))
    
    amount = payment_data.get('amount', {})
    amount_value = amount.get('value', 0)
    amount_offset = amount.get('offset', 100)
    currency = payment_data.get('currency', 'INR')
    
    # Calculate actual amount (value / offset)
    actual_amount = amount_value / amount_offset if amount_offset else amount_value
    
    transaction = payment_data.get('transaction', {})
    transaction_id = transaction.get('id', '')
    transaction_type = transaction.get('type', '')
    
    logger.info(json.dumps({
        'event': 'payment_status_received',
        'referenceId': reference_id,
        'paymentStatus': payment_status,
        'recipientId': recipient_id,
        'amount': actual_amount,
        'currency': currency,
        'transactionId': transaction_id,
        'transactionType': transaction_type,
        'requestId': request_id
    }))
    
    # Store payment record in DynamoDB
    _store_payment_record(
        reference_id=reference_id,
        recipient_id=recipient_id,
        payment_status=payment_status,
        amount_value=amount_value,
        amount_offset=amount_offset,
        currency=currency,
        transaction_id=transaction_id,
        transaction_type=transaction_type,
        timestamp=timestamp,
        request_id=request_id
    )
    
    # Send order_status message based on payment status
    if payment_status == 'captured':
        _send_order_status_message(
            recipient_id=recipient_id,
            reference_id=reference_id,
            order_status='completed',
            description=f'Payment of ₹{actual_amount:.2f} received. Thank you!',
            request_id=request_id
        )
    elif payment_status == 'failed':
        _send_order_status_message(
            recipient_id=recipient_id,
            reference_id=reference_id,
            order_status='canceled',
            description='Payment failed. Please try again or contact support.',
            request_id=request_id
        )


def _store_payment_record(reference_id: str, recipient_id: str, payment_status: str,
                          amount_value: int, amount_offset: int, currency: str,
                          transaction_id: str, transaction_type: str,
                          timestamp: int, request_id: str) -> None:
    """Store payment record in Messages table for tracking."""
    try:
        # Find contact by phone number
        contact = _get_contact_by_phone(recipient_id)
        contact_id = contact.get('id', '') if contact else ''
        
        payment_id = str(uuid.uuid4())
        now = int(time.time())
        expires_at = now + MESSAGE_TTL_SECONDS
        
        # Calculate actual amount
        actual_amount = amount_value / amount_offset if amount_offset else amount_value
        
        payment_record = {
            'id': payment_id,
            'messageId': payment_id,
            'contactId': contact_id,
            'channel': 'whatsapp',
            'direction': 'inbound',
            'messageType': 'payment',
            'content': f'Payment {payment_status}: ₹{actual_amount:.2f} ({currency})',
            'status': payment_status,
            'senderPhone': recipient_id,
            # Payment-specific fields
            'paymentReferenceId': reference_id,
            'paymentStatus': payment_status,
            'paymentAmount': Decimal(str(amount_value)),
            'paymentOffset': Decimal(str(amount_offset)),
            'paymentCurrency': currency,
            'transactionId': transaction_id,
            'transactionType': transaction_type,
            'timestamp': Decimal(str(timestamp)),
            'createdAt': Decimal(str(now)),
            'expiresAt': Decimal(str(expires_at)),
        }
        
        messages_table = dynamodb.Table(MESSAGES_TABLE)
        messages_table.put_item(Item={k: v for k, v in payment_record.items() if v is not None and v != ''})
        
        logger.info(json.dumps({
            'event': 'payment_record_stored',
            'paymentId': payment_id,
            'referenceId': reference_id,
            'contactId': contact_id,
            'paymentStatus': payment_status,
            'amount': actual_amount,
            'requestId': request_id
        }))
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'payment_record_store_error',
            'referenceId': reference_id,
            'error': str(e),
            'requestId': request_id
        }))


def _get_contact_by_phone(phone: str) -> Optional[Dict]:
    """Get contact by phone number."""
    try:
        contacts_table = dynamodb.Table(CONTACTS_TABLE)
        
        # Clean phone number - handle various formats
        # Webhook sends: 918100330063
        # DB stores: +918100330063
        clean_phone = phone.lstrip('+')
        phone_with_plus = f'+{clean_phone}'
        
        logger.info(json.dumps({
            'event': 'contact_lookup_by_phone',
            'originalPhone': phone,
            'cleanPhone': clean_phone,
            'phoneWithPlus': phone_with_plus
        }))
        
        # Try multiple phone formats
        response = contacts_table.scan(
            FilterExpression='(phone = :phone1 OR phone = :phone2 OR phone = :phone3) AND (attribute_not_exists(deletedAt) OR deletedAt = :null)',
            ExpressionAttributeValues={
                ':phone1': clean_phone,
                ':phone2': phone_with_plus,
                ':phone3': phone,  # Original format
                ':null': None
            },
            Limit=10  # Increase limit to ensure we find the contact
        )
        
        items = response.get('Items', [])
        
        logger.info(json.dumps({
            'event': 'contact_lookup_result',
            'phone': phone,
            'foundCount': len(items),
            'contactId': items[0].get('id', '') if items else None
        }))
        
        return items[0] if items else None
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'contact_lookup_error',
            'phone': phone,
            'error': str(e)
        }))
        return None


def _send_order_status_message(recipient_id: str, reference_id: str, 
                                order_status: str, description: str,
                                request_id: str) -> None:
    """
    Send order_status interactive message to confirm payment status.
    
    Order status message format:
    {
        "type": "interactive",
        "interactive": {
            "type": "order_status",
            "body": {"text": "Your payment was successful!"},
            "action": {
                "name": "review_order",
                "parameters": {
                    "reference_id": "ORDER_12345",
                    "order": {
                        "status": "completed",  // pending, processing, shipped, completed, canceled
                        "description": "Payment received. Thank you!"
                    }
                }
            }
        }
    }
    """
    try:
        # Find contact by phone number
        contact = _get_contact_by_phone(recipient_id)
        
        if not contact:
            logger.warning(json.dumps({
                'event': 'order_status_no_contact',
                'recipientId': recipient_id,
                'referenceId': reference_id,
                'requestId': request_id,
                'note': 'Will try to send using phone number directly'
            }))
            # Create a minimal contact object with phone number
            # Format phone for WhatsApp: +918100330063
            formatted_phone = f'+{recipient_id}' if not recipient_id.startswith('+') else recipient_id
            contact = {'id': '', 'phone': formatted_phone}
        
        contact_id = contact.get('id', '')
        contact_phone = contact.get('phone', f'+{recipient_id}')
        
        # Build order_status payload - send directly to outbound Lambda
        order_status_payload = {
            'body': json.dumps({
                'contactId': contact_id if contact_id else None,
                'recipientPhone': contact_phone,  # Fallback to phone if no contactId
                'phoneNumberId': PHONE_NUMBER_ID_1,
                'isOrderStatus': True,
                'orderStatusDetails': {
                    'reference_id': reference_id,
                    'order_status': order_status,
                    'description': description
                }
            })
        }
        
        logger.info(json.dumps({
            'event': 'order_status_message_sending',
            'contactId': contact_id,
            'contactPhone': contact_phone,
            'referenceId': reference_id,
            'orderStatus': order_status,
            'requestId': request_id
        }))
        
        # Invoke outbound Lambda to send order_status message
        response = lambda_client.invoke(
            FunctionName=OUTBOUND_WHATSAPP_FUNCTION,
            InvocationType='Event',  # Async
            Payload=json.dumps(order_status_payload)
        )
        
        logger.info(json.dumps({
            'event': 'order_status_message_triggered',
            'contactId': contact_id,
            'contactPhone': contact_phone,
            'referenceId': reference_id,
            'orderStatus': order_status,
            'statusCode': response.get('StatusCode'),
            'requestId': request_id
        }))
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'order_status_message_error',
            'recipientId': recipient_id,
            'referenceId': reference_id,
            'error': str(e),
            'requestId': request_id
        }))


def _send_to_dlq(record: Dict, error: str, request_id: str) -> None:
    """Send failed message to inbound-dlq."""
    if not INBOUND_DLQ_URL:
        return
    
    try:
        sqs.send_message(
            QueueUrl=INBOUND_DLQ_URL,
            MessageBody=json.dumps({
                'originalRecord': record,
                'error': error,
                'timestamp': int(time.time()),
                'requestId': request_id
            }, default=str)
        )
    except Exception as e:
        logger.error(json.dumps({
            'event': 'dlq_send_error',
            'error': str(e),
            'requestId': request_id
        }))


def _send_auto_reaction(contact_id: str, whatsapp_message_id: str, 
                        phone_number_id: str, request_id: str) -> None:
    """
    Send automatic thumbs up reaction to inbound message.
    Uses the same phone number that received the message.
    """
    if not whatsapp_message_id:
        return
    
    try:
        reaction_payload = {
            'body': json.dumps({
                'contactId': contact_id,
                'isReaction': True,
                'reactionMessageId': whatsapp_message_id,
                'reactionEmoji': '\U0001F44D',  # Thumbs up
                'phoneNumberId': phone_number_id  # Use same phone that received
            })
        }
        
        response = lambda_client.invoke(
            FunctionName=OUTBOUND_WHATSAPP_FUNCTION,
            InvocationType='Event',
            Payload=json.dumps(reaction_payload)
        )
        
        logger.info(json.dumps({
            'event': 'auto_reaction_triggered',
            'contactId': contact_id,
            'whatsappMessageId': whatsapp_message_id,
            'phoneNumberId': phone_number_id,
            'statusCode': response.get('StatusCode'),
            'requestId': request_id
        }))
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'auto_reaction_error',
            'contactId': contact_id,
            'error': str(e),
            'requestId': request_id
        }))


def _send_ai_auto_reply(contact_id: str, content: str, phone_number_id: str, request_id: str) -> None:
    """
    Send AI-generated auto-reply to WhatsApp.
    Uses the same phone number that received the message.
    """
    if not content or not contact_id:
        return
    
    try:
        reply_payload = {
            'body': json.dumps({
                'contactId': contact_id,
                'content': content,
                'phoneNumberId': phone_number_id
            })
        }
        
        response = lambda_client.invoke(
            FunctionName=OUTBOUND_WHATSAPP_FUNCTION,
            InvocationType='Event',  # Async - don't wait for response
            Payload=json.dumps(reply_payload)
        )
        
        logger.info(json.dumps({
            'event': 'ai_auto_reply_triggered',
            'contactId': contact_id,
            'contentLength': len(content),
            'phoneNumberId': phone_number_id,
            'statusCode': response.get('StatusCode'),
            'requestId': request_id
        }))
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'ai_auto_reply_error',
            'contactId': contact_id,
            'error': str(e),
            'requestId': request_id
        }))


def _send_read_receipt(whatsapp_message_id: str, phone_number_id: str, request_id: str) -> None:
    """
    Send read receipt to WhatsApp per AWS docs.
    Per AWS: send-whatsapp-message with status='read' shows two blue check marks.
    """
    if not whatsapp_message_id:
        return
    
    try:
        # Build read receipt payload per AWS Social Messaging docs
        read_receipt_payload = {
            'messaging_product': 'whatsapp',
            'message_id': whatsapp_message_id,
            'status': 'read'
        }
        
        logger.info(json.dumps({
            'event': 'read_receipt_payload',
            'messageId': whatsapp_message_id,
            'status': 'read',
            'requestId': request_id
        }))
        
        # Call SendWhatsAppMessage API with read status
        response = social_messaging.send_whatsapp_message(
            originationPhoneNumberId=phone_number_id,
            message=json.dumps(read_receipt_payload).encode('utf-8'),
            metaApiVersion='v20.0'
        )
        
        logger.info(json.dumps({
            'event': 'read_receipt_sent',
            'messageId': whatsapp_message_id,
            'phoneNumberId': phone_number_id,
            'statusCode': response.get('StatusCode', 200),
            'requestId': request_id
        }))
        
    except Exception as e:
        logger.warning(json.dumps({
            'event': 'read_receipt_error',
            'messageId': whatsapp_message_id,
            'error': str(e),
            'requestId': request_id
        }))


# ============================================================================
# AI AUTOMATION INTEGRATION
# ============================================================================

def _is_ai_enabled() -> bool:
    """
    Check if AI automation is enabled in SystemConfig.
    Returns False silently if table doesn't exist (AI not configured).
    """
    try:
        config_table = dynamodb.Table(SYSTEM_CONFIG_TABLE)
        response = config_table.get_item(Key={'configKey': 'ai_automation_enabled'})
        item = response.get('Item', {})
        return item.get('configValue', 'false').lower() == 'true'
    except dynamodb.meta.client.exceptions.ResourceNotFoundException:
        # SystemConfig table doesn't exist - AI not configured, this is expected
        return False
    except Exception:
        # Any other error - silently disable AI (not critical for message processing)
        return False


def _process_ai_automation(message_id: str, contact_id: str, content: str, phone_number_id: str, request_id: str) -> Optional[Dict]:
    """Process AI automation for inbound message and send auto-reply."""
    ai_enabled = _is_ai_enabled()
    logger.info(json.dumps({
        'event': 'ai_automation_check',
        'aiEnabled': ai_enabled,
        'messageId': message_id,
        'contentLength': len(content) if content else 0,
        'requestId': request_id
    }))
    
    if not ai_enabled:
        return None
    
    try:
        logger.info(json.dumps({
            'event': 'ai_query_kb_start',
            'messageId': message_id,
            'query': content[:100] if content else '',
            'requestId': request_id
        }))
        kb_result = _invoke_ai_query_kb(content, message_id, request_id)
        logger.info(json.dumps({
            'event': 'ai_query_kb_result',
            'messageId': message_id,
            'hasResult': kb_result is not None,
            'requestId': request_id
        }))
        
        ai_response = _invoke_ai_generate_response(content, kb_result, message_id, contact_id, request_id)
        
        # Send auto-reply if we got a valid AI response
        if ai_response and ai_response.get('suggestion'):
            suggestion = ai_response.get('suggestion', '')
            if suggestion and len(suggestion) > 5:  # Only send if meaningful response
                _send_ai_auto_reply(
                    contact_id=contact_id,
                    content=suggestion,
                    phone_number_id=phone_number_id,
                    request_id=request_id
                )
        
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
    """Invoke ai-query-kb Lambda function."""
    try:
        logger.info(json.dumps({
            'event': 'invoking_ai_query_kb',
            'functionName': AI_QUERY_KB_FUNCTION,
            'messageId': message_id,
            'requestId': request_id
        }))
        response = lambda_client.invoke(
            FunctionName=AI_QUERY_KB_FUNCTION,
            InvocationType='RequestResponse',
            Payload=json.dumps({'query': query, 'messageId': message_id, 'requestId': request_id})
        )
        status_code = response.get('StatusCode')
        logger.info(json.dumps({
            'event': 'ai_query_kb_response',
            'statusCode': status_code,
            'messageId': message_id,
            'requestId': request_id
        }))
        if status_code == 200:
            payload = response['Payload'].read().decode('utf-8')
            return json.loads(json.loads(payload).get('body', '{}'))
        return None
    except Exception as e:
        logger.error(json.dumps({
            'event': 'ai_query_kb_error',
            'error': str(e),
            'messageId': message_id,
            'requestId': request_id
        }))
        return None


def _invoke_ai_generate_response(content: str, kb_context: Optional[Dict], 
                                  message_id: str, contact_id: str, request_id: str) -> Optional[Dict]:
    """Invoke ai-generate-response Lambda function."""
    try:
        response = lambda_client.invoke(
            FunctionName=AI_GENERATE_RESPONSE_FUNCTION,
            InvocationType='RequestResponse',
            Payload=json.dumps({
                'messageContent': content,
                'kbContext': kb_context,
                'messageId': message_id,
                'contactId': contact_id,
                'requestId': request_id
            })
        )
        if response.get('StatusCode') == 200:
            body = json.loads(json.loads(response['Payload'].read().decode('utf-8')).get('body', '{}'))
            _store_ai_interaction(message_id, content, body.get('suggestion', ''), request_id)
            return body
        return None
    except Exception:
        return None


def _store_ai_interaction(message_id: str, query: str, response: str, request_id: str) -> None:
    """Store AI interaction record."""
    try:
        ai_table = dynamodb.Table(AI_INTERACTIONS_TABLE)
        ai_table.put_item(Item={
            'interactionId': str(uuid.uuid4()),
            'messageId': message_id,
            'query': query,
            'response': response,
            'approved': False,
            'timestamp': Decimal(str(int(time.time()))),
        })
    except Exception as e:
        logger.error(f"Failed to store AI interaction: {str(e)}")
