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
INBOUND_TABLE = os.environ.get('WHATSAPP_INBOUND_TABLE', 'base-wecare-digital-WhatsAppInboundTable')
OUTBOUND_TABLE = os.environ.get('WHATSAPP_OUTBOUND_TABLE', 'base-wecare-digital-WhatsAppOutboundTable')

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
        
        # Get direction from query params (to know which table)
        query_params = event.get('queryStringParameters', {}) or {}
        direction = query_params.get('direction', 'INBOUND').upper()
        
        # Select table based on direction
        table_name = OUTBOUND_TABLE if direction == 'OUTBOUND' else INBOUND_TABLE
        table = dynamodb.Table(table_name)
        
        # Delete the message
        table.delete_item(Key={'id': message_id})
        
        print(f"Deleted message {message_id} from {table_name}")
        
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
