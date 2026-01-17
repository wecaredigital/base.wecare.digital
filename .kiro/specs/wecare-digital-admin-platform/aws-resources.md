# AWS Resources Reference Document

## Overview

This document provides comprehensive details of all AWS resources used in the WECARE.DIGITAL Admin Platform, with strict adherence to AWS End User Messaging Social API specifications for WhatsApp integration.

---

## 1. AWS End User Messaging Social (WhatsApp)

### 1.1 Service Overview

**Service Name**: AWS End User Messaging Social  
**API Version**: v1 (2024-01-01)  
**Purpose**: Native WhatsApp Business messaging integration within AWS  
**Region**: us-east-1

### 1.2 WhatsApp Business Account (WABA)

**WABA ID**: (Managed via AWS EUM Social Console)  
**Status**: Connected  
**Business Manager**: Linked to Meta Business Manager  
**Verification**: Required for production messaging

### 1.3 WhatsApp Phone Numbers

**Phone Number ID 1**: `phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54`  
**Phone Number ID 2**: `phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06`  
**Format**: `phone-number-id-{32-character-hex}`  
**Status**: Active and verified  
**Display Name**: WECARE.DIGITAL

**Allowlist**: Only these two phone number IDs are authorized to send messages

### 1.4 AWS End User Messaging Social API Operations

#### SendWhatsAppMessage

**Endpoint**: `POST /v1/whatsapp/send`  
**Rate Limit**: 1000 requests/second (account level)  
**Phone Number Throughput**: 80 messages/second per phone number (default)

**Request Parameters**:
```json
{
  "originationPhoneNumberId": "phone-number-id-{32-char-hex}",
  "metaApiVersion": "v20.0",
  "message": {
    // WhatsApp Message object (base64-encoded blob)
    // Max size: 2048000 bytes (2MB)
  }
}
```

**Response**:
```json
{
  "messageId": "unique-message-identifier"
}
```

**Error Codes**:
- `403 AccessDeniedException`: Insufficient permissions
- `400 InvalidParametersException`: Invalid parameter value
- `404 ResourceNotFoundException`: Phone number not found
- `429 ThrottledRequestException`: Rate limit exceeded
- `500 InternalServiceException`: AWS service error

#### PostWhatsAppMessageMedia

**Endpoint**: `POST /v1/whatsapp/media`  
**Rate Limit**: 100 requests/second  
**Purpose**: Upload media files to WhatsApp before sending

**Request Parameters**:
```json
{
  "originationPhoneNumberId": "phone-number-id-{32-char-hex}",
  "sourceS3File": {
    "bucketName": "auth.wecare.digital",
    "key": "whatsapp-media/whatsapp-media-outgoing/{filename}"
  }
}
```

**Response**:
```json
{
  "mediaId": "whatsapp-media-id"
}
```

**Notes**:
- Only the phone number that uploaded the media can send it
- Media files expire after 30 days on WhatsApp servers
- Use either `sourceS3File` or `sourceS3PresignedUrl` (not both)

#### GetWhatsAppMessageMedia

**Endpoint**: `GET /v1/whatsapp/media/{mediaId}`  
**Rate Limit**: 100 requests/second  
**Purpose**: Download inbound media files from WhatsApp

**Request Parameters**:
```json
{
  "mediaId": "whatsapp-media-id-from-webhook",
  "originationPhoneNumberId": "phone-number-id-{32-char-hex}",
  "destinationS3File": {
    "bucketName": "auth.wecare.digital",
    "key": "whatsapp-media/whatsapp-media-incoming/{filename}"
  }
}
```

**Response**: Media file stored in specified S3 location

#### DeleteWhatsAppMessageMedia

**Endpoint**: `DELETE /v1/whatsapp/media/{mediaId}`  
**Rate Limit**: 100 requests/second  
**Purpose**: Delete media files from WhatsApp storage

### 1.5 WhatsApp Inbound Webhook Events

**Delivery Method**: Amazon SNS Topic  
**SNS Topic ARN**: `arn:aws:sns:us-east-1:809904170947:base-wecare-digital`  
**Event Format**: JSON with AWS header + WhatsApp payload

**Event Structure**:
```json
{
  "context": {
    "MetaWabaIds": [{
      "wabaId": "meta-waba-id",
      "arn": "arn:aws:social-messaging:us-east-1:809904170947:waba/{id}"
    }],
    "MetaPhoneNumberIds": [{
      "metaPhoneNumberId": "meta-phone-number-id",
      "arn": "arn:aws:social-messaging:us-east-1:809904170947:phone-number-id/{id}"
    }]
  },
  "whatsAppWebhookEntry": "{...JSON STRING...}",
  "aws_account_id": "809904170947",
  "message_timestamp": "2026-01-17T12:00:00.000Z",
  "messageId": "uuid"
}
```

**WhatsApp Payload** (decoded from `whatsAppWebhookEntry`):
```json
{
  "id": "webhook-entry-id",
  "changes": [{
    "value": {
      "messaging_product": "whatsapp",
      "metadata": {
        "display_phone_number": "+1234567890",
        "phone_number_id": "phone-number-id"
      },
      "messages": [{
        "from": "sender-phone-number",
        "id": "whatsapp-message-id",
        "timestamp": "unix-timestamp",
        "type": "text|image|video|audio|document",
        "text": { "body": "message content" },
        "image": { "id": "media-id", "mime_type": "image/jpeg" }
      }],
      "statuses": [{
        "id": "message-id",
        "status": "sent|delivered|read|failed",
        "timestamp": "unix-timestamp",
        "recipient_id": "recipient-phone"
      }]
    },
    "field": "messages"
  }]
}
```

### 1.6 WhatsApp Message Types

**Text Messages**:
- Max length: 4096 characters
- Unicode support: Full UTF-8
- Can be sent within 24-hour customer service window

**Media Messages**:
- Types: image, video, audio, document
- Max size: 100MB (varies by type)
- Requires upload via `PostWhatsAppMessageMedia` first
- Media ID valid for 30 days

**Template Messages**:
- Pre-approved by Meta
- Can be sent anytime (outside 24-hour window)
- Required for business-initiated conversations
- Approval time: Up to 24-48 hours

### 1.7 WhatsApp Business Tier Limits

**Tier 1 (Default)**:
- 250 business-initiated conversations per 24-hour rolling window
- Tier upgrade based on quality rating and volume

**Quality Rating**:
- High: Full tier limit
- Medium: Reduced limit
- Low: Significantly reduced limit

**Customer Service Window**:
- Duration: 24 hours from last inbound message
- Free-form messages allowed within window
- Template messages required outside window

---

## 2. Amazon Cognito

### 2.1 User Pool

**User Pool ID**: `us-east-1_CC9u1fYh6`  
**Region**: us-east-1  
**Purpose**: Authentication and user management

**JWKS Endpoint**:
```
https://cognito-idp.us-east-1.amazonaws.com/us-east-1_CC9u1fYh6/.well-known/jwks.json
```

**Token Validation**:
- JWT tokens must be validated against JWKS
- Tokens contain user identity and role claims
- Expiration enforced at middleware layer

---

## 3. Amazon S3 Storage

### 3.1 Media Bucket

**Bucket Name**: `auth.wecare.digital`  
**Region**: us-east-1  
**Purpose**: WhatsApp media file storage

**Prefixes**:
- Inbound media: `whatsapp-media/whatsapp-media-incoming/`
- Outbound media: `whatsapp-media/whatsapp-media-outgoing/`

**Access Control**:
- Private ACL (no public access)
- IAM role-based access only
- Encryption at rest: AES-256 (default)

### 3.2 Reports Bucket

**Bucket Name**: `stream.wecare.digital`  
**Region**: us-east-1  
**Purpose**: Bulk message reports and Bedrock KB documents

**Prefixes**:
- Reports: `base-wecare-digital/reports/`
- Bedrock KB: `base-wecare-digital/bedrock/kb/whatsapp/`

**Lifecycle Policy**:
- Reports expire after 90 days
- KB documents: No expiration

---

## 4. Amazon SNS

### 4.1 WhatsApp Inbound Topic

**Topic ARN**: `arn:aws:sns:us-east-1:809904170947:base-wecare-digital`  
**Purpose**: Receive WhatsApp inbound messages and status updates from AWS EUM Social

**Subscriptions**:
- Lambda function: `inbound-whatsapp-handler`
- Protocol: Lambda
- Filter policy: None (all messages)

**Message Format**: See Section 1.5 (WhatsApp Inbound Webhook Events)

---

## 5. AWS Pinpoint SMS

### 5.1 SMS Pool

**Pool Name**: WECARE-DIGITAL  
**Pool ID**: `pool-6fbf5a5f390d4eeeaa7dbae39d78933e`  
**Pool ARN**: `arn:aws:sms-voice:us-east-1:809904170947:pool/pool-6fbf5a5f390d4eeeaa7dbae39d78933e`  
**Type**: Transactional  
**Region**: us-east-1

**Opt-Out Management**:
- Default opt-out list: Enabled
- Keywords: STOP, UNSUBSCRIBE, CANCEL, END, QUIT
- Opt-in keywords: START, UNSTOP
- Self-managed opt-outs: Disabled (AWS-managed)

### 5.2 Voice Long Code

**Phone ID**: `phone-57c21095b30940f39f38138a055dd5be`  
**Phone ARN**: `arn:aws:sms-voice:us-east-1:809904170947:phone-number/phone-57c21095b30940f39f38138a055dd5be`  
**Associated Pool**: WECARE-DIGITAL

**Rate Limits**:
- 5 messages per second
- Automatic segmentation for long messages (up to 1600 characters)

---

## 6. Amazon SES

### 6.1 Verified Sender Identity

**Email Address**: `one@wecare.digital`  
**Identity ARN**: `arn:aws:ses:us-east-1:809904170947:identity/one@wecare.digital`  
**Region**: us-east-1

**DKIM Status**: Successful  
**MAIL FROM Domain**: `one.wecare.digital`  
**SPF**: Configured  
**DMARC**: Recommended (configure DNS)

**Sending Configuration**:
- From: `"WECARE.DIGITAL" <one@wecare.digital>`
- Reply-To: `one@wecare.digital`
- Rate limit: 10 messages/second
- Daily quota: 50,000 messages (default production)

---

## 7. AWS IAM

### 7.1 Lambda Execution Role

**Role Name**: `base-wecare-digital`  
**Role ARN**: `arn:aws:iam::809904170947:role/base-wecare-digital`  
**Purpose**: Unified execution role for all Lambda functions

**Permissions** (Required):
- DynamoDB: Read/Write on all tables
- S3: Read/Write on `auth.wecare.digital` and `stream.wecare.digital`
- SNS: Publish to topics, Subscribe
- SQS: Send/Receive/Delete messages
- SES: SendEmail, SendRawEmail
- Pinpoint SMS: SendMessages
- AWS End User Messaging Social: SendWhatsAppMessage, PostWhatsAppMessageMedia, GetWhatsAppMessageMedia
- CloudWatch Logs: CreateLogGroup, CreateLogStream, PutLogEvents
- Bedrock: InvokeModel, RetrieveAndGenerate (optional)

**Trust Policy**:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
```

---

## 8. AWS Bedrock (AI Automation)

### 8.1 Knowledge Base

**KB ID**: `FZBPKGTOYE`  
**Region**: us-east-1  
**Purpose**: AI-powered response generation from knowledge documents  
**Status**: ACTIVE ✓

**Data Sources**:
- Data Source 1 ID: `AXR9PXIVUK`
- Data Source 2 ID: `8KHGUUWYJ8`
- S3 Location: `s3://stream.wecare.digital/base-wecare-digital/bedrock/kb/whatsapp/`

### 8.2 Bedrock Agent

**Agent ID**: `HQNT0JXN8G`  
**Agent Name**: base-bedrock-agent  
**Agent Alias**: (Generated during deployment)  
**Status**: NOT_PREPARED (requires preparation before first use)  
**Foundation Model**: amazon.nova-pro-v1:0  
**Orchestration Type**: SUPERVISOR (agent collaboration mode)  
**Purpose**: Automated response suggestions with tool integration  
**Idle Session TTL**: 600 seconds (10 minutes)  
**Memory**: SESSION_SUMMARY enabled (30 days, max 20 recent sessions)

**Agent Execution Role**:
- **Role ARN**: `arn:aws:iam::809904170947:role/service-role/AmazonBedrockExecutionRoleForAgents_18GVEGPGMM5`

**Agent Core Runtime**:
- **Runtime ID**: `base_bedrock_agentcore-1XHDxj2o3Q`
- **Purpose**: Execution environment for agent orchestration and tool invocation

**Agent Capabilities**:
- Query knowledge base (FZBPKGTOYE)
- Generate contextual responses
- Multi-agent collaboration (SUPERVISOR mode)
- Session memory with automatic summarization
- Tool/function calling for actions

---

## 9. AWS Amplify

### 9.1 Amplify Application

**App ID**: (Generated)  
**Default URL**: `https://base.dtiq7il2x5c5g.amplifyapp.com`  
**Custom Domain**: `https://base.wecare.digital`  
**Region**: us-east-1

**SSL Certificate**:
- Certificate ID: `9df65f48-cdff-4f45-8e6d-f33c8c0beb92`
- Domain: `wecare.digital`
- Status: Verified

### 9.2 Branch Configuration

**Production Branch**: `main`
- Send Mode: LIVE
- Auto-deploy: Enabled
- Domain: `https://base.wecare.digital`

**Staging Branch**: `release/*`
- Send Mode: DRY_RUN (enforced)
- Auto-deploy: Enabled
- Domain: `release-*.base.dtiq7il2x5c5g.amplifyapp.com`

**Preview Branches**: `feature/*`
- Send Mode: DRY_RUN (enforced)
- Auto-deploy: Enabled
- Domain: `pr-*.base.dtiq7il2x5c5g.amplifyapp.com`

---

## 10. AWS Account Configuration

**AWS Account ID**: `809904170947`  
**Primary Region**: `us-east-1`  
**Deployment Method**: AWS Amplify Gen 2 CI/CD

**Resource Naming Convention**:
- Prefix: `base-wecare-digital`
- Format: `base-wecare-digital-{ResourceType}`
- Example: `base-wecare-digital-ContactsTable`

---

## 11. Integration Flow Diagrams

### 11.1 WhatsApp Inbound Message Flow

```
User sends WhatsApp message
    ↓
AWS End User Messaging Social receives message
    ↓
SNS Topic: arn:aws:sns:us-east-1:809904170947:base-wecare-digital
    ↓
Lambda: inbound-whatsapp-handler
    ↓
Parse SNS event → Extract whatsAppWebhookEntry
    ↓
If media: GetWhatsAppMessageMedia → Store in S3
    ↓
Store message in DynamoDB Messages table
    ↓
Update Contact lastContactedAt timestamp
    ↓
(Optional) Trigger AI response generation
```

### 11.2 WhatsApp Outbound Message Flow

```
Operator initiates send via UI/API
    ↓
Lambda: outbound-whatsapp
    ↓
Validate opt-in (optInWhatsApp = true)
    ↓
Validate allowlist (phone-number-id in allowlist)
    ↓
If media: Upload to S3 → PostWhatsAppMessageMedia → Get mediaId
    ↓
Call SendWhatsAppMessage API
    ↓
Store outbound record in DynamoDB
    ↓
Return messageId to caller
    ↓
Receive delivery status via SNS webhook
    ↓
Update message status in DynamoDB
```

### 11.3 Bulk Message Processing Flow

```
Operator creates bulk job (>20 recipients requires confirmation)
    ↓
Lambda: bulk-job-create
    ↓
Create job record in DynamoDB (status: pending)
    ↓
Chunk recipients into groups of 100
    ↓
Enqueue chunks to SQS: bulk-queue
    ↓
Lambda: bulk-worker (concurrency: 2-5)
    ↓
For each recipient:
  - Validate opt-in + allowlist
  - Call SendWhatsAppMessage
  - Update job progress
    ↓
On completion: Generate report → Store in S3
    ↓
Update job status to completed
```

---

## 12. API Rate Limits Summary

| Service | Operation | Rate Limit | Notes |
|---------|-----------|------------|-------|
| AWS EUM Social | SendWhatsAppMessage | 1000 RPS | Account level |
| AWS EUM Social | PostWhatsAppMessageMedia | 100 RPS | Account level |
| AWS EUM Social | GetWhatsAppMessageMedia | 100 RPS | Account level |
| WhatsApp Phone | Message throughput | 80 MPS | Per phone number |
| WhatsApp Business | Conversations | 250/24h | Tier 1 default |
| Pinpoint SMS | SendMessages | 5 MPS | Per pool |
| SES | SendEmail | 10 MPS | Per account |

---

## 13. Security and Compliance

### 13.1 Data Encryption

**At Rest**:
- DynamoDB: AWS-managed encryption
- S3: AES-256 encryption
- Secrets: AWS Secrets Manager

**In Transit**:
- All API calls: TLS 1.2+
- WhatsApp messages: End-to-end encrypted by WhatsApp

### 13.2 Access Control

**Principle of Least Privilege**:
- Single IAM role for all Lambdas
- No IAM user credentials in code
- Role-based access control (RBAC) at application layer

**Network Security**:
- No public endpoints (API Gateway with auth)
- S3 buckets: Private ACL
- VPC: Not required (serverless architecture)

---

## 14. Monitoring and Observability

### 14.1 CloudWatch Logs

**Log Group**: `/base-wecare-digital/common`  
**Retention**: 30 days minimum  
**Format**: JSON structured logs

**Log Levels**:
- ERROR: Critical failures
- WARN: Validation failures, rate limits
- INFO: Successful operations
- DEBUG: Detailed execution traces

### 14.2 CloudWatch Metrics

**Custom Metrics**:
- `MessagesSent` (by channel)
- `MessagesDelivered` (by channel)
- `MessagesFailed` (by channel)
- `BulkJobDuration`
- `BulkJobThroughput`
- `ValidationFailures` (by reason)

**Alarms**:
- Lambda error rate > 1%
- DLQ depth > 10
- WhatsApp tier limit > 80%
- SQS backlog > 100

---

## 15. Cost Optimization

### 15.1 DynamoDB

**Billing Mode**: PAY_PER_REQUEST  
**Cost Drivers**: Read/Write requests  
**Optimization**: TTL for automatic deletion (no write cost)

### 15.2 Lambda

**Concurrency**: Reserved concurrency for bulk-worker (2-5)  
**Memory**: Right-sized per function  
**Optimization**: Batch processing, connection pooling

### 15.3 WhatsApp Messaging

**Free Messages**: Within 24-hour customer service window  
**Paid Messages**: Template messages outside window  
**Optimization**: Encourage inbound messages to open free window

---

## Document Version

**Version**: 1.0  
**Last Updated**: 2026-01-17  
**Maintained By**: DevOps Team  
**Review Frequency**: Quarterly or when AWS services update
