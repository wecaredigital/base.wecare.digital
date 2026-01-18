# Changelog

All notable changes to this project will be documented in this file.

## [2026-01-18] - Infrastructure Update & Documentation Reorganization

### Added
- ✓ Created 4 new SQS queues:
  - `base-wecare-digital-inbound-dlq`
  - `base-wecare-digital-bulk-queue`
  - `base-wecare-digital-bulk-dlq`
  - `base-wecare-digital-outbound-dlq`
- ✓ Created comprehensive documentation structure under `docs/` folder
- ✓ Created `docs/aws/RESOURCES.md` - Complete AWS resources inventory
- ✓ Created `docs/aws/INFRASTRUCTURE-STATUS.md` - Infrastructure status report
- ✓ Created `docs/deployment/GUIDE.md` - Detailed deployment guide
- ✓ Created `docs/README.md` - Documentation index
- ✓ Added `.gitattributes` for consistent line endings
- ✓ Created `amplify/backend-resources.ts` - CDK resources configuration
- ✓ Created `amplify/iam-policies.ts` - IAM permissions documentation

### Changed
- ✓ Updated main `README.md` with quick links and cleaner structure
- ✓ Updated branch strategy from `main` to `base` throughout documentation
- ✓ Reorganized all documentation files into logical folder structure
- ✓ Updated Git configuration for `base` branch as default

### Removed
- ✓ Deleted `.kiro/AWS_VERIFICATION_RESULTS.md` (consolidated into docs)
- ✓ Deleted `create-aws-resources.ps1` (no longer needed)
- ✓ Deleted `amplify/DEPLOYMENT.md` (moved to docs/deployment/GUIDE.md)
- ✓ Deleted `amplify/AWS-RESOURCES.md` (moved to docs/aws/RESOURCES.md)

### Verified
- ✓ 16 Lambda Functions (Python 3.12, 256MB)
- ✓ 11 DynamoDB Tables (PAY_PER_REQUEST billing)
- ✓ 5 SQS Queues (all active)
- ✓ 4 S3 Buckets
- ✓ 2 WhatsApp Phone Numbers (GREEN rating)
  - Phone 1: +91 93309 94400 (WECARE.DIGITAL)
  - Phone 2: +91 99033 00044 (Manish Agarwal)
- ✓ 2 WhatsApp Business Accounts (COMPLETE status)
  - WABA 1: waba-0aae9cf04cf24c66960f291c793359b4 (WECARE.DIGITAL)
  - WABA 2: waba-9bbe054d8404487397c38a9d197bc44a (Manish Agarwal)
- ✓ 2 Bedrock Agents
  - Agent 1: HQNT0JXN8G (base-bedrock-agent) - NOT_PREPARED
  - Agent 2: base_bedrock_agentcore-1XHDxj2o3Q (Internal runtime)
- ✓ 1 Cognito User Pool (us-east-1_CC9u1fYh6) - Created 2026-01-14
- ✓ 1 Bedrock Knowledge Base (FZBPKGTOYE) - ACTIVE
- ✓ 1 SNS Topic (base-wecare-digital) - 0 subscriptions confirmed
- ✓ 1 SES Identity (one@wecare.digital) - Verified, DKIM configured
- ✓ 1 Pinpoint SMS Pool (pool-6fbf5a5f390d4eeeaa7dbae39d78933e) - ACTIVE, TRANSACTIONAL
- ✓ 1 IAM Role (base-wecare-digital) - Created 2026-01-14

### Pending
- ⏳ CloudWatch Alarms (5 alarms to be created)
- ⏳ CloudWatch Dashboard (1 dashboard to be created)

---

## Project Structure After Changes

```
.
├── docs/                          # NEW: Documentation folder
│   ├── README.md                 # Documentation index
│   ├── aws/
│   │   ├── RESOURCES.md          # AWS resources inventory
│   │   └── INFRASTRUCTURE-STATUS.md # Status report
│   └── deployment/
│       └── GUIDE.md              # Deployment guide
├── amplify/
│   ├── auth/
│   ├── data/
│   ├── storage/
│   ├── functions/                # 16 Lambda functions
│   ├── monitoring/
│   ├── backend.ts
│   ├── backend-resources.ts      # NEW: CDK resources
│   └── iam-policies.ts           # NEW: IAM documentation
├── src/
│   ├── components/
│   └── pages/
├── tests/
├── .gitattributes                # NEW: Line ending configuration
├── .gitignore
├── README.md                     # UPDATED: Cleaner structure
├── CHANGELOG.md                  # NEW: This file
└── package.json
```

---

## AWS Resources Summary

**Total Active Resources**: 60+

| Category | Count | Status |
|----------|-------|--------|
| Lambda Functions | 16 | ✓ ACTIVE |
| DynamoDB Tables | 11 | ✓ ACTIVE |
| SQS Queues | 5 | ✓ ACTIVE |
| S3 Buckets | 4 | ✓ ACTIVE |
| WhatsApp Resources | 4 | ✓ ACTIVE |
| Bedrock Resources | 3 | ✓ ACTIVE |
| Other Services | 4 | ✓ ACTIVE |

---

## Next Steps

1. Create CloudWatch Alarms (5 alarms)
2. Create CloudWatch Dashboard
3. Subscribe to SNS topic for notifications
4. Enable DynamoDB Point-in-Time Recovery
5. Configure S3 Lifecycle Policies

---

**AWS Account**: 809904170947  
**Region**: us-east-1  
**Environment**: Production (base branch)  
**Status**: ✓ DEPLOYED
