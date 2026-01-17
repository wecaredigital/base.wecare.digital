"""
Contacts Delete Lambda Function

Purpose: Soft delete contact
Requirements: 2.5

Performs soft delete by setting deletedAt timestamp.
Does not physically delete the record.
"""

import os
import json
import time
import logging
import boto3
from typing import Dict, Any
from decimal import Decimal
from boto3.dynamodb.conditions import Attr

# Configure logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

# DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
CONTACTS_TABLE = os.environ.get('CONTACTS_TABLE', 'Contacts')


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Soft delete contact by setting deletedAt timestamp.
    Requirement 2.5: Perform soft delete, do not physically delete record
    """
    request_id = context.aws_request_id if context else 'local'
    
    try:
        # Extract contactId from path parameters
        path_params = event.get('pathParameters', {}) or {}
        contact_id = path_params.get('contactId')
        
        if not contact_id:
            return _error_response(400, 'contactId is required')
        
        # Set deletedAt timestamp
        deleted_at = int(time.time())
        
        # Update in DynamoDB with condition that record exists and not already deleted
        table = dynamodb.Table(CONTACTS_TABLE)
        
        try:
            response = table.update_item(
                Key={'contactId': contact_id},
                UpdateExpression='SET #deletedAt = :deletedAt, #updatedAt = :updatedAt',
                ExpressionAttributeNames={
                    '#deletedAt': 'deletedAt',
                    '#updatedAt': 'updatedAt'
                },
                ExpressionAttributeValues={
                    ':deletedAt': Decimal(str(deleted_at)),
                    ':updatedAt': Decimal(str(deleted_at))
                },
                ConditionExpression=Attr('contactId').exists() & Attr('deletedAt').not_exists(),
                ReturnValues='ALL_NEW'
            )
        except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
            return _error_response(404, 'Contact not found or already deleted')
        
        logger.info(json.dumps({
            'event': 'contact_soft_deleted',
            'contactId': contact_id,
            'deletedAt': deleted_at,
            'requestId': request_id
        }))
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'contactId': contact_id,
                'deletedAt': deleted_at,
                'message': 'Contact soft deleted successfully'
            }),
        }
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'contact_delete_error',
            'error': str(e),
            'requestId': request_id
        }))
        return _error_response(500, 'Internal server error')


def _error_response(status_code: int, message: str) -> Dict[str, Any]:
    """Return error response."""
    return {
        'statusCode': status_code,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'error': message}),
    }
