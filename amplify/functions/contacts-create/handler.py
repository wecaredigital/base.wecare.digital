"""
Contacts Create Lambda Function

Purpose: Create new contact with opt-in defaults
Requirements: 2.1, 2.2, 2.3

Creates a new contact record with all opt-in flags set to False by default.
Requires at least one of phone or email to be provided.
"""

import os
import json
import uuid
import time
import logging
import boto3
from typing import Dict, Any
from decimal import Decimal

# Configure logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

# DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
CONTACTS_TABLE = os.environ.get('CONTACTS_TABLE', 'base-wecare-digital-ContactsTable')


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Create a new contact record.
    Requirement 2.1: Set all opt-in flags to False by default
    Requirement 2.2: Require at least one of phone or email
    Requirement 2.3: Store in DynamoDB with required attributes
    """
    request_id = context.aws_request_id if context else 'local'
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Requirement 2.2: Validate at least phone or email
        phone = body.get('phone', '').strip() if body.get('phone') else None
        email = body.get('email', '').strip().lower() if body.get('email') else None
        
        if not phone and not email:
            logger.warning(json.dumps({
                'event': 'contact_create_failed',
                'reason': 'phone_or_email_required',
                'requestId': request_id
            }))
            return _error_response(400, 'At least one of phone or email is required')
        
        # Validate phone format if provided
        if phone and not _validate_phone(phone):
            return _error_response(400, 'Invalid phone number format')
        
        # Validate email format if provided
        if email and not _validate_email(email):
            return _error_response(400, 'Invalid email format')
        
        # Generate contact ID and timestamps
        contact_id = str(uuid.uuid4())
        now = int(time.time())
        
        # Requirement 2.1: Create contact with opt-in defaults (all False)
        # Requirement 2.3: Store with required attributes
        # Note: Table uses 'id' as primary key
        contact = {
            'id': contact_id,  # Primary key
            'contactId': contact_id,  # Keep for backwards compatibility
            'name': body.get('name', '').strip(),
            'phone': phone,
            'email': email,
            'optInWhatsApp': False,
            'optInSms': False,
            'optInEmail': False,
            'allowlistWhatsApp': False,
            'allowlistSms': False,
            'allowlistEmail': False,
            'lastInboundMessageAt': None,
            'createdAt': now,
            'updatedAt': now,
            'deletedAt': None,
        }
        
        # Store in DynamoDB
        table = dynamodb.Table(CONTACTS_TABLE)
        table.put_item(Item=_convert_to_dynamodb(contact))
        
        logger.info(json.dumps({
            'event': 'contact_created',
            'contactId': contact_id,
            'hasPhone': bool(phone),
            'hasEmail': bool(email),
            'requestId': request_id
        }))
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(_convert_from_dynamodb(contact)),
        }
        
    except json.JSONDecodeError:
        return _error_response(400, 'Invalid JSON in request body')
    except Exception as e:
        logger.error(json.dumps({
            'event': 'contact_create_error',
            'error': str(e),
            'requestId': request_id
        }))
        return _error_response(500, 'Internal server error')


def _validate_phone(phone: str) -> bool:
    """Validate phone number format (basic validation)."""
    import re
    # Allow digits, spaces, dashes, parentheses, and + prefix
    pattern = r'^\+?[\d\s\-\(\)]{7,20}$'
    return bool(re.match(pattern, phone))


def _validate_email(email: str) -> bool:
    """Validate email format (basic validation)."""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def _convert_to_dynamodb(item: Dict[str, Any]) -> Dict[str, Any]:
    """Convert Python types to DynamoDB types."""
    result = {}
    for key, value in item.items():
        if value is None:
            continue  # Skip None values
        elif isinstance(value, bool):
            result[key] = value
        elif isinstance(value, (int, float)):
            result[key] = Decimal(str(value))
        else:
            result[key] = value
    return result


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
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'error': message}),
    }
