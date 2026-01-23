/**
 * WhatsApp Templates Lambda Function Resource
 * 
 * Fetches WhatsApp message templates from AWS EUM Social API
 */

import { defineFunction } from '@aws-amplify/backend';

export const whatsappTemplates = defineFunction({
  name: 'wecare-whatsapp-templates',
  entry: './handler.py',
  runtime: 20,  // Python 3.12
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    LOG_LEVEL: 'INFO',
  },
});
