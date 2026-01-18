# WECARE.DIGITAL Deployment Verification Guide

## Deployment Status

### Feature Branch (Preview)
- **Branch**: `feature/initial-deployment`
- **SEND_MODE**: `DRY_RUN`
- **Status**: Pushed to GitHub - Awaiting Amplify CI/CD

### Production Branch
- **Branch**: `main`
- **SEND_MODE**: `LIVE`
- **Status**: Pending merge from `base`

---

## AWS CLI Verification Commands

Run these commands after Amplify deployment completes to verify resources.

### 1. Verify Lambda Functions

```bash
# List all Lambda functions with 'wecare' prefix
aws lambda list-functions --region us-east-1 --query "Functions[?contains(FunctionName, 'wecare') || contains(FunctionName, 'base')].{Name:FunctionName,Runtime:Runtime,State:State}" --output table

# Check specific function configuration
aws lambda get-function-configuration --function-name <function-name> --region us-east-1
```

### 2. Verify DynamoDB Tables

```bash
# List all DynamoDB tables
aws dynamodb list-tables --region us-east-1 --output table

# Check table details (replace TABLE_NAME)
aws dynamodb describe-table --table-name <table-name> --region us-east-1 --query "Table.{Name:TableName,Status:TableStatus,ItemCount:ItemCount,TTL:TimeToLiveDescription}"
```

### 3. Verify SQS Queues

```bash
# List SQS queues
aws sqs list-queues --region us-east-1 --query "QueueUrls[?contains(@, 'wecare') || contains(@, 'bulk') || contains(@, 'dlq')]"
```

### 4. Verify S3 Buckets

```bash
# Check bucket exists
aws s3 ls | grep wecare

# List bucket contents
aws s3 ls s3://auth.wecare.digital/ --recursive --summarize
aws s3 ls s3://stream.wecare.digital/ --recursive --summarize
```

### 5. Verify CloudWatch Alarms

```bash
# List CloudWatch alarms
aws cloudwatch describe-alarms --region us-east-1 --query "MetricAlarms[?contains(AlarmName, 'WECARE') || contains(AlarmName, 'wecare')].{Name:AlarmName,State:StateValue}" --output table
```

### 6. Verify Cognito User Pool

```bash
# Get user pool details
aws cognito-idp describe-user-pool --user-pool-id us-east-1_CC9u1fYh6 --region us-east-1 --query "UserPool.{Name:Name,Status:Status,Id:Id}"
```

### 7. Verify SNS Topic

```bash
# Check SNS topic
aws sns get-topic-attributes --topic-arn arn:aws:sns:us-east-1:809904170947:base-wecare-digital --region us-east-1
```

### 8. Verify Bedrock Resources

```bash
# List Bedrock agents
aws bedrock-agent list-agents --region us-east-1 --query "agentSummaries[?contains(agentName, 'wecare') || agentId=='HQNT0JXN8G'].{Name:agentName,Id:agentId,Status:agentStatus}"

# Check Knowledge Base
aws bedrock-agent get-knowledge-base --knowledge-base-id FZBPKGTOYE --region us-east-1
```

---

## API Endpoint Testing

After deployment, test the API endpoints:

### Contacts API
```bash
# Create contact (DRY_RUN mode)
curl -X POST https://<api-endpoint>/contacts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "phone": "+919330994400", "email": "test@example.com"}'

# Get contact
curl -X GET https://<api-endpoint>/contacts/<contactId> \
  -H "Authorization: Bearer <token>"

# Search contacts
curl -X GET "https://<api-endpoint>/contacts/search?query=test" \
  -H "Authorization: Bearer <token>"
```

### Messaging API
```bash
# Send WhatsApp message (DRY_RUN - will not actually send)
curl -X POST https://<api-endpoint>/messages/whatsapp \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"contactId": "<contactId>", "content": "Test message"}'
```

---

## CloudWatch Logs Verification

```bash
# View recent logs for a Lambda function
aws logs filter-log-events \
  --log-group-name /aws/lambda/<function-name> \
  --region us-east-1 \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --limit 50
```

---

## Production Deployment Steps

Once preview deployment is verified:

1. **Merge to main**:
   ```bash
   git checkout main
   git merge base
   git push origin main
   ```

2. **Verify SEND_MODE=LIVE** in production Lambda environment variables

3. **Monitor CloudWatch** for any errors during initial production traffic

---

## Rollback Procedure

If issues are found:

1. **Revert commit**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Or use Amplify Console** to redeploy previous version

---

## Checklist

- [ ] Feature branch pushed to GitHub
- [ ] Amplify preview deployment started
- [ ] Lambda functions deployed
- [ ] DynamoDB tables created with TTL
- [ ] SQS queues created
- [ ] CloudWatch alarms configured
- [ ] API endpoints accessible
- [ ] SEND_MODE=DRY_RUN verified in preview
- [ ] Production deployment (main branch)
- [ ] SEND_MODE=LIVE verified in production
- [ ] CloudWatch metrics flowing

---

*Last Updated: January 18, 2026*
