/**
 * Dashboard - Billing Tab
 */
import React from 'react';
import Layout from '../../../components/Layout';

interface PageProps { signOut?: () => void; user?: any; }

const DashboardBillingPage: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div style={{ padding: 20 }}>
        <h1>≡ AWS Billing</h1>
        <p style={{ color: '#666' }}>View AWS resource usage and costs</p>
        <div style={{ background: '#f9fafb', borderRadius: 12, padding: 20, marginTop: 20 }}>
          <p style={{ color: '#666' }}>Account: 809904170947</p>
          <p style={{ color: '#666' }}>Region: us-east-1</p>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardBillingPage;
