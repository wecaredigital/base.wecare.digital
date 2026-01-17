/**
 * Shared Lambda Configuration
 * 
 * Environment variables and settings shared across all Lambda functions
 */

// AWS Resources
export const AWS_CONFIG = {
  REGION: 'us-east-1',
  ACCOUNT_ID: '809904170947',
  IAM_ROLE: 'arn:aws:iam::809904170947:role/base-wecare-digital',
};

// Cognito
export const COGNITO_CONFIG = {
  USER_POOL_ID: 'us-east-1_CC9u1fYh6',
};

// WhatsApp (AWS End User Messaging Social)
export const WHATSAPP_CONFIG = {
  PHONE_NUMBER_ID_1: 'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54',
  PHONE_NUMBER_ID_2: 'phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06',
  ALLOWLIST: [
    'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54',
    'phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06',
  ],
  META_API_VERSION: 'v20.0',
  RATE_LIMIT_PER_PHONE: 80, // messages per second
  API_RATE_LIMIT: 1000, // requests per second (account level)
};

// SMS (Pinpoint)
export const SMS_CONFIG = {
  POOL_ID: 'pool-6fbf5a5f390d4eeeaa7dbae39d78933e',
  POOL_ARN: 'arn:aws:sms-voice:us-east-1:809904170947:pool/pool-6fbf5a5f390d4eeeaa7dbae39d78933e',
  RATE_LIMIT: 5, // messages per second
};

// Email (SES)
export const EMAIL_CONFIG = {
  SENDER_EMAIL: 'one@wecare.digital',
  SENDER_NAME: 'WECARE.DIGITAL',
  RATE_LIMIT: 10, // messages per second
};

// S3 Buckets
export const S3_CONFIG = {
  MEDIA_BUCKET: 'auth.wecare.digital',
  MEDIA_INBOUND_PREFIX: 'whatsapp-media/whatsapp-media-incoming/',
  MEDIA_OUTBOUND_PREFIX: 'whatsapp-media/whatsapp-media-outgoing/',
  REPORT_BUCKET: 'stream.wecare.digital',
  REPORT_PREFIX: 'base-wecare-digital/reports/',
};

// SNS
export const SNS_CONFIG = {
  TOPIC_ARN: 'arn:aws:sns:us-east-1:809904170947:base-wecare-digital',
};

// Bedrock AI
export const BEDROCK_CONFIG = {
  KB_ID: 'FZBPKGTOYE',
  AGENT_ID: 'HQNT0JXN8G',
  FOUNDATION_MODEL: 'amazon.nova-pro-v1:0',
};

// CloudWatch
export const CLOUDWATCH_CONFIG = {
  LOG_GROUP: '/base-wecare-digital/common',
};

// Bulk Processing
export const BULK_CONFIG = {
  CONFIRMATION_THRESHOLD: 20,
  CHUNK_SIZE: 100,
  WORKER_CONCURRENCY_MIN: 2,
  WORKER_CONCURRENCY_MAX: 5,
};

// TTL Configuration (in seconds)
export const TTL_CONFIG = {
  MESSAGES: 30 * 24 * 60 * 60, // 30 days = 2,592,000 seconds
  DLQ_MESSAGES: 7 * 24 * 60 * 60, // 7 days = 604,800 seconds
  AUDIT_LOGS: 180 * 24 * 60 * 60, // 180 days = 15,552,000 seconds
  RATE_LIMIT_TRACKERS: 24 * 60 * 60, // 24 hours = 86,400 seconds
};

// DLQ Configuration
export const DLQ_CONFIG = {
  MAX_RETRIES: 5,
  BATCH_SIZE: 100,
};

// WhatsApp Business Tier
export const TIER_CONFIG = {
  TIER_1_LIMIT: 250, // conversations per 24 hours
  ALERT_THRESHOLD: 0.8, // 80%
};
