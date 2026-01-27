/**
 * Access Page - Authentication via AWS Cognito
 * URL: https://base.wecare.digital/access
 * Note: Amplify is configured in _app.tsx
 */

import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useRouter } from 'next/router';
import Head from 'next/head';

const AccessPage: React.FC = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Access | WECARE.DIGITAL</title>
      </Head>
      <div className="access-page">
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
            // Redirect to home after login
            if (typeof window !== 'undefined') {
              router.push('/');
            }
            return (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Redirecting to dashboard...</p>
              </div>
            );
          }}
        </Authenticator>

        <style jsx>{`
          .access-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f5f5;
          }
        `}</style>
      </div>
    </>
  );
};

export default AccessPage;
