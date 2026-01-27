import { defineFunction } from '@aws-amplify/backend';

export const voiceCallsRead = defineFunction({
  name: 'wecare-voice-calls-read',
  entry: './handler.py',
  runtime: 20, // Python 3.12
  timeoutSeconds: 10,
  memoryMB: 128,
  environment: {
    VOICE_CALLS_TABLE: 'base-wecare-digital-VoiceCalls',
    LOG_LEVEL: 'INFO',
  },
});
