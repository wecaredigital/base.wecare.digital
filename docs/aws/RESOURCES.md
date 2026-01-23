# AWS Resources - WECARE.DIGITAL

**AWS Account:** 809904170947  
**Region:** us-east-1

## Cognito

| Resource | Value |
|----------|-------|
| User Pool ID | `us-east-1_CC9u1fYh6` |
| App Client ID (PKCE) | `390cro53nf7gerev44gnq7felt` |
| SSO Domain | `https://sso.wecare.digital` |

## S3 Buckets

| Bucket | Purpose |
|--------|---------|
| `auth.wecare.digital` | Media files, KB data |
| `stream.wecare.digital` | Reports, exports |

## WhatsApp (AWS EUM Social)

| Phone Number | AWS Phone Number ID | WABA |
|--------------|---------------------|------|
| +91 93309 94400 | `phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54` | WECARE.DIGITAL |
| +91 99033 00044 | `phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06` | Manish Agarwal |

## SNS

| Topic | ARN |
|-------|-----|
| WhatsApp Events | `arn:aws:sns:us-east-1:809904170947:base-wecare-digital` |

## Pinpoint SMS

| Resource | Value |
|----------|-------|
| Pool ID | `pool-6fbf5a5f390d4eeeaa7dbae39d78933e` |
| Message Type | TRANSACTIONAL |

## SES

| Resource | Value |
|----------|-------|
| Verified Email | `one@wecare.digital` |
| DKIM | Configured |

## Bedrock AI

### Internal Agent (Admin FloatingAgent)
| Resource | Type | ID |
|----------|------|-----|
| Knowledge Base | KB | `7IWHVB0ZXQ` |
| Agent | Agent | `TJAZR473IJ` |
| Agent Alias | prod | `O4U1HF2MSX` |
| Action Group | wecare-actions | `KIEKM8TYG7` |
| Data Source | S3 | `stream/gen-ai/internal-kb/` |
| Status | PREPARED | Ready |

### External Agent (WhatsApp Auto-Reply)
| Resource | Type | ID |
|----------|------|-----|
| Knowledge Base | KB | `CTH8DH3RXY` |
| Agent | Agent | `JDXIOU2UR9` |
| Agent Alias | prod | `AQVQPGYXRR` |
| Data Source | S3 | `stream/gen-ai/external-kb/` |
| Status | PREPARED | Ready |

**Model:** Amazon Nova Lite (~$0.06/1M input tokens)

## DynamoDB Tables

| Table | Purpose |
|-------|---------|
| `base-wecare-digital-ContactsTable` | Contacts |
| `base-wecare-digital-WhatsAppInboundTable` | Inbound messages |
| `base-wecare-digital-WhatsAppOutboundTable` | Outbound messages |
| `base-wecare-digital-BulkJobsTable` | Bulk jobs |
| `base-wecare-digital-SystemConfigTable` | Settings |
| `base-wecare-digital-AIInteractionsTable` | AI logs |

## IAM Role

| Resource | ARN |
|----------|-----|
| Lambda Role | `arn:aws:iam::809904170947:role/base-wecare-digital` |
