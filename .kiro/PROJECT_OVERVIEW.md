# WECARE.DIGITAL Admin Platform - Project Overview

## 🎯 Project Scope

A **cloud-based multi-channel messaging platform** that enables organizations to manage contacts and send messages via **WhatsApp, SMS, and Email** with strict compliance controls, bulk messaging capabilities, and AI-powered automation.

---

## 🏗️ Final Infrastructure Architecture

### **Deployment Model**: Serverless on AWS
- **Region**: us-east-1
- **Account**: 809904170947
- **Deployment**: AWS Amplify Gen 2 CI/CD (Git push → Auto-deploy)
- **Runtime**: Python 3.12 Lambda functions
- **Frontend**: React SPA with Amplify Hosting

---

## 📦 AWS Resources Breakdown

### **Existing Resources** (Already Created ✅)

#### Authentication & Identity
- **Cognito User Pool**: `us-east-1_CC9u1fYh6` (WECARE.DIGITAL)
- **IAM Role**: `arn:aws:iam::809904170947:role/base-wecare-digital`

#### Storage
- **S3 Bucket 1**: `auth.wecare.digital` (WhatsApp media)
- **S3 Bucket 2**: `stream.wecare.digital` (Reports & AI docs)

#### Messaging Services
- **WhatsApp**: 2 Business Accounts, 2 Phone Numbers via AWS End User Messaging Social
  - Phone 1: +91 93309 94400 (WECARE.DIGITAL)
  - Phone 2: +91 99033 00044 (Manish Agarwal)
- **SMS**: Pinpoint Pool `pool-6fbf5a5f390d4eeeaa7dbae39d78933e` (WECARE-DIGITAL)
- **Email**: SES verified sender `one@wecare.digital`

#### Notifications
- **SNS Topic**: `arn:aws:sns:us-east-1:809904170947:base-wecare-digital`

#### AI (Required)
- **Bedrock Knowledge Base**: `FZBPKGTOYE` (base-wecare-digital-bedrock-kb) - ACTIVE ✓
- **Bedrock Agent**: `HQNT0JXN8G` (base-bedrock-agent) - NOT_PREPARED
  - **Foundation Model**: amazon.nova-pro-v1:0
  - **Orchestration**: SUPERVISOR (agent collaboration)
  - **Runtime**: base_bedrock_agentcore-1XHDxj2o3Q
  - **Memory**: SESSION_SUMMARY (30 days, 20 sessions)

---

### **Resources to Create** (During Implementation 🚧)

#### Database (DynamoDB - 11 Tables)
1. **Contacts** - Contact records with opt-in preferences
2. **Messages** - All inbound/outbound messages (TTL: 30 days)
3. **BulkJobs** - Bulk messaging job tracking
4. **BulkRecipients** - Individual recipient status per job
5. **Users** - Platform users with RBAC roles
6. **MediaFiles** - WhatsApp media metadata
7. **DLQMessages** - Failed message retry queue (TTL: 7 days)
8. **AuditLogs** - System audit trail (TTL: 180 days)
9. **AIInteractions** - AI query/response logs
10. **RateLimitTrackers** - Rate limiting counters (TTL: 24 hours)
11. **SystemConfig** - System configuration key-value store

#### Queues (SQS - 4 Queues)
1. **inbound-dlq** - Failed inbound message processing
2. **bulk-queue** - Bulk message job processing
3. **bulk-dlq** - Failed bulk message chunks
4. **outbound-dlq** - Failed outbound messages (optional)

#### Compute (Lambda - 16 Functions)

**Authentication (1)**
- `auth-middleware` - JWT validation & RBAC

**Contact Management (5)**
- `contacts-create` - Create new contact
- `contacts-read` - Retrieve contact details
- `contacts-update` - Update contact info
- `contacts-delete` - Soft delete contact
- `contacts-search` - Search contacts

**Messaging (4)**
- `inbound-whatsapp-handler` - Process WhatsApp webhooks
- `outbound-whatsapp` - Send WhatsApp messages
- `outbound-sms` - Send SMS messages
- `outbound-email` - Send email messages

**Bulk Operations (3)**
- `bulk-job-create` - Create bulk message jobs
- `bulk-worker` - Process bulk message queue
- `bulk-job-control` - Pause/resume/cancel jobs

**Operations (1)**
- `dlq-replay` - Retry failed messages

**AI Automation (2 - Required)**
- `ai-query-kb` - Query Bedrock knowledge base
- `ai-generate-response` - Generate AI responses

#### Monitoring
- **CloudWatch Log Group**: `/base-wecare-digital/common`
- **CloudWatch Metrics**: Custom metrics for delivery rates, errors
- **CloudWatch Alarms**: Error rates, DLQ depth, tier limits

#### Hosting
- **Amplify App**: React frontend with custom domain `https://base.wecare.digital`

---

## 🎨 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  React SPA (Amplify Hosting) - https://base.wecare.digital     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                         │
│  Cognito User Pool → auth-middleware Lambda → RBAC             │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  CONTACTS   │  │  MESSAGING  │  │    BULK     │
│  Management │  │   Delivery  │  │  Operations │
│             │  │             │  │             │
│ • Create    │  │ • WhatsApp  │  │ • Job Mgmt  │
│ • Read      │  │ • SMS       │  │ • Worker    │
│ • Update    │  │ • Email     │  │ • Control   │
│ • Delete    │  │ • Inbound   │  │ • Reports   │
│ • Search    │  │             │  │             │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VALIDATION LAYER                           │
│  • Opt-in verification (WhatsApp/SMS/Email)                    │
│  • Allowlist verification (WhatsApp phone numbers)             │
│  • 24-hour customer service window tracking                    │
│  • Rate limiting (80 MPS WhatsApp, 5 MPS SMS, 10 MPS Email)   │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  WhatsApp   │  │     SMS     │  │    Email    │
│  AWS EUM    │  │  Pinpoint   │  │     SES     │
│   Social    │  │             │  │             │
└─────────────┘  └─────────────┘  └─────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE & PERSISTENCE                        │
│  • DynamoDB (11 tables with TTL)                               │
│  • S3 (Media files + Reports)                                  │
│  • SQS (Message queues + DLQs)                                 │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                  MONITORING & OBSERVABILITY                     │
│  • CloudWatch Logs (centralized logging)                       │
│  • CloudWatch Metrics (delivery rates, errors)                 │
│  • CloudWatch Alarms (error thresholds, tier limits)           │
│  • SNS Alerts (critical errors)                                │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AI AUTOMATION (Required)                      │
│  • Bedrock Knowledge Base (query documents)                    │
│  • Bedrock Agent (generate responses with Nova Pro v1)        │
│  • Agent Core Runtime (base_bedrock_agentcore-1XHDxj2o3Q)     │
│  • Operator approval required before sending                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security & Compliance Features

### Message Delivery Safety
- ✅ **Opt-in validation**: Never send without explicit consent
- ✅ **Allowlist verification**: Only authorized WhatsApp phone numbers
- ✅ **Fail-closed design**: Reject on validation failure (no fallback)
- ✅ **24-hour window tracking**: Free-form vs template message enforcement

### Access Control
- ✅ **RBAC**: 3 roles (Viewer, Operator, Admin)
- ✅ **JWT authentication**: Cognito-based with JWKS validation
- ✅ **Audit logging**: All actions logged with 180-day retention

### Data Protection
- ✅ **Encryption at rest**: DynamoDB + S3 default encryption
- ✅ **Encryption in transit**: TLS 1.2+ for all API calls
- ✅ **TTL-based cleanup**: Automatic data expiration
- ✅ **Soft deletes**: Contact records never physically deleted

### Environment Isolation
- ✅ **DRY_RUN mode**: Non-production branches cannot send live messages
- ✅ **Branch-based deployment**: feature/* → preview, main → production
- ✅ **Environment variables**: Amplify-managed, branch-specific

---

## 📊 Key Capabilities

### 1. Contact Management
- Create/read/update/delete contacts
- Opt-in preference tracking (WhatsApp/SMS/Email)
- Case-insensitive search
- Soft delete with audit trail

### 2. Multi-Channel Messaging
- **WhatsApp**: Text + media (image/video/audio/document)
- **SMS**: Up to 1600 characters with auto-segmentation
- **Email**: Plain text + HTML formats

### 3. Bulk Messaging
- Send to multiple recipients simultaneously
- Confirmation gate for >20 recipients
- Real-time progress tracking
- Pause/resume/cancel controls
- Completion reports stored in S3

### 4. Inbound Message Processing
- WhatsApp webhook handling via SNS
- Media download and storage
- Contact timestamp tracking for 24-hour window
- Deduplication by message ID

### 5. Rate Limiting & Performance
- WhatsApp: 1000 RPS (API), 80 MPS (per phone)
- SMS: 5 MPS
- Email: 10 MPS
- Token bucket algorithm with DynamoDB counters
- Tier limit tracking (250 conversations/24h for Tier 1)

### 6. Error Handling & Reliability
- Dead Letter Queues (DLQ) for failed messages
- Replay functionality with retry limits (max 5)
- Exponential backoff for API retries
- Circuit breaker for external APIs

### 7. AI Automation (Required)
- Query Bedrock knowledge base for relevant info
- Generate response suggestions via Bedrock Agent (Amazon Nova Pro v1)
- Agent core runtime for orchestration and tool calling
- Operator approval required (never auto-send)
- Feedback collection for AI quality improvement

### 8. Monitoring & Alerting
- Centralized CloudWatch logging
- Custom metrics for delivery rates
- Alarms for error thresholds
- SNS alerts for critical issues

---

## 📈 Rate Limits & Quotas

| Service | Limit | Scope | Notes |
|---------|-------|-------|-------|
| WhatsApp API | 1000 RPS | Account | AWS EUM Social |
| WhatsApp Phone | 80 MPS | Per phone | Default throughput |
| WhatsApp Tier 1 | 250 conversations | 24-hour window | Business-initiated |
| SMS | 5 MPS | Account | Pinpoint pool |
| Email | 10 MPS | Account | SES sender |
| Bulk chunks | 100 recipients | Per batch | SQS processing |
| Lambda concurrency | 2-5 | bulk-worker | Reserved |

---

## 🚀 Deployment Strategy

### Branch → Environment Mapping
- **`main`** → Production (SEND_MODE=LIVE)
- **`feature/*`** → Preview (SEND_MODE=DRY_RUN)
- **`release/*`** → Staging (SEND_MODE=DRY_RUN)
- **`hotfix/*`** → Production (SEND_MODE=LIVE)

### Deployment Flow
```
Developer commits code
    ↓
git push
    ↓
AWS Amplify CI/CD Pipeline
    ↓
Build & Test
    ↓
Deploy Infrastructure (Amplify Gen 2)
    ↓
Deploy Lambda Functions
    ↓
Deploy Frontend
    ↓
Environment Live ✅
```

---

## 📋 Implementation Plan

### Phase 1: Infrastructure (Task 1)
- Set up Amplify Gen 2 configuration
- Define DynamoDB tables with TTL
- Configure SQS queues
- Set up environment variables

### Phase 2: Core Utilities (Tasks 2-3)
- Message validation logic
- Rate limiting with token bucket
- Logging and metrics utilities
- Error handling and retry logic

### Phase 3: Authentication (Task 4)
- JWT validation middleware
- RBAC enforcement
- Cognito integration

### Phase 4: Contact Management (Tasks 5-6)
- CRUD operations
- Search functionality
- Opt-in management

### Phase 5: Messaging (Tasks 7-10)
- WhatsApp inbound/outbound
- SMS outbound
- Email outbound
- Media handling

### Phase 6: Bulk Operations (Tasks 11-13)
- Job creation and validation
- Worker processing
- Job control (pause/resume/cancel)
- DLQ replay

### Phase 7: AI Integration (Task 14 - Required)
- Knowledge base queries
- Response generation with Nova Pro v1
- Agent core runtime integration
- Approval workflow

### Phase 8: Monitoring (Tasks 15-17)
- CloudWatch metrics
- Alarms and alerts
- TTL implementation
- Environment variable validation

### Phase 9: Frontend (Task 18)
- React UI components
- Contact management interface
- Messaging interface
- Bulk messaging interface

### Phase 10: Testing & Deployment (Tasks 19-20)
- Integration testing
- End-to-end workflows
- Production deployment

---

## 📊 Project Statistics

- **Requirements**: 18 (100+ acceptance criteria)
- **DynamoDB Tables**: 11
- **Lambda Functions**: 16
- **SQS Queues**: 4
- **S3 Buckets**: 2
- **Implementation Tasks**: 20 (80+ sub-tasks)
- **Property-Based Tests**: 80 (optional)
- **Lines of Design Doc**: 2,478
- **Estimated Timeline**: 8-12 weeks (full implementation)

---

## 🎯 Success Criteria

✅ **Compliance**: 100% opt-in validation, zero unauthorized sends  
✅ **Reliability**: <1% error rate, DLQ replay for failures  
✅ **Performance**: Meet all rate limits, <2s response time  
✅ **Security**: RBAC enforced, all actions audited  
✅ **Scalability**: Handle 1000+ contacts, bulk jobs with 1000+ recipients  
✅ **Observability**: Full CloudWatch logging and metrics  

---

## 📞 Contact Channels

- **WhatsApp**: 2 phone numbers (GREEN quality rating)
- **SMS**: Transactional pool (ACTIVE)
- **Email**: Verified sender (DKIM configured)

---

**Project Status**: ✅ Spec Complete, Ready for Implementation  
**Next Step**: Push to GitHub and start Task 1 (Amplify Gen 2 setup)

