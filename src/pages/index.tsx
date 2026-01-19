/**
 * Dashboard Page (Home)
 */

import React from 'react';
import Layout from '../components/Layout';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const Dashboard: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <h1 className="page-title">Dashboard</h1>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Messages Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Active Contacts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Bulk Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">0%</div>
            <div className="stat-label">Delivery Rate</div>
          </div>
        </div>
        
        <div className="section">
          <h2 className="section-title">System Status</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="stat-card">
              <div className="status-badge status-green">✓ Active</div>
              <div className="stat-label" style={{ marginTop: '8px' }}>WhatsApp</div>
            </div>
            <div className="stat-card">
              <div className="status-badge status-green">✓ Active</div>
              <div className="stat-label" style={{ marginTop: '8px' }}>SMS</div>
            </div>
            <div className="stat-card">
              <div className="status-badge status-green">✓ Active</div>
              <div className="stat-label" style={{ marginTop: '8px' }}>Email</div>
            </div>
          </div>
        </div>
        
        <div className="section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="empty-state">
            <p>No recent activity to display.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
