/**
 * WECARE.DIGITAL Admin Platform
 * Using Authenticator.Provider for persistent auth state across client-side navigation
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

// All callback URLs for Cognito
const CALLBACK_URLS = [
  'http://localhost:3000/',
  'https://base.wecare.digital/',
  'https://base.wecare.digital/dashboard/',
  'https://base.wecare.digital/dashboard/messages/',
  'https://base.wecare.digital/dashboard/payments/',
  'https://base.wecare.digital/dashboard/data/',
  'https://base.wecare.digital/dashboard/billing/',
  'https://base.wecare.digital/dashboard/ai/',
  'https://base.wecare.digital/dm/',
  'https://base.wecare.digital/dm/whatsapp/',
  'https://base.wecare.digital/dm/whatsapp/waba-dashboard/',
  'https://base.wecare.digital/dm/whatsapp/templates/',
  'https://base.wecare.digital/dm/whatsapp/ai-config/',
  'https://base.wecare.digital/dm/sms/',
  'https://base.wecare.digital/dm/ses/',
  'https://base.wecare.digital/dm/voice/',
  'https://base.wecare.digital/dm/rcs/',
  'https://base.wecare.digital/dm/logs/',
  'https://base.wecare.digital/contacts/',
  'https://base.wecare.digital/bulk/',
  'https://base.wecare.digital/bulk/whatsapp/',
  'https://base.wecare.digital/bulk/sms/',
  'https://base.wecare.digital/bulk/ses/',
  'https://base.wecare.digital/bulk/voice/',
  'https://base.wecare.digital/bulk/rcs/',
  'https://base.wecare.digital/bulk/logs/',
  'https://base.wecare.digital/pay/',
  'https://base.wecare.digital/pay/wa/',
  'https://base.wecare.digital/pay/link/',
  'https://base.wecare.digital/pay/logs/',
  'https://base.wecare.digital/link/',
  'https://base.wecare.digital/link/create/',
  'https://base.wecare.digital/link/logs/',
  'https://base.wecare.digital/forms/',
  'https://base.wecare.digital/forms/create/',
  'https://base.wecare.digital/forms/logs/',
  'https://base.wecare.digital/docs/',
  'https://base.wecare.digital/docs/create/',
  'https://base.wecare.digital/docs/logs/',
  'https://base.wecare.digital/invoice/',
  'https://base.wecare.digital/invoice/create/',
  'https://base.wecare.digital/invoice/logs/',
  'https://base.wecare.digital/access/',
];

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
          redirectSignIn: CALLBACK_URLS,
          redirectSignOut: ['http://localhost:3000/', 'https://base.wecare.digital/'],
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

// Auth header
const AuthHeader = () => (
  <div style={{ textAlign: 'center', padding: '20px' }}>
    <h1 style={{ fontSize: '24px', fontWeight: 300, color: '#1a1a1a' }}>WECARE.DIGITAL</h1>
    <p style={{ color: '#666', fontSize: '14px' }}>Admin Platform</p>
  </div>
);

// Protected content - uses useAuthenticator hook
function ProtectedPage({ Component, pageProps }: { Component: any; pageProps: any }) {
  const router = useRouter();
  const { authStatus, user, signOut } = useAuthenticator(context => [context.authStatus]);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Track when auth check completes
  useEffect(() => {
    if (authStatus !== 'configuring') {
      setHasCheckedAuth(true);
    }
  }, [authStatus]);

  // First load - show loading while checking auth
  if (!hasCheckedAuth && authStatus === 'configuring') {
    return <LoadingScreen />;
  }

  // Not authenticated - show login
  if (authStatus === 'unauthenticated') {
    return <Authenticator hideSignUp={true} components={{ Header: AuthHeader }} />;
  }

  // Authenticated OR still configuring after first check - render page
  // This prevents flashing loading screen during navigation
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
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  const isPublic = router.pathname === '/';

  useEffect(() => {
    setIsClient(true);
  }, []);

  // SSR - show loading
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

  // Public page
  if (isPublic) {
    return (
      <>
        <Head>
          <title>WECARE.DIGITAL</title>
          <link rel="icon" href="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        </Head>
        <Component {...pageProps} />
      </>
    );
  }

  // Protected pages - wrap in Provider for shared auth state
  return (
    <>
      <Head>
        <title>WECARE.DIGITAL</title>
        <link rel="icon" href="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
      </Head>
      <Authenticator.Provider>
        <ProtectedPage Component={Component} pageProps={pageProps} />
      </Authenticator.Provider>
    </>
  );
}
