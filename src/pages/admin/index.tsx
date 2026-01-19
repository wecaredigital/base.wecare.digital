/**
 * Admin Tools Page
 * WECARE.DIGITAL Admin Platform
 * Admin-only access
 */

import React, { useState } from 'react';
import Layout from '../../components/Layout';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const AdminPage: React.FC<PageProps> = ({ signOut, user }) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'config' | 'dlq' | 'users'>('audit');

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <h1 className="page-title">Admin Tools</h1>
        
        <div className="tabs">
          <button className={`tab ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
            📋 Audit Logs
          </button>
          <button className={`tab ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>
            ⚙️ System Config
          </button>
          <button className={`tab ${activeTab === 'dlq' ? 'active' : ''}`} onClick={() => setActiveTab('dlq')}>
            ⚠️ DLQ Replay
          </button>
          <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            👥 User Management
          </button>
        </div>

        {activeTab === 'audit' && (
          <div className="section">
            <h2 className="section-title">Audit Logs</h2>
            <div className="empty-state">
              <p>📋 Audit log viewer coming soon</p>
              <p className="help-text">View system activity and user actions</p>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="section">
            <h2 className="section-title">System Configuration</h2>
            <div className="config-grid">
              <div className="config-card">
                <h3>Send Mode</h3>
                <div className="config-item">
                  <label>Current Mode</label>
                  <select defaultValue="DRY_RUN">
                    <option value="DRY_RUN">DRY_RUN (Simulation)</option>
                    <option value="LIVE">LIVE (Production)</option>
                  </select>
                </div>
              </div>
              <div className="config-card">
                <h3>Rate Limits</h3>
                <div className="config-item">
                  <label>WhatsApp (msg/sec)</label>
                  <input type="number" defaultValue={80} readOnly />
                </div>
                <div className="config-item">
                  <label>SMS (msg/sec)</label>
                  <input type="number" defaultValue={5} readOnly />
                </div>
                <div className="config-item">
                  <label>Email (msg/sec)</label>
                  <input type="number" defaultValue={10} readOnly />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dlq' && (
          <div className="section">
            <h2 className="section-title">Dead Letter Queue</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📥</div>
                <div className="stat-content">
                  <div className="stat-value">0</div>
                  <div className="stat-label">Inbound DLQ</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📤</div>
                <div className="stat-content">
                  <div className="stat-value">0</div>
                  <div className="stat-label">Outbound DLQ</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📨</div>
                <div className="stat-content">
                  <div className="stat-value">0</div>
                  <div className="stat-label">Bulk DLQ</div>
                </div>
              </div>
            </div>
            <div className="empty-state">
              <p>✅ No failed messages in queue</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="section">
            <h2 className="section-title">User Management</h2>
            <div className="empty-state">
              <p>👥 User management coming soon</p>
              <p className="help-text">Manage user roles and permissions</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPage;
