import { defineFunction } from '@aws-amplify/backend';

export const aiQueryKb = defineFunction({
  name: 'ai-query-kb',
  entry: './handler.py',
  runtime: 20,
  timeoutSeconds: 60,
  memoryMB: 512,
  environment: {
    AWS_REGION: 'us-east-1',
    LOG_LEVEL: 'INFO',
    BEDROCK_KB_ID: 'FZBPKGTOYE',
  },
});
