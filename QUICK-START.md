# Quick Start Guide

Get up and running with WECARE.DIGITAL in minutes.

---

## 🚀 For Developers

### Setup (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/wecaredigital/repository.git
cd base.wecare.digital

# 2. Install dependencies
npm install

# 3. Start development
npm run dev
```

Access at: http://localhost:3000

### Deploy to Production

```bash
git checkout base
git push origin base
```

That's it! Amplify CI/CD handles the rest.

---

## 📚 For Documentation

### Quick Links
- [Full Documentation](docs/README.md)
- [AWS Resources](docs/aws/RESOURCES.md)
- [Deployment Guide](docs/deployment/GUIDE.md)
- [Project Status](PROJECT-STATUS.md)

### File Structure
```
docs/
├── README.md              # Start here
├── aws/
│   ├── RESOURCES.md       # All AWS resources
│   └── INFRASTRUCTURE-STATUS.md
└── deployment/
    └── GUIDE.md           # How to deploy
```

---

## ☁️ For AWS Resources

### Quick Reference

**Account**: 809904170947  
**Region**: us-east-1  
**Branch**: base (production)

**Key Resources**:
- Lambda Functions: 16 active
- DynamoDB Tables: 11 active
- SQS Queues: 5 active
- WhatsApp Numbers: 2 (GREEN rating)

See [AWS Resources](docs/aws/RESOURCES.md) for complete list.

---

## 🔧 For Troubleshooting

### Common Commands

```bash
# View Lambda logs
aws logs tail /aws/lambda/wecare-contacts-create --follow

# Check SQS queues
aws sqs list-queues --region us-east-1

# List Lambda functions
aws lambda list-functions --region us-east-1 --query "Functions[?contains(FunctionName, 'wecare')].FunctionName"

# Check DynamoDB tables
aws dynamodb list-tables --region us-east-1
```

### Quick Fixes

**Lambda timeout?**
→ Increase timeout in `amplify/functions/*/resource.ts`

**Rate limit hit?**
→ Check `RateLimitTracker` DynamoDB table

**DLQ messages?**
→ Use `wecare-dlq-replay` Lambda function

---

## 📞 Need Help?

1. Check [Deployment Guide](docs/deployment/GUIDE.md#troubleshooting)
2. Review [AWS Resources](docs/aws/RESOURCES.md)
3. Check CloudWatch Logs
4. Contact development team

---

## 🎯 Next Steps

### After Setup
1. ✓ Review [Project Status](PROJECT-STATUS.md)
2. ⏳ Create CloudWatch Alarms
3. ⏳ Create CloudWatch Dashboard
4. ⏳ Subscribe to SNS notifications

### For Production
1. Enable DynamoDB Point-in-Time Recovery
2. Configure S3 Lifecycle Policies
3. Set up CloudTrail
4. Review security settings

---

**Status**: ✓ PRODUCTION READY  
**Last Updated**: 2026-01-18
