# AWS Resource Connections - Complete Reference

**Last Updated**: 2026-01-21  
**Status**: ✅ VERIFIED

---

## 1. WhatsApp (AWS End User Messaging Social)

### Service Details
- **Service**: AWS End User Messaging Social (EUM Social)
- **Region**: us-east-1
- **API Version**: v20.0
- **Status**: ✅ ACTIVE

### Phone Numbers (2)
```
Phone 1:
  Display: +91 93309 94400
  Name: WECARE.DIGITAL
  AWS ID: phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54
  Meta ID: 831049713436137
  Quality: GREEN
  Rate Limit: 80 msg/sec

Phone 2:
  Display: +91 99033 00044
  Name: Manish Agarwal
  AWS ID: phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06
  Meta ID: 888782840987368
  Quality: GREEN
  Rate Limit: 80 msg/sec
```

### WABAs (2)
```
WABA 1:
  AWS ID: waba-0aae9cf04cf24c66960f291c793359b4
  Meta ID: 1347766229904230
  Name: WECARE.DIGITAL
  Status: COMPLETE

WABA 2:
  AWS ID: waba-9bbe054d8404487397c38a9d197bc44a
  Meta ID: 1390647332755815
  Name: Manish Agarwal
  Status: COMPLETE
```

### Connected AWS Resources

#### SNS Topic
```
ARN: arn:aws:sns:us-east-1:809904170947:base-wecare-digital
Name: base-wecare-digital
Purpose: Route WhatsApp inbound events to Lambda
Subscriptions: 1 (Lambda: inbound-whatsapp-handler)
```

#### Lambda Functions (3)

**1. inbound-whatsapp-handler**
```
Runtime: Python 3.12
Memory: 256MB
Timeout: 30s
Trigger: SNS (base-wecare-digital)
Environment Variables:
  - CONTACTS_TABLE: Contact
  - MESSAGES_TABLE: Message
  - MEDIA_FILES_TABLE: MediaFile
  - SYSTEM_CONFIG_TABLE: SystemConfig
  - AI_INTERACTIONS_TABLE: AIInteraction
  - MEDIA_BUCKET: stream.wecare.digital
  - MEDIA_INBOUND_PREFIX: whatsapp-media/whatsapp-media-incoming/
  - INBOUND_DLQ_URL: https://sqs.us-east-1.amazonaws.com/809904170947/base-wecare-digital-inbound-dlq
  - WHATSAPP_PHONE_NUMBER_ID_1: phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54
  - WHATSAPP_PHONE_NUMBER_ID_2: phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06

Operations:
  - Receives SNS notifications from WhatsApp
  - Downloads media using AWS EUM Social API: GetWhatsAppMessageMedia
  - Stores media in S3: whatsapp-media/whatsapp-media-incoming/
  - Stores message metadata in DynamoDB
  - Updates contact lastInboundMessageAt for 24-hour window
  - Sends auto-reaction (thumbs up)
  - Sends read receipt
  - Triggers AI automation if enabled

S3 Operations:
  - PUT: whatsapp-media/whatsapp-media-incoming/{messageId}.{ext}
  - Uses AWS EUM Social API to download media
```

**2. outbound-whatsapp**
```
Runtime: Python 3.12
Memory: 256MB
Timeout: 30s
Trigger: Lambda invoke (from frontend/bulk jobs)
Environment Variables:
  - MESSAGES_TABLE: Message
  - MEDIA_BUCKET: stream.wecare.digital
  - MEDIA_OUTBOUND_PREFIX: whatsapp-media/whatsapp-media-outgoing/
  - OUTBOUND_DLQ_URL: https://sqs.us-east-1.amazonaws.com/809904170947/base-wecare-digital-outbound-dlq
  - WHATSAPP_PHONE_NUMBER_ID_1: phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54
  - WHATSAPP_PHONE_NUMBER_ID_2: phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06

Operations:
  - Sends WhatsApp messages (text, media, template, interactive)
  - Uploads media using AWS EUM Social API: PostWhatsAppMessageMedia
  - Reads media from S3: whatsapp-media/whatsapp-media-outgoing/
  - Stores message metadata in DynamoDB
  - Handles retries via DLQ

S3 Operations:
  - GET: whatsapp-media/whatsapp-media-outgoing/{mediaId}.{ext}
  - Uses AWS EUM Social API to upload media
```

**3. messages-read**
```
Runtime: Python 3.12
Memory: 256MB
Timeout: 30s
Trigger: API Gateway (GET /api/messages)
Environment Variables:
  - MESSAGE_TABLE: Message
  - MEDIA_BUCKET: stream.wecare.digital

Operations:
  - Reads messages from DynamoDB
  - Generates pre-signed URLs for media files
  - Returns messages with media URLs to frontend

S3 Operations:
  - generate_presigned_url: whatsapp-media/whatsapp-media-incoming/*
  - generate_presigned_url: whatsapp-media/whatsapp-media-outgoing/*
  - Expiry: 1 hour
```

#### DynamoDB Tables (3)

**1. Contact**
```
Primary Key: id
Attributes:
  - id: UUID
  - name: String
  - phone: String (unique)
  - email: String
  - optInWhatsApp: Boolean
  - optInSms: Boolean
  - optInEmail: Boolean
  - allowlistWhatsApp: Boolean
  - allowlistSms: Boolean
  - allowlistEmail: Boolean
  - lastInboundMessageAt: Timestamp (for 24-hour window)
  - createdAt: Timestamp
  - updatedAt: Timestamp
  - deletedAt: Timestamp (soft delete)

Purpose: Store contact information
S3 Connection: ❌ NO
```

**2. Message**
```
Primary Key: id
Attributes:
  - id: UUID
  - messageId: UUID
  - contactId: UUID (FK to Contact)
  - channel: String (whatsapp, sms, email)
  - direction: String (inbound, outbound)
  - content: String
  - messageType: String (text, image, video, audio, document, etc.)
  - timestamp: Timestamp
  - status: String (received, sent, delivered, read, failed)
  - whatsappMessageId: String (for deduplication)
  - mediaId: UUID (FK to MediaFile)
  - s3Key: String (path to media in S3)
  - senderPhone: String
  - senderName: String
  - receivingPhone: String (which phone number received it)
  - awsPhoneNumberId: String (which AWS phone ID)
  - metaWabaIds: List (which WABAs)
  - createdAt: Timestamp
  - expiresAt: Timestamp (TTL: 30 days)

Purpose: Store all messages
TTL: 30 days (automatic cleanup)
S3 Connection: ❌ NO (stores S3 key reference only)
```

**3. MediaFile**
```
Primary Key: fileId
Attributes:
  - fileId: UUID
  - messageId: UUID (FK to Message)
  - s3Key: String (path in S3)
  - contentType: String (mime type)
  - size: Number (bytes)
  - whatsappMediaId: String (WhatsApp media ID)
  - uploadedAt: Timestamp

Purpose: Store media metadata
S3 Connection: ❌ NO (stores S3 key reference only)
```

#### SQS Queues (2)

**1. inbound-dlq**
```
Name: base-wecare-digital-inbound-dlq
URL: https://sqs.us-east-1.amazonaws.com/809904170947/base-wecare-digital-inbound-dlq
Visibility Timeout: 300s
Retention Period: 7 days
Purpose: Failed inbound message processing
Consumer: dlq-replay Lambda
```

**2. outbound-dlq**
```
Name: base-wecare-digital-outbound-dlq
URL: https://sqs.us-east-1.amazonaws.com/809904170947/base-wecare-digital-outbound-dlq
Visibility Timeout: 300s
Retention Period: 7 days
Purpose: Failed outbound message sending
Consumer: dlq-replay Lambda
```

#### S3 Bucket
```
Bucket: stream.wecare.digital
Region: us-east-1
Encryption: SSE-S3
Versioning: Disabled
Lifecycle: Media files expire after 30 days

Folders:
  - whatsapp-media/whatsapp-media-incoming/
    Purpose: Inbound WhatsApp media
    Operations: PUT (by inbound-whatsapp-handler)
    Lifecycle: 30 days
    
  - whatsapp-media/whatsapp-media-outgoing/
    Purpose: Outbound WhatsApp media
    Operations: GET (by outbound-whatsapp)
    Lifecycle: 30 days
```

---

## 2. Bulk Jobs (Bulk Messaging)

### Service Details
- **Purpose**: Send messages to multiple recipients
- **Channels**: WhatsApp, SMS, Email, Voice, RCS
- **Status**: ✅ ACTIVE

### Connected AWS Resources

#### Lambda Function
```
Function: bulk-job-control
Runtime: Python 3.12
Memory: 256MB
Timeout: 30s
Trigger: API Gateway (GET, PUT, DELETE /api/bulk/jobs/{jobId})
Environment Variables:
  - BULK_JOBS_TABLE: BulkJobs
  - BULK_RECIPIENTS_TABLE: BulkRecipients
  - BULK_QUEUE_URL: https://sqs.us-east-1.amazonaws.com/809904170947/base-wecare-digital-bulk-queue
  - REPORT_BUCKET: stream.wecare.digital
  - REPORT_PREFIX: base-wecare-digital/reports/

Operations:
  - GET: Retrieve job status
  - PUT: Pause/resume/cancel job
  - DELETE: Delete job
  - Generate partial reports on cancellation

S3 Operations:
  - PUT: base-wecare-digital/reports/{jobId}-partial.json
  - Stores job report as JSON
```

#### DynamoDB Tables (2)

**1. BulkJobs**
```
Primary Key: jobId
Attributes:
  - jobId: UUID
  - channel: String (WHATSAPP, SMS, EMAIL, VOICE, RCS)
  - status: String (PENDING, IN_PROGRESS, PAUSED, COMPLETED, CANCELLED)
  - totalRecipients: Number
  - sentCount: Number
  - failedCount: Number
  - content: String (message content)
  - templateName: String (if using template)
  - templateParams: List (template parameters)
  - createdAt: Timestamp
  - updatedAt: Timestamp
  - createdBy: String (user ID)
  - pausedAt: Timestamp
  - resumedAt: Timestamp
  - cancelledAt: Timestamp
  - completedAt: Timestamp
  - reportS3Key: String (path to report in S3)

Purpose: Track bulk jobs
S3 Connection: ❌ NO (stores S3 key reference only)
```

**2. BulkRecipients**
```
Primary Key: jobId + recipientId
Attributes:
  - jobId: UUID (FK to BulkJobs)
  - recipientId: UUID
  - contactId: UUID (FK to Contact)
  - status: String (PENDING, SENT, FAILED, CANCELLED)
  - errorDetails: String (error message if failed)
  - sentAt: Timestamp
  - failedAt: Timestamp
  - updatedAt: Timestamp

Purpose: Track individual recipient status
S3 Connection: ❌ NO
```

#### SQS Queues (2)

**1. bulk-queue**
```
Name: base-wecare-digital-bulk-queue
URL: https://sqs.us-east-1.amazonaws.com/809904170947/base-wecare-digital-bulk-queue
Visibility Timeout: 300s
Retention Period: 1 day
Purpose: Queue bulk message chunks for processing
Consumer: bulk-worker Lambda
```

**2. bulk-dlq**
```
Name: base-wecare-digital-bulk-dlq
URL: https://sqs.us-east-1.amazonaws.com/809904170947/base-wecare-digital-bulk-dlq
Visibility Timeout: 300s
Retention Period: 7 days
Purpose: Failed bulk message chunks
Consumer: dlq-replay Lambda
```

#### S3 Bucket
```
Bucket: stream.wecare.digital
Region: us-east-1

Folder: base-wecare-digital/reports/
  Purpose: Bulk job reports
  Operations: PUT (by bulk-job-control)
  Format: JSON
  Naming: {jobId}-partial.json or {jobId}-complete.json
  Retention: Permanent (manual cleanup)
  
  Report Contents:
  {
    "jobId": "uuid",
    "channel": "WHATSAPP|SMS|EMAIL",
    "totalRecipients": 1000,
    "sentCount": 950,
    "failedCount": 50,
    "cancelledCount": 0,
    "status": "completed|cancelled",
    "createdAt": "2026-01-21T10:00:00Z",
    "completedAt": "2026-01-21T10:15:00Z",
    "createdBy": "user-id",
    "recipients": [
      {
        "contactId": "uuid",
        "status": "sent|failed|pending",
        "error": "error message if failed"
      }
    ]
  }
```

---

## 3. Bedrock AI (NOT Connected to S3)

### Service Details
- **Service**: Amazon Bedrock
- **Region**: us-east-1
- **Status**: ✅ ACTIVE

### Knowledge Base
```
KB ID: FZBPKGTOYE
Name: base-wecare-digital-bedrock-kb
Foundation Model: amazon.nova-pro-v1:0
Status: ACTIVE
Purpose: Store documents for AI queries

S3 Connection: ❌ NO
  - Bedrock KB stores documents internally
  - No S3 folder required
  - Documents managed via Bedrock console/API
```

### Agent
```
Agent ID: HQNT0JXN8G
Name: base-bedrock-agent
Foundation Model: amazon.nova-pro-v1:0
Status: NOT_PREPARED (prepared on first use)
Memory: SESSION_SUMMARY (30 days, 20 sessions)
Purpose: Generate responses for customer inquiries

S3 Connection: ❌ NO
  - Agent uses KB internally
  - No S3 integration
```

### Connected AWS Resources

#### Lambda Functions (2)

**1. ai-query-kb**
```
Runtime: Python 3.12
Memory: 256MB
Timeout: 30s
Trigger: Lambda invoke (from inbound-whatsapp-handler)
Environment Variables:
  - KB_ID: FZBPKGTOYE
  - BEDROCK_REGION: us-east-1

Operations:
  - Query Bedrock Knowledge Base
  - Return relevant documents/context
  - Used by AI response generation

S3 Connection: ❌ NO
```

**2. ai-generate-response**
```
Runtime: Python 3.12
Memory: 256MB
Timeout: 30s
Trigger: Lambda invoke (from inbound-whatsapp-handler)
Environment Variables:
  - AGENT_ID: HQNT0JXN8G
  - BEDROCK_REGION: us-east-1

Operations:
  - Generate response using Bedrock Agent
  - Use KB context from ai-query-kb
  - Send response back via WhatsApp

S3 Connection: ❌ NO
```

#### DynamoDB Table

**AIInteraction**
```
Primary Key: interactionId
Attributes:
  - interactionId: UUID
  - messageId: UUID (FK to Message)
  - contactId: UUID (FK to Contact)
  - query: String (user question)
  - kbContext: String (KB search results)
  - response: String (AI generated response)
  - model: String (foundation model used)
  - tokensUsed: Number
  - createdAt: Timestamp
  - expiresAt: Timestamp (TTL: 90 days)

Purpose: Log AI interactions
TTL: 90 days
S3 Connection: ❌ NO
```

---

## 4. Other AWS Resources (NOT Connected to S3)

### Cognito
```
User Pool ID: us-east-1_CC9u1fYh6
Name: WECARE.DIGITAL
Status: ✅ ACTIVE
Purpose: Authentication & authorization
S3 Connection: ❌ NO
```

### SES (Email)
```
Verified Identity: one@wecare.digital
Status: ✅ VERIFIED
DKIM: ✅ CONFIGURED
Rate Limit: 10 msg/sec
Purpose: Send emails
S3 Connection: ❌ NO
```

### Pinpoint (SMS)
```
Pool ID: pool-6fbf5a5f390d4eeeaa7dbae39d78933e
Name: WECARE-DIGITAL
Status: ✅ ACTIVE
Rate Limit: 5 msg/sec
Purpose: Send SMS
S3 Connection: ❌ NO
```

### CloudWatch
```
Log Group: /base-wecare-digital/common
Retention: 14 days
Purpose: Logging & monitoring
S3 Connection: ❌ NO
```

### IAM Role
```
Role Name: base-wecare-digital
ARN: arn:aws:iam::809904170947:role/base-wecare-digital
Status: ✅ ACTIVE
Purpose: Lambda execution permissions
S3 Connection: ✅ YES (scoped to specific folders)
```

---

## S3 Access Summary

### Allowed Operations
```
Lambda Role: base-wecare-digital

Permissions:
  - s3:GetObject
  - s3:PutObject
  - s3:DeleteObject
  - s3:ListBucket

Resources:
  - arn:aws:s3:::stream.wecare.digital/whatsapp-media/whatsapp-media-incoming/*
  - arn:aws:s3:::stream.wecare.digital/whatsapp-media/whatsapp-media-outgoing/*
  - arn:aws:s3:::stream.wecare.digital/base-wecare-digital/reports/*
```

### Denied Operations
```
❌ Wildcard access to base-wecare-digital/*
❌ Access to other buckets
❌ Bucket policy modifications
❌ Lifecycle policy changes
❌ Public access
```

---

## Data Flow Diagrams

### Inbound WhatsApp Message
```
WhatsApp User
    ↓
AWS EUM Social
    ↓
SNS Topic (base-wecare-digital)
    ↓
Lambda (inbound-whatsapp-handler)
    ├→ DynamoDB (Contact, Message, MediaFile)
    ├→ S3 (whatsapp-media/whatsapp-media-incoming/)
    ├→ Lambda (ai-query-kb, ai-generate-response)
    └→ Lambda (outbound-whatsapp) [auto-reaction]
```

### Outbound WhatsApp Message
```
Frontend/Bulk Job
    ↓
Lambda (outbound-whatsapp)
    ├→ S3 (whatsapp-media/whatsapp-media-outgoing/) [if media]
    ├→ AWS EUM Social API
    └→ DynamoDB (Message)
    ↓
WhatsApp User
```

### Bulk Job Report
```
Frontend
    ↓
Lambda (bulk-job-control)
    ├→ DynamoDB (BulkJobs, BulkRecipients)
    ├→ S3 (base-wecare-digital/reports/)
    └→ Frontend
```

---

## Verification Commands

```bash
# List all S3 objects
aws s3 ls s3://stream.wecare.digital/ --recursive

# Check Lambda environment variables
aws lambda get-function-configuration --function-name wecare-inbound-whatsapp --query 'Environment.Variables'

# Check IAM role permissions
aws iam get-role-policy --role-name base-wecare-digital --policy-name S3Access

# Check DynamoDB tables
aws dynamodb list-tables --query 'TableNames[?contains(@, `base-wecare-digital`)]'

# Check SQS queues
aws sqs list-queues --query 'QueueUrls[?contains(@, `base-wecare-digital`)]'

# Check Bedrock KB
aws bedrock-agent get-knowledge-base --knowledge-base-id FZBPKGTOYE

# Check Bedrock Agent
aws bedrock-agent get-agent --agent-id HQNT0JXN8G

# Check SNS topic
aws sns get-topic-attributes --topic-arn arn:aws:sns:us-east-1:809904170947:base-wecare-digital
```

---

**Document Status**: ✅ COMPLETE  
**Last Verified**: 2026-01-21  
**Verified By**: Deep code analysis of all Lambda functions and AWS resources

