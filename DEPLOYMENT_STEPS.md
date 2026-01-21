# Deployment Steps - Fix Inbound & Outbound Messages

**Date:** January 21, 2026  
**Status:** Ready for Deployment  
**Estimated Time:** 15-20 minutes

---

## 🚀 Quick Start (Copy & Paste)

```bash
# Step 1: Deploy all backend changes
amplify push --yes

# Step 2: Wait for deployment to complete (5-10 minutes)

# Step 3: Verify deployment
amplify status

# Step 4: Test message sending
node temp/send-test-media.js

# Step 5: Verify message storage
node temp/check-media-in-db.js
```

---

## 📋 Detailed Deployment Steps

### Step 1: Deploy Lambda Functions & Backend

```bash
amplify push --yes
```

**What this does:**
- Deploys all 14 updated Lambda functions with new table names
- Updates API Gateway integrations
- Verifies SNS subscription for inbound messages
- Deploys frontend changes
- Builds and deploys to Amplify Hosting

**Expected output:**
```
✔ Successfully pulled backend environment dev from the cloud.
✔ Compiled successfully.
✔ Zipping Lambda functions...
✔ Uploading Lambda functions...
✔ Updating API Gateway...
✔ Updating SNS subscriptions...
✔ Deployment complete!
```

**Time:** 5-10 minutes

---

### Step 2: Verify Deployment

```bash
# Check Amplify status
amplify status

# Expected output should show:
# - Auth: deployed
# - Data: deployed
# - Functions: deployed
# - Hosting: deployed
```

---

### Step 3: Verify Lambda Functions

```bash
# List all deployed Lambda functions
aws lambda list-functions --query 'Functions[?contains(FunctionName, `wecare`)].FunctionName'

# Expected functions:
# - wecare-messages-read
# - wecare-outbound-whatsapp
# - wecare-inbound-whatsapp-handler
# - wecare-contacts-create
# - wecare-contacts-read
# - wecare-contacts-update
# - wecare-contacts-delete
# - wecare-contacts-search
# - wecare-outbound-sms
# - wecare-outbound-email
# - wecare-outbound-voice
# - wecare-voice-calls-read
# - wecare-messages-delete
# - (and others)
```

---

### Step 4: Verify DynamoDB Tables

```bash
# List all DynamoDB tables
aws dynamodb list-tables

# Expected tables:
# - Contact
# - Message
# - VoiceCall
# - RateLimitTracker
# - MediaFile
# - AIInteraction
# - (and others)

# Verify Message table exists and is accessible
aws dynamodb describe-table --table-name Message

# Expected output should show:
# - TableStatus: ACTIVE
# - ItemCount: 0 (or number of existing messages)
# - BillingModeSummary: PAY_PER_REQUEST
```

---

### Step 5: Verify SNS Subscription

```bash
# Check SNS subscriptions
aws sns list-subscriptions-by-topic \
  --topic-arn arn:aws:sns:us-east-1:809904170947:base-wecare-digital

# Expected output should show:
# - SubscriptionArn: arn:aws:sns:us-east-1:809904170947:base-wecare-digital:...
# - Protocol: lambda
# - Endpoint: arn:aws:lambda:us-east-1:809904170947:function:wecare-inbound-whatsapp-handler
```

---

### Step 6: Test Message Sending

```bash
# Send a test message
node temp/send-test-media.js

# Expected output:
# ✅ SUCCESS
# Message ID: [uuid]
# WhatsApp Message ID: [id]
# Status: sent
```

---

### Step 7: Verify Message Storage

```bash
# Check if message was stored in database
node temp/check-media-in-db.js

# Expected output:
# ✅ SUCCESS - Found X messages
# Message 1: [details]
# Has S3 Key: ✅ YES
# Has Media URL: ✅ YES
```

---

### Step 8: Check CloudWatch Logs

```bash
# View messages-read logs
aws logs tail /aws/lambda/wecare-messages-read --follow

# View outbound-whatsapp logs
aws logs tail /aws/lambda/wecare-outbound-whatsapp --follow

# View inbound-whatsapp-handler logs
aws logs tail /aws/lambda/wecare-inbound-whatsapp-handler --follow

# Look for:
# - No errors
# - Successful message operations
# - Correct table names in logs
```

---

### Step 9: Test Dashboard

1. Open the dashboard: https://base.wecare.digital
2. Navigate to WhatsApp Direct Messages
3. Send a test message
4. Verify message appears in dashboard
5. Verify media displays correctly (if media was sent)

---

### Step 10: Test Inbound Messages

1. Send a WhatsApp message to the business number
2. Wait 5-10 seconds
3. Refresh dashboard
4. Verify inbound message appears
5. Verify sender name is displayed

---

## 🔧 Troubleshooting

### If Lambda Functions Don't Deploy

```bash
# Check for errors
amplify push --yes

# If still failing, try:
amplify delete
amplify init
amplify push --yes
```

### If DynamoDB Tables Don't Exist

```bash
# Check table status
aws dynamodb describe-table --table-name Message

# If table doesn't exist, create it manually:
aws dynamodb create-table \
  --table-name Message \
  --attribute-definitions AttributeName=messageId,AttributeType=S \
  --key-schema AttributeName=messageId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### If SNS Subscription Missing

```bash
# Create subscription manually:
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:809904170947:base-wecare-digital \
  --protocol lambda \
  --notification-endpoint arn:aws:lambda:us-east-1:809904170947:function:wecare-inbound-whatsapp-handler
```

### If Messages Not Appearing

1. Check CloudWatch logs for errors
2. Verify Lambda functions are deployed
3. Verify DynamoDB tables exist
4. Verify SNS subscription is active
5. Check IAM permissions

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Lambda functions deployed successfully
- [ ] DynamoDB tables exist and are accessible
- [ ] SNS subscription is active
- [ ] Test message sends successfully
- [ ] Message appears in database
- [ ] Message displays in dashboard
- [ ] Media displays correctly
- [ ] Inbound messages are received
- [ ] CloudWatch logs show no errors
- [ ] API endpoints return 200 OK

---

## 📊 Expected Results

### Before Deployment
- ❌ Outbound messages: FAIL
- ❌ Inbound messages: FAIL
- ❌ Dashboard: Empty
- ❌ Media: Not displaying

### After Deployment
- ✅ Outbound messages: WORKING
- ✅ Inbound messages: WORKING
- ✅ Dashboard: Shows all messages
- ✅ Media: Displaying correctly

---

## 🎯 Success Criteria

Deployment is successful when:

1. ✅ `amplify push --yes` completes without errors
2. ✅ All Lambda functions are deployed
3. ✅ DynamoDB tables exist and are accessible
4. ✅ SNS subscription is active
5. ✅ Test message sends and appears in database
6. ✅ Dashboard displays messages
7. ✅ Media displays correctly
8. ✅ Inbound messages are received
9. ✅ CloudWatch logs show no errors
10. ✅ API endpoints return 200 OK

---

## 📞 Support

If you encounter issues:

1. Check CloudWatch logs: `/aws/lambda/wecare-messages-read`
2. Verify DynamoDB tables: `aws dynamodb list-tables`
3. Check SNS subscriptions: `aws sns list-subscriptions`
4. Review IAM permissions: Lambda execution role
5. Check API Gateway: `aws apigatewayv2 get-apis`

---

**Status: Ready for Deployment**

Run `amplify push --yes` to deploy all changes.
