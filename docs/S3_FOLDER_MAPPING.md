# S3 Bucket Configuration

## Single Bucket: `auth.wecare.digital`

All storage is consolidated to a single S3 bucket for simplicity.

### Folder Structure:
```
auth.wecare.digital/
├── download/                           # File downloads
├── upload/                             # File uploads
├── reports/                            # Bulk job reports and exports
│   └── .placeholder
├── whatsapp-media/
│   ├── whatsapp-media-incoming/        # Inbound media from customers
│   │   └── {uuid}.jpg{whatsapp-media-id}.jpeg
│   └── whatsapp-media-outgoing/        # Outbound media to customers
│       └── {uuid}.{ext}
└── error.html
```

---

## Lambda Functions Using This Bucket

| Function | Environment Variable | Folder | Operation |
|----------|---------------------|--------|-----------|
| `wecare-inbound-whatsapp` | `MEDIA_BUCKET=auth.wecare.digital` | `whatsapp-media/whatsapp-media-incoming/` | Download inbound media |
| `wecare-outbound-whatsapp` | `MEDIA_BUCKET=auth.wecare.digital` | `whatsapp-media/whatsapp-media-outgoing/` | Upload outbound media |
| `wecare-messages-read` | `MEDIA_BUCKET=auth.wecare.digital` | `whatsapp-media/*` | Generate pre-signed URLs |
| `wecare-bulk-worker` | `REPORT_BUCKET=auth.wecare.digital` | `reports/` | Export bulk job results |

---

## File Naming Convention

### Inbound Media Files
AWS EUM Social API appends WhatsApp media ID to filename:
- **Stored in DB**: `whatsapp-media/whatsapp-media-incoming/{uuid}.jpg`
- **Actual S3 key**: `whatsapp-media/whatsapp-media-incoming/{uuid}.jpg{whatsapp-media-id}.jpeg`

### Outbound Media Files
Standard naming with UUID:
- **S3 key**: `whatsapp-media/whatsapp-media-outgoing/{uuid}.{ext}`

---

## Environment Variables

```typescript
// Lambda environment variables
MEDIA_BUCKET: 'auth.wecare.digital'
MEDIA_INBOUND_PREFIX: 'whatsapp-media/whatsapp-media-incoming/'
MEDIA_OUTBOUND_PREFIX: 'whatsapp-media/whatsapp-media-outgoing/'
REPORT_BUCKET: 'auth.wecare.digital'
REPORT_PREFIX: 'reports/'
```

---

## IAM Permissions

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
    "arn:aws:s3:::auth.wecare.digital/*"
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
**Fix**: `messages-read` Lambda searches S3 with prefix to find actual file

### Media Not Displaying
1. Check CloudWatch logs: `aws logs tail /aws/lambda/wecare-messages-read --since 30m`
2. Look for `s3_key_found` or `s3_key_not_found` events
3. Verify file exists: `aws s3 ls s3://auth.wecare.digital/whatsapp-media/`

### Verify Lambda Config
```bash
aws lambda get-function-configuration --function-name wecare-messages-read --query "Environment.Variables"
```
