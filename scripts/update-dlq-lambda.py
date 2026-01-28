import boto3
import zipfile
import io

lambda_client = boto3.client('lambda', region_name='us-east-1')

# Create zip
zip_buffer = io.BytesIO()
with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
    with open('amplify/functions/operations/dlq-replay/handler.py', 'r') as f:
        zf.writestr('handler.py', f.read())
zip_buffer.seek(0)

# Update function
lambda_client.update_function_code(
    FunctionName='wecare-dlq-replay',
    ZipFile=zip_buffer.read(),
)
print('Updated wecare-dlq-replay')
