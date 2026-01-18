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
  IAM_ROLE_NAME: 'base-wecare-digital',
  IAM_ROLE_CREATED: '2026-01-14',
};

// Cognito
export const COGNITO_CONFIG = {
  USER_POOL_ID: 'us-east-1_CC9u1fYh6',
  USER_POOL_NAME: 'WECARE.DIGITAL',
  STATUS: 'Active',
  CREATED: '2026-01-14',
};

// WhatsApp (AWS End User Messaging Social)
export const WHATSAPP_CONFIG = {
  // Phone Number 1: WECARE.DIGITAL
  PHONE_NUMBER_ID_1: 'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54',
  META_PHONE_NUMBER_ID_1: '831049713436137',
  DISPLAY_NUMBER_1: '+91 93309 94400',
  DISPLAY_NAME_1: 'WECARE.DIGITAL',
  WABA_ID_1: 'waba-0aae9cf04cf24c66960f291c793359b4',
  META_WABA_ID_1: '1347766229904230',
  
  // Phone Number 2: Manish Agarwal
  PHONE_NUMBER_ID_2: 'phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06',
  META_PHONE_NUMBER_ID_2: '888782840987368',
  DISPLAY_NUMBER_2: '+91 99033 00044',
  DISPLAY_NAME_2: 'Manish Agarwal',
  WABA_ID_2: 'waba-9bbe054d8404487397c38a9d197bc44a',
  META_WABA_ID_2: '1390647332755815',
  
  // Allowlist
  ALLOWLIST: [
    'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54',
    'phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06',
  ],
  
  // Configuration
  META_API_VERSION: 'v20.0',
  RATE_LIMIT_PER_PHONE: 80, // messages per second
  API_RATE_LIMIT: 1000, // requests per second (account level)
  QUALITY_RATING: 'GREEN', // Both phone numbers have GREEN rating
};

// SMS (Pinpoint)
export const SMS_CONFIG = {
  POOL_ID: 'pool-6fbf5a5f390d4eeeaa7dbae39d78933e',
  POOL_NAME: 'WECARE-DIGITAL',
  POOL_ARN: 'arn:aws:sms-voice:us-east-1:809904170947:pool/pool-6fbf5a5f390d4eeeaa7dbae39d78933e',
  MESSAGE_TYPE: 'TRANSACTIONAL',
  STATUS: 'ACTIVE',
  RATE_LIMIT: 5, // messages per second
};

// Email (SES)
export const EMAIL_CONFIG = {
  SENDER_EMAIL: 'one@wecare.digital',
  SENDER_NAME: 'WECARE.DIGITAL',
  VERIFICATION_STATUS: 'Success',
  DKIM_STATUS: 'Configured',
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
  DISPLAY_NAME: 'base-wecare-digital',
  SUBSCRIPTIONS_CONFIRMED: 0, // Will be configured during deployment
};

// Bedrock AI
export const BEDROCK_CONFIG = {
  KB_ID: 'FZBPKGTOYE',
  AGENT_ID: 'HQNT0JXN8G',
  AGENT_NAME: 'base-bedrock-agent',
  AGENT_STATUS: 'NOT_PREPARED', // Will be prepared on first use
  AGENT_RUNTIME_ID: 'base_bedrock_agentcore-1XHDxj2o3Q', // Internal admin dashboard
  FOUNDATION_MODEL: 'amazon.nova-pro-v1:0',
  SESSION_MEMORY_DAYS: 30,
  SESSION_MEMORY_MAX_SESSIONS: 20,
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

// SQS Queues
export const SQS_CONFIG = {
  INBOUND_DLQ: 'base-wecare-digital-inbound-dlq',
  BULK_QUEUE: 'base-wecare-digital-bulk-queue',
  BULK_DLQ: 'base-wecare-digital-bulk-dlq',
  OUTBOUND_DLQ: 'base-wecare-digital-outbound-dlq',
  WHATSAPP_INBOUND_DLQ: 'base-wecare-digital-whatsapp-inbound-dlq',
  VISIBILITY_TIMEOUT: 300, // seconds
  RETENTION_PERIOD_DLQ: 604800, // 7 days in seconds
  RETENTION_PERIOD_BULK: 86400, // 1 day in seconds
};

// WhatsApp Business Tier
export const TIER_CONFIG = {
  TIER_1_LIMIT: 250, // conversations per 24 hours
  ALERT_THRESHOLD: 0.8, // 80%
};
