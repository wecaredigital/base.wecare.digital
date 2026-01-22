# Deployment Guide

**Date**: 2026-01-21  
**Status**: Ready for Deployment  
**Prerequisites**: AWS credentials configured, Amplify backend setup

---

## Prerequisites

### 1. AWS Credentials
Ensure AWS credentials are configured:
```bash
aws configure
# Enter:
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]
# Default region: us-east-1
# Default output format: json
```

### 2. Node.js & npm
```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

### 3. Amplify CLI
```bash
npm install -g @aws-amplify/cli
ampx --version
```

### 4. AWS Account
- Account ID: 809904170947
- Region: us-east-1
- Permissions: Full access to Amplify, Lambda, DynamoDB, S3, IAM

---

## Deployment Steps

### Step 1: Verify Configuration Files

Check that the following files have been updated:

**`amplify/storage/resource.ts`**:
```bash
grep -n "base-wecare-digital/reports" amplify/storage/resource.ts
```
Expected: Should show `base-wecare-digital/reports/*` (not wildcard)

**`amplify/functions/shared/config.ts`**:
```bash
grep -n "MEDIA_BUCKET\|REPORT_PREFIX" amplify/functions/shared/config.ts
```
Expected: Should show S3 configuration

**`amplify/iam-policies.ts`**:
```bash
grep -n "whatsapp-media\|base-wecare-digital/reports" amplify/iam-policies.ts
```
Expected: Should show specific S3 ARNs (not wildcards)

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- @aws-amplify/backend
- @aws-amplify/backend-cli
- aws-amplify
- next
- react

### Step 3: Build Next.js Application

```bash
npm run build
```

This will:
- Compile TypeScript
- Build Next.js application
- Generate optimized production bundle

### Step 4: Deploy to AWS

```bash
npm run amplify:deploy
```

This will:
- Deploy Amplify backend (auth, data, storage)
- Deploy Lambda functions
- Create/update DynamoDB tables
- Configure S3 bucket access
- Update IAM policies
- Deploy Next.js frontend

**Expected Output**:
```
✓ Deployment successful
✓ Backend deployed to AWS
✓ Frontend deployed to Amplify Hosting
✓ API endpoints configured
✓ S3 bucket configured
```

### Step 5: Verify Deployment

After deployment completes, verify:

**Check AWS Resources**:
```bash
# List S3 structure
aws s3 ls s3://stream.wecare.digital/ --recursive

# Check Lambda functions
aws lambda list-functions --query "Functions[?contains(FunctionName, 'wecare')]"

# Check DynamoDB tables
aws dynamodb list-tables --query "TableNames[?contains(@, 'base-wecare-digital')]"

# Check SQS queues
aws sqs list-queues --query "QueueUrls[?contains(@, 'base-wecare-digital')]"
```

**Check Amplify Deployment**:
```bash
# Get deployment status
ampx status

# Get API endpoints
ampx outputs
```

---

## Testing After Deployment

### Test 1: WhatsApp Inbound Media

1. Send WhatsApp message with media to +91 93309 94400
2. Check S3 for media file:
   ```bash
   aws s3 ls s3://stream.wecare.digital/whatsapp-media/whatsapp-media-incoming/ --recursive
   ```
3. Expected: Media file should appear in folder

### Test 2: WhatsApp Outbound Media

1. Send WhatsApp message with media from admin dashboard
2. Check S3 for media file:
   ```bash
   aws s3 ls s3://stream.wecare.digital/whatsapp-media/whatsapp-media-outgoing/ --recursive
   ```
3. Expected: Media file should appear in folder

### Test 3: Bulk Job Reports

1. Create bulk job from admin dashboard
2. Cancel job
3. Check S3 for report:
   ```bash
   aws s3 ls s3://stream.wecare.digital/base-wecare-digital/reports/ --recursive
   ```
4. Expected: Report JSON file should appear

### Test 4: CloudWatch Logs

1. Check Lambda logs:
   ```bash
   aws logs tail /aws/lambda/wecare-inbound-whatsapp --follow
   ```
2. Expected: No S3 permission errors

---

## Troubleshooting

### Issue: `ampx` command not found

**Solution**:
```bash
npm install -g @aws-amplify/cli
npm install -g @aws-amplify/backend-cli
```

### Issue: AWS credentials not configured

**Solution**:
```bash
aws configure
# Enter your AWS credentials
```

### Issue: S3 permission denied

**Solution**:
1. Check IAM role has correct permissions:
   ```bash
   aws iam get-role-policy --role-name base-wecare-digital --policy-name S3Access
   ```
2. Verify S3 bucket exists:
   ```bash
   aws s3 ls s3://stream.wecare.digital/
   ```

### Issue: Lambda function timeout

**Solution**:
1. Check Lambda logs for errors
2. Increase timeout in `amplify/functions/*/resource.ts`
3. Redeploy

### Issue: DynamoDB table not found

**Solution**:
1. Check table exists:
   ```bash
   aws dynamodb describe-table --table-name Message
   ```
2. If missing, redeploy backend:
   ```bash
   npm run amplify:deploy
   ```

---

## Rollback Procedure

If deployment fails or causes issues:

### Option 1: Rollback to Previous Version

```bash
# Get previous deployment
ampx history

# Rollback to previous version
ampx rollback --version <version-id>
```

### Option 2: Manual Rollback

1. Revert code changes:
   ```bash
   git revert HEAD
   ```

2. Redeploy:
   ```bash
   npm run amplify:deploy
   ```

### Option 3: Restore from Backup

1. Check DynamoDB backups:
   ```bash
   aws dynamodb list-backups
   ```

2. Restore from backup:
   ```bash
   aws dynamodb restore-table-from-backup \
     --target-table-name Message \
     --backup-arn <backup-arn>
   ```

---

## Post-Deployment Checklist

- [ ] Deployment completed successfully
- [ ] S3 structure verified (3 folders)
- [ ] Lambda functions deployed (16 functions)
- [ ] DynamoDB tables created (11 tables)
- [ ] SQS queues created (5 queues)
- [ ] IAM policies applied
- [ ] WhatsApp inbound media tested
- [ ] WhatsApp outbound media tested
- [ ] Bulk job reports tested
- [ ] CloudWatch logs checked
- [ ] No errors in logs
- [ ] Frontend accessible
- [ ] API endpoints working

---

## Monitoring After Deployment

### CloudWatch Logs

Monitor Lambda logs:
```bash
aws logs tail /aws/lambda/wecare-inbound-whatsapp --follow
aws logs tail /aws/lambda/wecare-outbound-whatsapp --follow
aws logs tail /aws/lambda/wecare-bulk-job-control --follow
```

### CloudWatch Metrics

Check Lambda metrics:
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=wecare-inbound-whatsapp \
  --start-time 2026-01-21T00:00:00Z \
  --end-time 2026-01-21T23:59:59Z \
  --period 3600 \
  --statistics Average,Maximum
```

### S3 Monitoring

Monitor S3 usage:
```bash
aws s3 ls s3://stream.wecare.digital/ --recursive --summarize
```

---

## Support & Documentation

**For Questions About**:
- **Deployment**: See this file
- **AWS Resources**: See `docs/AWS_RESOURCES_TO_S3_MAPPING.md`
- **S3 Structure**: See `docs/QUICK_REFERENCE.md`
- **Current State**: See `docs/CURRENT_STATE_SUMMARY.md`
- **Verification**: See `docs/VERIFICATION_COMPLETE.md`

---

## Environment Variables

### Lambda Environment Variables

These are automatically set by Amplify during deployment:

```
CONTACTS_TABLE=Contact
MESSAGES_TABLE=Message
MEDIA_FILES_TABLE=MediaFile
SYSTEM_CONFIG_TABLE=SystemConfig
AI_INTERACTIONS_TABLE=AIInteraction
MEDIA_BUCKET=stream.wecare.digital
MEDIA_INBOUND_PREFIX=whatsapp-media/whatsapp-media-incoming/
MEDIA_OUTBOUND_PREFIX=whatsapp-media/whatsapp-media-outgoing/
REPORT_BUCKET=stream.wecare.digital
REPORT_PREFIX=base-wecare-digital/reports/
AWS_REGION=us-east-1
```

### Frontend Environment Variables

These are automatically set by Amplify during deployment:

```
NEXT_PUBLIC_GRAPHQL_ENDPOINT=<amplify-graphql-endpoint>
NEXT_PUBLIC_AWS_REGION=us-east-1
```

---

## Deployment Timeline

**Typical deployment takes 10-15 minutes**:

1. **Pre-deployment checks** (1 min)
   - Verify credentials
   - Check configuration

2. **Backend deployment** (5-7 min)
   - Deploy Amplify backend
   - Create/update DynamoDB tables
   - Deploy Lambda functions
   - Configure S3 bucket

3. **Frontend deployment** (3-5 min)
   - Build Next.js application
   - Deploy to Amplify Hosting
   - Configure API endpoints

4. **Post-deployment verification** (1-2 min)
   - Verify resources created
   - Check logs for errors

---

## Success Criteria

Deployment is successful when:

✅ All AWS resources created  
✅ Lambda functions deployed  
✅ DynamoDB tables created  
✅ S3 bucket configured  
✅ IAM policies applied  
✅ Frontend accessible  
✅ API endpoints working  
✅ No errors in CloudWatch logs  

---

**Deployment Guide**: ✅ COMPLETE  
**Date**: 2026-01-21  
**Status**: Ready for Deployment

