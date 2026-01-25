/**
 * Dashboard - Payments Tab
 */
import React from 'react';
import Layout from '../../../components/Layout';

interface PageProps { signOut?: () => void; user?: any; }

const DashboardPaymentsPage: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div style={{ padding: 20 }}>
        <h1>₹ Payments Overview</h1>
        <p style={{ color: '#666' }}>View payment statistics and transactions</p>
        <div style={{ marginTop: 20 }}>
          <a href="/pay/wa" style={{ color: '#25D366' }}>→ Send WhatsApp Payment</a>
          <br />
          <a href="/pay/logs" style={{ color: '#666', marginTop: 8, display: 'inline-block' }}>→ View Payment Logs</a>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPaymentsPage;
