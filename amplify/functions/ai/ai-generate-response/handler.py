"""
AI Generate Response Lambda Function

Purpose: Generate AI response using Bedrock Agent with Knowledge Base
Multi-language support handled by Bedrock Agent
Prompts managed in AWS Console - no code changes needed
"""

import os
import json
import logging
import boto3
import uuid
from typing import Dict, Any

# Configure logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

# AWS clients
bedrock_agent_runtime = boto3.client('bedrock-agent-runtime', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
SEND_MODE = os.environ.get('SEND_MODE', 'LIVE')
BEDROCK_AGENT_ID = os.environ.get('BEDROCK_AGENT_ID', 'HQNT0JXN8G')
BEDROCK_AGENT_ALIAS = os.environ.get('BEDROCK_AGENT_ALIAS', 'TSTALIASID')
BEDROCK_KB_ID = os.environ.get('BEDROCK_KB_ID', 'FZBPKGTOYE')


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Generate AI response using Bedrock Agent."""
    request_id = context.aws_request_id if context else 'local'
    
    logger.info(json.dumps({
        'event': 'ai_generate_start',
        'sendMode': SEND_MODE,
        'agentId': BEDROCK_AGENT_ID,
        'requestId': request_id
    }))
    
    if SEND_MODE == 'DRY_RUN':
        return {'statusCode': 200, 'body': json.dumps({'suggestion': '', 'mode': 'DRY_RUN'})}
    
    try:
        message_content = event.get('messageContent', '')
        message_id = event.get('messageId', '')
        contact_id = event.get('contactId', '')
        
        if not message_content:
            return {'statusCode': 200, 'body': json.dumps({'suggestion': ''})}
        
        # Generate response using Bedrock Agent
        suggestion = _invoke_bedrock_agent(message_content, request_id)
        
        logger.info(json.dumps({
            'event': 'ai_generate_complete',
            'messageId': message_id,
            'suggestionLength': len(suggestion) if suggestion else 0,
            'requestId': request_id
        }))
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'suggestion': suggestion,
                'messageId': message_id,
                'contactId': contact_id
            })
        }
        
    except Exception as e:
        logger.error(json.dumps({'event': 'ai_generate_error', 'error': str(e), 'requestId': request_id}))
        return {'statusCode': 200, 'body': json.dumps({'suggestion': _get_fallback_response(), 'error': str(e)})}


def _invoke_bedrock_agent(user_message: str, request_id: str) -> str:
    """Invoke Bedrock Agent with Knowledge Base for response generation."""
    try:
        # Generate unique session ID for conversation
        session_id = str(uuid.uuid4())
        
        logger.info(json.dumps({
            'event': 'bedrock_agent_invoke',
            'agentId': BEDROCK_AGENT_ID,
            'sessionId': session_id,
            'messageLength': len(user_message),
            'requestId': request_id
        }))
        
        # Invoke Bedrock Agent
        response = bedrock_agent_runtime.invoke_agent(
            agentId=BEDROCK_AGENT_ID,
            agentAliasId=BEDROCK_AGENT_ALIAS,
            sessionId=session_id,
            inputText=user_message,
            enableTrace=False
        )
        
        # Extract response from event stream
        completion = ""
        for event in response.get('completion', []):
            if 'chunk' in event:
                chunk_data = event['chunk']
                if 'bytes' in chunk_data:
                    completion += chunk_data['bytes'].decode('utf-8')
        
        if completion:
            logger.info(json.dumps({
                'event': 'bedrock_agent_success',
                'responseLength': len(completion),
                'requestId': request_id
            }))
            return completion.strip()
        
        # Fallback to Knowledge Base direct query if agent returns empty
        return _query_knowledge_base(user_message, request_id)
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'bedrock_agent_error',
            'error': str(e),
            'requestId': request_id
        }))
        # Fallback to Knowledge Base direct query
        return _query_knowledge_base(user_message, request_id)


def _query_knowledge_base(user_message: str, request_id: str) -> str:
    """Direct Knowledge Base query as fallback."""
    try:
        logger.info(json.dumps({
            'event': 'kb_query_start',
            'kbId': BEDROCK_KB_ID,
            'requestId': request_id
        }))
        
        response = bedrock_agent_runtime.retrieve_and_generate(
            input={'text': user_message},
            retrieveAndGenerateConfiguration={
                'type': 'KNOWLEDGE_BASE',
                'knowledgeBaseConfiguration': {
                    'knowledgeBaseId': BEDROCK_KB_ID,
                    'modelArn': f'arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-micro-v1:0',
                    'generationConfiguration': {
                        'promptTemplate': {
                            'textPromptTemplate': """You are WECARE.DIGITAL's friendly AI assistant.

INSTRUCTIONS:
- Answer in the SAME LANGUAGE as the user's question
- Keep responses SHORT (2-3 sentences max)
- Use 1-2 emojis for warmth
- Always mention the specific brand name
- End with a clear action (website, phone, or next step)

BRANDS:
- Travel/Hotels/Visa → BNB Club (bnbclub.in)
- Documents/Registration/GST → Legal Champ (legalchamp.in)
- Disputes/Complaints → No Fault (nofault.in)
- Puja/Rituals → Ritual Guru (ritualguru.in)
- Self-inquiry/Reflection → Swdhya (swdhya.in)

CONTACT: +91 9330994400 | one@wecare.digital

CONTEXT FROM KNOWLEDGE BASE:
$search_results$

USER QUESTION: $query$

Respond helpfully and end with a specific action."""
                        }
                    }
                }
            }
        )
        
        output = response.get('output', {}).get('text', '')
        
        if output:
            logger.info(json.dumps({
                'event': 'kb_query_success',
                'responseLength': len(output),
                'requestId': request_id
            }))
            return output.strip()
        
        return _get_fallback_response()
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'kb_query_error',
            'error': str(e),
            'requestId': request_id
        }))
        return _get_fallback_response()


def _get_fallback_response() -> str:
    """Return a friendly fallback response."""
    return "Hi! 👋 Thanks for reaching out to WECARE.DIGITAL. For quick help, call us at +91 9330994400 or email one@wecare.digital. We're here to help! 😊"
