# Quick Start - Deploy & Verify

**Status:** ✅ READY FOR DEPLOYMENT  
**Time:** 15-20 minutes total

---

## 🚀 Deploy (5-10 minutes)

```bash
amplify push --yes
```

Wait for completion. You'll see:
```
✔ Successfully pulled backend environment dev from the cloud.
✔ Compiled successfully.
✔ Zipping Lambda functions...
✔ Uploading Lambda functions...
✔ Updating API Gateway...
✔ Updating SNS subscriptions...
✔ Deployment complete!
```

---

## ✅ Verify (5 minutes)

### 1. Check Lambda Functions
```bash
aws lambda list-functions --query 'Functions[?contains(FunctionName, `wecare`)].FunctionName'
```
Expected: List of wecare-* functions

### 2. Check DynamoDB Tables
```bash
aws dynamodb list-tables
```
Expected: Message, Contact, VoiceCall, etc.

### 3. Check SNS Subscription
```bash
aws sns list-subscriptions-by-topic --topic-arn arn:aws:sns:us-east-1:809904170947:base-wecare-digital
```
Expected: Lambda subscription to wecare-inbound-whatsapp-handler

### 4. Test API
```bash
curl -X GET https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod/contacts
```
Expected: 200 OK with contacts list

---

## 🧪 Test (5 minutes)

### 1. Send Test Message
```bash
node temp/send-test-media.js
```
Expected: SUCCESS - message sent

### 2. Verify Storage
```bash
node temp/check-media-in-db.js
```
Expected: SUCCESS - message found in database

### 3. Check Logs
```bash
aws logs tail /aws/lambda/wecare-messages-read --follow
```
Expected: No errors, successful operations

---

## 🎯 Test Dashboard

1. Open https://base.wecare.digital
2. Navigate to WhatsApp Direct Messages
3. Verify contacts load
4. Verify messages display
5. Send test message
6. Verify message appears

---

## 🔴 Troubleshooting

### API Returns 404
```bash
# Check Lambda functions
aws lambda list-functions --query 'Functions[?contains(FunctionName, `wecare`)].FunctionName'

# Check API Gateway
aws apigatewayv2 get-apis
```

### Messages Don't Display
```bash
# Check DynamoDB table
aws dynamodb describe-table --table-name Message

# Check Lambda logs
aws logs tail /aws/lambda/wecare-messages-read --follow
```

### Media Doesn't Display
```bash
# Check S3 bucket
aws s3 ls s3://auth.wecare.digital/

# Check browser console for CORS errors
```

---

## 📊 What Was Fixed

- ✅ Updated 14 Lambda functions with correct table names
- ✅ Changed table references from old names to Amplify Gen 2 schema
- ✅ Unified Message table (was separate Inbound/Outbound)
- ✅ Fixed DynamoDB table name mismatch

---

## 📈 Expected Results

### Before Deployment
- ❌ Dashboard shows no messages
- ❌ API returns 404 errors
- ❌ Lambda functions not found

### After Deployment
- ✅ Dashboard shows all messages
- ✅ API returns 200 OK
- ✅ Lambda functions deployed
- ✅ Media displays correctly
- ✅ Sender names show
- ✅ Inbound messages received

---

## 📞 Need Help?

1. Check FINAL_STATUS_SUMMARY.md for complete overview
2. Check DEPLOYMENT_STEPS.md for detailed steps
3. Check DASHBOARD_DEEP_CHECK.md for dashboard analysis
4. Check BUILD_STATUS_REPORT.md for build status

---

**Status: ✅ READY FOR DEPLOYMENT**

**Next Step:** Run `amplify push --yes`
