# WECARE.DIGITAL Admin Platform

Multi-channel messaging system for WhatsApp, SMS, Email, Voice, and RCS communications.

## Documentation

All documentation is consolidated in the `docs/` folder:

- **[S3_SETUP_AND_CLEANUP.md](docs/S3_SETUP_AND_CLEANUP.md)** - Complete S3 bucket setup, cleanup, and organization guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture and design details

## Project Structure

```
├── amplify/                    # AWS Amplify backend configuration
│   ├── auth/                   # Cognito authentication
│   ├── data/                   # DynamoDB schema (12 tables)
│   ├── storage/                # S3 bucket references
│   ├── functions/              # Lambda functions (organized by category)
│   │   ├── core/               # Contact and message operations
│   │   ├── messaging/          # Inbound/outbound message handlers
│   │   ├── operations/         # Bulk jobs and DLQ replay
│   │   └── shared/             # Shared utilities and config
│   ├── monitoring/             # CloudWatch alarms and dashboards
│   └── backend.ts              # Main backend definition
├── src/                        # Frontend application
│   ├── api/                    # API client
│   ├── components/             # React components
│   ├── pages/                  # Next.js pages
│   ├── styles/                 # Global CSS files
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Utility functions
│   └── hooks/                  # Custom React hooks
├── docs/                       # Documentation and scripts
│   ├── S3_SETUP_AND_CLEANUP.md # S3 setup guide
│   ├── delete-cdk-buckets.ps1  # Delete CDK buckets script
│   ├── cleanup-s3-bucket.ps1   # Clean S3 bucket script
│   ├── create-s3-folders.ps1   # Create folder structure script
│   └── verify-s3-structure.ps1 # Verify S3 structure script
├── tests/                      # Integration tests
└── package.json                # Dependencies and scripts
```

## Quick Start

### Prerequisites
- Node.js 18+
- AWS Account (809904170947)
- Amplify CLI

### Installation

```bash
npm install
```

### Development

```bash
npm run dev          # Start Next.js dev server
npm run amplify      # Start Amplify sandbox
npm run build        # Build for production
npm run lint         # Run linter
```

### Deployment

```bash
npm run amplify:deploy  # Deploy to AWS
```

## S3 Bucket Organization

**Bucket**: `s3://stream.wecare.digital`

```
s3://stream.wecare.digital/
├── whatsapp-media/
│   ├── whatsapp-media-incoming/      # Inbound WhatsApp media
│   └── whatsapp-media-outgoing/      # Outbound WhatsApp media
└── base-wecare-digital/
    ├── Build/                        # Build artifacts
    ├── packages/                     # Package files
    ├── reports/                      # Bulk job reports
    ├── bedrock/                      # Bedrock KB documents
    ├── deployment/                   # Deployment artifacts
    ├── logs/                         # Application logs
    ├── backups/                      # Backup files
    ├── media/                        # General media
    ├── cache/                        # Cache files
    ├── monitoring/                   # Monitoring data
    ├── config/                       # Configuration files
    └── metadata/                     # Metadata & index
```

For detailed S3 setup and cleanup instructions, see [docs/S3_SETUP_AND_CLEANUP.md](docs/S3_SETUP_AND_CLEANUP.md).

## Architecture

### Backend (AWS)
- **Auth**: Cognito user pool (existing)
- **Data**: DynamoDB with 12 tables (on-demand billing)
- **Storage**: S3 bucket (stream.wecare.digital)
- **Functions**: 9 Lambda functions (Python)
- **Queues**: SQS for message processing
- **Monitoring**: CloudWatch alarms and dashboards

### Frontend (Next.js)
- React 18 with TypeScript
- Amplify UI components
- Multi-channel messaging interface
- Admin dashboard

## Lambda Functions

### Core Operations
- `contacts-create` - Create new contacts
- `contacts-read` - Retrieve contact details
- `contacts-update` - Update contact information
- `contacts-delete` - Delete contacts
- `contacts-search` - Search contacts
- `messages-read` - Retrieve messages
- `messages-delete` - Delete messages

### Messaging
- `inbound-whatsapp-handler` - Process inbound WhatsApp messages
- `outbound-whatsapp` - Send WhatsApp messages
- `voice-calls-read` - Retrieve voice call records

### Operations
- `bulk-job-control` - Manage bulk messaging jobs
- `dlq-replay` - Replay failed messages from DLQ

## Database Schema

12 DynamoDB tables with TTL enabled on:
- Messages (30 days)
- DLQMessages (7 days)
- AuditLogs (180 days)
- RateLimitTrackers (24 hours)
- VoiceCalls (90 days)

## Environment

- **Region**: us-east-1
- **Account**: 809904170947
- **Domain**: https://base.wecare.digital
- **SSO**: https://sso.wecare.digital

## Support

For issues or questions:
1. Check the documentation in `docs/` folder
2. Review CloudWatch logs: `/base-wecare-digital/common`
3. Verify IAM permissions in `amplify/iam-policies.ts`
4. Check S3 bucket configuration
