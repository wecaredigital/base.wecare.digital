/**
 * Billing Lambda Resource Definition
 * Fetches AWS Cost Explorer data
 */

import { defineFunction } from '@aws-amplify/backend';

export const billingFunction = defineFunction({
  name: 'wecare-billing',
  entry: './handler.py',
  runtime: 20, // Python 3.12
  timeoutSeconds: 30,
  memoryMB: 128,
  environment: {
    LOG_LEVEL: 'INFO',
  },
});
