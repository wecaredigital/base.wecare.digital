# WECARE.DIGITAL

Admin platform for WhatsApp, SMS, Email, and Voice messaging.

**Status:** ✅ Production Ready | **Region:** us-east-1 | **Account:** 809904170947

## Quick Start

```bash
npm install
npx ampx sandbox --once
```

## Architecture

- **Frontend:** Next.js + React
- **Backend:** 17 Lambda functions (Python 3.12)
- **Database:** DynamoDB (13 tables)
- **API:** API Gateway + AppSync
- **Auth:** Cognito
- **Storage:** S3

## Features

- WhatsApp messaging (send/receive)
- Contact management
- SMS, Email, Voice support
- Bulk messaging
- AI-powered responses
- Message history with media

## Deployment

All infrastructure is deployed. API endpoint: `https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com`

## Logs

```bash
aws logs tail /aws/lambda/wecare-contacts-read --follow
```
