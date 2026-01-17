import { defineAuth } from '@aws-amplify/backend';

/**
 * Authentication Configuration
 * 
 * Uses existing Cognito User Pool: us-east-1_CC9u1fYh6
 * 
 * Roles:
 * - Viewer: Read-only access to contacts and message history
 * - Operator: Contact management and message sending
 * - Admin: All operations including user management
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  // Reference existing Cognito User Pool
  // User Pool ID: us-east-1_CC9u1fYh6
  userAttributes: {
    'custom:role': {
      dataType: 'String',
      mutable: true,
    },
  },
  groups: ['Viewer', 'Operator', 'Admin'],
});
