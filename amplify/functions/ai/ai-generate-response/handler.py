"""
AI Generate Response Lambda Function

Purpose: Generate AI response using Bedrock based on KB context
Multi-language support for Indian languages
Uses Amazon Nova Micro for fast, friendly responses
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
    """Generate AI response based on user message and KB context."""
    request_id = context.aws_request_id if context else 'local'
    
    logger.info(json.dumps({
        'event': 'ai_generate_start',
        'sendMode': SEND_MODE,
        'requestId': request_id
    }))
    
    if SEND_MODE == 'DRY_RUN':
        return {'statusCode': 200, 'body': json.dumps({'suggestion': '', 'mode': 'DRY_RUN'})}
    
    try:
        message_content = event.get('messageContent', '')
        kb_context = event.get('kbContext', {})
        message_id = event.get('messageId', '')
        contact_id = event.get('contactId', '')
        
        if not message_content:
            return {'statusCode': 200, 'body': json.dumps({'suggestion': ''})}
        
        # Extract KB results
        kb_results = kb_context.get('results', []) if kb_context else []
        context_text = '\n'.join([r.get('text', '')[:400] for r in kb_results[:3]]) if kb_results else ''
        
        # Generate response
        suggestion = _generate_friendly_response(message_content, context_text, request_id)
        
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
        return {'statusCode': 200, 'body': json.dumps({'suggestion': '', 'error': str(e)})}


def _generate_friendly_response(user_message: str, kb_context: str, request_id: str) -> str:
    """Generate a warm, friendly response with multi-language support."""
    try:
        detected_lang = _detect_language(user_message)
        
        # Friendly greetings in different languages
        greetings = {
            'hi': 'नमस्ते! 🙏',
            'bn': 'নমস্কার! 🙏',
            'ta': 'வணக்கம்! 🙏',
            'te': 'నమస్కారం! 🙏',
            'mr': 'नमस्कार! 🙏',
            'gu': 'નમસ્તે! 🙏',
            'kn': 'ನಮಸ್ಕಾರ! 🙏',
            'ml': 'നമസ്കാരം! 🙏',
            'pa': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! 🙏',
            'or': 'ନମସ୍କାର! 🙏',
            'en': 'Hi there! 👋'
        }
        
        greeting = greetings.get(detected_lang, greetings['en'])

        # Language instructions for natural responses
        lang_config = {
            'hi': {
                'name': 'Hindi',
                'instruction': 'जवाब हिंदी में दें। सरल और मिलनसार भाषा का प्रयोग करें।',
                'closing': 'और कुछ मदद चाहिए? 😊'
            },
            'bn': {
                'name': 'Bengali', 
                'instruction': 'বাংলায় উত্তর দিন। সহজ এবং বন্ধুত্বপূর্ণ ভাষা ব্যবহার করুন।',
                'closing': 'আর কিছু সাহায্য দরকার? 😊'
            },
            'ta': {
                'name': 'Tamil',
                'instruction': 'தமிழில் பதிலளிக்கவும். எளிய மற்றும் நட்பான மொழியைப் பயன்படுத்தவும்.',
                'closing': 'வேறு ஏதாவது உதவி வேண்டுமா? 😊'
            },
            'te': {
                'name': 'Telugu',
                'instruction': 'తెలుగులో సమాధానం ఇవ్వండి. సరళమైన మరియు స్నేహపూర్వక భాషను ఉపయోగించండి.',
                'closing': 'మరేదైనా సహాయం కావాలా? 😊'
            },
            'mr': {
                'name': 'Marathi',
                'instruction': 'मराठीत उत्तर द्या. सोपी आणि मैत्रीपूर्ण भाषा वापरा.',
                'closing': 'आणखी काही मदत हवी का? 😊'
            },
            'gu': {
                'name': 'Gujarati',
                'instruction': 'ગુજરાતીમાં જવાબ આપો. સરળ અને મૈત્રીપૂર્ણ ભાષાનો ઉપયોગ કરો.',
                'closing': 'બીજું કંઈ મદદ જોઈએ? 😊'
            },
            'kn': {
                'name': 'Kannada',
                'instruction': 'ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ. ಸರಳ ಮತ್ತು ಸ್ನೇಹಪರ ಭಾಷೆಯನ್ನು ಬಳಸಿ.',
                'closing': 'ಇನ್ನೇನಾದರೂ ಸಹಾಯ ಬೇಕೇ? 😊'
            },
            'ml': {
                'name': 'Malayalam',
                'instruction': 'മലയാളത്തിൽ മറുപടി നൽകുക. ലളിതവും സൗഹൃദപരവുമായ ഭാഷ ഉപയോഗിക്കുക.',
                'closing': 'മറ്റെന്തെങ്കിലും സഹായം വേണോ? 😊'
            },
            'pa': {
                'name': 'Punjabi',
                'instruction': 'ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ। ਸਰਲ ਅਤੇ ਦੋਸਤਾਨਾ ਭਾਸ਼ਾ ਵਰਤੋ।',
                'closing': 'ਹੋਰ ਕੋਈ ਮਦਦ ਚਾਹੀਦੀ ਹੈ? 😊'
            },
            'or': {
                'name': 'Odia',
                'instruction': 'ଓଡ଼ିଆରେ ଉତ୍ତର ଦିଅନ୍ତୁ। ସରଳ ଏବଂ ବନ୍ଧୁତ୍ୱପୂର୍ଣ୍ଣ ଭାଷା ବ୍ୟବହାର କରନ୍ତୁ।',
                'closing': 'ଆଉ କିଛି ସାହାଯ୍ୟ ଦରକାର? 😊'
            },
            'en': {
                'name': 'English',
                'instruction': 'Respond in English. Use simple, warm and friendly language.',
                'closing': 'Need anything else? 😊'
            }
        }
        
        lang = lang_config.get(detected_lang, lang_config['en'])

        # Comprehensive knowledge base with friendly tone
        knowledge = """
🏢 WECARE.DIGITAL - Your Digital Partner for Everyday Bharat!

We're here to make your life easier with these amazing services:

🌍 TRAVEL (BNB Club & EXPO WEEK):
- Book stays, tours, visas
- Corporate travel (MICE) & solo trips (FIT)
- Medical tourism with RX Slot appointments
- Discover destinations at EXPO WEEK digital expo

📋 DOCUMENTATION (Legal Champ):
- Business registrations & compliance
- Document preparation & filing
- Affordable, practical support (not legal advice)

⚖️ DISPUTE RESOLUTION (No Fault):
- Online Dispute Resolution (ODR) platform
- Secure, structured workflows
- Fair resolution process

🙏 RITUALS (Ritual Guru):
- Temple-grade puja kits
- Festival & vrat essentials
- Step-by-step guides included
- Worldwide delivery!

💭 SELF-INQUIRY (Swdhya):
- Reflection-led conversations
- Gain clarity & connection
- Personal growth support

📞 CONTACT US:
- Phone: +91 9330994400
- Email: one@wecare.digital
- Hours: Mon-Fri 9AM-6PM IST
- Self-service: Available 24/7!
- Location: Kolkata, West Bengal

💳 PAYMENTS:
- UPI, Cards, Net Banking accepted
- eGift Cards available
- Refunds as store credit (contact support)

🔧 QUICK HELP:
- New Request: Use self-service portal
- Track Status: Enter reference ID or phone
- Upload Docs: Use Drop Docs (max 10MB zip)
- Enterprise: Share your SRN for support"""

        # Build the friendly system prompt
        system_prompt = f"""You are WECARE.DIGITAL's friendly AI assistant! 🤖✨

{lang['instruction']}

YOUR PERSONALITY:
- Warm, helpful, and caring like a good friend
- Use emojis naturally (but not too many!)
- Keep responses short and clear (2-4 sentences max)
- Be positive and solution-oriented
- If you don't know something, say so kindly and suggest contacting support

KNOWLEDGE BASE:
{knowledge}

ADDITIONAL CONTEXT FROM KB:
{kb_context if kb_context else 'No additional context available.'}

RESPONSE RULES:
1. Answer in the SAME LANGUAGE as the user's question
2. Be concise - WhatsApp messages should be short!
3. Include relevant emojis for warmth
4. If asking about services, mention the specific brand
5. Always offer to help more at the end
6. For complex queries, suggest calling +91 9330994400"""

        # Build the user message with greeting context
        user_prompt = f"User message: {user_message}\n\nRespond warmly starting with appropriate greeting if this seems like a new conversation."

        # Call Amazon Nova Micro
        request_body = {
            "messages": [
                {"role": "user", "content": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}
            ],
            "inferenceConfig": {
                "maxTokens": 300,
                "temperature": 0.7,
                "topP": 0.9
            }
        }

        logger.info(json.dumps({
            'event': 'bedrock_invoke',
            'model': BEDROCK_MODEL_ID,
            'detectedLang': detected_lang,
            'requestId': request_id
        }))

        response = bedrock_runtime.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            contentType='application/json',
            accept='application/json',
            body=json.dumps(request_body)
        )

        response_body = json.loads(response['body'].read())
        
        # Extract text from Nova response
        if 'output' in response_body and 'message' in response_body['output']:
            content = response_body['output']['message'].get('content', [])
            if content and len(content) > 0:
                return content[0].get('text', '')
        
        # Fallback for different response formats
        if 'content' in response_body:
            content = response_body['content']
            if isinstance(content, list) and len(content) > 0:
                return content[0].get('text', '')
            elif isinstance(content, str):
                return content

        logger.warning(json.dumps({
            'event': 'unexpected_response_format',
            'response': str(response_body)[:500],
            'requestId': request_id
        }))
        
        return f"{greeting} Thanks for reaching out! How can I help you today? 😊"

    except Exception as e:
        logger.error(json.dumps({
            'event': 'generate_response_error',
            'error': str(e),
            'requestId': request_id
        }))
        return "Hi! 👋 Thanks for your message. I'm having a small hiccup right now. Please try again or call us at +91 9330994400 for immediate help! 😊"


def _detect_language(text: str) -> str:
    """Detect language from text using Unicode character ranges."""
    if not text:
        return 'en'
    
    # Count characters in different scripts
    script_counts = {
        'hi': 0,  # Devanagari (Hindi, Marathi, Sanskrit)
        'bn': 0,  # Bengali
        'ta': 0,  # Tamil
        'te': 0,  # Telugu
        'gu': 0,  # Gujarati
        'kn': 0,  # Kannada
        'ml': 0,  # Malayalam
        'pa': 0,  # Gurmukhi (Punjabi)
        'or': 0,  # Odia
        'en': 0   # Latin (English)
    }
    
    for char in text:
        code = ord(char)
        
        # Devanagari (Hindi, Marathi)
        if 0x0900 <= code <= 0x097F:
            script_counts['hi'] += 1
        # Bengali
        elif 0x0980 <= code <= 0x09FF:
            script_counts['bn'] += 1
        # Tamil
        elif 0x0B80 <= code <= 0x0BFF:
            script_counts['ta'] += 1
        # Telugu
        elif 0x0C00 <= code <= 0x0C7F:
            script_counts['te'] += 1
        # Gujarati
        elif 0x0A80 <= code <= 0x0AFF:
            script_counts['gu'] += 1
        # Kannada
        elif 0x0C80 <= code <= 0x0CFF:
            script_counts['kn'] += 1
        # Malayalam
        elif 0x0D00 <= code <= 0x0D7F:
            script_counts['ml'] += 1
        # Gurmukhi (Punjabi)
        elif 0x0A00 <= code <= 0x0A7F:
            script_counts['pa'] += 1
        # Odia
        elif 0x0B00 <= code <= 0x0B7F:
            script_counts['or'] += 1
        # Latin (English)
        elif 0x0041 <= code <= 0x007A:
            script_counts['en'] += 1
    
    # Find the dominant script
    max_count = 0
    detected = 'en'
    
    for lang, count in script_counts.items():
        if count > max_count:
            max_count = count
            detected = lang
    
    return detected
