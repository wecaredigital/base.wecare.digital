"""
Bulk Worker Lambda Function

Purpose: Process bulk message queue chunks
Requirements: 8.4, 8.5, 8.6, 8.8, 8.9

Processes SQS messages, validates recipients, sends messages,
updates progress, generates completion reports.
"""

import os
import json
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
s3 = boto3.client('s3', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
lambda_client = boto3.client('lambda', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
SEND_MODE = os.environ.get('SEND_MODE', 'DRY_RUN')
CONTACTS_TABLE = os.environ.get('CONTACTS_TABLE', 'Contacts')
BULK_JOBS_TABLE = os.environ.get('BULK_JOBS_TABLE', 'BulkJobs')
BULK_RECIPIENTS_TABLE = os.environ.get('BULK_RECIPIENTS_TABLE', 'BulkRecipients')
BULK_DLQ_URL = os.environ.get('BULK_DLQ_URL', '')
REPORT_BUCKET = os.environ.get('REPORT_BUCKET', 'stream.wecare.digital')
REPORT_PREFIX = os.environ.get('REPORT_PREFIX', 'base-wecare-digital/reports/')

# Outbound Lambda function names
OUTBOUND_FUNCTIONS = {
    'whatsapp': os.environ.get('OUTBOUND_WHATSAPP_FUNCTION', 'outbound-whatsapp'),
    'sms': os.environ.get('OUTBOUND_SMS_FUNCTION', 'outbound-sms'),
    'email': os.environ.get('OUTBOUND_EMAIL_FUNCTION', 'outbound-email'),
}


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Process SQS messages containing bulk job chunks.
    Requirements: 8.4, 8.5, 8.6, 8.8, 8.9
    """
    request_id = context.aws_request_id if context else 'local'
    
    for record in event.get('Records', []):
        try:
            body = json.loads(record.get('body', '{}'))
            job_id = body.get('jobId')
            chunk_index = body.get('chunkIndex', 0)
            recipients = body.get('recipients', [])
            channel = body.get('channel', 'whatsapp')
            content = body.get('content', '')
            template_name = body.get('templateName')
            template_params = body.get('templateParams', [])
            
            # Check if job is paused or cancelled
            job = _get_job(job_id)
            if not job or job.get('status') in ['paused', 'cancelled']:
                logger.info(json.dumps({
                    'event': 'chunk_skipped',
                    'jobId': job_id,
                    'reason': 'job_not_active',
                    'requestId': request_id
                }))
                continue
            
            logger.info(json.dumps({
                'event': 'chunk_processing_start',
                'jobId': job_id,
                'chunkIndex': chunk_index,
                'recipientCount': len(recipients),
                'requestId': request_id
            }))
            
            sent_count = 0
            failed_count = 0
            results = []
            
            # Requirement 8.5: Apply validation and send for each recipient
            for recipient in recipients:
                contact_id = recipient.get('contactId') if isinstance(recipient, dict) else recipient
                recipient_id = recipient.get('recipientId', contact_id)
                
                try:
                    # Get contact and validate
                    contact = _get_contact(contact_id)
                    if not contact:
                        _update_recipient_status(job_id, recipient_id, 'failed', 'Contact not found')
                        failed_count += 1
                        results.append({'contactId': contact_id, 'status': 'failed', 'error': 'Contact not found'})
                        continue
                    
                    # Validate opt-in based on channel
                    opt_in_field = f'optIn{channel.capitalize()}'
                    if not contact.get(opt_in_field):
                        _update_recipient_status(job_id, recipient_id, 'failed', 'Opt-in required')
                        failed_count += 1
                        results.append({'contactId': contact_id, 'status': 'failed', 'error': 'Opt-in required'})
                        continue
                    
                    # Send message via appropriate outbound function
                    success = _send_message(contact_id, channel, content, template_name, template_params)
                    
                    if success:
                        _update_recipient_status(job_id, recipient_id, 'sent')
                        sent_count += 1
                        results.append({'contactId': contact_id, 'status': 'sent'})
                    else:
                        _update_recipient_status(job_id, recipient_id, 'failed', 'Send failed')
                        failed_count += 1
                        results.append({'contactId': contact_id, 'status': 'failed', 'error': 'Send failed'})
                        
                except Exception as e:
                    logger.error(json.dumps({
                        'event': 'recipient_error',
                        'jobId': job_id,
                        'contactId': contact_id,
                        'error': str(e),
                        'requestId': request_id
                    }))
                    _update_recipient_status(job_id, recipient_id, 'failed', str(e))
                    failed_count += 1
                    results.append({'contactId': contact_id, 'status': 'failed', 'error': str(e)})
            
            # Requirement 8.6: Update job progress atomically
            _update_job_progress(job_id, sent_count, failed_count)
            
            logger.info(json.dumps({
                'event': 'chunk_processing_complete',
                'jobId': job_id,
                'chunkIndex': chunk_index,
                'sent': sent_count,
                'failed': failed_count,
                'requestId': request_id
            }))
            
            # Check if job is complete
            _check_job_completion(job_id, request_id)
            
        except Exception as e:
            logger.error(json.dumps({
                'event': 'chunk_processing_error',
                'error': str(e),
                'requestId': request_id
            }))
            # Requirement 8.9: Send to bulk-dlq on failure
            _send_to_dlq(record, str(e))
    
    return {'statusCode': 200}


def _get_job(job_id: str) -> Dict[str, Any]:
    """Get bulk job record."""
    try:
        jobs_table = dynamodb.Table(BULK_JOBS_TABLE)
        response = jobs_table.get_item(Key={'jobId': job_id})
        return response.get('Item', {})
    except Exception:
        return {}


def _get_contact(contact_id: str) -> Dict[str, Any]:
    """Get contact record."""
    try:
        contacts_table = dynamodb.Table(CONTACTS_TABLE)
        response = contacts_table.get_item(Key={'contactId': contact_id})
        item = response.get('Item')
        if item and item.get('deletedAt') is not None:
            return None
        return item
    except Exception:
        return None


def _send_message(contact_id: str, channel: str, content: str,
                  template_name: str, template_params: list) -> bool:
    """Send message via appropriate outbound Lambda."""
    try:
        function_name = OUTBOUND_FUNCTIONS.get(channel)
        if not function_name:
            return False
        
        payload = {
            'body': json.dumps({
                'contactId': contact_id,
                'content': content,
                'isTemplate': bool(template_name),
                'templateName': template_name,
                'templateParams': template_params,
            })
        }
        
        response = lambda_client.invoke(
            FunctionName=function_name,
            InvocationType='RequestResponse',
            Payload=json.dumps(payload)
        )
        
        result = json.loads(response['Payload'].read())
        return result.get('statusCode') == 200
        
    except Exception as e:
        logger.error(f"Send message error: {str(e)}")
        return False


def _update_recipient_status(job_id: str, recipient_id: str, status: str, error: str = None) -> None:
    """Update recipient status in BulkRecipients table."""
    try:
        recipients_table = dynamodb.Table(BULK_RECIPIENTS_TABLE)
        update_expr = 'SET #status = :status, updatedAt = :now'
        expr_values = {
            ':status': status,
            ':now': Decimal(str(int(time.time())))
        }
        
        if status == 'sent':
            update_expr += ', sentAt = :now'
        
        if error:
            update_expr += ', errorDetails = :error'
            expr_values[':error'] = error
        
        recipients_table.update_item(
            Key={'jobId': job_id, 'recipientId': str(recipient_id)},
            UpdateExpression=update_expr,
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues=expr_values
        )
    except Exception as e:
        logger.error(f"Update recipient status error: {str(e)}")


def _update_job_progress(job_id: str, sent: int, failed: int) -> None:
    """Update job progress atomically."""
    try:
        jobs_table = dynamodb.Table(BULK_JOBS_TABLE)
        jobs_table.update_item(
            Key={'jobId': job_id},
            UpdateExpression='SET sentCount = sentCount + :sent, failedCount = failedCount + :failed, pendingCount = pendingCount - :total, updatedAt = :now',
            ExpressionAttributeValues={
                ':sent': Decimal(str(sent)),
                ':failed': Decimal(str(failed)),
                ':total': Decimal(str(sent + failed)),
                ':now': Decimal(str(int(time.time())))
            }
        )
    except Exception as e:
        logger.error(f"Update job progress error: {str(e)}")


def _check_job_completion(job_id: str, request_id: str) -> None:
    """Check if job is complete and generate report."""
    try:
        job = _get_job(job_id)
        if not job:
            return
        
        pending = int(job.get('pendingCount', 0))
        if pending <= 0:
            # Job complete - update status and generate report
            jobs_table = dynamodb.Table(BULK_JOBS_TABLE)
            jobs_table.update_item(
                Key={'jobId': job_id},
                UpdateExpression='SET #status = :status, completedAt = :now',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':status': 'completed',
                    ':now': Decimal(str(int(time.time())))
                }
            )
            
            # Requirement 8.8: Generate completion report
            _generate_report(job_id, job, request_id)
            
    except Exception as e:
        logger.error(f"Check job completion error: {str(e)}")


def _generate_report(job_id: str, job: Dict, request_id: str) -> None:
    """Generate and store completion report in S3."""
    try:
        report = {
            'jobId': job_id,
            'channel': job.get('channel'),
            'totalRecipients': int(job.get('totalRecipients', 0)),
            'sentCount': int(job.get('sentCount', 0)),
            'failedCount': int(job.get('failedCount', 0)),
            'createdAt': str(job.get('createdAt')),
            'completedAt': int(time.time()),
            'createdBy': job.get('createdBy'),
        }
        
        # Get recipient details
        recipients_table = dynamodb.Table(BULK_RECIPIENTS_TABLE)
        response = recipients_table.query(
            KeyConditionExpression='jobId = :jid',
            ExpressionAttributeValues={':jid': job_id}
        )
        
        report['recipients'] = [
            {
                'contactId': r.get('contactId'),
                'status': r.get('status'),
                'error': r.get('errorDetails'),
            }
            for r in response.get('Items', [])
        ]
        
        # Store in S3
        report_key = f"{REPORT_PREFIX}{job_id}.json"
        s3.put_object(
            Bucket=REPORT_BUCKET,
            Key=report_key,
            Body=json.dumps(report, indent=2, default=str),
            ContentType='application/json'
        )
        
        # Update job with report location
        jobs_table = dynamodb.Table(BULK_JOBS_TABLE)
        jobs_table.update_item(
            Key={'jobId': job_id},
            UpdateExpression='SET reportS3Key = :key',
            ExpressionAttributeValues={':key': report_key}
        )
        
        logger.info(json.dumps({
            'event': 'report_generated',
            'jobId': job_id,
            'reportKey': report_key,
            'requestId': request_id
        }))
        
    except Exception as e:
        logger.error(f"Generate report error: {str(e)}")


def _send_to_dlq(record: Dict, error: str) -> None:
    """Send failed chunk to bulk-dlq."""
    if not BULK_DLQ_URL:
        return
    
    try:
        sqs.send_message(
            QueueUrl=BULK_DLQ_URL,
            MessageBody=json.dumps({
                'originalRecord': record,
                'error': error,
                'timestamp': int(time.time())
            }, default=str)
        )
    except Exception as e:
        logger.error(f"Send to DLQ error: {str(e)}")
