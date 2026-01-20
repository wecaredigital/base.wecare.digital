# AWS Social Messaging Documentation Summary

## Overview
This directory contains comprehensive documentation for AWS End User Messaging Social (WhatsApp integration).

## Files

### 1. AWS_SOCIAL_MESSAGING_DOCS.md
**Complete User Guide** - 20 pages covering:
- Service overview and features
- Getting started and setup
- Message types and sending
- Receiving messages and webhooks
- WhatsApp Business Accounts (WABA) management
- Phone number management
- Message templates
- Event destinations and monitoring
- Billing and security
- Quotas and compliance

**Key Topics:**
- Message types: text, media, reactions, templates, locations, contacts, interactive
- Supported media: images (5MB), videos (16MB), audio (16MB), documents (100MB), stickers (500KB)
- 24-hour customer service window for business-initiated messages
- Template-based messaging for anytime communication
- Read receipts and message status tracking
- SNS event destinations for inbound messages

### 2. AWS_SOCIAL_MESSAGING_API_REFERENCE.md
**API Reference Welcome Page** - Entry point to API documentation
- Links to AWS End User Messaging Social API resources
- Regional availability and endpoints
- Integration with AWS services

### 3. api_reference_index.json
**Index of API Reference pages** - JSON structure with:
- URLs
- Page titles
- Outbound links for navigation

## Key Implementation Details

### Media Handling
- **Upload**: Use `post_whatsapp_message_media` to register media with WhatsApp
- **Download**: Use `get_whatsapp_message_media` to retrieve received media to S3
- **Sending**: Include media ID in message payload with optional caption
- **Receiving**: Media comes as inbound events with media ID for download

### Message Status
- **Sent**: Message delivered to WhatsApp
- **Delivered**: Message delivered to recipient's phone
- **Read**: Message read by recipient (two blue checkmarks)
- **Failed**: Message delivery failed

### Phone Number Requirements
- E.164 format: country code + number (e.g., 447447840003)
- Must be verified and active in WABA
- Each phone number has quality rating (GREEN/YELLOW/RED)
- Quality affects message throughput and pacing

### Templates
- Required for business-initiated messages outside 24-hour window
- Must be approved by Meta before use
- Support variables for personalization
- Have quality ratings and rejection reasons

### Event Destinations
- SNS topics receive inbound messages and status updates
- Event payload includes AWS wrapper + WhatsApp JSON
- Supports filtering by message type
- Can integrate with Amazon Connect

## AWS CLI Examples

### Send Text Message
```bash
aws socialmessaging send-whatsapp-message \
  --origination-phone-number-id <PHONE_ID> \
  --message '{"messaging_product":"whatsapp","to":"<RECIPIENT>","type":"text","text":{"body":"Hello"}}'
```

### Upload Media
```bash
aws socialmessaging post-whatsapp-message-media \
  --origination-phone-number-id <PHONE_ID> \
  --source-s3-file bucketName=<BUCKET>,key=<S3_KEY>
```

### Download Media
```bash
aws socialmessaging get-whatsapp-message-media \
  --media-id <MEDIA_ID> \
  --origination-phone-number-id <PHONE_ID> \
  --destination-s3-file bucketName=<BUCKET>,key=<S3_KEY>
```

### Send Read Receipt
```bash
aws socialmessaging send-whatsapp-message \
  --origination-phone-number-id <PHONE_ID> \
  --message '{"messaging_product":"whatsapp","message_id":"<MSG_ID>","status":"read"}'
```

## Regional Endpoints
AWS Social Messaging is available in multiple regions:
- North America (us-east-1, etc.)
- Europe (eu-west-1, etc.)
- Asia Pacific (ap-southeast-1, etc.)
- Oceania (ap-southeast-2, etc.)

## Quotas
- Default WABA quota: 1 per account
- API rate limits: Check regional quotas
- Message throughput: Depends on phone number quality rating
- Template pacing: Meta applies automatic pacing based on engagement

## Security
- Encryption in transit (TLS)
- IAM-based access control
- Service-linked roles for automation
- VPC endpoint support via AWS PrivateLink
- CloudTrail logging for API calls

## Billing
- Charged per message (not per conversation)
- Different rates for business-initiated vs customer-initiated
- Meta volume-tiered pricing (starting Nov 2025)
- Regional pricing variations

## Related Services
- AWS End User Messaging SMS
- AWS End User Messaging Push
- Amazon SES (email)
- Amazon SNS (event delivery)
- AWS Lambda (automation)
- Amazon DynamoDB (message storage)
- Amazon S3 (media storage)

---

**Last Updated:** January 20, 2026
**Documentation Version:** AWS Social Messaging User Guide (Latest)
