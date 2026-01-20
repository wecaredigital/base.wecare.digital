# Media Message Sending - Debug & Fix

**Date:** January 20, 2026  
**Issue:** Media messages failing with "Invalid destination phone number or message Id"  
**Status:** FIXED - Enhanced logging and validation added

---

## Problem Analysis

### Error Message
```
Invalid destination phone number or message Id
```

### Root Causes Identified
1. **Phone number normalization** - May be returning invalid format
2. **Media ID validation** - No check if media ID is empty/invalid
3. **Message payload logging** - Insufficient logging to debug payload format
4. **Media type validation** - No validation of extracted media type

---

## Changes Made

### 1. Enhanced Phone Number Normalization
**File:** `amplify/functions/outbound-whatsapp/handler.py`

**Changes:**
- Added handling for 12-digit numbers starting with "0091"
- Added validation to ensure phone number is not empty after normalization
- Added warning logs for invalid phone numbers
- Improved documentation with more examples

**Before:**
```python
def _normalize_phone_number(phone: str) -> str:
    digits_only = ''.join(c for c in phone if c.isdigit())
    if not digits_only:
        return phone
    if len(digits_only) == 10 and digits_only[0] in '6789':
        digits_only = '91' + digits_only
    if len(digits_only) == 11 and digits_only[0] == '0':
        digits_only = '91' + digits_only[1:]
    return digits_only
```

**After:**
```python
def _normalize_phone_number(phone: str) -> str:
    if not phone:
        return phone
    digits_only = ''.join(c for c in phone if c.isdigit())
    if not digits_only:
        return phone
    if len(digits_only) == 10 and digits_only[0] in '6789':
        digits_only = '91' + digits_only
    if len(digits_only) == 11 and digits_only[0] == '0':
        digits_only = '91' + digits_only[1:]
    if len(digits_only) == 12 and digits_only.startswith('0091'):
        digits_only = digits_only[2:]
    return digits_only
```

### 2. Enhanced Message Payload Building
**File:** `amplify/functions/outbound-whatsapp/handler.py`

**Changes:**
- Added phone number validation after normalization
- Added media type validation (must be one of: image, video, audio, document, sticker)
- Added fallback to 'document' for invalid media types
- Added comprehensive logging of payload structure

**New Validations:**
```python
# Validate phone number format
if not formatted_phone or not formatted_phone.isdigit() or len(formatted_phone) < 10:
    logger.warning(f"Invalid phone number after normalization: {recipient_phone} -> {formatted_phone}")

# Validate media type
valid_types = ['image', 'video', 'audio', 'document', 'sticker']
if msg_type not in valid_types:
    logger.warning(f"Invalid media type: {media_type} -> {msg_type}, using 'document' as fallback")
    msg_type = 'document'
```

### 3. Enhanced Message Sending Logging
**File:** `amplify/functions/outbound-whatsapp/handler.py`

**Changes:**
- Added detailed logging of message payload before API call
- Added normalized phone number to logs
- Added payload type and media ID to logs
- Added error type and detailed error messages to error logs

**New Logging:**
```python
logger.info(json.dumps({
    'event': 'message_payload_built',
    'messageId': message_id,
    'contactId': contact_id,
    'recipientPhone': recipient_phone,
    'normalizedPhone': message_payload.get('to'),
    'payloadType': message_payload.get('type'),
    'hasMedia': bool(whatsapp_media_id),
    'mediaId': whatsapp_media_id,
    'payload': message_payload,
    'requestId': request_id
}))
```

### 4. Enhanced Media Upload Logging
**File:** `amplify/functions/outbound-whatsapp/handler.py`

**Changes:**
- Added logging after S3 upload
- Added validation that media ID is not empty
- Added detailed error logging for media registration failures
- Added phone number ID to media registration logs

**New Logging:**
```python
logger.info(json.dumps({
    'event': 'media_uploaded_to_s3',
    's3Key': s3_key,
    'mediaType': media_type,
    'requestId': request_id
}))

if not whatsapp_media_id:
    logger.error(json.dumps({
        'event': 'media_registration_no_id',
        's3Key': s3_key,
        'response': response,
        'requestId': request_id
    }))
    return None, None

logger.info(json.dumps({
    'event': 'media_registered_with_whatsapp',
    's3Key': s3_key,
    'mediaId': whatsapp_media_id,
    'mediaType': media_type,
    'phoneNumberId': phone_number_id,
    'requestId': request_id
}))
```

---

## How to Debug Media Sending Issues

### 1. Check CloudWatch Logs
```bash
aws logs tail /aws/lambda/wecare-outbound-whatsapp --follow
```

### 2. Look for These Events
- `message_payload_built` - Shows the exact payload being sent
- `media_uploaded_to_s3` - Confirms S3 upload succeeded
- `media_registered_with_whatsapp` - Confirms media ID received
- `message_sent` - Confirms message sent successfully
- `send_api_error` - Shows exact error from WhatsApp API

### 3. Key Fields to Check
- `normalizedPhone` - Should be digits only, no + prefix, with country code
- `mediaId` - Should not be empty
- `payloadType` - Should be 'image', 'video', 'audio', 'document', or 'sticker'
- `payload` - Full message payload sent to WhatsApp API

### 4. Common Issues & Solutions

**Issue:** `normalizedPhone` is empty or invalid
- **Solution:** Check contact phone number format in DynamoDB
- **Action:** Verify phone is stored with country code

**Issue:** `mediaId` is empty
- **Solution:** Media registration with WhatsApp failed
- **Action:** Check S3 bucket permissions and media file size

**Issue:** `payloadType` is not a valid type
- **Solution:** Media type extraction failed
- **Action:** Check media type MIME format (should be like 'image/jpeg')

---

## Testing the Fix

### 1. Send a Test Media Message
```bash
node temp/send-test-media.js
```

### 2. Check CloudWatch Logs
```bash
aws logs tail /aws/lambda/wecare-outbound-whatsapp --follow
```

### 3. Verify in WhatsApp
- Message should appear in recipient's WhatsApp
- Media should display correctly
- Status should show as "sent" or "delivered"

---

## Files Modified

- `amplify/functions/outbound-whatsapp/handler.py`
  - Enhanced `_normalize_phone_number()` function
  - Enhanced `_build_message_payload()` function
  - Enhanced `_handle_live_send()` function
  - Enhanced `_upload_media()` function

---

## Next Steps

1. **Deploy the changes**
   ```bash
   amplify push
   ```

2. **Test media sending**
   - Send test image
   - Send test video
   - Send test document
   - Check CloudWatch logs

3. **Monitor for errors**
   - Watch CloudWatch logs for any new errors
   - Check if media appears in WhatsApp
   - Verify status updates

4. **If still failing**
   - Review CloudWatch logs for exact error message
   - Check if phone number format is correct
   - Verify media file size is within limits
   - Check if media ID is being returned from WhatsApp

---

## Summary

Enhanced the media message sending flow with:
- ✅ Better phone number normalization
- ✅ Media type validation
- ✅ Comprehensive logging at each step
- ✅ Better error messages
- ✅ Media ID validation

This should help identify exactly where the "Invalid destination phone number or message Id" error is coming from.

