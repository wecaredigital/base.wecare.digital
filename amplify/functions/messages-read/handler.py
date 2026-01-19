"""
Messages Read Lambda Function

Purpose: Read messages from unified Messages table
Returns combined inbound and outbound messages for dashboard/messaging views.
Supports filtering by contactId, channel, and direction.
"""

import os
import json
import logging
import boto3
from typing import Dict, Any, List
from decimal import Decimal

# Configure logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

# DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
MESSAGES_TABLE = os.environ.get('MESSAGES_TABLE', 'Messages')

# Pagination defaults
DEFAULT_LIMIT = 50
MAX_LIMIT = 100


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Read messages from DynamoDB Messages table.
    Supports filtering by contactId, channel, and direction.
    """
    request_id = context.aws_request_id if context else 'local'
    
    try:
        # Extract query parameters
        params = event.get('queryStringParameters', {}) or {}
        contact_id = params.get('contactId')
        channel = params.get('channel', '').upper()
        direction = params.get('direction', '').upper()
        limit = min(int(params.get('limit', DEFAULT_LIMIT)), MAX_LIMIT)
        
        # Build filter expression
        filter_parts = []
        expression_values = {}
        
        if contact_id:
            filter_parts.append('contactId = :cid')
            expression_values[':cid'] = contact_id
        
        if channel and channel in ['WHATSAPP', 'SMS', 'EMAIL']:
            filter_parts.append('channel = :ch')
            expression_values[':ch'] = channel.lower()
        
        if direction and direction in ['INBOUND', 'OUTBOUND']:
            filter_parts.append('direction = :dir')
            expression_values[':dir'] = direction.lower()
        
        # Query messages
        messages = _scan_messages(filter_parts, expression_values, limit)
        
        # Sort by timestamp descending
        messages.sort(key=lambda x: x.get('timestamp', x.get('createdAt', 0)), reverse=True)
        
        # Limit results
        messages = messages[:limit]
        
        # Convert for JSON serialization
        messages = [_convert_from_dynamodb(m) for m in messages]
        
        logger.info(json.dumps({
            'event': 'messages_read',
            'count': len(messages),
            'contactId': contact_id,
            'channel': channel,
            'requestId': request_id
        }))
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            },
            'body': json.dumps({
                'messages': messages,
                'count': len(messages)
            }),
        }
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'messages_read_error',
            'error': str(e),
            'requestId': request_id
        }))
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Internal server error'}),
        }


def _scan_messages(filter_parts: List[str], expression_values: Dict, limit: int) -> List[Dict]:
    """Scan Messages table with filters."""
    try:
        table = dynamodb.Table(MESSAGES_TABLE)
        
        scan_kwargs = {'Limit': limit * 2}
        
        if filter_parts:
            scan_kwargs['FilterExpression'] = ' AND '.join(filter_parts)
            scan_kwargs['ExpressionAttributeValues'] = expression_values
        
        response = table.scan(**scan_kwargs)
        return response.get('Items', [])
        
    except Exception as e:
        logger.error(f"Error scanning Messages table: {str(e)}")
        return []


def _convert_from_dynamodb(item: Dict[str, Any]) -> Dict[str, Any]:
    """Convert DynamoDB types to Python types."""
    result = {}
    for key, value in item.items():
        if isinstance(value, Decimal):
            result[key] = int(value) if value % 1 == 0 else float(value)
        else:
            result[key] = value
    
    # Normalize field names for frontend
    if 'id' in result and 'messageId' not in result:
        result['messageId'] = result['id']
    
    # Normalize channel and direction to uppercase for frontend
    if 'channel' in result:
        result['channel'] = result['channel'].upper()
    if 'direction' in result:
        result['direction'] = result['direction'].upper()
    
    return result
