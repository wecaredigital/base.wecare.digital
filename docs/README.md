# Documentation Index

All project documentation and scripts are consolidated here.

## Main Documentation

### [S3_SETUP_AND_CLEANUP.md](S3_SETUP_AND_CLEANUP.md)
**Complete S3 bucket setup, cleanup, and organization guide**

- S3 bucket structure and organization
- Cleanup instructions (step-by-step)
- Folder organization and purposes
- Scripts and tools overview
- Verification checklist
- Monitoring and lifecycle policies
- Code changes and configuration
- Timeline and rollback plan

**Start here for S3 setup and cleanup.**

---

## Scripts

All scripts are PowerShell (.ps1) or Bash (.sh) and should be run from the project root.

### [delete-cdk-buckets.ps1](delete-cdk-buckets.ps1)
**Delete all CDK-generated S3 buckets**

```bash
.\docs\delete-cdk-buckets.ps1
```

**What it does:**
- Lists all S3 buckets
- Identifies CDK-generated buckets
- Confirms before deletion
- Keeps: stream.wecare.digital, auth.wecare.digital, d.wecare.digital

### [cleanup-s3-bucket.ps1](cleanup-s3-bucket.ps1)
**Clean Build/ and packages/ folders from stream.wecare.digital**

```bash
.\docs\cleanup-s3-bucket.ps1
```

**What it does:**
- Lists current bucket contents
- Identifies folders to delete
- Confirms before deletion
- Verifies cleanup

### [create-s3-folders.ps1](create-s3-folders.ps1)
**Create all required folder structure in the bucket**

```bash
.\docs\create-s3-folders.ps1
```

**What it does:**
- Creates all required folders
- Reports success/failure
- Provides next steps

### [verify-s3-structure.ps1](verify-s3-structure.ps1)
**Verify the bucket structure matches requirements**

```bash
.\docs\verify-s3-structure.ps1
```

**What it does:**
- Analyzes current bucket structure
- Checks for required folders
- Identifies unwanted folders
- Analyzes folder sizes
- Provides recommendations

### [cleanup-s3-bucket.sh](cleanup-s3-bucket.sh)
**Bash version of cleanup script**

```bash
bash ./docs/cleanup-s3-bucket.sh
```

---

## Quick Start

### 1. Review Documentation
Read [S3_SETUP_AND_CLEANUP.md](S3_SETUP_AND_CLEANUP.md) to understand the complete process.

### 2. Delete CDK Buckets
```bash
.\docs\delete-cdk-buckets.ps1
```

### 3. Clean S3 Bucket
```bash
.\docs\cleanup-s3-bucket.ps1
```

### 4. Create Folder Structure
```bash
.\docs\create-s3-folders.ps1
```

### 5. Verify Structure
```bash
.\docs\verify-s3-structure.ps1
```

---

## S3 Bucket Structure

**Bucket**: `s3://stream.wecare.digital`

```
s3://stream.wecare.digital/
├── whatsapp-media/
│   ├── whatsapp-media-incoming/
│   └── whatsapp-media-outgoing/
└── base-wecare-digital/
    ├── Build/          (builds)
    ├── packages/       (packages)
    ├── reports/        (reports)
    ├── bedrock/        (AI resources)
    ├── deployment/     (deployment)
    ├── logs/           (logs)
    ├── backups/        (backups)
    ├── media/          (media)
    ├── cache/          (cache)
    ├── monitoring/     (monitoring)
    ├── config/         (config)
    └── metadata/       (metadata)
```

---

## Configuration Files

### amplify/storage/resource.ts
Defines S3 bucket access and paths.

```typescript
export const storage = defineStorage({
  name: 'wecare-media',
  access: (allow) => ({
    'whatsapp-media/whatsapp-media-incoming/*': [
      allow.authenticated.to(['read', 'write']),
    ],
    'whatsapp-media/whatsapp-media-outgoing/*': [
      allow.authenticated.to(['read', 'write']),
    ],
    'base-wecare-digital/*': [
      allow.authenticated.to(['read', 'write']),
    ],
  }),
});
```

### amplify/functions/shared/config.ts
Defines S3 bucket configuration for Lambda functions.

```typescript
export const S3_CONFIG = {
  MEDIA_BUCKET: 'stream.wecare.digital',
  MEDIA_INBOUND_PREFIX: 'whatsapp-media/whatsapp-media-incoming/',
  MEDIA_OUTBOUND_PREFIX: 'whatsapp-media/whatsapp-media-outgoing/',
  REPORT_BUCKET: 'stream.wecare.digital',
  REPORT_PREFIX: 'base-wecare-digital/reports/',
  DEPLOYMENT_PREFIX: 'base-wecare-digital/deployment/',
};
```

### amplify/iam-policies.ts
Defines IAM permissions for S3 access.

```typescript
{
  Effect: 'Allow',
  Action: [
    's3:GetObject',
    's3:PutObject',
    's3:DeleteObject',
  ],
  Resource: [
    'arn:aws:s3:::stream.wecare.digital/whatsapp-media/whatsapp-media-incoming/*',
    'arn:aws:s3:::stream.wecare.digital/whatsapp-media/whatsapp-media-outgoing/*',
    'arn:aws:s3:::stream.wecare.digital/base-wecare-digital/*',
  ],
}
```

---

## Verification Checklist

- [ ] All CDK-generated buckets deleted
- [ ] Build/ and packages/ folders cleaned
- [ ] Required folder structure created
- [ ] Bucket structure verified
- [ ] Code updated to use consolidated bucket
- [ ] IAM policies updated
- [ ] Lambda functions tested
- [ ] WhatsApp media accessible
- [ ] Reports generating correctly
- [ ] Bedrock KB documents accessible
- [ ] No broken references in application
- [ ] Costs reduced

---

## Troubleshooting

### Script Errors
1. Ensure AWS CLI is installed and configured
2. Check AWS credentials: `aws sts get-caller-identity`
3. Verify bucket name and region
4. Check IAM permissions

### S3 Access Issues
1. Verify IAM policies in `amplify/iam-policies.ts`
2. Check S3 bucket policies
3. Review Lambda environment variables
4. Check CloudWatch logs

### Folder Structure Issues
1. Run `verify-s3-structure.ps1` to check current state
2. Review recommendations from verification script
3. Create missing folders with `create-s3-folders.ps1`
4. Delete unwanted folders manually if needed

---

## Support

For issues or questions:
1. Check [S3_SETUP_AND_CLEANUP.md](S3_SETUP_AND_CLEANUP.md)
2. Review CloudWatch logs: `/base-wecare-digital/common`
3. Verify IAM permissions in `amplify/iam-policies.ts`
4. Check S3 bucket configuration

---

## Summary

✓ Single bucket consolidation  
✓ Clean folder structure  
✓ Organized builds and packages  
✓ Proper access controls  
✓ Automated cleanup and monitoring  

**Status**: Ready for implementation
