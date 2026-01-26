/**
 * WECARE.DIGITAL Admin Platform
 * Next.js App Component with Amplify Auth + Data API
 * 
 * SSO Domain: https://sso.wecare.digital
 * Production: https://base.wecare.digital
 * 
 * Public pages: /, /access
 * Protected pages: /dashboard/*, /pay/*, /dm/*, etc.
 */

import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import '../styles/Pages.css';
import '../styles/Layout.css';
import FloatingAgent from '../components/FloatingAgent';

// Configure Amplify with Cognito Auth
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_CC9u1fYh6',
      userPoolClientId: '5na5ba2pbpanm36138jdcd9gck',
    }
  },
  Storage: {
    S3: {
      bucket: 'auth.wecare.digital',
      region: 'us-east-1'
    }
  }
});

// Public pages that don't require authentication
const PUBLIC_PAGES = ['/', '/access'];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isPublicPage = PUBLIC_PAGES.includes(router.pathname);

  return (
    <>
      <Head>
        <title>WECARE.DIGITAL</title>
        <link rel="icon" href="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" />
        <link rel="shortcut icon" href="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
      </Head>
      
      {isPublicPage ? (
        // Public pages - no auth required
        <Component {...pageProps} />
      ) : (
        // Protected pages - require auth
        <Authenticator
          socialProviders={[]}
          hideSignUp={true}
          components={{
            Header() {
              return (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 300, color: '#1a1a1a', fontFamily: "'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                    WECARE.DIGITAL
                  </h1>
                  <p style={{ color: '#666', fontSize: '14px' }}>Admin Platform</p>
                </div>
              );
            }
          }}
        >
          {({ signOut, user }) => (
            <>
              <Component {...pageProps} signOut={signOut} user={user} />
              <FloatingAgent />
            </>
          )}
        </Authenticator>
      )}
    </>
  );
}

