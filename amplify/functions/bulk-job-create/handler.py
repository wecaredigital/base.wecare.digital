"""Bulk Job Create - Create and validate bulk message jobs. Requirements: 8.1-8.3, 13.10"""
import os, json, uuid, logging
from datetime import datetime
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))
CONFIRMATION_THRESHOLD = int(os.environ.get('BULK_CONFIRMATION_THRESHOLD', 20))
CHUNK_SIZE = int(os.environ.get('BULK_CHUNK_SIZE', 100))

def handler(event, context):
    body = json.loads(event.get('body', '{}'))
    recipients = body.get('recipients', [])
    channel = body.get('channel', 'WHATSAPP')
    confirmed = body.get('confirmed', False)
    user_id = body.get('userId')
    
    # Requirement 8.1: Confirmation gate for >20 recipients
    if len(recipients) > CONFIRMATION_THRESHOLD and not confirmed:
        return {'statusCode': 400, 'body': json.dumps({
            'error': 'CONFIRMATION_REQUIRED',
            'message': f'Bulk job with {len(recipients)} recipients requires confirmation',
            'recipientCount': len(recipients)
        })}
    
    # Requirement 13.10: Check WhatsApp tier limit
    # TODO: Query RateLimitTrackers for tier limit check
    
    # Requirement 8.2: Create job record
    job_id = str(uuid.uuid4())
    job = {
        'jobId': job_id,
        'createdBy': user_id,
        'channel': channel,
        'totalRecipients': len(recipients),
        'sentCount': 0,
        'failedCount': 0,
        'status': 'PENDING',
        'createdAt': datetime.utcnow().isoformat(),
    }
    # TODO: Store in DynamoDB BulkJobs table
    
    # Requirement 8.3: Chunk recipients and enqueue
    chunks = [recipients[i:i+CHUNK_SIZE] for i in range(0, len(recipients), CHUNK_SIZE)]
    # TODO: Enqueue each chunk to bulk-queue SQS
    
    logger.info(f"Bulk job created: jobId={job_id}, recipients={len(recipients)}, chunks={len(chunks)}")
    return {'statusCode': 201, 'body': json.dumps(job)}
