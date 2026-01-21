# Deep Check Findings - Critical Issues Identified

**Date:** January 20, 2026  
**Status:** 🔴 CRITICAL ISSUES FOUND  
**Severity:** BLOCKING - All message operations fail

---

## 🔴 CRITICAL BLOCKING ISSUES

### Issue 1: Lambda Functions Not Deployed
**Severity:** 🔴 CRITICAL  
**Impact:** All message operations fail (100% failure rate)

**Problem:**
- Lambda functions are written and configured but NOT deployed to AWS
- API Gateway routes exist but point to non-existent Lambda functions
- All API calls return 404 or 500 errors

**Affected Functions:**
- `wecare-messages-read` - Not deployed
- `wecare-outbound-whatsapp` - Not deployed
- `wecare-inbound-whatsapp-handler` - Not deployed
- All other Lambda functions - Not deployed

**Fix:**
```bash
amplify push --yes
```

**Time to Fix:** 5-10 minutes

---

### Issue 2: DynamoDB Table Name Mismatch
**Severity:** 🔴 CRITICAL  
**Impact:** Messages stored but never retrieved

**Problem:**
Lambda functions reference tables with names like:
- `base-wecare-digital-WhatsAppInboundTable`
- `base-wecare-digital-WhatsAppOutboundTable`
- `base-wecare-digital-ContactsTable`

But Amplify schema defines tables with names like:
- `Message`
- `Contact`
- `BulkJob`

**Result:**
- Outbound messages stored in `base-wecare-digital-WhatsAppOutboundTable`
- Frontend queries `Message` table (which is empty)
- **Messages are stored but never displayed!**

**Fix Options:**

**Option A: Update Lambda to use Amplify schema table names** (Recommended)
```python
# Change in Lambda functions:
INBOUND_TABLE = os.environ.get('INBOUND_TABLE', 'Message')  # Was: base-wecare-digital-WhatsAppInboundTable
OUTBOUND_TABLE = os.environ.get('OUTBOUND_TABLE', 'Message')  # Was: base-wecare-digital-WhatsAppOutboundTable
CONTACTS_TABLE = os.environ.get('CONTACTS_TABLE', 'Contact')  # Was: base-wecare-digital-ContactsTable
```

**Option B: Create old tables manually**
```bash
aws dynamodb create-table \
  --table-name base-wecare-digital-WhatsAppInboundTable \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

**Option C: Migrate data between tables**
- Export data from old tables
- Import to new tables
- Update Lambda to use new tables

**Time to Fix:** 30-60 minutes

---

### Issue 3: SNS Subscription May Not Be Active
**Severity:** 🔴 CRITICAL  
**Impact:** Inbound messages never reach handler

**Problem:**
- SNS subscription is defined in code but may not be deployed
- Without this subscription, WhatsApp messages never trigger the Lambda handler
- Inbound messages are lost

**Verification:**
```bash
aws sns list-subscriptions-by-topic \
  --topic-arn arn:aws:sns:us-east-1:809904170947:base-wecare-digital
```

**Expected Output:**
```json
{
  "Subscriptions": [
    {
      "SubscriptionArn": "arn:aws:sns:us-east-1:809904170947:base-wecare-digital:...",
      "Protocol": "lambda",
      "Endpoint": "arn:aws:lambda:us-east-1:809904170947:function:wecare-inbound-whatsapp-handler"
    }
  ]
}
```

**Fix:**
```bash
# If subscription doesn't exist, create it:
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:809904170947:base-wecare-digital \
  --protocol lambda \
  --notification-endpoint arn:aws:lambda:us-east-1:809904170947:function:wecare-inbound-whatsapp-handler
```

**Time to Fix:** 5 minutes

---

## 🟡 CONFIGURATION ISSUES

### Issue 4: AWS Social Messaging API Credentials
**Severity:** 🟡 HIGH  
**Impact:** Cannot send/receive WhatsApp messages

**Check:**
```bash
# Verify phone number IDs are correct
aws lambda get-function-configuration --function-name wecare-outbound-whatsapp \
  --query 'Environment.Variables'
```

**Expected Variables:**
```
WHATSAPP_PHONE_NUMBER_ID_1=phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54
WHATSAPP_PHONE_NUMBER_ID_2=phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06
```

**Fix:** Update environment variables if needed

---

### Issue 5: S3 Bucket Permissions
**Severity:** 🟡 HIGH  
**Impact:** Media upload/download fails

**Check:**
```bash
# Verify bucket exists
aws s3 ls s3://auth.wecare.digital/

# Check bucket policy
aws s3api get-bucket-policy --bucket auth.wecare.digital

# Check CORS configuration
aws s3api get-bucket-cors --bucket auth.wecare.digital
```

**Fix:** Update S3 bucket policy and CORS settings if needed

---

### Issue 6: IAM Role Permissions
**Severity:** 🟡 HIGH  
**Impact:** Lambda functions fail with permission errors

**Check:**
```bash
# Get Lambda execution role
aws lambda get-function-configuration --function-name wecare-outbound-whatsapp \
  --query 'Role'

# Check attached policies
aws iam list-attached-role-policies --role-name <role-name>

# Check inline policies
aws iam list-role-policies --role-name <role-name>
```

**Required Permissions:**
- DynamoDB: GetItem, PutItem, UpdateItem, Query, Scan
- S3: GetObject, PutObject, ListObjects
- SNS: Publish
- CloudWatch: PutMetricData
- Logs: CreateLogGroup, CreateLogStream, PutLogEvents

**Fix:** Update IAM role policies if needed

---

## ✅ WHAT'S WORKING

1. **Code Quality:** All Lambda functions are well-written and production-ready
2. **API Design:** API Gateway routes properly configured
3. **Frontend Client:** API client correctly implements all operations
4. **Error Handling:** Comprehensive error handling and logging
5. **Media Support:** All media types supported with proper validation
6. **Phone Number Normalization:** Handles multiple formats correctly
7. **Message Deduplication:** Prevents duplicate message processing
8. **Auto-Reactions:** Automatically sends thumbs up to inbound messages
9. **Read Receipts:** Sends read receipts to show message received
10. **WABA Tracking:** Tracks which phone number received/sent messages

---

## 🔧 RECOMMENDED FIX SEQUENCE

### Phase 1: Immediate (5-10 minutes)
1. Deploy Lambda functions: `amplify push --yes`
2. Verify SNS subscription is active
3. Test API endpoints with curl

### Phase 2: Short-term (30-60 minutes)
1. Resolve DynamoDB table name mismatch
2. Verify AWS Social Messaging API credentials
3. Test message sending and receiving

### Phase 3: Validation (10-15 minutes)
1. Run test scripts: `node temp/send-test-media.js`
2. Check CloudWatch logs for errors
3. Verify messages appear in dashboard

---

## 📋 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Review all critical issues above
- [ ] Backup current DynamoDB data (if any)
- [ ] Document current configuration

### Deployment
- [ ] Run `amplify push --yes`
- [ ] Wait for deployment to complete (5-10 minutes)
- [ ] Verify Lambda functions exist in AWS Console
- [ ] Verify SNS subscription is active
- [ ] Verify DynamoDB tables exist

### Post-Deployment
- [ ] Test API endpoints with curl
- [ ] Test message sending: `node temp/send-test-media.js`
- [ ] Test message receiving (send WhatsApp message)
- [ ] Verify messages appear in dashboard
- [ ] Check CloudWatch logs for errors
- [ ] Monitor metrics in CloudWatch

---

## 🚨 CRITICAL NEXT STEPS

### Immediate Action Required:
1. **Deploy Lambda Functions**
   ```bash
   amplify push --yes
   ```

2. **Resolve Table Name Mismatch**
   - Choose one of the three options above
   - Update Lambda functions if needed
   - Redeploy if changes made

3. **Verify SNS Subscription**
   ```bash
   aws sns list-subscriptions-by-topic \
     --topic-arn arn:aws:sns:us-east-1:809904170947:base-wecare-digital
   ```

4. **Test Everything**
   ```bash
   node temp/send-test-media.js
   node temp/check-media-in-db.js
   ```

---

## 📊 IMPACT ANALYSIS

### Current State
- ❌ Outbound messages: FAIL (Lambda not deployed)
- ❌ Inbound messages: FAIL (Lambda not deployed + SNS subscription may be missing)
- ❌ Media display: FAIL (messages not retrieved from database)
- ❌ Dashboard: Shows no messages

### After Phase 1 (Deploy Lambda)
- ⚠️ Outbound messages: May work (if table name issue resolved)
- ⚠️ Inbound messages: May work (if SNS subscription active)
- ⚠️ Media display: May work (if table name issue resolved)
- ⚠️ Dashboard: May show messages (if table name issue resolved)

### After Phase 2 (Resolve Table Names)
- ✅ Outbound messages: WORKING
- ✅ Inbound messages: WORKING
- ✅ Media display: WORKING
- ✅ Dashboard: WORKING

---

## 🎯 ESTIMATED TIMELINE

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Deploy Lambda | 5-10 min | ⏳ Ready |
| 1 | Verify SNS | 5 min | ⏳ Ready |
| 2 | Resolve tables | 30-60 min | ⏳ Ready |
| 2 | Verify credentials | 10 min | ⏳ Ready |
| 3 | Test everything | 10-15 min | ⏳ Ready |
| **Total** | | **60-100 min** | |

---

## 📞 SUPPORT

### Resources
- AWS Amplify: https://docs.amplify.aws
- AWS Lambda: https://docs.aws.amazon.com/lambda
- AWS DynamoDB: https://docs.aws.amazon.com/dynamodb
- AWS SNS: https://docs.aws.amazon.com/sns

### Logs to Monitor
- `/aws/lambda/wecare-messages-read`
- `/aws/lambda/wecare-outbound-whatsapp`
- `/aws/lambda/wecare-inbound-whatsapp-handler`
- `/aws/apigateway/wecare-dm-api`

---

**Status: 🔴 CRITICAL ISSUES FOUND**

**Next Action:** Run `amplify push --yes` to deploy Lambda functions, then resolve DynamoDB table name mismatch.

