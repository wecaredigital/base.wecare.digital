# S3 Bucket Configuration

## Bucket: `auth.wecare.digital`

### Folder Structure
```
auth.wecare.digital/
├── whatsapp-media/
│   ├── whatsapp-media-incoming/    # Inbound media from customers
│   └── whatsapp-media-outgoing/    # Outbound media to customers
├── stream/
│   └── gen-ai/
│       ├── external-kb/            # External KB (WhatsApp auto-reply)
│       └── internal-kb/            # Internal KB (Admin FloatingAgent)
├── download/                       # File downloads
└── upload/                         # File uploads
```

## Bedrock KB Data Sources

| KB | S3 Path | Purpose |
|----|---------|---------|
| External | `stream/gen-ai/external-kb/` | Customer FAQ (WhatsApp) |
| Internal | `stream/gen-ai/internal-kb/` | Admin docs (FloatingAgent) |

## Lambda Environment Variables

```bash
MEDIA_BUCKET=auth.wecare.digital
MEDIA_INBOUND_PREFIX=whatsapp-media/whatsapp-media-incoming/
MEDIA_OUTBOUND_PREFIX=whatsapp-media/whatsapp-media-outgoing/
```
