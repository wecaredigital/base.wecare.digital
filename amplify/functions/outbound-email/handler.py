"""Outbound Email - Send email via SES. Requirements: 3.4, 7.2-7.7"""
import os, json, logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))
SEND_MODE = os.environ.get('SEND_MODE', 'DRY_RUN')
SES_SENDER = os.environ.get('SES_SENDER_EMAIL', 'one@wecare.digital')

def handler(event, context):
    body = json.loads(event.get('body', '{}'))
    contact_id = body.get('contactId')
    subject = body.get('subject', '')
    content = body.get('content', '')
    html_content = body.get('htmlContent')
    
    # Requirement 3.4: Validate email opt-in
    # TODO: Get contact and check optInEmail
    
    if SEND_MODE == 'DRY_RUN':
        logger.info(f"DRY_RUN: Would send email to contactId={contact_id}")
        return {'statusCode': 200, 'body': json.dumps({'messageId': 'dry-run-id', 'mode': 'DRY_RUN'})}
    
    # Requirement 7.2: LIVE mode - call SES
    # Requirement 7.4: Support plain text and HTML
    # TODO: Call SES SendEmail API
    return {'statusCode': 200, 'body': json.dumps({'messageId': 'placeholder'})}
