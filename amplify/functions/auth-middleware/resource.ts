import { defineFunction } from '@aws-amplify/backend';

/**
 * Auth Middleware Lambda Function
 * 
 * Purpose: JWT validation and RBAC enforcement
 * Requirements: 1.1, 1.2, 1.6, 14.1
 */
export const authMiddleware = defineFunction({
  name: 'auth-middleware',
  entry: './handler.py',
  runtime: 20, // Python 3.12
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    COGNITO_USER_POOL_ID: 'us-east-1_CC9u1fYh6',
    AWS_REGION: 'us-east-1',
    LOG_LEVEL: 'INFO',
  },
});
