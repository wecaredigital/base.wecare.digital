# Amazon Bedrock AI Configuration

## Overview

WECARE.DIGITAL uses Amazon Bedrock with Nova Lite model for AI-powered responses.

**Model:** Amazon Nova Lite (~$0.06/1M input tokens)

## Architecture

Two separate Agent/KB pairs for different use cases:

### 1. EXTERNAL (Customer-Facing - WhatsApp Auto-Reply)
- **Purpose:** Respond to customer WhatsApp messages
- **Agent ID:** `[TO BE CONFIGURED]`
- **Agent Alias:** `[TO BE CONFIGURED]`
- **Knowledge Base ID:** `[TO BE CONFIGURED]`
- **S3 Data Source:** `s3://auth.wecare.digital/stream/gen-ai/external-kb/`

### 2. INTERNAL (Admin - FloatingAgent Widget)
- **Purpose:** Help admins with tasks (send messages, find contacts, stats)
- **Agent ID:** `[TO BE CONFIGURED]`
- **Agent Alias:** `[TO BE CONFIGURED]`
- **Knowledge Base ID:** `[TO BE CONFIGURED]`
- **S3 Data Source:** `s3://auth.wecare.digital/stream/gen-ai/internal-kb/`

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

## Setup Instructions

### Step 1: Create Knowledge Bases

1. Go to AWS Console → Bedrock → Knowledge Bases
2. Create **External KB** (customer-facing):
   - Name: `wecare-external-kb`
   - S3 URI: `s3://auth.wecare.digital/stream/gen-ai/external-kb/`
   - Embedding Model: Titan Embeddings
3. Create **Internal KB** (admin):
   - Name: `wecare-internal-kb`
   - S3 URI: `s3://auth.wecare.digital/stream/gen-ai/internal-kb/`
   - Embedding Model: Titan Embeddings

### Step 2: Create Agents

1. Go to AWS Console → Bedrock → Agents
2. Create **External Agent**:
   - Name: `wecare-external-agent`
   - Model: Amazon Nova Lite
   - Attach External KB
   - Create alias (e.g., `prod`)
3. Create **Internal Agent**:
   - Name: `wecare-internal-agent`
   - Model: Amazon Nova Lite
   - Attach Internal KB
   - Create alias (e.g., `prod`)

### Step 3: Update Code

After creating resources, update these files with the new IDs:

**Lambda Environment Variables:**
```
EXTERNAL_AGENT_ID=<your-external-agent-id>
EXTERNAL_AGENT_ALIAS=<your-external-alias>
EXTERNAL_KB_ID=<your-external-kb-id>
INTERNAL_AGENT_ID=<your-internal-agent-id>
INTERNAL_AGENT_ALIAS=<your-internal-alias>
INTERNAL_KB_ID=<your-internal-kb-id>
```

**Frontend (FloatingAgent.tsx):**
```typescript
const INTERNAL_AGENT_ID = '<your-internal-agent-id>';
const INTERNAL_AGENT_ALIAS = '<your-internal-alias>';
const INTERNAL_KB_ID = '<your-internal-kb-id>';
```

**API Client (client.ts):**
```typescript
const AI_CONFIG: AIConfig = {
  enabled: true,
  autoReplyEnabled: true,
  knowledgeBaseId: '<your-external-kb-id>',
  agentId: '<your-external-agent-id>',
  agentAliasId: '<your-external-alias>',
  ...
};
```

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

## Cost Estimate

Nova Lite pricing (~$0.06/1M input tokens):
- 1000 messages/day × 100 tokens avg = 100K tokens/day
- Monthly: ~3M tokens = ~$0.18/month

Very cost-effective for FAQ responses!
