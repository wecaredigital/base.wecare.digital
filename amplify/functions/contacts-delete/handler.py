"""Contacts Delete - Soft delete contact. Requirements: 2.5"""
import os, json, logging
from datetime import datetime
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

def handler(event, context):
    contact_id = event.get('pathParameters', {}).get('contactId')
    if not contact_id:
        return {'statusCode': 400, 'body': json.dumps({'error': 'contactId required'})}
    # Requirement 2.5: Soft delete by setting deletedAt timestamp
    deleted_at = datetime.utcnow().isoformat()
    # TODO: DynamoDB UpdateItem to set deletedAt
    logger.info(f"Soft deleting contact: {contact_id}")
    return {'statusCode': 200, 'body': json.dumps({'contactId': contact_id, 'deletedAt': deleted_at})}
