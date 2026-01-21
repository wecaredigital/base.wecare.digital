"""
Messages Delete Lambda Handler
Deletes messages from WhatsAppInboundTable or WhatsAppOutboundTable
"""

import json
import os
import boto3
from botocore.exceptions import ClientError

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')

# Table names from environment
MESSAGE_TABLE = os.environ.get('MESSAGE_TABLE', 'Message')

def handler(event, context):
    """Delete a message by ID"""
    print(f"Event: {json.dumps(event)}")
    
    # CORS headers
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
    }
    
    # Handle OPTIONS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    try:
        # Get message ID from path
        path_params = event.get('pathParameters', {}) or {}
        message_id = path_params.get('messageId')
        
        if not message_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'messageId is required'})
            }
        
        # Use Message table (unified for inbound/outbound)
        table = dynamodb.Table(MESSAGE_TABLE)
        
        # Delete the message
        table.delete_item(Key={'messageId': message_id})
        
        print(f"Deleted message {message_id} from {MESSAGE_TABLE}")
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'messageId': message_id,
                'message': 'Message deleted successfully'
            })
        }
        
    except ClientError as e:
        print(f"DynamoDB error: {e}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Database error: {str(e)}'})
        }
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
