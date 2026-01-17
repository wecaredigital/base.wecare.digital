import { defineFunction } from '@aws-amplify/backend';

export const inboundWhatsappHandler = defineFunction({
  name: 'inbound-whatsapp-handler',
  entry: './handler.py',
  runtime: 20,
  timeoutSeconds: 60,
  memoryMB: 512,
  environment: {
    AWS_REGION: 'us-east-1',
    LOG_LEVEL: 'INFO',
    MEDIA_BUCKET: 'auth.wecare.digital',
    MEDIA_INBOUND_PREFIX: 'whatsapp-media/whatsapp-media-incoming/',
    SNS_TOPIC_ARN: 'arn:aws:sns:us-east-1:809904170947:base-wecare-digital',
  },
});
