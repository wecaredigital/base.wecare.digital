# Verify and Organize S3 Bucket Structure
# This script checks the current S3 structure and ensures it matches the required organization

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
Write-Host "S3 Bucket Structure Verification" -ForegroundColor $CYAN
Write-Host "Bucket: $Bucket" -ForegroundColor $CYAN
Write-Host "========================================" -ForegroundColor $CYAN
Write-Host ""

# Step 1: List all objects
Write-Host "Step 1: Analyzing bucket structure..." -ForegroundColor $YELLOW
Write-Host ""

$objects = aws s3 ls "s3://$Bucket/" --recursive --region $Region

if (-not $objects) {
    Write-Host "Bucket is empty or error occurred" -ForegroundColor $RED
    exit 1
}

# Parse folders
$folders = @{}
$lines = $objects -split "`n"

foreach ($line in $lines) {
    if ($line -match "PRE\s+(.+)/$") {
        $folder = $matches[1]
        $folders[$folder] = "folder"
    }
}

# Step 2: Check required folders
Write-Host "Step 2: Checking required folder structure..." -ForegroundColor $YELLOW
Write-Host ""

$requiredFolders = @(
    "whatsapp-media",
    "whatsapp-media/whatsapp-media-incoming",
    "whatsapp-media/whatsapp-media-outgoing",
    "base-wecare-digital",
    "base-wecare-digital/Build",
    "base-wecare-digital/packages",
    "base-wecare-digital/reports",
    "base-wecare-digital/bedrock",
    "base-wecare-digital/deployment",
    "base-wecare-digital/logs",
    "base-wecare-digital/backups",
    "base-wecare-digital/media",
    "base-wecare-digital/cache",
    "base-wecare-digital/monitoring",
    "base-wecare-digital/config",
    "base-wecare-digital/metadata"
)

$missingFolders = @()
$existingFolders = @()

foreach ($folder in $requiredFolders) {
    if ($folders.ContainsKey($folder)) {
        Write-Host "  ✓ $folder" -ForegroundColor $GREEN
        $existingFolders += $folder
    } else {
        Write-Host "  ✗ $folder (MISSING)" -ForegroundColor $RED
        $missingFolders += $folder
    }
}

Write-Host ""

# Step 3: Check for unwanted folders
Write-Host "Step 3: Checking for unwanted folders..." -ForegroundColor $YELLOW
Write-Host ""

$unwantedPatterns = @(
    "Build",
    "packages",
    "node_modules",
    "dist",
    "out",
    ".next",
    ".amplify",
    "cdk.out",
    "temp",
    "tmp"
)

$unwantedFolders = @()

foreach ($folder in $folders.Keys) {
    $isUnwanted = $false
    
    # Check if folder is outside base-wecare-digital and not whatsapp-media
    if ($folder -notmatch "^base-wecare-digital" -and $folder -notmatch "^whatsapp-media") {
        $isUnwanted = $true
    }
    
    # Check for unwanted patterns
    foreach ($pattern in $unwantedPatterns) {
        if ($folder -match $pattern) {
            $isUnwanted = $true
            break
        }
    }
    
    if ($isUnwanted) {
        Write-Host "  ⚠ $folder (UNWANTED)" -ForegroundColor $YELLOW
        $unwantedFolders += $folder
    }
}

if ($unwantedFolders.Count -eq 0) {
    Write-Host "  ✓ No unwanted folders found" -ForegroundColor $GREEN
}

Write-Host ""

# Step 4: Check folder sizes
Write-Host "Step 4: Analyzing folder sizes..." -ForegroundColor $YELLOW
Write-Host ""

$folderSizes = @{}

foreach ($folder in $existingFolders) {
    $size = 0
    $count = 0
    
    foreach ($line in $lines) {
        if ($line -match "^\s+(\d+)\s+(.+)$") {
            $fileSize = [int]$matches[1]
            $filePath = $matches[2]
            
            if ($filePath -match "^$folder/") {
                $size += $fileSize
                $count++
            }
        }
    }
    
    if ($size -gt 0) {
        $sizeGB = [math]::Round($size / 1GB, 2)
        Write-Host "  $folder: $count files, $sizeGB GB" -ForegroundColor $CYAN
        $folderSizes[$folder] = $sizeGB
    }
}

Write-Host ""

# Step 5: Summary
Write-Host "========================================" -ForegroundColor $CYAN
Write-Host "Verification Summary" -ForegroundColor $CYAN
Write-Host "========================================" -ForegroundColor $CYAN
Write-Host ""

Write-Host "Existing Folders: $($existingFolders.Count)" -ForegroundColor $GREEN
Write-Host "Missing Folders: $($missingFolders.Count)" -ForegroundColor $RED
Write-Host "Unwanted Folders: $($unwantedFolders.Count)" -ForegroundColor $YELLOW
Write-Host ""

if ($missingFolders.Count -gt 0) {
    Write-Host "Missing Folders (need to create):" -ForegroundColor $RED
    foreach ($folder in $missingFolders) {
        Write-Host "  - $folder" -ForegroundColor $RED
    }
    Write-Host ""
}

if ($unwantedFolders.Count -gt 0) {
    Write-Host "Unwanted Folders (should delete):" -ForegroundColor $YELLOW
    foreach ($folder in $unwantedFolders) {
        Write-Host "  - $folder" -ForegroundColor $YELLOW
    }
    Write-Host ""
}

# Step 6: Recommendations
Write-Host "Recommendations:" -ForegroundColor $CYAN
Write-Host ""

if ($missingFolders.Count -gt 0) {
    Write-Host "1. Create missing folders:" -ForegroundColor $YELLOW
    foreach ($folder in $missingFolders) {
        Write-Host "   aws s3api put-object --bucket $Bucket --key '$folder/'" -ForegroundColor $CYAN
    }
    Write-Host ""
}

if ($unwantedFolders.Count -gt 0) {
    Write-Host "2. Delete unwanted folders:" -ForegroundColor $YELLOW
    foreach ($folder in $unwantedFolders) {
        Write-Host "   aws s3 rm s3://$Bucket/$folder/ --recursive" -ForegroundColor $CYAN
    }
    Write-Host ""
}

# Check for large folders
$largeFolders = $folderSizes.GetEnumerator() | Where-Object { $_.Value -gt 10 }
if ($largeFolders.Count -gt 0) {
    Write-Host "3. Monitor large folders (>10GB):" -ForegroundColor $YELLOW
    foreach ($folder in $largeFolders) {
        Write-Host "   - $($folder.Key): $($folder.Value) GB" -ForegroundColor $YELLOW
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor $CYAN
Write-Host "✓ Verification Complete!" -ForegroundColor $GREEN
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor $YELLOW
Write-Host "1. Review recommendations above"
Write-Host "2. Create missing folders if needed"
Write-Host "3. Delete unwanted folders if needed"
Write-Host "4. Monitor folder sizes"
Write-Host "5. Implement lifecycle policies"
