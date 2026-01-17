"""
Inbound WhatsApp Handler Lambda Function

Purpose: Process SNS notifications for WhatsApp messages
Requirements: 4.1, 4.2, 4.3, 4.8, 4.9, 5.12

Parses AWS EUM Social event format, stores messages, downloads media,
updates contact timestamps for 24-hour customer service window.
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

MEDIA_BUCKET = os.environ.get('MEDIA_BUCKET', 'auth.wecare.digital')
MEDIA_PREFIX = os.environ.get('MEDIA_INBOUND_PREFIX', 'whatsapp-media/whatsapp-media-incoming/')


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
    logger.info("Processing inbound WhatsApp message")
    
    try:
        # Parse SNS event
        for record in event.get('Records', []):
            sns_message = json.loads(record.get('Sns', {}).get('Message', '{}'))
            
            # Requirement 4.1: Parse AWS EUM Social event format
            context_data = sns_message.get('context', {})
            webhook_entry_str = sns_message.get('whatsAppWebhookEntry', '{}')
            
            # Requirement 4.2: Decode whatsAppWebhookEntry JSON string
            webhook_entry = json.loads(webhook_entry_str)
            
            # Process changes
            for change in webhook_entry.get('changes', []):
                value = change.get('value', {})
                
                # Process messages
                for message in value.get('messages', []):
                    _process_message(message, value.get('metadata', {}))
                
                # Process status updates
                for status in value.get('statuses', []):
                    _process_status(status)
        
        return {'statusCode': 200, 'body': json.dumps({'processed': True})}
        
    except Exception as e:
        logger.error(f"Inbound processing error: {str(e)}")
        # Requirement 4.7: Send to inbound-dlq on failure
        # TODO: Send to SQS inbound-dlq
        raise


def _process_message(message: Dict, metadata: Dict) -> None:
    """Process a single inbound message."""
    whatsapp_message_id = message.get('id')
    sender = message.get('from')
    msg_type = message.get('type')
    timestamp = message.get('timestamp')
    
    logger.info(f"Processing message: id={whatsapp_message_id}, type={msg_type}")
    
    # Requirement 4.8: Deduplicate using whatsappMessageId
    # TODO: Check if message already exists in DynamoDB
    
    # Requirement 4.3: Store message in DynamoDB
    # TODO: Store message record with TTL (30 days)
    
    # Requirement 4.9: Update Contact.lastInboundMessageAt
    # TODO: Update contact timestamp for 24-hour window tracking
    
    # Handle media messages
    if msg_type in ['image', 'video', 'audio', 'document']:
        media_data = message.get(msg_type, {})
        media_id = media_data.get('id')
        if media_id:
            _download_media(media_id, whatsapp_message_id)


def _download_media(media_id: str, message_id: str) -> None:
    """Download media file from WhatsApp."""
    # Requirement 4.4, 4.5, 4.6: Download and store media
    # TODO: Call GetWhatsAppMessageMedia API
    # TODO: Store in S3 auth.wecare.digital
    logger.info(f"Downloading media: mediaId={media_id}")


def _process_status(status: Dict) -> None:
    """Process message status update."""
    message_id = status.get('id')
    status_value = status.get('status')
    # Requirement 5.12: Track message status updates
    # TODO: Update message status in DynamoDB
    logger.info(f"Status update: messageId={message_id}, status={status_value}")
