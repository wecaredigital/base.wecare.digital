# Base WeCare Digital

Monorepo for WeCare Digital platform with Next.js frontend and AWS Amplify backend.

## Project Structure

```
base.wecare.digital/
├── src/                    # Next.js frontend
├── amplify/                # AWS Amplify backend
│   ├── backend.ts         # Backend definition
│   ├── functions/         # Lambda functions
│   └── package.json
├── amplify.yml            # Build configuration
├── package.json           # Root dependencies
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- AWS CLI configured
- Git

### Installation

```bash
npm install
cd amplify && npm install && cd ..
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Deployment

### Frontend
Deployed to AWS Amplify + CloudFront + S3

### Backend
Deployed to AWS Lambda + DynamoDB + AppSync

## Features

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: AWS Amplify Gen 2
- **Database**: DynamoDB (11 tables)
- **Functions**: 16 Lambda functions
- **Messaging**: WhatsApp, SMS, Email
- **Authentication**: Cognito

## License

Proprietary - WeCare Digital
