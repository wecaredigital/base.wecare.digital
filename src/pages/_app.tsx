/**
 * WECARE.DIGITAL Admin Platform
 * Next.js App Component with Amplify Data API
 */

import type { AppProps } from 'next/app';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './Pages.css';
import '../components/Layout.css';

// Import Amplify outputs if available
let amplifyConfig: any = null;
try {
  amplifyConfig = require('../../amplify_outputs.json');
} catch {
  // Fallback config if amplify_outputs.json not available
}

// Configure Amplify with OAuth and Data API
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: amplifyConfig?.auth?.user_pool_id || 'us-east-1_CC9u1fYh6',
      userPoolClientId: amplifyConfig?.auth?.user_pool_client_id || '390cro53nf7gerev44gnq7felt',
      loginWith: {
        oauth: {
          domain: amplifyConfig?.auth?.oauth?.domain || 'sso.wecare.digital',
          scopes: amplifyConfig?.auth?.oauth?.scopes || ['openid', 'email', 'profile'],
          redirectSignIn: amplifyConfig?.auth?.oauth?.redirect_sign_in_uri || ['https://base.dtiq7il2x5c5g.amplifyapp.com/'],
          redirectSignOut: amplifyConfig?.auth?.oauth?.redirect_sign_out_uri || ['https://base.dtiq7il2x5c5g.amplifyapp.com/'],
          responseType: 'code'
        }
      }
    }
  },
  // Data API configuration - uses AppSync GraphQL
  API: {
    GraphQL: {
      endpoint: amplifyConfig?.data?.url || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '',
      region: amplifyConfig?.data?.aws_region || 'us-east-1',
      defaultAuthMode: 'userPool'
    }
  },
  // Storage configuration
  Storage: {
    S3: {
      bucket: amplifyConfig?.storage?.bucket_name || 'auth.wecare.digital',
      region: amplifyConfig?.storage?.aws_region || 'us-east-1'
    }
  }
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Authenticator
      socialProviders={[]}
      hideSignUp={true}
      components={{
        Header() {
          return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 300, color: '#1a1a1a' }}>
                WECARE.DIGITAL
              </h1>
              <p style={{ color: '#666', fontSize: '14px' }}>Admin Platform</p>
            </div>
          );
        }
      }}
    >
      {({ signOut, user }) => (
        <Component {...pageProps} signOut={signOut} user={user} />
      )}
    </Authenticator>
  );
}
