"""Outbound SMS - Send SMS via Pinpoint. Requirements: 3.3, 6.2-6.7"""
import os, json, logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))
SEND_MODE = os.environ.get('SEND_MODE', 'DRY_RUN')
SMS_POOL_ID = os.environ.get('SMS_POOL_ID')
MAX_SMS_LENGTH = 1600

def handler(event, context):
    body = json.loads(event.get('body', '{}'))
    contact_id = body.get('contactId')
    content = body.get('content', '')
    
    # Requirement 3.3: Validate SMS opt-in
    # TODO: Get contact and check optInSms
    
    # Requirement 6.4: Support up to 1600 chars with segmentation
    if len(content) > MAX_SMS_LENGTH:
        return {'statusCode': 400, 'body': json.dumps({'error': f'Content exceeds {MAX_SMS_LENGTH} characters'})}
    
    if SEND_MODE == 'DRY_RUN':
        logger.info(f"DRY_RUN: Would send SMS to contactId={contact_id}")
        return {'statusCode': 200, 'body': json.dumps({'messageId': 'dry-run-id', 'mode': 'DRY_RUN'})}
    
    # Requirement 6.2: LIVE mode - call Pinpoint SMS
    # TODO: Call Pinpoint SendMessages API
    return {'statusCode': 200, 'body': json.dumps({'messageId': 'placeholder'})}
