import { defineFunction } from '@aws-amplify/backend';

export const aiGenerateResponse = defineFunction({
  name: 'ai-generate-response',
  entry: './handler.py',
  runtime: 20,
  timeoutSeconds: 120,
  memoryMB: 512,
  environment: {
    AWS_REGION: 'us-east-1',
    LOG_LEVEL: 'INFO',
    SEND_MODE: 'LIVE',
    BEDROCK_AGENT_ID: 'HQNT0JXN8G',
    BEDROCK_AGENT_ALIAS_ID: 'TSTALIASID',
    BEDROCK_AGENTCORE_RUNTIME_ID: 'base_bedrock_agentcore-1XHDxj2o3Q',
    AI_AUTO_SEND: 'true',
    OUTBOUND_WHATSAPP_FUNCTION: 'wecare-outbound-whatsapp',
  },
});
