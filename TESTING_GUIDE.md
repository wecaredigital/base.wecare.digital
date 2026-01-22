# Testing Guide: Incoming Messages & PDF Fixes

## Issue 1: Incoming Messages Not Showing in Inbox

### What Was Fixed
1. Added detailed logging to `_scan_messages()` to show sample items from DynamoDB
2. Improved frontend filtering with debug logging to identify contactId mismatches
3. Better error handling for message normalization

### How to Test

#### Step 1: Send a Test Message
1. Open WhatsApp on your phone
2. Send a message to the WECARE.DIGITAL number (+91 93309 94400)
3. Wait 5-10 seconds for the message to be processed

#### Step 2: Check CloudWatch Logs
1. Go to AWS CloudWatch → Log Groups
2. Find: `/aws/lambda/inbound-whatsapp-handler`
3. Look for recent logs with:
   - `"event": "message_stored"` - confirms message was received
   - `"senderPhone"` - should match your phone number
   - `"contactId"` - note this ID

#### Step 3: Check DynamoDB
1. Go to AWS DynamoDB → Tables
2. Open `Message` table
3. Query by `contactId` (from step 2)
4. Verify:
   - `direction` = "inbound"
   - `channel` = "whatsapp"
   - `content` = your message text
   - `senderPhone` = your phone number

#### Step 4: Check Frontend
1. Open the admin dashboard
2. Go to WhatsApp Inbox
3. Look for your contact in the left sidebar
4. Click on the contact
5. Check browser console (F12 → Console tab)
6. Look for debug logs showing:
   - `messageContactId` should match `selectedContactId`
   - If they don't match, you'll see the mismatch logged

#### Step 5: Verify Message Display
1. If message appears in chat area, issue is fixed ✓
2. If message doesn't appear:
   - Check console for filtering errors
   - Verify contactId in DynamoDB matches frontend contact ID
   - Check if `direction` is "inbound" or "INBOUND"

### Debugging Checklist
- [ ] Message appears in CloudWatch logs with correct contactId
- [ ] Message exists in DynamoDB Message table
- [ ] Contact exists in DynamoDB Contact table
- [ ] Contact ID in message matches contact ID in frontend
- [ ] Message direction is "inbound" or "INBOUND"
- [ ] Message appears in frontend chat area

---

## Issue 2: PDF Files Not Being Sent Due to Filename Error

### What Was Fixed
1. Improved filename sanitization to preserve common characters: `()` parentheses
2. Added logging to show original vs sanitized filename
3. Added frontend validation to warn about invalid characters before sending
4. Better error messages when filename sanitization fails

### How to Test

#### Test Case 1: Simple PDF (Should Work)
1. Create a file: `invoice.pdf`
2. Upload via WhatsApp inbox
3. Check:
   - Message sends successfully
   - CloudWatch shows: `"event": "media_uploaded_to_s3"`
   - File appears in S3 bucket

#### Test Case 2: PDF with Spaces (Should Work Now)
1. Create a file: `Invoice 2026 01.pdf`
2. Upload via WhatsApp inbox
3. Check:
   - Frontend shows warning about spaces (but allows it)
   - Message sends successfully
   - CloudWatch shows filename sanitization: `"original": "Invoice 2026 01.pdf", "sanitized": "Invoice 2026 01.pdf"`

#### Test Case 3: PDF with Parentheses (Should Work Now)
1. Create a file: `Report (Final).pdf`
2. Upload via WhatsApp inbox
3. Check:
   - Frontend shows warning about parentheses (but allows it)
   - Message sends successfully
   - CloudWatch shows: `"original": "Report (Final).pdf", "sanitized": "Report (Final).pdf"`

#### Test Case 4: PDF with Special Characters (Should Sanitize)
1. Create a file: `Invoice@2026#Final!.pdf`
2. Upload via WhatsApp inbox
3. Check:
   - Frontend shows error: "Filename contains invalid characters: @, #, !"
   - Message still sends (characters are removed)
   - CloudWatch shows: `"original": "Invoice@2026#Final!.pdf", "sanitized": "Invoice2026Final.pdf"`

#### Test Case 5: Very Long Filename (Should Truncate)
1. Create a file: `This_is_a_very_long_filename_that_exceeds_the_maximum_length_allowed_by_whatsapp_and_should_be_truncated_to_fit_within_the_240_character_limit_while_preserving_the_file_extension_and_readability_of_the_document_name_for_the_recipient.pdf`
2. Upload via WhatsApp inbox
3. Check:
   - Message sends successfully
   - CloudWatch shows: `"length": 240` (exactly 240 chars)
   - File extension `.pdf` is preserved

### CloudWatch Log Inspection

#### For Successful Upload
Look for logs in `/aws/lambda/outbound-whatsapp`:
```json
{
  "event": "filename_sanitized",
  "original": "Report (Final).pdf",
  "sanitized": "Report (Final).pdf",
  "length": 18,
  "changed": false
}
```

#### For Sanitized Upload
```json
{
  "event": "filename_sanitized",
  "original": "Invoice@2026#Final!.pdf",
  "sanitized": "Invoice2026Final.pdf",
  "length": 20,
  "changed": true
}
```

#### For Media Upload Success
```json
{
  "event": "media_uploaded_to_s3",
  "s3Key": "media/Report (Final).pdf",
  "mediaType": "application/pdf",
  "filename": "Report (Final).pdf"
}
```

#### For Media Registration Success
```json
{
  "event": "media_registered_with_whatsapp",
  "s3Key": "media/Report (Final).pdf",
  "mediaId": "wamid.xxx",
  "mediaType": "application/pdf",
  "filename": "Report (Final).pdf"
}
```

### Debugging Checklist
- [ ] Frontend shows filename validation warning for special chars
- [ ] Message sends successfully despite warning
- [ ] CloudWatch shows `filename_sanitized` event
- [ ] CloudWatch shows `media_uploaded_to_s3` event
- [ ] CloudWatch shows `media_registered_with_whatsapp` event
- [ ] File appears in S3 bucket with correct name
- [ ] Recipient receives PDF with correct filename

---

## End-to-End Test Scenario

### Complete Flow Test
1. **Send Inbound Message**
   - Send text message from WhatsApp to WECARE.DIGITAL
   - Verify it appears in inbox within 10 seconds

2. **Send PDF Response**
   - Click on the contact
   - Click attach button (📎)
   - Select a PDF file with spaces/parentheses in name
   - Type a message
   - Click send
   - Verify message sends successfully

3. **Verify Both Directions**
   - Inbound message appears in chat
   - Outbound PDF message appears in chat
   - Both show correct timestamps and status

### Success Criteria
- ✓ Inbound messages appear in inbox
- ✓ Inbound messages show sender name
- ✓ PDF files send successfully
- ✓ PDF filenames are preserved (or sanitized appropriately)
- ✓ No error messages in console
- ✓ CloudWatch logs show successful processing

---

## Rollback Plan

If issues occur after deployment:

### Rollback Incoming Messages Fix
```bash
# Revert messages-read handler to previous version
git checkout HEAD~1 amplify/functions/core/messages-read/handler.py
npm run amplify:deploy
```

### Rollback PDF Filename Fix
```bash
# Revert outbound-whatsapp handler to previous version
git checkout HEAD~1 amplify/functions/messaging/outbound-whatsapp/handler.py
npm run amplify:deploy
```

### Rollback Frontend Changes
```bash
# Revert WhatsApp page to previous version
git checkout HEAD~1 src/pages/dm/whatsapp/index.tsx
npm run build
npm run amplify:deploy
```

---

## Performance Impact

### Expected Impact
- **Incoming Messages**: +5-10ms per message (additional logging)
- **PDF Upload**: +2-5ms per file (filename sanitization)
- **Frontend**: No noticeable impact (debug logging only)

### Monitoring
- Watch CloudWatch metrics for Lambda duration
- Monitor S3 upload success rate
- Track message processing latency

---

## Known Limitations

1. **Filename Sanitization**
   - Removes: `@#$%^&*+=[]{}|;:',<>?/\`
   - Preserves: alphanumeric, dots, hyphens, underscores, spaces, parentheses
   - Max length: 240 characters

2. **Message Filtering**
   - Requires exact contactId match
   - Case-sensitive
   - No fuzzy matching

3. **Media Upload**
   - Max file sizes per WhatsApp:
     - Images: 5MB
     - Videos: 16MB
     - Audio: 16MB
     - Documents: 100MB
     - Stickers: 500KB

---

## Support

If issues persist:
1. Check CloudWatch logs for specific error messages
2. Verify DynamoDB table structure and data
3. Check S3 bucket permissions
4. Verify WhatsApp API credentials
5. Contact AWS support for API issues
