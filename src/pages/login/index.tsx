/**
 * Login Page
 * Authentication via AWS Cognito
 */

import React from 'react';
import { useRouter } from 'next/router';

const LoginPage: React.FC = () => {
  const router = useRouter();

  const handleLogin = () => {
    // Cognito authentication handled by Amplify
    router.push('/');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>WECARE.DIGITAL</h1>
          <p>Admin Platform</p>
        </div>
        <div className="login-body">
          <button className="login-btn" onClick={handleLogin}>
            Sign In with AWS Cognito
          </button>
        </div>
      </div>

      <style jsx>{`
        .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f5f5; }
        .login-card { background: #fff; border-radius: 12px; padding: 48px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .login-header h1 { font-size: 24px; margin: 0 0 8px 0; }
        .login-header p { color: #666; margin: 0 0 32px 0; }
        .login-btn { background: #1a1a1a; color: #fff; border: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; cursor: pointer; }
        .login-btn:hover { background: #333; }
      `}</style>
    </div>
  );
};

export default LoginPage;
