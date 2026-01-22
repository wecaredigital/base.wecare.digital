"""
Messages Read Lambda Function

Purpose: Read messages from WhatsApp Inbound/Outbound tables
Returns combined inbound and outbound messages for dashboard/messaging views.
Supports filtering by contactId, channel, and direction.
Generates pre-signed URLs for media files.

DynamoDB Tables (actual names):
- base-wecare-digital-WhatsAppInboundTable
- base-wecare-digital-WhatsAppOutboundTable
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
s3_client = boto3.client('s3', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# DynamoDB table names (Amplify Gen 2 schema)
# All messages (inbound/outbound) are stored in the Message table
MESSAGE_TABLE = os.environ.get('MESSAGE_TABLE', 'Message')
MEDIA_BUCKET = os.environ.get('MEDIA_BUCKET', 'auth.wecare.digital')

# Pagination defaults
DEFAULT_LIMIT = 50
MAX_LIMIT = 100
PRESIGNED_URL_EXPIRY = 3600  # 1 hour


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
        
        # Query messages from actual DynamoDB tables
        messages = _scan_messages(filter_parts, expression_values, limit, direction)
        
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


def _scan_messages(filter_parts: List[str], expression_values: Dict, limit: int, direction: str = '') -> List[Dict]:
    """Scan Message table and return results."""
    all_messages = []
    
    try:
        table = dynamodb.Table(MESSAGE_TABLE)
        scan_kwargs = {'Limit': limit}
        
        # Build filter expression
        if filter_parts:
            scan_kwargs['FilterExpression'] = ' AND '.join(filter_parts)
            scan_kwargs['ExpressionAttributeValues'] = expression_values
        
        response = table.scan(**scan_kwargs)
        items = response.get('Items', [])
        
        # Log sample data for debugging
        sample_items = []
        for item in items[:3]:
            sample_items.append({
                'id': item.get('id'),
                'contactId': item.get('contactId'),
                'direction': item.get('direction'),
                'channel': item.get('channel'),
                'timestamp': item.get('timestamp')
            })
        
        logger.info(json.dumps({
            'event': 'messages_scanned',
            'count': len(items),
            'table': MESSAGE_TABLE,
            'filterParts': filter_parts,
            'sampleItems': sample_items
        }))
        
        return items
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'scan_messages_error',
            'error': str(e),
            'table': MESSAGE_TABLE
        }))
        return []


def _convert_from_dynamodb(item: Dict[str, Any]) -> Dict[str, Any]:
    """Convert DynamoDB types to Python types and generate pre-signed URLs for media."""
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
    
    # Ensure sender name is included for inbound messages
    if result.get('direction') == 'INBOUND' and 'senderName' not in result:
        result['senderName'] = result.get('senderPhone', 'Unknown')
    
    # Ensure messageType is included
    if 'messageType' not in result:
        result['messageType'] = 'text'
    
    # Generate pre-signed URL for media files if s3Key exists
    if result.get('s3Key') and result.get('mediaId'):
        try:
            s3_key = result['s3Key']
            media_id = result.get('mediaId')
            
            logger.info(json.dumps({
                'event': 'generating_presigned_url',
                's3Key': s3_key,
                'mediaId': media_id,
                'bucket': MEDIA_BUCKET,
                'messageId': result.get('messageId')
            }))
            
            # Generate pre-signed URL for the S3 key
            presigned_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': MEDIA_BUCKET, 'Key': s3_key},
                ExpiresIn=PRESIGNED_URL_EXPIRY
            )
            result['mediaUrl'] = presigned_url
            
            logger.info(json.dumps({
                'event': 'presigned_url_generated',
                's3Key': s3_key,
                'mediaId': media_id,
                'messageId': result.get('messageId'),
                'urlLength': len(presigned_url)
            }))
            
        except Exception as e:
            logger.error(json.dumps({
                'event': 'presigned_url_generation_failed',
                's3Key': result.get('s3Key'),
                'mediaId': result.get('mediaId'),
                'messageId': result.get('messageId'),
                'error': str(e),
                'errorType': type(e).__name__
            }))
            # Don't set mediaUrl if generation fails - frontend will handle missing URL
            result['mediaUrl'] = None
    
    return result
