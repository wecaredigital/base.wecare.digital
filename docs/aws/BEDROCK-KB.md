# WECARE.DIGITAL - Bedrock Knowledge Base Documentation

## Overview

This document describes the AWS Bedrock resources configured for WECARE.DIGITAL AI automation.

---

## Bedrock Resources

### 1. AgentCore Runtime (Internal Chatbot)

| Property | Value |
|----------|-------|
| Name | `base_bedrock_agentcore` |
| Runtime ID | `base_bedrock_agentcore-1XHDxj2o3Q` |
| Runtime ARN | `arn:aws:bedrock-agentcore:us-east-1:809904170947:runtime/base_bedrock_agentcore-1XHDxj2o3Q` |
| Status | READY |
| Description | base-wecare-digital-bedrock-agentcore-runtime |
| Idle Timeout | 600 seconds |

**Used For:**
- FloatingAgent chatbot on all admin pages
- Real-time AI assistance
- Task automation (send messages, find contacts, check stats)

---

### 2. Bedrock Agent (WhatsApp AI Responses)

| Property | Value |
|----------|-------|
| Name | `base-bedrock-agent` |
| Agent ID | `HQNT0JXN8G` |
| Agent Alias | `TSTALIASID` |
| Agent ARN | `arn:aws:bedrock:us-east-1:809904170947:agent/HQNT0JXN8G` |
| Status | PREPARED |
| Foundation Model | `amazon.nova-pro-v1:0` |
| Agent Collaboration | DISABLED |
| Role ARN | `arn:aws:iam::809904170947:role/service-role/AmazonBedrockExecutionRoleForAgents_18GVEGPGMM5` |
| User Input | ENABLED |
| Memory | Disabled |
| Idle Session Timeout | 600 seconds |

**Agent Instruction:**
```
You are WECARE.DIGITAL's friendly multilingual AI assistant. 
CRITICAL: If the message starts with [RESPOND IN X ONLY], you MUST respond ONLY in language X. 
Otherwise, respond in the SAME LANGUAGE as the user's message.
RULES: 1) Keep responses SHORT - max 3 sentences plus 1 action 
2) Use 1-2 emojis for warmth 
3) ALWAYS mention the specific brand name.
BRAND ROUTING: Travel/Hotels/Visa/Tours = BNB Club (bnbclub.in) | Documents/Registration/GST/Company = Legal Champ (legalchamp.in) | Disputes/Complaints/Mediation = No Fault (nofault.in) | Puja/Rituals/Festivals = Ritual Guru (ritualguru.in) | Self-inquiry/Reflection/Coaching = Swdhya (swdhya.in).
CONTACT: +91 9330994400, one@wecare.digital.
ALWAYS end with a clear action (visit website, call number, or next step).
```

**Used For:**
- WhatsApp AI auto-responses
- Complex queries requiring multi-step reasoning
- Action execution and tool calling

**⚠️ CRITICAL - Agent Management:**
- DO NOT edit agent in AWS Console - it resets `agentCollaboration` to SUPERVISOR
- Use CLI commands instead:
```bash
aws bedrock-agent update-agent --agent-id HQNT0JXN8G --agent-name "base-bedrock-agent" \
  --agent-resource-role-arn "arn:aws:iam::809904170947:role/service-role/AmazonBedrockExecutionRoleForAgents_18GVEGPGMM5" \
  --foundation-model "amazon.nova-pro-v1:0" --instruction "YOUR_INSTRUCTION" \
  --agent-collaboration DISABLED --region us-east-1

aws bedrock-agent prepare-agent --agent-id HQNT0JXN8G --region us-east-1
```

---

### 3. Knowledge Base (RAG)

| Property | Value |
|----------|-------|
| Name | `base-wecare-digital-bedrock-kb` |
| Knowledge Base ID | `FZBPKGTOYE` |
| Status | AVAILABLE |
| RAG Type | Vector Store |
| Embedding Model | `amazon.nova-2-multimodal-embeddings-v1:0` |
| Multimodal Storage | `s3://stream.wecare.digital` |
| Service Role | `AmazonBedrockExecutionRoleForKnowledgeBase_b8pgp` |

**Used For:**
- WhatsApp AI auto-responses
- Document search and retrieval
- FAQ answers using RAG (Retrieval-Augmented Generation)

#### Data Sources

| Data Source | ID | Type | Status | Description |
|-------------|-----|------|--------|-------------|
| Website Crawler | `8KHGUUWYJ8` | WEB | AVAILABLE | Crawls https://www.wecare.digital/ (up to 25,000 pages) |
| Custom Documents | `AXR9PXIVUK` | CUSTOM | AVAILABLE | Manual document uploads for KB training |

**Website Crawler Configuration:**
- Seed URL: `https://www.wecare.digital/`
- Rate Limit: 300 requests
- Max Pages: 25,000
- User Agent: `bedrockbot_11afc6db-3d3e-495d-b578-e3aaf9b4d479`

**Custom Documents (AXR9PXIVUK):**
- Type: Custom (manual upload)
- Chunking Strategy: Default
- Parsing Strategy: Default
- Data Deletion Policy: DELETE

| Document | Status | Updated |
|----------|--------|---------|
| `wecare_bedrock_kb.md` | INDEXED | Jan 22, 2026 20:01 |
| `wecare_bedrock_kb_qa.jsonl` | INDEXED | Jan 22, 2026 20:02 |

---

## S3 Buckets for Bedrock

| Bucket | Purpose |
|--------|---------|
| `stream.wecare.digital` | KB multimodal storage (supplemental data) |
| `auth.wecare.digital/stream/gen-ai/bedrock-agent/` | Agent logs |
| `auth.wecare.digital/stream/gen-ai/bedrock-kb/` | KB logs |
| `auth.wecare.digital/stream/gen-ai/bedrock-agentcore/` | AgentCore logs |

---

## DynamoDB Configuration Tables

### SystemConfigTable (`base-wecare-digital-SystemConfigTable`)

| configKey | Description |
|-----------|-------------|
| `ai_automation_enabled` | Enable/disable AI automation for inbound messages (value: `true`) |
| `bedrock_agent` | Agent configuration (ID, ARN, status) |
| `bedrock_knowledge_base` | Knowledge Base configuration (ID, name, status) |
| `bedrock_agent_runtime` | AgentCore runtime configuration (ID, ARN, status) |

### AIInteractionsTable (`base-wecare-digital-AIInteractionsTable`)

Stores AI interaction records:
- `interactionId` - Unique ID
- `messageId` - Related inbound message ID
- `query` - User's question/message
- `response` - AI-generated response
- `approved` - Whether response was approved/sent
- `timestamp` - Interaction timestamp

---

## Lambda Functions

| Function | Purpose |
|----------|---------|
| `wecare-ai-query-kb` | Query Knowledge Base for relevant context |
| `wecare-ai-generate-response` | Generate AI response using KB context |
| `wecare-inbound-whatsapp` | Process inbound messages, trigger AI automation |

### Environment Variables (wecare-inbound-whatsapp)

```
SYSTEM_CONFIG_TABLE=base-wecare-digital-SystemConfigTable
AI_INTERACTIONS_TABLE=base-wecare-digital-AIInteractionsTable
AI_QUERY_KB_FUNCTION=wecare-ai-query-kb
AI_GENERATE_RESPONSE_FUNCTION=wecare-ai-generate-response
```

---

## AI Automation Flow

```
1. Inbound WhatsApp Message
   ↓
2. wecare-inbound-whatsapp Lambda
   ↓
3. Check AI enabled (SystemConfigTable.ai_automation_enabled)
   ↓
4. If enabled & text message:
   ↓
5. Invoke wecare-ai-query-kb (query Knowledge Base)
   ↓
6. Invoke wecare-ai-generate-response (generate suggestion)
   ↓
7. Store in AIInteractionsTable (for review/approval)
```

---

## Ingestion Jobs

To sync Knowledge Base with latest content:

```bash
# Start website crawler ingestion
aws bedrock-agent start-ingestion-job \
  --knowledge-base-id FZBPKGTOYE \
  --data-source-id 8KHGUUWYJ8 \
  --region us-east-1

# Start custom documents ingestion (after adding new docs)
aws bedrock-agent start-ingestion-job \
  --knowledge-base-id FZBPKGTOYE \
  --data-source-id AXR9PXIVUK \
  --region us-east-1

# Check ingestion status
aws bedrock-agent get-ingestion-job \
  --knowledge-base-id FZBPKGTOYE \
  --data-source-id 8KHGUUWYJ8 \
  --ingestion-job-id <JOB_ID> \
  --region us-east-1
```

---

## FloatingAgent Integration

The FloatingAgent component (`src/components/FloatingAgent.tsx`) uses:

```typescript
const BEDROCK_AGENT_RUNTIME_ID = 'base_bedrock_agentcore-1XHDxj2o3Q';

// AI fallback calls /ai/chat endpoint with:
{
  message: text,
  sessionId: sessionId,
  agentRuntimeId: BEDROCK_AGENT_RUNTIME_ID,
  conversationHistory: [...]
}
```

---

## Region

All Bedrock resources are deployed in: **us-east-1**

---

## Language Detection

The AI response handler (`ai-generate-response`) includes automatic language detection:

| Language | Detection Method |
|----------|------------------|
| Hindi | Devanagari script (U+0900-097F) |
| Bengali | Bengali script (U+0980-09FF) |
| Tamil | Tamil script (U+0B80-0BFF) |
| Telugu | Telugu script (U+0C00-0C7F) |
| Gujarati | Gujarati script (U+0A80-0AFF) |
| Marathi | Devanagari + common Marathi words |
| Hinglish | Latin script + Hindi words |
| English | Default fallback |

Messages are prefixed with `[RESPOND IN X ONLY]` to ensure consistent language responses.

---

*Last Updated: January 22, 2026*
