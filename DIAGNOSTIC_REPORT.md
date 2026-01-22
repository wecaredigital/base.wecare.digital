# Diagnostic Report: Incoming Messages & PDF Issues

## Issue 1: Incoming Messages Not Showing in Inbox

### Root Cause Analysis

**Frontend Flow:**
1. `src/pages/dm/whatsapp/index.tsx` calls `api.listMessages(undefined, 'WHATSAPP')`
2. API client normalizes messages via `normalizeMessage()` function
3. Frontend filters messages by `selectedContact.id` matching `message.contactId`

**Backend Flow:**
1. `amplify/functions/core/messages-read/handler.py` scans Message table
2. Returns messages with proper normalization (Decimal → int/float conversion)
3. Generates pre-signed URLs for media files

**Identified Issues:**

1. **Message Table Scan Issue** - The `_scan_messages()` function in messages-read handler:
   - Uses `table.scan()` with optional FilterExpression
   - May not be returning inbound messages if filter is too restrictive
   - No explicit check for `direction = 'INBOUND'` when filtering

2. **Frontend Filtering Logic** - In `src/pages/dm/whatsapp/index.tsx`:
   - Line ~150: `filteredMessages = messages.filter(m => selectedContact && m.contactId === selectedContact.id)`
   - This assumes `m.contactId` matches contact ID
   - **PROBLEM**: Inbound messages may have different contactId structure

3. **Contact ID Mismatch** - Potential issue:
   - Inbound handler creates contacts with `contactId = str(uuid.uuid4())`
   - Frontend expects `contact.id` to match `message.contactId`
   - If contact lookup returns different ID field, filtering fails

4. **Message Normalization** - In `src/api/client.ts`:
   - `normalizeMessage()` converts `item.messageId || item.id` to `messageId`
   - But `contactId` field may not be normalized properly
   - If backend returns different field name, frontend won't find it

### Verification Steps Needed

1. Check DynamoDB Message table:
   - Verify inbound messages exist with correct `contactId`
   - Check if `direction` field is set to 'inbound' or 'INBOUND'

2. Check API response:
   - Verify `listMessages()` returns inbound messages
   - Check if `contactId` field is present in response

3. Check frontend filtering:
   - Verify `selectedContact.id` matches message `contactId`
   - Check browser console for filtering logic

---

## Issue 2: PDF Files Not Being Sent Due to Filename Error

### Root Cause Analysis

**Frontend Flow:**
1. `src/pages/dm/whatsapp/index.tsx` line ~280: `handleSend()` function
2. Captures filename: `mediaFileName = mediaFile.name`
3. Passes to API: `mediaFileName: mediaFileName`

**Backend Flow:**
1. `amplify/functions/messaging/outbound-whatsapp/handler.py` receives `mediaFileName`
2. Calls `_upload_media()` with filename parameter
3. Sanitizes filename via `_sanitize_filename()` function
4. Adds to WhatsApp payload for documents

**Identified Issues:**

1. **Filename Sanitization** - `_sanitize_filename()` function (line ~650):
   - Removes special characters: `re.sub(r'[^\w\s.-]', '', filename)`
   - This removes: `!@#$%^&*()+=[]{}|;:',<>?/\`
   - **PROBLEM**: May remove characters that are valid in filenames
   - **PROBLEM**: Regex `\w` includes underscore but may not handle unicode properly

2. **Filename Validation** - No validation before sanitization:
   - Frontend doesn't validate filename before sending
   - Backend sanitizes but doesn't validate result
   - If sanitization results in empty string, document send fails

3. **WhatsApp API Limits** - Per WhatsApp docs:
   - Filename max: 240 characters
   - Valid characters: alphanumeric, dots, hyphens, underscores, spaces
   - **PROBLEM**: Sanitization may be too aggressive

4. **Error Handling** - No specific error message for filename issues:
   - If filename sanitization fails, generic "Failed to send" error
   - User doesn't know it's a filename problem
   - No logging of original vs sanitized filename

5. **Base64 Encoding Issue** - Potential problem:
   - Frontend converts file to base64: `reader.readAsDataURL(mediaFile)`
   - Backend decodes: `base64.b64decode(media_file)`
   - **PROBLEM**: If filename contains special chars, encoding may fail

### Verification Steps Needed

1. Check error logs:
   - Look for "media_upload_error" or "filename_sanitized" logs
   - Check what filename is being sent vs sanitized

2. Test filename sanitization:
   - Test with PDF names: "Invoice-2026-01.pdf", "Report (Final).pdf", "Document_v2.pdf"
   - Check if sanitization removes valid characters

3. Check WhatsApp API response:
   - Verify API returns specific error for invalid filename
   - Check if media registration fails due to filename

---

## Recommended Fixes

### Fix 1: Incoming Messages Display

**Option A: Debug Message Filtering**
```python
# In messages-read handler, add logging:
logger.info(json.dumps({
    'event': 'messages_scan_debug',
    'totalItems': len(items),
    'sampleContactIds': [item.get('contactId') for item in items[:3]],
    'sampleDirections': [item.get('direction') for item in items[:3]]
}))
```

**Option B: Ensure Proper Contact ID Mapping**
- Verify inbound handler stores `contactId` correctly
- Verify frontend contact list has matching IDs

### Fix 2: PDF Filename Handling

**Option A: Improve Filename Sanitization**
```python
def _sanitize_filename(filename: str, max_length: int = 240) -> str:
    # Keep alphanumeric, dots, hyphens, underscores, spaces
    # Don't remove valid characters
    sanitized = re.sub(r'[^\w\s.\-]', '', filename, flags=re.UNICODE)
    # ... rest of logic
```

**Option B: Add Filename Validation**
```python
# Frontend validation before sending
if (mediaFile) {
    const validChars = /^[a-zA-Z0-9\s._\-()]+$/;
    if (!validChars.test(mediaFile.name)) {
        toast.error('Filename contains invalid characters');
        return;
    }
}
```

**Option C: Better Error Messages**
- Log original filename, sanitized filename, and error
- Return specific error: "Invalid filename format"
- Show user which characters are invalid

---

## Summary

**Incoming Messages Issue:**
- Likely cause: Contact ID mismatch or message filtering logic
- Need to verify: DynamoDB data, API response, frontend filtering

**PDF Filename Issue:**
- Likely cause: Filename sanitization too aggressive or special characters
- Need to verify: Error logs, filename validation, WhatsApp API response

**Next Steps:**
1. Check CloudWatch logs for both Lambda functions
2. Verify DynamoDB Message table has inbound messages
3. Test PDF sending with simple filenames first
4. Add detailed logging to track message flow
