import { defineFunction } from '@aws-amplify/backend';

export const contactsRead = defineFunction({
  name: 'contacts-read',
  entry: './handler.py',
  runtime: 20,
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: { AWS_REGION: 'us-east-1', LOG_LEVEL: 'INFO' },
});
