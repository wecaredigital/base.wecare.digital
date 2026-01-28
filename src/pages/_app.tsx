/**
 * WECARE.DIGITAL Admin Platform
 * Auth with all page URLs configured for Cognito redirect
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

const LOGOUT_URLS = [
  'http://localhost:3000/',
  'https://base.wecare.digital/',
  'https://base.wecare.digital/dashboard/',
  'https://base.wecare.digital/dm/whatsapp/',
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
          redirectSignOut: LOGOUT_URLS,
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

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  // Only home page is public
  const isPublic = router.pathname === '/';

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Public page (home only)
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

  // All other pages - protected with Authenticator
  return (
    <>
      <Head>
        <title>WECARE.DIGITAL</title>
        <link rel="icon" href="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
      </Head>
      <Authenticator hideSignUp={true} components={{ Header: AuthHeader }}>
        {({ signOut, user }) => (
          <>
            <Component 
              {...pageProps} 
              signOut={() => { 
                signOut(); 
                router.push('/'); 
              }} 
              user={user} 
            />
            <FloatingAgent />
          </>
        )}
      </Authenticator>
    </>
  );
}
