"""
AI Query KB Lambda Function

Purpose: Query Bedrock knowledge base for relevant information
Requirements: 15.1

Queries Bedrock Knowledge Base FZBPKGTOYE and returns relevant results.
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
bedrock_agent_runtime = boto3.client('bedrock-agent-runtime', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
AI_INTERACTIONS_TABLE = os.environ.get('AI_INTERACTIONS_TABLE', 'AIInteractions')
BEDROCK_KB_ID = os.environ.get('BEDROCK_KB_ID', 'FZBPKGTOYE')
BEDROCK_FOUNDATION_MODEL = os.environ.get('BEDROCK_FOUNDATION_MODEL', 'amazon.nova-pro-v1:0')


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Query Bedrock Knowledge Base.
    Requirement 15.1: Query Bedrock KB for relevant knowledge
    """
    request_id = context.aws_request_id if context else 'local'
    
    logger.info(json.dumps({
        'event': 'ai_kb_query_start',
        'requestId': request_id
    }))
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        query = body.get('query', '')
        message_id = body.get('messageId')
        contact_id = body.get('contactId')
        
        if not query:
            return _error_response(400, 'query is required')
        
        # Generate interaction ID
        interaction_id = str(uuid.uuid4())
        now = int(time.time())
        
        # Requirement 15.1: Call Bedrock RetrieveAndGenerate API
        try:
            response = bedrock_agent_runtime.retrieve_and_generate(
                input={'text': query},
                retrieveAndGenerateConfiguration={
                    'type': 'KNOWLEDGE_BASE',
                    'knowledgeBaseConfiguration': {
                        'knowledgeBaseId': BEDROCK_KB_ID,
                        'modelArn': f'arn:aws:bedrock:us-east-1::foundation-model/{BEDROCK_FOUNDATION_MODEL}'
                    }
                }
            )
            
            # Extract results
            output_text = response.get('output', {}).get('text', '')
            citations = response.get('citations', [])
            
            results = []
            for citation in citations:
                for ref in citation.get('retrievedReferences', []):
                    results.append({
                        'content': ref.get('content', {}).get('text', ''),
                        'location': ref.get('location', {}),
                        'score': ref.get('score', 0)
                    })
            
        except Exception as e:
            logger.error(f"Bedrock KB query error: {str(e)}")
            output_text = ''
            results = []
        
        # Store interaction in AIInteractions table
        interaction = {
            'interactionId': interaction_id,
            'messageId': message_id,
            'contactId': contact_id,
            'query': query,
            'response': output_text,
            'results': json.dumps(results),
            'approved': False,
            'timestamp': Decimal(str(now)),
        }
        
        ai_table = dynamodb.Table(AI_INTERACTIONS_TABLE)
        ai_table.put_item(Item={k: v for k, v in interaction.items() if v is not None})
        
        logger.info(json.dumps({
            'event': 'ai_kb_query_complete',
            'interactionId': interaction_id,
            'resultCount': len(results),
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
            'body': json.dumps({
                'interactionId': interaction_id,
                'response': output_text,
                'results': results,
                'resultCount': len(results)
            })
        }
        
    except json.JSONDecodeError:
        return _error_response(400, 'Invalid JSON in request body')
    except Exception as e:
        logger.error(json.dumps({
            'event': 'ai_kb_query_error',
            'error': str(e),
            'requestId': request_id
        }))
        return _error_response(500, 'Internal server error')


def _error_response(status_code: int, message: str) -> Dict[str, Any]:
    """Return error response with CORS headers."""
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
