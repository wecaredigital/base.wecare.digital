/**
 * Dashboard - Data Management Tab
 */
import React from 'react';
import Layout from '../../../components/Layout';

interface PageProps { signOut?: () => void; user?: any; }

const DashboardDataPage: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div style={{ padding: 20 }}>
        <h1>⊗ Data Management</h1>
        <p style={{ color: '#666' }}>Manage contacts, messages, and media files</p>
        <div style={{ marginTop: 20 }}>
          <a href="/contacts" style={{ color: '#1a1a1a' }}>→ Manage Contacts</a>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardDataPage;
