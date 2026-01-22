"""
Messages Delete Lambda Handler
Deletes messages from WhatsAppInboundTable or WhatsAppOutboundTable
ONLY deletes messages - does NOT delete contacts
"""

import json
import os
import boto3
from botocore.exceptions import ClientError

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Table names - actual tables used by the system
INBOUND_TABLE = os.environ.get('INBOUND_TABLE', 'base-wecare-digital-WhatsAppInboundTable')
OUTBOUND_TABLE = os.environ.get('OUTBOUND_TABLE', 'base-wecare-digital-WhatsAppOutboundTable')

def handler(event, context):
    """
    Delete a message by ID from the appropriate table.
    ONLY deletes the message - does NOT affect contacts.
    """
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
        
        # Get direction from query params to determine which table
        query_params = event.get('queryStringParameters', {}) or {}
        direction = query_params.get('direction', 'INBOUND').upper()
        
        # Select table based on direction
        if direction == 'OUTBOUND':
            table_name = OUTBOUND_TABLE
        else:
            table_name = INBOUND_TABLE
        
        table = dynamodb.Table(table_name)
        
        # Delete the message using 'id' as the key (matches the table schema)
        try:
            table.delete_item(Key={'id': message_id})
            print(f"Deleted message {message_id} from {table_name}")
        except ClientError as e:
            # Try with 'messageId' key if 'id' fails
            if 'ValidationException' in str(e):
                table.delete_item(Key={'messageId': message_id})
                print(f"Deleted message {message_id} from {table_name} using messageId key")
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'messageId': message_id,
                'table': table_name,
                'message': 'Message deleted successfully (contact NOT affected)'
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
