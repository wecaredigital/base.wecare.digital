# Implementation Plan: WECARE.DIGITAL Admin Platform

## Overview

This implementation plan breaks down the WECARE.DIGITAL Admin Platform into discrete coding tasks. The platform is a serverless multi-channel messaging system built on AWS with Python 3.12 Lambda functions, DynamoDB storage, and AWS Amplify Gen 2 deployment. The implementation follows a layered approach: infrastructure → core utilities → authentication → contact management → messaging → bulk processing → AI integration.

## Tasks

- [x] 1. Set up AWS Amplify Gen 2 infrastructure
  - Define 11 DynamoDB tables in amplify/backend.ts with PAY_PER_REQUEST billing
  - Configure TTL on Messages (30 days), DLQMessages (7 days), AuditLogs (180 days), RateLimitTrackers (24 hours)
  - Define 4 SQS queues: inbound-dlq, bulk-queue, bulk-dlq, outbound-dlq (optional)
  - Configure SNS topic subscription for WhatsApp webhooks
  - Set up S3 bucket references for auth.wecare.digital and stream.wecare.digital
  - Configure CloudWatch log group /base-wecare-digital/common
  - Define environment variables per Lambda function (SEND_MODE, AWS_REGION, LOG_LEVEL, etc.)
  - Configure branch-specific deployments (main=LIVE, feature/*=DRY_RUN, release/*=DRY_RUN)
  - _Requirements: 10.1, 10.2, 10.3, 10.5, 10.6, 11.1, 11.2, 11.3, 11.6, 18.1, 18.2, 18.4, 18.5_

- [x] 2. Implement core utility modules
  - [x] 2.1 Create MessageValidator class with validation methods
    - Implement validate_whatsapp() with opt-in and allowlist checks
    - Implement validate_sms() with opt-in check
    - Implement validate_email() with opt-in check
    - Implement check_customer_service_window() for 24-hour window calculation
    - All validation methods return ValidationResult with success/failure and error details
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 16.2, 16.3_
  
  - [ ]* 2.2 Write property test for MessageValidator
    - **Property 9: WhatsApp Opt-In Validation**
    - **Validates: Requirements 3.1**
  
  - [ ]* 2.3 Write property test for MessageValidator allowlist
    - **Property 10: WhatsApp Allowlist Validation**
    - **Validates: Requirements 3.2**
  
  - [ ]* 2.4 Write property test for MessageValidator SMS
    - **Property 11: SMS Opt-In Validation**
    - **Validates: Requirements 3.3**
  
  - [ ]* 2.5 Write property test for MessageValidator Email
    - **Property 12: Email Opt-In Validation**
    - **Validates: Requirements 3.4**
  
  - [x] 2.6 Create RateLimiter class with token bucket algorithm
    - Implement check_and_consume() using DynamoDB atomic counters
    - Implement get_current_usage() for rolling 24-hour window tracking
    - Support channel-specific limits: WhatsApp (80/sec per phone), SMS (5/sec), Email (10/sec)
    - Use RateLimitTrackers table with TTL for automatic cleanup
    - _Requirements: 5.9, 6.5, 7.5, 13.1, 13.2, 13.5_
  
  - [ ]* 2.7 Write property test for RateLimiter
    - **Property 26: WhatsApp Phone Number Rate Limit**
    - **Validates: Requirements 5.9**
  
  - [x] 2.8 Create logging utility with structured CloudWatch logging
    - Implement log_validation_failure() with contactId, channel, reason
    - Implement log_api_error() with request ID, error type, stack trace
    - Implement log_authentication_attempt() with userId, timestamp, result
    - Use JSON format for all logs
    - _Requirements: 3.6, 14.1, 14.2, 14.3_
  
  - [x] 2.9 Create metrics utility for CloudWatch metrics
    - Implement emit_message_delivery_metric() for success/failure rates per channel
    - Implement emit_bulk_job_metric() for duration and throughput
    - _Requirements: 14.4, 14.5_
  
  - [x] 2.10 Create error handling utilities
    - Implement retry_with_exponential_backoff() with max 3 retries
    - Implement send_to_dlq() for failed message handling
    - Implement CircuitBreaker class for external API calls
    - _Requirements: 4.7, 8.9, 13.8_

- [x] 3. Checkpoint - Ensure core utilities tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement authentication and authorization
  - [x] 4.1 Create auth-middleware Lambda function
    - Extract JWT from Authorization header
    - Validate JWT against Cognito JWKS endpoint (us-east-1_CC9u1fYh6)
    - Extract user claims (userId, email, role)
    - Check role permissions for requested operation
    - Return authorization decision with user context
    - Log all authentication attempts
    - _Requirements: 1.1, 1.2, 1.6, 14.1_
  
  - [ ]* 4.2 Write property test for auth-middleware
    - **Property 1: Authentication Returns Valid Role**
    - **Validates: Requirements 1.1, 1.2**
  
  - [x] 4.3 Implement RBAC enforcement logic
    - Define role permissions: Viewer (read-only), Operator (read-write), Admin (all)
    - Implement check_permission() function
    - Return HTTP 403 for unauthorized actions
    - _Requirements: 1.3, 1.4, 1.5, 1.6_
  
  - [ ]* 4.4 Write property test for RBAC enforcement
    - **Property 2: RBAC Enforcement**
    - **Validates: Requirements 1.3, 1.4, 1.5**
  
  - [ ]* 4.5 Write property test for unauthorized access
    - **Property 3: Unauthorized Access Returns 403**
    - **Validates: Requirements 1.6**

- [x] 5. Implement contact management Lambda functions
  - [x] 5.1 Create contacts-create Lambda function
    - Validate at least one of {phone, email} is provided
    - Generate unique contactId (UUID)
    - Set all opt-in flags to False by default
    - Set createdAt and updatedAt timestamps
    - Store in DynamoDB Contacts table
    - Return created contact record
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ]* 5.2 Write property test for contact creation defaults
    - **Property 4: Contact Creation Default Opt-Ins**
    - **Validates: Requirements 2.1**
  
  - [ ]* 5.3 Write property test for contact phone/email requirement
    - **Property 5: Contact Requires Phone or Email**
    - **Validates: Requirements 2.2**
  
  - [x] 5.4 Create contacts-read Lambda function
    - Query DynamoDB by contactId
    - Filter out soft-deleted records (deletedAt is null)
    - Return contact record or 404
    - _Requirements: 2.3_
  
  - [x] 5.5 Create contacts-update Lambda function
    - Validate contactId exists and not soft-deleted
    - Update only provided fields
    - Require explicit opt-in changes
    - Set updatedAt timestamp
    - Use DynamoDB UpdateItem with conditional expression
    - _Requirements: 2.4_
  
  - [ ]* 5.6 Write property test for contact update opt-in validation
    - **Property 6: Contact Update Requires Explicit Opt-In Changes**
    - **Validates: Requirements 2.4**
  
  - [x] 5.7 Create contacts-delete Lambda function
    - Set deletedAt timestamp (soft delete)
    - Do not physically delete record
    - _Requirements: 2.5_
  
  - [ ]* 5.8 Write property test for soft delete
    - **Property 7: Contact Deletion is Soft Delete**
    - **Validates: Requirements 2.5**
  
  - [x] 5.9 Create contacts-search Lambda function
    - Perform case-insensitive search on name, phone, email
    - Use DynamoDB Scan with FilterExpression
    - Filter out soft-deleted records
    - Paginate results with limit and nextToken
    - _Requirements: 2.6_
  
  - [ ]* 5.10 Write property test for case-insensitive search
    - **Property 8: Contact Search is Case-Insensitive**
    - **Validates: Requirements 2.6**

- [ ] 6. Checkpoint - Ensure contact management tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement WhatsApp inbound message processing
  - [x] 7.1 Create inbound-whatsapp-handler Lambda function
    - Parse SNS event and extract Message
    - Decode whatsAppWebhookEntry JSON string
    - Process messages array: extract sender, lookup/create Contact
    - Store message in Messages table with TTL (30 days)
    - Update Contact.lastInboundMessageAt timestamp
    - Process statuses array: update message status
    - Deduplicate using whatsappMessageId
    - On error: send to inbound-dlq
    - _Requirements: 4.1, 4.2, 4.3, 4.8, 4.9, 5.12_
  
  - [ ]* 7.2 Write property test for inbound message parsing
    - **Property 15: Inbound Message Parsing**
    - **Validates: Requirements 4.1, 4.2**
  
  - [ ]* 7.3 Write property test for inbound message persistence
    - **Property 16: Inbound Message Persistence**
    - **Validates: Requirements 4.3**
  
  - [ ]* 7.4 Write property test for inbound message deduplication
    - **Property 19: Inbound Message Deduplication**
    - **Validates: Requirements 4.8**
  
  - [ ]* 7.5 Write property test for contact timestamp update
    - **Property 20: Inbound Message Updates Contact Timestamp**
    - **Validates: Requirements 4.9**
  
  - [x] 7.6 Implement inbound media download logic
    - Check if message contains media (type: image|video|audio|document)
    - Call GetWhatsAppMessageMedia API with mediaId
    - Store file in S3 auth.wecare.digital with prefix whatsapp-media/whatsapp-media-incoming/
    - Store S3 key and metadata in MediaFiles table
    - _Requirements: 4.4, 4.5, 4.6_
  
  - [ ]* 7.7 Write property test for inbound media download
    - **Property 17: Inbound Media Download**
    - **Validates: Requirements 4.4, 4.5, 4.6**
  
  - [ ]* 7.8 Write property test for inbound processing DLQ
    - **Property 18: Inbound Processing Failure Goes to DLQ**
    - **Validates: Requirements 4.7**

- [x] 8. Implement WhatsApp outbound message delivery
  - [x] 8.1 Create outbound-whatsapp Lambda function
    - Retrieve Contact record by contactId
    - Call MessageValidator.validate_whatsapp() for opt-in and allowlist
    - Check customer service window for free-form vs template requirement
    - Check SEND_MODE: if DRY_RUN log and return mock, if LIVE proceed
    - For media: upload to S3, call PostWhatsAppMessageMedia, get mediaId
    - Call SendWhatsAppMessage API with originationPhoneNumberId and metaApiVersion "v20.0"
    - Store record in Messages table with status "sent"
    - Check rate limit using RateLimiter
    - On error: store error details, set status "failed"
    - _Requirements: 3.1, 3.2, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 16.3, 16.4, 16.5, 16.6_
  
  - [ ]* 8.2 Write property test for SEND_MODE LIVE
    - **Property 21: SEND_MODE LIVE Calls API (WhatsApp)**
    - **Validates: Requirements 5.2**
  
  - [ ]* 8.3 Write property test for SEND_MODE DRY_RUN
    - **Property 22: SEND_MODE DRY_RUN Skips API (WhatsApp)**
    - **Validates: Requirements 5.3**
  
  - [ ]* 8.4 Write property test for text message character limit
    - **Property 23: WhatsApp Text Message Character Limit**
    - **Validates: Requirements 5.4**
  
  - [ ]* 8.5 Write property test for media upload workflow
    - **Property 24: WhatsApp Media Upload Workflow**
    - **Validates: Requirements 5.5, 5.6, 5.7**
  
  - [ ]* 8.6 Write property test for API parameters
    - **Property 25: WhatsApp API Parameters**
    - **Validates: Requirements 5.8**
  
  - [ ]* 8.7 Write property test for customer service window
    - **Property 69: Customer Service Window Calculation**
    - **Property 70: Outbound Checks Customer Service Window**
    - **Property 71: Within Window Allows Free-Form Messages**
    - **Property 72: Outside Window Requires Template**
    - **Validates: Requirements 16.2, 16.3, 16.4, 16.5, 16.6**

- [x] 9. Implement SMS and Email outbound delivery
  - [x] 9.1 Create outbound-sms Lambda function
    - Retrieve Contact record
    - Call MessageValidator.validate_sms()
    - Check SEND_MODE: if DRY_RUN log and return, if LIVE proceed
    - Use AWS Pinpoint SMS Pool pool-6fbf5a5f390d4eeeaa7dbae39d78933e
    - Support up to 1600 characters with automatic segmentation
    - Check rate limit (5 messages/second)
    - Store record in Messages table
    - On error: store error details, set status "failed"
    - _Requirements: 3.3, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [ ]* 9.2 Write property test for SMS SEND_MODE
    - **Property 30: SEND_MODE LIVE Calls API (SMS)**
    - **Property 31: SEND_MODE DRY_RUN Skips API (SMS)**
    - **Validates: Requirements 6.2, 6.3**
  
  - [ ]* 9.3 Write property test for SMS character limit
    - **Property 32: SMS Character Limit with Segmentation**
    - **Validates: Requirements 6.4**
  
  - [x] 9.4 Create outbound-email Lambda function
    - Retrieve Contact record
    - Call MessageValidator.validate_email()
    - Check SEND_MODE: if DRY_RUN log and return, if LIVE proceed
    - Use AWS SES with sender one@wecare.digital
    - Support both plain text and HTML formats
    - Check rate limit (10 messages/second)
    - Store record in Messages table
    - On error: store error details, set status "failed"
    - _Requirements: 3.4, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [ ]* 9.5 Write property test for Email SEND_MODE
    - **Property 34: SEND_MODE LIVE Calls API (Email)**
    - **Property 35: SEND_MODE DRY_RUN Skips API (Email)**
    - **Validates: Requirements 7.2, 7.3**
  
  - [ ]* 9.6 Write property test for Email format support
    - **Property 36: Email Format Support**
    - **Validates: Requirements 7.4**
  
  - [ ]* 9.7 Write property test for error handling
    - **Property 27: API Error Updates Message Status**
    - **Validates: Requirements 5.10, 6.6, 7.6**

- [ ] 10. Checkpoint - Ensure messaging tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement bulk message processing
  - [x] 11.1 Create bulk-job-create Lambda function
    - Validate input parameters
    - Check confirmation gate: if recipients > 20 and not confirmed, return error
    - Query RateLimitTrackers for WhatsApp tier limit check
    - If would exceed tier limit, reject with error
    - Generate jobId (UUID)
    - Store in BulkJobs table with status "pending"
    - Store recipients in BulkRecipients table
    - Split recipients into chunks of 100
    - Enqueue each chunk to bulk-queue SQS
    - _Requirements: 8.1, 8.2, 8.3, 13.10_
  
  - [ ]* 11.2 Write property test for confirmation gate
    - **Property 38: Bulk Job Confirmation Gate**
    - **Validates: Requirements 8.1**
  
  - [ ]* 11.3 Write property test for bulk job creation
    - **Property 39: Bulk Job Creation**
    - **Validates: Requirements 8.2**
  
  - [ ]* 11.4 Write property test for bulk message chunking
    - **Property 40: Bulk Message Chunking**
    - **Validates: Requirements 8.3**
  
  - [x] 11.5 Create bulk-worker Lambda function
    - Parse SQS message
    - For each recipient: retrieve Contact, validate, call outbound Lambda
    - Update BulkRecipients record with status
    - Update BulkJobs progress counters (sentCount, failedCount) atomically
    - Respect channel-specific rate limits
    - Use exponential backoff for throttling
    - On chunk failure: send to bulk-dlq
    - On job completion: update status to "completed", generate report
    - Store report in S3 stream.wecare.digital
    - Configure reserved concurrency 2-5
    - _Requirements: 8.4, 8.5, 8.6, 8.8, 8.9_
  
  - [ ]* 11.6 Write property test for bulk validation
    - **Property 41: Bulk Processing Applies Validation**
    - **Validates: Requirements 8.5**
  
  - [ ]* 11.7 Write property test for bulk progress tracking
    - **Property 42: Bulk Job Progress Tracking**
    - **Validates: Requirements 8.6**
  
  - [ ]* 11.8 Write property test for bulk completion report
    - **Property 44: Bulk Job Completion Report**
    - **Validates: Requirements 8.8**
  
  - [x] 11.9 Create bulk-job-control Lambda function
    - Validate jobId exists
    - Implement pause: update status to "paused"
    - Implement resume: update status to "pending", re-enqueue unprocessed chunks
    - Implement cancel: update status to "cancelled", purge queue messages, generate partial report
    - _Requirements: 8.7_
  
  - [ ]* 11.10 Write property test for bulk job control
    - **Property 43: Bulk Job Control Operations**
    - **Validates: Requirements 8.7**

- [x] 12. Implement DLQ replay functionality
  - [x] 12.1 Create dlq-replay Lambda function
    - Receive messages from specified DLQ (up to batchSize)
    - Check retry counter: if >= maxRetries, skip and delete
    - Apply original processing logic
    - On success: delete from DLQ
    - On failure: increment retryCount, return to DLQ
    - Deduplicate using messageId
    - Return replay statistics
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_
  
  - [ ]* 12.2 Write property test for DLQ replay deduplication
    - **Property 46: DLQ Replay Deduplication**
    - **Validates: Requirements 9.2**
  
  - [ ]* 12.3 Write property test for DLQ replay batch size
    - **Property 47: DLQ Replay Batch Size Limit**
    - **Validates: Requirements 9.3**
  
  - [ ]* 12.4 Write property test for DLQ replay retry limit
    - **Property 51: DLQ Replay Retry Limit**
    - **Validates: Requirements 9.7**

- [ ] 13. Checkpoint - Ensure bulk and DLQ tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Implement AI automation
  - [x] 14.1 Create ai-query-kb Lambda function
    - Call Bedrock RetrieveAndGenerate API
    - Pass query to Knowledge Base FZBPKGTOYE
    - Return top results with relevance scores
    - Store interaction in AIInteractions table
    - _Requirements: 15.1_
  
  - [ ]* 14.2 Write property test for AI KB query
    - **Property 63: AI Enabled Queries Knowledge Base**
    - **Validates: Requirements 15.1**
  
  - [x] 14.3 Create ai-generate-response Lambda function
    - Call Bedrock Agent HQNT0JXN8G (amazon.nova-pro-v1:0 model)
    - Prompts managed in AWS Console - no code deployment needed
    - Fallback to Knowledge Base direct query if agent fails
    - Store in AIInteractions table
    - _Requirements: 15.2, 15.3_
  
  - [ ]* 14.4 Write property test for AI response approval
    - **Property 65: AI Responses Require Approval**
    - **Validates: Requirements 15.3**
  
  - [x] 14.5 Integrate AI into inbound-whatsapp-handler
    - Check if AI automation is enabled in SystemConfig
    - If enabled: call ai-query-kb and ai-generate-response
    - Auto-reply to WhatsApp with AI response
    - Respect SEND_MODE: DRY_RUN prevents sending AI responses
    - _Requirements: 15.4, 15.7_
  
  - [x] 14.6 Configure Bedrock Agent for production
    - Fixed agentCollaboration DISABLED (was causing prepare failure)
    - Agent status: PREPARED and ready
    - **CRITICAL**: Use CLI to update agent, not AWS Console (Console resets collaboration to SUPERVISOR)
    - _Requirements: 15.2_
  
  - [ ]* 14.7 Write property test for AI toggle
    - **Property 66: AI Disabled Skips AI Processing**
    - **Validates: Requirements 15.4**

- [-] 15. Implement monitoring and alerting
  - [x] 15.1 Add CloudWatch metrics emission to all Lambda functions
    - Emit message delivery metrics per channel
    - Emit bulk job metrics (duration, throughput)
    - Emit authentication metrics
    - _Requirements: 14.4, 14.5_
  
  - [x] 15.2 Configure CloudWatch alarms
    - Lambda error rate > 1%
    - DLQ depth > 10
    - WhatsApp tier limit > 80%
    - API error rate > 5%
    - Bulk job failure rate > 10%
    - _Requirements: 13.9, 14.7_
  
  - [x] 15.3 Implement SNS alert publishing
    - Publish to arn:aws:sns:us-east-1:809904170947:base-wecare-digital
    - Alert on critical errors
    - Alert on tier limit warnings
    - Alert on DLQ depth warnings
    - _Requirements: 13.9, 14.7_
  
  - [ ]* 15.4 Write property test for tier limit alert
    - **Property 57: WhatsApp Tier Limit Alert**
    - **Validates: Requirements 13.9**

- [-] 16. Implement TTL and data lifecycle
  - [x] 16.1 Add TTL calculation to all record creation
    - Messages table: expiresAt = current_time + 2592000 (30 days)
    - DLQMessages table: expiresAt = current_time + 604800 (7 days)
    - AuditLogs table: expiresAt = current_time + 15552000 (180 days)
    - RateLimitTrackers table: lastUpdatedAt = current_time + 86400 (24 hours)
    - Store as Unix epoch timestamp in seconds (not milliseconds)
    - Validate Number type
    - _Requirements: 17.1, 17.6, 17.10_
  
  - [ ]* 16.2 Write property test for TTL format
    - **Property 76: TTL Values in Unix Seconds**
    - **Validates: Requirements 17.1**
  
  - [ ]* 16.3 Write property test for TTL calculation
    - **Property 77: TTL Expiration Calculation**
    - **Validates: Requirements 17.6**
  
  - [x] 16.4 Add filter expressions to queries
    - Implement filter for expiresAt > current_time in all queries
    - Handle TTL deletion lag (items may still appear until physically deleted)
    - _Requirements: 17.7_
  
  - [ ]* 16.5 Write property test for expired item filtering
    - **Property 78: Queries Exclude Expired Items**
    - **Validates: Requirements 17.7**

- [-] 17. Implement environment variable validation
  - [x] 17.1 Add startup validation to all Lambda functions
    - Check required environment variables are present
    - Fail fast with clear error message if missing
    - Log validation results
    - _Requirements: 18.6_
  
  - [ ]* 17.2 Write property test for environment variable validation
    - **Property 80: Lambda Startup Validates Environment Variables**
    - **Validates: Requirements 18.6**

- [-] 18. Implement UI components (React)
  - [x] 18.1 Create sidebar navigation component
    - Display "WECARE.DIGITAL" as application title
    - Menu items: Pay, Link, Forms, Docs, Invoice, DM, Contacts, Bulk Messaging, Agent
    - Use Helvetica Light font, white background, black buttons with 13px border radius
    - Implement SPA navigation (no full page reload)
    - _Requirements: 12.1, 12.2, 12.7_
  
  - [x] 18.2 Create contacts management UI
    - Contact list with search
    - Contact create/edit form
    - Opt-in toggle switches
    - Display customer service window expiration time
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 16.9_
  
  - [x] 18.3 Create messaging UI
    - Message compose form with channel selection
    - Media upload for WhatsApp
    - Message history view
    - _Requirements: 5.2, 5.3, 5.4, 5.5_
  
  - [x] 18.4 Create bulk messaging UI
    - Recipient selection
    - Confirmation dialog for >20 recipients
    - Progress tracking display
    - Job control buttons (pause/resume/cancel)
    - _Requirements: 8.1, 8.6, 8.7_
  
  - [x] 18.5 Create AI automation UI (optional)
    - AI response suggestion display
    - Approval/reject buttons
    - Feedback form
    - _Requirements: 15.3, 15.6_

- [ ] 19. Final checkpoint - Integration testing
  - Run end-to-end tests for complete workflows
  - Test WhatsApp inbound → AI → outbound flow
  - Test bulk message job with 150 recipients
  - Test DLQ replay with failed messages
  - Test rate limiting under load
  - Verify all CloudWatch metrics and alarms
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 20. Deployment and verification
  - Deploy to preview environment (feature branch)
  - Verify SEND_MODE=DRY_RUN enforcement
  - Test all API endpoints
  - Deploy to production (main branch)
  - Verify SEND_MODE=LIVE
  - Monitor CloudWatch logs and metrics
  - _Requirements: 10.1, 10.2, 10.7_

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (80 total)
- Unit tests validate specific examples and edge cases
- All Lambda functions use Python 3.12 runtime
- All infrastructure is defined in AWS Amplify Gen 2 (amplify/ folder)
- SEND_MODE enforcement is critical for non-production environments
