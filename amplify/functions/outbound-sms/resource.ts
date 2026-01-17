import { defineFunction } from '@aws-amplify/backend';

export const outboundSms = defineFunction({
  name: 'outbound-sms',
  entry: './handler.py',
  runtime: 20,
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    AWS_REGION: 'us-east-1',
    LOG_LEVEL: 'INFO',
    SEND_MODE: process.env.SEND_MODE || 'DRY_RUN',
    SMS_POOL_ID: 'pool-6fbf5a5f390d4eeeaa7dbae39d78933e',
  },
});
