# Deploy Media Storage Fix

## Quick Start

### 1. Deploy Backend Changes
```bash
npx ampx sandbox --once
```

This command will:
- ✅ Update DynamoDB Message table schema
- ✅ Deploy updated Lambda functions
- ✅ Apply all migrations
- ✅ Verify deployment

**Expected output:**
```
✓ Deployment successful
✓ Message table updated with new fields
✓ Lambda functions deployed
```

### 2. Verify Deployment
```bash
# Check schema was updated
aws dynamodb describe-table --table-name Message --region us-east-1 | grep -A 50 "AttributeDefinitions"
```

Should show these new fields:
- `mediaId`
- `s3Key`
- `mediaUrl`
- `awsPhoneNumberId`
- `senderPhone`
- `senderName`
- `receivingPhone`

### 3. Test the Fix

#### Option A: Manual Test
1. Open WhatsApp Inbox page
2. Select a contact
3. Click attachment button (📎)
4. Select an image/video/document
5. Send the message
6. Verify media displays in the chat

#### Option B: Automated Verification
```bash
bash verify-media-fix.sh
```

This will check:
- ✅ Schema fields exist
- ✅ Media files in database
- ✅ Media files in S3
- ✅ Recent successful sends

### 4. Monitor Logs
```bash
# Watch for successful media sends
aws logs tail /aws/lambda/wecare-outbound-whatsapp --follow --region us-east-1 | grep -i "message_sent.*hasMedia"

# Watch for URL generation
aws logs tail /aws/lambda/wecare-messages-read --follow --region us-east-1 | grep -i "presigned_url"
```

## What Changed

### Files Modified
1. **amplify/data/resource.ts**
   - Added 6 new fields to Message table schema
   - No breaking changes

2. **amplify/functions/messages-read/handler.py**
   - Improved pre-signed URL generation
   - Simplified logic for better reliability

3. **src/lib/api.ts**
   - Ensured media fields are properly normalized

### Database Schema Changes
```typescript
// NEW FIELDS ADDED:
mediaId: a.string(),              // WhatsApp media ID
s3Key: a.string(),                // S3 storage location
mediaUrl: a.string(),             // Pre-signed URL
senderPhone: a.string(),          // Inbound sender phone
senderName: a.string(),           // Inbound sender name
receivingPhone: a.string(),       // Outbound recipient phone
awsPhoneNumberId: a.string(),     // WABA phone number ID
```

## Troubleshooting

### Issue: Deployment fails
```bash
# Clear cache and retry
rm -rf node_modules/.amplify
npx ampx sandbox --once
```

### Issue: Schema fields not showing
```bash
# Force schema update
aws dynamodb update-table \
  --table-name Message \
  --attribute-definitions AttributeName=messageId,AttributeType=S \
  --region us-east-1
```

### Issue: Media still not showing
1. Check CloudWatch logs:
   ```bash
   aws logs tail /aws/lambda/wecare-outbound-whatsapp --since 30m --region us-east-1
   ```

2. Verify S3 files exist:
   ```bash
   aws s3 ls s3://auth.wecare.digital/whatsapp-media/whatsapp-media-outgoing/
   ```

3. Check database:
   ```bash
   aws dynamodb scan --table-name Message \
     --filter-expression "attribute_exists(mediaId)" \
     --limit 5 --region us-east-1
   ```

## Rollback (if needed)

If you need to rollback:

```bash
# 1. Revert schema changes
git checkout amplify/data/resource.ts

# 2. Revert handler changes
git checkout amplify/functions/messages-read/handler.py

# 3. Revert API changes
git checkout src/lib/api.ts

# 4. Redeploy
npx ampx sandbox --once
```

## Performance Impact

- **Minimal** - New fields are optional (nullable)
- **No additional API calls** - URLs generated from existing data
- **Database** - No impact on query performance
- **Storage** - ~100 bytes per message with media

## Success Criteria

After deployment, verify:

✅ Media files upload to S3  
✅ Media files stored in DynamoDB with mediaId + s3Key  
✅ Pre-signed URLs generated on read  
✅ Dashboard displays media correctly  
✅ No errors in CloudWatch logs  

## Support

If you encounter issues:

1. Check logs: `aws logs tail /aws/lambda/wecare-outbound-whatsapp --since 1h`
2. Run verification: `bash verify-media-fix.sh`
3. Review MEDIA_STORAGE_ISSUE_RESOLVED.md for details

---

**Deployment Time**: ~2-3 minutes  
**Downtime**: None  
**Rollback Time**: ~1 minute  
**Risk Level**: Low (backward compatible)
