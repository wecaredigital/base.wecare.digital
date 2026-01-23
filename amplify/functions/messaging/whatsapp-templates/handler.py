"""
WhatsApp Templates Lambda Function

Purpose: Fetch WhatsApp message templates from AWS EUM Social API
Uses: ListWhatsAppMessageTemplates API

AWS EUM Social API Reference:
- ListWhatsAppMessageTemplates: GET /v1/whatsapp/templates
- Rate Limit: 10 req/sec
"""

import os
import json
import logging
import boto3
from typing import Dict, Any, List

# Configure logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

# AWS clients - use socialmessaging service
social_messaging = boto3.client('socialmessaging', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# WABA IDs
WABA_IDS = {
    'wecare': 'waba-0aae9cf04cf24c66960f291c793359b4',
    'manish': 'waba-9bbe054d8404487397c38a9d197bc44a',
}

# Default WABA
DEFAULT_WABA_ID = WABA_IDS['wecare']


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """List WhatsApp message templates from AWS EUM Social."""
    request_id = context.aws_request_id if context else 'local'
    
    logger.info(json.dumps({
        'event': 'templates_list_start',
        'requestId': request_id
    }))
    
    # CORS headers
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
    }
    
    # Handle OPTIONS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    try:
        # Get WABA ID from query params or use default
        query_params = event.get('queryStringParameters') or {}
        waba_id = query_params.get('wabaId', DEFAULT_WABA_ID)
        
        # Validate WABA ID format
        if not waba_id.startswith('waba-'):
            waba_id = DEFAULT_WABA_ID
        
        logger.info(json.dumps({
            'event': 'fetching_templates',
            'wabaId': waba_id,
            'requestId': request_id
        }))
        
        # Fetch templates from AWS EUM Social
        # API: list_whatsapp_message_templates(id=waba_id)
        templates = []
        next_token = None
        
        while True:
            params = {
                'id': waba_id,  # Required parameter - WABA ID
            }
            if next_token:
                params['nextToken'] = next_token
            
            response = social_messaging.list_whatsapp_message_templates(**params)
            
            # Process templates from response
            for template in response.get('templates', []):
                template_id = template.get('metaTemplateId', '')
                template_name = template.get('templateName', '')
                template_lang = template.get('templateLanguage', 'en_US')
                
                # Fetch full template details including components
                components = []
                try:
                    detail_response = social_messaging.get_whatsapp_message_template(
                        id=waba_id,
                        metaTemplateId=template_id
                    )
                    # Parse the template JSON string
                    template_json = detail_response.get('template', '{}')
                    if isinstance(template_json, str):
                        template_data = json.loads(template_json)
                        components = template_data.get('components', [])
                        logger.info(json.dumps({
                            'event': 'template_detail_fetched',
                            'templateName': template_name,
                            'componentCount': len(components),
                            'requestId': request_id
                        }))
                except Exception as e:
                    logger.warning(json.dumps({
                        'event': 'template_detail_error',
                        'templateName': template_name,
                        'error': str(e),
                        'requestId': request_id
                    }))
                
                templates.append({
                    'id': template_id,
                    'name': template_name,
                    'language': template_lang,
                    'category': template.get('templateCategory', 'UTILITY'),
                    'status': template.get('templateStatus', 'APPROVED'),
                    'qualityScore': template.get('templateQualityScore', ''),
                    'wabaId': waba_id,
                    'components': components
                })
            
            next_token = response.get('nextToken')
            if not next_token:
                break
        
        logger.info(json.dumps({
            'event': 'templates_fetched',
            'count': len(templates),
            'wabaId': waba_id,
            'requestId': request_id
        }))
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'templates': templates,
                'count': len(templates),
                'wabaId': waba_id
            })
        }
        
    except social_messaging.exceptions.AccessDeniedException as e:
        logger.error(json.dumps({
            'event': 'access_denied',
            'error': str(e),
            'requestId': request_id
        }))
        return {
            'statusCode': 403,
            'headers': headers,
            'body': json.dumps({
                'error': 'Access denied to WhatsApp templates',
                'templates': []
            })
        }
        
    except social_messaging.exceptions.ResourceNotFoundException as e:
        logger.error(json.dumps({
            'event': 'waba_not_found',
            'error': str(e),
            'requestId': request_id
        }))
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({
                'error': 'WABA not found',
                'templates': []
            })
        }
        
    except Exception as e:
        logger.error(json.dumps({
            'event': 'templates_error',
            'error': str(e),
            'errorType': type(e).__name__,
            'requestId': request_id
        }))
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': str(e),
                'templates': []
            })
        }
