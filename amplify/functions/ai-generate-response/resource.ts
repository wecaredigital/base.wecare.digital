import { defineFunction } from '@aws-amplify/backend';

export const aiGenerateResponse = defineFunction({
  name: 'ai-generate-response',
  entry: './handler.py',
  runtime: 20,
  timeoutSeconds: 120,
  memoryMB: 512,
  environment: {
    AWS_REGION: 'us-east-1',
    LOG_LEVEL: 'INFO',
    BEDROCK_AGENT_ID: 'HQNT0JXN8G',
    SEND_MODE: process.env.SEND_MODE || 'DRY_RUN',
  },
});
