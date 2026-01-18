# WECARE.DIGITAL Admin Platform

Multi-channel messaging system for WhatsApp, SMS, and Email with AI-powered automation.

**Status**: ✓ DEPLOYED | **Environment**: Production | **Last Updated**: 2026-01-18

## Quick Links

📚 [Full Documentation](docs/README.md) | 🚀 [Deployment Guide](docs/deployment/GUIDE.md) | ☁️ [AWS Resources](docs/aws/RESOURCES.md)

---

## Overview

WECARE.DIGITAL is a comprehensive admin platform for managing multi-channel communications with contacts.

### Supported Channels
- **WhatsApp**: AWS End User Messaging Social (2 phone numbers, GREEN rating)
- **SMS**: AWS Pinpoint SMS service
- **Email**: Amazon SES
- **AI Automation**: Amazon Bedrock with Knowledge Base

### Tech Stack
- **Frontend**: React 18 + Next.js 14 + TypeScript
- **Backend**: AWS Amplify Gen 2
- **Database**: DynamoDB (11 tables, PAY_PER_REQUEST)
- **Functions**: AWS Lambda (16 functions, Python 3.12)
- **Authentication**: Amazon Cognito
- **Storage**: Amazon S3 (4 buckets)
- **Messaging**: SQS (5 queues), SNS
- **AI**: Amazon Bedrock (Nova Pro)
- **Monitoring**: CloudWatch

### AWS Configuration
- **Account**: 809904170947
- **Region**: us-east-1
- **Branch**: base (production)

---

## Active Deployment

### Resources Summary

| Resource Type | Count | Status |
|--------------|-------|--------|
| Lambda Functions | 16 | ✓ ACTIVE |
| DynamoDB Tables | 11 | ✓ ACTIVE |
| SQS Queues | 5 | ✓ ACTIVE |
| S3 Buckets | 4 | ✓ ACTIVE |
| WhatsApp Phone Numbers | 2 | ✓ GREEN RATING |
| WhatsApp Business Accounts | 2 | ✓ COMPLETE |
| Bedrock Agents | 2 | ✓ CONFIGURED |
| Cognito User Pool | 1 | ✓ ACTIVE |
| Bedrock Knowledge Base | 1 | ✓ ACTIVE |
| SNS Topic | 1 | ✓ ACTIVE |
| SES Identity | 1 | ✓ VERIFIED |
| Pinpoint SMS Pool | 1 | ✓ ACTIVE |
| IAM Role | 1 | ✓ ACTIVE |

**Total Active Resources**: 60+

See [AWS Resources Inventory](docs/aws/RESOURCES.md) for complete details.

---

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- AWS CLI configured
- AWS Amplify CLI

### Installation

```bash
# Install dependencies
npm install

# Start local development
npm run dev

# Start Amplify sandbox
npm run amplify
```

### Environment Variables

Create `.env.local`:

```env
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=809904170947
SEND_MODE=DRY_RUN
LOG_LEVEL=DEBUG
```

---

## Deployment

### Branch Strategy
- **base**: Production (SEND_MODE=LIVE) ← Current
- **feature/***: Preview (SEND_MODE=DRY_RUN)
- **release/***: Staging (SEND_MODE=DRY_RUN)
- **hotfix/***: Production (SEND_MODE=LIVE)

### Deploy to Production

```bash
# Via Git push (recommended)
git checkout base
git push origin base

# Via Amplify CLI
npm run amplify:deploy
```

See [Deployment Guide](docs/deployment/GUIDE.md) for detailed instructions.

---

## Features

### 1. Contact Management
- Full CRUD operations
- Search and filter
- Opt-in/opt-out tracking per channel

### 2. Multi-Channel Messaging
- **WhatsApp**: Text, media, templates (80 msg/sec per phone)
- **SMS**: Text messages (5 msg/sec)
- **Email**: HTML/text emails (10 msg/sec)

### 3. Bulk Messaging
- Queue-based processing (SQS)
- Chunked delivery (100 recipients/chunk)
- Pause/resume/cancel controls

### 4. AI Automation
- Knowledge Base query (Bedrock)
- Auto-response generation (Nova Pro)
- Human approval workflow

### 5. Role-Based Access Control
- **Viewer**: Read-only access
- **Operator**: Contact management + messaging
- **Admin**: Full system access

---

## Documentation

- 📚 [Full Documentation](docs/README.md)
- ☁️ [AWS Resources Inventory](docs/aws/RESOURCES.md)
- 🚀 [Deployment Guide](docs/deployment/GUIDE.md)
- 🔐 [IAM Policies](amplify/iam-policies.ts)
- ⚙️ [Backend Configuration](amplify/backend.ts)

---

## License

Proprietary - WECARE.DIGITAL

---

**Last Updated**: 2026-01-18
