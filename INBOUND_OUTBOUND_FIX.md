# Inbound & Outbound Message Fix Guide

**Date:** January 20, 2026  
**Status:** 🔧 FIXING  
**Issue:** Inbound and outbound messages not working

---

## 🎯 ROOT CAUSE

The Lambda functions have not been redeployed after the recent code changes. The frontend is trying to call the API, but the backend Lambda functions are either:
1. Not deployed
2. Running old code
3. Missing environment variables
4. Not connected to API Gateway

---

## ✅ SOLUTION

### Step 1: Verify Amplify Backend is Deployed

```bash
# Check Amplify status
amplify status

# Expected output should show:
# - Auth: deployed
# - Data: deployed
# - Functions: deployed
# - Hosting: deployed
```

### Step 2: Redeploy Lambda Functions

```bash
# Option A: Deploy all functions
npx ampx sandbox --once

# Option B: Deploy specific functions
amplify push --only functions/messages-read --yes
amplify push --only functions/outbound-whatsapp --yes
amplify push --only functions/inbound-whatsapp-handler --yes

# Option C: Full deployment
amplify push --yes
```

### Step 3: Verify API Gateway Routes

```bash
# List API Gateway APIs
aws apigatewayv2 get-apis

# Check routes
aws apigatewayv2 get-routes --api-id <api-id>

# Expected routes:
# - GET /contacts
# - POST /contacts
# - GET /messages
# - POST /whatsapp/send
# - DELETE /messages/{messageId}
```

### Step 4: Verify Lambda Functions

```bash
# Check if functions exist
aws lambda list-functions --query 'Functions[?contains(FunctionName, `wecare`)].FunctionName'

# Expected functions:
# - wecare-messages-read
# - wecare-outbound-whatsapp
# - wecare-inbound-whatsapp-handler
# - (and others)
```

### Step 5: Check CloudWatch Logs

```bash
# View messages-read logs
aws logs tail /aws/lambda/wecare-messages-read --follow

# View outbound-whatsapp logs
aws logs tail /aws/lambda/wecare-outbound-whatsapp --follow

# View inbound-whatsapp-handler logs
aws logs tail /aws/lambda/wecare-inbound-whatsapp-handler --follow

# Look for errors or warnings
```

### Step 6: Test API Endpoints

```bash
# Test contacts endpoint
curl -X GET https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod/contacts

# Test messages endpoint
curl -X GET https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod/messages

# Expected: 200 OK with JSON response
```

### Step 7: Test Message Sending

```bash
# Run test script
node temp/send-test-media.js

# Expected output:
# ✅ SUCCESS
# Message ID: [uuid]
# WhatsApp Message ID: [id]
# Status: sent
```

### Step 8: Verify Message Storage

```bash
# Check database
node temp/check-media-in-db.js

# Expected output:
# ✅ SUCCESS - Found X messages
# Message 1: [details]
# Has S3 Key: ✅ YES
# Has Media URL: ✅ YES
```

---

## 🔧 DETAILED DEPLOYMENT STEPS

### Using Amplify CLI

```bash
# 1. Check current status
amplify status

# 2. Deploy backend
amplify push --yes

# 3. Wait for deployment to complete (5-10 minutes)

# 4. Verify deployment
amplify status

# 5. Check logs
amplify logs
```

### Using AWS CLI

```bash
# 1. Deploy Lambda functions
aws lambda update-function-code \
  --function-name wecare-messages-read \
  --zip-file fileb://amplify/functions/messages-read/handler.zip

# 2. Deploy API Gateway
aws apigatewayv2 create-deployment \
  --api-id <api-id> \
  --stage-name prod

# 3. Verify deployment
aws lambda get-function --function-name wecare-messages-read
```

### Using Amplify Gen 2 (Recommended)

```bash
# 1. Deploy using ampx
npx ampx sandbox --once

# 2. Or deploy specific resources
npx ampx pipeline-deploy \
  --branch base \
  --app-id <app-id>
```

---

## 📋 VERIFICATION CHECKLIST

### Backend Deployment
- [ ] Amplify status shows all resources deployed
- [ ] Lambda functions are deployed
- [ ] API Gateway routes are configured
- [ ] Environment variables are set
- [ ] IAM roles have correct permissions

### API Connectivity
- [ ] API endpoint is accessible
- [ ] /contacts endpoint returns 200 OK
- [ ] /messages endpoint returns 200 OK
- [ ] /whatsapp/send endpoint returns 200 OK
- [ ] No CORS errors in browser console

### Message Functionality
- [ ] Can send text messages
- [ ] Can send media messages
- [ ] Messages appear in database
- [ ] Messages display in dashboard
- [ ] Inbound messages are received
- [ ] Outbound messages are sent

### Media Handling
- [ ] Media files upload to S3
- [ ] Pre-signed URLs are generated
- [ ] Media displays in dashboard
- [ ] All media types supported
- [ ] File size limits enforced

---

## 🐛 TROUBLESHOOTING

### If API Endpoint Returns 404

**Problem:** API Gateway route not found

**Solution:**
```bash
# 1. Check API Gateway configuration
aws apigatewayv2 get-apis

# 2. Check routes
aws apigatewayv2 get-routes --api-id <api-id>

# 3. Redeploy API Gateway
amplify push --only api --yes
```

### If Lambda Functions Return 500 Error

**Problem:** Lambda function error

**Solution:**
```bash
# 1. Check CloudWatch logs
aws logs tail /aws/lambda/wecare-messages-read --follow

# 2. Check function configuration
aws lambda get-function --function-name wecare-messages-read

# 3. Redeploy function
amplify push --only functions/messages-read --yes
```

### If Messages Not Storing

**Problem:** DynamoDB table issue

**Solution:**
```bash
# 1. Check table status
aws dynamodb describe-table --table-name base-wecare-digital-WhatsAppOutboundTable

# 2. Check table permissions
aws iam get-role-policy --role-name <lambda-role> --policy-name <policy-name>

# 3. Verify table exists
aws dynamodb list-tables
```

### If Media Not Uploading

**Problem:** S3 bucket issue

**Solution:**
```bash
# 1. Check S3 bucket
aws s3 ls s3://auth.wecare.digital/

# 2. Check bucket policy
aws s3api get-bucket-policy --bucket auth.wecare.digital

# 3. Check CORS configuration
aws s3api get-bucket-cors --bucket auth.wecare.digital
```

### If Inbound Messages Not Received

**Problem:** SNS subscription issue

**Solution:**
```bash
# 1. Check SNS subscriptions
aws sns list-subscriptions

# 2. Verify Lambda subscription
aws sns list-subscriptions-by-topic --topic-arn arn:aws:sns:us-east-1:809904170947:base-wecare-digital

# 3. Recreate subscription if needed
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:809904170947:base-wecare-digital \
  --protocol lambda \
  --notification-endpoint arn:aws:lambda:us-east-1:809904170947:function:wecare-inbound-whatsapp-handler
```

---

## 📊 EXPECTED RESULTS

### After Deployment

✅ **API Endpoints Working**
- GET /contacts → 200 OK
- GET /messages → 200 OK
- POST /whatsapp/send → 200 OK

✅ **Message Sending**
- Text messages send successfully
- Media messages send successfully
- Messages appear in database
- Messages display in dashboard

✅ **Message Receiving**
- Inbound messages are received
- Messages stored in database
- Sender information captured
- Media downloaded and stored

✅ **Media Handling**
- All media types supported
- Files upload to S3
- Pre-signed URLs generated
- Media displays correctly

---

## 🚀 QUICK FIX (5 minutes)

If you need a quick fix:

```bash
# 1. Deploy everything
amplify push --yes

# 2. Wait for completion (5-10 minutes)

# 3. Test
node temp/send-test-media.js

# 4. Verify
node temp/check-media-in-db.js
```

---

## 📞 SUPPORT

### Resources
- Amplify Docs: https://docs.amplify.aws
- Lambda Docs: https://docs.aws.amazon.com/lambda
- API Gateway Docs: https://docs.aws.amazon.com/apigateway
- DynamoDB Docs: https://docs.aws.amazon.com/dynamodb

### Logs to Monitor
- `/aws/lambda/wecare-messages-read`
- `/aws/lambda/wecare-outbound-whatsapp`
- `/aws/lambda/wecare-inbound-whatsapp-handler`
- `/aws/apigateway/wecare-dm-api`

---

**Status: 🔧 FIXING**

**Next Action:** Run `amplify push --yes` to deploy all backend changes.

