# Media Message Sending - Debug Guide & Next Steps

**Date:** January 20, 2026  
**Status:** Enhanced logging deployed - Ready for testing  
**Commit:** `0199ddc` - Enhanced media message sending with better logging and validation

---

## What Was Fixed

### 1. Phone Number Normalization
- Added handling for 12-digit numbers starting with "0091"
- Added null/empty checks
- Added validation warnings for invalid formats
- Now handles: +91, 91, 0091, 10-digit Indian, 11-digit with leading 0

### 2. Media Type Validation
- Validates extracted media type is one of: image, video, audio, document, sticker
- Falls back to 'document' for invalid types
- Logs warnings for unexpected media types

### 3. Comprehensive Logging
- Logs full message payload before sending to WhatsApp API
- Logs normalized phone number
- Logs media ID after registration
- Logs each step: S3 upload → media registration → message send

### 4. Media ID Validation
- Checks if media ID is empty after registration
- Logs error if media registration returns no ID
- Prevents sending messages with invalid media IDs

---

## How to Test the Fix

### Step 1: Deploy Changes
```bash
amplify push
```

### Step 2: Send Test Media Message
```bash
node temp/send-test-media.js
```

### Step 3: Monitor CloudWatch Logs
```bash
aws logs tail /aws/lambda/wecare-outbound-whatsapp --follow
```

### Step 4: Look for These Log Events (in order)

**Event 1: Media Upload to S3**
```json
{
  "event": "media_uploaded_to_s3",
  "s3Key": "whatsapp-media/whatsapp-media-outgoing/...",
  "mediaType": "image/jpeg",
  "requestId": "..."
}
```

**Event 2: Media Registration with WhatsApp**
```json
{
  "event": "media_registered_with_whatsapp",
  "s3Key": "whatsapp-media/whatsapp-media-outgoing/...",
  "mediaId": "abc123xyz...",
  "mediaType": "image/jpeg",
  "phoneNumberId": "phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54",
  "requestId": "..."
}
```

**Event 3: Message Payload Built**
```json
{
  "event": "message_payload_built",
  "messageId": "...",
  "contactId": "...",
  "recipientPhone": "+919876543210",
  "normalizedPhone": "919876543210",
  "payloadType": "image",
  "hasMedia": true,
  "mediaId": "abc123xyz...",
  "payload": {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "919876543210",
    "type": "image",
    "image": {
      "id": "abc123xyz...",
      "caption": "Test media message"
    }
  },
  "requestId": "..."
}
```

**Event 4: Message Sent Successfully**
```json
{
  "event": "message_sent",
  "messageId": "...",
  "whatsappMessageId": "wamid.HBgL...",
  "contactId": "...",
  "isTemplate": false,
  "hasMedia": true,
  "requestId": "..."
}
```

### Step 5: Verify in WhatsApp
- Check recipient's WhatsApp
- Media should appear within seconds
- Status should show as "sent" or "delivered"

---

## Troubleshooting Guide

### Issue 1: "Invalid destination phone number"

**Check in logs:**
```
"normalizedPhone": "919876543210"
```

**Solutions:**
1. Verify phone number in DynamoDB has country code
2. Check if phone number is stored with + prefix (should be removed)
3. Verify phone number is not empty or null
4. Check if phone number has correct length (10-15 digits)

**Example valid formats:**
- `919876543210` (India)
- `447447840003` (UK)
- `12125551234` (USA)

### Issue 2: "Invalid message Id" (media ID issue)

**Check in logs:**
```
"mediaId": "abc123xyz..."
```

**Solutions:**
1. Verify media ID is not empty
2. Check if media registration succeeded (look for `media_registered_with_whatsapp` event)
3. Verify S3 file exists and is readable
4. Check S3 bucket permissions

**If media registration failed:**
- Check S3 bucket name is correct
- Check S3 key is correct
- Verify Lambda has S3 permissions
- Check file size is within limits

### Issue 3: Media Type Not Recognized

**Check in logs:**
```
"payloadType": "image"
```

**Solutions:**
1. Verify media type is one of: image, video, audio, document, sticker
2. Check MIME type format (should be like 'image/jpeg', not just 'image')
3. If invalid, should fallback to 'document'

**Valid MIME types:**
- Images: `image/jpeg`, `image/png`
- Videos: `video/mp4`, `video/3gp`
- Audio: `audio/aac`, `audio/amr`, `audio/mpeg`, `audio/mp4`, `audio/ogg`
- Documents: `application/pdf`, `application/msword`, etc.

### Issue 4: S3 Upload Failed

**Check in logs:**
```
"event": "media_uploaded_to_s3"
```

**Solutions:**
1. Verify S3 bucket exists: `auth.wecare.digital`
2. Check Lambda has S3 permissions
3. Verify file size is within limits
4. Check S3 bucket is in correct region (us-east-1)

---

## Expected Behavior After Fix

### Text Messages (Already Working)
✅ Send successfully  
✅ Appear in WhatsApp  
✅ Status updates work  

### Media Messages (Should Now Work)
✅ Media uploads to S3  
✅ Media registers with WhatsApp  
✅ Message sends with media ID  
✅ Media appears in WhatsApp  
✅ Status updates work  

---

## Log Analysis Checklist

When debugging media sending issues, check these in order:

- [ ] Is `media_uploaded_to_s3` event present?
  - If no: S3 upload failed
  - If yes: Continue to next check

- [ ] Is `media_registered_with_whatsapp` event present?
  - If no: Media registration failed
  - If yes: Continue to next check

- [ ] Is `mediaId` not empty in registration event?
  - If empty: WhatsApp didn't return media ID
  - If present: Continue to next check

- [ ] Is `message_payload_built` event present?
  - If no: Payload building failed
  - If yes: Continue to next check

- [ ] Is `normalizedPhone` in correct format?
  - If invalid: Phone number normalization failed
  - If valid: Continue to next check

- [ ] Is `payloadType` one of valid types?
  - If invalid: Media type extraction failed
  - If valid: Continue to next check

- [ ] Is `message_sent` event present?
  - If no: API call failed (check error logs)
  - If yes: Message sent successfully!

---

## Files Modified

- `amplify/functions/outbound-whatsapp/handler.py`
  - `_normalize_phone_number()` - Enhanced with 12-digit handling
  - `_build_message_payload()` - Added validation and logging
  - `_handle_live_send()` - Enhanced error logging
  - `_upload_media()` - Added media ID validation

- `MEDIA_SENDING_FIX.md` - Detailed fix documentation
- `MEDIA_SENDING_DEBUG_GUIDE.md` - This file

---

## Next Steps

1. **Deploy the changes**
   ```bash
   amplify push
   ```

2. **Test with different media types**
   - Image (JPEG, PNG)
   - Video (MP4)
   - Audio (MP3, OGG)
   - Document (PDF)

3. **Test with different phone numbers**
   - Indian numbers (10-digit, 11-digit with 0, with country code)
   - International numbers (UK, USA, etc.)

4. **Monitor CloudWatch logs**
   - Watch for any new error patterns
   - Verify all log events appear in correct order

5. **If still failing**
   - Share CloudWatch logs with AWS support
   - Include the full `message_payload_built` event
   - Include the error message from `send_api_error` event

---

## Quick Reference

### CloudWatch Log Query
```bash
# View all media-related events
aws logs filter-log-events \
  --log-group-name /aws/lambda/wecare-outbound-whatsapp \
  --filter-pattern "media_" \
  --start-time $(date -d '1 hour ago' +%s)000

# View all errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/wecare-outbound-whatsapp \
  --filter-pattern "error" \
  --start-time $(date -d '1 hour ago' +%s)000
```

### Test Media Sending
```bash
# Send test image
node temp/send-test-media.js

# Check logs
aws logs tail /aws/lambda/wecare-outbound-whatsapp --follow
```

---

**Status:** ✅ Ready for testing  
**Commit:** `0199ddc`  
**Branch:** `base`

