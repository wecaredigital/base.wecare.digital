/**
 * Dashboard Page (Home)
 * WECARE.DIGITAL Admin Platform
 */

import React from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const Dashboard: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <h1 className="page-title">Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Messages Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">1</div>
            <div className="stat-label">Active Contacts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Bulk Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">100%</div>
            <div className="stat-label">Delivery Rate</div>
          </div>
        </div>
        
        {/* System Status */}
        <div className="section">
          <h2 className="section-title">System Status</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div className="stat-card">
              <div className="status-badge status-green">✓ Active</div>
              <div className="stat-label" style={{ marginTop: '8px' }}>WhatsApp</div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>2 Phone Numbers</div>
            </div>
            <div className="stat-card">
              <div className="status-badge status-green">✓ Active</div>
              <div className="stat-label" style={{ marginTop: '8px' }}>SMS (Pinpoint)</div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>5 msg/sec</div>
            </div>
            <div className="stat-card">
              <div className="status-badge status-green">✓ Active</div>
              <div className="stat-label" style={{ marginTop: '8px' }}>Email (SES)</div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>one@wecare.digital</div>
            </div>
            <div className="stat-card">
              <div className="status-badge status-green">✓ Enabled</div>
              <div className="stat-label" style={{ marginTop: '8px' }}>AI Automation</div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Bedrock Agent</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section">
          <h2 className="section-title">Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <Link href="/messaging" className="btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              💬 Send WhatsApp Message
            </Link>
            <Link href="/bulk-messaging" className="btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              📨 Create Bulk Job
            </Link>
            <Link href="/contacts" className="btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              👥 Manage Contacts
            </Link>
            <Link href="/ai-automation" className="btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              🤖 AI Settings
            </Link>
          </div>
        </div>

        {/* WhatsApp Phone Numbers */}
        <div className="section">
          <h2 className="section-title">WhatsApp Phone Numbers</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Display Name</th>
                  <th>Phone Number</th>
                  <th>Quality</th>
                  <th>Rate Limit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>WECARE.DIGITAL</td>
                  <td>+91 93309 94400</td>
                  <td><span className="badge badge-green">GREEN</span></td>
                  <td>80 msg/sec</td>
                  <td><span className="status-badge status-green">Active</span></td>
                </tr>
                <tr>
                  <td>Manish Agarwal</td>
                  <td>+91 99033 00044</td>
                  <td><span className="badge badge-green">GREEN</span></td>
                  <td>80 msg/sec</td>
                  <td><span className="status-badge status-green">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AWS Resources Summary */}
        <div className="section">
          <h2 className="section-title">AWS Resources</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div style={{ textAlign: 'center', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: '300' }}>16</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Lambda Functions</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: '300' }}>11</div>
              <div style={{ fontSize: '12px', color: '#666' }}>DynamoDB Tables</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: '300' }}>5</div>
              <div style={{ fontSize: '12px', color: '#666' }}>SQS Queues</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: '300' }}>4</div>
              <div style={{ fontSize: '12px', color: '#666' }}>S3 Buckets</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: '300' }}>2</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Bedrock Agents</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: '300' }}>1</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Knowledge Base</div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="empty-state">
            <p>No recent activity to display.</p>
            <p style={{ fontSize: '12px', color: '#999' }}>Messages and events will appear here</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
