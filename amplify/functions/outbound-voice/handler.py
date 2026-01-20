"""
Outbound Voice Lambda Handler
Handles voice calls via AWS Pinpoint Voice/Polly and Airtel IQ

Supports:
- AWS Pinpoint Voice (Text-to-Speech via Polly)
- AWS Connect Outbound Calls
- Airtel IQ Voice API (Click-to-Call, IVR, Broadcast)
"""

import json
import os
import boto3
import uuid
import time
import logging
import re
from decimal import Decimal
from typing import Dict, Any, Optional

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
polly = boto3.client('polly')
s3 = boto3.client('s3')

# Environment variables
CONTACTS_TABLE = os.environ.get('CONTACTS_TABLE', 'base-wecare-digital-ContactsTable')
VOICE_CALLS_TABLE = os.environ.get('VOICE_CALLS_TABLE', 'base-wecare-digital-VoiceCalls')
AUDIO_BUCKET = os.environ.get('AUDIO_BUCKET', 'auth.wecare.digital')
AUDIO_PREFIX = os.environ.get('AUDIO_PREFIX', 'voice-audio/')

# AWS Voice Config
AWS_VOICE_ORIGINATION = os.environ.get('AWS_VOICE_ORIGINATION', '')
AWS_CONNECT_INSTANCE_ID = os.environ.get('AWS_CONNECT_INSTANCE_ID', '')
AWS_CONNECT_CONTACT_FLOW_ID = os.environ.get('AWS_CONNECT_CONTACT_FLOW_ID', '')
AWS_CONNECT_QUEUE_ID = os.environ.get('AWS_CONNECT_QUEUE_ID', '')

# Airtel IQ Config
AIRTEL_API_KEY = os.environ.get('AIRTEL_IQ_API_KEY', '')
AIRTEL_API_URL = os.environ.get('AIRTEL_IQ_API_URL', 'https://iqapi.airtel.in/gateway/airtel-xchange/basic/v1')
AIRTEL_CALLER_ID = os.environ.get('AIRTEL_CALLER_ID', '')

# Polly Voice Options (Indian English)
POLLY_VOICES = {
    'Aditi': {'engine': 'standard', 'language': 'hi-IN'},
    'Kajal': {'engine': 'neural', 'language': 'en-IN'},
    'Raveena': {'engine': 'standard', 'language': 'en-IN'},
    'Amy': {'engine': 'neural', 'language': 'en-GB'},
    'Joanna': {'engine': 'neural', 'language': 'en-US'},
}

# Constants
CALL_TTL_DAYS = 90


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Main handler for outbound voice calls"""
    request_id = context.aws_request_id if context else 'local'
    logger.info(json.dumps({'event': 'voice_call_start', 'requestId': request_id}))
    
    try:
        # Parse request body
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', event)
        
        provider = body.get('provider', 'aws')  # 'aws' or 'airtel'
        contact_id = body.get('contactId')
        phone_number = body.get('phoneNumber')
        message_text = body.get('messageText', '')
        voice_id = body.get('voiceId', 'Kajal')  # AWS Polly voice
        call_type = body.get('callType', 'tts')  # 'tts', 'audio', 'ivr', 'click_to_call'
        audio_url = body.get('audioUrl', '')
        
        # Get phone number from contact if not provided
        if not phone_number and contact_id:
            contact = _get_contact(contact_id)
            if contact:
                phone_number = contact.get('phone')
        
        if not phone_number:
            return _response(400, {'error': 'phoneNumber or valid contactId required'})
        
        # Normalize phone number
        phone_number = _normalize_phone(phone_number)
        
        # Generate call ID
        call_id = str(uuid.uuid4())
        timestamp = int(time.time())
        
        # Route to appropriate provider
        if provider == 'aws':
            result = _make_aws_voice_call(
                call_id=call_id,
                phone_number=phone_number,
                message_text=message_text,
                voice_id=voice_id,
                call_type=call_type,
                audio_url=audio_url,
                request_id=request_id
            )
        elif provider == 'airtel':
            result = _make_airtel_voice_call(
                call_id=call_id,
                phone_number=phone_number,
                message_text=message_text,
                call_type=call_type,
                audio_url=audio_url,
                request_id=request_id
            )
        else:
            return _response(400, {'error': f'Unknown provider: {provider}'})
        
        # Store call record
        _store_call_record(
            call_id=call_id,
            contact_id=contact_id,
            phone_number=phone_number,
            provider=provider,
            call_type=call_type,
            status=result.get('status', 'initiated'),
            message_text=message_text,
            voice_id=voice_id if provider == 'aws' else None,
            provider_call_id=result.get('providerCallId'),
            timestamp=timestamp
        )
        
        logger.info(json.dumps({
            'event': 'voice_call_initiated',
            'callId': call_id,
            'provider': provider,
            'status': result.get('status'),
            'requestId': request_id
        }))
        
        return _response(200, {
            'callId': call_id,
            'status': result.get('status', 'initiated'),
            'provider': provider,
            'providerCallId': result.get('providerCallId'),
            'message': result.get('message')
        })
        
    except json.JSONDecodeError:
        return _response(400, {'error': 'Invalid JSON in request body'})
    except Exception as e:
        logger.error(json.dumps({'event': 'voice_call_error', 'error': str(e), 'requestId': request_id}))
        return _response(500, {'error': str(e)})


def _make_aws_voice_call(call_id: str, phone_number: str, message_text: str,
                         voice_id: str, call_type: str, audio_url: str,
                         request_id: str) -> Dict[str, Any]:
    """
    Make voice call via AWS services.
    
    Supports:
    - TTS: Generate speech with Polly, store in S3, use for call
    - Audio: Use pre-recorded audio URL
    - Connect: Use AWS Connect for outbound dialing
    """
    try:
        # TTS call using Polly
        if call_type == 'tts' and message_text:
            return _make_polly_tts_call(call_id, phone_number, message_text, voice_id, request_id)
        
        # Pre-recorded audio call
        elif call_type == 'audio' and audio_url:
            return _make_audio_call(call_id, phone_number, audio_url, request_id)
        
        # AWS Connect outbound call
        elif call_type == 'connect':
            return _make_connect_call(call_id, phone_number, message_text, request_id)
        
        return {'status': 'pending', 'message': f'Call type "{call_type}" requires additional configuration'}
        
    except Exception as e:
        logger.error(json.dumps({'event': 'aws_voice_error', 'error': str(e), 'requestId': request_id}))
        return {'status': 'failed', 'error': str(e)}


def _make_polly_tts_call(call_id: str, phone_number: str, message_text: str,
                         voice_id: str, request_id: str) -> Dict[str, Any]:
    """Generate TTS audio with Polly and initiate call"""
    try:
        # Get voice configuration
        voice_config = POLLY_VOICES.get(voice_id, POLLY_VOICES['Kajal'])
        
        # Build SSML for natural speech
        ssml_text = f"""
        <speak>
            <prosody rate="medium" pitch="medium">
                {_escape_ssml(message_text)}
            </prosody>
            <break time="500ms"/>
            <prosody rate="medium">
                Thank you for listening. Goodbye.
            </prosody>
        </speak>
        """
        
        # Generate speech with Polly
        response = polly.synthesize_speech(
            Engine=voice_config['engine'],
            LanguageCode=voice_config['language'],
            OutputFormat='mp3',
            Text=ssml_text,
            TextType='ssml',
            VoiceId=voice_id
        )
        
        # Save audio to S3
        audio_key = f"{AUDIO_PREFIX}{call_id}.mp3"
        s3.put_object(
            Bucket=AUDIO_BUCKET,
            Key=audio_key,
            Body=response['AudioStream'].read(),
            ContentType='audio/mpeg'
        )
        
        audio_url = f"https://{AUDIO_BUCKET}.s3.amazonaws.com/{audio_key}"
        
        logger.info(json.dumps({
            'event': 'polly_audio_generated',
            'callId': call_id,
            'audioUrl': audio_url,
            'voiceId': voice_id,
            'requestId': request_id
        }))
        
        # If AWS Voice origination is configured, make the call
        if AWS_VOICE_ORIGINATION:
            try:
                pinpoint_voice = boto3.client('pinpoint-sms-voice-v2')
                
                result = pinpoint_voice.send_voice_message(
                    DestinationPhoneNumber=f'+{phone_number}',
                    OriginationIdentity=AWS_VOICE_ORIGINATION,
                    MessageBody={
                        'SSMLMessage': {
                            'LanguageCode': voice_config['language'],
                            'Text': ssml_text,
                            'VoiceId': voice_id
                        }
                    }
                )
                
                return {
                    'status': 'sent',
                    'providerCallId': result.get('MessageId'),
                    'audioUrl': audio_url
                }
            except Exception as e:
                logger.warning(f"Pinpoint voice send failed: {str(e)}")
        
        # Return success with audio URL (call can be made manually or via Connect)
        return {
            'status': 'audio_ready',
            'audioUrl': audio_url,
            'message': 'Audio generated. Configure AWS_VOICE_ORIGINATION for automatic calling.'
        }
        
    except Exception as e:
        logger.error(json.dumps({'event': 'polly_tts_error', 'error': str(e), 'requestId': request_id}))
        return {'status': 'failed', 'error': str(e)}


def _make_audio_call(call_id: str, phone_number: str, audio_url: str,
                     request_id: str) -> Dict[str, Any]:
    """Make call with pre-recorded audio"""
    try:
        if AWS_VOICE_ORIGINATION:
            pinpoint_voice = boto3.client('pinpoint-sms-voice-v2')
            
            # Note: Pinpoint Voice v2 doesn't support direct audio URL
            # Would need to use Connect or convert to SSML
            logger.info(json.dumps({
                'event': 'audio_call_pending',
                'callId': call_id,
                'audioUrl': audio_url,
                'requestId': request_id
            }))
            
            return {
                'status': 'pending',
                'audioUrl': audio_url,
                'message': 'Audio call requires AWS Connect integration'
            }
        
        return {
            'status': 'pending',
            'audioUrl': audio_url,
            'message': 'Configure AWS_VOICE_ORIGINATION for automatic calling'
        }
        
    except Exception as e:
        return {'status': 'failed', 'error': str(e)}


def _make_connect_call(call_id: str, phone_number: str, message_text: str,
                       request_id: str) -> Dict[str, Any]:
    """Make outbound call via AWS Connect"""
    try:
        if not AWS_CONNECT_INSTANCE_ID or not AWS_CONNECT_CONTACT_FLOW_ID:
            return {
                'status': 'pending',
                'message': 'AWS Connect not configured. Set AWS_CONNECT_INSTANCE_ID and AWS_CONNECT_CONTACT_FLOW_ID.'
            }
        
        connect = boto3.client('connect')
        
        # Start outbound voice contact
        response = connect.start_outbound_voice_contact(
            DestinationPhoneNumber=f'+{phone_number}',
            ContactFlowId=AWS_CONNECT_CONTACT_FLOW_ID,
            InstanceId=AWS_CONNECT_INSTANCE_ID,
            QueueId=AWS_CONNECT_QUEUE_ID if AWS_CONNECT_QUEUE_ID else None,
            Attributes={
                'message': message_text,
                'callId': call_id
            }
        )
        
        return {
            'status': 'initiated',
            'providerCallId': response.get('ContactId')
        }
        
    except Exception as e:
        logger.error(json.dumps({'event': 'connect_call_error', 'error': str(e), 'requestId': request_id}))
        return {'status': 'failed', 'error': str(e)}


def _make_airtel_voice_call(call_id: str, phone_number: str, message_text: str,
                            call_type: str, audio_url: str, request_id: str) -> Dict[str, Any]:
    """
    Make voice call via Airtel IQ Voice API.
    
    Supports:
    - click_to_call: Connect two parties
    - broadcast: Play audio to recipient
    - ivr: Interactive voice response
    """
    try:
        if not AIRTEL_API_KEY:
            return {'status': 'pending', 'message': 'Airtel IQ not configured. Set AIRTEL_IQ_API_KEY.'}
        
        import urllib.request
        import urllib.error
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {AIRTEL_API_KEY}'
        }
        
        # Click-to-Call
        if call_type == 'click_to_call':
            payload = {
                'destination': phone_number,
                'callerId': AIRTEL_CALLER_ID,
                'callType': 'outbound',
                'callbackUrl': ''  # Optional webhook for call status
            }
            
            req = urllib.request.Request(
                f'{AIRTEL_API_URL}/voice/click-to-call',
                data=json.dumps(payload).encode('utf-8'),
                headers=headers,
                method='POST'
            )
            
            with urllib.request.urlopen(req, timeout=15) as resp:
                result = json.loads(resp.read().decode('utf-8'))
                return {
                    'status': 'initiated',
                    'providerCallId': result.get('callId') or result.get('transactionId')
                }
        
        # Voice Broadcast with audio
        elif call_type == 'broadcast' or (call_type == 'audio' and audio_url):
            payload = {
                'destination': phone_number,
                'audioUrl': audio_url,
                'callerId': AIRTEL_CALLER_ID,
                'callType': 'broadcast'
            }
            
            req = urllib.request.Request(
                f'{AIRTEL_API_URL}/voice/broadcast',
                data=json.dumps(payload).encode('utf-8'),
                headers=headers,
                method='POST'
            )
            
            with urllib.request.urlopen(req, timeout=15) as resp:
                result = json.loads(resp.read().decode('utf-8'))
                return {
                    'status': 'initiated',
                    'providerCallId': result.get('callId') or result.get('transactionId')
                }
        
        # TTS via Airtel (if supported)
        elif call_type == 'tts' and message_text:
            payload = {
                'destination': phone_number,
                'message': message_text,
                'callerId': AIRTEL_CALLER_ID,
                'language': 'en-IN'
            }
            
            req = urllib.request.Request(
                f'{AIRTEL_API_URL}/voice/tts',
                data=json.dumps(payload).encode('utf-8'),
                headers=headers,
                method='POST'
            )
            
            try:
                with urllib.request.urlopen(req, timeout=15) as resp:
                    result = json.loads(resp.read().decode('utf-8'))
                    return {
                        'status': 'initiated',
                        'providerCallId': result.get('callId') or result.get('transactionId')
                    }
            except urllib.error.HTTPError as e:
                # TTS endpoint may not exist, fall back to broadcast
                logger.warning(f"Airtel TTS not available: {str(e)}")
                return {
                    'status': 'pending',
                    'message': 'Airtel TTS not available. Use audio broadcast instead.'
                }
        
        return {'status': 'pending', 'message': f'Call type "{call_type}" not supported for Airtel'}
        
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8') if e.fp else str(e)
        logger.error(json.dumps({'event': 'airtel_voice_error', 'error': error_body, 'requestId': request_id}))
        return {'status': 'failed', 'error': f'Airtel API error: {e.code}'}
    except Exception as e:
        logger.error(json.dumps({'event': 'airtel_voice_error', 'error': str(e), 'requestId': request_id}))
        return {'status': 'failed', 'error': str(e)}


def _get_contact(contact_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve contact from DynamoDB"""
    try:
        table = dynamodb.Table(CONTACTS_TABLE)
        response = table.get_item(Key={'id': contact_id})
        return response.get('Item')
    except Exception as e:
        logger.warning(f"Failed to get contact: {str(e)}")
        return None


def _normalize_phone(phone: str) -> str:
    """Normalize phone number to digits only with country code"""
    digits = ''.join(c for c in phone if c.isdigit())
    
    # Add India country code if 10 digits
    if len(digits) == 10 and digits[0] in '6789':
        digits = '91' + digits
    
    return digits


def _escape_ssml(text: str) -> str:
    """Escape special characters for SSML"""
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    text = text.replace('"', '&quot;')
    text = text.replace("'", '&apos;')
    return text


def _store_call_record(call_id: str, contact_id: Optional[str], phone_number: str,
                       provider: str, call_type: str, status: str,
                       message_text: str = None, voice_id: str = None,
                       provider_call_id: str = None, timestamp: int = None) -> None:
    """Store voice call record in DynamoDB"""
    try:
        table = dynamodb.Table(VOICE_CALLS_TABLE)
        timestamp = timestamp or int(time.time())
        
        item = {
            'id': call_id,
            'callId': call_id,
            'contactId': contact_id or '',
            'phoneNumber': phone_number,
            'provider': provider,
            'callType': call_type,
            'status': status,
            'direction': 'OUTBOUND',
            'messageText': message_text,
            'voiceId': voice_id,
            'providerCallId': provider_call_id,
            'duration': 0,
            'createdAt': Decimal(str(timestamp)),
            'updatedAt': Decimal(str(timestamp)),
            'ttl': Decimal(str(timestamp + CALL_TTL_DAYS * 24 * 60 * 60))
        }
        
        # Remove None values
        item = {k: v for k, v in item.items() if v is not None}
        
        table.put_item(Item=item)
        logger.info(f"Stored call record: {call_id}")
        
    except Exception as e:
        logger.error(f"Failed to store call record: {str(e)}")


def _response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """Generate API Gateway response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps(body, default=str)
    }
