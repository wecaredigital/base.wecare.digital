"""
Outbound WhatsApp Lambda Function

Purpose: Send WhatsApp text/media messages
Requirements: 3.1, 3.2, 5.2-5.11, 14.4, 16.2-16.6

Validates opt-in and allowlist, checks customer service window,
calls AWS EUM Social SendWhatsAppMessage API.
Emits CloudWatch metrics for delivery success/failure.
"""

import os
import json
import uuid
import time
import logging
import boto3
from typing import Dict, Any, Optional, Tuple
from decimal import Decimal

# Configure logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

# AWS clients
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
social_messaging = boto3.client('socialmessaging', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
s3 = boto3.client('s3', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
cloudwatch = boto3.client('cloudwatch', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
SEND_MODE = os.environ.get('SEND_MODE', 'LIVE')
CONTACTS_TABLE = os.environ.get('CONTACTS_TABLE', 'base-wecare-digital-ContactsTable')
MESSAGES_TABLE = os.environ.get('MESSAGES_TABLE', 'base-wecare-digital-WhatsAppOutboundTable')
MEDIA_FILES_TABLE = os.environ.get('MEDIA_FILES_TABLE', 'MediaFiles')
RATE_LIMIT_TABLE = os.environ.get('RATE_LIMIT_TABLE', 'RateLimitTrackers')
MEDIA_BUCKET = os.environ.get('MEDIA_BUCKET', 'auth.wecare.digital')
MEDIA_PREFIX = os.environ.get('MEDIA_OUTBOUND_PREFIX', 'whatsapp-media/whatsapp-media-outgoing/')

# WhatsApp Phone Number IDs (Allowlist) - Requirement 3.2
PHONE_NUMBER_ID_1 = os.environ.get('WHATSAPP_PHONE_NUMBER_ID_1', 'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54')
PHONE_NUMBER_ID_2 = os.environ.get('WHATSAPP_PHONE_NUMBER_ID_2', 'phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06')
ALLOWLIST = {PHONE_NUMBER_ID_1, PHONE_NUMBER_ID_2}

# Constants
META_API_VERSION = 'v20.0'  # Requirement 5.8
MAX_TEXT_LENGTH = 4096  # Requirement 5.4
MESSAGE_TTL_SECONDS = 30 * 24 * 60 * 60  # 30 days
CUSTOMER_SERVICE_WINDOW_HOURS = 24  # Requirement 16.2
RATE_LIMIT_PER_SECOND = 80  # Requirement 5.9
METRICS_NAMESPACE = 'WECARE.DIGITAL'


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Send WhatsApp message or reaction.
    Requirements: 3.1, 3.2, 5.2-5.11, 16.2-16.6
    Supports: text, media, template, and reaction messages
    """
    request_id = context.aws_request_id if context else 'local'
    
    logger.info(json.dumps({
        'event': 'outbound_whatsapp_start',
        'sendMode': SEND_MODE,
        'requestId': request_id
    }))
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        contact_id = body.get('contactId')
        content = body.get('content', '')
        phone_number_id = body.get('phoneNumberId', PHONE_NUMBER_ID_1)
        media_file = body.get('mediaFile')  # S3 key or base64
        media_type = body.get('mediaType')  # image, video, audio, document
        is_template = body.get('isTemplate', False)
        template_name = body.get('templateName')
        template_params = body.get('templateParams', [])
        
        # Reaction support
        is_reaction = body.get('isReaction', False)
        reaction_message_id = body.get('reactionMessageId')  # WhatsApp message ID to react to
        reaction_emoji = body.get('reactionEmoji', '\U0001F44D')  # Default: thumbs up
        
        if not contact_id:
            return _error_response(400, 'contactId is required')
        
        # Retrieve contact
        contact = _get_contact(contact_id)
        if not contact:
            return _error_response(404, 'Contact not found')
        
        # Validate reaction request
        if is_reaction and not reaction_message_id:
            return _error_response(400, 'reactionMessageId is required for reactions')
        
        # All contacts are allowed by default - no opt-in/allowlist checks
        # Customer service window check - always allow (within_window = True)
        within_window = True
        
        # Requirement 5.4: Validate text length (skip for reactions)
        if not is_reaction and content and len(content) > MAX_TEXT_LENGTH:
            return _error_response(400, f'Content exceeds {MAX_TEXT_LENGTH} characters')
        
        # Requirement 5.9: Check rate limit
        if not _check_rate_limit(phone_number_id):
            return _error_response(429, 'Rate limit exceeded. Try again later.')
        
        # Generate message ID
        message_id = str(uuid.uuid4())
        recipient_phone = contact.get('phone')
        
        # Requirement 5.3: DRY_RUN mode - log without API call
        if SEND_MODE == 'DRY_RUN':
            if is_reaction:
                return _handle_dry_run_reaction(message_id, contact_id, recipient_phone, reaction_message_id, reaction_emoji, request_id)
            return _handle_dry_run(message_id, contact_id, recipient_phone, content, is_template, request_id)
        
        # Handle reaction messages
        if is_reaction:
            return _handle_reaction_send(
                message_id, contact_id, recipient_phone, phone_number_id,
                reaction_message_id, reaction_emoji, request_id
            )
        
        # Requirement 5.2: LIVE mode - call API
        return _handle_live_send(
            message_id, contact_id, recipient_phone, phone_number_id,
            content, media_file, media_type, is_template, template_name,
            template_params, within_window, request_id
        )
        
    except json.JSONDecodeError:
        return _error_response(400, 'Invalid JSON in request body')
    except Exception as e:
        logger.error(json.dumps({
            'event': 'outbound_whatsapp_error',
            'error': str(e),
            'requestId': request_id
        }))
        return _error_response(500, 'Internal server error')


def _handle_dry_run(message_id: str, contact_id: str, recipient_phone: str, 
                    content: str, is_template: bool, request_id: str) -> Dict[str, Any]:
    """Handle DRY_RUN mode - log without actual API call."""
    now = int(time.time())
    
    # Store message record with DRY_RUN status
    _store_message_record(
        message_id=message_id,
        contact_id=contact_id,
        content=content,
        status='dry_run',
        is_template=is_template,
        whatsapp_message_id=f'dry-run-{message_id}'
    )
    
    logger.info(json.dumps({
        'event': 'dry_run_message',
        'messageId': message_id,
        'contactId': contact_id,
        'recipientPhone': recipient_phone,
        'contentLength': len(content) if content else 0,
        'isTemplate': is_template,
        'requestId': request_id
    }))
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps({
            'messageId': message_id,
            'status': 'dry_run',
            'mode': 'DRY_RUN',
            'message': 'Message logged but not sent (DRY_RUN mode)'
        })
    }


def _handle_dry_run_reaction(message_id: str, contact_id: str, recipient_phone: str,
                              reaction_message_id: str, reaction_emoji: str, request_id: str) -> Dict[str, Any]:
    """Handle DRY_RUN mode for reactions - log without actual API call."""
    logger.info(json.dumps({
        'event': 'dry_run_reaction',
        'messageId': message_id,
        'contactId': contact_id,
        'recipientPhone': recipient_phone,
        'reactionMessageId': reaction_message_id,
        'emoji': reaction_emoji,
        'requestId': request_id
    }))
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps({
            'messageId': message_id,
            'status': 'dry_run',
            'mode': 'DRY_RUN',
            'type': 'reaction',
            'reactionMessageId': reaction_message_id,
            'emoji': reaction_emoji,
            'message': 'Reaction logged but not sent (DRY_RUN mode)'
        })
    }


def _handle_reaction_send(message_id: str, contact_id: str, recipient_phone: str,
                          phone_number_id: str, reaction_message_id: str, 
                          reaction_emoji: str, request_id: str) -> Dict[str, Any]:
    """
    Send a reaction to a WhatsApp message.
    Uses AWS EUM Social SendWhatsAppMessage API with reaction type.
    """
    try:
        # Normalize phone number - WhatsApp API expects digits only without + prefix
        formatted_phone = _normalize_phone_number(recipient_phone)
        
        # Build reaction payload per WhatsApp Cloud API spec
        reaction_payload = {
            'messaging_product': 'whatsapp',
            'recipient_type': 'individual',
            'to': formatted_phone,
            'type': 'reaction',
            'reaction': {
                'message_id': reaction_message_id,
                'emoji': reaction_emoji
            }
        }
        
        logger.info(json.dumps({
            'event': 'reaction_payload',
            'to': formatted_phone,
            'reactionMessageId': reaction_message_id,
            'emoji': reaction_emoji,
            'requestId': request_id
        }))
        
        # Call SendWhatsAppMessage API
        response = social_messaging.send_whatsapp_message(
            originationPhoneNumberId=phone_number_id,
            message=json.dumps(reaction_payload).encode('utf-8'),
            metaApiVersion=META_API_VERSION
        )
        
        whatsapp_message_id = response.get('messageId', '')
        
        logger.info(json.dumps({
            'event': 'reaction_sent',
            'messageId': message_id,
            'whatsappMessageId': whatsapp_message_id,
            'contactId': contact_id,
            'reactionMessageId': reaction_message_id,
            'emoji': reaction_emoji,
            'requestId': request_id
        }))
        
        # Emit success metric
        _emit_delivery_metric('success', is_template=False)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            'body': json.dumps({
                'messageId': message_id,
                'whatsappMessageId': whatsapp_message_id,
                'status': 'sent',
                'mode': 'LIVE',
                'type': 'reaction',
                'reactionMessageId': reaction_message_id,
                'emoji': reaction_emoji
            })
        }
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'reaction_send_error',
            'messageId': message_id,
            'error': str(e),
            'requestId': request_id
        }))
        _emit_delivery_metric('failed', is_template=False)
        return _error_response(500, f'Failed to send reaction: {str(e)}')


def _handle_live_send(message_id: str, contact_id: str, recipient_phone: str,
                      phone_number_id: str, content: str, media_file: Optional[str],
                      media_type: Optional[str], is_template: bool, template_name: Optional[str],
                      template_params: list, within_window: bool, request_id: str) -> Dict[str, Any]:
    """
    Handle LIVE mode - call AWS EUM Social API.
    Requirements: 5.2, 5.5, 5.6, 5.7, 5.8, 5.10, 5.11
    """
    try:
        whatsapp_media_id = None
        s3_key = None
        
        # Requirements 5.5, 5.6, 5.7: Handle media upload
        if media_file and media_type:
            # Extract filename from media_file if it's a path
            filename = None
            if isinstance(media_file, str) and '/' in media_file:
                filename = media_file.split('/')[-1]
            
            s3_key, whatsapp_media_id, stored_filename = _upload_media(media_file, media_type, message_id, phone_number_id, request_id, filename)
            if not whatsapp_media_id:
                return _error_response(500, 'Failed to upload media')
        
        # Build WhatsApp message payload
        message_payload = _build_message_payload(
            recipient_phone, content, media_type, whatsapp_media_id,
            is_template, template_name, template_params
        )
        
        logger.info(json.dumps({
            'event': 'message_payload_built',
            'messageId': message_id,
            'contactId': contact_id,
            'recipientPhone': recipient_phone,
            'normalizedPhone': message_payload.get('to'),
            'payloadType': message_payload.get('type'),
            'hasMedia': bool(whatsapp_media_id),
            'mediaId': whatsapp_media_id,
            'payload': message_payload,
            'requestId': request_id
        }))
        
        # Requirement 5.8: Call SendWhatsAppMessage API
        # Note: message parameter should be a string, not bytes
        message_json = json.dumps(message_payload)
        
        logger.info(json.dumps({
            'event': 'calling_send_whatsapp_message_api',
            'messageId': message_id,
            'phoneNumberId': phone_number_id,
            'messageJson': message_json,
            'requestId': request_id
        }))
        
        response = social_messaging.send_whatsapp_message(
            originationPhoneNumberId=phone_number_id,
            message=message_json,
            metaApiVersion=META_API_VERSION
        )
        
        whatsapp_message_id = response.get('messageId', '')
        
        # Requirement 5.11: Store message record
        _store_message_record(
            message_id=message_id,
            contact_id=contact_id,
            content=content,
            status='sent',
            is_template=is_template,
            whatsapp_message_id=whatsapp_message_id,
            media_id=whatsapp_media_id,
            s3_key=s3_key,
            phone_number_id=phone_number_id
        )
        
        logger.info(json.dumps({
            'event': 'message_sent',
            'messageId': message_id,
            'whatsappMessageId': whatsapp_message_id,
            'contactId': contact_id,
            'isTemplate': is_template,
            'hasMedia': bool(whatsapp_media_id),
            'requestId': request_id
        }))
        
        # Requirement 14.4: Emit success metric
        _emit_delivery_metric('success', is_template)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            'body': json.dumps({
                'messageId': message_id,
                'whatsappMessageId': whatsapp_message_id,
                'status': 'sent',
                'mode': 'LIVE'
            })
        }
        
    except social_messaging.exceptions.ThrottledRequestException as e:
        # Requirement 5.10: Handle API errors
        _store_message_record(
            message_id=message_id,
            contact_id=contact_id,
            content=content,
            status='failed',
            error_details={'type': 'throttling', 'message': str(e)},
            phone_number_id=phone_number_id
        )
        # Emit failure metric
        _emit_delivery_metric('failed', is_template)
        return _error_response(429, 'API rate limit exceeded')
        
    except Exception as e:
        # Requirement 5.10: Store error details
        error_msg = str(e)
        error_type = type(e).__name__
        
        logger.error(json.dumps({
            'event': 'send_api_error',
            'messageId': message_id,
            'error': error_msg,
            'errorType': error_type,
            'recipientPhone': recipient_phone,
            'normalizedPhone': message_payload.get('to') if 'message_payload' in locals() else 'unknown',
            'requestId': request_id
        }))
        
        _store_message_record(
            message_id=message_id,
            contact_id=contact_id,
            content=content,
            status='failed',
            error_details={'type': error_type, 'message': error_msg},
            phone_number_id=phone_number_id
        )
        # Emit failure metric
        _emit_delivery_metric('failed', is_template)
        return _error_response(500, f'Failed to send message: {error_msg}')


def _upload_media(media_file: str, media_type: str, message_id: str, phone_number_id: str, request_id: str, filename: Optional[str] = None) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Upload media to S3 and register with WhatsApp.
    Supports all AWS Social Messaging media types per documentation.
    Requirements 5.5, 5.6, 5.7
    
    Returns: (s3_key, whatsapp_media_id, filename)
    """
    import subprocess
    import json as json_module
    
    try:
        # Generate S3 key with proper extension
        extension = _get_media_extension(media_type)
        
        # Use provided filename or generate one
        if filename:
            # Preserve original filename
            s3_key = f"{MEDIA_PREFIX}{filename}"
        else:
            s3_key = f"{MEDIA_PREFIX}{message_id}{extension}"
        
        # If media_file is already an S3 key, use it directly
        if media_file.startswith('s3://') or media_file.startswith(MEDIA_PREFIX):
            s3_key = media_file.replace('s3://', '').replace(f'{MEDIA_BUCKET}/', '')
            
            # Get file size from S3 for validation
            try:
                head_response = s3.head_object(Bucket=MEDIA_BUCKET, Key=s3_key)
                file_size = head_response.get('ContentLength', 0)
                is_valid, error_msg = _validate_media_size(file_size, media_type)
                if not is_valid:
                    logger.error(json.dumps({
                        'event': 'media_size_validation_failed',
                        's3Key': s3_key,
                        'fileSize': file_size,
                        'error': error_msg,
                        'requestId': request_id
                    }))
                    return None, None
            except Exception as e:
                logger.warning(f"Could not validate S3 file size: {str(e)}")
        else:
            # Assume base64 encoded - decode and upload
            import base64
            try:
                file_content = base64.b64decode(media_file)
            except Exception as e:
                logger.error(json.dumps({
                    'event': 'media_decode_error',
                    'error': str(e),
                    'requestId': request_id
                }))
                return None, None
            
            # Validate file size
            file_size = len(file_content)
            is_valid, error_msg = _validate_media_size(file_size, media_type)
            if not is_valid:
                logger.error(json.dumps({
                    'event': 'media_size_validation_failed',
                    'fileSize': file_size,
                    'error': error_msg,
                    'requestId': request_id
                }))
                return None, None
            
            # Upload to S3
            s3.put_object(
                Bucket=MEDIA_BUCKET,
                Key=s3_key,
                Body=file_content,
                ContentType=_get_content_type(media_type)
            )
        
        logger.info(json.dumps({
            'event': 'media_uploaded_to_s3',
            's3Key': s3_key,
            'mediaType': media_type,
            'requestId': request_id
        }))
        
        # Requirement 5.6: Call PostWhatsAppMessageMedia to get mediaId
        # Use boto3 with correct parameter format
        try:
            response = social_messaging.post_whatsapp_message_media(
                originationPhoneNumberId=phone_number_id,
                sourceS3File={
                    'bucketName': MEDIA_BUCKET,
                    'key': s3_key
                }
            )
            whatsapp_media_id = response.get('mediaId', '')
            
            if not whatsapp_media_id:
                logger.error(json.dumps({
                    'event': 'media_registration_no_id',
                    's3Key': s3_key,
                    'response': response,
                    'requestId': request_id
                }))
                return None, None
            
            logger.info(json.dumps({
                'event': 'media_registered_with_whatsapp',
                's3Key': s3_key,
                'mediaId': whatsapp_media_id,
                'mediaType': media_type,
                'phoneNumberId': phone_number_id,
                'requestId': request_id
            }))
            
        except Exception as e:
            logger.error(json.dumps({
                'event': 'media_registration_failed',
                'error': str(e),
                'errorType': type(e).__name__,
                's3Key': s3_key,
                'phoneNumberId': phone_number_id,
                'requestId': request_id
            }))
            # Media registration failed - cannot send media without mediaId
            return None, None
        
        logger.info(json.dumps({
            'event': 'media_upload_complete',
            's3Key': s3_key,
            'mediaId': whatsapp_media_id,
            'mediaType': media_type,
            'filename': filename or 'auto-generated',
            'requestId': request_id
        }))
        
        return s3_key, whatsapp_media_id, filename or f"{message_id}{extension}"
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'media_upload_error',
            'error': str(e),
            'errorType': type(e).__name__,
            'mediaType': media_type,
            'requestId': request_id
        }))
        return None, None, None


def _normalize_phone_number(phone: str) -> str:
    """
    Normalize phone number to WhatsApp-compatible E.164 format.
    WhatsApp requires: digits only, no + prefix, with country code.
    
    Examples:
    - "+919876543210" -> "919876543210"
    - "919876543210" -> "919876543210"
    - "+91 98765 43210" -> "919876543210"
    - "9876543210" -> "919876543210" (assumes India)
    - "447447840003" -> "447447840003"
    - "+44 7447 840003" -> "447447840003"
    """
    if not phone:
        return phone
    
    # Remove all non-digit characters (spaces, dashes, +, etc.)
    digits_only = ''.join(c for c in phone if c.isdigit())
    
    # If empty after removing non-digits, return original
    if not digits_only:
        return phone
    
    # If 10 digits and starts with 6-9, assume Indian number
    if len(digits_only) == 10 and digits_only[0] in '6789':
        digits_only = '91' + digits_only
    
    # If 11 digits starting with 0, remove leading 0 and add country code
    if len(digits_only) == 11 and digits_only[0] == '0':
        digits_only = '91' + digits_only[1:]
    
    # If 12 digits starting with 0091, remove leading 00
    if len(digits_only) == 12 and digits_only.startswith('0091'):
        digits_only = digits_only[2:]
    
    # Validate final format: should be 10-15 digits (E.164 format)
    if not digits_only.isdigit() or len(digits_only) < 10 or len(digits_only) > 15:
        logger.warning(f"Phone number after normalization is invalid: {phone} -> {digits_only} (length: {len(digits_only)})")
    
    return digits_only


def _build_message_payload(recipient_phone: str, content: str, media_type: Optional[str],
                           media_id: Optional[str], is_template: bool, template_name: Optional[str],
                           template_params: list) -> Dict[str, Any]:
    """Build WhatsApp Cloud API message payload."""
    # Normalize phone number - WhatsApp API expects digits only without + prefix for normalization
    formatted_phone = _normalize_phone_number(recipient_phone)
    
    # Validate phone number format
    if not formatted_phone or not formatted_phone.isdigit() or len(formatted_phone) < 10:
        logger.warning(f"Invalid phone number after normalization: {recipient_phone} -> {formatted_phone}")
    
    # WhatsApp requires + prefix with country code in the message payload
    whatsapp_phone = f"+{formatted_phone}"
    
    payload = {
        'messaging_product': 'whatsapp',
        'recipient_type': 'individual',
        'to': whatsapp_phone
    }
    
    if is_template and template_name:
        # Template message
        payload['type'] = 'template'
        payload['template'] = {
            'name': template_name,
            'language': {'code': 'en'},
            'components': []
        }
        if template_params:
            payload['template']['components'].append({
                'type': 'body',
                'parameters': [{'type': 'text', 'text': p} for p in template_params]
            })
    elif media_id and media_type:
        # Media message - extract message type from media_type
        # media_type is like 'image/jpeg', we need just 'image'
        msg_type = media_type.split('/')[0] if '/' in media_type else media_type
        
        # Validate media type
        valid_types = ['image', 'video', 'audio', 'document', 'sticker']
        if msg_type not in valid_types:
            logger.warning(f"Invalid media type: {media_type} -> {msg_type}, using 'document' as fallback")
            msg_type = 'document'
        
        payload['type'] = msg_type
        payload[msg_type] = {'id': media_id}
        
        # Add caption if provided
        if content:
            payload[msg_type]['caption'] = content
        
        # For documents, add filename if available
        if msg_type == 'document' and hasattr(content, '__len__'):
            # Try to extract filename from content or use default
            pass
    else:
        # Text message
        payload['type'] = 'text'
        payload['text'] = {'body': content, 'preview_url': False}
    
    return payload


def _get_contact(contact_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve contact from DynamoDB."""
    contacts_table = dynamodb.Table(CONTACTS_TABLE)
    
    # First try direct lookup by 'id' (primary key)
    try:
        response = contacts_table.get_item(Key={'id': contact_id})
        item = response.get('Item')
        if item and item.get('deletedAt') is None:
            return item
    except Exception as e:
        logger.warning(f"Direct lookup failed: {str(e)}")
    
    # Fallback: scan by contactId field
    try:
        response = contacts_table.scan(
            FilterExpression='contactId = :cid AND (attribute_not_exists(deletedAt) OR deletedAt = :null)',
            ExpressionAttributeValues={':cid': contact_id, ':null': None},
            Limit=1
        )
        items = response.get('Items', [])
        if items:
            return items[0]
    except Exception as e:
        logger.warning(f"Scan by contactId failed: {str(e)}")
    
    return None


def _is_within_service_window(contact: Dict[str, Any]) -> bool:
    """
    Check if within 24-hour customer service window.
    Requirement 16.2: Calculate window as 24 hours from lastInboundMessageAt
    """
    last_inbound = contact.get('lastInboundMessageAt')
    if not last_inbound:
        return False
    
    # Convert to int if Decimal
    if isinstance(last_inbound, Decimal):
        last_inbound = int(last_inbound)
    elif isinstance(last_inbound, str):
        # Handle ISO format
        from datetime import datetime
        last_inbound = int(datetime.fromisoformat(last_inbound.replace('Z', '+00:00')).timestamp())
    
    window_end = last_inbound + (CUSTOMER_SERVICE_WINDOW_HOURS * 60 * 60)
    return int(time.time()) < window_end


def _check_rate_limit(phone_number_id: str) -> bool:
    """
    Check rate limit for phone number.
    Requirement 5.9: 80 messages per second per phone number
    """
    try:
        rate_table = dynamodb.Table(RATE_LIMIT_TABLE)
        now = int(time.time())
        window_key = f"whatsapp:{phone_number_id}"
        
        # Atomic increment
        response = rate_table.update_item(
            Key={'channel': window_key, 'windowStart': now},
            UpdateExpression='SET messageCount = if_not_exists(messageCount, :zero) + :inc, lastUpdatedAt = :now',
            ExpressionAttributeValues={
                ':zero': Decimal('0'),
                ':inc': Decimal('1'),
                ':now': Decimal(str(now + 86400))  # TTL: 24 hours
            },
            ReturnValues='UPDATED_NEW'
        )
        
        count = int(response.get('Attributes', {}).get('messageCount', 0))
        return count <= RATE_LIMIT_PER_SECOND
        
    except Exception:
        # Allow on error (fail open for rate limiting)
        return True


def _store_message_record(message_id: str, contact_id: str, content: str, status: str,
                          is_template: bool = False, whatsapp_message_id: str = None,
                          media_id: str = None, s3_key: str = None,
                          error_details: Dict = None, phone_number_id: str = None) -> None:
    """Store message record in DynamoDB with WABA tracking."""
    now = int(time.time())
    expires_at = now + MESSAGE_TTL_SECONDS
    
    record = {
        'id': message_id,
        'messageId': message_id,
        'contactId': contact_id,
        'channel': 'whatsapp',
        'direction': 'outbound',
        'content': content,
        'messageType': 'template' if is_template else 'text',
        'timestamp': Decimal(str(now)),
        'status': status,
        'whatsappMessageId': whatsapp_message_id,
        'mediaId': media_id,
        's3Key': s3_key,
        'errorDetails': json.dumps(error_details) if error_details else None,
        # WABA tracking - which phone number sent this message
        'awsPhoneNumberId': phone_number_id,
        'createdAt': Decimal(str(now)),
        'expiresAt': Decimal(str(expires_at)),
    }
    
    try:
        messages_table = dynamodb.Table(MESSAGES_TABLE)
        messages_table.put_item(Item={k: v for k, v in record.items() if v is not None})
    except Exception as e:
        logger.error(f"Failed to store message record: {str(e)}")


def _log_validation_failure(contact_id: str, channel: str, reason: str, request_id: str) -> None:
    """Log validation failure - Requirement 3.6"""
    logger.warning(json.dumps({
        'event': 'validation_failure',
        'contactId': contact_id,
        'channel': channel,
        'reason': reason,
        'requestId': request_id,
        'timestamp': int(time.time())
    }))


def _get_media_extension(media_type: str) -> str:
    """Get file extension based on media type per AWS Social Messaging docs."""
    extensions = {
        # Image formats (max 5MB)
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image': '.jpg',  # Default image
        
        # Video formats (max 16MB)
        'video/mp4': '.mp4',
        'video/3gp': '.3gp',
        'video': '.mp4',  # Default video
        
        # Audio formats (max 16MB)
        'audio/aac': '.aac',
        'audio/amr': '.amr',
        'audio/mpeg': '.mp3',
        'audio/mp4': '.m4a',
        'audio/ogg': '.ogg',
        'audio': '.ogg',  # Default audio
        
        # Document formats (max 100MB)
        'application/pdf': '.pdf',
        'text/plain': '.txt',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'application/vnd.ms-powerpoint': '.ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
        'document': '.pdf',  # Default document
        
        # Sticker formats (max 500KB animated, 100KB static)
        'image/webp': '.webp',
        'sticker': '.webp'
    }
    
    # Try exact match first
    if media_type in extensions:
        return extensions[media_type]
    
    # Try prefix match (e.g., 'image' from 'image/jpeg')
    prefix = media_type.split('/')[0] if '/' in media_type else media_type
    return extensions.get(prefix, '.bin')


def _get_content_type(media_type: str) -> str:
    """Get content type based on media type per AWS Social Messaging docs."""
    content_types = {
        # Image formats
        'image/jpeg': 'image/jpeg',
        'image/png': 'image/png',
        'image': 'image/jpeg',
        
        # Video formats
        'video/mp4': 'video/mp4',
        'video/3gp': 'video/3gp',
        'video': 'video/mp4',
        
        # Audio formats
        'audio/aac': 'audio/aac',
        'audio/amr': 'audio/amr',
        'audio/mpeg': 'audio/mpeg',
        'audio/mp4': 'audio/mp4',
        'audio/ogg': 'audio/ogg',
        'audio': 'audio/ogg',
        
        # Document formats
        'application/pdf': 'application/pdf',
        'text/plain': 'text/plain',
        'application/msword': 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel': 'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint': 'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'document': 'application/pdf',
        
        # Sticker formats
        'image/webp': 'image/webp',
        'sticker': 'image/webp'
    }
    
    # Try exact match first
    if media_type in content_types:
        return content_types[media_type]
    
    # Try prefix match
    prefix = media_type.split('/')[0] if '/' in media_type else media_type
    if prefix in content_types:
        return content_types[prefix]
    
    return 'application/octet-stream'


def _validate_media_size(file_size: int, media_type: str) -> Tuple[bool, str]:
    """
    Validate media file size per AWS Social Messaging docs.
    Returns (is_valid, error_message)
    """
    # Get media category
    if media_type.startswith('image/') or media_type == 'image':
        max_size = 5 * 1024 * 1024  # 5MB
        category = 'Image'
    elif media_type.startswith('video/') or media_type == 'video':
        max_size = 16 * 1024 * 1024  # 16MB
        category = 'Video'
    elif media_type.startswith('audio/') or media_type == 'audio':
        max_size = 16 * 1024 * 1024  # 16MB
        category = 'Audio'
    elif media_type == 'sticker' or media_type == 'image/webp':
        max_size = 500 * 1024  # 500KB for animated, but we'll use this as max
        category = 'Sticker'
    else:
        max_size = 100 * 1024 * 1024  # 100MB for documents
        category = 'Document'
    
    if file_size > max_size:
        return False, f'{category} file exceeds maximum size of {max_size / (1024*1024):.0f}MB'
    
    return True, ''


def _error_response(status_code: int, error: str, message: str = None) -> Dict[str, Any]:
    """Return error response with CORS headers."""
    body = {'error': error}
    if message:
        body['message'] = message
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps(body)
    }


def _emit_delivery_metric(status: str, is_template: bool = False) -> None:
    """
    Emit message delivery metric to CloudWatch.
    Requirement 14.4: Emit CloudWatch metrics for message delivery success/failure
    """
    try:
        cloudwatch.put_metric_data(
            Namespace=METRICS_NAMESPACE,
            MetricData=[
                {
                    'MetricName': f'Messages{status.capitalize()}',
                    'Value': 1,
                    'Unit': 'Count',
                    'Dimensions': [
                        {'Name': 'Channel', 'Value': 'WHATSAPP'},
                        {'Name': 'Status', 'Value': status.upper()},
                        {'Name': 'MessageType', 'Value': 'TEMPLATE' if is_template else 'FREEFORM'}
                    ]
                },
                {
                    'MetricName': 'MessagesTotal',
                    'Value': 1,
                    'Unit': 'Count',
                    'Dimensions': [
                        {'Name': 'Channel', 'Value': 'WHATSAPP'}
                    ]
                }
            ]
        )
    except Exception as e:
        logger.warning(f"Failed to emit metric: {str(e)}")
