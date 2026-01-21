# Delete CDK-Generated S3 Buckets
# This script identifies and deletes all S3 buckets created by Amplify CDK
# Keeps only: stream.wecare.digital, auth.wecare.digital, d.wecare.digital

# Configuration
$REGION = "us-east-1"
$BUCKETS_TO_KEEP = @(
    "stream.wecare.digital",
    "auth.wecare.digital",
    "d.wecare.digital"
)

# Colors
$GREEN = "Green"
$RED = "Red"
$YELLOW = "Yellow"
$CYAN = "Cyan"

Write-Host "========================================" -ForegroundColor $CYAN
Write-Host "CDK-Generated S3 Bucket Deletion Script" -ForegroundColor $CYAN
Write-Host "========================================" -ForegroundColor $CYAN
Write-Host ""

# Step 1: List all buckets
Write-Host "Step 1: Listing all S3 buckets..." -ForegroundColor $YELLOW
Write-Host ""

$allBuckets = aws s3 ls --region $REGION | ForEach-Object { $_.Split()[-1] }

if ($allBuckets.Count -eq 0) {
    Write-Host "No buckets found" -ForegroundColor $RED
    exit 1
}

Write-Host "Total buckets found: $($allBuckets.Count)" -ForegroundColor $GREEN
Write-Host ""

# Step 2: Identify buckets to delete
Write-Host "Step 2: Identifying CDK-generated buckets..." -ForegroundColor $YELLOW
Write-Host ""

$bucketsToDelete = @()
$bucketsToKeep = @()

foreach ($bucket in $allBuckets) {
    $shouldKeep = $false
    
    foreach ($keep in $BUCKETS_TO_KEEP) {
        if ($bucket -eq $keep) {
            $shouldKeep = $true
            break
        }
    }
    
    if ($shouldKeep) {
        $bucketsToKeep += $bucket
    } else {
        $bucketsToDelete += $bucket
    }
}

# Display buckets to keep
Write-Host "Buckets to KEEP:" -ForegroundColor $GREEN
foreach ($bucket in $bucketsToKeep) {
    Write-Host "  ✓ $bucket" -ForegroundColor $GREEN
}
Write-Host ""

# Display buckets to delete
if ($bucketsToDelete.Count -gt 0) {
    Write-Host "Buckets to DELETE:" -ForegroundColor $RED
    foreach ($bucket in $bucketsToDelete) {
        Write-Host "  ❌ $bucket" -ForegroundColor $RED
    }
    Write-Host ""
} else {
    Write-Host "No CDK-generated buckets found to delete" -ForegroundColor $GREEN
    Write-Host ""
    exit 0
}

# Step 3: Confirm before deletion
Write-Host "Step 3: Confirmation" -ForegroundColor $YELLOW
Write-Host ""
Write-Host "WARNING: This will DELETE the following buckets and ALL their contents:" -ForegroundColor $RED
foreach ($bucket in $bucketsToDelete) {
    Write-Host "  - $bucket" -ForegroundColor $RED
}
Write-Host ""

$confirm = Read-Host "Type 'DELETE' to confirm deletion (or press Enter to cancel)"

if ($confirm -ne "DELETE") {
    Write-Host "Deletion cancelled" -ForegroundColor $YELLOW
    exit 0
}

Write-Host ""

# Step 4: Empty and delete buckets
Write-Host "Step 4: Deleting buckets..." -ForegroundColor $YELLOW
Write-Host ""

$deletedCount = 0
foreach ($bucket in $bucketsToDelete) {
    Write-Host "Processing: $bucket" -ForegroundColor $CYAN
    
    try {
        # First, empty the bucket
        Write-Host "  - Emptying bucket..." -ForegroundColor $CYAN
        aws s3 rm "s3://$bucket" --recursive --region $REGION
        
        # Then delete the bucket
        Write-Host "  - Deleting bucket..." -ForegroundColor $CYAN
        aws s3 rb "s3://$bucket" --region $REGION
        
        Write-Host "  ✓ Deleted successfully" -ForegroundColor $GREEN
        $deletedCount++
    } catch {
        Write-Host "  ✗ Error: $_" -ForegroundColor $RED
    }
    Write-Host ""
}

# Step 5: Verify deletion
Write-Host "Step 5: Verifying deletion..." -ForegroundColor $YELLOW
Write-Host ""

$remainingBuckets = aws s3 ls --region $REGION | ForEach-Object { $_.Split()[-1] }

Write-Host "Remaining buckets:" -ForegroundColor $GREEN
foreach ($bucket in $remainingBuckets) {
    Write-Host "  ✓ $bucket" -ForegroundColor $GREEN
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor $CYAN
Write-Host "Deletion Summary" -ForegroundColor $CYAN
Write-Host "========================================" -ForegroundColor $CYAN
Write-Host "Buckets deleted: $deletedCount" -ForegroundColor $GREEN
Write-Host "Buckets kept: $($bucketsToKeep.Count)" -ForegroundColor $GREEN
Write-Host ""
Write-Host "✓ Cleanup completed successfully!" -ForegroundColor $GREEN
Write-Host ""
Write-Host "Next steps:" -ForegroundColor $YELLOW
Write-Host "1. Run: cleanup-s3-bucket.ps1 to clean Build/ and packages/ folders" -ForegroundColor $YELLOW
Write-Host "2. Update code files as per S3_CONSOLIDATION_PLAN.md" -ForegroundColor $YELLOW
Write-Host "3. Test all Lambda functions" -ForegroundColor $YELLOW
Write-Host "4. Deploy to production" -ForegroundColor $YELLOW
