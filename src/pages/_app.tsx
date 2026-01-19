/**
 * WECARE.DIGITAL Admin Platform
 * Next.js App Component
 */

import type { AppProps } from 'next/app';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './Pages.css';
import '../components/Layout.css';

// Configure Amplify with OAuth
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_CC9u1fYh6',
      userPoolClientId: '390cro53nf7gerev44gnq7felt',
      loginWith: {
        oauth: {
          domain: 'sso.wecare.digital',
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: ['https://base.dtiq7il2x5c5g.amplifyapp.com/'],
          redirectSignOut: ['https://base.dtiq7il2x5c5g.amplifyapp.com/'],
          responseType: 'code'
        }
      }
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
