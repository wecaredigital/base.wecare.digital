"""
WABA Management Lambda Function

Purpose: Manage WhatsApp Business Accounts via AWS EUM Social API
Implements:
- GetLinkedWhatsAppBusinessAccount - Get WABA details (phone quality, limits)
- GetLinkedWhatsAppBusinessAccountPhoneNumber - Get phone details
- ListLinkedWhatsAppBusinessAccounts - List all WABAs
- DeleteWhatsAppMessageMedia - Delete uploaded media

AWS EUM Social API Reference:
https://docs.aws.amazon.com/social-messaging/latest/APIReference/Welcome.html
"""

import os
import json
import logging
import boto3
from typing import Dict, Any, List, Optional
from decimal import Decimal
from datetime import datetime

# Configure logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

# AWS clients
social_messaging = boto3.client('socialmessaging', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
SYSTEM_CONFIG_TABLE = os.environ.get('SYSTEM_CONFIG_TABLE', 'base-wecare-digital-SystemConfigTable')

# CORS headers
CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
}


def _serialize_value(val):
    """Convert datetime and other non-JSON-serializable types to strings."""
    if isinstance(val, datetime):
        return val.isoformat()
    if isinstance(val, Decimal):
        return float(val)
    return val


def _serialize_dict(d: Dict) -> Dict:
    """Recursively serialize a dictionary for JSON."""
    result = {}
    for k, v in d.items():
        if isinstance(v, dict):
            result[k] = _serialize_dict(v)
        elif isinstance(v, list):
            result[k] = [_serialize_dict(i) if isinstance(i, dict) else _serialize_value(i) for i in v]
        else:
            result[k] = _serialize_value(v)
    return result


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    WABA Management API Handler
    
    Routes:
    - GET /waba - List all linked WABAs
    - GET /waba/{wabaId} - Get WABA details
    - GET /waba/phone/{phoneNumberId} - Get phone number details
    - GET /waba/events - Get system events (template status, phone quality, account updates)
    - DELETE /waba/media/{mediaId} - Delete WhatsApp media
    """
    request_id = context.aws_request_id if context else 'local'
    
    # Handle both API Gateway v1 (REST) and v2 (HTTP) event formats
    request_context = event.get('requestContext', {})
    
    # API Gateway v2 (HTTP API) format
    if 'http' in request_context:
        http_method = request_context.get('http', {}).get('method', 'GET')
        path = request_context.get('http', {}).get('path', '')
    else:
        # API Gateway v1 (REST API) format
        http_method = event.get('httpMethod', 'GET')
        path = event.get('path', '')
    
    # Also check rawPath for HTTP API
    if not path:
        path = event.get('rawPath', '')
    
    path_params = event.get('pathParameters') or {}
    query_params = event.get('queryStringParameters') or {}
    
    logger.info(json.dumps({
        'event': 'waba_management_request',
        'method': http_method,
        'path': path,
        'pathParams': path_params,
        'queryParams': query_params,
        'requestId': request_id
    }))
    
    # Handle OPTIONS preflight
    if http_method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}
    
    try:
        # Route handling
        if http_method == 'GET':
            if '/waba/events' in path:
                return _get_system_events(query_params, request_id)
            elif '/waba/phone/' in path:
                phone_id = path_params.get('phoneNumberId') or path.split('/phone/')[-1]
                return _get_phone_number_details(phone_id, request_id)
            elif path_params.get('wabaId') or '/waba/' in path:
                waba_id = path_params.get('wabaId') or path.split('/waba/')[-1].split('/')[0]
                if waba_id and waba_id != 'waba':
                    return _get_waba_details(waba_id, request_id)
            # Default: list all WABAs
            return _list_wabas(request_id)
        
        elif http_method == 'DELETE':
            if '/waba/media/' in path:
                media_id = path_params.get('mediaId') or path.split('/media/')[-1]
                phone_id = query_params.get('phoneNumberId', '')
                return _delete_media(media_id, phone_id, request_id)
        
        return _error_response(400, 'Invalid request')
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'waba_management_error',
            'error': str(e),
            'errorType': type(e).__name__,
            'requestId': request_id
        }))
        return _error_response(500, str(e))


def _list_wabas(request_id: str) -> Dict[str, Any]:
    """
    List all linked WhatsApp Business Accounts.
    API: ListLinkedWhatsAppBusinessAccounts
    """
    try:
        wabas = []
        next_token = None
        
        while True:
            params = {}
            if next_token:
                params['nextToken'] = next_token
            
            response = social_messaging.list_linked_whatsapp_business_accounts(**params)
            
            for account in response.get('linkedAccounts', []):
                link_date = account.get('linkDate')
                wabas.append({
                    'id': account.get('id', ''),
                    'wabaId': account.get('wabaId', ''),
                    'wabaName': account.get('wabaName', ''),
                    'arn': account.get('arn', ''),
                    'registrationStatus': account.get('registrationStatus', ''),
                    'linkDate': link_date.isoformat() if isinstance(link_date, datetime) else link_date,
                    'enableSending': account.get('enableSending', False),
                    'enableReceiving': account.get('enableReceiving', False),
                    'eventDestinations': account.get('eventDestinations', [])
                })
            
            next_token = response.get('nextToken')
            if not next_token:
                break
        
        logger.info(json.dumps({
            'event': 'wabas_listed',
            'count': len(wabas),
            'requestId': request_id
        }))
        
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'wabas': wabas,
                'count': len(wabas)
            })
        }
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'list_wabas_error',
            'error': str(e),
            'requestId': request_id
        }))
        return _error_response(500, f'Failed to list WABAs: {str(e)}')


def _get_waba_details(waba_id: str, request_id: str) -> Dict[str, Any]:
    """
    Get details of a specific WABA including phone numbers with quality ratings.
    API: GetLinkedWhatsAppBusinessAccount
    
    Returns:
    - WABA info (name, status, event destinations)
    - Phone numbers with quality ratings (GREEN/YELLOW/RED)
    - Messaging limits
    """
    try:
        # Ensure waba_id has correct format
        if not waba_id.startswith('waba-'):
            waba_id = f'waba-{waba_id}'
        
        response = social_messaging.get_linked_whatsapp_business_account(id=waba_id)
        account = response.get('account', {})
        
        # Process phone numbers with quality info
        phone_numbers = []
        for phone in account.get('phoneNumbers', []):
            phone_numbers.append({
                'phoneNumberId': phone.get('phoneNumberId', ''),
                'phoneNumber': phone.get('phoneNumber', ''),
                'displayPhoneNumber': phone.get('displayPhoneNumber', ''),
                'displayPhoneNumberName': phone.get('displayPhoneNumberName', ''),
                'qualityRating': phone.get('qualityRating', 'UNKNOWN'),
                'metaPhoneNumberId': phone.get('metaPhoneNumberId', ''),
                'dataLocalizationRegion': phone.get('dataLocalizationRegion', ''),
                'arn': phone.get('arn', '')
            })
        
        link_date = account.get('linkDate')
        waba_details = {
            'id': account.get('id', ''),
            'wabaId': account.get('wabaId', ''),
            'wabaName': account.get('wabaName', ''),
            'arn': account.get('arn', ''),
            'registrationStatus': account.get('registrationStatus', ''),
            'linkDate': link_date.isoformat() if isinstance(link_date, datetime) else link_date,
            'enableSending': account.get('enableSending', False),
            'enableReceiving': account.get('enableReceiving', False),
            'eventDestinations': account.get('eventDestinations', []),
            'phoneNumbers': phone_numbers
        }
        
        logger.info(json.dumps({
            'event': 'waba_details_fetched',
            'wabaId': waba_id,
            'phoneCount': len(phone_numbers),
            'requestId': request_id
        }))
        
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps(waba_details)
        }
        
    except social_messaging.exceptions.ResourceNotFoundException:
        return _error_response(404, f'WABA not found: {waba_id}')
    except Exception as e:
        logger.error(json.dumps({
            'event': 'get_waba_details_error',
            'wabaId': waba_id,
            'error': str(e),
            'requestId': request_id
        }))
        return _error_response(500, f'Failed to get WABA details: {str(e)}')


def _get_phone_number_details(phone_id: str, request_id: str) -> Dict[str, Any]:
    """
    Get details of a specific phone number including quality rating.
    API: GetLinkedWhatsAppBusinessAccountPhoneNumber
    
    Returns:
    - Phone number info
    - Quality rating (GREEN/YELLOW/RED)
    - Display name
    - Data localization region
    """
    try:
        # Ensure phone_id has correct format
        if not phone_id.startswith('phone-number-id-'):
            phone_id = f'phone-number-id-{phone_id}'
        
        response = social_messaging.get_linked_whatsapp_business_account_phone_number(id=phone_id)
        
        phone = response.get('phoneNumber', {})
        linked_waba_id = response.get('linkedWhatsAppBusinessAccountId', '')
        
        phone_details = {
            'phoneNumberId': phone.get('phoneNumberId', ''),
            'phoneNumber': phone.get('phoneNumber', ''),
            'displayPhoneNumber': phone.get('displayPhoneNumber', ''),
            'displayPhoneNumberName': phone.get('displayPhoneNumberName', ''),
            'qualityRating': phone.get('qualityRating', 'UNKNOWN'),
            'metaPhoneNumberId': phone.get('metaPhoneNumberId', ''),
            'dataLocalizationRegion': phone.get('dataLocalizationRegion', ''),
            'arn': phone.get('arn', ''),
            'linkedWabaId': linked_waba_id
        }
        
        logger.info(json.dumps({
            'event': 'phone_details_fetched',
            'phoneNumberId': phone_id,
            'qualityRating': phone_details['qualityRating'],
            'requestId': request_id
        }))
        
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps(phone_details)
        }
        
    except social_messaging.exceptions.ResourceNotFoundException:
        return _error_response(404, f'Phone number not found: {phone_id}')
    except Exception as e:
        logger.error(json.dumps({
            'event': 'get_phone_details_error',
            'phoneNumberId': phone_id,
            'error': str(e),
            'requestId': request_id
        }))
        return _error_response(500, f'Failed to get phone details: {str(e)}')


def _get_system_events(query_params: Dict, request_id: str) -> Dict[str, Any]:
    """
    Get system events from SystemConfig table.
    Events stored by inbound webhook handler:
    - template_status: Template approval/rejection events
    - phone_quality: Phone quality rating changes
    - account_update: Messaging limit changes, restrictions
    """
    try:
        event_type = query_params.get('type', 'all')
        config_table = dynamodb.Table(SYSTEM_CONFIG_TABLE)
        
        events = {
            'templateStatus': [],
            'phoneQuality': [],
            'accountUpdates': []
        }
        
        # Fetch template status events
        if event_type in ['all', 'template_status']:
            try:
                response = config_table.get_item(Key={'configKey': 'whatsapp_events_template_status'})
                if 'Item' in response:
                    events['templateStatus'] = json.loads(response['Item'].get('configValue', '[]'))
            except Exception as e:
                logger.warning(f'Failed to fetch template status events: {str(e)}')
        
        # Fetch phone quality events
        if event_type in ['all', 'phone_quality']:
            try:
                response = config_table.get_item(Key={'configKey': 'whatsapp_events_phone_quality'})
                if 'Item' in response:
                    events['phoneQuality'] = json.loads(response['Item'].get('configValue', '[]'))
            except Exception as e:
                logger.warning(f'Failed to fetch phone quality events: {str(e)}')
        
        # Fetch account update events
        if event_type in ['all', 'account_update']:
            try:
                response = config_table.get_item(Key={'configKey': 'whatsapp_events_account_update'})
                if 'Item' in response:
                    events['accountUpdates'] = json.loads(response['Item'].get('configValue', '[]'))
            except Exception as e:
                logger.warning(f'Failed to fetch account update events: {str(e)}')
        
        logger.info(json.dumps({
            'event': 'system_events_fetched',
            'templateStatusCount': len(events['templateStatus']),
            'phoneQualityCount': len(events['phoneQuality']),
            'accountUpdatesCount': len(events['accountUpdates']),
            'requestId': request_id
        }))
        
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps(events)
        }
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'get_system_events_error',
            'error': str(e),
            'requestId': request_id
        }))
        # Return empty events on error (table may not exist)
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'templateStatus': [],
                'phoneQuality': [],
                'accountUpdates': []
            })
        }


def _delete_media(media_id: str, phone_number_id: str, request_id: str) -> Dict[str, Any]:
    """
    Delete media from WhatsApp.
    API: DeleteWhatsAppMessageMedia
    
    Note: This only deletes from WhatsApp servers.
    S3 cleanup should be done separately.
    """
    try:
        if not media_id:
            return _error_response(400, 'mediaId is required')
        
        if not phone_number_id:
            return _error_response(400, 'phoneNumberId is required')
        
        # Ensure phone_number_id has correct format
        if not phone_number_id.startswith('phone-number-id-'):
            phone_number_id = f'phone-number-id-{phone_number_id}'
        
        response = social_messaging.delete_whatsapp_message_media(
            mediaId=media_id,
            originationPhoneNumberId=phone_number_id
        )
        
        success = response.get('success', False)
        
        logger.info(json.dumps({
            'event': 'media_deleted',
            'mediaId': media_id,
            'phoneNumberId': phone_number_id,
            'success': success,
            'requestId': request_id
        }))
        
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'success': success,
                'mediaId': media_id
            })
        }
        
    except social_messaging.exceptions.ResourceNotFoundException:
        return _error_response(404, f'Media not found: {media_id}')
    except Exception as e:
        logger.error(json.dumps({
            'event': 'delete_media_error',
            'mediaId': media_id,
            'error': str(e),
            'requestId': request_id
        }))
        return _error_response(500, f'Failed to delete media: {str(e)}')


def _error_response(status_code: int, message: str) -> Dict[str, Any]:
    """Return error response with CORS headers."""
    return {
        'statusCode': status_code,
        'headers': CORS_HEADERS,
        'body': json.dumps({'error': message})
    }
