/**
 * Dashboard Page (Home)
 * WECARE.DIGITAL Admin Platform
 * Live dashboard with real-time stats and full feature access
 */

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  channel: 'whatsapp' | 'sms' | 'email';
  content: string;
  contactName: string;
  contactPhone: string;
  timestamp: string;
  status: string;
  mediaUrl?: string;
}

interface SystemHealth {
  whatsapp: { status: 'active' | 'warning' | 'error'; detail: string };
  sms: { status: 'active' | 'warning' | 'error'; detail: string };
  email: { status: 'active' | 'warning' | 'error'; detail: string };
  ai: { status: 'active' | 'warning' | 'error'; detail: string };
  dlq: { depth: number; status: 'active' | 'warning' | 'error' };
}

const Dashboard: React.FC<PageProps> = ({ signOut, user }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    messagesToday: 0,
    messagesWeek: 0,
    activeContacts: 0,
    bulkJobs: 0,
    deliveryRate: 100,
    aiResponses: 0
  });
  
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    whatsapp: { status: 'active', detail: '2 Phone Numbers • GREEN Rating' },
    sms: { status: 'active', detail: 'Pinpoint Pool • 5 msg/sec' },
    email: { status: 'active', detail: 'SES Verified • 10 msg/sec' },
    ai: { status: 'active', detail: 'Bedrock Nova Pro • KB Active' },
    dlq: { depth: 0, status: 'active' }
  });

  // Simulate loading real data
  useEffect(() => {
    const loadDashboardData = async () => {
      // In production, these would be API calls
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStats({
        messagesToday: 3,
        messagesWeek: 15,
        activeContacts: 2,
        bulkJobs: 1,
        deliveryRate: 98,
        aiResponses: 5
      });
      
      setRecentMessages([
        {
          id: '1',
          direction: 'inbound',
          channel: 'whatsapp',
          content: 'Hello from UK test',
          contactName: 'UK Test',
          contactPhone: '+447123456789',
          timestamp: '2026-01-19 10:30',
          status: 'received'
        },
        {
          id: '2',
          direction: 'inbound',
          channel: 'whatsapp',
          content: '[Image] Product photo',
          contactName: 'UK Test',
          contactPhone: '+447123456789',
          timestamp: '2026-01-19 10:32',
          status: 'received',
          mediaUrl: 'https://auth.wecare.digital/whatsapp-media/incoming/img001.jpg'
        },
        {
          id: '3',
          direction: 'outbound',
          channel: 'whatsapp',
          content: 'Thank you for contacting WECARE.DIGITAL!',
          contactName: 'UK Test',
          contactPhone: '+447123456789',
          timestamp: '2026-01-19 10:35',
          status: 'delivered'
        }
      ]);
      
      setLoading(false);
    };
    
    loadDashboardData();
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return 'status-green';
      case 'warning': return 'status-yellow';
      case 'error': return 'status-red';
      default: return 'status-gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✕';
      default: return '?';
    }
  };

  if (loading) {
    return (
      <Layout user={user} onSignOut={signOut}>
        <div className="page">
          <div className="loading">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <div className="dashboard-header">
          <h1 className="page-title">Dashboard</h1>
          <div className="header-actions">
            <Link href="/messaging" className="btn-primary">
              💬 Send Message
            </Link>
            <Link href="/bulk-messaging" className="btn-secondary">
              📨 Bulk Job
            </Link>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📨</div>
            <div className="stat-content">
              <div className="stat-value">{stats.messagesToday}</div>
              <div className="stat-label">Messages Today</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{stats.messagesWeek}</div>
              <div className="stat-label">This Week</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{stats.activeContacts}</div>
              <div className="stat-label">Active Contacts</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div className="stat-content">
              <div className="stat-value">{stats.aiResponses}</div>
              <div className="stat-label">AI Responses</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <div className="stat-value">{stats.bulkJobs}</div>
              <div className="stat-label">Bulk Jobs</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.deliveryRate}%</div>
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
              <div className={`status-badge ${getStatusClass(systemHealth.whatsapp.status)}`}>
                {getStatusIcon(systemHealth.whatsapp.status)} {systemHealth.whatsapp.status === 'active' ? 'Active' : systemHealth.whatsapp.status}
              </div>
              <div className="status-detail">{systemHealth.whatsapp.detail}</div>
            </div>
            <div className="status-card">
              <div className="status-header">
                <span className="status-icon">📱</span>
                <span className="status-name">SMS</span>
              </div>
              <div className={`status-badge ${getStatusClass(systemHealth.sms.status)}`}>
                {getStatusIcon(systemHealth.sms.status)} {systemHealth.sms.status === 'active' ? 'Active' : systemHealth.sms.status}
              </div>
              <div className="status-detail">{systemHealth.sms.detail}</div>
            </div>
            <div className="status-card">
              <div className="status-header">
                <span className="status-icon">📧</span>
                <span className="status-name">Email</span>
              </div>
              <div className={`status-badge ${getStatusClass(systemHealth.email.status)}`}>
                {getStatusIcon(systemHealth.email.status)} {systemHealth.email.status === 'active' ? 'Active' : systemHealth.email.status}
              </div>
              <div className="status-detail">{systemHealth.email.detail}</div>
            </div>
            <div className="status-card">
              <div className="status-header">
                <span className="status-icon">🤖</span>
                <span className="status-name">AI Agent</span>
              </div>
              <div className={`status-badge ${getStatusClass(systemHealth.ai.status)}`}>
                {getStatusIcon(systemHealth.ai.status)} Enabled
              </div>
              <div className="status-detail">{systemHealth.ai.detail}</div>
            </div>
            <div className="status-card">
              <div className="status-header">
                <span className="status-icon">⚠️</span>
                <span className="status-name">DLQ Depth</span>
              </div>
              <div className={`status-badge ${systemHealth.dlq.depth > 10 ? 'status-red' : systemHealth.dlq.depth > 0 ? 'status-yellow' : 'status-green'}`}>
                {systemHealth.dlq.depth} messages
              </div>
              <div className="status-detail">Failed message queue</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            <Link href="/messaging?channel=whatsapp" className="quick-action-card">
              <span className="qa-icon">💬</span>
              <span className="qa-title">WhatsApp</span>
              <span className="qa-desc">Send & receive</span>
            </Link>
            <Link href="/messaging?channel=sms" className="quick-action-card">
              <span className="qa-icon">📱</span>
              <span className="qa-title">SMS</span>
              <span className="qa-desc">Text messages</span>
            </Link>
            <Link href="/messaging?channel=email" className="quick-action-card">
              <span className="qa-icon">📧</span>
              <span className="qa-title">Email</span>
              <span className="qa-desc">Send emails</span>
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
              <div className="phone-id">phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54</div>
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
              <div className="phone-id">phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06</div>
            </div>
          </div>
        </div>

        {/* AWS Resources Summary */}
        <div className="section">
          <h2 className="section-title">AWS Resources (60+ Active)</h2>
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
              <div className="resource-name">WABA</div>
            </div>
            <div className="resource-item">
              <div className="resource-count">2</div>
              <div className="resource-name">Agents</div>
            </div>
            <div className="resource-item">
              <div className="resource-count">1</div>
              <div className="resource-name">KB</div>
            </div>
            <div className="resource-item">
              <div className="resource-count">1</div>
              <div className="resource-name">Cognito</div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Recent Messages</h2>
            <Link href="/messaging" className="view-all-link">View All →</Link>
          </div>
          <div className="activity-list">
            {recentMessages.map(msg => (
              <div key={msg.id} className="activity-item">
                <div className={`activity-icon ${msg.direction}`}>
                  {msg.direction === 'inbound' ? '↓' : '↑'}
                </div>
                <div className="activity-content">
                  <div className="activity-text">
                    <strong>{msg.contactName}</strong> 
                    {msg.direction === 'inbound' ? ' sent' : ' received'} a {msg.channel} message
                  </div>
                  <div className="activity-detail">
                    {msg.mediaUrl && '📎 '}
                    {msg.content.substring(0, 60)}{msg.content.length > 60 ? '...' : ''}
                  </div>
                </div>
                <div className="activity-meta">
                  <div className="activity-time">{msg.timestamp.split(' ')[1]}</div>
                  <div className={`activity-status status-${msg.status}`}>
                    {msg.status === 'delivered' ? '✓✓' : msg.status === 'sent' ? '✓' : '●'}
                  </div>
                </div>
              </div>
            ))}
            {recentMessages.length === 0 && (
              <div className="empty-state">
                <p>No recent messages</p>
                <Link href="/messaging" className="btn-primary">Send First Message</Link>
              </div>
            )}
          </div>
        </div>

        {/* API Quotas */}
        <div className="section">
          <h2 className="section-title">API Rate Limits</h2>
          <div className="quota-grid">
            <div className="quota-item">
              <div className="quota-name">SendWhatsAppMessage</div>
              <div className="quota-bar">
                <div className="quota-fill" style={{ width: '5%' }}></div>
              </div>
              <div className="quota-value">50 / 1,000 per sec</div>
            </div>
            <div className="quota-item">
              <div className="quota-name">PostWhatsAppMessageMedia</div>
              <div className="quota-bar">
                <div className="quota-fill" style={{ width: '2%' }}></div>
              </div>
              <div className="quota-value">2 / 100 per sec</div>
            </div>
            <div className="quota-item">
              <div className="quota-name">GetWhatsAppMessageMedia</div>
              <div className="quota-bar">
                <div className="quota-fill" style={{ width: '3%' }}></div>
              </div>
              <div className="quota-value">3 / 100 per sec</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
