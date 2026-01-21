# Dashboard Deep Check - Analysis & Status

**Date:** January 21, 2026  
**Status:** 🔍 ANALYSIS COMPLETE  
**Focus:** Dashboard functionality, API integration, and data flow

---

## 📊 Dashboard Architecture

### Frontend Components
- **Page:** `src/pages/dm/whatsapp/index.tsx` - WhatsApp Unified Inbox
- **API Client:** `src/lib/api.ts` - API Gateway integration
- **Components:** Layout, RichTextEditor, Toast notifications

### Data Flow
```
Dashboard (React) 
  ↓
API Client (src/lib/api.ts)
  ↓
API Gateway (https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod)
  ↓
Lambda Functions (messages-read, contacts-read, etc.)
  ↓
DynamoDB Tables (Message, Contact, etc.)
```

---

## 🔍 Dashboard Functionality Analysis

### 1. Data Loading (`loadData` function)

**What it does:**
```typescript
const [contactsData, messagesData] = await Promise.all([
  api.listContacts(),
  api.listMessages(undefined, 'WHATSAPP'),
]);
```

**Expected behavior:**
- Fetches all contacts from `/contacts` endpoint
- Fetches all WhatsApp messages from `/messages?channel=WHATSAPP` endpoint
- Combines data to show contacts with last message info
- Sorts contacts by most recent message

**Potential issues:**
- ❌ If API endpoints return 404 or 500, data won't load
- ❌ If DynamoDB tables don't exist, Lambda functions fail
- ❌ If table names are wrong, queries return empty results

### 2. Message Display

**What it does:**
```typescript
setMessages(messagesData.map(m => ({
  id: m.messageId,
  direction: m.direction.toLowerCase() as 'inbound' | 'outbound',
  content: m.content || '',
  timestamp: m.timestamp,
  status: m.status?.toLowerCase() || 'sent',
  contactId: m.contactId,
  mediaUrl: m.mediaUrl,  // Pre-signed URL from API
  senderName: m.senderName,  // Sender's WhatsApp profile name
  senderPhone: m.senderPhone,  // Sender's phone number
})));
```

**Expected behavior:**
- Maps API response to Message interface
- Uses pre-signed URLs for media display
- Shows sender name for inbound messages
- Displays message status

**Potential issues:**
- ❌ If `mediaUrl` is null, media won't display
- ❌ If `senderName` is missing, inbound messages won't show sender
- ❌ If `timestamp` is malformed, sorting fails

### 3. Media Display

**Media types supported:**
- Images: `<img>` tag (max 200px × 300px)
- Videos: `<video>` tag with controls
- Audio: `<audio>` tag with controls
- Documents: Download link with 📄 icon

**Detection logic:**
```typescript
// In render function - media type detection
if (message.mediaUrl) {
  if (message.mediaUrl.includes('image')) {
    // Display image
  } else if (message.mediaUrl.includes('video')) {
    // Display video
  } else if (message.mediaUrl.includes('audio')) {
    // Display audio
  } else {
    // Display document link
  }
}
```

**Potential issues:**
- ❌ If `mediaUrl` is missing, media won't display
- ❌ If media type detection fails, wrong player used
- ❌ If pre-signed URL is expired, media won't load

---

## 🔧 API Integration Analysis

### API Endpoint: `/messages`

**Request:**
```
GET https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod/messages?channel=WHATSAPP
```

**Expected Response:**
```json
{
  "messages": [
    {
      "messageId": "uuid",
      "contactId": "contact-id",
      "channel": "whatsapp",
      "direction": "inbound",
      "content": "Hello",
      "timestamp": "2026-01-21T12:00:00Z",
      "status": "received",
      "mediaUrl": "https://s3.amazonaws.com/...",
      "senderName": "John Doe",
      "senderPhone": "+919876543210"
    }
  ],
  "count": 1
}
```

**Lambda Function:** `messages-read`
- **Table:** `Message` (after fix)
- **Query:** Scans Message table, filters by channel and direction
- **Returns:** Pre-signed URLs for media files

**Potential issues:**
- ❌ If Lambda not deployed, returns 404
- ❌ If table name is wrong, returns empty results
- ❌ If IAM permissions missing, returns 403
- ❌ If S3 bucket not accessible, pre-signed URLs fail

### API Endpoint: `/contacts`

**Request:**
```
GET https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod/contacts
```

**Expected Response:**
```json
{
  "contacts": [
    {
      "contactId": "contact-id",
      "name": "John Doe",
      "phone": "+919876543210",
      "email": "john@example.com",
      "optInWhatsApp": true,
      "optInSms": false,
      "optInEmail": false
    }
  ],
  "count": 1
}
```

**Lambda Function:** `contacts-search`
- **Table:** `Contact` (after fix)
- **Query:** Scans Contact table, returns all non-deleted contacts
- **Returns:** Contact list with opt-in preferences

**Potential issues:**
- ❌ If Lambda not deployed, returns 404
- ❌ If table name is wrong, returns empty results
- ❌ If IAM permissions missing, returns 403

---

## 📋 Dashboard Checklist

### Frontend
- ✅ Dashboard page loads (`src/pages/dm/whatsapp/index.tsx`)
- ✅ API client configured (`src/lib/api.ts`)
- ✅ Media display components implemented
- ✅ Sender name display implemented
- ✅ Message status display implemented

### API Integration
- ⚠️ API endpoint accessible: **NEEDS VERIFICATION**
- ⚠️ Lambda functions deployed: **NEEDS VERIFICATION**
- ⚠️ DynamoDB tables exist: **NEEDS VERIFICATION**
- ⚠️ IAM permissions correct: **NEEDS VERIFICATION**

### Data Flow
- ⚠️ Contacts loading: **DEPENDS ON API**
- ⚠️ Messages loading: **DEPENDS ON API**
- ⚠️ Media URLs generating: **DEPENDS ON API**
- ⚠️ Sender names displaying: **DEPENDS ON API**

---

## 🚀 Expected Results After Deployment

### Before `amplify push --yes`
- ❌ Dashboard loads but shows no messages
- ❌ Contacts list empty
- ❌ API returns 404 or 500 errors
- ❌ CloudWatch logs show Lambda not found

### After `amplify push --yes`
- ✅ Dashboard loads with messages
- ✅ Contacts list populated
- ✅ API returns 200 OK with data
- ✅ Media displays correctly
- ✅ Sender names show for inbound messages
- ✅ CloudWatch logs show successful operations

---

## 🔍 Verification Steps

### Step 1: Check API Connectivity
```bash
# Test API endpoint
curl -X GET https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod/contacts

# Expected: 200 OK with contacts list
# If 404: Lambda not deployed
# If 500: Lambda error - check logs
# If CORS error: Check API Gateway CORS settings
```

### Step 2: Check Lambda Functions
```bash
# List deployed Lambda functions
aws lambda list-functions --query 'Functions[?contains(FunctionName, `wecare`)].FunctionName'

# Expected: wecare-messages-read, wecare-contacts-search, etc.
# If empty: Lambda functions not deployed
```

### Step 3: Check DynamoDB Tables
```bash
# List DynamoDB tables
aws dynamodb list-tables

# Expected: Message, Contact, VoiceCall, etc.
# If missing: Tables not created
```

### Step 4: Check CloudWatch Logs
```bash
# View Lambda logs
aws logs tail /aws/lambda/wecare-messages-read --follow

# Look for:
# - No errors
# - Successful table scans
# - Correct table names
# - Pre-signed URL generation
```

### Step 5: Test Dashboard
1. Open https://base.wecare.digital
2. Navigate to WhatsApp Direct Messages
3. Verify contacts list loads
4. Verify messages display
5. Verify media displays correctly
6. Verify sender names show

---

## 📊 Dashboard Data Sources

### Contacts
- **Source:** DynamoDB `Contact` table
- **API:** `GET /contacts`
- **Lambda:** `contacts-search`
- **Fields:** contactId, name, phone, email, opt-in preferences

### Messages
- **Source:** DynamoDB `Message` table
- **API:** `GET /messages?channel=WHATSAPP`
- **Lambda:** `messages-read`
- **Fields:** messageId, contactId, content, timestamp, status, mediaUrl, senderName, senderPhone

### Media
- **Source:** S3 bucket `auth.wecare.digital`
- **Access:** Pre-signed URLs from Lambda
- **Types:** Images, videos, audio, documents
- **Expiry:** 1 hour (3600 seconds)

---

## 🎯 Critical Dependencies

### For Dashboard to Work:
1. ✅ Frontend code deployed (Amplify Hosting)
2. ⚠️ API Gateway deployed (NEEDS `amplify push --yes`)
3. ⚠️ Lambda functions deployed (NEEDS `amplify push --yes`)
4. ⚠️ DynamoDB tables created (NEEDS `amplify push --yes`)
5. ⚠️ SNS subscription active (NEEDS `amplify push --yes`)
6. ⚠️ S3 bucket accessible (NEEDS IAM permissions)
7. ⚠️ IAM roles configured (NEEDS `amplify push --yes`)

---

## 🔴 Known Issues (Before Fix)

### Issue 1: Table Name Mismatch
- **Problem:** Lambda uses old table names, DynamoDB has new tables
- **Impact:** Messages stored but never retrieved
- **Status:** ✅ FIXED (commit e7d4a25)

### Issue 2: Lambda Not Deployed
- **Problem:** Lambda functions written but not deployed to AWS
- **Impact:** API returns 404 errors
- **Status:** ⏳ PENDING (needs `amplify push --yes`)

### Issue 3: SNS Subscription Missing
- **Problem:** Inbound handler not subscribed to SNS topic
- **Impact:** Inbound messages never processed
- **Status:** ⏳ PENDING (needs `amplify push --yes`)

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] API endpoint returns 200 OK
- [ ] Lambda functions are deployed
- [ ] DynamoDB tables exist
- [ ] SNS subscription is active
- [ ] Dashboard loads without errors
- [ ] Contacts list displays
- [ ] Messages display
- [ ] Media displays correctly
- [ ] Sender names show for inbound messages
- [ ] CloudWatch logs show no errors

---

## 📞 Troubleshooting

### Dashboard Shows No Messages
1. Check API connectivity: `curl https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod/messages`
2. Check Lambda logs: `aws logs tail /aws/lambda/wecare-messages-read`
3. Check DynamoDB table: `aws dynamodb describe-table --table-name Message`
4. Check browser console for errors

### Media Not Displaying
1. Check if `mediaUrl` is present in API response
2. Check if pre-signed URL is valid
3. Check S3 bucket permissions
4. Check browser console for CORS errors

### Sender Names Not Showing
1. Check if `senderName` is present in API response
2. Check inbound handler is storing sender name
3. Check CloudWatch logs for inbound handler

### API Returns 404
1. Check Lambda functions are deployed: `aws lambda list-functions`
2. Check API Gateway routes: `aws apigatewayv2 get-routes --api-id <api-id>`
3. Check Lambda permissions: `aws lambda get-policy --function-name wecare-messages-read`

---

## 🎯 Next Steps

1. **Deploy Backend:** Run `amplify push --yes`
2. **Verify Deployment:** Check Lambda functions, DynamoDB tables, SNS subscription
3. **Test API:** Use curl to test endpoints
4. **Check Logs:** Review CloudWatch logs for errors
5. **Test Dashboard:** Open dashboard and verify data loads
6. **Test Media:** Send media and verify display
7. **Test Inbound:** Send WhatsApp message and verify receipt

---

**Status: Ready for Deployment**

Dashboard is fully implemented and ready to work once backend is deployed with `amplify push --yes`.
