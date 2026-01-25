/**
 * Dashboard - Messages Tab
 */
import React from 'react';
import Layout from '../../../components/Layout';

interface PageProps { signOut?: () => void; user?: any; }

const DashboardMessagesPage: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div style={{ padding: 20 }}>
        <h1>◫ Messages Overview</h1>
        <p style={{ color: '#666' }}>View message statistics and recent activity</p>
        <div style={{ marginTop: 20 }}>
          <a href="/dm/whatsapp" style={{ color: '#25D366' }}>→ Go to WhatsApp Inbox</a>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardMessagesPage;
