#!/bin/bash
# AWS Resource Verification Scripts
# Run these in AWS CloudShell (us-east-1)
# Copy output and provide to development team for aws-resources.md update

echo "=========================================="
echo "AWS Resource Verification - us-east-1"
echo "Account: 809904170947"
echo "Date: $(date)"
echo "=========================================="
echo ""

# Set region
export AWS_REGION=us-east-1

echo "=== 1. Cognito User Pool ==="
aws cognito-idp describe-user-pool --user-pool-id us-east-1_CC9u1fYh6 --query 'UserPool.{Id:Id,Name:Name,Status:Status,CreationDate:CreationDate}' --output table 2>/dev/null || echo "ERROR: User Pool not found or no access"
echo ""

echo "=== 2. S3 Buckets ==="
echo "Checking auth.wecare.digital..."
aws s3api head-bucket --bucket auth.wecare.digital 2>/dev/null && echo "✓ Bucket exists" || echo "✗ Bucket not found"
aws s3 ls s3://auth.wecare.digital/whatsapp-media/ 2>/dev/null | head -5
echo ""

echo "Checking stream.wecare.digital..."
aws s3api head-bucket --bucket stream.wecare.digital 2>/dev/null && echo "✓ Bucket exists" || echo "✗ Bucket not found"
aws s3 ls s3://stream.wecare.digital/base-wecare-digital/ 2>/dev/null | head -5
echo ""

echo "=== 3. SNS Topic ==="
aws sns get-topic-attributes --topic-arn arn:aws:sns:us-east-1:809904170947:base-wecare-digital --query 'Attributes.{DisplayName:DisplayName,SubscriptionsConfirmed:SubscriptionsConfirmed,SubscriptionsPending:SubscriptionsPending}' --output table 2>/dev/null || echo "ERROR: SNS Topic not found"
echo ""

echo "=== 4. Pinpoint SMS Pool ==="
aws pinpoint-sms-voice-v2 describe-pools --pool-ids pool-6fbf5a5f390d4eeeaa7dbae39d78933e --query 'Pools[0].{PoolId:PoolId,Status:Status,MessageType:MessageType}' --output table 2>/dev/null || echo "ERROR: SMS Pool not found"
echo ""

echo "=== 5. SES Verified Identity ==="
aws ses get-identity-verification-attributes --identities one@wecare.digital --query 'VerificationAttributes."one@wecare.digital".VerificationStatus' --output text 2>/dev/null || echo "ERROR: SES identity not found"
aws ses get-identity-dkim-attributes --identities one@wecare.digital --query 'DkimAttributes."one@wecare.digital".DkimVerificationStatus' --output text 2>/dev/null
echo ""

echo "=== 6. IAM Role ==="
aws iam get-role --role-name base-wecare-digital --query 'Role.{RoleName:RoleName,Arn:Arn,CreateDate:CreateDate}' --output table 2>/dev/null || echo "ERROR: IAM Role not found"
echo ""

echo "=== 7. Bedrock Knowledge Base (Optional) ==="
aws bedrock-agent get-knowledge-base --knowledge-base-id FZBPKGTOYE --query 'knowledgeBase.{Id:knowledgeBaseId,Name:name,Status:status}' --output table 2>/dev/null || echo "INFO: Bedrock KB not found (optional)"
echo ""

echo "=== 8. Bedrock Agent (Optional) ==="
aws bedrock-agent get-agent --agent-id HQNT0JXN8G --query 'agent.{Id:agentId,Name:agentName,Status:agentStatus}' --output table 2>/dev/null || echo "INFO: Bedrock Agent not found (optional)"
echo ""

echo "=== 9. Amplify App ==="
aws amplify list-apps --query 'apps[?name==`base-wecare-digital`].{Name:name,AppId:appId,DefaultDomain:defaultDomain}' --output table 2>/dev/null || echo "INFO: Amplify app not found yet (will be created)"
echo ""

echo "=== 10. DynamoDB Tables ==="
echo "Checking for existing tables with prefix 'base-wecare-digital'..."
aws dynamodb list-tables --query 'TableNames[?starts_with(@, `base-wecare-digital`)]' --output table 2>/dev/null || echo "INFO: No DynamoDB tables found yet (will be created)"
echo ""

echo "=== 11. SQS Queues ==="
echo "Checking for existing queues with prefix 'base-wecare-digital'..."
aws sqs list-queues --queue-name-prefix base-wecare-digital --query 'QueueUrls' --output table 2>/dev/null || echo "INFO: No SQS queues found yet (will be created)"
echo ""

echo "=== 12. Lambda Functions ==="
echo "Checking for existing functions with prefix 'base-wecare-digital'..."
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `base-wecare-digital`)].{Name:FunctionName,Runtime:Runtime,LastModified:LastModified}' --output table 2>/dev/null || echo "INFO: No Lambda functions found yet (will be created)"
echo ""

echo "=== 13. CloudWatch Log Groups ==="
aws logs describe-log-groups --log-group-name-prefix /base-wecare-digital --query 'logGroups[].{Name:logGroupName,CreationTime:creationTime}' --output table 2>/dev/null || echo "INFO: No log groups found yet (will be created)"
echo ""

echo "=== 14. AWS End User Messaging Social ==="
echo "Checking WhatsApp Business Accounts..."
aws socialmessaging list-linked-whatsapp-business-accounts --query 'linkedAccounts[].{Id:id,PhoneNumberId:phoneNumberId,Status:linkStatus}' --output table 2>/dev/null || echo "INFO: No WhatsApp accounts linked yet or service not available"
echo ""

echo "=========================================="
echo "Verification Complete"
echo "=========================================="
echo ""
echo "INSTRUCTIONS:"
echo "1. Copy all output above"
echo "2. Provide to development team"
echo "3. Team will update aws-resources.md with actual values"
echo ""
