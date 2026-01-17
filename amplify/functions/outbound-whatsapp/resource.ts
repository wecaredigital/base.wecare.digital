import { defineFunction } from '@aws-amplify/backend';

export const outboundWhatsapp = defineFunction({
  name: 'outbound-whatsapp',
  entry: './handler.py',
  runtime: 20,
  timeoutSeconds: 60,
  memoryMB: 512,
  environment: {
    AWS_REGION: 'us-east-1',
    LOG_LEVEL: 'INFO',
    SEND_MODE: process.env.SEND_MODE || 'DRY_RUN',
    WHATSAPP_PHONE_NUMBER_ID_1: 'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54',
    WHATSAPP_PHONE_NUMBER_ID_2: 'phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06',
    MEDIA_BUCKET: 'auth.wecare.digital',
    MEDIA_OUTBOUND_PREFIX: 'whatsapp-media/whatsapp-media-outgoing/',
  },
});
