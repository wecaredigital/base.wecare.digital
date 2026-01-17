import { defineFunction } from '@aws-amplify/backend';

export const outboundEmail = defineFunction({
  name: 'outbound-email',
  entry: './handler.py',
  runtime: 20,
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    AWS_REGION: 'us-east-1',
    LOG_LEVEL: 'INFO',
    SEND_MODE: process.env.SEND_MODE || 'DRY_RUN',
    SES_SENDER_EMAIL: 'one@wecare.digital',
    SES_SENDER_NAME: 'WECARE.DIGITAL',
  },
});
