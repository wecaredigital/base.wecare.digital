"""
AI Generate Response Lambda Function

Purpose: Generate AI response using Bedrock Agent with Knowledge Base
Language detection ensures responses match user's language
Prompts managed in AWS Console - no code changes needed
"""

import os
import json
import logging
import boto3
import uuid
import re
from typing import Dict, Any, Tuple

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
        
        # Detect user's language and create language-aware prompt
        detected_lang, lang_name = _detect_language(user_message)
        
        # Prepend language instruction to ensure consistent response language
        language_instruction = f"[RESPOND IN {lang_name.upper()} ONLY] "
        enhanced_message = language_instruction + user_message
        
        logger.info(json.dumps({
            'event': 'bedrock_agent_invoke',
            'agentId': BEDROCK_AGENT_ID,
            'sessionId': session_id,
            'messageLength': len(user_message),
            'detectedLanguage': lang_name,
            'requestId': request_id
        }))
        
        # Invoke Bedrock Agent
        response = bedrock_agent_runtime.invoke_agent(
            agentId=BEDROCK_AGENT_ID,
            agentAliasId=BEDROCK_AGENT_ALIAS,
            sessionId=session_id,
            inputText=enhanced_message,
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
                'detectedLanguage': lang_name,
                'requestId': request_id
            }))
            return completion.strip()
        
        # Fallback to Knowledge Base direct query if agent returns empty
        return _query_knowledge_base(user_message, detected_lang, lang_name, request_id)
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'bedrock_agent_error',
            'error': str(e),
            'requestId': request_id
        }))
        # Fallback to Knowledge Base direct query
        detected_lang, lang_name = _detect_language(user_message)
        return _query_knowledge_base(user_message, detected_lang, lang_name, request_id)


def _detect_language(text: str) -> Tuple[str, str]:
    """
    Detect language from text using character patterns.
    Returns (language_code, language_name) tuple.
    """
    if not text:
        return ('en', 'English')
    
    # Hindi/Devanagari script detection (U+0900 to U+097F)
    hindi_pattern = re.compile(r'[\u0900-\u097F]')
    if hindi_pattern.search(text):
        return ('hi', 'Hindi')
    
    # Bengali script detection (U+0980 to U+09FF)
    bengali_pattern = re.compile(r'[\u0980-\u09FF]')
    if bengali_pattern.search(text):
        return ('bn', 'Bengali')
    
    # Tamil script detection (U+0B80 to U+0BFF)
    tamil_pattern = re.compile(r'[\u0B80-\u0BFF]')
    if tamil_pattern.search(text):
        return ('ta', 'Tamil')
    
    # Telugu script detection (U+0C00 to U+0C7F)
    telugu_pattern = re.compile(r'[\u0C00-\u0C7F]')
    if telugu_pattern.search(text):
        return ('te', 'Telugu')
    
    # Gujarati script detection (U+0A80 to U+0AFF)
    gujarati_pattern = re.compile(r'[\u0A80-\u0AFF]')
    if gujarati_pattern.search(text):
        return ('gu', 'Gujarati')
    
    # Marathi uses Devanagari, check for common Marathi words
    marathi_words = ['आहे', 'काय', 'मला', 'तुम्ही', 'आम्ही']
    if any(word in text for word in marathi_words):
        return ('mr', 'Marathi')
    
    # Hinglish detection (Hindi words in Latin script)
    hinglish_words = ['kya', 'hai', 'kaise', 'mujhe', 'aap', 'hum', 'tum', 'kab', 'kahan', 'kyun', 'nahi', 'haan', 'theek', 'accha', 'bahut', 'acha']
    text_lower = text.lower()
    hinglish_count = sum(1 for word in hinglish_words if word in text_lower)
    if hinglish_count >= 2:
        return ('hi-Latn', 'Hinglish')
    
    # Default to English
    return ('en', 'English')


def _query_knowledge_base(user_message: str, detected_lang: str, lang_name: str, request_id: str) -> str:
    """Direct Knowledge Base query as fallback with language-aware prompt."""
    try:
        logger.info(json.dumps({
            'event': 'kb_query_start',
            'kbId': BEDROCK_KB_ID,
            'detectedLanguage': lang_name,
            'requestId': request_id
        }))
        
        # Language-specific prompt template
        prompt_template = f"""You are WECARE.DIGITAL's friendly AI assistant.

CRITICAL: You MUST respond ONLY in {lang_name}. Do not mix languages.

INSTRUCTIONS:
- Respond ONLY in {lang_name} language
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

USER QUESTION ({lang_name}): $query$

Respond helpfully in {lang_name} and end with a specific action."""
        
        response = bedrock_agent_runtime.retrieve_and_generate(
            input={'text': user_message},
            retrieveAndGenerateConfiguration={
                'type': 'KNOWLEDGE_BASE',
                'knowledgeBaseConfiguration': {
                    'knowledgeBaseId': BEDROCK_KB_ID,
                    'modelArn': f'arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-micro-v1:0',
                    'generationConfiguration': {
                        'promptTemplate': {
                            'textPromptTemplate': prompt_template
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
                'detectedLanguage': lang_name,
                'requestId': request_id
            }))
            return output.strip()
        
        return _get_fallback_response(lang_name)
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'kb_query_error',
            'error': str(e),
            'requestId': request_id
        }))
        return _get_fallback_response(lang_name)


def _get_fallback_response(lang_name: str = 'English') -> str:
    """Return a friendly fallback response in the detected language."""
    fallback_responses = {
        'Hindi': "नमस्ते! 👋 WECARE.DIGITAL से संपर्क करने के लिए धन्यवाद। त्वरित सहायता के लिए +91 9330994400 पर कॉल करें या one@wecare.digital पर ईमेल करें। 😊",
        'Bengali': "নমস্কার! 👋 WECARE.DIGITAL-এ যোগাযোগ করার জন্য ধন্যবাদ। দ্রুত সাহায্যের জন্য +91 9330994400-এ কল করুন বা one@wecare.digital-এ ইমেল করুন। 😊",
        'Hinglish': "Hi! 👋 WECARE.DIGITAL se contact karne ke liye thanks. Quick help ke liye +91 9330994400 pe call karein ya one@wecare.digital pe email karein. 😊",
        'Tamil': "வணக்கம்! 👋 WECARE.DIGITAL-ஐ தொடர்பு கொண்டதற்கு நன்றி। விரைவான உதவிக்கு +91 9330994400 அழைக்கவும் அல்லது one@wecare.digital மின்னஞ்சல் அனுப்பவும். 😊",
        'Telugu': "నమస్కారం! 👋 WECARE.DIGITAL ని సంప్రదించినందుకు ధన్యవాదాలు। త్వరిత సహాయం కోసం +91 9330994400 కు కాల్ చేయండి లేదా one@wecare.digital కు ఇమెయిల్ చేయండి. 😊",
        'Gujarati': "નમસ્તે! 👋 WECARE.DIGITAL નો સંપર્ક કરવા બદલ આભાર. ઝડપી મદદ માટે +91 9330994400 પર કૉલ કરો અથવા one@wecare.digital પર ઇમેઇલ કરો. 😊",
        'Marathi': "नमस्कार! 👋 WECARE.DIGITAL शी संपर्क साधल्याबद्दल धन्यवाद। जलद मदतीसाठी +91 9330994400 वर कॉल करा किंवा one@wecare.digital वर ईमेल करा. 😊",
    }
    
    return fallback_responses.get(lang_name, "Hi! 👋 Thanks for reaching out to WECARE.DIGITAL. For quick help, call us at +91 9330994400 or email one@wecare.digital. We're here to help! 😊")
