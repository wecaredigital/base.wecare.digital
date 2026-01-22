# S3 Bucket and Folder Mapping

## Primary Media Bucket: `auth.wecare.digital`

This bucket stores all WhatsApp media files (images, videos, audio, documents).

### Folder Structure:
```
auth.wecare.digital/
├── whatsapp-media/
│   ├── whatsapp-media-incoming/    # Inbound media from customers
│   │   └── {message-uuid}.{ext}    # Files may have WhatsApp media ID appended
│   └── whatsapp-media-outgoing/    # Outbound media sent to customers
│       └── {message-uuid}.{ext}
```

### File Naming Convention:
- **Stored in DB**: `whatsapp-media/whatsapp-media-incoming/{uuid}.jpg`
- **Actual S3 Key**: `whatsapp-media/whatsapp-media-incoming/{uuid}.jpg{whatsapp-media-id}.jpeg`

The AWS EUM Social API appends the WhatsApp media ID to the filename when downloading media.
The `messages-read` Lambda searches S3 with prefix to find the actual file.

## Secondary Bucket: `stream.wecare.digital`

Used for reports and other non-media files.

### Folder Structure:
```
stream.wecare.digital/
└── base-wecare-digital/
    └── reports/                    # Generated reports
```

## Lambda Functions Using S3

| Function | Bucket | Prefix | Operation |
|----------|--------|--------|-----------|
| `inbound-whatsapp-handler` | auth.wecare.digital | whatsapp-media/whatsapp-media-incoming/ | Write (download media) |
| `outbound-whatsapp` | auth.wecare.digital | whatsapp-media/whatsapp-media-outgoing/ | Write (upload media) |
| `messages-read` | auth.wecare.digital | whatsapp-media/* | Read (generate pre-signed URLs) |

## Environment Variables

```typescript
// Lambda environment variables
MEDIA_BUCKET: 'auth.wecare.digital'
MEDIA_INBOUND_PREFIX: 'whatsapp-media/whatsapp-media-incoming/'
MEDIA_OUTBOUND_PREFIX: 'whatsapp-media/whatsapp-media-outgoing/'
```

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
    "arn:aws:s3:::auth.wecare.digital/whatsapp-media/*"
  ]
}
```

## DynamoDB Tables

| Table | Purpose |
|-------|---------|
| `base-wecare-digital-WhatsAppInboundTable` | Inbound messages with s3Key |
| `base-wecare-digital-WhatsAppOutboundTable` | Outbound messages with s3Key |
| `base-wecare-digital-ContactsTable` | Contact information |

## Pre-signed URL Generation

The `messages-read` Lambda:
1. Reads messages from DynamoDB
2. For each message with `s3Key`, searches S3 with prefix to find actual file
3. Generates pre-signed URL with 1-hour expiry
4. Returns `mediaUrl` in API response

## Troubleshooting

### "NoSuchKey" Error
If you see this error, the stored `s3Key` doesn't match the actual S3 file.
The fix: `messages-read` now searches S3 with prefix to find the actual file.

### Media Not Displaying
1. Check CloudWatch logs for `messages-read` Lambda
2. Look for `s3_key_found` or `s3_key_not_found` events
3. Verify the file exists in S3 with the expected prefix
