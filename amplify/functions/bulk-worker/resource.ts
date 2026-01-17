import { defineFunction } from '@aws-amplify/backend';

export const bulkWorker = defineFunction({
  name: 'bulk-worker',
  entry: './handler.py',
  runtime: 20,
  timeoutSeconds: 300,
  memoryMB: 512,
  environment: {
    AWS_REGION: 'us-east-1',
    LOG_LEVEL: 'INFO',
    SEND_MODE: process.env.SEND_MODE || 'DRY_RUN',
    REPORT_BUCKET: 'stream.wecare.digital',
    REPORT_PREFIX: 'base-wecare-digital/reports/',
  },
});
