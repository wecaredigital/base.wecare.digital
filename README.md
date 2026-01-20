# WECARE.DIGITAL Admin Platform

**Status:** ✅ Production Ready  
**Latest Version:** 1.0.0  
**Last Updated:** January 20, 2026

---

## 📋 Project Overview

WECARE.DIGITAL is a multi-channel messaging admin platform built with Next.js and AWS Amplify. It enables businesses to send and receive messages across WhatsApp, SMS, Email, and Voice channels with a unified inbox interface.

### Key Features

- **Unified Inbox** - Single interface for all messaging channels
- **WhatsApp Integration** - Full WhatsApp Cloud API support with media handling
- **Multi-Channel Support** - SMS, Email, Voice, RCS messaging
- **Contact Management** - Create, update, delete, and search contacts
- **Media Support** - Images, videos, audio, documents with proper display
- **Bulk Messaging** - Send messages to multiple contacts
- **Message History** - Complete message tracking and storage
- **Real-time Updates** - Live message synchronization

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- AWS Account with Amplify configured
- WhatsApp Business Account (for WhatsApp features)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Access Dashboard
- **Development:** http://localhost:3000
- **Production:** https://base.wecare.digital

---

## 📊 Architecture

### Frontend
- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** CSS with responsive design
- **Components:** React with hooks

### Backend
- **Platform:** AWS Amplify Gen 2
- **Compute:** Lambda functions
- **Database:** DynamoDB
- **Storage:** S3
- **Messaging:** AWS Social Messaging API

### Infrastructure
- **Region:** us-east-1
- **Auth:** Cognito User Pools
- **API:** HTTP API Gateway
- **Monitoring:** CloudWatch

---

## 📁 Project Structure

```
.
├── src/                          # Frontend source code
│   ├── components/               # React components
│   ├── lib/                      # Utilities and API client
│   └── pages/                    # Next.js pages
├── amplify/                      # AWS Amplify backend
│   ├── backend.ts                # Backend configuration
│   ├── auth/                     # Authentication resources
│   ├── data/                     # Data resources
│   ├── functions/                # Lambda functions
│   ├── monitoring/               # CloudWatch alarms
│   └── storage/                  # S3 storage resources
├── docs/                         # Documentation
│   ├── aws/                      # AWS API reference
│   └── deployment/               # Deployment guides
├── temp/                         # Test scripts
├── tests/                        # Test suite
└── public/                       # Static files
```

---

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_ENDPOINT=https://api.wecare.digital
NEXT_PUBLIC_AUTH_DOMAIN=sso.wecare.digital
```

**Backend (amplify/backend.ts):**
```typescript
SEND_MODE=LIVE              # LIVE or DRY_RUN
LOG_LEVEL=INFO              # DEBUG, INFO, WARN, ERROR
MEDIA_BUCKET=auth.wecare.digital
```

---

## 📱 Supported Channels

### WhatsApp
- ✅ Text messages
- ✅ Media (images, videos, audio, documents)
- ✅ Templates
- ✅ Reactions
- ✅ Multiple WABAs

### SMS
- ✅ AWS SNS
- ✅ Airtel SMS

### Email
- ✅ AWS SES

### Voice
- ✅ AWS Connect
- ✅ Airtel Voice

---

## 📊 Media Support

### Supported Formats

**Images (Max 5MB)**
- JPEG, PNG, WebP

**Videos (Max 16MB)**
- MP4, 3GP

**Audio (Max 16MB)**
- MP3, OGG, AAC, AMR, MP4

**Documents (Max 100MB)**
- PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT

**Stickers (Max 500KB)**
- WebP

---

## 🧪 Testing

### Test Scripts

Located in `temp/` directory:

```bash
# Test media sending
node temp/send-test-media.js

# Test PDF sending
node temp/send-test-pdf.js

# Test text sending
node temp/test-send-text.js

# Check media in database
node temp/check-media-in-db.js

# Test S3 upload
node temp/test-s3-upload.js
```

### Running Tests

```bash
# Run test suite
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## 📚 Documentation

### Essential Docs
- **EXECUTIVE_SUMMARY.md** - High-level feature overview
- **MEDIA_TYPE_FIX_REPORT.md** - Media type support details
- **CHANGELOG.md** - Version history and changes

### AWS Documentation
- **docs/aws/WHATSAPP-API-REFERENCE.md** - WhatsApp API reference
- **docs/aws/RESOURCES.md** - AWS resources documentation

### Deployment
- **docs/deployment/GUIDE.md** - Deployment procedures

---

## 🔐 Security

### Authentication
- AWS Cognito User Pools
- OAuth 2.0 with PKCE
- JWT tokens

### Authorization
- Role-based access control
- IAM policies for AWS resources
- API Gateway authorization

### Data Protection
- Encryption at rest (DynamoDB, S3)
- Encryption in transit (HTTPS/TLS)
- Secure credential management

---

## 📈 Performance

### Optimization
- Server-side rendering (Next.js)
- Static site generation where applicable
- Image optimization
- Code splitting
- Lazy loading

### Monitoring
- CloudWatch metrics
- CloudWatch logs
- Lambda performance tracking
- API response times

---

## 🐛 Troubleshooting

### Common Issues

**Media not displaying:**
1. Check S3 bucket permissions
2. Verify pre-signed URL generation
3. Check CloudWatch logs
4. Verify CORS settings

**Messages not sending:**
1. Check Lambda logs
2. Verify phone number format
3. Check rate limits
4. Verify API credentials

**Dashboard not loading:**
1. Clear browser cache
2. Check authentication
3. Verify API endpoint
4. Check network connectivity

---

## 📞 Support

### Resources
- AWS Amplify Documentation: https://docs.amplify.aws
- Next.js Documentation: https://nextjs.org/docs
- WhatsApp Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api

### Logs
- **Frontend:** Browser console (F12)
- **Backend:** CloudWatch logs
- **API:** API Gateway logs

---

## 📝 Recent Changes

### Latest Fix (January 20, 2026)
- ✅ Fixed media type support - all file types now supported
- ✅ Expanded file input accept attribute
- ✅ Added support for PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, WebP, 3GP, AAC, AMR

### Previous Updates
- ✅ Media display for all types (images, videos, audio, documents)
- ✅ Sender name capture and display
- ✅ Pre-signed URL generation for S3 media
- ✅ Enhanced logging and error handling

See **CHANGELOG.md** for complete version history.

---

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run start
```

### AWS Amplify
```bash
# Deploy backend
npx ampx pipeline-deploy --branch base --app-id <app-id>

# Deploy frontend
amplify push --only hosting --yes
```

---

## 📊 Project Stats

- **Frontend:** TypeScript, React, Next.js
- **Backend:** Python, AWS Lambda
- **Database:** DynamoDB
- **Storage:** S3
- **API:** HTTP API Gateway
- **Monitoring:** CloudWatch

---

## ✨ Features Implemented

### Core Features
- ✅ Multi-channel messaging
- ✅ Unified inbox
- ✅ Contact management
- ✅ Message history
- ✅ Media support

### WhatsApp Features
- ✅ Text messages
- ✅ Media messages (all types)
- ✅ Template messages
- ✅ Reactions
- ✅ Multiple WABAs
- ✅ Sender name display
- ✅ Message status tracking

### Admin Features
- ✅ Bulk messaging
- ✅ Message templates
- ✅ Contact search
- ✅ Message filtering
- ✅ Activity logs

---

## 🎯 Next Steps

1. **Deploy to Production**
   - Run Amplify deployment
   - Verify all features working
   - Monitor CloudWatch logs

2. **Test All Features**
   - Send messages across all channels
   - Test media sending
   - Verify message display

3. **Monitor Performance**
   - Check CloudWatch metrics
   - Monitor error rates
   - Track response times

4. **Gather Feedback**
   - User testing
   - Performance optimization
   - Feature enhancements

---

## 📄 License

Proprietary - WECARE.DIGITAL

---

## 👥 Team

**Development:** WECARE.DIGITAL Team  
**Last Updated:** January 20, 2026  
**Status:** ✅ Production Ready

---

**For more information, see EXECUTIVE_SUMMARY.md or CHANGELOG.md**

