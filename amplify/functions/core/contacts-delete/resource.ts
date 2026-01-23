import { defineFunction } from '@aws-amplify/backend';

export const contactsDelete = defineFunction({
  name: 'contacts-delete',
  entry: './handler.py',
  runtime: 20,
  timeoutSeconds: 60, // Increased for hard delete operations
  memoryMB: 256,
  environment: { 
    AWS_REGION: 'us-east-1', 
    CONTACTS_TABLE: 'base-wecare-digital-ContactsTable',
    INBOUND_TABLE: 'base-wecare-digital-WhatsAppInboundTable',
    OUTBOUND_TABLE: 'base-wecare-digital-WhatsAppOutboundTable',
    MEDIA_BUCKET: 'auth.wecare.digital',
    LOG_LEVEL: 'INFO' 
  },
});
