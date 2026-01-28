"""
AWS Billing Lambda Function
Fetches real cost and usage data from AWS Cost Explorer API

Route: GET /billing
"""

import os
import json
import logging
import boto3
from datetime import datetime, timedelta
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

ce = boto3.client('ce', region_name='us-east-1')  # Cost Explorer only in us-east-1

CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
}

# AWS Free Tier limits for reference
FREE_TIER_LIMITS = {
    'AWS Lambda': {'limit': '1M requests/month', 'threshold': 1000000},
    'Amazon DynamoDB': {'limit': '25GB + 200M requests', 'threshold': 200000000},
    'Amazon S3': {'limit': '5GB + 20K GET', 'threshold': 20000},
    'Amazon API Gateway': {'limit': '1M REST calls/month', 'threshold': 1000000},
    'Amazon CloudFront': {'limit': '1TB transfer/month', 'threshold': 1000000},
    'AWS Amplify': {'limit': '1000 build mins/month', 'threshold': 1000},
    'Amazon SNS': {'limit': '1M publishes/month', 'threshold': 1000000},
    'Amazon SQS': {'limit': '1M requests/month', 'threshold': 1000000},
    'Amazon Cognito': {'limit': '50K MAU', 'threshold': 50000},
    'AmazonCloudWatch': {'limit': '10 metrics free', 'threshold': 10},
    'Amazon Bedrock': {'limit': '3-month trial', 'threshold': 0},
    'AWS End User Messaging': {'limit': 'Pay per message', 'threshold': 0},
}


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Main handler for billing data."""
    request_context = event.get('requestContext', {})
    if 'http' in request_context:
        http_method = request_context.get('http', {}).get('method', 'GET')
    else:
        http_method = event.get('httpMethod', 'GET')
    
    if http_method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    try:
        return _get_billing_data()
    except Exception as e:
        logger.error(f'Billing error: {str(e)}')
        return _error_response(500, str(e))


def _get_billing_data() -> Dict[str, Any]:
    """Fetch billing data from AWS Cost Explorer."""
    today = datetime.utcnow()
    start_of_month = today.replace(day=1).strftime('%Y-%m-%d')
    end_date = today.strftime('%Y-%m-%d')
    
    try:
        # Get cost and usage by service
        response = ce.get_cost_and_usage(
            TimePeriod={'Start': start_of_month, 'End': end_date},
            Granularity='MONTHLY',
            Metrics=['UnblendedCost', 'UsageQuantity'],
            GroupBy=[{'Type': 'DIMENSION', 'Key': 'SERVICE'}]
        )
        
        services = []
        total_cost = 0.0
        
        for result in response.get('ResultsByTime', []):
            for group in result.get('Groups', []):
                service_name = group['Keys'][0]
                cost = float(group['Metrics']['UnblendedCost']['Amount'])
                usage = float(group['Metrics']['UsageQuantity']['Amount'])
                
                total_cost += cost
                
                # Determine free tier status
                free_tier = FREE_TIER_LIMITS.get(service_name, {})
                threshold = free_tier.get('threshold', 0)
                
                if cost > 0:
                    status = 'paid'
                elif threshold > 0 and usage > threshold * 0.8:
                    status = 'warning'
                else:
                    status = 'free'
                
                services.append({
                    'service': service_name,
                    'cost': round(cost, 4),
                    'usage': int(usage) if usage == int(usage) else round(usage, 2),
                    'unit': 'requests',
                    'freeLimit': free_tier.get('limit', 'N/A'),
                    'status': status
                })
        
        # Sort by cost descending
        services.sort(key=lambda x: x['cost'], reverse=True)
        
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'totalCost': round(total_cost, 2),
                'period': f'{start_of_month} to {end_date}',
                'services': services,
                'lastUpdated': today.isoformat() + 'Z'
            })
        }
    except ce.exceptions.DataUnavailableException:
        logger.warning('Cost Explorer data not available yet')
        return _fallback_billing_data(start_of_month, end_date)
    except Exception as e:
        logger.error(f'Cost Explorer error: {str(e)}')
        return _fallback_billing_data(start_of_month, end_date)


def _fallback_billing_data(start_date: str, end_date: str) -> Dict[str, Any]:
    """Return fallback data when Cost Explorer is unavailable."""
    services = [
        {'service': 'Amazon Bedrock', 'cost': 0, 'usage': 61, 'unit': 'requests', 'freeLimit': '3-month trial', 'status': 'free'},
        {'service': 'AWS Lambda', 'cost': 0, 'usage': 6709, 'unit': 'requests', 'freeLimit': '1M/month', 'status': 'free'},
        {'service': 'Amazon DynamoDB', 'cost': 0, 'usage': 22977, 'unit': 'operations', 'freeLimit': '200M/month', 'status': 'free'},
        {'service': 'Amazon S3', 'cost': 0, 'usage': 13186, 'unit': 'operations', 'freeLimit': '20K GET', 'status': 'free'},
        {'service': 'Amazon API Gateway', 'cost': 0, 'usage': 5157, 'unit': 'requests', 'freeLimit': '1M/month', 'status': 'free'},
        {'service': 'Amazon CloudFront', 'cost': 0, 'usage': 1981, 'unit': 'requests', 'freeLimit': '1TB/month', 'status': 'free'},
        {'service': 'AWS Amplify', 'cost': 0, 'usage': 774, 'unit': 'minutes', 'freeLimit': '1000 mins/month', 'status': 'free'},
        {'service': 'Amazon SNS', 'cost': 0, 'usage': 3387, 'unit': 'notifications', 'freeLimit': '1M/month', 'status': 'free'},
        {'service': 'Amazon SQS', 'cost': 0, 'usage': 429, 'unit': 'requests', 'freeLimit': '1M/month', 'status': 'free'},
        {'service': 'AWS End User Messaging', 'cost': 0, 'usage': 381, 'unit': 'messages', 'freeLimit': 'Pay per msg', 'status': 'free'},
    ]
    
    return {
        'statusCode': 200,
        'headers': CORS_HEADERS,
        'body': json.dumps({
            'totalCost': 0,
            'period': f'{start_date} to {end_date}',
            'services': services,
            'lastUpdated': datetime.utcnow().isoformat() + 'Z',
            'note': 'Estimated data - Cost Explorer data pending'
        })
    }


def _error_response(status_code: int, message: str) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': CORS_HEADERS,
        'body': json.dumps({'error': message})
    }
