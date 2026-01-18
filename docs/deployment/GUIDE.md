# Deployment Guide

**Project**: WECARE.DIGITAL Admin Platform  
**AWS Account**: 809904170947  
**Region**: us-east-1  
**Branch Strategy**: base (production)

---

## Prerequisites

### Required Tools
- Node.js >= 18.0.0
- AWS CLI configured
- AWS Amplify CLI
- Git

### AWS Credentials
```bash
aws configure
# AWS Access Key ID: [Your Access Key]
# AWS Secret Access Key: [Your Secret Key]
# Default region name: us-east-1
# Default output format: json
```

---

## Project Setup

### 1. Clone Repository
```bash
git clone https://github.com/wecaredigital/repository.git
cd base.wecare.digital
git checkout base
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create `.env.local`:
```env
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=809904170947
SEND_MODE=DRY_RUN
LOG_LEVEL=DEBUG
```

---

## Local Development

### Start Development Server
```bash
# Frontend only
npm run dev

# Amplify sandbox (local backend)
npm run amplify
```

Access at: `http://localhost:3000`

### Test Lambda Functions Locally
```bash
# Test specific function
cd amplify/functions/contacts-create
python handler.py
```

---

## Deployment

### Branch Strategy

| Branch | Environment | SEND_MODE | Auto-Deploy |
|--------|-------------|-----------|-------------|
| base | Production | LIVE | Yes |
| feature/* | Preview | DRY_RUN | Yes |
| release/* | Staging | DRY_RUN | Yes |
| hotfix/* | Production | LIVE | Yes |

### Deploy to Production

#### Method 1: Git Push (Recommended)
```bash
git checkout base
git add .
git commit -m "Your commit message"
git push origin base
```

Amplify CI/CD will automatically:
1. Build the application
2. Run tests
3. Deploy to production
4. Update CloudFormation stacks

#### Method 2: Manual Deployment
```bash
npm run amplify:deploy
```

### Deploy to Preview (Feature Branch)
```bash
git checkout -b feature/my-feature
git add .
git commit -m "Add new feature"
git push origin feature/my-feature
```

Creates a preview environment with DRY_RUN mode.

---

## Post-Deployment Verification

### 1. Check Deployment Status
```bash
# Via AWS Console
https://console.aws.amazon.com/amplify/home?region=us-east-1

# Via CLI
aws amplify list-apps --region us-east-1
```

### 2. Verify Lambda Functions
```bash
aws lambda list-functions --region us-east-1 --query "Functions[?contains(FunctionName, 'wecare')].FunctionName"
```

### 3. Check DynamoDB Tables
```bash
aws dynamodb list-tables --region us-east-1
```

### 4. Test API Endpoints
```bash
# Test contact creation
curl -X POST https://your-api-endpoint/contacts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","phone":"+919876543210"}'
```

### 5. Monitor CloudWatch Logs
```bash
# View Lambda logs
aws logs tail /aws/lambda/wecare-contacts-create --follow

# View all wecare logs
aws logs tail /base-wecare-digital/common --follow
```

---

## Environment Variables

### Production (base branch)
Set in Amplify Console → App Settings → Environment Variables:

```
SEND_MODE=LIVE
LOG_LEVEL=INFO
AWS_REGION=us-east-1
```

### Preview/Staging
```
SEND_MODE=DRY_RUN
LOG_LEVEL=DEBUG
AWS_REGION=us-east-1
```

---

## Rollback Procedures

### Rollback via Amplify Console
1. Go to AWS Amplify Console
2. Select the app
3. Choose the base branch
4. Find the previous successful deployment
5. Click "Redeploy this version"

### Rollback via Git
```bash
# Revert to previous commit
git revert HEAD
git push origin base

# Or reset to specific commit
git reset --hard <commit-hash>
git push origin base --force
```

### Emergency Rollback
```bash
# Via AWS CLI
aws amplify start-job \
  --app-id <app-id> \
  --branch-name base \
  --job-type RELEASE \
  --job-reason "Emergency rollback"
```

---

## Monitoring

### CloudWatch Dashboard
Access at: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=WECARE-DIGITAL-Dashboard

### Key Metrics to Monitor
- Lambda invocation count
- Lambda error rate
- DynamoDB read/write capacity
- SQS queue depth
- WhatsApp message delivery rate
- API response times

### CloudWatch Alarms
All alarms publish to SNS topic: `base-wecare-digital`

Subscribe to receive notifications:
```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:809904170947:base-wecare-digital \
  --protocol email \
  --notification-endpoint your-email@example.com
```

---

## Troubleshooting

### Common Issues

#### 1. Lambda Timeout
**Symptom**: Function times out after 30 seconds  
**Solution**: Increase timeout in `resource.ts`
```typescript
timeoutSeconds: 60
```

#### 2. DynamoDB Throttling
**Symptom**: `ProvisionedThroughputExceededException`  
**Solution**: Already using PAY_PER_REQUEST, check for hot partitions

#### 3. WhatsApp Rate Limit
**Symptom**: Messages failing with rate limit error  
**Solution**: Check RateLimitTracker table, implement exponential backoff

#### 4. DLQ Messages
**Symptom**: Messages stuck in DLQ  
**Solution**: Use dlq-replay function
```bash
aws lambda invoke \
  --function-name wecare-dlq-replay \
  --payload '{"queueName":"inbound-dlq"}' \
  response.json
```

### View Logs
```bash
# Lambda function logs
aws logs tail /aws/lambda/<function-name> --follow

# Application logs
aws logs tail /base-wecare-digital/common --follow

# Filter by error
aws logs filter-pattern "ERROR" /aws/lambda/wecare-contacts-create
```

### Check Resource Status
```bash
# Lambda functions
aws lambda get-function --function-name wecare-contacts-create

# DynamoDB table
aws dynamodb describe-table --table-name base-wecare-digital-ContactsTable

# SQS queue
aws sqs get-queue-attributes \
  --queue-url https://sqs.us-east-1.amazonaws.com/809904170947/base-wecare-digital-bulk-queue \
  --attribute-names All
```

---

## Security Best Practices

### 1. IAM Least Privilege
- Each Lambda has minimal required permissions
- See `amplify/iam-policies.ts` for details

### 2. Secrets Management
- Never commit secrets to Git
- Use AWS Secrets Manager or Parameter Store
- Rotate credentials regularly

### 3. Encryption
- DynamoDB: Encryption at rest enabled
- S3: Server-side encryption (SSE-S3)
- In transit: TLS 1.2+ for all communications

### 4. Network Security
- Consider VPC for Lambda functions
- Use security groups and NACLs
- Enable VPC Flow Logs

### 5. Monitoring & Auditing
- CloudWatch Logs enabled
- CloudTrail for API auditing
- Audit table with 180-day retention

---

## Cost Optimization

### Current Estimated Monthly Cost
- Lambda: $20-50 (16 functions, ~1M invocations)
- DynamoDB: $10-100 (PAY_PER_REQUEST)
- S3: $2-10 (~100GB storage)
- CloudWatch: $5-20 (logs + metrics)
- **Total (excluding messaging)**: $37-180/month

### Optimization Tips
1. **Lambda**: Right-size memory allocation
2. **DynamoDB**: Use TTL for automatic cleanup
3. **S3**: Enable lifecycle policies for old media
4. **CloudWatch**: Set log retention to 30 days
5. **SQS**: Use long polling to reduce API calls

---

## Support

### Documentation
- [AWS Resources](../aws/RESOURCES.md)
- [IAM Policies](../../amplify/iam-policies.ts)
- [Backend Configuration](../../amplify/backend.ts)

### AWS Support
- Account: 809904170947
- Region: us-east-1
- Support Plan: [Your Plan]

### Contact
- Development Team: [Your Team Email]
- On-Call: [Your On-Call Contact]

---

**Last Updated**: 2026-01-18
