"""
AI Generate Response Lambda Function

Purpose: Invoke Bedrock agent for response generation
Requirements: 15.2, 15.3, 15.7

Generates response suggestions using Bedrock Agent HQNT0JXN8G.
Runtime ID: base_bedrock_agentcore-1XHDxj2o3Q
Responses require operator approval before sending.
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

# AWS clients
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
bedrock_agent_runtime = boto3.client('bedrock-agent-runtime', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
SEND_MODE = os.environ.get('SEND_MODE', 'LIVE')
AI_INTERACTIONS_TABLE = os.environ.get('AI_INTERACTIONS_TABLE', 'AIInteractions')
BEDROCK_AGENT_ID = os.environ.get('BEDROCK_AGENT_ID', 'HQNT0JXN8G')
BEDROCK_AGENT_ALIAS_ID = os.environ.get('BEDROCK_AGENT_ALIAS_ID', 'TSTALIASID')
# Bedrock Agent Core Runtime ID for internal admin automation
BEDROCK_AGENTCORE_RUNTIME_ID = os.environ.get('BEDROCK_AGENTCORE_RUNTIME_ID', 'base_bedrock_agentcore-1XHDxj2o3Q')


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Generate AI response suggestion.
    Requirements: 15.2, 15.3, 15.7
    """
    request_id = context.aws_request_id if context else 'local'
    
    logger.info(json.dumps({
        'event': 'ai_generate_start',
        'sendMode': SEND_MODE,
        'requestId': request_id
    }))
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        message_content = body.get('messageContent', '')
        context_data = body.get('context', {})
        interaction_id = body.get('interactionId')
        contact_id = body.get('contactId')
        
        if not message_content:
            return _error_response(400, 'messageContent is required')
        
        # Generate new interaction ID if not provided
        if not interaction_id:
            interaction_id = str(uuid.uuid4())
        
        now = int(time.time())
        session_id = f"session-{contact_id or uuid.uuid4()}"
        
        # Build prompt with context
        prompt = _build_prompt(message_content, context_data)
        
        # Requirement 15.2: Invoke Bedrock Agent
        suggested_response = ''
        try:
            response = bedrock_agent_runtime.invoke_agent(
                agentId=BEDROCK_AGENT_ID,
                agentAliasId=BEDROCK_AGENT_ALIAS_ID,
                sessionId=session_id,
                inputText=prompt
            )
            
            # Stream response
            completion = ''
            for event_chunk in response.get('completion', []):
                chunk = event_chunk.get('chunk', {})
                if 'bytes' in chunk:
                    completion += chunk['bytes'].decode('utf-8')
            
            suggested_response = completion.strip()
            
        except Exception as e:
            logger.error(f"Bedrock Agent invoke error: {str(e)}")
            suggested_response = f"[AI generation failed: {str(e)}]"
        
        # Requirement 15.3: Store suggestion with approved=False (requires operator approval)
        suggestion = {
            'interactionId': interaction_id,
            'suggestedResponse': suggested_response,
            'approved': False,
            'requiresApproval': True,
            'contactId': contact_id,
            'originalMessage': message_content,
        }
        
        # Requirement 15.7: DRY_RUN prevents sending
        if SEND_MODE == 'DRY_RUN':
            suggestion['note'] = 'DRY_RUN mode - responses cannot be sent even if approved'
            suggestion['canSend'] = False
        else:
            suggestion['canSend'] = True
        
        # Update AIInteractions table
        ai_table = dynamodb.Table(AI_INTERACTIONS_TABLE)
        ai_table.update_item(
            Key={'interactionId': interaction_id},
            UpdateExpression='SET suggestedResponse = :response, approved = :approved, updatedAt = :now',
            ExpressionAttributeValues={
                ':response': suggested_response,
                ':approved': False,
                ':now': Decimal(str(now))
            }
        )
        
        logger.info(json.dumps({
            'event': 'ai_generate_complete',
            'interactionId': interaction_id,
            'responseLength': len(suggested_response),
            'sendMode': SEND_MODE,
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
            'body': json.dumps(suggestion)
        }
        
    except json.JSONDecodeError:
        return _error_response(400, 'Invalid JSON in request body')
    except Exception as e:
        logger.error(json.dumps({
            'event': 'ai_generate_error',
            'error': str(e),
            'requestId': request_id
        }))
        return _error_response(500, 'Internal server error')


def _build_prompt(message_content: str, context_data: Dict) -> str:
    """Build prompt with context for Bedrock Agent."""
    prompt_parts = [
        "You are a helpful customer service assistant for WECARE.DIGITAL.",
        "Generate a professional, friendly response to the following customer message.",
        "",
        f"Customer Message: {message_content}",
    ]
    
    if context_data:
        if context_data.get('contactName'):
            prompt_parts.append(f"Customer Name: {context_data['contactName']}")
        if context_data.get('previousMessages'):
            prompt_parts.append(f"Previous conversation context: {context_data['previousMessages']}")
        if context_data.get('kbResults'):
            prompt_parts.append(f"Relevant knowledge base information: {context_data['kbResults']}")
    
    prompt_parts.extend([
        "",
        "Please provide a helpful, concise response that addresses the customer's inquiry.",
        "Keep the response professional and friendly."
    ])
    
    return "\n".join(prompt_parts)


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
