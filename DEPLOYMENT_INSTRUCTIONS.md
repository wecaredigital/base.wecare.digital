# Deployment Instructions - Media Display Fix

**Date:** January 20, 2026  
**Status:** ✅ READY FOR DEPLOYMENT  
**Latest Commit:** `464b8ce`

---

## 🚀 DEPLOYMENT COMMANDS

Run these commands in your terminal to deploy the media display fix:

### Step 1: Deploy Lambda Functions

```bash
amplify push --only functions/messages-read --yes
```

**What This Does:**
- Deploys updated `wecare-messages-read` Lambda function
- Enables pre-signed URL generation for media files
- Adds comprehensive logging for debugging
- Enables media display in dashboard

**Expected Output:**
```
✔ Successfully updated resource messages-read locally.
✔ Successfully updated resource messages-read in the cloud.
```

**Expected Time:** 2-5 minutes

---

### Step 2: Deploy Frontend

```bash
amplify push --only hosting --yes
```

**What This Does:**
- Deploys updated WhatsApp inbox component
- Enables media type detection
- Enables conditional rendering for all media types
- Adds CSS styling for media display

**Expected Output:**
```
✔ Successfully updated resource hosting locally.
✔ Successfully updated resource hosting in the cloud.
```

**Expected Time:** 2-5 minutes

---

### Step 3: Test Media Display

After deployment completes, test the media display:

```bash
node temp/send-test-media.js
```

**Expected Output:**
```
✅ SUCCESS
Message ID: [message-id]
WhatsApp Message ID: [whatsapp-id]
Status: sent
📱 Media should appear in WhatsApp within seconds
```

---

## 📋 VERIFICATION CHECKLIST

After deployment, verify everything is working:

### ✅ Check Lambda Deployment
```bash
aws lambda get-function --function-name wecare-messages-read \
  --query 'Configuration.LastModified'
```

Should show a recent timestamp (within last few minutes)

### ✅ Check Frontend Deployment
```bash
amplify status
```

Should show hosting as "deployed"

### ✅ Check CloudWatch Logs
```bash
aws logs tail /aws/lambda/wecare-messages-read --follow
```

Should show log entries with:
- `attempting_presigned_url`
- `presigned_url_generated`
- Media URL generation details

### ✅ Test Media Display
1. Go to WhatsApp Inbox in dashboard
2. Select a contact
3. Send test image: `node temp/send-test-media.js`
4. Check if image displays in dashboard
5. Verify sender name shows for inbound messages

---

## 🎯 EXPECTED RESULTS

### After Successful Deployment

**Media Sending:**
- ✅ Text messages send successfully
- ✅ Images send successfully
- ✅ Videos send successfully
- ✅ Audio sends successfully
- ✅ Documents send successfully

**Media Display:**
- ✅ Images display inline (max 200px × 300px)
- ✅ Videos display with play/pause controls
- ✅ Audio displays with play/pause controls
- ✅ Documents display as download links
- ✅ Sender names display for inbound messages

**Logging:**
- ✅ CloudWatch logs show URL generation
- ✅ Error tracking enabled
- ✅ Debugging information available

---

## 🔍 TROUBLESHOOTING

### If Media Still Doesn't Display

**Issue 1: Lambda Not Deployed**
```bash
# Check if Lambda was updated
aws lambda get-function --function-name wecare-messages-read \
  --query 'Configuration.LastModified'

# If old timestamp, redeploy:
amplify push --only functions/messages-read --yes
```

**Issue 2: Frontend Not Deployed**
```bash
# Check frontend status
amplify status

# If not deployed, redeploy:
amplify push --only hosting --yes
```

**Issue 3: S3 Bucket Issues**
```bash
# Check if S3 bucket has media files
aws s3 ls s3://auth.wecare.digital/whatsapp-media/ --recursive

# Check bucket permissions
aws s3api get-bucket-policy --bucket auth.wecare.digital
```

**Issue 4: CloudWatch Logs Show Errors**
```bash
# Check logs for errors
aws logs tail /aws/lambda/wecare-messages-read --follow

# Look for:
# - presigned_url_generation_failed
# - no_s3_object_found
# - permission denied errors
```

---

## 📊 DEPLOYMENT TIMELINE

| Step | Command | Time | Status |
|---|---|---|---|
| 1 | `amplify push --only functions/messages-read --yes` | 2-5 min | ⏳ Ready |
| 2 | `amplify push --only hosting --yes` | 2-5 min | ⏳ Ready |
| 3 | `node temp/send-test-media.js` | 1 min | ⏳ Ready |
| 4 | Verify in dashboard | 1 min | ⏳ Ready |

**Total Time:** ~10-15 minutes

---

## 📝 WHAT WAS CHANGED

### Frontend Changes
**File:** `src/pages/dm/whatsapp/index.tsx`
- Added media type detection
- Implemented conditional rendering for all media types
- Added error handling with console logging

### CSS Changes
**File:** `src/pages/Pages-improved.css`
- Added `.message-media-container` styling
- Added `.message-image`, `.message-video`, `.message-audio` styling
- Added `.message-document` styling with download link

### Backend Changes
**File:** `amplify/functions/messages-read/handler.py`
- Enhanced `_convert_from_dynamodb()` function
- Added detailed logging for media URL generation
- Added error tracking and debugging info

---

## 🔄 ROLLBACK PLAN

If issues occur after deployment:

```bash
# Revert to previous commit
git revert 464b8ce

# Redeploy
amplify push --only functions/messages-read --yes
amplify push --only hosting --yes
```

---

## 📚 DOCUMENTATION

For more information, see:
- `MEDIA_DISPLAY_FIX.md` - Technical implementation details
- `MEDIA_DISPLAY_DEPLOYMENT_GUIDE.md` - Detailed deployment guide
- `DEPLOYMENT_STATUS_REPORT.md` - Current deployment status
- `QUICK_REFERENCE_GUIDE.md` - Quick reference for developers

---

## ✨ SUMMARY

**Status: ✅ READY FOR DEPLOYMENT**

All code changes are complete, tested, and committed. Follow the deployment commands above to enable media display for all types (images, videos, audio, documents) in the WhatsApp dashboard.

### Quick Start
```bash
# Deploy Lambda
amplify push --only functions/messages-read --yes

# Deploy Frontend
amplify push --only hosting --yes

# Test
node temp/send-test-media.js
```

---

## 🎯 SUCCESS CRITERIA

After deployment, you should see:

✅ Images display inline in messages  
✅ Videos display with play controls  
✅ Audio displays with play controls  
✅ Documents display as download links  
✅ Sender names display for inbound messages  
✅ CloudWatch logs show URL generation  
✅ No errors in browser console  
✅ No errors in Lambda logs  

---

## 📞 SUPPORT

If you encounter any issues:

1. Check CloudWatch logs: `aws logs tail /aws/lambda/wecare-messages-read --follow`
2. Verify S3 bucket: `aws s3 ls s3://auth.wecare.digital/whatsapp-media/`
3. Check Lambda status: `aws lambda get-function --function-name wecare-messages-read`
4. Review error messages in logs
5. Refer to troubleshooting section above

