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

# Actual DynamoDB table names (not Amplify Gen 2 schema tables)
INBOUND_TABLE = os.environ.get('INBOUND_TABLE', 'base-wecare-digital-WhatsAppInboundTable')
OUTBOUND_TABLE = os.environ.get('OUTBOUND_TABLE', 'base-wecare-digital-WhatsAppOutboundTable')
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
    """Scan WhatsApp Inbound/Outbound tables and combine results."""
    all_messages = []
    
    try:
        # Determine which tables to scan based on direction filter
        tables_to_scan = []
        if direction == 'INBOUND':
            tables_to_scan = [(INBOUND_TABLE, 'inbound')]
        elif direction == 'OUTBOUND':
            tables_to_scan = [(OUTBOUND_TABLE, 'outbound')]
        else:
            # Scan both tables
            tables_to_scan = [(INBOUND_TABLE, 'inbound'), (OUTBOUND_TABLE, 'outbound')]
        
        for table_name, msg_direction in tables_to_scan:
            try:
                table = dynamodb.Table(table_name)
                scan_kwargs = {'Limit': limit}
                
                # Build filter for this table (exclude direction filter since we're scanning specific tables)
                table_filter_parts = [f for f in filter_parts if 'direction' not in f]
                table_expression_values = {k: v for k, v in expression_values.items() if k != ':dir'}
                
                if table_filter_parts:
                    scan_kwargs['FilterExpression'] = ' AND '.join(table_filter_parts)
                    scan_kwargs['ExpressionAttributeValues'] = table_expression_values
                
                response = table.scan(**scan_kwargs)
                items = response.get('Items', [])
                
                # Add direction and channel to each message
                for item in items:
                    item['direction'] = msg_direction
                    item['channel'] = 'whatsapp'
                
                all_messages.extend(items)
                logger.info(f"Scanned {len(items)} messages from {table_name}")
                
            except Exception as e:
                logger.error(f"Error scanning {table_name}: {str(e)}")
                continue
        
        return all_messages
        
    except Exception as e:
        logger.error(f"Error scanning messages: {str(e)}")
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
    
    # Generate pre-signed URL for media files
    if result.get('s3Key'):
        try:
            # Find actual file in S3 (may have different extension)
            s3_key = result['s3Key']
            prefix = s3_key.rsplit('.', 1)[0] if '.' in s3_key else s3_key
            
            # List objects with this prefix to find actual file
            response = s3_client.list_objects_v2(
                Bucket=MEDIA_BUCKET,
                Prefix=prefix,
                MaxKeys=1
            )
            
            if response.get('Contents'):
                actual_key = response['Contents'][0]['Key']
                presigned_url = s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': MEDIA_BUCKET, 'Key': actual_key},
                    ExpiresIn=PRESIGNED_URL_EXPIRY
                )
                result['mediaUrl'] = presigned_url
                result['s3Key'] = actual_key  # Update to actual key
        except Exception as e:
            logger.warning(f"Failed to generate presigned URL for {result.get('s3Key')}: {str(e)}")
    
    return result
