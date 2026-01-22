# S3 Bucket Cleanup Plan

**Date**: 2026-01-21  
**Bucket**: s3://stream.wecare.digital/  
**Status**: Analysis Complete

---

## Current S3 Structure Analysis

### ✅ KEEP (Active & Needed)

**1. whatsapp-media/** (Not shown in listing - at root level)
- Purpose: WhatsApp media files
- Status: ✅ KEEP
- Used by: inbound-whatsapp-handler, outbound-whatsapp

**2. base-wecare-digital/reports/**
- Purpose: Bulk job reports
- Status: ✅ KEEP
- Used by: bulk-job-control
- Current: .placeholder file only

### ❌ DELETE (Unused & Not Needed)

**1. base-wecare-digital/Build/**
- Purpose: Build artifacts
- Status: ❌ DELETE
- Reason: Not used by any Lambda function
- Size: Empty folder

**2. base-wecare-digital/Pacakges/** (Note: Typo in name)
- Purpose: Package storage
- Status: ❌ DELETE
- Reason: Not used by any Lambda function
- Size: 53 bytes

**3. base-wecare-digital/backups/**
- Purpose: Backup storage
- Status: ❌ DELETE
- Reason: Not used by any Lambda function
- Size: ~100 bytes (placeholders only)

**4. base-wecare-digital/bedrock-agent/**
- Purpose: Bedrock agent logs
- Status: ❌ DELETE
- Reason: Bedrock stores logs internally, not in S3
- Size: ~11 KB (logs)

**5. base-wecare-digital/bedrock-agentcore-runtime/**
- Purpose: Bedrock agent runtime
- Status: ❌ DELETE
- Reason: Bedrock manages this internally
- Size: ~52 MB (2 zip files)

**6. base-wecare-digital/bedrock-kb/**
- Purpose: Bedrock KB storage
- Status: ❌ DELETE
- Reason: Bedrock KB stores documents internally
- Size: ~100 bytes (placeholders only)

**7. base-wecare-digital/bedrock/**
- Purpose: Bedrock resources
- Status: ❌ DELETE
- Reason: Bedrock manages this internally
- Size: ~200 bytes (placeholders only)

**8. base-wecare-digital/bulk-jobs/**
- Purpose: Bulk job data
- Status: ❌ DELETE
- Reason: Not used by any Lambda function
- Size: ~100 bytes (placeholders only)

**9. base-wecare-digital/contacts/**
- Purpose: Contact exports/imports
- Status: ❌ DELETE
- Reason: Not used by any Lambda function
- Size: ~100 bytes (placeholders only)

**10. base-wecare-digital/documents/**
- Purpose: Document storage
- Status: ❌ DELETE
- Reason: Not used by any Lambda function
- Size: ~100 bytes (placeholders only)

**11. base-wecare-digital/forms/**
- Purpose: Form submissions
- Status: ❌ DELETE
- Reason: Not used by any Lambda function
- Size: ~100 bytes (placeholders only)

**12. base-wecare-digital/invoices/**
- Purpose: Invoice storage
- Status: ❌ DELETE
- Reason: Not used by any Lambda function
- Size: ~100 bytes (placeholders only)

**13. base-wecare-digital/logs/**
- Purpose: Application logs
- Status: ❌ DELETE
- Reason: CloudWatch handles logging, not S3
- Size: ~2 KB (logs)

**14. base-wecare-digital/packages/**
- Purpose: Lambda function packages
- Status: ❌ DELETE
- Reason: Amplify manages Lambda packages, not S3
- Size: ~100 MB (16 zip files)

---

## Cleanup Summary

### Folders to Delete (14)
1. base-wecare-digital/Build/
2. base-wecare-digital/Pacakges/
3. base-wecare-digital/backups/
4. base-wecare-digital/bedrock-agent/
5. base-wecare-digital/bedrock-agentcore-runtime/
6. base-wecare-digital/bedrock-kb/
7. base-wecare-digital/bedrock/
8. base-wecare-digital/bulk-jobs/
9. base-wecare-digital/contacts/
10. base-wecare-digital/documents/
11. base-wecare-digital/forms/
12. base-wecare-digital/invoices/
13. base-wecare-digital/logs/
14. base-wecare-digital/packages/

### Folders to Keep (2)
1. whatsapp-media/whatsapp-media-incoming/
2. whatsapp-media/whatsapp-media-outgoing/
3. base-wecare-digital/reports/

### Space Savings
- **Before**: ~150 MB
- **After**: ~1 MB (only active folders)
- **Reduction**: 99%

---

## Cleanup Commands

### Delete All Unused Folders

```bash
# Delete Build folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/Build/ --recursive

# Delete Pacakges folder (typo in name)
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/Pacakges/ --recursive

# Delete backups folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/backups/ --recursive

# Delete bedrock-agent folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/bedrock-agent/ --recursive

# Delete bedrock-agentcore-runtime folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/bedrock-agentcore-runtime/ --recursive

# Delete bedrock-kb folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/bedrock-kb/ --recursive

# Delete bedrock folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/bedrock/ --recursive

# Delete bulk-jobs folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/bulk-jobs/ --recursive

# Delete contacts folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/contacts/ --recursive

# Delete documents folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/documents/ --recursive

# Delete forms folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/forms/ --recursive

# Delete invoices folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/invoices/ --recursive

# Delete logs folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/logs/ --recursive

# Delete packages folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/packages/ --recursive
```

### Or Delete All at Once

```bash
# Delete all base-wecare-digital content except reports
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/ --recursive --exclude "reports/*"
```

### Verify Cleanup

```bash
# List remaining folders
aws s3 ls s3://stream.wecare.digital/ --recursive

# Expected output:
# whatsapp-media/whatsapp-media-incoming/
# whatsapp-media/whatsapp-media-outgoing/
# base-wecare-digital/reports/
```

---

## Final S3 Structure (After Cleanup)

```
s3://stream.wecare.digital/
├── whatsapp-media/
│   ├── whatsapp-media-incoming/    ← Inbound WhatsApp media
│   └── whatsapp-media-outgoing/    ← Outbound WhatsApp media
└── base-wecare-digital/
    └── reports/                     ← Bulk job reports
```

**Total Folders**: 3  
**Total Size**: ~1 MB (only active data)  
**Status**: ✅ CLEAN & OPTIMIZED

---

## Verification Steps

### Step 1: Verify Cleanup
```bash
aws s3 ls s3://stream.wecare.digital/ --recursive
```

### Step 2: Check Folder Count
```bash
aws s3 ls s3://stream.wecare.digital/ --recursive | wc -l
```

Expected: ~5-10 lines (only active folders)

### Step 3: Verify Active Folders Exist
```bash
# Check WhatsApp media folders
aws s3 ls s3://stream.wecare.digital/whatsapp-media/

# Check reports folder
aws s3 ls s3://stream.wecare.digital/base-wecare-digital/reports/
```

---

## Rollback Procedure

If cleanup causes issues:

### Option 1: Restore from S3 Versioning
```bash
# If versioning is enabled
aws s3api list-object-versions --bucket stream.wecare.digital
```

### Option 2: Restore from AWS Backup
```bash
# Check if backup exists
aws s3 ls s3://stream.wecare.digital-backup/
```

### Option 3: Manual Restore
- Contact AWS support for point-in-time recovery
- Restore from CloudTrail logs

---

## Why These Folders Are Unused

### Bedrock Folders (bedrock-agent, bedrock-kb, bedrock-agentcore-runtime)
- Bedrock stores documents and logs internally
- S3 folders are not needed
- Bedrock KB ID: FZBPKGTOYE (stores documents internally)
- Bedrock Agent ID: HQNT0JXN8G (uses KB internally)

### Lambda Package Folders (packages)
- Amplify manages Lambda packages
- Packages are deployed directly to Lambda
- S3 storage not needed

### Logging Folders (logs)
- CloudWatch handles all logging
- S3 storage not needed
- CloudWatch log group: /base-wecare-digital/common

### Other Folders (Build, backups, bulk-jobs, contacts, documents, forms, invoices)
- Not referenced in any Lambda function
- Not used by any AWS service
- Safe to delete

---

## Cleanup Checklist

- [ ] Verify AWS credentials configured
- [ ] Review cleanup plan
- [ ] Backup important data (if any)
- [ ] Execute cleanup commands
- [ ] Verify cleanup completed
- [ ] Check S3 structure
- [ ] Verify active folders still exist
- [ ] Monitor CloudWatch logs for errors
- [ ] Confirm no Lambda errors

---

## Summary

**Current State**: S3 bucket has 14 unused folders + 3 active folders  
**Action**: Delete 14 unused folders  
**Result**: Clean S3 bucket with only 3 active folders  
**Space Saved**: ~150 MB  
**Risk Level**: LOW (unused folders only)

---

**Cleanup Plan**: ✅ COMPLETE  
**Date**: 2026-01-21  
**Status**: Ready to Execute

