# S3 Bucket Cleanup Script for stream.wecare.digital
# This script safely removes unused folders from the S3 bucket

# Configuration
$BUCKET = "stream.wecare.digital"
$PREFIX = "base-wecare-digital"
$REGION = "us-east-1"

# Colors for output
$GREEN = "Green"
$RED = "Red"
$YELLOW = "Yellow"
$CYAN = "Cyan"

Write-Host "========================================" -ForegroundColor $CYAN
Write-Host "S3 Bucket Cleanup Script" -ForegroundColor $CYAN
Write-Host "Bucket: $BUCKET" -ForegroundColor $CYAN
Write-Host "========================================" -ForegroundColor $CYAN
Write-Host ""

# Step 1: List all objects in the bucket
Write-Host "Step 1: Listing all objects in the bucket..." -ForegroundColor $YELLOW
Write-Host "Command: aws s3 ls s3://$BUCKET/$PREFIX/ --recursive" -ForegroundColor $CYAN
Write-Host ""

$objects = aws s3 ls "s3://$BUCKET/$PREFIX/" --recursive --region $REGION

if ($objects) {
    Write-Host "Current bucket contents:" -ForegroundColor $GREEN
    Write-Host $objects
    Write-Host ""
} else {
    Write-Host "Bucket is empty or error occurred" -ForegroundColor $RED
    exit 1
}

# Step 2: Identify folders to delete
Write-Host "Step 2: Identifying folders to delete..." -ForegroundColor $YELLOW
Write-Host ""

$foldersToDelete = @()
$foldersToKeep = @("reports/", "bedrock/")

# Parse the output to find unique folders
$lines = $objects -split "`n"
foreach ($line in $lines) {
    if ($line -match "PRE\s+(.+)/$") {
        $folder = $matches[1]
        $shouldKeep = $false
        
        foreach ($keep in $foldersToKeep) {
            if ($folder -like "*$keep*") {
                $shouldKeep = $true
                break
            }
        }
        
        if (-not $shouldKeep) {
            $foldersToDelete += $folder
        }
    }
}

Write-Host "Folders to KEEP:" -ForegroundColor $GREEN
Write-Host "  ✓ base-wecare-digital/reports/" -ForegroundColor $GREEN
Write-Host "  ✓ base-wecare-digital/bedrock/kb/whatsapp/" -ForegroundColor $GREEN
Write-Host ""

if ($foldersToDelete.Count -gt 0) {
    Write-Host "Folders to DELETE:" -ForegroundColor $RED
    foreach ($folder in $foldersToDelete) {
        Write-Host "  ❌ $folder/" -ForegroundColor $RED
    }
    Write-Host ""
} else {
    Write-Host "No unused folders found to delete" -ForegroundColor $GREEN
    Write-Host ""
}

# Step 3: Confirm before deletion
Write-Host "Step 3: Confirmation" -ForegroundColor $YELLOW
$confirm = Read-Host "Do you want to proceed with deletion? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "Cleanup cancelled" -ForegroundColor $YELLOW
    exit 0
}

Write-Host ""

# Step 4: Delete unused folders
Write-Host "Step 4: Deleting unused folders..." -ForegroundColor $YELLOW
Write-Host ""

$deletedCount = 0
foreach ($folder in $foldersToDelete) {
    $folderPath = "s3://$BUCKET/$PREFIX/$folder/"
    Write-Host "Deleting: $folderPath" -ForegroundColor $CYAN
    
    try {
        aws s3 rm $folderPath --recursive --region $REGION
        Write-Host "✓ Deleted successfully" -ForegroundColor $GREEN
        $deletedCount++
    } catch {
        Write-Host "✗ Error deleting: $_" -ForegroundColor $RED
    }
    Write-Host ""
}

# Step 5: Verify cleanup
Write-Host "Step 5: Verifying cleanup..." -ForegroundColor $YELLOW
Write-Host "Command: aws s3 ls s3://$BUCKET/$PREFIX/ --recursive" -ForegroundColor $CYAN
Write-Host ""

$remainingObjects = aws s3 ls "s3://$BUCKET/$PREFIX/" --recursive --region $REGION

if ($remainingObjects) {
    Write-Host "Remaining bucket contents:" -ForegroundColor $GREEN
    Write-Host $remainingObjects
    Write-Host ""
} else {
    Write-Host "Bucket is now empty" -ForegroundColor $YELLOW
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor $CYAN
Write-Host "Cleanup Summary" -ForegroundColor $CYAN
Write-Host "========================================" -ForegroundColor $CYAN
Write-Host "Folders deleted: $deletedCount" -ForegroundColor $GREEN
Write-Host "Folders kept: 2 (reports, bedrock)" -ForegroundColor $GREEN
Write-Host ""
Write-Host "✓ Cleanup completed successfully!" -ForegroundColor $GREEN
