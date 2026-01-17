"""Contacts Read - Retrieve contact details. Requirements: 2.3"""
import os, json, logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

def handler(event, context):
    contact_id = event.get('pathParameters', {}).get('contactId')
    if not contact_id:
        return {'statusCode': 400, 'body': json.dumps({'error': 'contactId required'})}
    # TODO: Query DynamoDB, filter soft-deleted (deletedAt is null)
    logger.info(f"Reading contact: {contact_id}")
    return {'statusCode': 200, 'body': json.dumps({'contactId': contact_id})}
