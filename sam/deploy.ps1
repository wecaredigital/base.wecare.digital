# WECARE.DIGITAL Lambda Deployment Script
# This script packages and deploys Lambda functions using AWS CLI

$REGION = "us-east-1"
$ACCOUNT_ID = "809904170947"
$STACK_NAME = "wecare-digital-lambdas"
$S3_BUCKET = "wecare-digital-deployment-$ACCOUNT_ID"

Write-Host "=== WECARE.DIGITAL Lambda Deployment ===" -ForegroundColor Cyan

# Create S3 bucket for deployment if not exists
Write-Host "Creating deployment bucket..." -ForegroundColor Yellow
aws s3 mb "s3://$S3_BUCKET" --region $REGION 2>$null

# Package each Lambda function
$functions = @(
    "inbound-whatsapp-handler",
    "outbound-whatsapp",
    "outbound-sms",
    "outbound-email",
    "auth-middleware",
    "contacts-create",
    "contacts-read",
    "contacts-update",
    "contacts-delete",
    "contacts-search",
    "bulk-job-create",
    "bulk-worker",
    "bulk-job-control",
    "dlq-replay",
    "ai-query-kb",
    "ai-generate-response"
)

# Create zip packages
Write-Host "Packaging Lambda functions..." -ForegroundColor Yellow
foreach ($func in $functions) {
    $srcPath = "functions/$func"
    $zipPath = ".aws-sam/packages/$func.zip"
    
    # Create packages directory
    New-Item -ItemType Directory -Force -Path ".aws-sam/packages" | Out-Null
    
    # Create zip (include handler.py only, utils come from layer)
    Compress-Archive -Path "$srcPath/handler.py" -DestinationPath $zipPath -Force
    
    # Upload to S3
    aws s3 cp $zipPath "s3://$S3_BUCKET/lambdas/$func.zip" --region $REGION
    Write-Host "  Uploaded $func" -ForegroundColor Green
}

# Package shared layer
Write-Host "Packaging shared utils layer..." -ForegroundColor Yellow
Compress-Archive -Path "layers/shared/python" -DestinationPath ".aws-sam/packages/shared-layer.zip" -Force
aws s3 cp ".aws-sam/packages/shared-layer.zip" "s3://$S3_BUCKET/layers/shared-layer.zip" --region $REGION

# Deploy CloudFormation stack
Write-Host "Deploying CloudFormation stack..." -ForegroundColor Yellow
aws cloudformation deploy `
    --template-file template.yaml `
    --stack-name $STACK_NAME `
    --capabilities CAPABILITY_NAMED_IAM `
    --region $REGION `
    --parameter-overrides Environment=production

Write-Host "=== Deployment Complete ===" -ForegroundColor Green
