import { defineFunction } from '@aws-amplify/backend';

export const messagesRead = defineFunction({
  name: 'wecare-messages-read',
  entry: './handler.py',
  runtime: 20,
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    MESSAGES_TABLE: 'Messages',
    LOG_LEVEL: 'INFO',
  },
});
