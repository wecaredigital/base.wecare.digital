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
import logging
from datetime import datetime
from typing import Dict, Any

# Configure logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Create a new contact record.
    
    Args:
        event: Lambda event containing contact data
        context: Lambda context
        
    Returns:
        Created contact record or error response
    """
    logger.info("Creating new contact")
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Validate required fields (at least phone or email)
        phone = body.get('phone')
        email = body.get('email')
        
        if not phone and not email:
            logger.warning("Contact creation failed: phone or email required")
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': 'At least one of phone or email is required',
                }),
            }
        
        # Generate contact ID
        contact_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        # Create contact record with opt-in defaults (all False)
        contact = {
            'contactId': contact_id,
            'name': body.get('name', ''),
            'phone': phone,
            'email': email,
            'optInWhatsApp': False,  # Requirement 2.1: Default to False
            'optInSms': False,       # Requirement 2.1: Default to False
            'optInEmail': False,     # Requirement 2.1: Default to False
            'lastInboundMessageAt': None,
            'createdAt': now,
            'updatedAt': now,
            'deletedAt': None,
        }
        
        # TODO: Store in DynamoDB Contacts table
        # dynamodb.put_item(TableName='Contacts', Item=contact)
        
        logger.info(f"Contact created: contactId={contact_id}")
        
        return {
            'statusCode': 201,
            'body': json.dumps(contact),
        }
        
    except Exception as e:
        logger.error(f"Contact creation error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
            }),
        }
