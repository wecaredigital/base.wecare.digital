/**
 * Unified Messaging Page - WhatsApp, SMS, Email
 * Full AWS End User Messaging Social API Integration
 * Connected to Amplify Data API
 */

import React from 'react';
import Layout from '../components/Layout';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const MessagingPage: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h1>Unified Messaging</h1>
        <p>Use the WhatsApp, SMS, or Email pages from the sidebar to send messages.</p>
      </div>
    </Layout>
  );
};

export default MessagingPage;
