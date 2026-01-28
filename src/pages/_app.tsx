/**
 * WECARE.DIGITAL Admin Platform
 * Simplified auth - just wrap protected pages with Authenticator
 */

import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import '../styles/Pages.css';
import '../styles/Layout.css';
import '../styles/Dashboard.css';
import FloatingAgent from '../components/FloatingAgent';
import ErrorBoundary from '../components/ErrorBoundary';

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_CC9u1fYh6',
      userPoolClientId: '5na5ba2pbpanm36138jdcd9gck',
      identityPoolId: 'us-east-1:ef6b783a-f0c5-4d2f-925d-9460e6a733ce',
      loginWith: {
        oauth: {
          domain: 'sso.wecare.digital',
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: ['https://base.wecare.digital/', 'http://localhost:3000/'],
          redirectSignOut: ['https://base.wecare.digital/', 'http://localhost:3000/'],
          responseType: 'code' as const
        },
        username: true,
        email: true
      }
    }
  }
});

const AuthHeader = () => (
  <div style={{ textAlign: 'center', padding: '20px' }}>
    <h1 style={{ fontSize: '24px', fontWeight: 300, color: '#1a1a1a' }}>WECARE.DIGITAL</h1>
    <p style={{ color: '#666', fontSize: '14px' }}>Admin Platform</p>
  </div>
);

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const isPublic = router.pathname === '/';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait for client-side mount
  if (!mounted) {
    return null;
  }

  // Public page
  if (isPublic) {
    return (
      <ErrorBoundary>
        <Head>
          <title>WECARE.DIGITAL</title>
          <link rel="icon" href="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" />
        </Head>
        <Component {...pageProps} />
      </ErrorBoundary>
    );
  }

  // Protected pages
  return (
    <ErrorBoundary>
      <Head>
        <title>WECARE.DIGITAL</title>
        <link rel="icon" href="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" />
      </Head>
      <Authenticator hideSignUp={true} components={{ Header: AuthHeader }}>
        {({ signOut, user }) => (
          <>
            <Component {...pageProps} signOut={() => { signOut?.(); router.push('/'); }} user={user} />
            <FloatingAgent />
          </>
        )}
      </Authenticator>
    </ErrorBoundary>
  );
}
