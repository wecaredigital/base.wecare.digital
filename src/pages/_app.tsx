/**
 * WECARE.DIGITAL Admin Platform
 * Auth with Authenticator.Provider wrapping entire app for persistent auth state
 */

import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import '../styles/Pages.css';
import '../styles/Layout.css';
import '../styles/Dashboard.css';
import FloatingAgent from '../components/FloatingAgent';

// Configure Amplify - must be before any auth calls
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

// Loading screen
const LoadingScreen = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
    <h1 style={{ fontSize: '24px', fontWeight: 300, color: '#1a1a1a', marginBottom: '16px' }}>WECARE.DIGITAL</h1>
    <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#1a1a1a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Auth header for login form
const AuthHeader = () => (
  <div style={{ textAlign: 'center', padding: '20px' }}>
    <h1 style={{ fontSize: '24px', fontWeight: 300, color: '#1a1a1a' }}>WECARE.DIGITAL</h1>
    <p style={{ color: '#666', fontSize: '14px' }}>Admin Platform</p>
  </div>
);

// Inner app component that uses auth context
function AppContent({ Component, pageProps }: { Component: any; pageProps: any }) {
  const router = useRouter();
  const { authStatus, user, signOut } = useAuthenticator((context) => [context.authStatus, context.user]);
  const [isClient, setIsClient] = useState(false);
  
  // Public pages that don't require auth
  const isPublic = router.pathname === '/';

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Server-side render - show loading
  if (!isClient) {
    return <LoadingScreen />;
  }

  // Public page - render without auth check
  if (isPublic) {
    return <Component {...pageProps} />;
  }

  // Protected page - check auth status
  if (authStatus === 'configuring') {
    return <LoadingScreen />;
  }

  // Not authenticated - show login form
  if (authStatus !== 'authenticated') {
    return (
      <Authenticator hideSignUp={true} components={{ Header: AuthHeader }} />
    );
  }

  // Authenticated - render the page with user props
  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  return (
    <>
      <Component {...pageProps} signOut={handleSignOut} user={user} />
      <FloatingAgent />
    </>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>WECARE.DIGITAL</title>
        <link rel="icon" href="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
      </Head>
      <Authenticator.Provider>
        <AppContent Component={Component} pageProps={pageProps} />
      </Authenticator.Provider>
    </>
  );
}
