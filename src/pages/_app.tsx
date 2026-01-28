/**
 * WECARE.DIGITAL Admin Platform
 * Next.js App Component with Amplify Auth
 */

import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession, getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth';
import { Authenticator } from '@aws-amplify/ui-react';
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

// Only home page is public
const isPublicPath = (pathname: string) => {
  const path = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
  return path === '/';
};

// Loading screen
const LoadingScreen = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
    <h1 style={{ fontSize: '24px', fontWeight: 300, color: '#1a1a1a', marginBottom: '16px' }}>WECARE.DIGITAL</h1>
    <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#1a1a1a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Login screen using Authenticator
const LoginScreen = ({ onSuccess }: { onSuccess: () => void }) => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
    <Authenticator
      hideSignUp={true}
      components={{
        Header: () => (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 300, color: '#1a1a1a' }}>WECARE.DIGITAL</h1>
            <p style={{ color: '#666', fontSize: '14px' }}>Admin Platform</p>
          </div>
        )
      }}
    >
      {() => {
        // Login successful, trigger callback
        onSuccess();
        return <LoadingScreen />;
      }}
    </Authenticator>
  </div>
);

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [user, setUser] = useState<any>(null);
  
  const isPublic = isPublicPath(router.pathname);

  // Check auth on mount and when route changes
  useEffect(() => {
    setIsClient(true);
    checkAuth();
  }, []);

  // Re-check auth when navigating (but don't reset to loading if already authenticated)
  useEffect(() => {
    if (authState === 'authenticated') {
      // Already authenticated, just verify session is still valid
      checkAuth(true);
    }
  }, [router.pathname]);

  const checkAuth = async (silent = false) => {
    if (!silent) {
      setAuthState('loading');
    }
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      if (session.tokens) {
        setUser(currentUser);
        setAuthState('authenticated');
      } else {
        throw new Error('No tokens');
      }
    } catch (err) {
      setUser(null);
      setAuthState('unauthenticated');
    }
  };

  const handleSignOut = async () => {
    try {
      await amplifySignOut();
      setUser(null);
      setAuthState('unauthenticated');
      router.push('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleLoginSuccess = () => {
    checkAuth();
  };

  // Server-side or initial load
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

  // Public pages - render without auth
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

  // Protected pages - check auth state
  return (
    <>
      <Head>
        <title>WECARE.DIGITAL</title>
        <link rel="icon" href="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
      </Head>
      
      {authState === 'loading' && <LoadingScreen />}
      
      {authState === 'unauthenticated' && <LoginScreen onSuccess={handleLoginSuccess} />}
      
      {authState === 'authenticated' && user && (
        <>
          <Component {...pageProps} signOut={handleSignOut} user={user} />
          <FloatingAgent />
        </>
      )}
    </>
  );
}
