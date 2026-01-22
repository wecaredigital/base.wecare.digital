# S3 Folder Deletion Confirmation

**Date**: January 21, 2026  
**Bucket**: `s3://stream.wecare.digital`  
**Status**: Ready for Deletion Confirmation

---

## Folders to DELETE (10 folders)

### ❌ DELETE These Folders

```
s3://stream.wecare.digital/base-wecare-digital/Build/
s3://stream.wecare.digital/base-wecare-digital/packages/
s3://stream.wecare.digital/base-wecare-digital/bedrock/
s3://stream.wecare.digital/base-wecare-digital/deployment/
s3://stream.wecare.digital/base-wecare-digital/logs/
s3://stream.wecare.digital/base-wecare-digital/backups/
s3://stream.wecare.digital/base-wecare-digital/media/
s3://stream.wecare.digital/base-wecare-digital/cache/
s3://stream.wecare.digital/base-wecare-digital/monitoring/
s3://stream.wecare.digital/base-wecare-digital/config/
s3://stream.wecare.digital/base-wecare-digital/metadata/
```

### Reason for Deletion

**None of these folders are referenced in any code:**
- ❌ No Lambda functions use them
- ❌ No frontend code uses them
- ❌ No backend configuration uses them
- ❌ No environment variables reference them

---

## Folders to KEEP (3 folders)

### ✓ KEEP These Folders

```
s3://stream.wecare.digital/whatsapp-media/whatsapp-media-incoming/
s3://stream.wecare.digital/whatsapp-media/whatsapp-media-outgoing/
s3://stream.wecare.digital/base-wecare-digital/reports/
```

### Why They Are Kept

| Folder | Used By | Purpose |
|--------|---------|---------|
| `whatsapp-media/whatsapp-media-incoming/` | `inbound-whatsapp-handler` Lambda | Store inbound WhatsApp media files |
| `whatsapp-media/whatsapp-media-outgoing/` | `outbound-whatsapp` Lambda | Store outbound WhatsApp media files |
| `base-wecare-digital/reports/` | `bulk-job-control` Lambda | Store bulk job reports |

---

## Deletion Commands

### Option 1: Delete One by One (Safe)

```bash
# Delete Build folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/Build/ --recursive

# Delete packages folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/packages/ --recursive

# Delete bedrock folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/bedrock/ --recursive

# Delete deployment folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/deployment/ --recursive

# Delete logs folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/logs/ --recursive

# Delete backups folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/backups/ --recursive

# Delete media folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/media/ --recursive

# Delete cache folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/cache/ --recursive

# Delete monitoring folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/monitoring/ --recursive

# Delete config folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/config/ --recursive

# Delete metadata folder
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/metadata/ --recursive
```

### Option 2: Delete All at Once (Faster)

```bash
# Delete all unused folders in one command
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/Build/ --recursive && \
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/packages/ --recursive && \
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/bedrock/ --recursive && \
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/deployment/ --recursive && \
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/logs/ --recursive && \
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/backups/ --recursive && \
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/media/ --recursive && \
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/cache/ --recursive && \
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/monitoring/ --recursive && \
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/config/ --recursive && \
aws s3 rm s3://stream.wecare.digital/base-wecare-digital/metadata/ --recursive
```

### Option 3: Using PowerShell Script

```powershell
$folders = @(
    "Build",
    "packages",
    "bedrock",
    "deployment",
    "logs",
    "backups",
    "media",
    "cache",
    "monitoring",
    "config",
    "metadata"
)

foreach ($folder in $folders) {
    $path = "s3://stream.wecare.digital/base-wecare-digital/$folder/"
    Write-Host "Deleting: $path"
    aws s3 rm $path --recursive
}
```

---

## Verification After Deletion

### Check What Remains

```bash
# List all remaining objects
aws s3 ls s3://stream.wecare.digital/ --recursive
```

### Expected Output

```
2026-01-21 14:30:00          0 whatsapp-media/
2026-01-21 14:30:00          0 whatsapp-media/whatsapp-media-incoming/
2026-01-21 14:30:00    1234567 whatsapp-media/whatsapp-media-incoming/msg-001.jpg
2026-01-21 14:30:00    2345678 whatsapp-media/whatsapp-media-incoming/msg-002.mp4
2026-01-21 14:30:00          0 whatsapp-media/whatsapp-media-outgoing/
2026-01-21 14:30:00    3456789 whatsapp-media/whatsapp-media-outgoing/msg-003.jpg
2026-01-21 14:30:00          0 base-wecare-digital/
2026-01-21 14:30:00          0 base-wecare-digital/reports/
2026-01-21 14:30:00    4567890 base-wecare-digital/reports/job-001-report.json
```

**Should NOT contain:**
- ❌ Build/
- ❌ packages/
- ❌ bedrock/
- ❌ deployment/
- ❌ logs/
- ❌ backups/
- ❌ media/
- ❌ cache/
- ❌ monitoring/
- ❌ config/
- ❌ metadata/

---

## Summary Table

| Folder | Status | Action | Reason |
|--------|--------|--------|--------|
| `whatsapp-media/whatsapp-media-incoming/` | ✓ KEEP | No action | Used by inbound-whatsapp-handler |
| `whatsapp-media/whatsapp-media-outgoing/` | ✓ KEEP | No action | Used by outbound-whatsapp |
| `base-wecare-digital/reports/` | ✓ KEEP | No action | Used by bulk-job-control |
| `base-wecare-digital/Build/` | ❌ DELETE | Delete | Not used in code |
| `base-wecare-digital/packages/` | ❌ DELETE | Delete | Not used in code |
| `base-wecare-digital/bedrock/` | ❌ DELETE | Delete | Not used in code |
| `base-wecare-digital/deployment/` | ❌ DELETE | Delete | Not used in code |
| `base-wecare-digital/logs/` | ❌ DELETE | Delete | Not used in code |
| `base-wecare-digital/backups/` | ❌ DELETE | Delete | Not used in code |
| `base-wecare-digital/media/` | ❌ DELETE | Delete | Not used in code |
| `base-wecare-digital/cache/` | ❌ DELETE | Delete | Not used in code |
| `base-wecare-digital/monitoring/` | ❌ DELETE | Delete | Not used in code |
| `base-wecare-digital/config/` | ❌ DELETE | Delete | Not used in code |
| `base-wecare-digital/metadata/` | ❌ DELETE | Delete | Not used in code |

---

## Confirmation Checklist

Before deleting, confirm:

- [ ] Backup S3 bucket (optional but recommended)
- [ ] Verify no active processes are using these folders
- [ ] Confirm code has been updated (already done)
- [ ] Confirm AWS credentials are correct
- [ ] Ready to delete 10 unused folders

---

## After Deletion

### Deploy Code Changes

```bash
npm run amplify:deploy
```

### Verify Application Works

1. Test inbound WhatsApp messages
2. Test outbound WhatsApp messages
3. Test bulk job reports
4. Check CloudWatch logs for errors

---

## Rollback Plan

If issues occur after deletion:

1. **Restore from backup** (if backup was created)
2. **Recreate folders** (if needed):
   ```bash
   aws s3api put-object --bucket stream.wecare.digital --key "base-wecare-digital/Build/"
   # ... repeat for other folders
   ```
3. **Revert code changes** (if needed)

---

## Final Confirmation

**Ready to delete these 10 folders?**

```
✓ Build/
✓ packages/
✓ bedrock/
✓ deployment/
✓ logs/
✓ backups/
✓ media/
✓ cache/
✓ monitoring/
✓ config/
✓ metadata/
```

**Confirm by running deletion commands above.**
