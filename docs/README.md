# WECARE.DIGITAL Documentation

Welcome to the WECARE.DIGITAL Admin Platform documentation.

## Quick Links

### AWS Resources
- [AWS Resources Inventory](aws/RESOURCES.md) - Complete list of all AWS resources

### Deployment
- [Deployment Guide](deployment/GUIDE.md) - Step-by-step deployment instructions

### Project Files
- [Main README](../README.md) - Project overview
- [Backend Configuration](../amplify/backend.ts) - Amplify backend setup
- [IAM Policies](../amplify/iam-policies.ts) - Lambda permissions

---

## Documentation Structure

```
docs/
├── README.md                    # This file
├── aws/
│   └── RESOURCES.md            # AWS resources inventory
└── deployment/
    └── GUIDE.md                # Deployment guide
```

---

## Project Overview

**WECARE.DIGITAL** is a multi-channel messaging platform supporting:
- WhatsApp (AWS End User Messaging Social)
- SMS (AWS Pinpoint)
- Email (Amazon SES)
- AI Automation (Amazon Bedrock)

### Architecture
- **Frontend**: React 18 + Next.js 14
- **Backend**: AWS Amplify Gen 2
- **Database**: DynamoDB (11 tables)
- **Functions**: AWS Lambda (16 functions, Python 3.12)
- **Storage**: Amazon S3
- **AI**: Amazon Bedrock (Nova Pro)

### AWS Account
- **Account ID**: 809904170947
- **Region**: us-east-1
- **Environment**: Production (base branch)

---

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- AWS CLI configured
- AWS Amplify CLI
- Git

### Quick Start
```bash
# Clone repository
git clone https://github.com/wecaredigital/repository.git
cd base.wecare.digital

# Install dependencies
npm install

# Start development server
npm run dev

# Start Amplify sandbox
npm run amplify
```

### Deploy to Production
```bash
git checkout base
git push origin base
```

See [Deployment Guide](deployment/GUIDE.md) for detailed instructions.

---

## Key Features

### 1. Contact Management
- Create, read, update, delete contacts
- Search and filter capabilities
- Opt-in/opt-out tracking per channel

### 2. Multi-Channel Messaging
- WhatsApp: Text, media, templates
- SMS: Text messages via Pinpoint
- Email: HTML/text emails via SES
- Rate limiting per channel

### 3. Bulk Messaging
- Queue-based processing (SQS)
- Chunked delivery (100 recipients/chunk)
- Pause/resume/cancel controls
- Progress tracking

### 4. AI Automation
- Knowledge Base query (Bedrock)
- Auto-response generation
- Human approval workflow

### 5. Role-Based Access Control
- Viewer: Read-only access
- Operator: Contact management + messaging
- Admin: Full system access

---

## Active Resources Summary

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

See [AWS Resources](aws/RESOURCES.md) for complete inventory.

---

## Monitoring

### CloudWatch Dashboard
Access at: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=WECARE-DIGITAL-Dashboard

### Key Metrics
- Message delivery rate by channel
- Lambda error rate
- DLQ depth
- WhatsApp tier usage
- Bulk job throughput

### Alarms
All alarms publish to SNS: `arn:aws:sns:us-east-1:809904170947:base-wecare-digital`

---

## Support

### Documentation
- AWS Resources: [aws/RESOURCES.md](aws/RESOURCES.md)
- Deployment: [deployment/GUIDE.md](deployment/GUIDE.md)
- Main README: [../README.md](../README.md)

### Troubleshooting
See [Deployment Guide - Troubleshooting](deployment/GUIDE.md#troubleshooting)

### Contact
- AWS Account: 809904170947
- Region: us-east-1
- Environment: Production (base branch)

---

**Last Updated**: 2026-01-18
