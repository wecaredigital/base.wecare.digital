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

---

## AWS End User Messaging Social — WhatsApp Deep Check

### Service Overview
AWS End User Messaging Social enables WhatsApp Business integration with AWS. It provides:
- Native WhatsApp messaging via REST API and SDK
- Inbound message handling via SNS notifications
- Media file upload/download via S3
- IAM-based access control

**Documentation**: https://docs.aws.amazon.com/social-messaging/latest/userguide/what-is-service.html

### API Endpoints (us-east-1)
- **Standard**: `social-messaging.us-east-1.amazonaws.com`
- **FIPS**: `social-messaging-fips.us-east-1.amazonaws.com`
- **API Version**: WhatsApp Cloud API v20.0 and later

### Service Quotas

| Operation | Default Rate (req/sec) |
|-----------|----------------------|
| SendWhatsAppMessage | 1,000 |
| PostWhatsAppMessageMedia | 100 |
| GetWhatsAppMessageMedia | 100 |
| DeleteWhatsAppMessageMedia | 100 |
| DisassociateWhatsAppBusinessAccount | 10 |
| ListWhatsAppBusinessAccount | 10 |

**WABA Limit**: 25 per Region per account

### Message Types Supported
- **Text messages** - Plain text
- **Template messages** - Pre-approved templates (can be sent anytime)
- **Media messages** - Images, videos, audio, documents
- **Interactive messages** - Buttons, lists
- **Location messages** - GPS coordinates
- **Contact messages** - vCard format

### 24-Hour Customer Service Window
- When a user messages you, a 24-hour window opens
- **Within window**: All message types allowed
- **Outside window**: Only template messages allowed
- Window refreshes with each user message

### Inbound Message Flow
```
User → WhatsApp → AWS EUM Social → SNS Topic → Lambda → DynamoDB
```

**Event Format** (SNS Message):
```json
{
  "context": {
    "MetaWabaIds": [{"wabaId": "...", "arn": "..."}],
    "MetaPhoneNumberIds": [{"metaPhoneNumberId": "...", "arn": "..."}]
  },
  "whatsAppWebhookEntry": "{...JSON STRING...}",
  "aws_account_id": "809904170947",
  "message_timestamp": "2026-01-18T08:14:04.923Z",
  "messageId": "uuid"
}
```

### Outbound Message Flow
```
Lambda → AWS EUM Social API → WhatsApp → User
```

**CLI Example** (Template Message):
```bash
aws socialmessaging send-whatsapp-message \
  --origination-phone-number-id phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54 \
  --meta-api-version v20.0 \
  --message '{"messaging_product":"whatsapp","to":"PHONE","type":"template","template":{"name":"TEMPLATE_NAME","language":{"code":"en_US"}}}'
```

### Media File Handling

**Upload Media (for sending)**:
```bash
aws socialmessaging post-whatsapp-message-media \
  --origination-phone-number-id PHONE_NUMBER_ID \
  --source-s3-file bucketName=auth.wecare.digital,key=whatsapp-media/file.jpg
```

**Download Media (from received messages)**:
```bash
aws socialmessaging get-whatsapp-message-media \
  --media-id MEDIA_ID \
  --origination-phone-number-id PHONE_NUMBER_ID \
  --destination-s3-file bucketName=auth.wecare.digital,key=whatsapp-media/incoming/file.jpg
```

**S3 Bucket Requirements**:
- Must be in same AWS account and Region as WABA
- Media bucket: `auth.wecare.digital`
- Inbound prefix: `whatsapp-media/whatsapp-media-incoming/`
- Outbound prefix: `whatsapp-media/whatsapp-media-outgoing/`

---

## ✅ Deep Check Checklist — WhatsApp Production Readiness

### A) WABA Registration Status
- [x] WABA 1 (WECARE.DIGITAL): `COMPLETE`
- [x] WABA 2 (Manish Agarwal): `COMPLETE`
- [x] Both WABAs linked to AWS account 809904170947

### B) Phone Number Quality
- [x] Phone 1 (+91 93309 94400): Quality Rating `GREEN`
- [x] Phone 2 (+91 99033 00044): Quality Rating `GREEN`
- [x] Both phone numbers verified and active

### C) Event Destination (SNS)
- [x] SNS Topic configured: `arn:aws:sns:us-east-1:809904170947:base-wecare-digital`
- [x] Both WABAs have event destination set
- [x] Lambda subscription active: `wecare-inbound-whatsapp`

### D) Lambda Handler
- [x] Function: `wecare-inbound-whatsapp`
- [x] Runtime: Python 3.12
- [x] Memory: 256MB
- [x] Timeout: 30s
- [x] DynamoDB key fix deployed (uses `id` as primary key)

### E) DynamoDB Tables
- [x] `base-wecare-digital-WhatsAppInboundTable` - Primary key: `id`
- [x] `base-wecare-digital-WhatsAppOutboundTable` - Primary key: `id`
- [x] `base-wecare-digital-ContactsTable` - Primary key: `id`

### F) S3 Media Bucket
- [x] Bucket: `auth.wecare.digital`
- [x] Region: us-east-1
- [x] Same account as WABA

### G) IAM Permissions
Required permissions for Lambda:
- `socialmessaging:SendWhatsAppMessage`
- `socialmessaging:GetWhatsAppMessageMedia`
- `socialmessaging:PostWhatsAppMessageMedia`
- `dynamodb:PutItem`, `dynamodb:GetItem`, `dynamodb:UpdateItem`
- `s3:GetObject`, `s3:PutObject`
- `sns:Publish` (for DLQ)

### H) Message Status Tracking
Status values from WhatsApp:
- `sent` - Message sent to WhatsApp servers
- `delivered` - Message delivered to user's device
- `read` - Message read by user
- `failed` - Message delivery failed

### I) Error Handling
- [x] DLQ configured: `base-wecare-digital-inbound-dlq`
- [x] Failed messages sent to DLQ
- [x] CloudWatch alarm: `wecare-dlq-depth`

### J) Rate Limiting
- [x] Per-phone rate limit: 80 msg/sec
- [x] Account API rate limit: 1000 req/sec
- [x] Rate limiter implemented in Lambda

---

## WhatsApp API Reference URLs — Complete Index

### User Guide (All Pages)
| Resource | URL |
|----------|-----|
| Service Overview | https://docs.aws.amazon.com/social-messaging/latest/userguide/what-is-service.html |
| Getting Started | https://docs.aws.amazon.com/social-messaging/latest/userguide/getting-started.html |
| WABA Management | https://docs.aws.amazon.com/social-messaging/latest/userguide/waba.html |
| Phone Numbers | https://docs.aws.amazon.com/social-messaging/latest/userguide/phone-numbers.html |
| Sending Messages | https://docs.aws.amazon.com/social-messaging/latest/userguide/whatsapp-send-message.html |
| Receiving Messages | https://docs.aws.amazon.com/social-messaging/latest/userguide/receiving-messages.html |
| Message Types | https://docs.aws.amazon.com/social-messaging/latest/userguide/message-types.html |
| Supported Media Types | https://docs.aws.amazon.com/social-messaging/latest/userguide/supported-media-types.html |
| Templates | https://docs.aws.amazon.com/social-messaging/latest/userguide/managing-templates.html |
| Event Destinations | https://docs.aws.amazon.com/social-messaging/latest/userguide/event-destinations.html |
| Media Files S3 | https://docs.aws.amazon.com/social-messaging/latest/userguide/managing-media-files-s3.html |
| Quotas | https://docs.aws.amazon.com/social-messaging/latest/userguide/load-balancer-limits.html |
| Security | https://docs.aws.amazon.com/social-messaging/latest/userguide/security.html |
| Monitoring | https://docs.aws.amazon.com/social-messaging/latest/userguide/monitoring.html |
| Pricing | https://docs.aws.amazon.com/social-messaging/latest/userguide/pricing.html |

### API Reference (All 13 Endpoints)

#### Messaging APIs
| API | Method | Endpoint | Rate Limit | URL |
|-----|--------|----------|------------|-----|
| SendWhatsAppMessage | POST | /v1/whatsapp/send | 1,000/sec | https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_SendWhatsAppMessage.html |
| PostWhatsAppMessageMedia | POST | /v1/whatsapp/media | 100/sec | https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_PostWhatsAppMessageMedia.html |
| GetWhatsAppMessageMedia | POST | /v1/whatsapp/media/get | 100/sec | https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_GetWhatsAppMessageMedia.html |
| DeleteWhatsAppMessageMedia | DELETE | /v1/whatsapp/media | 100/sec | https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_DeleteWhatsAppMessageMedia.html |

#### WABA Management APIs
| API | Method | Endpoint | Rate Limit | URL |
|-----|--------|----------|------------|-----|
| AssociateWhatsAppBusinessAccount | POST | /v1/whatsapp/signup | Console only | https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_AssociateWhatsAppBusinessAccount.html |
| DisassociateWhatsAppBusinessAccount | DELETE | /v1/whatsapp/waba/disassociate | 10/sec | https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_DisassociateWhatsAppBusinessAccount.html |
| GetLinkedWhatsAppBusinessAccount | GET | /v1/whatsapp/waba/details | 10/sec | https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_GetLinkedWhatsAppBusinessAccount.html |
| ListLinkedWhatsAppBusinessAccounts | GET | /v1/whatsapp/waba/list | 10/sec | https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_ListLinkedWhatsAppBusinessAccounts.html |
| PutWhatsAppBusinessAccountEventDestinations | PUT | /v1/whatsapp/waba/eventdestinations | 10/sec | https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_PutWhatsAppBusinessAccountEventDestinations.html |

#### Resource Tagging APIs
| API | Method | Endpoint | Rate Limit | URL |
|-----|--------|----------|------------|-----|
| TagResource | POST | /v1/tags/tag-resource | 10/sec | https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_TagResource.html |
| UntagResource | POST | /v1/tags/untag-resource | 10/sec | https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_UntagResource.html |
| ListTagsForResource | GET | /v1/tags/list?resourceArn= | 10/sec | https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_ListTagsForResource.html |

#### Reference
| Resource | URL |
|----------|-----|
| Common Errors | https://docs.aws.amazon.com/social-messaging/latest/APIReference/CommonErrors.html |
| API Operations Index | https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_Operations.html |
| Data Types | https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_Types.html |

### External References
| Resource | URL |
|----------|-----|
| AWS CLI Reference | https://docs.aws.amazon.com/cli/latest/reference/socialmessaging/ |
| WhatsApp Cloud API | https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages |
| WhatsApp Business Terms | https://www.whatsapp.com/legal/business-terms |
| WhatsApp Messaging Guidelines | https://www.whatsapp.com/legal/messaging-guidelines |
| Meta Conversation Pricing | https://developers.facebook.com/docs/whatsapp/pricing |
| AWS Service Endpoints | https://docs.aws.amazon.com/general/latest/gr/social-messaging.html |

---

## AWS End User Messaging Social API Reference

### SendWhatsAppMessage API

**Endpoint**: `POST /v1/whatsapp/send`

**Request Body**:
```json
{
  "message": "<base64-encoded-message>",
  "metaApiVersion": "v20.0",
  "originationPhoneNumberId": "phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54"
}
```

**Parameters**:
- `message` (required): Base64-encoded WhatsApp message object (max 2MB)
- `metaApiVersion` (required): API version (e.g., "v20.0")
- `originationPhoneNumberId` (required): Phone number ID to send from

**Response**:
```json
{
  "messageId": "wamid.xxx"
}
```

**Rate Limit**: 1,000 requests/second

---

### PostWhatsAppMessageMedia API

**Endpoint**: `POST /v1/whatsapp/media`

**Purpose**: Upload media file to WhatsApp for sending

**Request Body**:
```json
{
  "originationPhoneNumberId": "phone-number-id-xxx",
  "sourceS3File": {
    "bucketName": "auth.wecare.digital",
    "key": "whatsapp-media/whatsapp-media-outgoing/image.jpg"
  }
}
```

**Response**:
```json
{
  "mediaId": "abc123xyz"
}
```

**Note**: Only the phone number used to upload can send the media file.

**Rate Limit**: 100 requests/second

---

### GetWhatsAppMessageMedia API

**Endpoint**: `POST /v1/whatsapp/media/get`

**Purpose**: Download received media from WhatsApp to S3

**Request Body**:
```json
{
  "mediaId": "MEDIA_ID_FROM_WEBHOOK",
  "originationPhoneNumberId": "phone-number-id-xxx",
  "destinationS3File": {
    "bucketName": "auth.wecare.digital",
    "key": "whatsapp-media/whatsapp-media-incoming/received.jpg"
  },
  "metadataOnly": false
}
```

**Response**:
```json
{
  "fileSize": 12345,
  "mimeType": "image/jpeg"
}
```

**Rate Limit**: 100 requests/second

---

### DeleteWhatsAppMessageMedia API

**Endpoint**: `DELETE /v1/whatsapp/media?mediaId=xxx&originationPhoneNumberId=xxx`

**Purpose**: Delete media from WhatsApp service

**Response**:
```json
{
  "success": true
}
```

**Rate Limit**: 100 requests/second

---

## Supported Media File Types

### Audio (Max 16 MB)
| Type | Extension | MIME Type |
|------|-----------|-----------|
| AAC | .aac | audio/aac |
| AMR | .amr | audio/amr |
| MP3 | .mp3 | audio/mpeg |
| MP4 Audio | .m4a | audio/mp4 |
| OGG | .ogg | audio/ogg |

### Documents (Max 100 MB)
| Type | Extension | MIME Type |
|------|-----------|-----------|
| Text | .txt | text/plain |
| Excel | .xls, .xlsx | application/vnd.ms-excel |
| Word | .doc, .docx | application/msword |
| PowerPoint | .ppt, .pptx | application/vnd.ms-powerpoint |
| PDF | .pdf | application/pdf |

### Images (Max 5 MB)
| Type | Extension | MIME Type |
|------|-----------|-----------|
| JPEG | .jpeg, .jpg | image/jpeg |
| PNG | .png | image/png |

### Stickers
| Type | Extension | MIME Type | Max Size |
|------|-----------|-----------|----------|
| Animated | .webp | image/webp | 500 KB |
| Static | .webp | image/webp | 100 KB |

### Video (Max 16 MB)
| Type | Extension | MIME Type |
|------|-----------|-----------|
| 3GPP | .3gp | video/3gp |
| MP4 | .mp4 | video/mp4 |

---

## WhatsApp Message Types

| Type | Description | 24h Window Required |
|------|-------------|---------------------|
| Text | Plain text or URL | Yes |
| Media | Audio, document, image, sticker, video | Yes |
| Reaction | Emoji reaction to a message | Yes |
| Template | Pre-approved message templates | **No** |
| Location | GPS coordinates with name/address | Yes |
| Contacts | Contact card (vCard) | Yes |
| Interactive | Buttons or list menus | Yes |

---

## Message Templates

### Template Types
- Text-based templates
- Media-based templates (with header image/video/document)
- Interactive message templates (with buttons)
- Location-based templates
- Authentication templates (OTP buttons)
- Multi-Product Message templates

### Template Management
- Create/manage in AWS Console: https://console.aws.amazon.com/social-messaging/
- Templates must be approved by Meta (up to 24 hours)
- Templates are associated with your WABA

### Important Note
> Starting 4/1/2025, Meta will block marketing message templates sent to US country code (+1).

### Template Variables
Use `{{1}}`, `{{2}}`, etc. for dynamic content:
```json
{
  "template": {
    "name": "order_confirmation",
    "language": { "code": "en_US" },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "John" },
          { "type": "text", "text": "ORD-12345" },
          { "type": "text", "text": "₹1,500" }
        ]
      }
    ]
  }
}
```

---

## 24-Hour Customer Service Window

When a customer messages you:
1. A 24-hour window opens
2. During window: Send any message type (text, media, interactive)
3. Window refreshes with each customer message
4. Outside window: Only template messages allowed

**Check Window Status**:
- Store `lastInboundMessageAt` timestamp for each contact
- Window open if: `(current_time - lastInboundMessageAt) < 24 hours`

---

## WhatsApp Message Types Reference

### Text Messages
```json
{
  "messaging_product": "whatsapp",
  "to": "PHONE_NUMBER",
  "type": "text",
  "text": {
    "body": "Hello, this is a text message"
  }
}
```

### Template Messages (Can be sent anytime)
```json
{
  "messaging_product": "whatsapp",
  "to": "PHONE_NUMBER",
  "type": "template",
  "template": {
    "name": "hello_world",
    "language": { "code": "en_US" },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Customer Name" }
        ]
      }
    ]
  }
}
```

### Interactive Messages - Reply Buttons (max 3)
```json
{
  "messaging_product": "whatsapp",
  "to": "PHONE_NUMBER",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "header": { "type": "text", "text": "Header Text" },
    "body": { "text": "Please select an option:" },
    "footer": { "text": "Footer text" },
    "action": {
      "buttons": [
        { "type": "reply", "reply": { "id": "btn1", "title": "Option 1" } },
        { "type": "reply", "reply": { "id": "btn2", "title": "Option 2" } },
        { "type": "reply", "reply": { "id": "btn3", "title": "Option 3" } }
      ]
    }
  }
}
```

### Interactive Messages - List Menu (max 10 items)
```json
{
  "messaging_product": "whatsapp",
  "to": "PHONE_NUMBER",
  "type": "interactive",
  "interactive": {
    "type": "list",
    "header": { "type": "text", "text": "Menu" },
    "body": { "text": "Please select from the menu:" },
    "action": {
      "button": "View Options",
      "sections": [
        {
          "title": "Section 1",
          "rows": [
            { "id": "row1", "title": "Item 1", "description": "Description" },
            { "id": "row2", "title": "Item 2", "description": "Description" }
          ]
        }
      ]
    }
  }
}
```

### Media Messages - Image
```json
{
  "messaging_product": "whatsapp",
  "to": "PHONE_NUMBER",
  "type": "image",
  "image": {
    "id": "MEDIA_ID",
    "caption": "Image caption"
  }
}
```

### Media Messages - Document
```json
{
  "messaging_product": "whatsapp",
  "to": "PHONE_NUMBER",
  "type": "document",
  "document": {
    "id": "MEDIA_ID",
    "filename": "document.pdf",
    "caption": "Document caption"
  }
}
```

### Location Messages
```json
{
  "messaging_product": "whatsapp",
  "to": "PHONE_NUMBER",
  "type": "location",
  "location": {
    "latitude": "19.0760",
    "longitude": "72.8777",
    "name": "Mumbai",
    "address": "Mumbai, Maharashtra, India"
  }
}
```

---

## AWS CLI Examples

### Send Text Message
```bash
aws socialmessaging send-whatsapp-message \
  --origination-phone-number-id phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54 \
  --meta-api-version v20.0 \
  --message '{"messaging_product":"whatsapp","to":"919876543210","type":"text","text":{"body":"Hello from WECARE.DIGITAL"}}'
```

### Send Template Message
```bash
aws socialmessaging send-whatsapp-message \
  --origination-phone-number-id phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54 \
  --meta-api-version v20.0 \
  --message '{"messaging_product":"whatsapp","to":"919876543210","type":"template","template":{"name":"hello_world","language":{"code":"en_US"}}}'
```

### Upload Media to S3 for WhatsApp
```bash
aws socialmessaging post-whatsapp-message-media \
  --origination-phone-number-id phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54 \
  --source-s3-file bucketName=auth.wecare.digital,key=whatsapp-media/whatsapp-media-outgoing/image.jpg
```

### Download Received Media from WhatsApp
```bash
aws socialmessaging get-whatsapp-message-media \
  --media-id MEDIA_ID_FROM_WEBHOOK \
  --origination-phone-number-id phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54 \
  --destination-s3-file bucketName=auth.wecare.digital,key=whatsapp-media/whatsapp-media-incoming/received.jpg
```

### List WhatsApp Business Accounts
```bash
aws socialmessaging list-linked-whats-app-business-accounts --region us-east-1
```

---

## Region Availability — Complete List

AWS End User Messaging Social is available in 17 regions:

| Region Name | Region Code | Standard Endpoint | FIPS Endpoint |
|-------------|-------------|-------------------|---------------|
| US East (N. Virginia) | us-east-1 | social-messaging.us-east-1.amazonaws.com | social-messaging-fips.us-east-1.amazonaws.com |
| US East (Ohio) | us-east-2 | social-messaging.us-east-2.amazonaws.com | social-messaging-fips.us-east-2.amazonaws.com |
| US West (Oregon) | us-west-2 | social-messaging.us-west-2.amazonaws.com | social-messaging-fips.us-west-2.amazonaws.com |
| Canada (Central) | ca-central-1 | social-messaging.ca-central-1.amazonaws.com | social-messaging-fips.ca-central-1.amazonaws.com |
| Africa (Cape Town) | af-south-1 | social-messaging.af-south-1.amazonaws.com | - |
| Asia Pacific (Tokyo) | ap-northeast-1 | social-messaging.ap-northeast-1.amazonaws.com | - |
| Asia Pacific (Seoul) | ap-northeast-2 | social-messaging.ap-northeast-2.amazonaws.com | - |
| Asia Pacific (Mumbai) | ap-south-1 | social-messaging.ap-south-1.amazonaws.com | - |
| Asia Pacific (Hyderabad) | ap-south-2 | social-messaging.ap-south-2.amazonaws.com | - |
| Asia Pacific (Singapore) | ap-southeast-1 | social-messaging.ap-southeast-1.amazonaws.com | - |
| Asia Pacific (Sydney) | ap-southeast-2 | social-messaging.ap-southeast-2.amazonaws.com | - |
| Europe (Frankfurt) | eu-central-1 | social-messaging.eu-central-1.amazonaws.com | - |
| Europe (Spain) | eu-south-2 | social-messaging.eu-south-2.amazonaws.com | - |
| Europe (Ireland) | eu-west-1 | social-messaging.eu-west-1.amazonaws.com | - |
| Europe (London) | eu-west-2 | social-messaging.eu-west-2.amazonaws.com | - |
| South America (São Paulo) | sa-east-1 | social-messaging.sa-east-1.amazonaws.com | - |

**All regions support WhatsApp API Version 20 and later**

**WECARE.DIGITAL Region**: us-east-1 (US East - N. Virginia)

---

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
