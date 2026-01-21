# Create Required S3 Folder Structure
# This script creates all required folders in the S3 bucket

param(
    [string]$Bucket = "stream.wecare.digital",
    [string]$Region = "us-east-1"
)

# Colors
$GREEN = "Green"
$RED = "Red"
$YELLOW = "Yellow"
$CYAN = "Cyan"

Write-Host "========================================" -ForegroundColor $CYAN
Write-Host "S3 Folder Structure Creation" -ForegroundColor $CYAN
Write-Host "Bucket: $Bucket" -ForegroundColor $CYAN
Write-Host "========================================" -ForegroundColor $CYAN
Write-Host ""

# Define folder structure
$folders = @(
    # WhatsApp Media (root level)
    "whatsapp-media/whatsapp-media-incoming/",
    "whatsapp-media/whatsapp-media-outgoing/",
    
    # Base project folders
    "base-wecare-digital/Build/",
    "base-wecare-digital/Build/next/",
    "base-wecare-digital/Build/amplify/",
    "base-wecare-digital/Build/lambda/",
    "base-wecare-digital/Build/docker/",
    "base-wecare-digital/Build/logs/",
    
    "base-wecare-digital/packages/",
    "base-wecare-digital/packages/npm/",
    "base-wecare-digital/packages/python/",
    "base-wecare-digital/packages/docker/",
    "base-wecare-digital/packages/archives/",
    
    "base-wecare-digital/reports/",
    "base-wecare-digital/reports/archives/",
    
    "base-wecare-digital/bedrock/",
    "base-wecare-digital/bedrock/kb/",
    "base-wecare-digital/bedrock/kb/whatsapp/",
    "base-wecare-digital/bedrock/kb/whatsapp/documents/",
    "base-wecare-digital/bedrock/kb/whatsapp/training/",
    "base-wecare-digital/bedrock/kb/whatsapp/metadata/",
    
    "base-wecare-digital/deployment/",
    "base-wecare-digital/deployment/cloudformation/",
    "base-wecare-digital/deployment/terraform/",
    "base-wecare-digital/deployment/cdk/",
    "base-wecare-digital/deployment/releases/",
    
    "base-wecare-digital/logs/",
    "base-wecare-digital/logs/lambda/",
    "base-wecare-digital/logs/api/",
    "base-wecare-digital/logs/deployment/",
    
    "base-wecare-digital/backups/",
    "base-wecare-digital/backups/database/",
    "base-wecare-digital/backups/configuration/",
    "base-wecare-digital/backups/archives/",
    
    "base-wecare-digital/media/",
    "base-wecare-digital/media/images/",
    "base-wecare-digital/media/documents/",
    "base-wecare-digital/media/archives/",
    
    "base-wecare-digital/cache/",
    "base-wecare-digital/cache/compiled/",
    "base-wecare-digital/cache/temporary/",
    
    "base-wecare-digital/monitoring/",
    "base-wecare-digital/monitoring/metrics/",
    "base-wecare-digital/monitoring/alerts/",
    "base-wecare-digital/monitoring/dashboards/",
    
    "base-wecare-digital/config/",
    "base-wecare-digital/config/environment/",
    "base-wecare-digital/config/secrets/",
    "base-wecare-digital/config/templates/",
    
    "base-wecare-digital/metadata/"
)

Write-Host "Creating $($folders.Count) folders..." -ForegroundColor $YELLOW
Write-Host ""

$createdCount = 0
$failedCount = 0

foreach ($folder in $folders) {
    try {
        # Create folder by putting an empty object with trailing slash
        aws s3api put-object --bucket $Bucket --key $folder --region $Region | Out-Null
        Write-Host "  ✓ $folder" -ForegroundColor $GREEN
        $createdCount++
    } catch {
        Write-Host "  ✗ $folder (ERROR: $_)" -ForegroundColor $RED
        $failedCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor $CYAN
Write-Host "Creation Summary" -ForegroundColor $CYAN
Write-Host "========================================" -ForegroundColor $CYAN
Write-Host "Created: $createdCount" -ForegroundColor $GREEN
Write-Host "Failed: $failedCount" -ForegroundColor $RED
Write-Host ""

if ($failedCount -eq 0) {
    Write-Host "✓ All folders created successfully!" -ForegroundColor $GREEN
} else {
    Write-Host "⚠ Some folders failed to create" -ForegroundColor $YELLOW
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor $YELLOW
Write-Host "1. Verify structure: .\verify-s3-structure.ps1"
Write-Host "2. Create metadata files"
Write-Host "3. Set up lifecycle policies"
Write-Host "4. Configure access controls"
