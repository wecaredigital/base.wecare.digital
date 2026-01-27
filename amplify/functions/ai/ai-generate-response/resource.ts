import { defineFunction } from '@aws-amplify/backend';

/**
 * AI Generate Response Lambda Function
 * 
 * Purpose: Generate AI response using Bedrock Agent with Knowledge Base
 * Uses Internal Agent for FloatingAgent, External Agent for WhatsApp auto-reply
 */
export const aiGenerateResponse = defineFunction({
  name: 'wecare-ai-generate-response',
  entry: './handler.py',
  runtime: 20, // Python 3.12
  timeoutSeconds: 60,
  memoryMB: 512,
  environment: {
    AWS_REGION: 'us-east-1',
    LOG_LEVEL: 'INFO',
    SEND_MODE: 'LIVE',
    // Internal Agent (FloatingAgent - admin tasks)
    INTERNAL_AGENT_ID: 'TJAZR473IJ',
    INTERNAL_AGENT_ALIAS: 'O4U1HF2MSX',
    INTERNAL_KB_ID: '7IWHVB0ZXQ',
    // External Agent (WhatsApp auto-reply - customer facing)
    EXTERNAL_AGENT_ID: 'JDXIOU2UR9',
    EXTERNAL_AGENT_ALIAS: 'AQVQPGYXRR',
    EXTERNAL_KB_ID: 'CTH8DH3RXY',
  },
});
