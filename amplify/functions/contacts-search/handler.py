"""
Contacts Search Lambda Function

Purpose: Search contacts by name, phone, or email
Requirements: 2.6

Performs case-insensitive search using DynamoDB Scan with FilterExpression.
Filters out soft-deleted records and supports pagination.
"""

import os
import json
import logging
import boto3
from typing import Dict, Any, Optional
from decimal import Decimal
from boto3.dynamodb.conditions import Attr

# Configure logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

# DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
CONTACTS_TABLE = os.environ.get('CONTACTS_TABLE', 'Contacts')

# Pagination defaults
DEFAULT_LIMIT = 20
MAX_LIMIT = 100


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Search contacts by name, phone, or email.
    Requirement 2.6: Case-insensitive search, filter soft-deleted, paginate results
    """
    request_id = context.aws_request_id if context else 'local'
    
    try:
        # Extract query parameters
        params = event.get('queryStringParameters', {}) or {}
        query = params.get('q', '').strip().lower()
        limit = min(int(params.get('limit', DEFAULT_LIMIT)), MAX_LIMIT)
        next_token = params.get('nextToken')
        
        # Build filter expression
        # Requirement 2.6: Case-insensitive search on name, phone, email
        # Filter out soft-deleted records (deletedAt is null)
        filter_expr = Attr('deletedAt').not_exists() | Attr('deletedAt').eq(None)
        
        if query:
            # Search in name, phone, and email (case-insensitive via lowercase comparison)
            search_filter = (
                Attr('nameLower').contains(query) |
                Attr('phone').contains(query) |
                Attr('emailLower').contains(query)
            )
            filter_expr = filter_expr & search_filter
        
        # Scan DynamoDB with filter
        table = dynamodb.Table(CONTACTS_TABLE)
        
        scan_kwargs = {
            'FilterExpression': filter_expr,
            'Limit': limit * 3,  # Over-fetch to account for filtering
        }
        
        if next_token:
            try:
                import base64
                exclusive_start_key = json.loads(base64.b64decode(next_token).decode('utf-8'))
                scan_kwargs['ExclusiveStartKey'] = exclusive_start_key
            except Exception:
                return _error_response(400, 'Invalid nextToken')
        
        response = table.scan(**scan_kwargs)
        
        items = response.get('Items', [])
        
        # Apply case-insensitive search manually if nameLower/emailLower not indexed
        if query:
            items = [
                item for item in items
                if _matches_query(item, query)
            ]
        
        # Limit results
        items = items[:limit]
        
        # Convert items
        contacts = [_convert_from_dynamodb(item) for item in items]
        
        # Build next token if more results
        result_next_token = None
        if response.get('LastEvaluatedKey'):
            import base64
            result_next_token = base64.b64encode(
                json.dumps(response['LastEvaluatedKey'], default=str).encode('utf-8')
            ).decode('utf-8')
        
        logger.info(json.dumps({
            'event': 'contacts_search',
            'query': query,
            'resultCount': len(contacts),
            'hasMore': bool(result_next_token),
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
                'contacts': contacts,
                'count': len(contacts),
                'nextToken': result_next_token
            }),
        }
        
    except ValueError:
        return _error_response(400, 'Invalid limit parameter')
    except Exception as e:
        logger.error(json.dumps({
            'event': 'contacts_search_error',
            'error': str(e),
            'requestId': request_id
        }))
        return _error_response(500, 'Internal server error')


def _matches_query(item: Dict[str, Any], query: str) -> bool:
    """Check if item matches search query (case-insensitive)."""
    name = str(item.get('name', '')).lower()
    phone = str(item.get('phone', '')).lower()
    email = str(item.get('email', '')).lower()
    
    return query in name or query in phone or query in email


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
            'Access-Control-Allow-Methods': 'GET,OPTIONS'
        },
        'body': json.dumps({'error': message}),
    }
