"""
AI Generate Response Lambda Function

Purpose: Generate AI response using Bedrock based on KB context
Uses Claude model to generate helpful responses for WhatsApp auto-reply
"""

import os
import json
import logging
import boto3
from typing import Dict, Any, Optional

# Configure logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

# AWS clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
SEND_MODE = os.environ.get('SEND_MODE', 'LIVE')
BEDROCK_MODEL_ID = os.environ.get('BEDROCK_MODEL_ID', 'amazon.nova-micro-v1:0')
BEDROCK_KB_ID = os.environ.get('BEDROCK_KB_ID', 'FZBPKGTOYE')


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Generate AI response based on user message and KB context.
    """
    request_id = context.aws_request_id if context else 'local'
    
    logger.info(json.dumps({
        'event': 'ai_generate_start',
        'sendMode': SEND_MODE,
        'requestId': request_id
    }))
    
    # DRY_RUN mode - return empty response
    if SEND_MODE == 'DRY_RUN':
        return {
            'statusCode': 200,
            'body': json.dumps({
                'suggestion': '',
                'mode': 'DRY_RUN'
            })
        }
    
    try:
        # Parse input
        message_content = event.get('messageContent', '')
        kb_context = event.get('kbContext', {})
        message_id = event.get('messageId', '')
        contact_id = event.get('contactId', '')
        
        if not message_content:
            return {
                'statusCode': 200,
                'body': json.dumps({'suggestion': ''})
            }
        
        # Extract KB results for context
        kb_results = kb_context.get('results', []) if kb_context else []
        context_text = ''
        if kb_results:
            context_text = '\n\n'.join([r.get('text', '')[:500] for r in kb_results[:3]])
        
        # Generate response using Bedrock Claude
        suggestion = _generate_with_bedrock(message_content, context_text, request_id)
        
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
        logger.error(json.dumps({
            'event': 'ai_generate_error',
            'error': str(e),
            'requestId': request_id
        }))
        return {
            'statusCode': 200,
            'body': json.dumps({'suggestion': '', 'error': str(e)})
        }


def _generate_with_bedrock(user_message: str, kb_context: str, request_id: str) -> str:
    """Generate response using Bedrock model."""
    try:
        # Comprehensive FAQ knowledge base
        faq_knowledge = """
FAQ KNOWLEDGE BASE:

ABOUT WECARE.DIGITAL:
- WECARE.DIGITAL is a digital ecosystem of microservice brands built for everyday Bharat
- Services: travel, documentation, dispute resolution, rituals, and reflection-led conversations
- Contact: +91 9330994400 | one@wecare.digital
- Location: The W.B.S.I.D.C. Building, Unit 1/20, 81/2/7 Phears Ln, Kolkata, West Bengal 700012, India
- Hours: Mon-Fri 9AM-6PM IST. Self-service available 24/7
- App available for iOS and Android

BRANDS:
- BNB Club: Travel stays, experiences, corporate (MICE) and independent travel (FIT), visas, tours
- EXPO WEEK: Digital travel expo for discovering destinations and curated experiences
- Legal Champ: Business documentation and registration support (not a law firm)
- No Fault: Online Dispute Resolution (ODR) platform for secure dispute workflows
- Ritual Guru: Temple-grade puja kits for festivals/vrats with worldwide delivery
- Swdhya: Reflection-led conversations for clarity and self-inquiry

SUPPORT:
- Submit Request: Use self-service portal, provide name/contact/summary, get reference ID
- Track Request: Use 'Request Tracking' with your reference ID or phone/email
- Amend Request: Use 'Request Amendment' with reference ID and changes needed
- Drop Docs: Secure document upload (zipped folders up to 10MB)
- Enterprise Assist: For enterprise customers with active cases (need SRN)

PAYMENTS:
- Methods: Internet banking, debit/credit cards, UPI
- Gift Cards: Instant eGift Cards available
- Refunds: Generally non-refundable, contact support for store credit options

GLOSSARY:
- SRN: Service Request Number (for enterprise cases)
- ODR: Online Dispute Resolution
- MICE: Meetings, Incentives, Conferences, Events (corporate travel)
- FIT: Free Independent Travelers (individual travel)
- RX Slot: Book/reschedule doctor appointments for Med Tour"""

        system_prompt = f"""You are WECARE Assistant on WhatsApp. Use this knowledge to answer:

{faq_knowledge}

RESPONSE RULES:
1. Match user question to FAQ and give the answer naturally
2. Keep responses SHORT (2-3 sentences max for WhatsApp)
3. Be warm and helpful, use simple language
4. For greetings: "Hi! 👋 Welcome to WECARE.DIGITAL. How can I help you today?"
5. Include contact info only when relevant
6. If unsure, suggest contacting support or using self-service portal"""

        user_content = f"""Customer asks: "{user_message}"

Additional context from KB: {kb_context if kb_context else 'None'}

Reply naturally:"""

        # Call Bedrock Nova
        response = bedrock_runtime.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                'inferenceConfig': {
                    'max_new_tokens': 150,
                    'temperature': 0.7,
                    'top_p': 0.9
                },
                'system': [{'text': system_prompt}],
                'messages': [
                    {'role': 'user', 'content': [{'text': user_content}]}
                ]
            })
        )
        
        response_body = json.loads(response['body'].read())
        suggestion = response_body.get('output', {}).get('message', {}).get('content', [{}])[0].get('text', '')
        
        # Clean up response
        suggestion = suggestion.strip()
        prefixes_to_remove = ['Here is', 'Here\'s', 'Response:', 'Reply:', 'Answer:', 'Sure!', 'Sure,']
        for prefix in prefixes_to_remove:
            if suggestion.lower().startswith(prefix.lower()):
                suggestion = suggestion[len(prefix):].strip()
                if suggestion.startswith(':'):
                    suggestion = suggestion[1:].strip()
        
        logger.info(json.dumps({
            'event': 'bedrock_response',
            'modelId': BEDROCK_MODEL_ID,
            'responseLength': len(suggestion),
            'requestId': request_id
        }))
        
        return suggestion
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'bedrock_error',
            'error': str(e),
            'requestId': request_id
        }))
        return "Hi! 👋 Thanks for reaching out to WECARE.DIGITAL. How can I help you today? Call +91 9330994400 or use our self-service portal for quick support."
