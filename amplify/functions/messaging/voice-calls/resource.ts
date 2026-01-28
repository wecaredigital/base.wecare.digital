import { defineFunction } from '@aws-amplify/backend';

export const voiceCalls = defineFunction({
  name: 'wecare-voice-calls',
  entry: './handler.py',
  runtime: 20, // Python 3.12
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    AWS_REGION: 'us-east-1',
    LOG_LEVEL: 'INFO',
    CONTACTS_TABLE: 'base-wecare-digital-ContactsTable',
    VOICE_CALLS_TABLE: 'base-wecare-digital-VoiceCalls',
    CONNECT_INSTANCE_ID: '',
    CONNECT_CONTACT_FLOW_ID: '',
    CONNECT_QUEUE_ID: '',
    SOURCE_PHONE_NUMBER: '',
  },
});
