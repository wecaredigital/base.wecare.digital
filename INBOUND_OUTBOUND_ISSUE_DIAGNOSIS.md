# Inbound & Outbound Message Issue Diagnosis

**Date:** January 20, 2026  
**Status:** 🔍 INVESTIGATING  
**Issue:** Inbound and outbound messages not working

---

## 🔍 PROBLEM STATEMENT

Users report that inbound and outbound messages are not working. The media type fix was applied, but messages aren't being sent or received properly.

---

## 📊 POTENTIAL CAUSES

### 1. API Endpoint Issue
- **Symptom:** API calls failing
- **Check:** Verify API Gateway endpoint is accessible
- **Solution:** Check API Gateway configuration and Lambda permissions

### 2. Lambda Function Deployment
- **Symptom:** Functions not deployed or outdated
- **Check:** Verify Lambda functions are deployed with latest code
- **Solution:** Redeploy Lambda functions via Amplify

### 3. DynamoDB Table Issues
- **Symptom:** Messages not storing or retrieving
- **Check:** Verify DynamoDB tables exist and have correct permissions
- **Solution:** Check table configuration and IAM policies

### 4. SNS Subscription Issue
- **Symptom:** Inbound messages not triggering handler
- **Check:** Verify SNS topic subscription to Lambda
- **Solution:** Recreate SNS subscription if needed

### 5. WhatsApp API Integration
- **Symptom:** Messages not sending to WhatsApp
- **Check:** Verify AWS Social Messaging API credentials
- **Solution:** Check phone number IDs and API configuration

### 6. S3 Media Storage
- **Symptom:** Media not uploading or retrieving
- **Check:** Verify S3 bucket permissions and configuration
- **Solution:** Check S3 bucket policy and CORS settings

---

## 🔧 DIAGNOSTIC STEPS

### Step 1: Check API Endpoint
```bash
# Test API connectivity
curl -X GET https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod/contacts

# Expected: 200 OK with contacts list
```

### Step 2: Check Lambda Functions
```bash
# List Lambda functions
aws lambda list-functions --query 'Functions[?contains(FunctionName, `wecare`)].FunctionName'

# Check specific function
aws lambda get-function --function-name wecare-messages-read
```

### Step 3: Check DynamoDB Tables
```bash
# List tables
aws dynamodb list-tables

# Check table status
aws dynamodb describe-table --table-name base-wecare-digital-WhatsAppOutboundTable
```

### Step 4: Check CloudWatch Logs
```bash
# View Lambda logs
aws logs tail /aws/lambda/wecare-messages-read --follow

# View inbound handler logs
aws logs tail /aws/lambda/wecare-inbound-whatsapp-handler --follow

# View outbound handler logs
aws logs tail /aws/lambda/wecare-outbound-whatsapp --follow
```

### Step 5: Test Message Sending
```bash
# Run test script
node temp/send-test-media.js

# Check response for errors
```

### Step 6: Check Message Storage
```bash
# Check database
node temp/check-media-in-db.js

# Verify messages are stored
```

---

## 🚀 RECOMMENDED FIXES

### Fix 1: Redeploy Lambda Functions
```bash
# Deploy all Lambda functions
npx ampx sandbox --once

# Or deploy specific function
amplify push --only functions/messages-read --yes
amplify push --only functions/outbound-whatsapp --yes
amplify push --only functions/inbound-whatsapp-handler --yes
```

### Fix 2: Verify API Gateway Configuration
```bash
# Check API Gateway
aws apigatewayv2 get-apis

# Check routes
aws apigatewayv2 get-routes --api-id <api-id>
```

### Fix 3: Check SNS Subscription
```bash
# List SNS subscriptions
aws sns list-subscriptions

# Verify Lambda subscription to SNS topic
aws sns list-subscriptions-by-topic --topic-arn arn:aws:sns:us-east-1:809904170947:base-wecare-digital
```

### Fix 4: Verify S3 Bucket
```bash
# Check S3 bucket
aws s3 ls s3://auth.wecare.digital/

# Check bucket policy
aws s3api get-bucket-policy --bucket auth.wecare.digital
```

### Fix 5: Check IAM Permissions
```bash
# Verify Lambda execution role has correct permissions
aws iam get-role --role-name <lambda-execution-role>

# Check attached policies
aws iam list-attached-role-policies --role-name <lambda-execution-role>
```

---

## 📋 CHECKLIST

### Infrastructure
- [ ] API Gateway endpoint is accessible
- [ ] Lambda functions are deployed
- [ ] DynamoDB tables exist and are accessible
- [ ] S3 bucket exists and is accessible
- [ ] SNS topic exists and has Lambda subscription
- [ ] IAM roles have correct permissions

### Configuration
- [ ] Environment variables are set correctly
- [ ] Phone number IDs are configured
- [ ] API endpoint is correct in frontend
- [ ] Database table names are correct
- [ ] S3 bucket name is correct

### Functionality
- [ ] Outbound messages can be sent
- [ ] Messages are stored in DynamoDB
- [ ] Inbound messages are received
- [ ] Media files are uploaded to S3
- [ ] Pre-signed URLs are generated
- [ ] Messages display in dashboard

---

## 🔄 NEXT STEPS

1. **Run Diagnostics**
   - Execute diagnostic steps above
   - Check CloudWatch logs
   - Verify API connectivity

2. **Identify Root Cause**
   - Review error messages
   - Check Lambda logs
   - Verify configuration

3. **Apply Fix**
   - Redeploy Lambda functions if needed
   - Update configuration if needed
   - Verify permissions if needed

4. **Test**
   - Run test scripts
   - Send test message
   - Verify message storage
   - Check dashboard display

5. **Monitor**
   - Watch CloudWatch logs
   - Monitor error rates
   - Track performance

---

## 📞 SUPPORT

### Resources
- AWS Amplify Docs: https://docs.amplify.aws
- AWS Lambda Docs: https://docs.aws.amazon.com/lambda
- AWS DynamoDB Docs: https://docs.aws.amazon.com/dynamodb
- AWS API Gateway Docs: https://docs.aws.amazon.com/apigateway

### Logs to Check
- `/aws/lambda/wecare-messages-read`
- `/aws/lambda/wecare-outbound-whatsapp`
- `/aws/lambda/wecare-inbound-whatsapp-handler`
- `/aws/apigateway/wecare-dm-api`

---

**Status: 🔍 INVESTIGATING**

Next action: Run diagnostic steps to identify root cause.

