import { defineFunction } from '@aws-amplify/backend';

export const contactsUpdate = defineFunction({
  name: 'wecare-contacts-update',
  entry: './handler.py',
  runtime: 20,
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    AWS_REGION: 'us-east-1',
    LOG_LEVEL: 'INFO',
    CONTACTS_TABLE: 'base-wecare-digital-ContactsTable',
  },
});
