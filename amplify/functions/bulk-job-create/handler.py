"""
Bulk Job Create Lambda Function

Purpose: Create and validate bulk message jobs
Requirements: 8.1, 8.2, 8.3, 13.10

Creates bulk job record, validates tier limits, chunks recipients,
and enqueues to bulk-queue SQS.
"""

import os
import json
import uuid
import time
import logging
import boto3
from typing import Dict, Any, List
from decimal import Decimal

# Configure logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

# AWS clients
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
sqs = boto3.client('sqs', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
BULK_JOBS_TABLE = os.environ.get('BULK_JOBS_TABLE', 'BulkJobs')
BULK_RECIPIENTS_TABLE = os.environ.get('BULK_RECIPIENTS_TABLE', 'BulkRecipients')
RATE_LIMIT_TABLE = os.environ.get('RATE_LIMIT_TABLE', 'RateLimitTrackers')
BULK_QUEUE_URL = os.environ.get('BULK_QUEUE_URL', '')

# Constants
CONFIRMATION_THRESHOLD = int(os.environ.get('BULK_CONFIRMATION_THRESHOLD', '20'))
CHUNK_SIZE = 100  # Requirement 8.3
WHATSAPP_TIER_LIMIT = 250  # Tier 1 default: 250 business-initiated conversations per 24 hours


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Create or list bulk message jobs.
    Requirements: 8.1, 8.2, 8.3, 13.10
    """
    request_id = context.aws_request_id if context else 'local'
    http_method = event.get('requestContext', {}).get('http', {}).get('method', 'POST')
    
    # Handle GET request - list all jobs
    if http_method == 'GET':
        return _list_jobs(event, request_id)
    
    logger.info(json.dumps({
        'event': 'bulk_job_create_start',
        'requestId': request_id
    }))
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        recipients = body.get('recipients', [])
        channel = body.get('channel', 'whatsapp').lower()
        content = body.get('content', '')
        template_name = body.get('templateName')
        template_params = body.get('templateParams', [])
        confirmed = body.get('confirmed', False)
        user_id = body.get('userId', 'unknown')
        
        if not recipients:
            return _error_response(400, 'recipients is required')
        
        if channel not in ['whatsapp', 'sms', 'email']:
            return _error_response(400, 'Invalid channel. Must be whatsapp, sms, or email')
        
        # Requirement 8.1: Confirmation gate for >20 recipients
        if len(recipients) > CONFIRMATION_THRESHOLD and not confirmed:
            logger.info(json.dumps({
                'event': 'confirmation_required',
                'recipientCount': len(recipients),
                'threshold': CONFIRMATION_THRESHOLD,
                'requestId': request_id
            }))
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
                },
                'body': json.dumps({
                    'error': 'CONFIRMATION_REQUIRED',
                    'message': f'Bulk job with {len(recipients)} recipients requires confirmation',
                    'recipientCount': len(recipients),
                    'threshold': CONFIRMATION_THRESHOLD
                })
            }
        
        # Requirement 13.10: Check WhatsApp tier limit
        if channel == 'whatsapp':
            current_usage = _get_tier_usage()
            if current_usage + len(recipients) > WHATSAPP_TIER_LIMIT:
                return _error_response(400, 
                    f'Would exceed WhatsApp tier limit. Current: {current_usage}, Requested: {len(recipients)}, Limit: {WHATSAPP_TIER_LIMIT}')
        
        # Generate job ID
        job_id = str(uuid.uuid4())
        now = int(time.time())
        
        # Requirement 8.2: Create job record
        job = {
            'jobId': job_id,
            'createdBy': user_id,
            'channel': channel,
            'content': content,
            'templateName': template_name,
            'templateParams': template_params,
            'totalRecipients': len(recipients),
            'sentCount': 0,
            'failedCount': 0,
            'pendingCount': len(recipients),
            'status': 'pending',
            'createdAt': Decimal(str(now)),
            'updatedAt': Decimal(str(now)),
        }
        
        # Store job in DynamoDB
        jobs_table = dynamodb.Table(BULK_JOBS_TABLE)
        jobs_table.put_item(Item=job)
        
        # Store recipients in BulkRecipients table
        _store_recipients(job_id, recipients)
        
        # Requirement 8.3: Chunk recipients and enqueue
        chunks = [recipients[i:i+CHUNK_SIZE] for i in range(0, len(recipients), CHUNK_SIZE)]
        
        for chunk_index, chunk in enumerate(chunks):
            _enqueue_chunk(job_id, chunk, channel, content, template_name, template_params, chunk_index)
        
        logger.info(json.dumps({
            'event': 'bulk_job_created',
            'jobId': job_id,
            'recipientCount': len(recipients),
            'chunkCount': len(chunks),
            'channel': channel,
            'requestId': request_id
        }))
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            'body': json.dumps({
                'jobId': job_id,
                'status': 'pending',
                'totalRecipients': len(recipients),
                'chunks': len(chunks),
                'channel': channel
            })
        }
        
    except json.JSONDecodeError:
        return _error_response(400, 'Invalid JSON in request body')
    except Exception as e:
        logger.error(json.dumps({
            'event': 'bulk_job_create_error',
            'error': str(e),
            'requestId': request_id
        }))
        return _error_response(500, 'Internal server error')


def _get_tier_usage() -> int:
    """Get current WhatsApp tier usage in 24-hour window."""
    try:
        rate_table = dynamodb.Table(RATE_LIMIT_TABLE)
        now = int(time.time())
        window_start = now - (24 * 60 * 60)  # 24 hours ago
        
        # Sum all WhatsApp messages in the window
        response = rate_table.scan(
            FilterExpression='begins_with(channel, :prefix) AND windowStart >= :start',
            ExpressionAttributeValues={
                ':prefix': 'whatsapp:',
                ':start': window_start
            }
        )
        
        total = sum(int(item.get('messageCount', 0)) for item in response.get('Items', []))
        return total
    except Exception:
        return 0


def _store_recipients(job_id: str, recipients: List[Dict]) -> None:
    """Store recipients in BulkRecipients table."""
    recipients_table = dynamodb.Table(BULK_RECIPIENTS_TABLE)
    
    with recipients_table.batch_writer() as batch:
        for i, recipient in enumerate(recipients):
            contact_id = recipient.get('contactId') if isinstance(recipient, dict) else recipient
            batch.put_item(Item={
                'jobId': job_id,
                'recipientId': str(i),
                'contactId': contact_id,
                'status': 'pending',
            })


def _enqueue_chunk(job_id: str, chunk: List, channel: str, content: str,
                   template_name: str, template_params: list, chunk_index: int) -> None:
    """Enqueue chunk to bulk-queue SQS."""
    if not BULK_QUEUE_URL:
        logger.warning("BULK_QUEUE_URL not configured")
        return
    
    message = {
        'jobId': job_id,
        'chunkIndex': chunk_index,
        'recipients': chunk,
        'channel': channel,
        'content': content,
        'templateName': template_name,
        'templateParams': template_params,
    }
    
    sqs.send_message(
        QueueUrl=BULK_QUEUE_URL,
        MessageBody=json.dumps(message, default=str),
        MessageGroupId=job_id if '.fifo' in BULK_QUEUE_URL else None,
        MessageDeduplicationId=f"{job_id}-{chunk_index}" if '.fifo' in BULK_QUEUE_URL else None
    )


def _error_response(status_code: int, message: str) -> Dict[str, Any]:
    """Return error response."""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps({'error': message})
    }


def _list_jobs(event: Dict[str, Any], request_id: str) -> Dict[str, Any]:
    """List all bulk jobs with optional channel filter."""
    try:
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        channel_filter = query_params.get('channel', '').lower()
        
        jobs_table = dynamodb.Table(BULK_JOBS_TABLE)
        
        # Scan all jobs (for small datasets; use GSI for production scale)
        response = jobs_table.scan()
        items = response.get('Items', [])
        
        # Handle pagination
        while 'LastEvaluatedKey' in response:
            response = jobs_table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response.get('Items', []))
        
        # Filter by channel if specified
        if channel_filter:
            items = [j for j in items if j.get('channel', '').lower() == channel_filter]
        
        # Convert Decimal to int/float for JSON serialization
        jobs = []
        for item in items:
            job = {
                'id': item.get('jobId'),
                'jobId': item.get('jobId'),
                'createdBy': item.get('createdBy', 'unknown'),
                'channel': item.get('channel', 'WHATSAPP').upper(),
                'totalRecipients': int(item.get('totalRecipients', 0)),
                'sentCount': int(item.get('sentCount', 0)),
                'failedCount': int(item.get('failedCount', 0)),
                'status': item.get('status', 'PENDING').upper(),
                'createdAt': str(item.get('createdAt', '')),
                'updatedAt': str(item.get('updatedAt', '')),
            }
            jobs.append(job)
        
        # Sort by createdAt descending
        jobs.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
        
        logger.info(json.dumps({
            'event': 'bulk_jobs_listed',
            'count': len(jobs),
            'channel': channel_filter or 'all',
            'requestId': request_id
        }))
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            'body': json.dumps({'jobs': jobs, 'count': len(jobs)})
        }
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'bulk_jobs_list_error',
            'error': str(e),
            'requestId': request_id
        }))
        return _error_response(500, 'Failed to list bulk jobs')
