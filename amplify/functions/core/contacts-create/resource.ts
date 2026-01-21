import { defineFunction } from '@aws-amplify/backend';

/**
 * Contacts Create Lambda Function
 * 
 * Purpose: Create new contact with opt-in defaults
 * Requirements: 2.1, 2.2, 2.3
 */
export const contactsCreate = defineFunction({
  name: 'contacts-create',
  entry: './handler.py',
  runtime: 20, // Python 3.12
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    AWS_REGION: 'us-east-1',
    LOG_LEVEL: 'INFO',
  },
});
