import { defineFunction } from '@aws-amplify/backend';

export const dlqReplay = defineFunction({
  name: 'dlq-replay',
  entry: './handler.py',
  runtime: 20,
  timeoutSeconds: 60,
  memoryMB: 256,
  environment: { AWS_REGION: 'us-east-1', LOG_LEVEL: 'INFO', MAX_RETRIES: '5', BATCH_SIZE: '100' },
});
