/**
 * WECARE.DIGITAL Admin Platform
 * Auth using fetchAuthSession for reliable auth state across navigation
 */

import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession, signOut as amplifySignOut } from 'aws-amplify/auth';
import { Authenticator } from '@aws-amplify/ui-react';
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

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Public pages that don't require auth
  const isPublic = router.pathname === '/';

  // Check auth session
  const checkAuth = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      if (session.tokens?.idToken) {
        const payload = session.tokens.idToken.payload;
        setUser({
          email: payload.email,
          username: payload['cognito:username'],
          signInDetails: { loginId: payload.email }
        });
        setAuthState('authenticated');
      } else {
        setAuthState('unauthenticated');
        setUser(null);
      }
    } catch (err) {
      console.log('Auth check:', err);
      setAuthState('unauthenticated');
      setUser(null);
    }
  }, []);

  // Initial auth check on mount
  useEffect(() => {
    setIsClient(true);
    checkAuth();
  }, [checkAuth]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await amplifySignOut();
      setAuthState('unauthenticated');
      setUser(null);
      router.push('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Server-side render - show loading
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

  // Public page - render without auth check
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

  // Still checking auth
  if (authState === 'loading') {
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

  // Not authenticated - show login form
  if (authState === 'unauthenticated') {
    return (
      <>
        <Head>
          <title>WECARE.DIGITAL</title>
          <link rel="icon" href="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        </Head>
        <Authenticator hideSignUp={true} components={{ Header: AuthHeader }}>
          {({ user: authUser }) => {
            // User just logged in - update state and re-check
            if (authUser && authState === 'unauthenticated') {
              checkAuth();
            }
            return <LoadingScreen />;
          }}
        </Authenticator>
      </>
    );
  }

  // Authenticated - render the page
  return (
    <>
      <Head>
        <title>WECARE.DIGITAL</title>
        <link rel="icon" href="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
      </Head>
      <Component {...pageProps} signOut={handleSignOut} user={user} />
      <FloatingAgent />
    </>
  );
}
