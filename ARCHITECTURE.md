# Architecture

## Overview

WECARE.DIGITAL is a multi-channel messaging platform built on AWS with Next.js frontend and serverless backend.

## Components

### Frontend (Next.js + React)
- 34 pages across 10 modules
- Real-time messaging dashboard
- Contact management
- Bulk messaging interface
- Admin panel

### Backend (Serverless)

#### Lambda Functions (17 total, Python 3.12)

**Contact Management (5)**
- contacts-create, contacts-read, contacts-update, contacts-delete, contacts-search

**Messaging - Outbound (4)**
- outbound-whatsapp, outbound-sms, outbound-email, outbound-voice

**Messaging - Inbound & Read (2)**
- inbound-whatsapp-handler, messages-read

**Message Operations (1)**
- messages-delete

**Bulk Operations (1)**
- bulk-job-control

**AI Automation (2)**
- ai-query-kb, ai-generate-response

**Voice Operations (1)**
- voice-calls-read

**Operations (1)**
- dlq-replay

#### Database (DynamoDB, 12 tables)

| Table | Purpose | TTL |
|-------|---------|-----|
| Contact | Contact records | None |
| Message | All messages | 30 days |
| BulkJob | Bulk job tracking | None |
| BulkRecipient | Recipient status | None |
| User | Platform users | None |
| MediaFile | Media metadata | None |
| DLQMessage | Failed messages | 7 days |
| AuditLog | Audit trail | 180 days |
| AIInteraction | AI logs | None |
| RateLimitTracker | Rate limits | 24 hours |
| SystemConfig | Configuration | None |
| VoiceCall | Voice records | 90 days |

#### API Gateway
- HTTP API: k4vqzmi07b
- 12 routes connected to Lambda functions
- CORS enabled

#### Authentication (Cognito)
- User Pool: us-east-1_CC9u1fYh6
- Groups: Viewer, Operator, Admin
- OAuth domain: sso.wecare.digital

#### Storage (S3)
- Bucket: auth.wecare.digital
- WhatsApp media files
- Bedrock KB documents

#### AppSync (GraphQL)
- Endpoint: gvvw6q62urciljnrbsahsrxdzi.appsync-api.us-east-1.amazonaws.com
- Schema: 12 DynamoDB tables

## Deployment

- **Region:** us-east-1
- **Account:** 809904170947
- **Framework:** Amplify Gen 2
- **IaC:** TypeScript CDK

## Data Flow

1. Frontend sends request to API Gateway
2. API Gateway routes to Lambda function
3. Lambda queries DynamoDB
4. Response returned to frontend
5. Failed messages go to DLQ for retry

## Security

- Cognito authentication
- IAM role-based access
- HTTPS/TLS encryption
- DynamoDB encryption
- S3 bucket encryption
- Rate limiting per channel
