# WECARE.DIGITAL Architecture

## System Overview

WECARE.DIGITAL is a multi-channel messaging platform built on AWS with a Next.js frontend. It enables sending and receiving messages across WhatsApp, SMS, Email, Voice, and RCS channels.

## Technology Stack

### Frontend
- **Framework**: Next.js 14
- **UI Library**: React 18 + TypeScript
- **Styling**: CSS Modules
- **State Management**: React hooks + Amplify Data API
- **Authentication**: AWS Cognito (OAuth)

### Backend
- **Compute**: AWS Lambda (Python)
- **Database**: DynamoDB (12 tables, on-demand)
- **Storage**: S3 (media files)
- **Messaging**: SQS (async processing)
- **Monitoring**: CloudWatch (alarms, dashboards)
- **Infrastructure**: AWS CDK (Amplify Gen 2)

## Data Flow

### Inbound Messages
1. External provider (WhatsApp, SMS, etc.) sends message
2. `inbound-whatsapp-handler` Lambda processes message
3. Message stored in DynamoDB
4. Notification sent to admin dashboard

### Outbound Messages
1. Admin sends message via UI
2. Message queued in SQS
3. `outbound-whatsapp` Lambda processes queue
4. Message sent to provider
5. Status updated in DynamoDB

### Bulk Operations
1. Admin creates bulk job
2. `bulk-job-control` Lambda manages job
3. Messages queued for processing
4. Status tracked per recipient
5. Results aggregated in dashboard

## Database Schema

### Core Tables
- **Contact**: User contact information with opt-in preferences
- **Message**: All inbound/outbound messages (TTL: 30 days)
- **User**: Platform users with RBAC roles

### Operations
- **BulkJob**: Bulk messaging job tracking
- **BulkRecipient**: Individual recipient status per job
- **DLQMessage**: Failed message retry queue (TTL: 7 days)

### Metadata
- **MediaFile**: WhatsApp media metadata
- **VoiceCall**: Voice call records (TTL: 90 days)
- **AIInteraction**: AI query/response logs
- **AuditLog**: System audit trail (TTL: 180 days)
- **RateLimitTracker**: Rate limiting counters (TTL: 24 hours)
- **SystemConfig**: Configuration key-value store

## Lambda Functions

### Core (7 functions)
- **contacts-create**: POST /contacts
- **contacts-read**: GET /contacts/{id}
- **contacts-update**: PUT /contacts/{id}
- **contacts-delete**: DELETE /contacts/{id}
- **contacts-search**: GET /contacts/search
- **messages-read**: GET /messages
- **messages-delete**: DELETE /messages/{id}

### Messaging (3 functions)
- **inbound-whatsapp-handler**: Webhook for inbound messages
- **outbound-whatsapp**: Send WhatsApp messages
- **voice-calls-read**: GET /voice-calls

### Operations (2 functions)
- **bulk-job-control**: Manage bulk jobs
- **dlq-replay**: Replay failed messages

## API Endpoints

### Contacts
- `POST /api/contacts` - Create contact
- `GET /api/contacts/{id}` - Get contact
- `PUT /api/contacts/{id}` - Update contact
- `DELETE /api/contacts/{id}` - Delete contact
- `GET /api/contacts/search` - Search contacts

### Messages
- `GET /api/messages` - List messages
- `DELETE /api/messages/{id}` - Delete message

### Bulk
- `POST /api/bulk/jobs` - Create bulk job
- `GET /api/bulk/jobs/{id}` - Get job status
- `PUT /api/bulk/jobs/{id}` - Update job

## Security

- **Authentication**: AWS Cognito with OAuth
- **Authorization**: Role-based access control (VIEWER, OPERATOR, ADMIN)
- **Data Encryption**: S3 encryption at rest
- **API Security**: AppSync GraphQL with Cognito auth
- **Audit Logging**: All actions logged to DynamoDB

## Monitoring

### CloudWatch Alarms
- Lambda error rate > 1%
- DLQ depth > 10 messages

### Dashboard
- Message delivery by channel
- DLQ depth tracking
- Error rate monitoring

## Deployment

### Development
```bash
npm run amplify  # Start sandbox
npm run dev      # Start Next.js dev server
```

### Production
```bash
npm run amplify:deploy  # Deploy to AWS
npm run build           # Build Next.js
npm run start           # Start production server
```

## Environment Variables

- `NEXT_PUBLIC_GRAPHQL_ENDPOINT`: AppSync GraphQL endpoint
- `AWS_REGION`: us-east-1
- `AWS_ACCOUNT_ID`: 809904170947

## Scaling Considerations

- **DynamoDB**: On-demand billing (auto-scales)
- **Lambda**: Concurrent execution limits (1000 default)
- **SQS**: Unlimited queue depth
- **S3**: Unlimited storage

## Cost Optimization

- DynamoDB on-demand (pay per request)
- Lambda: ~9 functions, minimal compute
- S3: Media storage only
- CloudWatch: Basic monitoring

## Future Enhancements

- Multi-region deployment
- Advanced analytics
- Custom integrations
- Webhook management
- Rate limiting per channel
