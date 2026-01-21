# WECARE.DIGITAL - Admin Platform

**Status:** ✅ Ready for Deployment  
**Last Updated:** January 21, 2026

---

## 🚀 Quick Start

### Deploy Backend
```bash
# Bootstrap AWS region (one-time)
npm install -g aws-cdk
cdk bootstrap aws://809904170947/us-east-1

# Deploy
npx ampx sandbox --once
```

### Verify Deployment
```bash
# Check Lambda functions
aws lambda list-functions --query 'Functions[?contains(FunctionName, `wecare`)].FunctionName'

# Check DynamoDB tables
aws dynamodb list-tables

# Test API
curl -X GET https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod/contacts
```

---

## 📋 What's Included

### Frontend
- WhatsApp Direct Messages dashboard
- Contact management
- Message history with media support
- Real-time message display

### Backend
- 17 Lambda functions for messaging operations
- DynamoDB tables for data storage
- API Gateway for REST endpoints
- SNS for inbound message routing
- S3 for media storage

### Messaging Channels
- WhatsApp (primary)
- SMS
- Email
- Voice calls

---

## 🔧 Architecture

```
Frontend (Next.js)
    ↓
API Gateway
    ↓
Lambda Functions
    ↓
DynamoDB + S3
```

---

## 📊 Key Features

- ✅ Send/receive WhatsApp messages
- ✅ Media support (images, videos, audio, documents)
- ✅ Contact management
- ✅ Message history
- ✅ Bulk messaging
- ✅ AI-powered responses
- ✅ Rate limiting
- ✅ Error handling & logging

---

## 🔐 Security

- Cognito authentication
- IAM role-based access
- HTTPS/TLS encryption
- DynamoDB encryption
- S3 bucket security

---

## 📞 Support

For issues:
1. Check CloudWatch logs: `aws logs tail /aws/lambda/wecare-messages-read`
2. Verify DynamoDB tables: `aws dynamodb list-tables`
3. Check API Gateway: `aws apigatewayv2 get-apis`

---

## 📝 Recent Changes

- Fixed DynamoDB table name mismatch
- Updated all Lambda functions to use Amplify Gen 2 schema
- Cleaned up unused files and documentation
- Removed unused Lambda functions

---

**AWS Account:** 809904170947  
**Region:** us-east-1  
**Status:** ✅ Ready for Deployment
