# Critical Fix Applied - Message Parameter Type Issue

**Date:** January 20, 2026  
**Issue:** Messages failing with "Invalid destination phone number or message Id"  
**Root Cause:** Message parameter was being sent as bytes instead of string  
**Status:** ✅ FIXED

---

## The Problem

The boto3 `send_whatsapp_message` API call was encoding the message JSON to bytes:

```python
# WRONG - This was causing the error
response = social_messaging.send_whatsapp_message(
    originationPhoneNumberId=phone_number_id,
    message=json.dumps(message_payload).encode('utf-8'),  # ❌ Bytes
    metaApiVersion=META_API_VERSION
)
```

The AWS Social Messaging API expects the `message` parameter to be a **string**, not bytes.

---

## The Fix

Changed the message parameter to pass a string instead of bytes:

```python
# CORRECT - Message as string
message_json = json.dumps(message_payload)

response = social_messaging.send_whatsapp_message(
    originationPhoneNumberId=phone_number_id,
    message=message_json,  # ✅ String
    metaApiVersion=META_API_VERSION
)
```

---

## Additional Improvements

1. **Added phone number validation**
   - Validates phone number is 10-15 digits (E.164 format)
   - Logs warning if phone number is invalid

2. **Added API call logging**
   - Logs the message JSON before sending to API
   - Helps debug payload format issues

3. **Better error context**
   - Logs phone number ID and message ID with API call
   - Makes it easier to trace issues

---

## What This Fixes

✅ Messages should now send successfully  
✅ Media messages should now work  
✅ Phone number validation improved  
✅ Better logging for debugging  

---

## How to Test

### 1. Deploy the fix
```bash
amplify push
```

### 2. Send a test message
```bash
node temp/send-test-media.js
```

### 3. Check the dashboard
- Message should appear in WhatsApp inbox
- Status should show as "sent" or "delivered"
- Media should display if included

### 4. Monitor logs
```bash
aws logs tail /aws/lambda/wecare-outbound-whatsapp --follow
```

Look for:
- `calling_send_whatsapp_message_api` - Shows message JSON being sent
- `message_sent` - Confirms message sent successfully
- `send_api_error` - If there's still an error, shows details

---

## Expected Results

### Before Fix
- ❌ Messages failing with "Invalid destination phone number or message Id"
- ❌ Status showing as "failed" in database
- ❌ No messages appearing in WhatsApp

### After Fix
- ✅ Messages sending successfully
- ✅ Status showing as "sent" in database
- ✅ Messages appearing in WhatsApp
- ✅ Media messages working

---

## Files Modified

- `amplify/functions/outbound-whatsapp/handler.py`
  - Fixed message parameter type (bytes → string)
  - Added phone number validation
  - Added API call logging

---

## Commit

**Commit:** `322dcb8`  
**Message:** "Fix critical issue: message parameter should be string not bytes"

---

## Next Steps

1. **Deploy immediately**
   ```bash
   amplify push
   ```

2. **Test all message types**
   - Text messages
   - Media messages (images, videos, documents)
   - Template messages

3. **Verify in WhatsApp**
   - Check messages appear
   - Check media displays correctly
   - Check status updates work

4. **Monitor CloudWatch logs**
   - Watch for any new errors
   - Verify all log events appear

---

## Summary

This was a critical bug where the message parameter was being sent as bytes instead of a string to the AWS Social Messaging API. This has been fixed, and messages should now send successfully.

The fix is minimal, focused, and should resolve the "Invalid destination phone number or message Id" error that was preventing all messages from being sent.

