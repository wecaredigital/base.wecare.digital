"""
Outbound WhatsApp Lambda Function

Purpose: Send WhatsApp text/media messages
Requirements: 3.1, 3.2, 5.2-5.11, 16.3-16.6

Validates opt-in and allowlist, checks customer service window,
calls AWS EUM Social SendWhatsAppMessage API.
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

SEND_MODE = os.environ.get('SEND_MODE', 'DRY_RUN')
PHONE_NUMBER_IDS = [
    os.environ.get('WHATSAPP_PHONE_NUMBER_ID_1'),
    os.environ.get('WHATSAPP_PHONE_NUMBER_ID_2'),
]
META_API_VERSION = 'v20.0'
MAX_TEXT_LENGTH = 4096


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Send WhatsApp message."""
    logger.info(f"Outbound WhatsApp - SEND_MODE={SEND_MODE}")
    
    try:
        body = json.loads(event.get('body', '{}'))
        contact_id = body.get('contactId')
        content = body.get('content', '')
        phone_number_id = body.get('phoneNumberId', PHONE_NUMBER_IDS[0])
        media_file = body.get('mediaFile')
        is_template = body.get('isTemplate', False)
        
        # Requirement 3.1: Validate opt-in
        contact = _get_contact(contact_id)
        if not contact or not contact.get('optInWhatsApp'):
            logger.warning(f"Opt-in validation failed: contactId={contact_id}")
            return {'statusCode': 400, 'body': json.dumps({'error': 'WhatsApp opt-in required'})}
        
        # Requirement 3.2: Validate allowlist
        if phone_number_id not in PHONE_NUMBER_IDS:
            logger.warning(f"Allowlist validation failed: phoneNumberId={phone_number_id}")
            return {'statusCode': 400, 'body': json.dumps({'error': 'Phone number not in allowlist'})}
        
        # Requirement 16.3-16.6: Check customer service window
        if not is_template:
            if not _is_within_service_window(contact):
                logger.warning(f"Outside 24-hour window: contactId={contact_id}")
                return {'statusCode': 400, 'body': json.dumps({'error': 'TEMPLATE_REQUIRED', 'message': 'Outside 24-hour customer service window'})}
        
        # Requirement 5.4: Validate text length
        if len(content) > MAX_TEXT_LENGTH:
            return {'statusCode': 400, 'body': json.dumps({'error': f'Content exceeds {MAX_TEXT_LENGTH} characters'})}
        
        # Requirement 5.3: DRY_RUN mode
        if SEND_MODE == 'DRY_RUN':
            logger.info(f"DRY_RUN: Would send to {contact.get('phone')}")
            return {'statusCode': 200, 'body': json.dumps({'messageId': 'dry-run-id', 'mode': 'DRY_RUN'})}
        
        # Requirement 5.2: LIVE mode - call API
        # TODO: Handle media upload (5.5, 5.6, 5.7)
        # TODO: Call SendWhatsAppMessage API (5.8)
        # TODO: Store message record (5.11)
        
        return {'statusCode': 200, 'body': json.dumps({'messageId': 'placeholder'})}
        
    except Exception as e:
        logger.error(f"Outbound error: {str(e)}")
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}


def _get_contact(contact_id: str) -> Optional[Dict]:
    """Retrieve contact from DynamoDB."""
    # TODO: Query DynamoDB
    return None


def _is_within_service_window(contact: Dict) -> bool:
    """Check if within 24-hour customer service window."""
    last_inbound = contact.get('lastInboundMessageAt')
    if not last_inbound:
        return False
    # Requirement 16.2: 24 hours from lastInboundMessageAt
    window_end = datetime.fromisoformat(last_inbound) + timedelta(hours=24)
    return datetime.utcnow() < window_end
