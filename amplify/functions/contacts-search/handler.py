"""Contacts Search - Search contacts by name/phone/email. Requirements: 2.6"""
import os, json, logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

def handler(event, context):
    params = event.get('queryStringParameters', {}) or {}
    query = params.get('q', '').lower()
    limit = int(params.get('limit', 20))
    # Requirement 2.6: Case-insensitive search, filter soft-deleted
    # TODO: DynamoDB Scan with FilterExpression
    logger.info(f"Searching contacts: query={query}, limit={limit}")
    return {'statusCode': 200, 'body': json.dumps({'contacts': [], 'nextToken': None})}
