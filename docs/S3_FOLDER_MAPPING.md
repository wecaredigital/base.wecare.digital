# S3 Bucket and Folder Mapping

## Overview

The WECARE.DIGITAL platform uses **2 S3 buckets** for different purposes:

| Bucket | Purpose | Status |
|--------|---------|--------|
| `auth.wecare.digital` | WhatsApp media files (images, videos, audio, documents) | ✅ ACTIVE |
| `stream.wecare.digital` | Reports, Bedrock KB documents | ✅ ACTIVE |

---

## Bucket 1: `auth.wecare.digital` (WhatsApp Media)

**Purpose**: Stores all WhatsApp media files for inbound and outbound messages.

### Current Contents (as of 2026-01-22):
```
auth.wecare.digital/
├── download/                           # Empty placeholder
├── upload/                             # Empty placeholder
├── error.html                          # Error page
└── whatsapp-media/
    ├── whatsapp-media-incoming/        # 15 media files (inbound from customers)
    │   └── {uuid}.jpg{whatsapp-media-id}.jpeg
    └── whatsapp-media-outgoing/        # Multiple media files (outbound to customers)
        └── {uuid}.{ext}
```

### File Naming Convention:
- **Inbound files**: AWS EUM Social API appends WhatsApp media ID to filename
  - Stored in DB: `whatsapp-media/whatsapp-media-incoming/{uuid}.jpg`
  - Actual S3 key: `whatsapp-media/whatsapp-media-incoming/{uuid}.jpg{whatsapp-media-id}.jpeg`
- **Outbound files**: Standard naming with UUID
  - S3 key: `whatsapp-media/whatsapp-media-outgoing/{uuid}.{ext}`

### Lambda Functions Using This Bucket:

| Function | Environment Variable | Operation |
|----------|---------------------|-----------|
| `wecare-inbound-whatsapp` | `MEDIA_BUCKET=auth.wecare.digital` | Download inbound media |
| `wecare-outbound-whatsapp` | `MEDIA_BUCKET=auth.wecare.digital` | Upload outbound media |
| `wecare-messages-read` | `MEDIA_BUCKET=auth.wecare.digital` | Generate pre-signed URLs |

---

## Bucket 2: `stream.wecare.digital` (Reports & AI)

**Purpose**: Stores generated reports and Bedrock Knowledge Base documents.

### Current Contents (as of 2026-01-22):
```
stream.wecare.digital/
├── error.html                          # Error page
└── base-wecare-digital/
    └── reports/                        # Generated reports
        └── .placeholder                # Placeholder file
```

### Planned Usage:
- Bulk job reports (CSV exports)
- AI Knowledge Base documents
- System logs and analytics

### Lambda Functions Using This Bucket:
- `wecare-bulk-worker` (future) - Export bulk job results
- `wecare-ai-query-kb` (future) - Bedrock KB document storage

---

## Lambda Environment Variables (Verified)

### wecare-messages-read
```json
{
  "MEDIA_BUCKET": "auth.wecare.digital",
  "INBOUND_TABLE": "base-wecare-digital-WhatsAppInboundTable",
  "OUTBOUND_TABLE": "base-wecare-digital-WhatsAppOutboundTable",
  "LOG_LEVEL": "INFO"
}
```

### wecare-inbound-whatsapp
```json
{
  "MEDIA_BUCKET": "auth.wecare.digital",
  "CONTACTS_TABLE": "base-wecare-digital-ContactsTable",
  "MESSAGES_TABLE": "base-wecare-digital-WhatsAppInboundTable",
  "SEND_MODE": "LIVE"
}
```

### wecare-outbound-whatsapp
```json
{
  "MEDIA_BUCKET": "auth.wecare.digital",
  "CONTACTS_TABLE": "base-wecare-digital-ContactsTable",
  "MESSAGES_TABLE": "base-wecare-digital-WhatsAppOutboundTable",
  "SEND_MODE": "LIVE"
}
```

---

## IAM Permissions Required

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:PutObject",
    "s3:DeleteObject",
    "s3:ListBucket"
  ],
  "Resource": [
    "arn:aws:s3:::auth.wecare.digital",
    "arn:aws:s3:::auth.wecare.digital/whatsapp-media/*",
    "arn:aws:s3:::stream.wecare.digital",
    "arn:aws:s3:::stream.wecare.digital/base-wecare-digital/*"
  ]
}
```

---

## DynamoDB Tables

| Table | Purpose | S3 Key Field |
|-------|---------|--------------|
| `base-wecare-digital-WhatsAppInboundTable` | Inbound messages | `s3Key` |
| `base-wecare-digital-WhatsAppOutboundTable` | Outbound messages | `s3Key` |
| `base-wecare-digital-ContactsTable` | Contact information | N/A |

---

## Pre-signed URL Generation

The `wecare-messages-read` Lambda:
1. Reads messages from DynamoDB (both Inbound and Outbound tables)
2. For each message with `s3Key`:
   - Searches S3 with prefix to find actual file (handles WhatsApp media ID suffix)
   - Generates pre-signed URL with 1-hour expiry
   - Sets `ResponseContentDisposition: inline` for browser viewing
3. Returns `mediaUrl` and `actualS3Key` in API response

---

## Troubleshooting

### "NoSuchKey" Error
**Cause**: Stored `s3Key` doesn't match actual S3 file (WhatsApp media ID appended)
**Fix**: `messages-read` Lambda now searches S3 with prefix to find actual file

### Media Not Displaying
1. Check CloudWatch logs: `aws logs tail /aws/lambda/wecare-messages-read --since 30m`
2. Look for `s3_key_found` or `s3_key_not_found` events
3. Verify file exists: `aws s3 ls s3://auth.wecare.digital/whatsapp-media/whatsapp-media-incoming/`

### Verify Lambda Config
```bash
aws lambda get-function-configuration --function-name wecare-messages-read --query "Environment.Variables"
```
