# Deployment Guide

**Status:** ✅ Ready for Deployment

---

## Prerequisites

- AWS account (809904170947)
- AWS CLI configured
- Node.js 18+
- npm

---

## Step 1: Bootstrap AWS Region (One-time)

```bash
npm install -g aws-cdk
cdk bootstrap aws://809904170947/us-east-1
```

---

## Step 2: Deploy Backend

```bash
npx ampx sandbox --once
```

**Expected time:** 5-10 minutes

---

## Step 3: Verify Deployment

```bash
# Check Lambda functions
aws lambda list-functions --query 'Functions[?contains(FunctionName, `wecare`)].FunctionName'

# Check DynamoDB tables
aws dynamodb list-tables

# Check SNS subscription
aws sns list-subscriptions-by-topic --topic-arn arn:aws:sns:us-east-1:809904170947:base-wecare-digital

# Test API
curl -X GET https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod/contacts
```

---

## Step 4: Test Dashboard

1. Open https://base.wecare.digital
2. Navigate to WhatsApp Direct Messages
3. Verify contacts load
4. Send test message
5. Verify message appears

---

## Troubleshooting

### Bootstrap Fails
- Check AWS permissions
- Verify AWS credentials: `aws sts get-caller-identity`
- Try AWS Console bootstrap

### Deployment Fails
- Check CloudFormation stack status
- Review CloudWatch logs
- Check Amplify deployment logs

### API Returns 404
- Verify Lambda functions deployed
- Check API Gateway routes
- Review Lambda logs

---

## Success Criteria

- ✅ Lambda functions deployed
- ✅ DynamoDB tables created
- ✅ API endpoints return 200 OK
- ✅ Dashboard loads without errors
- ✅ Messages display correctly
- ✅ Media displays correctly

---

**Status:** ✅ Ready for Deployment
