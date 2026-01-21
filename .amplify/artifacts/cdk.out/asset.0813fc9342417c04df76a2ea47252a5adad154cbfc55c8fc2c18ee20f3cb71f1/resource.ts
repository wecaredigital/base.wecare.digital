import { defineFunction } from '@aws-amplify/backend';

export const outboundVoice = defineFunction({
  name: 'outbound-voice',
  entry: './handler.py',
  runtime: 20, // Python 3.12
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    MESSAGES_TABLE: 'base-wecare-digital-Messages',
    VOICE_CALLS_TABLE: 'base-wecare-digital-VoiceCalls',
    VOICE_ORIGINATION_IDENTITY: '',
    AIRTEL_IQ_API_KEY: '',
    AIRTEL_IQ_API_URL: 'https://iqapi.airtel.in/gateway/airtel-xchange/basic/v1',
  },
});
