# Requirements Document: WECARE.DIGITAL Admin Platform

## Introduction

The WECARE.DIGITAL Admin Platform is a cloud-based multi-channel messaging system that enables organizations to manage contacts and send messages via WhatsApp, SMS, and Email. The platform prioritizes message delivery safety through strict opt-in validation and allowlist verification, ensuring compliance with communication regulations. Built on AWS infrastructure with Python FastAPI backend and deployed via AWS Amplify Gen 2, the system supports role-based access control, bulk messaging operations, inbound message processing, and AI-powered automation through AWS Bedrock.

**WhatsApp Integration**: This platform uses **AWS End User Messaging Social API** (API version 2024-01-01) for all WhatsApp messaging operations. All WhatsApp-related requirements strictly follow AWS EUM Social API specifications and patterns.

**AWS Resources Reference**: For comprehensive details on all AWS services, API operations, rate limits, and integration flows, see [aws-resources.md](./aws-resources.md).

## Glossary

- **Admin_Platform**: The WECARE.DIGITAL web application system
- **Contact**: A person or entity with contact information stored in the system
- **Opt_In_Status**: Boolean flag indicating consent for a specific communication channel (WhatsApp, SMS, Email)
- **Allowlist**: Approved WhatsApp Phone-Number-IDs authorized to send messages
- **Bulk_Message**: A message sent to multiple recipients in a single operation
- **Inbound_Message**: A message received from external sources (WhatsApp)
- **Outbound_Message**: A message sent from the platform to recipients
- **DLQ**: Dead Letter Queue for failed message processing
- **Send_Mode**: Environment configuration (DRY_RUN or LIVE) controlling actual message delivery
- **Message_Worker**: Lambda function processing bulk message operations
- **RBAC**: Role-Based Access Control system with Viewer, Operator, and Admin roles
- **Cognito_User_Pool**: AWS authentication service (us-east-1_CC9u1fYh6)
- **Amplify_Gen2**: AWS deployment framework using amplify/ folder configuration
- **IAM_Role**: AWS identity (arn:aws:iam::809904170947:role/base-wecare-digital)
- **Bedrock_KB**: AWS knowledge base (FZBPKGTOYE) for AI automation
- **Bedrock_Agent**: AWS AI agent (HQNT0JXN8G) for automated responses
- **Media_Storage**: S3 bucket (auth.wecare.digital) for WhatsApp media files
- **Report_Storage**: S3 bucket (stream.wecare.digital) for bulk message reports
- **AWS_EUM_Social**: AWS End User Messaging Social API for WhatsApp integration
- **Customer_Service_Window**: 24-hour period after inbound message allowing free-form WhatsApp messages
- **Template_Message**: Pre-approved WhatsApp message format required outside customer service window

## Requirements

### Requirement 1: Authentication and Authorization

**User Story:** As a system administrator, I want secure authentication with role-based access control, so that users can only perform actions appropriate to their role.

#### Acceptance Criteria

1. WHEN a user attempts to access THE Admin_Platform, THE System SHALL authenticate the user against Cognito_User_Pool us-east-1_CC9u1fYh6
2. WHEN authentication succeeds, THE System SHALL assign the user one role from the set {Viewer, Operator, Admin}
3. WHERE a user has Viewer role, THE System SHALL allow read-only access to contacts and message history
4. WHERE a user has Operator role, THE System SHALL allow contact management and message sending operations
5. WHERE a user has Admin role, THE System SHALL allow all operations including user management and system configuration
6. WHEN a user attempts an unauthorized action, THE System SHALL return an HTTP 403 error and log the attempt
7. THE System SHALL use IAM_Role arn:aws:iam::809904170947:role/base-wecare-digital for all AWS service access

### Requirement 2: Contact Management

**User Story:** As an operator, I want to create and manage contacts with opt-in preferences, so that I can maintain an accurate contact database with proper consent tracking.

#### Acceptance Criteria

1. WHEN creating a new Contact, THE System SHALL set optInWhatsApp to false, optInSms to false, and optInEmail to false by default
2. WHEN a Contact is created, THE System SHALL require at least one of {phone number, email address} to be provided
3. THE System SHALL store Contact records in DynamoDB with attributes: contactId, name, phone, email, optInWhatsApp, optInSms, optInEmail, createdAt, updatedAt
4. WHEN updating a Contact, THE System SHALL validate that Opt_In_Status changes are explicitly provided
5. WHEN deleting a Contact, THE System SHALL perform a soft delete by setting a deletedAt timestamp
6. THE System SHALL provide search functionality by name, phone, or email with case-insensitive matching
7. WHERE a user has Viewer role, THE System SHALL allow read operations only on Contact records
8. WHERE a user has Operator or Admin role, THE System SHALL allow create, update, and delete operations on Contact records

### Requirement 3: Message Delivery Safety Validation

**User Story:** As a compliance officer, I want strict validation before any message is sent, so that the platform never sends messages to users who haven't opted in or through unauthorized channels.

#### Acceptance Criteria

1. WHEN sending a WhatsApp message, THE System SHALL verify the recipient Contact has optInWhatsApp set to true
2. WHEN sending a WhatsApp message, THE System SHALL verify the Phone-Number-ID is in the Allowlist {phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54, phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06}
3. WHEN sending an SMS message, THE System SHALL verify the recipient Contact has optInSms set to true
4. WHEN sending an Email message, THE System SHALL verify the recipient Contact has optInEmail set to true
5. IF either opt-in validation or allowlist validation fails, THEN THE System SHALL reject the message, return an error, and SHALL NOT attempt delivery
6. THE System SHALL log all validation failures with contactId, channel, and failure reason to CloudWatch log group /base-wecare-digital/common
7. THE System SHALL NOT provide fallback channels or "best effort" delivery when validation fails

### Requirement 4: WhatsApp Inbound Message Processing

**User Story:** As an operator, I want to receive and store WhatsApp messages sent to our platform, so that I can track customer communications and respond appropriately.

#### Acceptance Criteria

1. WHEN an Inbound_Message arrives via SNS Topic arn:aws:sns:us-east-1:809904170947:base-wecare-digital, THE System SHALL parse the AWS EUM Social event format with context and whatsAppWebhookEntry
2. WHEN processing an Inbound_Message, THE System SHALL decode the whatsAppWebhookEntry JSON string to extract WhatsApp payload
3. WHEN processing an Inbound_Message, THE System SHALL store the message record in DynamoDB with attributes: messageId, contactId, channel, direction, content, timestamp, status, whatsappMessageId
4. WHEN an Inbound_Message contains media (type: image|video|audio|document), THE System SHALL call GetWhatsAppMessageMedia API with mediaId from webhook
5. WHEN downloading media, THE System SHALL store the file in Media_Storage bucket auth.wecare.digital using destinationS3File parameter
6. WHEN an Inbound_Message contains media, THE System SHALL store the S3 object key and media metadata in the message record
7. IF Inbound_Message processing fails, THEN THE System SHALL send the message to inbound-dlq SQS queue
8. THE System SHALL deduplicate Inbound_Message records using whatsappMessageId as the unique identifier
9. WHEN an Inbound_Message is successfully processed, THE System SHALL update the Contact record with lastContactedAt timestamp to track 24-hour customer service window

### Requirement 5: WhatsApp Outbound Message Delivery

**User Story:** As an operator, I want to send WhatsApp text and media messages to contacts, so that I can communicate with customers through their preferred channel.

#### Acceptance Criteria

1. WHEN sending a WhatsApp Outbound_Message, THE System SHALL validate opt-in and allowlist per Requirement 3
2. WHERE Send_Mode is LIVE, THE System SHALL call AWS End User Messaging Social SendWhatsAppMessage API (POST /v1/whatsapp/send)
3. WHERE Send_Mode is DRY_RUN, THE System SHALL log the message details without actual API call
4. WHEN sending a text message, THE System SHALL support Unicode content up to 4096 characters
5. WHEN sending a media message, THE System SHALL first upload the file to S3 whatsapp-media/whatsapp-media-outgoing/ prefix
6. WHEN sending a media message, THE System SHALL call PostWhatsAppMessageMedia API with sourceS3File parameter to get mediaId
7. WHEN sending a media message, THE System SHALL include the mediaId in the SendWhatsAppMessage request
8. THE System SHALL pass originationPhoneNumberId from allowlist and metaApiVersion "v20.0" in all API calls
9. THE System SHALL enforce phone number throughput limit of 80 messages per second per phone number
10. WHEN AWS EUM Social API returns an error, THE System SHALL store the error details and update message status to failed
11. THE System SHALL store all Outbound_Message records in DynamoDB with delivery status, timestamps, and whatsappMessageId from API response
12. THE System SHALL track message status updates (sent|delivered|read|failed) received via SNS webhook

### Requirement 6: SMS Outbound Message Delivery

**User Story:** As an operator, I want to send SMS messages to contacts, so that I can reach customers who prefer text messaging.

#### Acceptance Criteria

1. WHEN sending an SMS Outbound_Message, THE System SHALL validate that the recipient Contact has optInSms set to true
2. WHERE Send_Mode is LIVE, THE System SHALL deliver the message via AWS SNS using SMS Pool WECARE-DIGITAL (pool-6fbf5a5f390d4eeeaa7dbae39d78933e)
3. WHERE Send_Mode is DRY_RUN, THE System SHALL log the message details without actual delivery
4. THE System SHALL support SMS content up to 1600 characters with automatic segmentation
5. THE System SHALL enforce a rate limit of 5 messages per second for SMS delivery
6. WHEN SNS returns an error, THE System SHALL store the error details and update message status to failed
7. THE System SHALL store all SMS Outbound_Message records in DynamoDB with delivery status

### Requirement 7: Email Outbound Message Delivery

**User Story:** As an operator, I want to send email messages to contacts, so that I can deliver detailed information and formatted content.

#### Acceptance Criteria

1. WHEN sending an Email Outbound_Message, THE System SHALL validate that the recipient Contact has optInEmail set to true
2. WHERE Send_Mode is LIVE, THE System SHALL deliver the message via AWS SES using verified sender one@wecare.digital
3. WHERE Send_Mode is DRY_RUN, THE System SHALL log the message details without actual delivery
4. THE System SHALL support both plain text and HTML email formats
5. THE System SHALL enforce a rate limit of 10 messages per second for email delivery
6. WHEN SES returns an error, THE System SHALL store the error details and update message status to failed
7. THE System SHALL store all Email Outbound_Message records in DynamoDB with delivery status

### Requirement 8: Bulk Message Operations

**User Story:** As an operator, I want to send messages to multiple contacts simultaneously with progress tracking, so that I can efficiently communicate with large groups while maintaining control.

#### Acceptance Criteria

1. WHEN creating a Bulk_Message with more than 20 recipients, THE System SHALL require explicit confirmation before processing
2. WHEN a Bulk_Message is confirmed, THE System SHALL create a bulk job record in DynamoDB with status "pending"
3. THE System SHALL enqueue Bulk_Message operations to bulk-queue SQS queue in chunks of 100 recipients
4. THE Message_Worker SHALL process bulk-queue messages with reserved concurrency between 2 and 5
5. WHEN processing each recipient, THE Message_Worker SHALL apply all validation rules from Requirement 3
6. THE System SHALL update the bulk job record with progress metrics: total, sent, failed, pending
7. WHEN a Bulk_Message job is in progress, THE System SHALL allow pause, resume, and cancel operations
8. WHEN a Bulk_Message job completes, THE System SHALL generate a report and store it in Report_Storage bucket stream.wecare.digital
9. IF bulk message processing fails, THEN THE System SHALL send the failed chunk to bulk-dlq SQS queue

### Requirement 9: Dead Letter Queue Replay

**User Story:** As an operator, I want to retry failed message processing from the DLQ, so that I can recover from transient errors without losing messages.

#### Acceptance Criteria

1. THE System SHALL provide a replay function for inbound-dlq SQS queue messages
2. WHEN replaying DLQ messages, THE System SHALL deduplicate using messageId to prevent duplicate processing
3. THE System SHALL allow batch replay of up to 100 messages at a time
4. WHEN replaying a message, THE System SHALL apply the same processing logic as the original handler
5. IF replay succeeds, THEN THE System SHALL delete the message from the DLQ
6. IF replay fails again, THEN THE System SHALL increment a retry counter and return the message to the DLQ
7. THE System SHALL prevent replay of messages that have exceeded 5 retry attempts

### Requirement 10: Environment and Deployment Configuration

**User Story:** As a DevOps engineer, I want automated deployment with environment-specific configurations, so that code changes are safely promoted through preview, staging, and production environments.

#### Acceptance Criteria

1. WHEN code is pushed to main branch, THE System SHALL deploy to production environment with Send_Mode set to LIVE
2. WHEN code is pushed to feature/* branches, THE System SHALL deploy to preview environment with Send_Mode set to DRY_RUN
3. WHEN code is pushed to release/* branches, THE System SHALL deploy to staging environment with Send_Mode set to DRY_RUN
4. WHEN code is pushed to hotfix/* branches, THE System SHALL deploy to production environment with Send_Mode set to LIVE
5. THE System SHALL use AWS Amplify Gen 2 CI/CD pipeline for all deployments
6. THE System SHALL deploy to AWS account 809904170947 in region us-east-1
7. WHERE environment is preview or staging, THE System SHALL enforce Send_Mode DRY_RUN and SHALL NOT allow LIVE mode
8. THE System SHALL use SSL certificate 9df65f48-cdff-4f45-8e6d-f33c8c0beb92 for domain https://base.wecare.digital

### Requirement 11: Infrastructure Resource Management

**User Story:** As a system architect, I want all AWS resources defined in Amplify Gen 2 configuration, so that infrastructure is version-controlled and reproducible.

#### Acceptance Criteria

1. THE System SHALL define 11 DynamoDB tables in amplify/ folder with PAY_PER_REQUEST billing mode
2. THE System SHALL configure DynamoDB tables with appropriate TTL attributes and GSI indexes
3. THE System SHALL define 4 SQS queues: inbound-dlq, bulk-queue, bulk-dlq, and optionally outbound-dlq
4. THE System SHALL define 16 Lambda functions using Python 3.12 runtime
5. THE System SHALL configure Lambda functions to use IAM_Role arn:aws:iam::809904170947:role/base-wecare-digital
6. THE System SHALL create CloudWatch log group /base-wecare-digital/common for centralized logging
7. THE System SHALL reuse existing resources: Cognito_User_Pool, SNS Topic, S3 buckets, WhatsApp Allowlist, SMS Pool, SES sender
8. THE System SHALL NOT create new IAM roles or modify existing IAM_Role permissions

### Requirement 12: User Interface

**User Story:** As a user, I want an intuitive web interface with clear navigation, so that I can efficiently access all platform features.

#### Acceptance Criteria

1. THE System SHALL display "WECARE.DIGITAL" as the application title
2. THE System SHALL provide a sidebar navigation with menu items: Pay, Link, Forms, Docs, Invoice, DM (WhatsApp/SMS/SES), Contacts, Bulk Messaging, Agent
3. THE System SHALL use Helvetica Light font throughout the interface
4. THE System SHALL use white background color for all pages
5. THE System SHALL use black buttons with 13px border radius
6. THE System SHALL render responsively on mobile devices with screen widths down to 320px
7. WHEN a user clicks a navigation item, THE System SHALL load the corresponding page without full page reload

### Requirement 13: Rate Limiting and Performance

**User Story:** As a system administrator, I want enforced rate limits and performance controls, so that the platform operates within API quotas and maintains stability.

#### Acceptance Criteria

1. THE System SHALL enforce AWS End User Messaging Social API rate limit of 1000 WhatsApp messages per second at the API level
2. THE System SHALL track WhatsApp Business tier limits: 250 business-initiated conversations per 24 hours (Tier 1 default)
3. THE System SHALL enforce a maximum rate of 5 SMS messages per second
4. THE System SHALL enforce a maximum rate of 10 email messages per second
5. WHEN rate limits are exceeded, THE System SHALL queue messages for delayed delivery
6. THE Message_Worker SHALL have reserved concurrency configured between 2 and 5
7. THE System SHALL process bulk message chunks of exactly 100 recipients per batch
8. THE System SHALL implement exponential backoff for API retry attempts with maximum 3 retries
9. THE System SHALL alert administrators when WhatsApp tier limit reaches 80% capacity within the 24-hour window
10. THE System SHALL reject bulk jobs that would exceed the current WhatsApp tier limit

### Requirement 14: Monitoring and Logging

**User Story:** As a system administrator, I want comprehensive logging and monitoring, so that I can troubleshoot issues and track system health.

#### Acceptance Criteria

1. THE System SHALL log all authentication attempts to CloudWatch log group /base-wecare-digital/common
2. THE System SHALL log all message validation failures with contactId, channel, and reason
3. THE System SHALL log all API errors with request ID, error type, and stack trace
4. THE System SHALL emit CloudWatch metrics for message delivery success and failure rates per channel
5. THE System SHALL emit CloudWatch metrics for bulk job processing duration and throughput
6. THE System SHALL retain logs for minimum 30 days
7. WHEN critical errors occur, THE System SHALL publish alerts to SNS Topic arn:aws:sns:us-east-1:809904170947:base-wecare-digital

### Requirement 15: AI Automation

**User Story:** As an operator, I want AI-powered automated responses, so that common inquiries can be handled efficiently with operator approval.

#### Acceptance Criteria

1. WHERE AI automation is enabled, WHEN an Inbound_Message is received, THE System SHALL query Bedrock_KB FZBPKGTOYE for relevant knowledge
2. WHERE AI automation is enabled, THE System SHALL invoke Bedrock_Agent HQNT0JXN8G to generate response suggestions
3. WHERE AI automation is enabled, THE System SHALL present suggested responses to operators for approval before sending
4. WHERE AI automation is disabled, THE System SHALL process Inbound_Message records without AI interaction
5. THE System SHALL store AI interaction logs including query, response, and approval status
6. THE System SHALL allow operators to provide feedback on AI response quality
7. WHERE Send_Mode is DRY_RUN, THE System SHALL NOT send AI-generated responses even if approved

### Requirement 16: WhatsApp 24-Hour Customer Service Window

**User Story:** As a compliance officer, I want to track the 24-hour customer service window for each contact, so that the system sends free-form messages only within the window and uses templates outside it.

#### Acceptance Criteria

1. WHEN a Contact sends an inbound WhatsApp message, THE System SHALL record the timestamp as lastInboundMessageAt in the Contact record
2. THE System SHALL calculate the customer service window as 24 hours from lastInboundMessageAt timestamp
3. WHEN sending an outbound WhatsApp message, THE System SHALL check if current time is within 24 hours of lastInboundMessageAt
4. WHERE current time is within the 24-hour window, THE System SHALL allow free-form text and media messages
5. WHERE current time is outside the 24-hour window, THE System SHALL require use of pre-approved WhatsApp message templates
6. THE System SHALL reject free-form messages sent outside the 24-hour window with error code "TEMPLATE_REQUIRED"
7. THE System SHALL track template message usage separately from free-form messages for cost reporting
8. WHEN the 24-hour window expires, THE System SHALL log a warning if operators attempt to send free-form messages
9. THE System SHALL display the window expiration time in the UI when viewing contact details
10. THE System SHALL allow template messages to be sent at any time regardless of window status (as long as opt-in is valid)

### Requirement 17: DynamoDB TTL Implementation

**User Story:** As a system architect, I want properly configured Time-to-Live (TTL) on DynamoDB tables, so that expired data is automatically deleted without consuming write capacity or manual intervention.

#### Acceptance Criteria

1. THE System SHALL store TTL values as Unix epoch timestamps in seconds (not milliseconds) since January 1, 1970 00:00:00 UTC
2. THE System SHALL enable TTL on Messages table with ttlAttribute set to "expiresAt" for 30-day retention
3. THE System SHALL enable TTL on DLQMessages table with ttlAttribute set to "expiresAt" for 7-day retention
4. THE System SHALL enable TTL on AuditLogs table with ttlAttribute set to "expiresAt" for 180-day retention
5. THE System SHALL enable TTL on RateLimitTrackers table with ttlAttribute set to "lastUpdatedAt" for 24-hour retention
6. WHEN creating records with TTL, THE System SHALL calculate expiration timestamp as: current_time + retention_period_seconds
7. THE System SHALL implement filter expressions in queries to exclude items where expiresAt < current_time to handle TTL deletion lag
8. THE System SHALL document that TTL deletion is asynchronous and may take up to 48 hours (typically minutes) after expiration
9. THE System SHALL NOT rely on TTL for time-critical deletions requiring immediate removal
10. THE System SHALL validate that TTL attribute values are Number type in DynamoDB schema definitions

### Requirement 18: Amplify Environment Variables and Secrets

**User Story:** As a DevOps engineer, I want centralized management of environment variables and secrets for Lambda functions, so that configuration is secure, version-controlled, and environment-specific.

#### Acceptance Criteria

1. THE System SHALL define environment variables in amplify/backend.ts using defineFunction environment property
2. THE System SHALL configure branch-specific environment variables in Amplify Hosting for SEND_MODE per environment
3. THE System SHALL store sensitive values (WhatsApp tokens, API keys) using Amplify secrets, NOT environment variables
4. THE System SHALL pass the following environment variables to all Lambda functions: SEND_MODE, AWS_REGION, LOG_LEVEL, ENVIRONMENT
5. THE System SHALL pass channel-specific variables to messaging functions: WHATSAPP_PHONE_NUMBER_ID, SMS_POOL_ID, SES_SENDER_EMAIL
6. THE System SHALL validate required environment variables at Lambda function startup and fail fast with clear error messages
7. THE System SHALL NOT store plaintext secrets in environment variables as they are rendered in .amplify/artifacts
8. THE System SHALL use process.env to access environment variables in Python Lambda handlers
9. THE System SHALL document all required environment variables per Lambda function in implementation notes
10. WHERE environment variables reference Amplify Hosting branch variables, THE System SHALL use process.env.VARIABLE_NAME syntax in defineFunction

## Implementation Notes

### DynamoDB Table Definitions

The following 11 tables are required:

1. **Contacts**: contactId (PK), name, phone, email, optInWhatsApp, optInSms, optInEmail, lastInboundMessageAt, createdAt, updatedAt, deletedAt
2. **Messages**: messageId (PK), contactId (GSI), channel, direction, content, timestamp, status, errorDetails, whatsappMessageId, mediaId, expiresAt (TTL, 30 days)
3. **BulkJobs**: jobId (PK), createdBy, channel, totalRecipients, sentCount, failedCount, status, createdAt, updatedAt
4. **BulkRecipients**: jobId (PK), recipientId (SK), contactId, status, sentAt, errorDetails
5. **Users**: userId (PK), email, role, createdAt, lastLoginAt
6. **MediaFiles**: fileId (PK), messageId (GSI), s3Key, contentType, size, uploadedAt, whatsappMediaId
7. **DLQMessages**: dlqMessageId (PK), originalMessageId, queueName, retryCount, lastAttemptAt, payload, expiresAt (TTL, 7 days)
8. **AuditLogs**: logId (PK), userId, action, resourceType, resourceId, timestamp, details, expiresAt (TTL, 180 days)
9. **AIInteractions**: interactionId (PK), messageId (GSI), query, response, approved, feedback, timestamp
10. **RateLimitTrackers**: channel (PK), windowStart (SK), messageCount, lastUpdatedAt (TTL, 24 hours)
11. **SystemConfig**: configKey (PK), configValue, updatedBy, updatedAt

### Lambda Function List

The following 16 Lambda functions are required:

1. **auth-middleware**: JWT validation and RBAC enforcement
2. **contacts-create**: Create new contact with opt-in defaults
3. **contacts-read**: Retrieve contact details
4. **contacts-update**: Update contact information and opt-in status
5. **contacts-delete**: Soft delete contact
6. **contacts-search**: Search contacts by name/phone/email
7. **inbound-whatsapp-handler**: Process SNS notifications for WhatsApp messages
8. **outbound-whatsapp**: Send WhatsApp text/media messages
9. **outbound-sms**: Send SMS messages via SNS
10. **outbound-email**: Send emails via SES
11. **bulk-job-create**: Create and validate bulk message jobs
12. **bulk-worker**: Process bulk message queue chunks
13. **bulk-job-control**: Handle pause/resume/cancel operations
14. **dlq-replay**: Replay failed messages from DLQ
15. **ai-query-kb**: Query Bedrock knowledge base (optional)
16. **ai-generate-response**: Invoke Bedrock agent for response generation (optional)

### Lambda Environment Variables Configuration

Each Lambda function requires specific environment variables configured in amplify/backend.ts:

**Global variables (all functions)**:
- `SEND_MODE`: DRY_RUN or LIVE (from Amplify Hosting branch variable)
- `AWS_REGION`: us-east-1
- `LOG_LEVEL`: INFO, DEBUG, or ERROR
- `ENVIRONMENT`: production, staging, or preview
- `COGNITO_USER_POOL_ID`: us-east-1_CC9u1fYh6

**Messaging functions (outbound-whatsapp, outbound-sms, outbound-email)**:
- `WHATSAPP_PHONE_NUMBER_ID_1`: phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54
- `WHATSAPP_PHONE_NUMBER_ID_2`: phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06
- `SMS_POOL_ID`: pool-6fbf5a5f390d4eeeaa7dbae39d78933e
- `SES_SENDER_EMAIL`: one@wecare.digital
- `SES_SENDER_NAME`: WECARE.DIGITAL

**Storage functions (inbound-whatsapp-handler, outbound-whatsapp)**:
- `MEDIA_BUCKET`: auth.wecare.digital
- `MEDIA_INBOUND_PREFIX`: whatsapp-media/whatsapp-media-incoming/
- `MEDIA_OUTBOUND_PREFIX`: whatsapp-media/whatsapp-media-outgoing/

**Bulk processing functions (bulk-job-create, bulk-worker)**:
- `REPORT_BUCKET`: stream.wecare.digital
- `REPORT_PREFIX`: base-wecare-digital/reports/
- `BULK_QUEUE_URL`: (generated by Amplify)
- `BULK_CONFIRMATION_THRESHOLD`: 20

**AI functions (ai-query-kb, ai-generate-response)**:
- `BEDROCK_KB_ID`: FZBPKGTOYE
- `BEDROCK_AGENT_ID`: HQNT0JXN8G
- `BEDROCK_AGENT_ALIAS_ID`: (generated during deployment)
- `BEDROCK_FOUNDATION_MODEL`: amazon.nova-pro-v1:0

**Secrets (stored in Amplify Secrets, NOT environment variables)**:
- `WHATSAPP_ACCESS_TOKEN`: WhatsApp Business API access token
- `APP_SECRET`: Meta App Secret for webhook signature validation

### DynamoDB TTL Configuration

TTL implementation details for automatic data expiration:

**TTL Attribute Format**:
- Store as Number type (not String)
- Value must be Unix epoch timestamp in seconds (not milliseconds)
- Calculate as: `int(time.time()) + retention_seconds` in Python
- Example: For 30-day retention: `current_timestamp + (30 * 24 * 60 * 60)`

**TTL Behavior**:
- Deletion is asynchronous (typically minutes, up to 48 hours)
- Expired items may still appear in scans/queries until physically deleted
- Use filter expressions to exclude expired items: `expiresAt > :current_time`
- TTL deletes do not consume write capacity units (free)
- Deleted items are removed from indexes and backups

**Table-Specific TTL Settings**:
- Messages: 30 days (2,592,000 seconds)
- DLQMessages: 7 days (604,800 seconds)
- AuditLogs: 180 days (15,552,000 seconds)
- RateLimitTrackers: 24 hours (86,400 seconds)

### Rate Limit Implementation

Rate limiting should use token bucket algorithm with DynamoDB atomic counters:
- Window size: 1 second
- AWS End User Messaging Social API: 1000 requests/second (account level)
- WhatsApp phone number throughput: 80 messages/second per phone number (default)
- SMS bucket capacity: 5 tokens
- Email bucket capacity: 10 tokens
- Refill rate: capacity per second

### Bulk Processing Flow

1. Operator creates bulk job → validation → confirmation gate (if >20 recipients)
2. Job record created with status "pending"
3. Recipients chunked into groups of 100 → enqueued to bulk-queue
4. Message_Worker processes chunks with concurrency 2-5
5. Each message validated → sent → status updated
6. Job progress tracked in real-time
7. Completion report generated → stored in Report_Storage

### Security Considerations

- All API endpoints require valid JWT from Cognito_User_Pool
- RBAC enforced at middleware layer before business logic
- Opt-in validation is fail-closed (missing opt-in = reject)
- Allowlist validation is fail-closed (missing Phone-Number-ID = reject)
- DRY_RUN mode enforced at infrastructure level for non-prod environments
- No AWS credentials stored in code (IAM_Role used for all access)
- Media files stored with private ACL in S3
- All sensitive data encrypted at rest (DynamoDB and S3 default encryption)

