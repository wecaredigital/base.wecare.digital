import { defineFunction } from '@aws-amplify/backend';

export const bulkJobCreate = defineFunction({
  name: 'bulk-job-create',
  entry: './handler.py',
  runtime: 20,
  timeoutSeconds: 60,
  memoryMB: 512,
  environment: {
    AWS_REGION: 'us-east-1',
    LOG_LEVEL: 'INFO',
    BULK_CONFIRMATION_THRESHOLD: '20',
    BULK_CHUNK_SIZE: '100',
    REPORT_BUCKET: 'stream.wecare.digital',
  },
});
