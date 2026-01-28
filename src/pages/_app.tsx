/**
 * WECARE.DIGITAL Admin Platform
 * Next.js App Component with Amplify Auth + Data API
 * 
 * SSO Domain: https://sso.wecare.digital
 * Production: https://base.wecare.digital
 * 
 * Public pages: /, /access
 * Protected pages: /dashboard/*, /pay/*, /dm/*, etc.
 * 
 * Auth Flow:
 * 1. User visits any protected page
 * 2. If not authenticated, redirect to /access
 * 3. After login on /access, redirect to /dashboard
 * 4. Session persists across all pages
 */

import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { getCurrentUser } from 'aws-amplify/auth';
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

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [user, setUser] = useState<any>(null);
  const isPublicPage = isPublicPath(router.pathname);

  // Check authentication status on client
  useEffect(() => {
    setIsClient(true);
    
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setAuthState('authenticated');
      } catch (err) {
        // Not authenticated
        setAuthState('unauthenticated');
        
        // Redirect to /access if on protected page
        if (!isPublicPath(router.pathname)) {
          router.replace('/access');
        }
      }
    };
    
    checkAuth();
  }, [router.pathname]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { signOut } = await import('aws-amplify/auth');
      await signOut();
      setUser(null);
      setAuthState('unauthenticated');
      router.push('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Show loading on server-side or during auth check
  if (!isClient || (authState === 'loading' && !isPublicPage)) {
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

  // Redirect to /access if not authenticated on protected page
  if (!isPublicPage && authState === 'unauthenticated') {
    return (
      <>
        <Head>
          <title>WECARE.DIGITAL</title>
          <link rel="icon" href="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" />
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
        // Protected pages - user is authenticated
        <>
          <Component {...pageProps} signOut={handleSignOut} user={user} />
          <FloatingAgent />
        </>
      )}
    </>
  );
}

