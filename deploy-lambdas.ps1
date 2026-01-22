# Deploy Lambda Functions to AWS
# Run this script to update Lambda function code in AWS

$REGION = "us-east-1"

Write-Host "Deploying Lambda functions to AWS..." -ForegroundColor Cyan

# Function to deploy a Python Lambda
function Deploy-Lambda {
    param (
        [string]$FunctionName,
        [string]$HandlerPath
    )
    
    Write-Host "Deploying $FunctionName..." -ForegroundColor Yellow
    
    # Create temp directory
    $tempDir = "temp_lambda_$FunctionName"
    New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
    
    # Copy handler
    Copy-Item $HandlerPath "$tempDir/handler.py"
    
    # Copy shared utils if they exist
    $sharedUtils = "amplify/functions/shared/utils"
    if (Test-Path $sharedUtils) {
        Copy-Item -Recurse $sharedUtils "$tempDir/utils"
    }
    
    # Create zip
    $zipFile = "$FunctionName.zip"
    Compress-Archive -Path "$tempDir/*" -DestinationPath $zipFile -Force
    
    # Deploy to AWS
    aws lambda update-function-code `
        --function-name $FunctionName `
        --zip-file "fileb://$zipFile" `
        --region $REGION
    
    # Cleanup
    Remove-Item -Recurse -Force $tempDir
    Remove-Item -Force $zipFile
    
    Write-Host "Deployed $FunctionName" -ForegroundColor Green
}

# Deploy messages-read Lambda
Deploy-Lambda -FunctionName "wecare-messages-read" -HandlerPath "amplify/functions/core/messages-read/handler.py"

# Deploy messages-delete Lambda
Deploy-Lambda -FunctionName "wecare-messages-delete" -HandlerPath "amplify/functions/core/messages-delete/handler.py"

# Deploy inbound-whatsapp-handler Lambda
Deploy-Lambda -FunctionName "inbound-whatsapp-handler" -HandlerPath "amplify/functions/messaging/inbound-whatsapp-handler/handler.py"

Write-Host ""
Write-Host "Lambda deployment complete!" -ForegroundColor Cyan
Write-Host "Note: You may need to update environment variables in AWS Console if needed." -ForegroundColor Yellow
