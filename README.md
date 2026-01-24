# WECARE.DIGITAL Admin Platform

Multi-channel messaging platform for WhatsApp, SMS, Email, and Voice communications.

## Quick Start

```bash
npm install
npm run dev
```

## AWS Resources

- **Region**: us-east-1
- **Account**: 809904170947
- **Cognito User Pool**: us-east-1_CC9u1fYh6
- **App Client**: 5na5ba2pbpanm36138jdcd9gck

### S3 Bucket
Single bucket: `auth.wecare.digital`
- `whatsapp-media/whatsapp-media-incoming/` - Inbound media
- `whatsapp-media/whatsapp-media-outgoing/` - Outbound media
- `stream/` - Reports and exports

### DynamoDB Tables
- `base-wecare-digital-ContactsTable`
- `base-wecare-digital-WhatsAppInboundTable`
- `base-wecare-digital-WhatsAppOutboundTable`
- `base-wecare-digital-BulkJobsTable`
- `base-wecare-digital-VoiceCalls`

### WhatsApp Phone Numbers
| Name | Phone | ID |
|------|-------|-----|
| WECARE.DIGITAL | +91 93309 94400 | phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54 |
| Manish Agarwal | +91 99033 00044 | phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06 |

## Project Structure

```
├── amplify/           # AWS Amplify backend
│   ├── auth/          # Cognito configuration
│   ├── data/          # DynamoDB schema
│   ├── functions/     # Lambda functions (Python)
│   └── storage/       # S3 configuration
├── src/
│   ├── api/           # API client
│   ├── components/    # React components
│   ├── pages/         # Next.js pages
│   └── styles/        # CSS styles
├── docs/aws/          # AWS Documentation
└── scripts/           # Admin scripts
```

## Lambda Functions

All Lambda functions use Python 3.12 runtime with prefix `wecare-*`:
- `wecare-contacts-*` - Contact CRUD operations
- `wecare-messages-*` - Message read/delete
- `wecare-inbound-whatsapp` - Webhook handler
- `wecare-outbound-whatsapp` - Send messages
- `wecare-bulk-*` - Bulk messaging
- `wecare-ai-*` - AI/Bedrock integration

## Documentation

See `docs/aws/` folder for:
- [AWS Resources](docs/aws/RESOURCES.md)
- [WhatsApp API Reference](docs/aws/WHATSAPP-API-REFERENCE.md)
- [WhatsApp Payments](docs/aws/WHATSAPP-PAYMENTS.md)
- [S3 Bucket Config](docs/aws/S3-BUCKET-CONFIG.md)
- [Bedrock KB Setup](docs/aws/BEDROCK-KB.md)

## Admin Scripts

- `scripts/delete_all_messages.py` - Delete all messages from DynamoDB and S3
