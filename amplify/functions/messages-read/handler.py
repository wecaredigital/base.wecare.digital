"""
Messages Read Lambda Function

Purpose: Read messages from WhatsAppInboundTable and WhatsAppOutboundTable
Returns combined inbound and outbound messages for dashboard/messaging views.
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
INBOUND_TABLE = os.environ.get('INBOUND_TABLE', 'base-wecare-digital-WhatsAppInboundTable')
OUTBOUND_TABLE = os.environ.get('OUTBOUND_TABLE', 'base-wecare-digital-WhatsAppOutboundTable')

# Pagination defaults
DEFAULT_LIMIT = 50
MAX_LIMIT = 100


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Read messages from DynamoDB tables.
    Supports filtering by contactId and channel.
    """
    request_id = context.aws_request_id if context else 'local'
    
    try:
        # Extract query parameters
        params = event.get('queryStringParameters', {}) or {}
        contact_id = params.get('contactId')
        channel = params.get('channel', '').upper()
        limit = min(int(params.get('limit', DEFAULT_LIMIT)), MAX_LIMIT)
        
        messages = []
        
        # Query inbound messages
        if not channel or channel == 'WHATSAPP':
            inbound = _scan_table(INBOUND_TABLE, contact_id, limit)
            for msg in inbound:
                msg['direction'] = 'INBOUND'
                msg['channel'] = 'WHATSAPP'
            messages.extend(inbound)
        
        # Query outbound messages
        if not channel or channel == 'WHATSAPP':
            outbound = _scan_table(OUTBOUND_TABLE, contact_id, limit)
            for msg in outbound:
                msg['direction'] = 'OUTBOUND'
                msg['channel'] = 'WHATSAPP'
            messages.extend(outbound)
        
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


def _scan_table(table_name: str, contact_id: str = None, limit: int = 50) -> List[Dict]:
    """Scan DynamoDB table with optional contact filter."""
    try:
        table = dynamodb.Table(table_name)
        
        scan_kwargs = {'Limit': limit * 2}
        
        if contact_id:
            scan_kwargs['FilterExpression'] = 'contactId = :cid'
            scan_kwargs['ExpressionAttributeValues'] = {':cid': contact_id}
        
        response = table.scan(**scan_kwargs)
        return response.get('Items', [])
        
    except Exception as e:
        logger.error(f"Error scanning {table_name}: {str(e)}")
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
    
    return result
