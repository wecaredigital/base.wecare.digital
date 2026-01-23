# Amazon Bedrock AI Configuration

## Overview

WECARE.DIGITAL uses Amazon Bedrock with Nova Lite model for AI-powered responses.

**Model:** Amazon Nova Lite (~$0.06/1M input tokens)

---

## Internal Agent (Admin FloatingAgent)

### Resources Created
| Resource | Type | ID |
|----------|------|-----|
| Knowledge Base | KB | `7IWHVB0ZXQ` |
| Agent | Agent | `TJAZR473IJ` |
| Agent Alias | prod | `O4U1HF2MSX` |
| Action Group | wecare-actions | `KIEKM8TYG7` |
| Data Source | S3 | `s3://auth.wecare.digital/stream/gen-ai/internal-kb/` |

### Agent Setup Instructions

#### Step 1: Prepare the Agent
```bash
aws bedrock-agent prepare-agent --agent-id TJAZR473IJ --region us-east-1
```

#### Step 2: Create Action Group Lambda

1. Deploy the Lambda function:
```bash
# Create Lambda function
aws lambda create-function \
  --function-name wecare-agent-action-group \
  --runtime python3.12 \
  --handler handler.handler \
  --role arn:aws:iam::809904170947:role/base-wecare-digital \
  --timeout 60 \
  --memory-size 512 \
  --environment "Variables={CONTACTS_TABLE=base-wecare-digital-ContactsTable,MESSAGES_INBOUND_TABLE=base-wecare-digital-WhatsAppInboundTable,MESSAGES_OUTBOUND_TABLE=base-wecare-digital-WhatsAppOutboundTable,OUTBOUND_WHATSAPP_FUNCTION=wecare-outbound-whatsapp,OUTBOUND_SMS_FUNCTION=wecare-outbound-sms,OUTBOUND_EMAIL_FUNCTION=wecare-outbound-email}" \
  --zip-file fileb://agent-action-group.zip \
  --region us-east-1
```

2. Add Bedrock invoke permission:
```bash
aws lambda add-permission \
  --function-name wecare-agent-action-group \
  --statement-id bedrock-agent-invoke \
  --action lambda:InvokeFunction \
  --principal bedrock.amazonaws.com \
  --source-arn "arn:aws:bedrock:us-east-1:809904170947:agent/TJAZR473IJ" \
  --region us-east-1
```

#### Step 3: Create Action Group in Console

1. Go to AWS Console → Bedrock → Agents → TJAZR473IJ
2. Click "Edit in Agent Builder"
3. Under "Action groups", click "Add"
4. Configure:
   - **Name:** `wecare-actions`
   - **Description:** `WECARE.DIGITAL admin actions for messaging, contacts, and invoices`
   - **Action group type:** Define with API schemas
   - **Action group invocation:** Select Lambda function `wecare-agent-action-group`
   - **API Schema:** Upload `AGENT-ACTION-GROUP-SCHEMA.json`

5. Click "Create action group"
6. Click "Prepare" to prepare the agent

#### Step 4: Create Agent Alias
```bash
aws bedrock-agent create-agent-alias \
  --agent-id TJAZR473IJ \
  --agent-alias-name prod \
  --region us-east-1
```

### Action Group Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| `/send-whatsapp` | Send WhatsApp message | contactId/phone, message |
| `/send-sms` | Send SMS | contactId/phone, message |
| `/send-email` | Send email | contactId/email, subject, message |
| `/create-contact` | Create contact | name, phone, email |
| `/update-contact` | Update contact | contactId, name, phone, email |
| `/delete-contact` | Delete contact | contactId |
| `/search-contacts` | Search contacts | query |
| `/get-contact` | Get contact details | contactId/phone |
| `/delete-message` | Delete message | messageId |
| `/get-messages` | Get messages | contactId, limit |
| `/create-invoice` | Create invoice | contactId, amount, description |
| `/get-stats` | Get dashboard stats | - |

### Agent Instructions (Prompt)

Set this as the agent instruction in AWS Console:

```
You are WECARE.DIGITAL's internal admin assistant. You help administrators manage contacts, send messages, and perform administrative tasks.

CAPABILITIES:
- Send WhatsApp messages, SMS, and emails to contacts
- Create, update, delete, and search contacts
- View and delete messages
- Create invoices
- Get dashboard statistics

RULES:
1. Always confirm before sending messages or deleting data
2. When searching contacts, show the results before taking action
3. For messaging, always verify the contact exists first
4. Be concise and professional in responses
5. If an action fails, explain the error clearly

RESPONSE FORMAT:
- Keep responses brief and actionable
- Use bullet points for lists
- Confirm successful actions with the result
```

---

## External Agent (WhatsApp Auto-Reply)

### Resources Created
| Resource | Type | ID |
|----------|------|-----|
| Knowledge Base | KB | `CTH8DH3RXY` |
| Agent | Agent | `JDXIOU2UR9` |
| Agent Alias | prod | `AQVQPGYXRR` |
| Data Source | S3 | `s3://auth.wecare.digital/stream/gen-ai/external-kb/` |

### Setup Instructions

1. Create Knowledge Base:
   - Name: `wecare-external-kb`
   - S3 URI: `s3://auth.wecare.digital/stream/gen-ai/external-kb/`
   - Embedding Model: Titan Embeddings

2. Create Agent:
   - Name: `wecare-external-agent`
   - Model: Amazon Nova Lite
   - Attach External KB

---

## S3 Folder Structure

```
s3://auth.wecare.digital/stream/gen-ai/
├── external-kb/           # Customer FAQ documents
│   ├── brands/            # Brand info (BNB Club, Legal Champ, etc.)
│   ├── faq/               # Common questions
│   └── services/          # Service descriptions
└── internal-kb/           # Admin documentation
    ├── api-docs/          # API documentation
    ├── workflows/         # Admin workflows
    └── guides/            # How-to guides
```

---

## Update Lambda Environment Variables

After creating agents, update the ai-generate-response Lambda:

```bash
aws lambda update-function-configuration \
  --function-name wecare-ai-generate-response \
  --environment "Variables={
    INTERNAL_AGENT_ID=TJAZR473IJ,
    INTERNAL_AGENT_ALIAS=<alias-id>,
    INTERNAL_KB_ID=08LG9AKAHN,
    EXTERNAL_AGENT_ID=<external-agent-id>,
    EXTERNAL_AGENT_ALIAS=<external-alias>,
    EXTERNAL_KB_ID=<external-kb-id>
  }" \
  --region us-east-1
```

---

## Language Support

Auto-detects and responds in:
- English
- Hindi (हिंदी)
- Bengali (বাংলা)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Gujarati (ગુજરાતી)
- Marathi (मराठी)
- Hinglish (Hindi in Latin script)

---

## Cost Estimate

Nova Lite pricing (~$0.06/1M input tokens):
- 1000 messages/day × 100 tokens avg = 100K tokens/day
- Monthly: ~3M tokens = ~$0.18/month

Very cost-effective for FAQ responses!
