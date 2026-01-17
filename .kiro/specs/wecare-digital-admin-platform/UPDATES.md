# Requirements Updates Summary

## Date: 2026-01-17

This document summarizes all updates made to align the requirements with AWS End User Messaging Social API specifications.

---

## New Documents Created

### 1. aws-resources.md
**Purpose**: Comprehensive AWS resources reference document

**Contents**:
- Complete AWS End User Messaging Social API documentation
- All API operations (SendWhatsAppMessage, PostWhatsAppMessageMedia, GetWhatsAppMessageMedia)
- SNS webhook event format and structure
- Rate limits and quotas (1000 RPS API, 80 MPS per phone)
- WhatsApp Business tier limits (250 conversations/24h)
- Integration flow diagrams
- All AWS services configuration (Cognito, S3, SNS, SES, Pinpoint, IAM, Bedrock, Amplify)
- Security and compliance guidelines
- Monitoring and cost optimization strategies

---

## Requirements Document Updates

### Updated Introduction
- Added explicit statement about using AWS End User Messaging Social API
- Added reference link to aws-resources.md for comprehensive AWS details

### Updated Glossary
- Added `AWS_EUM_Social`: AWS End User Messaging Social API for WhatsApp integration
- Added `Customer_Service_Window`: 24-hour period after inbound message
- Added `Template_Message`: Pre-approved WhatsApp message format

### Requirement 4: WhatsApp Inbound Message Processing
**Changes**:
- Updated to parse AWS EUM Social event format with `context` and `whatsAppWebhookEntry`
- Added requirement to decode `whatsAppWebhookEntry` JSON string
- Specified use of `GetWhatsAppMessageMedia` API for media downloads
- Added `destinationS3File` parameter specification
- Changed deduplication to use `whatsappMessageId` instead of generic `messageId`
- Added tracking of 24-hour customer service window via `lastInboundMessageAt`

### Requirement 5: WhatsApp Outbound Message Delivery
**Changes**:
- Specified exact API endpoint: `POST /v1/whatsapp/send`
- Added `SendWhatsAppMessage` API call requirement
- Added media upload flow: S3 → `PostWhatsAppMessageMedia` → get `mediaId`
- Added required parameters: `originationPhoneNumberId`, `metaApiVersion "v20.0"`
- Updated rate limit to 80 messages/second per phone number (from 10)
- Added requirement to track message status updates from SNS webhook
- Added storage of `whatsappMessageId` from API response

### Requirement 13: Rate Limiting and Performance
**Changes**:
- Updated WhatsApp rate limit to 1000 RPS at API level (from 10 MPS)
- Added phone number throughput: 80 MPS per phone number
- Kept tier limits: 250 conversations/24h (Tier 1)
- Added alert at 80% tier capacity

### NEW Requirement 16: WhatsApp 24-Hour Customer Service Window
**Purpose**: Track customer service window for free-form vs template messages

**Key Criteria**:
- Record `lastInboundMessageAt` timestamp on inbound messages
- Calculate 24-hour window from last inbound
- Allow free-form messages within window
- Require templates outside window
- Reject free-form messages outside window with "TEMPLATE_REQUIRED" error
- Display window expiration in UI
- Track template vs free-form usage for cost reporting

### Requirement 16 → 17: DynamoDB TTL Implementation
**No changes** - Renumbered due to new requirement insertion

### Requirement 17 → 18: Amplify Environment Variables and Secrets
**No changes** - Renumbered due to new requirement insertion

### Updated DynamoDB Table Definitions
**Contacts Table**:
- Added: `lastInboundMessageAt` (for 24-hour window tracking)

**Messages Table**:
- Added: `whatsappMessageId` (WhatsApp's message ID from API)
- Added: `mediaId` (WhatsApp media ID for media messages)

**MediaFiles Table**:
- Added: `whatsappMediaId` (WhatsApp's media ID from PostWhatsAppMessageMedia)

### Updated Lambda Environment Variables
**No structural changes** - Already comprehensive in previous version

### Updated Rate Limit Implementation
**Changes**:
- AWS End User Messaging Social API: 1000 requests/second (account level)
- WhatsApp phone number throughput: 80 messages/second per phone number (default)
- Removed old "WhatsApp bucket capacity: 10 tokens" reference

---

## Key Improvements

### 1. AWS EUM Social API Compliance
✅ All WhatsApp operations now use official AWS EUM Social API endpoints  
✅ Correct event format parsing (AWS header + WhatsApp payload)  
✅ Proper media handling (PostWhatsAppMessageMedia, GetWhatsAppMessageMedia)  
✅ Accurate rate limits (1000 RPS API, 80 MPS per phone)

### 2. WhatsApp Business Rules
✅ 24-hour customer service window tracking  
✅ Template message requirement outside window  
✅ Tier limit tracking (250 conversations/24h)  
✅ Free-form message restrictions

### 3. Data Model Enhancements
✅ `lastInboundMessageAt` for window tracking  
✅ `whatsappMessageId` for proper deduplication  
✅ `mediaId` and `whatsappMediaId` for media tracking

### 4. Comprehensive Documentation
✅ aws-resources.md with complete AWS service details  
✅ Integration flow diagrams  
✅ API operation specifications  
✅ Rate limits and quotas table

---

## Compliance Checklist

- [x] All WhatsApp operations use AWS End User Messaging Social API
- [x] SNS webhook event format matches AWS EUM Social specification
- [x] Media operations use PostWhatsAppMessageMedia and GetWhatsAppMessageMedia
- [x] Rate limits match AWS EUM Social quotas (1000 RPS, 80 MPS)
- [x] 24-hour customer service window tracked and enforced
- [x] Template message requirement documented
- [x] WhatsApp Business tier limits tracked (250/24h)
- [x] Phone number IDs use correct format: phone-number-id-{32-char-hex}
- [x] API version specified: v20.0 (metaApiVersion)
- [x] All AWS resources documented in aws-resources.md

---

## Next Steps

1. **Review Requirements**: Verify all acceptance criteria are clear and testable
2. **Proceed to Design**: Create design.md with technical architecture
3. **Reference aws-resources.md**: Use as authoritative source for AWS service details
4. **Implement API Calls**: Follow exact specifications from aws-resources.md
5. **Test Integration**: Validate against AWS EUM Social API in sandbox

---

## Document Maintenance

**Review Frequency**: Quarterly or when AWS EUM Social API updates  
**Owner**: DevOps + Backend Team  
**Last Review**: 2026-01-17  
**Next Review**: 2026-04-17
