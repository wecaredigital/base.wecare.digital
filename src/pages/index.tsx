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
        <div className="dashboard-header">
          <h1 className="page-title">Dashboard</h1>
          <div className="header-actions">
            <Link href="/messaging" className="btn-primary">
              💬 Send Message
            </Link>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📨</div>
            <div className="stat-content">
              <div className="stat-value">1</div>
              <div className="stat-label">Messages Today</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">1</div>
              <div className="stat-label">Active Contacts</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">0</div>
              <div className="stat-label">Bulk Jobs</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">100%</div>
              <div className="stat-label">Delivery Rate</div>
            </div>
          </div>
        </div>
        
        {/* System Status */}
        <div className="section">
          <h2 className="section-title">System Status</h2>
          <div className="status-grid">
            <div className="status-card">
              <div className="status-header">
                <span className="status-icon">💬</span>
                <span className="status-name">WhatsApp</span>
              </div>
              <div className="status-badge status-green">✓ Active</div>
              <div className="status-detail">2 Phone Numbers • GREEN Rating</div>
            </div>
            <div className="status-card">
              <div className="status-header">
                <span className="status-icon">📱</span>
                <span className="status-name">SMS</span>
              </div>
              <div className="status-badge status-green">✓ Active</div>
              <div className="status-detail">Pinpoint Pool • 5 msg/sec</div>
            </div>
            <div className="status-card">
              <div className="status-header">
                <span className="status-icon">📧</span>
                <span className="status-name">Email</span>
              </div>
              <div className="status-badge status-green">✓ Active</div>
              <div className="status-detail">SES Verified • 10 msg/sec</div>
            </div>
            <div className="status-card">
              <div className="status-header">
                <span className="status-icon">🤖</span>
                <span className="status-name">AI Agent</span>
              </div>
              <div className="status-badge status-green">✓ Enabled</div>
              <div className="status-detail">Bedrock • Nova Pro</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            <Link href="/messaging" className="quick-action-card">
              <span className="qa-icon">💬</span>
              <span className="qa-title">WhatsApp</span>
              <span className="qa-desc">Send messages</span>
            </Link>
            <Link href="/bulk-messaging" className="quick-action-card">
              <span className="qa-icon">📨</span>
              <span className="qa-title">Bulk Job</span>
              <span className="qa-desc">Mass messaging</span>
            </Link>
            <Link href="/contacts" className="quick-action-card">
              <span className="qa-icon">👥</span>
              <span className="qa-title">Contacts</span>
              <span className="qa-desc">Manage contacts</span>
            </Link>
            <Link href="/ai-automation" className="quick-action-card">
              <span className="qa-icon">🤖</span>
              <span className="qa-title">AI Settings</span>
              <span className="qa-desc">Configure AI</span>
            </Link>
          </div>
        </div>

        {/* WhatsApp Phone Numbers */}
        <div className="section">
          <h2 className="section-title">WhatsApp Phone Numbers</h2>
          <div className="phone-cards">
            <div className="phone-card">
              <div className="phone-header">
                <span className="phone-name">WECARE.DIGITAL</span>
                <span className="badge badge-green">GREEN</span>
              </div>
              <div className="phone-number">+91 93309 94400</div>
              <div className="phone-details">
                <span>80 msg/sec</span>
                <span>•</span>
                <span>Primary</span>
              </div>
            </div>
            <div className="phone-card">
              <div className="phone-header">
                <span className="phone-name">Manish Agarwal</span>
                <span className="badge badge-green">GREEN</span>
              </div>
              <div className="phone-number">+91 99033 00044</div>
              <div className="phone-details">
                <span>80 msg/sec</span>
                <span>•</span>
                <span>Secondary</span>
              </div>
            </div>
          </div>
        </div>

        {/* AWS Resources Summary */}
        <div className="section">
          <h2 className="section-title">AWS Resources</h2>
          <div className="resources-grid">
            <div className="resource-item">
              <div className="resource-count">16</div>
              <div className="resource-name">Lambda</div>
            </div>
            <div className="resource-item">
              <div className="resource-count">11</div>
              <div className="resource-name">DynamoDB</div>
            </div>
            <div className="resource-item">
              <div className="resource-count">5</div>
              <div className="resource-name">SQS</div>
            </div>
            <div className="resource-item">
              <div className="resource-count">4</div>
              <div className="resource-name">S3</div>
            </div>
            <div className="resource-item">
              <div className="resource-count">2</div>
              <div className="resource-name">Agents</div>
            </div>
            <div className="resource-item">
              <div className="resource-count">1</div>
              <div className="resource-name">KB</div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Recent Activity</h2>
            <Link href="/messaging" className="view-all-link">View All →</Link>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon inbound">↓</div>
              <div className="activity-content">
                <div className="activity-text">
                  <strong>UK Test</strong> sent a message
                </div>
                <div className="activity-detail">"Hello from UK test"</div>
              </div>
              <div className="activity-time">10:30 AM</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
