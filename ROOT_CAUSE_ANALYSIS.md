# Root Cause Analysis: Deployment & Incoming Messages Issues

## Executive Summary

**Two Critical Issues Identified:**

1. **Deployment Failure**: `npm ci` fails due to incomplete `package-lock.json`
2. **Incoming Messages Not Showing**: Contact ID mismatch between inbound handler and frontend

---

## Issue 1: Deployment Failure - npm ci Rejection

### The Problem

```
❌ npm ci fails with:
   Missing: json-schema-to-ts@3.1.1 from lock file
   Missing: ts-algebra@2.0.0 from lock file
   Missing: @aws-sdk/eventstream-handler-node@3.821.0 from lock file
   Missing: @smithy/* packages from lock file
```

### Root Cause (Deep Analysis)

Your `package-lock.json` is **incomplete and out of sync** with `package.json`.

**Why this happens:**

1. **Amplify Gen2 Dependencies** pull in massive AWS SDK v3 + Smithy dependency trees:
   ```
   @aws-amplify/backend-cli
   ├── @aws-sdk/client-*
   ├── @smithy/types
   ├── @smithy/util-*
   ├── json-schema-to-ts
   ├── ts-algebra
   └── ... 100+ transitive dependencies
   ```

2. **Lock File Corruption** - Your lock file references these packages but doesn't have their full entries:
   ```json
   // Lock file has reference to json-schema-to-ts
   "node_modules/json-schema-to-ts": {
     "version": "3.1.1",
     "resolved": "..."
   }
   
   // BUT missing the actual package definition
   // So npm ci says: "Missing from lock file"
   ```

3. **How It Got Broken:**
   - Lock file was likely created with `npm install --omit=dev` (dev deps missing)
   - Or generated with different npm version/OS
   - Or partially edited/merged incorrectly
   - Or committed before full resolution completed

### Why npm install Works But npm ci Fails

```
✅ npm install (permissive):
   - Reads package.json
   - Tries to use lock file
   - If lock is incomplete → FIXES IT
   - Installs missing packages anyway
   - Updates lock file
   - ✅ Succeeds (but lock still broken)

❌ npm ci (strict):
   - Reads package.json
   - Reads lock file
   - Requires 100% match
   - If anything missing → FAILS IMMEDIATELY
   - Does NOT fix lock file
   - ❌ Fails (correct behavior for CI)
```

### Why Amplify Deployment Fails

Amplify build process uses `npm ci` (correct for CI/CD):
```bash
# Amplify build command
npm ci  # ← Fails because lock is incomplete
npm run build  # ← Never reaches here
```

---

## Issue 2: Incoming Messages Not Showing in Inbox

### The Problem

**User Reports:**
- Send WhatsApp message to WECARE.DIGITAL
- Message doesn't appear in admin dashboard inbox
- But message is being received (logs show it)

### Root Cause (Deep Analysis)

**Contact ID Mismatch** between inbound handler and frontend:

#### Backend Flow (Inbound Handler)

```python
# amplify/functions/messaging/inbound-whatsapp-handler/handler.py

def _get_or_create_contact(phone: str, sender_name: str = '') -> Dict:
    """Get existing contact or create new one."""
    
    # Lookup by phone
    response = contacts_table.scan(
        FilterExpression='phone = :phone AND (attribute_not_exists(deletedAt) OR deletedAt = :null)',
        ExpressionAttributeValues={':phone': phone, ':null': None},
        Limit=1
    )
    
    items = response.get('Items', [])
    if items:
        contact = items[0]
        return contact  # ← Returns existing contact
    
    # Create new contact
    contact_id = str(uuid.uuid4())
    contact = {
        'id': contact_id,           # ← Primary key
        'contactId': contact_id,    # ← Also stores as contactId
        'name': sender_name or '',
        'phone': phone,
        # ... other fields
    }
    contacts_table.put_item(Item=contact)
    return contact
```

**Message Storage:**
```python
message_record = {
    'id': message_id,
    'messageId': message_id,
    'contactId': contact_id,  # ← Stores contact ID from above
    'direction': 'inbound',
    'content': content,
    # ... other fields
}
messages_table.put_item(Item=message_record)
```

#### Frontend Flow (WhatsApp Inbox)

```typescript
// src/pages/dm/whatsapp/index.tsx

const loadData = useCallback(async () => {
    const [contactsData, messagesData] = await Promise.all([
        api.listContacts(),      // ← Gets contacts
        api.listMessages(undefined, 'WHATSAPP'),  // ← Gets messages
    ]);

    // Build contact list
    const displayContacts: Contact[] = contactsData
        .filter(c => c.phone)
        .map(c => ({
            id: c.contactId,     // ← Uses contactId from API
            name: c.name || c.phone,
            phone: c.phone,
            // ... other fields
        }));

    setContacts(displayContacts);
    setMessages(messagesData);
}, [selectedContact]);

// When filtering messages
const filteredMessages = messages
    .filter(m => selectedContact && m.contactId === selectedContact.id)
    // ← Tries to match message.contactId with selectedContact.id
```

### The Mismatch

**Scenario 1: Contact Already Exists**
```
✅ Contact in DB:
   id: "abc-123"
   contactId: "abc-123"
   phone: "+919876543210"

✅ Message from same phone:
   contactId: "abc-123"
   senderPhone: "+919876543210"

✅ Frontend:
   selectedContact.id = "abc-123"
   message.contactId = "abc-123"
   ✅ MATCH → Message shows
```

**Scenario 2: New Contact Created**
```
✅ New contact created by inbound handler:
   id: "xyz-789"
   contactId: "xyz-789"
   phone: "+919876543210"

✅ Message stored:
   contactId: "xyz-789"
   senderPhone: "+919876543210"

✅ Frontend loads contacts:
   selectedContact.id = "xyz-789"

✅ Frontend loads messages:
   message.contactId = "xyz-789"

✅ MATCH → Message shows
```

**Scenario 3: Contact ID Field Mismatch (THE ACTUAL BUG)**
```
❌ If API returns different field name:
   Contact from API: { id: "abc-123", contactId: "abc-123" }
   Frontend uses: selectedContact.id = "abc-123"

❌ But message has: contactId: "abc-123"

❌ If API normalizes differently:
   Contact: { id: "abc-123" }  (no contactId field)
   Message: { contactId: "abc-123" }
   
   Frontend: selectedContact.id = "abc-123"
   Filter: m.contactId === selectedContact.id
   ❌ NO MATCH → Message doesn't show
```

### Why Messages Aren't Showing

**Most Likely Cause:**

The `normalizeContact()` function in `src/api/client.ts` may not be returning the correct ID field:

```typescript
function normalizeContact(item: any): Contact {
    return {
        id: item.id || item.contactId || '',  // ← Uses 'id' first
        contactId: item.contactId || item.id || '',
        name: item.name || '',
        phone: item.phone || '',
        // ... other fields
    };
}
```

**If DynamoDB returns:**
```json
{
    "id": "abc-123",
    "contactId": "abc-123",
    "phone": "+919876543210"
}
```

**Frontend gets:**
```javascript
{
    id: "abc-123",
    contactId: "abc-123",
    phone: "+919876543210"
}
```

**But if message has:**
```javascript
{
    contactId: "abc-123",
    senderPhone: "+919876543210"
}
```

**Filter logic:**
```javascript
m.contactId === selectedContact.id
"abc-123" === "abc-123"  // ✅ Should match
```

### The Real Issue: Direction Field

**Most Likely Root Cause:**

The inbound handler stores messages with `direction: 'inbound'` (lowercase):
```python
message_record = {
    'direction': 'inbound',  # ← lowercase
}
```

But the frontend filters by direction:
```typescript
// In loadData()
const messagesData = await api.listMessages(undefined, 'WHATSAPP');

// In normalizeMessage()
direction: (item.direction || 'INBOUND').toUpperCase() as 'INBOUND' | 'OUTBOUND',
```

**The filter in messages-read handler:**
```python
if direction and direction in ['INBOUND', 'OUTBOUND']:
    filter_parts.append('direction = :dir')
    expression_values[':dir'] = direction.lower()
```

**Potential Issue:**
- Frontend requests: `listMessages(undefined, 'WHATSAPP')`
- No direction filter passed
- Backend scans ALL messages (inbound + outbound)
- But if direction field is inconsistent (inbound vs INBOUND), filtering may fail

---

## Verification Steps

### Step 1: Check DynamoDB Message Table

```bash
# AWS CLI command
aws dynamodb scan \
  --table-name Message \
  --filter-expression "attribute_exists(senderPhone)" \
  --limit 5 \
  --region us-east-1
```

**Look for:**
- [ ] Messages with `direction: "inbound"` or `direction: "INBOUND"`
- [ ] Messages with `contactId` field
- [ ] Messages with `senderPhone` field
- [ ] Timestamp is recent

### Step 2: Check DynamoDB Contact Table

```bash
aws dynamodb scan \
  --table-name Contact \
  --limit 5 \
  --region us-east-1
```

**Look for:**
- [ ] Contact with matching phone number
- [ ] Contact has both `id` and `contactId` fields
- [ ] Contact `id` matches message `contactId`

### Step 3: Check CloudWatch Logs

```bash
# Inbound handler logs
aws logs tail /aws/lambda/inbound-whatsapp-handler --follow

# Messages-read handler logs
aws logs tail /aws/lambda/messages-read --follow
```

**Look for:**
- [ ] `"event": "message_stored"` with correct contactId
- [ ] `"event": "messages_scanned"` showing message count
- [ ] Sample items showing direction field

### Step 4: Test API Directly

```bash
# Get messages
curl -X GET "https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod/messages?channel=WHATSAPP"

# Check response structure
# Look for: contactId, direction, senderPhone fields
```

### Step 5: Check Frontend Console

```javascript
// In browser console
// After loading inbox, check:
console.log(messages);  // Should show inbound messages
console.log(contacts);  // Should show contacts with matching IDs
```

---

## Solutions

### Solution 1: Fix Deployment (npm ci Issue)

**Step 1: Clean up locally**
```bash
rm -rf node_modules package-lock.json
```

**Step 2: Regenerate lock file**
```bash
npm install
```

**Step 3: Verify npm ci works**
```bash
npm ci
```

**Step 4: Commit and push**
```bash
git add package-lock.json
git commit -m "Fix: Regenerate package-lock.json for npm ci compatibility"
git push
```

**Step 5: Deploy**
```bash
npm run amplify:deploy
```

### Solution 2: Fix Incoming Messages Display

**Option A: Ensure Direction Field Consistency**

Update inbound handler to use uppercase:
```python
message_record = {
    'direction': 'INBOUND',  # ← Use uppercase
}
```

**Option B: Add Debug Logging**

Already added in previous fixes - check CloudWatch logs to see:
- Sample items from scan
- Contact ID values
- Direction field values

**Option C: Verify Contact ID Mapping**

Ensure frontend contact list has matching IDs:
```typescript
// In loadData()
console.log('Contacts:', displayContacts.map(c => ({ id: c.id, phone: c.phone })));
console.log('Messages:', messagesData.map(m => ({ contactId: m.contactId, direction: m.direction })));
```

---

## Implementation Plan

### Phase 1: Fix Deployment (CRITICAL)
1. Regenerate `package-lock.json` locally
2. Verify `npm ci` works
3. Push to GitHub
4. Redeploy via Amplify

**Expected Result:** ✅ Deployment succeeds

### Phase 2: Fix Incoming Messages (HIGH PRIORITY)
1. Check CloudWatch logs for message storage
2. Verify DynamoDB data structure
3. Check frontend filtering logic
4. Add more detailed logging if needed

**Expected Result:** ✅ Incoming messages appear in inbox

### Phase 3: Verify End-to-End
1. Send test WhatsApp message
2. Verify it appears in inbox within 10 seconds
3. Verify sender name shows correctly
4. Verify message content displays

**Expected Result:** ✅ Full functionality working

---

## Summary

| Issue | Root Cause | Solution | Priority |
|-------|-----------|----------|----------|
| Deployment Fails | Incomplete package-lock.json | Regenerate lock file | CRITICAL |
| npm ci Rejects | Missing AWS SDK v3 + Smithy entries | Run `npm install` locally | CRITICAL |
| Incoming Messages Missing | Possible contact ID mismatch or direction field inconsistency | Check logs + verify data | HIGH |
| Messages Not Filtering | Frontend filter logic may not match backend data | Add debug logging | HIGH |

---

## Next Steps

1. **Immediately**: Regenerate `package-lock.json` and deploy
2. **Then**: Check CloudWatch logs for incoming messages
3. **Then**: Verify DynamoDB data structure
4. **Finally**: Test end-to-end with real WhatsApp message

**Estimated Time to Resolution**: 30-45 minutes
