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
import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import '../styles/Pages.css';
import '../styles/Layout.css';
import '../styles/Dashboard.css';
import FloatingAgent from '../components/FloatingAgent';

// Configure Amplify with Cognito settings
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

// Public pages that don't require authentication
const PUBLIC_PAGES = ['/', '/access'];

// Check if current path is a public page
const isPublicPath = (pathname: string) => {
  const normalizedPath = pathname.endsWith('/') && pathname !== '/' 
    ? pathname.slice(0, -1) 
    : pathname;
  return PUBLIC_PAGES.includes(normalizedPath);
};

// Loading component
const LoadingScreen = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh',
    background: '#f5f5f5'
  }}>
    <h1 style={{ fontSize: '24px', fontWeight: 300, color: '#1a1a1a', marginBottom: '16px' }}>
      WECARE.DIGITAL
    </h1>
    <div style={{ 
      width: '40px', 
      height: '40px', 
      border: '3px solid #e5e7eb',
      borderTopColor: '#1a1a1a',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Inner app component that uses auth context
function AppContent({ Component, pageProps, isPublicPage }: { Component: any; pageProps: any; isPublicPage: boolean }) {
  const router = useRouter();
  const { user, signOut, authStatus } = useAuthenticator((context) => [context.user, context.authStatus]);

  // Handle sign out with redirect
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Public pages - render without auth check
  if (isPublicPage) {
    return <Component {...pageProps} />;
  }

  // Show loading while checking auth
  if (authStatus === 'configuring') {
    return <LoadingScreen />;
  }

  // Authenticated - render protected page
  if (authStatus === 'authenticated' && user) {
    return (
      <>
        <Component {...pageProps} signOut={handleSignOut} user={user} />
        <FloatingAgent />
      </>
    );
  }

  // Not authenticated - show nothing (Authenticator will show login)
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const isPublicPage = isPublicPath(router.pathname);

  // Ensure we're on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading on server-side
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
        <link rel="shortcut icon" href="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
      </Head>
      
      {isPublicPage ? (
        // Public pages - just render
        <AppContent Component={Component} pageProps={pageProps} isPublicPage={true} />
      ) : (
        // Protected pages - wrap in Authenticator for login UI
        <Authenticator
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
          <AppContent Component={Component} pageProps={pageProps} isPublicPage={false} />
        </Authenticator>
      )}
    </Authenticator.Provider>
  );
}

