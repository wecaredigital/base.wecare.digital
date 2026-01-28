"""
Deploy Missing Lambda Functions

Creates Lambda functions that don't exist yet in AWS.
"""

import boto3
import zipfile
import io
import os

REGION = 'us-east-1'
ACCOUNT_ID = '809904170947'
ROLE_ARN = f'arn:aws:iam::{ACCOUNT_ID}:role/wecare-digital-lambda-role'

# Lambda functions to deploy
LAMBDAS = [
    {
        'name': 'wecare-voice-calls',
        'handler': 'handler.handler',
        'runtime': 'python3.12',
        'timeout': 30,
        'memory': 256,
        'source': 'amplify/functions/messaging/voice-calls/handler.py',
        'env': {
            'LOG_LEVEL': 'INFO',
            'CONTACTS_TABLE': 'base-wecare-digital-ContactsTable',
            'VOICE_CALLS_TABLE': 'base-wecare-digital-VoiceCalls',
        }
    },
    {
        'name': 'wecare-payments-read',
        'handler': 'handler.handler',
        'runtime': 'python3.12',
        'timeout': 10,
        'memory': 128,
        'source': 'amplify/functions/payments/payments-read/handler.py',
        'env': {
            'LOG_LEVEL': 'INFO',
            'PAYMENTS_TABLE': 'base-wecare-digital-PaymentsTable',
        }
    },
]

def create_zip(source_file):
    """Create a zip file from a Python source file."""
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Read the source file
        with open(source_file, 'r') as f:
            content = f.read()
        # Add to zip as handler.py
        zf.writestr('handler.py', content)
    zip_buffer.seek(0)
    return zip_buffer.read()

def main():
    lambda_client = boto3.client('lambda', region_name=REGION)
    
    print("Deploying Lambda Functions")
    print("=" * 60)
    
    for config in LAMBDAS:
        name = config['name']
        print(f"\n🚀 Deploying {name}...")
        
        # Check if function exists
        try:
            lambda_client.get_function(FunctionName=name)
            print(f"   Function exists, updating code...")
            
            # Update function code
            zip_bytes = create_zip(config['source'])
            lambda_client.update_function_code(
                FunctionName=name,
                ZipFile=zip_bytes,
            )
            print(f"   ✅ Code updated")
            
        except lambda_client.exceptions.ResourceNotFoundException:
            print(f"   Function doesn't exist, creating...")
            
            # Create function
            zip_bytes = create_zip(config['source'])
            try:
                lambda_client.create_function(
                    FunctionName=name,
                    Runtime=config['runtime'],
                    Role=ROLE_ARN,
                    Handler=config['handler'],
                    Code={'ZipFile': zip_bytes},
                    Timeout=config['timeout'],
                    MemorySize=config['memory'],
                    Environment={'Variables': config['env']},
                    Tags={
                        'Project': 'WECARE.DIGITAL',
                        'Environment': 'prod',
                    }
                )
                print(f"   ✅ Function created")
            except Exception as e:
                print(f"   ❌ Error creating function: {e}")
                continue
        
        # Add API Gateway permission
        try:
            lambda_client.add_permission(
                FunctionName=name,
                StatementId=f'apigateway-invoke-{name}',
                Action='lambda:InvokeFunction',
                Principal='apigateway.amazonaws.com',
                SourceArn=f'arn:aws:execute-api:{REGION}:{ACCOUNT_ID}:k4vqzmi07b/*/*',
            )
            print(f"   ✅ API Gateway permission added")
        except lambda_client.exceptions.ResourceConflictException:
            print(f"   ⏭️  Permission already exists")
        except Exception as e:
            print(f"   ⚠️  Permission error: {e}")
    
    print("\n" + "=" * 60)
    print("Deployment complete!")

if __name__ == '__main__':
    main()
