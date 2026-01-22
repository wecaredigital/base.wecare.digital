import { defineFunction } from '@aws-amplify/backend';

export const contactsDelete = defineFunction({
  name: 'contacts-delete',
  entry: './handler.py',
  runtime: 20,
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: { 
    AWS_REGION: 'us-east-1', 
    CONTACTS_TABLE: 'base-wecare-digital-ContactsTable',
    LOG_LEVEL: 'INFO' 
  },
});
