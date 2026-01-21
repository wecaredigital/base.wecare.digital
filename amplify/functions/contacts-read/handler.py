"""
Contacts Read Lambda Function

Purpose: Retrieve contact details
Requirements: 2.3

Queries DynamoDB by contactId and filters out soft-deleted records.
"""

import os
import json
import logging
import boto3
from typing import Dict, Any
from decimal import Decimal

# Configure logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

# DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
CONTACTS_TABLE = os.environ.get('CONTACTS_TABLE', 'Contact')


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Retrieve contact by contactId.
    Requirement 2.3: Query DynamoDB, filter soft-deleted (deletedAt is null)
    """
    request_id = context.aws_request_id if context else 'local'
    
    try:
        # Extract contactId from path parameters
        path_params = event.get('pathParameters', {}) or {}
        contact_id = path_params.get('contactId')
        
        if not contact_id:
            return _error_response(400, 'contactId is required')
        
        # Query DynamoDB - table uses 'id' as primary key
        table = dynamodb.Table(CONTACTS_TABLE)
        response = table.get_item(Key={'id': contact_id})
        
        item = response.get('Item')
        
        if not item:
            logger.info(json.dumps({
                'event': 'contact_not_found',
                'contactId': contact_id,
                'requestId': request_id
            }))
            return _error_response(404, 'Contact not found')
        
        # Filter soft-deleted records
        if item.get('deletedAt') is not None:
            logger.info(json.dumps({
                'event': 'contact_deleted',
                'contactId': contact_id,
                'requestId': request_id
            }))
            return _error_response(404, 'Contact not found')
        
        logger.info(json.dumps({
            'event': 'contact_read',
            'contactId': contact_id,
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
            'body': json.dumps(_convert_from_dynamodb(item)),
        }
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'contact_read_error',
            'error': str(e),
            'requestId': request_id
        }))
        return _error_response(500, 'Internal server error')


def _convert_from_dynamodb(item: Dict[str, Any]) -> Dict[str, Any]:
    """Convert DynamoDB types to Python types."""
    result = {}
    for key, value in item.items():
        if isinstance(value, Decimal):
            result[key] = int(value) if value % 1 == 0 else float(value)
        else:
            result[key] = value
    return result


def _error_response(status_code: int, message: str) -> Dict[str, Any]:
    """Return error response."""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps({'error': message}),
    }
