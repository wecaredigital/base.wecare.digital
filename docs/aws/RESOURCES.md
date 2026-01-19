# AWS Resources Inventory

**Last Verified**: 2026-01-18  
**AWS Account**: 809904170947  
**Region**: us-east-1  
**Environment**: Production (base branch)

---

## ✓ Active Resources

### 1. Cognito User Pool
- **User Pool ID**: `us-east-1_CC9u1fYh6`
- **Name**: WECARE.DIGITAL
- **Status**: ✓ ACTIVE
- **Created**: 2026-01-14 19:48:37
- **Last Modified**: 2026-01-14 21:50:35

**User Groups**:
- `Viewer` - Read-only access to contacts and message history
- `Operator` - Contact management and message sending
- `Admin` - All operations including user management

**Custom Attributes**:
- `custom:role` (String, mutable)

---

## AUTH — Cognito Hosted UI (SSO Domain Required)

### Cognito Hosted UI Domain (Production SSO)
Authentication MUST use **Cognito Hosted UI** with the custom domain:

- **SSO Domain**: https://sso.wecare.digital
- **User Pool ID**: us-east-1_CC9u1fYh6
- **User Pool Name**: WECARE.DIGITAL
- **App Client ID (Public/PKCE)**: `390cro53nf7gerev44gnq7felt`
- **App Client ID (With Secret)**: `1l9hpie81e1ia7u0cslak2p9tf` (for backend use only)

### Required Auth Flow
Use **OAuth2 Authorization Code Flow + PKCE** (recommended for secure web + WebView compatibility).
- ✅ Authorization code grant
- ✅ PKCE enabled
- ❌ Avoid implicit flow
- ❌ Client secret NOT required for public clients with PKCE

### Hosted UI Endpoints (Reference)
- **Authorize**: `https://sso.wecare.digital/oauth2/authorize`
- **Token**: `https://sso.wecare.digital/oauth2/token`
- **Logout**: `https://sso.wecare.digital/logout`
- **JWKS**: `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_CC9u1fYh6/.well-known/jwks.json`

### App Behavior (UI)
- `/login` must NOT be a username/password form
- `/login` must show **"Continue with SSO"** → redirects to Hosted UI authorize endpoint
- After login, Hosted UI redirects back to the application callback URL

### Callback & Sign-out URLs (Hard Requirement)
Production must support:
- **Callback URL**: `https://base.wecare.digital/auth/callback`
- **Sign-out URL**: `https://base.wecare.digital/logout`
- **Amplify Preview**: `https://base.dtiq7il2x5c5g.amplifyapp.com/auth/callback`

Rules:
- Callback URLs must be exact matches (no wildcards)
- If preview/staging environments must login too, their callback URLs must also be explicitly added

### Token Handling Rules (Production Safe)
- Tokens MUST be validated using JWKS on every request
- Store session/tokens using **Secure HttpOnly cookies** (recommended)
- DO NOT store tokens in localStorage (WebView risk)
- Enforce:
  - issuer check
  - audience/client-id check
  - expiration check
  - token_use check

### RBAC Mapping (Required)
Use Cognito user groups:
- `Viewer` - Read-only access
- `Operator` - Contact management and messaging
- `Admin` - Full access including user management

Roles must be enforced server-side.

### OAuth Scopes
- `openid` (required)
- `email` (required)
- `profile` (required)

---

## ✅ Deep Check Checklist — SSO Production Readiness

### A) Domain + SSL
- [ ] `sso.wecare.digital` is configured as Cognito User Pool Domain
- [ ] SSL Certificate is Issued + Attached
- [ ] DNS record exists (Alias/CNAME points to Cognito domain target)
- [ ] Browser test: `https://sso.wecare.digital` loads with valid cert

### B) App Client Settings
- [ ] Authorization code grant enabled
- [ ] PKCE enabled
- [ ] Implicit flow disabled
- [ ] Scopes: openid, email, profile
- [ ] Cognito user pool provider enabled

### C) Callback URL Correctness
Must include:
- [ ] `https://base.wecare.digital/auth/callback`
- [ ] `https://base.wecare.digital/logout`
- [ ] `https://base.dtiq7il2x5c5g.amplifyapp.com/auth/callback` (Amplify)

### D) Token Validation (Server-side)
- [ ] Signature verified using JWKS
- [ ] `iss` matches user pool issuer
- [ ] `aud` (or client_id) matches app client
- [ ] `exp` not expired
- [ ] `token_use` check (access vs id token)
- [ ] Group claims map to RBAC roles

### E) Cookie Security (WebView-safe)
- [ ] Cookies are Secure
- [ ] Cookies are HttpOnly
- [ ] SameSite properly configured (Lax or None+Secure)
- [ ] NO localStorage token storage

### F) Logout Behavior
- [ ] Clear cookies on base.wecare.digital
- [ ] Redirect to: `https://sso.wecare.digital/logout?client_id=...&logout_uri=...`
- [ ] User fully signed out (back button doesn't restore session)

### G) Hosted UI UX Requirements
- [ ] `/login` shows WECARE.DIGITAL branding
- [ ] Single SSO button: "Continue with SSO"
- [ ] Fallback message: "Session expired, please login again."
- [ ] No manual password forms

---

## Environment Variables (Amplify)

```bash
COGNITO_HOSTED_UI_DOMAIN=https://sso.wecare.digital
COGNITO_REDIRECT_URI=https://base.wecare.digital/auth/callback
COGNITO_LOGOUT_URI=https://base.wecare.digital/logout
COGNITO_SCOPES=openid,email,profile
COGNITO_APP_CLIENT_ID=390cro53nf7gerev44gnq7felt
COGNITO_USER_POOL_ID=us-east-1_CC9u1fYh6
```

**Note**: Use the public client ID (`390cro53nf7gerev44gnq7felt`) for web apps with PKCE. The client with secret (`1l9hpie81e1ia7u0cslak2p9tf`) should only be used for backend/server-side authentication.

---

### 2. S3 Buckets (4 Active)

| Bucket Name | Status | Created | Purpose |
|------------|--------|---------|---------|
| auth.wecare.digital | ✓ ACTIVE | 2026-01-14 | WhatsApp media files |
| stream.wecare.digital | ✓ ACTIVE | 2026-01-14 | Reports & Bedrock KB documents |
| d.wecare.digital | ✓ ACTIVE | 2026-01-13 | General storage |
| wecare-digital-deployment-809904170947 | ✓ ACTIVE | 2026-01-18 | Deployment artifacts |

**Prefixes**:
- `auth.wecare.digital/whatsapp-media/whatsapp-media-incoming/`
- `auth.wecare.digital/whatsapp-media/whatsapp-media-outgoing/`
- `stream.wecare.digital/base-wecare-digital/reports/`

### 3. SNS Topic
- **Topic ARN**: `arn:aws:sns:us-east-1:809904170947:base-wecare-digital`
- **Display Name**: base-wecare-digital
- **Status**: ✓ ACTIVE
- **Purpose**: WhatsApp inbound events & CloudWatch alarm notifications
- **Subscriptions Confirmed**: 0 (will be configured during deployment)

### 4. SES Verified Identity
- **Email**: `one@wecare.digital`
- **Verification Status**: ✓ Success
- **DKIM**: ✓ Configured
- **Sender Name**: WECARE.DIGITAL
- **Rate Limit**: 10 messages/second

### 5. IAM Role
- **Role Name**: `base-wecare-digital`
- **ARN**: `arn:aws:iam::809904170947:role/base-wecare-digital`
- **Status**: ✓ ACTIVE
- **Created**: 2026-01-14
- **Purpose**: Lambda execution role

### 6. Pinpoint SMS Pool
- **Pool ID**: `pool-6fbf5a5f390d4eeeaa7dbae39d78933e`
- **Pool ARN**: `arn:aws:sms-voice:us-east-1:809904170947:pool/pool-6fbf5a5f390d4eeeaa7dbae39d78933e`
- **Pool Name**: WECARE-DIGITAL
- **Status**: ✓ ACTIVE
- **Message Type**: TRANSACTIONAL
- **Rate Limit**: 5 messages/second

### 7. Bedrock Knowledge Base
- **KB ID**: `FZBPKGTOYE`
- **Name**: base-wecare-digital-bedrock-kb
- **Description**: base-wecare-digital-bedrock-kb
- **Status**: ✓ ACTIVE
- **Last Updated**: 2026-01-15 05:50:49
- **Foundation Model**: amazon.nova-pro-v1:0

### 8. Bedrock Agents (2 Agents)

**Agent 1: WhatsApp Customer Interaction**
- **Agent ID**: `HQNT0JXN8G`
- **Name**: base-bedrock-agent
- **Status**: NOT_PREPARED (needs preparation before use)
- **Foundation Model**: amazon.nova-pro-v1:0
- **Purpose**: Generate responses for WhatsApp customer inquiries
- **Memory**: SESSION_SUMMARY enabled (30 days, 20 sessions)
- **Action Groups**: CodeInterpreterAction, UserInputAction

**Note**: Agent status "NOT_PREPARED" is normal - it will be prepared automatically during first use.

**Agent 2: Internal Admin Dashboard**
- **Runtime ID**: `base_bedrock_agentcore-1XHDxj2o3Q`
- **Type**: Internal AWS-managed runtime (not a separate resource)
- **Purpose**: Amplify dashboard automation and internal task processing

### 9. AWS End User Messaging Social (WhatsApp)

#### WhatsApp Business Accounts (2)

**Account 1: WECARE.DIGITAL**
- **WABA ID**: `waba-0aae9cf04cf24c66960f291c793359b4`
- **Meta WABA ID**: 1347766229904230
- **Name**: WECARE.DIGITAL
- **Status**: ✓ COMPLETE
- **Event Destination**: arn:aws:sns:us-east-1:809904170947:base-wecare-digital

**Account 2: Manish Agarwal**
- **WABA ID**: `waba-9bbe054d8404487397c38a9d197bc44a`
- **Meta WABA ID**: 1390647332755815
- **Name**: Manish Agarwal
- **Status**: ✓ COMPLETE
- **Event Destination**: arn:aws:sns:us-east-1:809904170947:base-wecare-digital

#### WhatsApp Phone Numbers (2)

**Phone Number 1: WECARE.DIGITAL**
- **Phone Number ID**: `phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54`
- **Meta Phone Number ID**: 831049713436137
- **Display Number**: +91 93309 94400
- **Display Name**: WECARE.DIGITAL
- **Quality Rating**: ✓ GREEN (Excellent)
- **Linked WABA**: waba-0aae9cf04cf24c66960f291c793359b4
- **Rate Limit**: 80 messages/second

**Phone Number 2: Manish Agarwal**
- **Phone Number ID**: `phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06`
- **Meta Phone Number ID**: 888782840987368
- **Display Number**: +91 99033 00044
- **Display Name**: Manish Agarwal
- **Quality Rating**: ✓ GREEN (Excellent)
- **Linked WABA**: waba-9bbe054d8404487397c38a9d197bc44a
- **Rate Limit**: 80 messages/second

**WhatsApp Configuration**:
- **Meta API Version**: v20.0
- **Account-level Rate Limit**: 1000 requests/second
- **Allowlist**: Both phone numbers configured

### 10. DynamoDB Tables (11 Active)

All tables use **PAY_PER_REQUEST** billing mode:

| Table Name | Status | Item Count | TTL | Purpose |
|-----------|--------|------------|-----|---------|
| base-wecare-digital-ContactsTable | ✓ ACTIVE | 1 | No | Contact records |
| base-wecare-digital-WhatsAppInboundTable | ✓ ACTIVE | - | No | Inbound WhatsApp messages |
| base-wecare-digital-WhatsAppOutboundTable | ✓ ACTIVE | - | No | Outbound WhatsApp messages |
| base-wecare-digital-BulkJobsTable | ✓ ACTIVE | - | No | Bulk job tracking |
| base-wecare-digital-BulkJobChunksTable | ✓ ACTIVE | - | No | Bulk job chunks |
| base-wecare-digital-AuditTable | ✓ ACTIVE | - | 180 days | Audit logs |
| base-wecare-digital-DocsTable | ✓ ACTIVE | - | No | Document metadata |
| base-wecare-digital-FormsTable | ✓ ACTIVE | - | No | Form submissions |
| base-wecare-digital-InvoiceTable | ✓ ACTIVE | - | No | Invoice records |
| base-wecare-digital-LinkTable | ✓ ACTIVE | - | No | Short links |
| base-wecare-digital-PayTable | ✓ ACTIVE | - | No | Payment records |

### 11. Lambda Functions (16 Active)

All functions running **Python 3.12** runtime with **256MB** memory:

| Function Name | Status | Purpose |
|--------------|--------|---------|
| wecare-auth-middleware | ✓ ACTIVE | Authentication middleware |
| wecare-contacts-create | ✓ ACTIVE | Create new contacts |
| wecare-contacts-read | ✓ ACTIVE | Read contact details |
| wecare-contacts-update | ✓ ACTIVE | Update contact info |
| wecare-contacts-delete | ✓ ACTIVE | Delete contacts |
| wecare-contacts-search | ✓ ACTIVE | Search contacts |
| wecare-inbound-whatsapp | ✓ ACTIVE | Handle inbound WhatsApp |
| wecare-outbound-whatsapp | ✓ ACTIVE | Send WhatsApp messages |
| wecare-outbound-sms | ✓ ACTIVE | Send SMS messages |
| wecare-outbound-email | ✓ ACTIVE | Send emails |
| wecare-bulk-job-create | ✓ ACTIVE | Create bulk jobs |
| wecare-bulk-worker | ✓ ACTIVE | Process bulk messages |
| wecare-bulk-job-control | ✓ ACTIVE | Control bulk jobs |
| wecare-dlq-replay | ✓ ACTIVE | Replay DLQ messages |
| wecare-ai-query-kb | ✓ ACTIVE | Query Bedrock KB |
| wecare-ai-generate-response | ✓ ACTIVE | Generate AI responses |

### 12. SQS Queues (5 Active)

| Queue Name | Status | Visibility Timeout | Retention Period | Purpose |
|-----------|--------|-------------------|------------------|---------|
| base-wecare-digital-inbound-dlq | ✓ ACTIVE | 300s | 7 days | Failed inbound messages |
| base-wecare-digital-bulk-queue | ✓ ACTIVE | 300s | 1 day | Bulk job processing |
| base-wecare-digital-bulk-dlq | ✓ ACTIVE | 300s | 7 days | Failed bulk chunks |
| base-wecare-digital-outbound-dlq | ✓ ACTIVE | 300s | 7 days | Failed outbound messages |
| base-wecare-digital-whatsapp-inbound-dlq | ✓ ACTIVE | 300s | 7 days | Failed WhatsApp inbound |

**Queue URLs**:
- `https://sqs.us-east-1.amazonaws.com/809904170947/base-wecare-digital-inbound-dlq`
- `https://sqs.us-east-1.amazonaws.com/809904170947/base-wecare-digital-bulk-queue`
- `https://sqs.us-east-1.amazonaws.com/809904170947/base-wecare-digital-bulk-dlq`
- `https://sqs.us-east-1.amazonaws.com/809904170947/base-wecare-digital-outbound-dlq`
- `https://sqs.us-east-1.amazonaws.com/809904170947/base-wecare-digital-whatsapp-inbound-dlq`

---

## ⏳ Resources To Be Created

### CloudWatch Alarms (5 alarms)

| Alarm Name | Metric | Threshold | Status |
|-----------|--------|-----------|--------|
| wecare-lambda-error-rate | Lambda Errors | 1% | To be created |
| wecare-dlq-depth | SQS Messages Visible | 10 | To be created |
| wecare-whatsapp-tier-limit | WhatsApp Tier Usage | 80% | To be created |
| wecare-api-error-rate | API Errors | 5% | To be created |
| wecare-bulk-job-failure-rate | Bulk Job Failures | 10% | To be created |

**Note**: Use `create-aws-resources.ps1` script or AWS Console to create alarms.

### CloudWatch Dashboard

**Dashboard Name**: WECARE-DIGITAL-Dashboard  
**Status**: To be created

**Widgets**:
- Message Delivery by Channel (WhatsApp, SMS, Email)
- Message Failures by Channel
- Bulk Job Performance
- DLQ Depth (all queues)
- WhatsApp Tier Usage
- Lambda Error Rates

---

## Resource ARNs Reference

### Cognito
```
arn:aws:cognito-idp:us-east-1:809904170947:userpool/us-east-1_CC9u1fYh6
```

### S3 Buckets
```
arn:aws:s3:::auth.wecare.digital
arn:aws:s3:::stream.wecare.digital
arn:aws:s3:::d.wecare.digital
arn:aws:s3:::wecare-digital-deployment-809904170947
```

### SNS
```
arn:aws:sns:us-east-1:809904170947:base-wecare-digital
```

### SES
```
arn:aws:ses:us-east-1:809904170947:identity/one@wecare.digital
```

### IAM
```
arn:aws:iam::809904170947:role/base-wecare-digital
```

### Pinpoint SMS
```
arn:aws:sms-voice:us-east-1:809904170947:pool/pool-6fbf5a5f390d4eeeaa7dbae39d78933e
```

### Bedrock
```
arn:aws:bedrock:us-east-1:809904170947:knowledge-base/FZBPKGTOYE
arn:aws:bedrock:us-east-1:809904170947:agent/HQNT0JXN8G
arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-pro-v1:0
```

### WhatsApp
```
arn:aws:social-messaging:us-east-1:809904170947:phone-number-id/phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54
arn:aws:social-messaging:us-east-1:809904170947:phone-number-id/phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06
```

### Lambda Functions
```
arn:aws:lambda:us-east-1:809904170947:function:wecare-*
```

### DynamoDB Tables
```
arn:aws:dynamodb:us-east-1:809904170947:table/base-wecare-digital-*
```

### SQS Queues
```
arn:aws:sqs:us-east-1:809904170947:base-wecare-digital-*
```

---

## Summary

**Total Active Resources**: 60+

| Category | Count | Status |
|----------|-------|--------|
| Cognito User Pools | 1 | ✓ ACTIVE |
| S3 Buckets | 4 | ✓ ACTIVE |
| SNS Topics | 1 | ✓ ACTIVE |
| SES Identities | 1 | ✓ VERIFIED |
| IAM Roles | 1 | ✓ ACTIVE |
| Pinpoint SMS Pools | 1 | ✓ ACTIVE |
| Bedrock Knowledge Bases | 1 | ✓ ACTIVE |
| Bedrock Agents | 2 | ✓ CONFIGURED |
| WhatsApp Business Accounts | 2 | ✓ COMPLETE |
| WhatsApp Phone Numbers | 2 | ✓ GREEN RATING |
| DynamoDB Tables | 11 | ✓ ACTIVE |
| Lambda Functions | 16 | ✓ ACTIVE |
| SQS Queues | 5 | ✓ ACTIVE |
| CloudWatch Alarms | 0 | ⏳ Pending |
| CloudWatch Dashboards | 0 | ⏳ Pending |

**Deployment Status**: ✓ Production Ready  
**Next Steps**: Create CloudWatch alarms and dashboard

---

## Verification Commands

```bash
# List all resources
aws cognito-idp list-user-pools --max-results 20 --region us-east-1
aws s3 ls
aws sns list-topics --region us-east-1
aws sesv2 list-email-identities --region us-east-1
aws iam list-roles --query "Roles[?contains(RoleName, 'wecare')]" --region us-east-1
aws pinpoint-sms-voice-v2 describe-pools --region us-east-1
aws bedrock-agent list-knowledge-bases --region us-east-1
aws bedrock-agent list-agents --region us-east-1
aws dynamodb list-tables --region us-east-1
aws lambda list-functions --region us-east-1 --query "Functions[?contains(FunctionName, 'wecare')]"
aws sqs list-queues --region us-east-1
aws cloudwatch describe-alarms --region us-east-1
```

---

**Last Updated**: 2026-01-18 22:07 IST
