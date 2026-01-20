"""
Outbound Voice Lambda Handler
Handles voice calls via AWS Pinpoint Voice and Airtel IQ

Supports:
- AWS Pinpoint Voice (Text-to-Speech via Polly)
- Airtel IQ Voice API (Click-to-Call, IVR)
"""

import json
import os
import boto3
import uuid
import time
import logging
from decimal import Decimal

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
pinpoint_voice = boto3.client('pinpoint-sms-voice-v2')
polly = boto3.client('polly')

# Environment variables
MESSAGES_TABLE = os.environ.get('MESSAGES_TABLE', 'base-wecare-digital-Messages')
VOICE_CALLS_TABLE = os.environ.get('VOICE_CALLS_TABLE', 'base-wecare-digital-VoiceCalls')
ORIGINATION_IDENTITY = os.environ.get('VOICE_ORIGINATION_IDENTITY', '')
AIRTEL_API_KEY = os.environ.get('AIRTEL_IQ_API_KEY', '')
AIRTEL_API_URL = os.environ.get('AIRTEL_IQ_API_URL', 'https://iqapi.airtel.in/gateway/airtel-xchange/basic/v1')

def lambda_handler(event, context):
    """Main handler for outbound voice calls"""
    logger.info(f"Event received: {json.dumps(event)}")
    
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
        voice_id = body.get('voiceId', 'Aditi')  # AWS Polly voice
        call_type = body.get('callType', 'tts')  # 'tts', 'audio', 'ivr'
        audio_url = body.get('audioUrl', '')
        
        if not phone_number and not contact_id:
            return response(400, {'error': 'phoneNumber or contactId required'})
        
        # Generate call ID
        call_id = str(uuid.uuid4())
        timestamp = int(time.time())
        
        if provider == 'aws':
            result = make_aws_voice_call(
                call_id=call_id,
                phone_number=phone_number,
                message_text=message_text,
                voice_id=voice_id,
                call_type=call_type,
                audio_url=audio_url
            )
        elif provider == 'airtel':
            result = make_airtel_voice_call(
                call_id=call_id,
                phone_number=phone_number,
                message_text=message_text,
                call_type=call_type,
                audio_url=audio_url
            )
        else:
            return response(400, {'error': f'Unknown provider: {provider}'})
        
        # Store call record
        store_call_record(
            call_id=call_id,
            contact_id=contact_id,
            phone_number=phone_number,
            provider=provider,
            call_type=call_type,
            status=result.get('status', 'initiated'),
            timestamp=timestamp
        )
        
        return response(200, {
            'callId': call_id,
            'status': result.get('status', 'initiated'),
            'provider': provider,
            'providerCallId': result.get('providerCallId')
        })
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return response(500, {'error': str(e)})


def make_aws_voice_call(call_id, phone_number, message_text, voice_id, call_type, audio_url):
    """Make voice call via AWS Pinpoint Voice"""
    try:
        if not ORIGINATION_IDENTITY:
            logger.warning("No VOICE_ORIGINATION_IDENTITY configured")
            return {'status': 'pending', 'message': 'Voice origination not configured'}
        
        # Generate SSML from text using Polly
        if call_type == 'tts' and message_text:
            ssml_content = f"""
            <speak>
                <prosody rate="medium">
                    {message_text}
                </prosody>
            </speak>
            """
            
            # Send voice message
            result = pinpoint_voice.send_voice_message(
                DestinationPhoneNumber=phone_number,
                OriginationIdentity=ORIGINATION_IDENTITY,
                MessageBody={
                    'SSMLMessage': {
                        'LanguageCode': 'en-IN',
                        'Text': ssml_content,
                        'VoiceId': voice_id
                    }
                },
                ConfigurationSetName='wecare-voice-config'
            )
            
            return {
                'status': 'sent',
                'providerCallId': result.get('MessageId')
            }
        
        return {'status': 'pending', 'message': 'Call type not supported yet'}
        
    except Exception as e:
        logger.error(f"AWS Voice error: {str(e)}")
        return {'status': 'failed', 'error': str(e)}


def make_airtel_voice_call(call_id, phone_number, message_text, call_type, audio_url):
    """Make voice call via Airtel IQ Voice API"""
    try:
        if not AIRTEL_API_KEY:
            logger.warning("No AIRTEL_IQ_API_KEY configured")
            return {'status': 'pending', 'message': 'Airtel IQ not configured'}
        
        import urllib.request
        
        # Airtel IQ Click-to-Call API
        if call_type == 'click_to_call':
            payload = {
                'destination': phone_number,
                'callerId': '',  # Configure caller ID
                'callType': 'outbound'
            }
            
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {AIRTEL_API_KEY}'
            }
            
            req = urllib.request.Request(
                f'{AIRTEL_API_URL}/voice/click-to-call',
                data=json.dumps(payload).encode('utf-8'),
                headers=headers,
                method='POST'
            )
            
            with urllib.request.urlopen(req, timeout=10) as resp:
                result = json.loads(resp.read().decode('utf-8'))
                return {
                    'status': 'initiated',
                    'providerCallId': result.get('callId')
                }
        
        # Voice broadcast with audio
        elif call_type == 'audio' and audio_url:
            payload = {
                'destination': phone_number,
                'audioUrl': audio_url,
                'callType': 'broadcast'
            }
            
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {AIRTEL_API_KEY}'
            }
            
            req = urllib.request.Request(
                f'{AIRTEL_API_URL}/voice/broadcast',
                data=json.dumps(payload).encode('utf-8'),
                headers=headers,
                method='POST'
            )
            
            with urllib.request.urlopen(req, timeout=10) as resp:
                result = json.loads(resp.read().decode('utf-8'))
                return {
                    'status': 'initiated',
                    'providerCallId': result.get('callId')
                }
        
        return {'status': 'pending', 'message': 'Call type not supported'}
        
    except Exception as e:
        logger.error(f"Airtel Voice error: {str(e)}")
        return {'status': 'failed', 'error': str(e)}


def store_call_record(call_id, contact_id, phone_number, provider, call_type, status, timestamp):
    """Store voice call record in DynamoDB"""
    try:
        table = dynamodb.Table(VOICE_CALLS_TABLE)
        
        item = {
            'id': call_id,
            'callId': call_id,
            'contactId': contact_id or '',
            'phoneNumber': phone_number,
            'provider': provider,
            'callType': call_type,
            'status': status,
            'direction': 'OUTBOUND',
            'createdAt': Decimal(str(timestamp)),
            'updatedAt': Decimal(str(timestamp)),
            'ttl': Decimal(str(timestamp + 90 * 24 * 60 * 60))  # 90 days TTL
        }
        
        table.put_item(Item=item)
        logger.info(f"Stored call record: {call_id}")
        
    except Exception as e:
        logger.error(f"Failed to store call record: {str(e)}")


def response(status_code, body):
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
