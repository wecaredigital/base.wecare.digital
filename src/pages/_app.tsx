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
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import '../styles/Pages.css';
import '../styles/Layout.css';
import '../styles/Dashboard.css';
import FloatingAgent from '../components/FloatingAgent';

// Amplify configuration
const amplifyConfig = {
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
};

// Configure Amplify (safe to call multiple times)
try {
  Amplify.configure(amplifyConfig);
} catch (e) {
  // Already configured
}

// Public pages that don't require authentication
const PUBLIC_PAGES = ['/', '/access'];

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

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const isPublicPage = PUBLIC_PAGES.includes(router.pathname);

  // Ensure we're on the client and Amplify is configured
  useEffect(() => {
    setIsClient(true);
    // Give Amplify a moment to initialize
    const timer = setTimeout(() => setAuthReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Show loading on server-side or during hydration
  if (!isClient || (!isPublicPage && !authReady)) {
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
          {({ signOut, user }) => {
            // Wrap signOut to redirect to home page
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
          }}
        </Authenticator>
      )}
    </>
  );
}

