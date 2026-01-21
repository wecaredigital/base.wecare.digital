# S3 Bucket Setup and Cleanup Guide

**Last Updated**: January 21, 2026  
**Bucket**: `s3://stream.wecare.digital`  
**Status**: Ready for cleanup and reorganization

---

## Table of Contents

1. [Overview](#overview)
2. [S3 Bucket Structure](#s3-bucket-structure)
3. [Cleanup Instructions](#cleanup-instructions)
4. [Folder Organization](#folder-organization)
5. [Scripts and Tools](#scripts-and-tools)
6. [Verification](#verification)
7. [Monitoring](#monitoring)

---

## Overview

### Objective
Consolidate all S3 storage to use **ONLY** `s3://stream.wecare.digital` with:
- WhatsApp media at root level (original paths)
- All other resources under `base-wecare-digital/`
- Builds in `base-wecare-digital/Build/`
- Packages in `base-wecare-digital/packages/`

### Current State
- Multiple CDK-generated buckets (to be deleted)
- Scattered resources across different buckets
- Build and package artifacts in wrong locations

### Target State
- Single bucket: `stream.wecare.digital`
- Clean folder structure
- Organized builds and packages
- Proper access controls

---

## S3 Bucket Structure

### Final Structure

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

## Cleanup Instructions

### Step 1: Delete CDK-Generated Buckets

```bash
# List all buckets
aws s3 ls

# Delete CDK-generated buckets (they have random suffixes)
# Example: amplifywecaredigitaladminplatformbasesandboxc99cb451ee*
aws s3 rb s3://[CDK-BUCKET-NAME] --force

# Or use the provided script
.\delete-cdk-buckets.ps1
```

### Step 2: Clean base-wecare-digital Folder

```bash
# Delete Build folder (old builds)
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/Build/ --recursive

# Delete packages folder (old packages)
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/packages/ --recursive

# Delete any other unwanted folders
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/[FOLDER]/ --recursive

# Verify cleanup
aws s3 ls s3://stream.wecare.digital/base-wecare-digital/ --recursive
```

### Step 3: Create Required Folder Structure

```bash
# Use the provided script to create all required folders
.\create-s3-folders.ps1

# Or manually create folders
aws s3api put-object --bucket stream.wecare.digital --key "base-wecare-digital/Build/"
aws s3api put-object --bucket stream.wecare.digital --key "base-wecare-digital/packages/"
# ... (repeat for all folders)
```

### Step 4: Verify Structure

```bash
# Use the provided script to verify
.\verify-s3-structure.ps1

# Or manually verify
aws s3 ls s3://stream.wecare.digital/ --recursive
```

---

## Folder Organization

### whatsapp-media/ (Root Level)
- **Purpose**: Store WhatsApp media files
- **Paths**:
  - `whatsapp-media/whatsapp-media-incoming/*` - Inbound messages
  - `whatsapp-media/whatsapp-media-outgoing/*` - Outbound messages
- **Retention**: 30 days (TTL)
- **Access**: Lambda functions, authenticated users
- **Size Limit**: Per file limits (5MB images, 16MB video)

### base-wecare-digital/Build/
- **Purpose**: Store all build artifacts
- **Contents**: Next.js builds, Amplify builds, Lambda builds, Docker builds, build logs
- **Retention**: 7 days (auto-cleanup)
- **Access**: CI/CD pipeline, deployment scripts
- **Size Limit**: Monitor for growth

### base-wecare-digital/packages/
- **Purpose**: Store all package files
- **Contents**: NPM packages, Python packages, Docker packages, archived packages
- **Retention**: Keep latest 3 versions
- **Access**: CI/CD pipeline, deployment scripts
- **Size Limit**: Monitor for growth

### base-wecare-digital/reports/
- **Purpose**: Store bulk job reports
- **Contents**: Job reports (JSON, CSV, PDF), daily summaries
- **Retention**: 180 days
- **Access**: Lambda functions, authenticated users

### base-wecare-digital/bedrock/
- **Purpose**: Store Bedrock AI resources
- **Contents**: Knowledge base documents, training data, embeddings
- **Retention**: Keep current version + 1 backup
- **Access**: Bedrock service, Lambda functions

### base-wecare-digital/deployment/
- **Purpose**: Store deployment artifacts
- **Contents**: CloudFormation, Terraform, CDK artifacts, releases
- **Retention**: Keep all versions
- **Access**: Deployment scripts, CI/CD

### base-wecare-digital/logs/
- **Purpose**: Store application logs
- **Contents**: Lambda logs, API logs, deployment logs
- **Retention**: 90 days (auto-cleanup)
- **Access**: Monitoring systems, developers

### base-wecare-digital/backups/
- **Purpose**: Store backup files
- **Contents**: Database backups, configuration backups
- **Retention**: Keep last 30 days
- **Access**: Backup/restore scripts

### base-wecare-digital/media/
- **Purpose**: Store general media files
- **Contents**: Logos, icons, templates, guides
- **Retention**: Keep all
- **Access**: Frontend, documentation

### base-wecare-digital/cache/
- **Purpose**: Store temporary cache files
- **Contents**: Compiled templates, temporary uploads
- **Retention**: 7 days (auto-cleanup)
- **Access**: Application services

### base-wecare-digital/monitoring/
- **Purpose**: Store monitoring data
- **Contents**: Performance metrics, usage statistics, alerts
- **Retention**: 30 days (auto-cleanup)
- **Access**: Monitoring systems

### base-wecare-digital/config/
- **Purpose**: Store configuration files
- **Contents**: Environment configs, encrypted secrets, templates
- **Retention**: Keep all versions
- **Access**: Deployment scripts, Lambda functions

### base-wecare-digital/metadata/
- **Purpose**: Store bucket metadata
- **Contents**: Bucket index, project manifest, version info
- **Retention**: Keep all
- **Access**: All services

---

## Scripts and Tools

### delete-cdk-buckets.ps1
Safely deletes all CDK-generated S3 buckets while keeping required buckets.

```bash
.\delete-cdk-buckets.ps1
```

**What it does**:
- Lists all S3 buckets
- Identifies CDK-generated buckets
- Confirms before deletion
- Keeps: stream.wecare.digital, auth.wecare.digital, d.wecare.digital

### cleanup-s3-bucket.ps1
Removes Build/ and packages/ folders from stream.wecare.digital.

```bash
.\cleanup-s3-bucket.ps1
```

**What it does**:
- Lists current bucket contents
- Identifies folders to delete
- Confirms before deletion
- Verifies cleanup

### create-s3-folders.ps1
Creates all required folder structure in the bucket.

```bash
.\create-s3-folders.ps1
```

**What it does**:
- Creates all required folders
- Reports success/failure
- Provides next steps

### verify-s3-structure.ps1
Verifies the bucket structure matches requirements.

```bash
.\verify-s3-structure.ps1
```

**What it does**:
- Analyzes current bucket structure
- Checks for required folders
- Identifies unwanted folders
- Analyzes folder sizes
- Provides recommendations

---

## Verification

### Checklist

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

### Verification Commands

```bash
# List all buckets
aws s3 ls

# Check bucket structure
aws s3 ls s3://stream.wecare.digital/ --recursive

# Check bucket size
aws s3 ls s3://stream.wecare.digital/ --recursive --summarize

# Check specific folder
aws s3 ls s3://stream.wecare.digital/base-wecare-digital/ --recursive

# Check for unwanted files
aws s3 ls s3://stream.wecare.digital/ --recursive | grep -E "(Build|packages|node_modules|dist)"
```

---

## Monitoring

### Size Monitoring
- Check Build/ size weekly
- Check packages/ size weekly
- Alert if > 100GB

### Cost Monitoring
- Monitor S3 storage costs
- Monitor data transfer costs
- Alert if > $100/month

### Access Monitoring
- Log all access to sensitive folders
- Monitor for unauthorized access
- Alert on suspicious patterns

### Lifecycle Policies

```json
{
  "Rules": [
    {
      "Id": "DeleteBuildLogs",
      "Filter": { "Prefix": "base-wecare-digital/Build/logs/" },
      "Expiration": { "Days": 7 }
    },
    {
      "Id": "DeleteCacheFiles",
      "Filter": { "Prefix": "base-wecare-digital/cache/temporary/" },
      "Expiration": { "Days": 7 }
    },
    {
      "Id": "DeleteApplicationLogs",
      "Filter": { "Prefix": "base-wecare-digital/logs/" },
      "Expiration": { "Days": 90 }
    },
    {
      "Id": "DeleteMonitoringData",
      "Filter": { "Prefix": "base-wecare-digital/monitoring/" },
      "Expiration": { "Days": 30 }
    },
    {
      "Id": "ArchiveReports",
      "Filter": { "Prefix": "base-wecare-digital/reports/" },
      "Transitions": [
        {
          "Days": 180,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

---

## Code Changes

### Files Updated

1. **amplify/storage/resource.ts**
   - References consolidated bucket
   - Keeps original WhatsApp paths
   - Adds access to base-wecare-digital/*

2. **amplify/functions/shared/config.ts**
   - Updated MEDIA_BUCKET to stream.wecare.digital
   - Updated REPORT_BUCKET to stream.wecare.digital
   - Kept original WhatsApp prefixes
   - Added DEPLOYMENT_PREFIX

3. **amplify/iam-policies.ts**
   - Consolidated S3 permissions to single bucket
   - Updated resource ARNs

### Configuration

```typescript
// S3 Buckets - Consolidated to single bucket
export const S3_CONFIG = {
  MEDIA_BUCKET: 'stream.wecare.digital',
  MEDIA_INBOUND_PREFIX: 'whatsapp-media/whatsapp-media-incoming/',
  MEDIA_OUTBOUND_PREFIX: 'whatsapp-media/whatsapp-media-outgoing/',
  REPORT_BUCKET: 'stream.wecare.digital',
  REPORT_PREFIX: 'base-wecare-digital/reports/',
  DEPLOYMENT_PREFIX: 'base-wecare-digital/deployment/',
};
```

---

## Timeline

1. **Day 1**: Backup all S3 buckets
2. **Day 2**: Delete CDK-generated buckets
3. **Day 3**: Clean base-wecare-digital folder
4. **Day 4**: Create required folder structure
5. **Day 5**: Verify structure and test
6. **Day 6**: Deploy to production
7. **Day 7-30**: Monitor and keep old buckets as backup

---

## Rollback Plan

If issues occur:
1. Keep old buckets for 30 days
2. Update code to point back to old buckets
3. Restore from backups if needed

---

## Support

For issues or questions:
1. Check CloudWatch logs: `/base-wecare-digital/common`
2. Verify IAM permissions in `amplify/iam-policies.ts`
3. Check S3 bucket policies
4. Review Lambda environment variables

---

## Summary

✓ Single bucket consolidation  
✓ Clean folder structure  
✓ Organized builds and packages  
✓ Proper access controls  
✓ Automated cleanup and monitoring  

**Status**: Ready for implementation
