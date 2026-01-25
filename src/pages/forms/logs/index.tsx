/**
 * Forms - Submission Logs
 */
import React from 'react';
import Layout from '../../../components/Layout';

interface PageProps { signOut?: () => void; user?: any; }

const FormsLogsPage: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
        <h1>📊 Form Submissions</h1>
        <p style={{ color: '#666' }}>View all form submission logs</p>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 40, textAlign: 'center', marginTop: 20 }}>
          <span style={{ fontSize: 48, opacity: 0.5 }}>📭</span>
          <p style={{ color: '#666', marginTop: 16 }}>No form submissions yet</p>
        </div>
      </div>
    </Layout>
  );
};

export default FormsLogsPage;
