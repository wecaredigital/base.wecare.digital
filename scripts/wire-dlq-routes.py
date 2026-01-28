"""Wire DLQ routes to API Gateway"""
import boto3

apigateway = boto3.client('apigatewayv2', region_name='us-east-1')
lambda_client = boto3.client('lambda', region_name='us-east-1')

API_ID = 'k4vqzmi07b'
ACCOUNT_ID = '809904170947'
REGION = 'us-east-1'

routes = [
    {'path': '/dlq', 'method': 'GET', 'lambda': 'wecare-dlq-replay'},
    {'path': '/dlq/replay', 'method': 'POST', 'lambda': 'wecare-dlq-replay'},
]

for r in routes:
    route_key = f"{r['method']} {r['path']}"
    lambda_arn = f'arn:aws:lambda:{REGION}:{ACCOUNT_ID}:function:{r["lambda"]}'
    integration_uri = f'arn:aws:apigateway:{REGION}:lambda:path/2015-03-31/functions/{lambda_arn}/invocations'
    
    print(f'Creating {route_key}...')
    
    # Create integration
    integration = apigateway.create_integration(
        ApiId=API_ID,
        IntegrationType='AWS_PROXY',
        IntegrationUri=integration_uri,
        IntegrationMethod='POST',
        PayloadFormatVersion='2.0',
        TimeoutInMillis=30000,
    )
    
    # Create route
    route = apigateway.create_route(
        ApiId=API_ID,
        RouteKey=route_key,
        Target=f'integrations/{integration["IntegrationId"]}',
        AuthorizationType='NONE',
    )
    
    print(f'  Created: {route["RouteId"]}')

print('Done!')
