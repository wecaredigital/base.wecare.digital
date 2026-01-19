import { defineFunction } from '@aws-amplify/backend';

export const messagesRead = defineFunction({
  name: 'wecare-messages-read',
  entry: './handler.py',
  runtime: 20,
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    INBOUND_TABLE: 'base-wecare-digital-WhatsAppInboundTable',
    OUTBOUND_TABLE: 'base-wecare-digital-WhatsAppOutboundTable',
    LOG_LEVEL: 'INFO',
  },
});
