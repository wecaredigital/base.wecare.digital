"""
Voice Calls Read Lambda Handler
Retrieves voice call records from DynamoDB
"""

import json
import os
import boto3
import logging
from boto3.dynamodb.conditions import Key, Attr

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
VOICE_CALLS_TABLE = os.environ.get('VOICE_CALLS_TABLE', 'base-wecare-digital-VoiceCalls')

def lambda_handler(event, context):
    """Main handler for reading voice calls"""
    logger.info(f"Event received: {json.dumps(event)}")
    
    try:
        # Get query parameters
        params = event.get('queryStringParameters') or {}
        contact_id = params.get('contactId')
        provider = params.get('provider')
        status = params.get('status')
        limit = int(params.get('limit', 100))
        
        # Get path parameters for single call lookup
        path_params = event.get('pathParameters') or {}
        call_id = path_params.get('callId')
        
        table = dynamodb.Table(VOICE_CALLS_TABLE)
        
        # Single call lookup
        if call_id:
            result = table.get_item(Key={'id': call_id})
            call = result.get('Item')
            if call:
                return response(200, {'call': normalize_call(call)})
            return response(404, {'error': 'Call not found'})
        
        # List calls with filters
        scan_kwargs = {'Limit': limit}
        filter_expressions = []
        
        if contact_id:
            filter_expressions.append(Attr('contactId').eq(contact_id))
        if provider:
            filter_expressions.append(Attr('provider').eq(provider))
        if status:
            filter_expressions.append(Attr('status').eq(status))
        
        if filter_expressions:
            combined_filter = filter_expressions[0]
            for expr in filter_expressions[1:]:
                combined_filter = combined_filter & expr
            scan_kwargs['FilterExpression'] = combined_filter
        
        result = table.scan(**scan_kwargs)
        calls = result.get('Items', [])
        
        # Sort by createdAt descending
        calls.sort(key=lambda x: float(x.get('createdAt', 0)), reverse=True)
        
        return response(200, {
            'calls': [normalize_call(c) for c in calls],
            'count': len(calls)
        })
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return response(500, {'error': str(e)})


def normalize_call(item):
    """Normalize call record for API response"""
    return {
        'id': item.get('id', ''),
        'callId': item.get('callId', ''),
        'contactId': item.get('contactId', ''),
        'phoneNumber': item.get('phoneNumber', ''),
        'provider': item.get('provider', ''),
        'callType': item.get('callType', ''),
        'status': item.get('status', ''),
        'direction': item.get('direction', 'OUTBOUND'),
        'duration': int(item.get('duration', 0)),
        'recordingUrl': item.get('recordingUrl', ''),
        'createdAt': int(float(item.get('createdAt', 0))),
        'updatedAt': int(float(item.get('updatedAt', 0))),
    }


def response(status_code, body):
    """Generate API Gateway response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps(body, default=str)
    }
