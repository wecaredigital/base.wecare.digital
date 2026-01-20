import { defineFunction } from '@aws-amplify/backend';

export const messagesDelete = defineFunction({
  name: 'wecare-messages-delete',
  entry: './handler.py',
  runtime: 20, // Python 3.12
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    WHATSAPP_INBOUND_TABLE: 'base-wecare-digital-WhatsAppInboundTable',
    WHATSAPP_OUTBOUND_TABLE: 'base-wecare-digital-WhatsAppOutboundTable',
  },
});
