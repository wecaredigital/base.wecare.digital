import { defineFunction } from '@aws-amplify/backend';

export const outboundSms = defineFunction({
  name: 'wecare-outbound-sms',
  entry: './handler.py',
  runtime: 20, // Python 3.12
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    AWS_REGION: 'us-east-1',
    LOG_LEVEL: 'INFO',
    CONTACTS_TABLE: 'base-wecare-digital-ContactsTable',
    MESSAGES_TABLE: 'base-wecare-digital-MessagesTable',
    PINPOINT_APP_ID: '',
    ORIGINATION_NUMBER: '',
    SENDER_ID: 'WECARE',
  },
});
