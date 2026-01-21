# WECARE.DIGITAL - Documentation Index

## Quick Links

### Getting Started
- **README.md** - Project overview and quick start
- **DEPLOYMENT.md** - Current deployment status and API endpoint

### Architecture & Design
- **ARCHITECTURE.md** - System architecture and components
- **CHANGELOG.md** - Version history and changes

### Maintenance & Operations
- **CLEANUP_SUMMARY.md** - Deep clean details and what was removed
- **VERIFICATION.md** - Project verification report
- **FINAL_DEPLOYMENT_REPORT.md** - Deployment verification and test results

### Reference Documentation
- **docs/aws/RESOURCES.md** - AWS resources reference
- **docs/aws/WHATSAPP-API-REFERENCE.md** - WhatsApp API reference

### Test Scripts
- **docs/examples/send-test-media.js** - WhatsApp media test
- **docs/examples/send-test-text.js** - WhatsApp text test

## Project Structure

```
wecare-digital/
├── amplify/                    # Backend infrastructure
│   ├── auth/                   # Cognito configuration
│   ├── data/                   # DynamoDB schema (12 tables)
│   ├── storage/                # S3 configuration
│   ├── functions/              # 17 Lambda functions
│   │   ├── contacts-*          # Contact management (5)
│   │   ├── messages-*          # Message operations (2)
│   │   ├── outbound-*          # Outbound messaging (4)
│   │   ├── inbound-*           # Inbound messaging (1)
│   │   ├── voice-*             # Voice operations (1)
│   │   ├── bulk-*              # Bulk operations (1)
│   │   ├── ai-*                # AI automation (2)
│   │   ├── dlq-*               # DLQ operations (1)
│   │   └── shared/             # Shared utilities (8)
│   └── backend.ts              # Main backend definition
├── src/
│   ├── pages/                  # 34 frontend pages
│   ├── components/             # 6 React components
│   └── lib/                    # API client
├── docs/
│   ├── aws/                    # AWS references
│   └── examples/               # Test scripts
├── tests/
│   └── integration/            # Integration tests
└── [Documentation files]       # 6 markdown files
```

## Key Statistics

| Component | Count | Status |
|-----------|-------|--------|
| Lambda Functions | 17 | ✅ All deployed |
| DynamoDB Tables | 12 | ✅ All created |
| Frontend Pages | 34 | ✅ All built |
| React Components | 6 | ✅ All used |
| Shared Utilities | 8 | ✅ All used |
| API Routes | 12 | ✅ All connected |
| Markdown Files | 6 | ✅ Fresh & minimal |

## Deployment

**Status:** ✅ Production Ready

**Region:** us-east-1  
**Account:** 809904170947  
**API Endpoint:** https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod

## Quick Commands

```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Deploy backend
npx ampx sandbox --once

# View logs
aws logs tail /aws/lambda/wecare-contacts-read --follow

# Test API
curl https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod/contacts
```

## Recent Changes

- ✅ Deep cleaned repository (~1.25GB removed)
- ✅ Deleted duplicate backend files
- ✅ Archived test scripts to docs/examples/
- ✅ Created fresh, minimal markdown files
- ✅ Verified all Lambda functions are active
- ✅ Verified all DynamoDB tables are used
- ✅ Verified all frontend pages are used

See CLEANUP_SUMMARY.md for details.

## Support

Check CloudWatch logs for troubleshooting:
```bash
aws logs tail /aws/lambda/wecare-messages-read --follow
```

For API issues, check DEPLOYMENT.md for endpoint details.

---

**Last Updated:** January 21, 2026  
**Status:** ✅ Ready for Production
