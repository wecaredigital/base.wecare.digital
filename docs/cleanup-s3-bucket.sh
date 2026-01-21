#!/bin/bash

# S3 Bucket Cleanup Script for stream.wecare.digital
# This script safely removes unused folders from the S3 bucket

# Configuration
BUCKET="stream.wecare.digital"
PREFIX="base-wecare-digital"
REGION="us-east-1"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================"
echo "S3 Bucket Cleanup Script"
echo "Bucket: $BUCKET"
echo -e "========================================${NC}"
echo ""

# Step 1: List all objects in the bucket
echo -e "${YELLOW}Step 1: Listing all objects in the bucket...${NC}"
echo -e "${CYAN}Command: aws s3 ls s3://$BUCKET/$PREFIX/ --recursive${NC}"
echo ""

OBJECTS=$(aws s3 ls "s3://$BUCKET/$PREFIX/" --recursive --region $REGION)

if [ -z "$OBJECTS" ]; then
    echo -e "${RED}Bucket is empty or error occurred${NC}"
    exit 1
fi

echo -e "${GREEN}Current bucket contents:${NC}"
echo "$OBJECTS"
echo ""

# Step 2: Identify folders to delete
echo -e "${YELLOW}Step 2: Identifying folders to delete...${NC}"
echo ""

FOLDERS_TO_DELETE=()
FOLDERS_TO_KEEP=("reports/" "bedrock/")

# Parse the output to find unique folders
while IFS= read -r line; do
    if [[ $line =~ PRE\ +(.+)/$ ]]; then
        FOLDER="${BASH_REMATCH[1]}"
        SHOULD_KEEP=false
        
        for KEEP in "${FOLDERS_TO_KEEP[@]}"; do
            if [[ "$FOLDER" == *"$KEEP"* ]]; then
                SHOULD_KEEP=true
                break
            fi
        done
        
        if [ "$SHOULD_KEEP" = false ]; then
            FOLDERS_TO_DELETE+=("$FOLDER")
        fi
    fi
done <<< "$OBJECTS"

echo -e "${GREEN}Folders to KEEP:${NC}"
echo -e "${GREEN}  ✓ base-wecare-digital/reports/${NC}"
echo -e "${GREEN}  ✓ base-wecare-digital/bedrock/kb/whatsapp/${NC}"
echo ""

if [ ${#FOLDERS_TO_DELETE[@]} -gt 0 ]; then
    echo -e "${RED}Folders to DELETE:${NC}"
    for FOLDER in "${FOLDERS_TO_DELETE[@]}"; do
        echo -e "${RED}  ❌ $FOLDER/${NC}"
    done
    echo ""
else
    echo -e "${GREEN}No unused folders found to delete${NC}"
    echo ""
fi

# Step 3: Confirm before deletion
echo -e "${YELLOW}Step 3: Confirmation${NC}"
read -p "Do you want to proceed with deletion? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Cleanup cancelled${NC}"
    exit 0
fi

echo ""

# Step 4: Delete unused folders
echo -e "${YELLOW}Step 4: Deleting unused folders...${NC}"
echo ""

DELETED_COUNT=0
for FOLDER in "${FOLDERS_TO_DELETE[@]}"; do
    FOLDER_PATH="s3://$BUCKET/$PREFIX/$FOLDER/"
    echo -e "${CYAN}Deleting: $FOLDER_PATH${NC}"
    
    if aws s3 rm "$FOLDER_PATH" --recursive --region $REGION; then
        echo -e "${GREEN}✓ Deleted successfully${NC}"
        ((DELETED_COUNT++))
    else
        echo -e "${RED}✗ Error deleting${NC}"
    fi
    echo ""
done

# Step 5: Verify cleanup
echo -e "${YELLOW}Step 5: Verifying cleanup...${NC}"
echo -e "${CYAN}Command: aws s3 ls s3://$BUCKET/$PREFIX/ --recursive${NC}"
echo ""

REMAINING_OBJECTS=$(aws s3 ls "s3://$BUCKET/$PREFIX/" --recursive --region $REGION)

if [ -z "$REMAINING_OBJECTS" ]; then
    echo -e "${YELLOW}Bucket is now empty${NC}"
    echo ""
else
    echo -e "${GREEN}Remaining bucket contents:${NC}"
    echo "$REMAINING_OBJECTS"
    echo ""
fi

# Summary
echo -e "${CYAN}========================================"
echo "Cleanup Summary"
echo -e "========================================${NC}"
echo -e "${GREEN}Folders deleted: $DELETED_COUNT${NC}"
echo -e "${GREEN}Folders kept: 2 (reports, bedrock)${NC}"
echo ""
echo -e "${GREEN}✓ Cleanup completed successfully!${NC}"
