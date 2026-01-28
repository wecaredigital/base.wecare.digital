/**
 * WECARE.DIGITAL Admin Platform
 * Next.js App Component with Amplify Auth
 * 
 * Auth Flow:
 * - Public pages (/, /access): No auth required
 * - Protected pages: Require authentication
 * - Session persists across all page navigations
 */

import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import '../styles/Pages.css';
import '../styles/Layout.css';
import '../styles/Dashboard.css';
import FloatingAgent from '../components/FloatingAgent';

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

// Public pages - only home page is truly public
const PUBLIC_PAGES = ['/'];

const isPublicPath = (pathname: string) => {
  const path = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
  return PUBLIC_PAGES.includes(path);
};

// Loading screen
const LoadingScreen = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
    <h1 style={{ fontSize: '24px', fontWeight: 300, color: '#1a1a1a', marginBottom: '16px' }}>WECARE.DIGITAL</h1>
    <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#1a1a1a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Auth header component
const AuthHeader = () => (
  <div style={{ textAlign: 'center', padding: '20px' }}>
    <h1 style={{ fontSize: '24px', fontWeight: 300, color: '#1a1a1a' }}>WECARE.DIGITAL</h1>
    <p style={{ color: '#666', fontSize: '14px' }}>Admin Platform</p>
  </div>
);

// Main content wrapper - handles auth state
function AuthenticatedApp({ Component, pageProps }: { Component: any; pageProps: any }) {
  const router = useRouter();
  const { user, signOut, authStatus } = useAuthenticator();
  const isPublic = isPublicPath(router.pathname);
  const wasAuthenticated = useRef(false);

  // Track if user was ever authenticated in this session
  useEffect(() => {
    if (authStatus === 'authenticated') {
      wasAuthenticated.current = true;
    }
  }, [authStatus]);

  const handleSignOut = async () => {
    wasAuthenticated.current = false;
    await signOut();
    router.push('/');
  };

  // Public pages - always render
  if (isPublic) {
    return <Component {...pageProps} />;
  }

  // Protected pages
  // If authenticated, show the page
  if (authStatus === 'authenticated' && user) {
    return (
      <>
        <Component {...pageProps} signOut={handleSignOut} user={user} />
        <FloatingAgent />
      </>
    );
  }

  // If configuring but was previously authenticated, show loading (not login)
  if (authStatus === 'configuring' && wasAuthenticated.current) {
    return <LoadingScreen />;
  }

  // Not authenticated - return null, Authenticator will show login
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <>
        <Head>
          <title>WECARE.DIGITAL</title>
          <link rel="icon" href="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        </Head>
        <LoadingScreen />
      </>
    );
  }

  return (
    <Authenticator.Provider>
      <Head>
        <title>WECARE.DIGITAL</title>
        <link rel="icon" href="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
      </Head>
      <Authenticator hideSignUp={true} components={{ Header: AuthHeader }}>
        <AuthenticatedApp Component={Component} pageProps={pageProps} />
      </Authenticator>
    </Authenticator.Provider>
  );
}
