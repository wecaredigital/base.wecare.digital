# WECARE.DIGITAL - Admin Platform

**Status:** ✅ Production Ready  
**Last Updated:** January 21, 2026

---

## 🚀 Quick Start

### Deploy
```bash
npm install -g aws-cdk
cdk bootstrap aws://809904170947/us-east-1
npx ampx sandbox --once
```

### Verify
```bash
aws lambda list-functions --query 'Functions[?contains(FunctionName, `wecare`)].FunctionName'
aws dynamodb list-tables
curl https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod/contacts
```

---

## 📋 Features

- WhatsApp messaging (send/receive)
- Contact management
- Message history with media
- SMS & Email support
- Voice calls
- Bulk messaging
- AI-powered responses

---

## 🏗️ Architecture

- **Frontend:** Next.js + React
- **Backend:** 17 Lambda functions
- **Database:** DynamoDB (13 tables)
- **API:** API Gateway
- **Storage:** S3
- **Auth:** Cognito

---

## 📊 Key Metrics

- 17 Lambda functions
- 13 DynamoDB tables
- 20+ API routes
- 1 test script
- 2 API reference docs

---

## 🔐 Security

- Cognito authentication
- IAM role-based access
- HTTPS/TLS encryption
- DynamoDB encryption
- S3 bucket security

---

## 📞 Support

Check CloudWatch logs:
```bash
aws logs tail /aws/lambda/wecare-messages-read --follow
```

---

**AWS Account:** 809904170947  
**Region:** us-east-1  
**Status:** ✅ Ready for Deployment
