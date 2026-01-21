#!/bin/bash

# Media Storage Fix Verification Script
# This script verifies that media files are properly stored in DynamoDB

set -e

echo "=========================================="
echo "Media Storage Fix Verification"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

echo -e "${YELLOW}1. Checking DynamoDB Message table schema...${NC}"
SCHEMA=$(aws dynamodb describe-table --table-name Message --region us-east-1 2>/dev/null)

# Check for required fields
REQUIRED_FIELDS=("mediaId" "s3Key" "mediaUrl" "awsPhoneNumberId" "senderPhone" "senderName" "receivingPhone")
MISSING_FIELDS=()

for field in "${REQUIRED_FIELDS[@]}"; do
    if echo "$SCHEMA" | grep -q "\"$field\""; then
        echo -e "${GREEN}✅ Field '$field' found${NC}"
    else
        echo -e "${RED}❌ Field '$field' missing${NC}"
        MISSING_FIELDS+=("$field")
    fi
done

if [ ${#MISSING_FIELDS[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All required fields present in schema${NC}"
else
    echo -e "${RED}❌ Missing fields: ${MISSING_FIELDS[*]}${NC}"
    echo "   Run: npx ampx sandbox --once"
    exit 1
fi

echo ""
echo -e "${YELLOW}2. Checking for messages with media in database...${NC}"

# Query messages with mediaId
MESSAGES=$(aws dynamodb scan \
    --table-name Message \
    --filter-expression "attribute_exists(mediaId)" \
    --projection-expression "messageId,mediaId,s3Key,timestamp,direction" \
    --limit 10 \
    --region us-east-1 2>/dev/null)

COUNT=$(echo "$MESSAGES" | jq '.Items | length')

if [ "$COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Found $COUNT messages with media${NC}"
    echo ""
    echo "Sample messages:"
    echo "$MESSAGES" | jq '.Items[] | {messageId: .messageId.S, mediaId: .mediaId.S, s3Key: .s3Key.S, direction: .direction.S}' | head -20
else
    echo -e "${YELLOW}⚠️  No messages with media found yet${NC}"
    echo "   Send a media file to test the fix"
fi

echo ""
echo -e "${YELLOW}3. Checking S3 media files...${NC}"

# List S3 files
S3_FILES=$(aws s3 ls s3://auth.wecare.digital/whatsapp-media/whatsapp-media-outgoing/ --recursive 2>/dev/null | wc -l)

if [ "$S3_FILES" -gt 0 ]; then
    echo -e "${GREEN}✅ Found $S3_FILES media files in S3${NC}"
    echo ""
    echo "Recent files:"
    aws s3 ls s3://auth.wecare.digital/whatsapp-media/whatsapp-media-outgoing/ --recursive | tail -5
else
    echo -e "${YELLOW}⚠️  No media files in S3 yet${NC}"
fi

echo ""
echo -e "${YELLOW}4. Checking Lambda function logs...${NC}"

# Check for recent successful media sends
LOGS=$(aws logs tail /aws/lambda/wecare-outbound-whatsapp --since 1h --region us-east-1 2>/dev/null | grep -i "message_sent.*hasMedia.*true" | tail -3)

if [ -n "$LOGS" ]; then
    echo -e "${GREEN}✅ Found recent media messages in logs${NC}"
    echo "$LOGS"
else
    echo -e "${YELLOW}⚠️  No recent media messages in logs${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Verification Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. If all checks passed: Media fix is working ✅"
echo "2. If schema fields missing: Run 'npx ampx sandbox --once'"
echo "3. If no media files: Send a test media file via WhatsApp"
echo "4. Check dashboard: Open WhatsApp Inbox and verify media displays"
echo ""
