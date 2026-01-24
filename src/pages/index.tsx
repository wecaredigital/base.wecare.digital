/**
 * Unified Dashboard - WECARE.DIGITAL
 * Clean tabbed interface with Overview, Messages, Payments, Data, Billing
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import * as api from '../api/client';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

type TabType = 'overview' | 'messages' | 'payments' | 'data' | 'billing';

const PAYMENT_PHONE = '+91 93309 94400';
const PAYMENT_NAME = 'WECARE.DIGITAL';

// AWS Resource ARNs for billing display - All resources in account 809904170947
const AWS_RESOURCES: Record<string, { arn: string; accountId: string; details?: string[] }> = {
  'Amazon Bedrock': { 
    arn: 'arn:aws:bedrock:us-east-1:809904170947:*', 
    accountId: '809904170947',
    details: ['Knowledge Base: wecare-digital-kb', 'Agent: wecare-digital-agent']
  },
  'AWS Lambda': { 
    arn: 'arn:aws:lambda:us-east-1:809904170947:function:wecare-*', 
    accountId: '809904170947',
    details: [
      'wecare-outbound-whatsapp',
      'wecare-inbound-whatsapp', 
      'wecare-contacts-create',
      'wecare-contacts-delete',
      'wecare-contacts-search',
      'wecare-messages-read',
      'wecare-messages-delete',
      'wecare-whatsapp-templates',
      'wecare-ai-generate-response',
      'wecare-ai-query-kb',
      'wecare-outbound-sms'
    ]
  },
  'Amazon DynamoDB': { 
    arn: 'arn:aws:dynamodb:us-east-1:809904170947:table/base-wecare-*', 
    accountId: '809904170947',
    details: [
      'base-wecare-digital-ContactsTable',
      'base-wecare-digital-WhatsAppOutboundTable',
      'base-wecare-digital-MediaFilesTable',
      'base-wecare-digital-RateLimitTable'
    ]
  },
  'Amazon S3': { 
    arn: 'arn:aws:s3:::auth.wecare.digital', 
    accountId: '809904170947',
    details: ['Bucket: auth.wecare.digital', 'Media storage for WhatsApp']
  },
  'Amazon API Gateway': { 
    arn: 'arn:aws:apigateway:us-east-1::/restapis/k4vqzmi07b', 
    accountId: '809904170947',
    details: ['REST API: k4vqzmi07b', 'Stage: prod']
  },
  'AWS Amplify': { 
    arn: 'arn:aws:amplify:us-east-1:809904170947:apps/dtiq7il2x5c5g', 
    accountId: '809904170947',
    details: ['App: dtiq7il2x5c5g', 'Branch: base', 'Domain: base.wecare.digital']
  },
  'Amazon SNS': { 
    arn: 'arn:aws:sns:us-east-1:809904170947:wecare-*', 
    accountId: '809904170947',
    details: ['wecare-whatsapp-inbound-topic']
  },
  'Amazon SQS': { 
    arn: 'arn:aws:sqs:us-east-1:809904170947:wecare-*', 
    accountId: '809904170947',
    details: ['wecare-whatsapp-dlq']
  },
  'AWS End User Messaging': { 
    arn: 'arn:aws:social-messaging:us-east-1:809904170947:*', 
    accountId: '809904170947',
    details: [
      'Phone: +91 93309 94400 (WECARE.DIGITAL)',
      'Phone: +91 99033 00044 (Manish Agarwal)',
      'WABA ID: 1347766229904230'
    ]
  },
  'Amazon Cognito': { 
    arn: 'arn:aws:cognito-idp:us-east-1:809904170947:userpool/*', 
    accountId: '809904170947',
    details: ['User Pool for authentication']
  },
  'CloudWatch': { 
    arn: 'arn:aws:logs:us-east-1:809904170947:log-group:/aws/lambda/wecare-*', 
    accountId: '809904170947',
    details: ['Log groups for all Lambda functions']
  },
  'Amazon Route 53': { 
    arn: 'arn:aws:route53:::hostedzone/Z0123456789', 
    accountId: '809904170947',
    details: ['Domain: wecare.digital', 'Subdomain: base.wecare.digital', 'Subdomain: auth.wecare.digital']
  },
  'Amazon CloudFront': { 
    arn: 'arn:aws:cloudfront::809904170947:distribution/*', 
    accountId: '809904170947',
    details: ['CDN for static assets']
  },
  'Amazon OpenSearch': { 
    arn: 'arn:aws:es:us-east-1:809904170947:domain/*', 
    accountId: '809904170947',
    details: ['Serverless collection for Bedrock KB']
  },
};

const Dashboard: React.FC<PageProps> = ({ signOut, user }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [apiLatency, setApiLatency] = useState<number | null>(null);

  // Data
  const [contacts, setContacts] = useState<api.Contact[]>([]);
  const [messages, setMessages] = useState<api.Message[]>([]);
  const [billingData, setBillingData] = useState<api.AWSBillingData | null>(null);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const lastMessageCount = useRef(0);

  // Delete state
  const [deleteMode, setDeleteMode] = useState<'messages' | 'hard' | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  
  // Billing expanded rows
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    
    const connectionTest = await api.testConnection();
    setApiConnected(connectionTest.success);
    setApiLatency(connectionTest.latency || null);
    
    if (!connectionTest.success) {
      if (!silent) setLoading(false);
      return;
    }
    
    try {
      const [contactsData, messagesData, billingResult] = await Promise.all([
        api.listContacts(),
        api.listMessages(),
        api.getAWSBilling()
      ]);
      
      lastMessageCount.current = messagesData.length;
      setContacts(contactsData);
      setMessages(messagesData);
      setBillingData(billingResult);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => loadData(true), 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleDeleteMessages = async () => {
    if (selectedMessages.length === 0) return;
    setDeleting(true);
    try {
      for (const msgId of selectedMessages) {
        const msg = messages.find(m => m.id === msgId);
        if (msg) await api.deleteMessage(msgId, msg.direction);
      }
      setSelectedMessages([]);
      setDeleteMode(null);
      await loadData();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleHardDelete = async () => {
    if (!selectedContact || confirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      await api.hardDeleteContact(selectedContact);
      setSelectedContact('');
      setDeleteMode(null);
      setConfirmText('');
      await loadData();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  const toggleServiceExpand = (service: string) => {
    setExpandedServices(prev => {
      const next = new Set(prev);
      if (next.has(service)) next.delete(service);
      else next.add(service);
      return next;
    });
  };

  // Stats
  const todayMessages = messages.filter(m => {
    const msgDate = new Date(m.timestamp);
    const today = new Date();
    return msgDate.toDateString() === today.toDateString();
  });
  const inboundCount = messages.filter(m => m.direction === 'INBOUND').length;
  const outboundCount = messages.filter(m => m.direction === 'OUTBOUND').length;
  const paymentMessages = messages.filter(m => m.messageType === 'payment');
  const capturedPayments = paymentMessages.filter(m => (m as any).paymentStatus === 'captured').length;
  const failedPayments = paymentMessages.filter(m => (m as any).paymentStatus === 'failed').length;

  // Filter messages
  const filteredMessages = searchQuery.trim()
    ? messages.filter(m =>
        m.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contacts.find(c => c.id === m.contactId)?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contacts.find(c => c.id === m.contactId)?.phone?.includes(searchQuery)
      )
    : messages;

  const contactMessages = selectedContact
    ? filteredMessages.filter(m => m.contactId === selectedContact)
    : filteredMessages;

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="dash">
        {/* Header */}
        <header className="dash-header">
          <div className="dash-brand">
            <h1>WECARE.DIGITAL</h1>
            <div className="dash-status">
              <span className={`status-dot ${apiConnected ? 'online' : 'offline'}`} />
              <span>{apiConnected ? `${apiLatency}ms` : 'Offline'}</span>
              <span className="sep">•</span>
              <span>{lastRefresh.toLocaleTimeString()}</span>
            </div>
          </div>
          <button className="refresh-btn" onClick={() => loadData()} disabled={loading}>
            {loading ? '...' : '↻'}
          </button>
        </header>

        {/* Tabs */}
        <nav className="dash-tabs">
          {(['overview', 'messages', 'payments', 'data', 'billing'] as TabType[]).map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && '◉'}
              {tab === 'messages' && '◫'}
              {tab === 'payments' && '$'}
              {tab === 'data' && '⊗'}
              {tab === 'billing' && '≡'}
              <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="tab-content">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="overview">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{contacts.length}</div>
                  <div className="stat-label">Contacts</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{messages.length}</div>
                  <div className="stat-label">Messages</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{todayMessages.length}</div>
                  <div className="stat-label">Today</div>
                </div>
                <div className="stat-card accent">
                  <div className="stat-value">{inboundCount}</div>
                  <div className="stat-label">Inbound</div>
                </div>
                <div className="stat-card accent2">
                  <div className="stat-value">{outboundCount}</div>
                  <div className="stat-label">Outbound</div>
                </div>
                <div className="stat-card success">
                  <div className="stat-value">{capturedPayments}</div>
                  <div className="stat-label">Paid</div>
                </div>
              </div>

              <div className="section">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                  <Link href="/dm/whatsapp" className="action-card whatsapp">
                    <span className="icon">◈</span>
                    <span>WhatsApp</span>
                  </Link>
                  <Link href="/pay" className="action-card payment">
                    <span className="icon">$</span>
                    <span>Pay</span>
                  </Link>
                  <Link href="/invoice" className="action-card invoice">
                    <span className="icon">⎘</span>
                    <span>Invoice</span>
                  </Link>
                  <Link href="/link" className="action-card link-card">
                    <span className="icon">⊕</span>
                    <span>Link</span>
                  </Link>
                  <Link href="/contacts" className="action-card">
                    <span className="icon">◉</span>
                    <span>Contacts</span>
                  </Link>
                  <Link href="/bulk" className="action-card">
                    <span className="icon">⫶</span>
                    <span>Bulk</span>
                  </Link>
                  <Link href="/dm/sms" className="action-card">
                    <span className="icon">▤</span>
                    <span>SMS</span>
                  </Link>
                  <Link href="/dm/ses" className="action-card">
                    <span className="icon">◇</span>
                    <span>Email</span>
                  </Link>
                </div>
              </div>

              <div className="section">
                <div className="section-header">
                  <h3>Recent Messages</h3>
                  <Link href="/dm/whatsapp" className="link">View All →</Link>
                </div>
                <div className="msg-list">
                  {messages.slice(0, 5).map(msg => {
                    const contact = contacts.find(c => c.id === msg.contactId);
                    return (
                      <div key={msg.id} className={`msg-item ${msg.direction.toLowerCase()}`}>
                        <span className="dir">{msg.direction === 'INBOUND' ? '↓' : '↑'}</span>
                        <span className="name">{contact?.name || contact?.phone || '...'}</span>
                        <span className="content">{msg.content?.slice(0, 40) || '[Media]'}</span>
                        <span className="time">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="section">
                <h3>WhatsApp Numbers</h3>
                <div className="phones-grid">
                  <div className="phone-card">
                    <div className="phone-name">WECARE.DIGITAL</div>
                    <div className="phone-num">+91 93309 94400</div>
                    <span className="badge green">Razorpay</span>
                  </div>
                  <div className="phone-card">
                    <div className="phone-name">Manish Agarwal</div>
                    <div className="phone-num">+91 99033 00044</div>
                    <span className="badge">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && (
            <div className="messages-tab">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && <button onClick={() => setSearchQuery('')}>×</button>}
              </div>
              
              <div className="msg-list full">
                {filteredMessages.slice(0, 50).map(msg => {
                  const contact = contacts.find(c => c.id === msg.contactId);
                  return (
                    <div key={msg.id} className={`msg-item ${msg.direction.toLowerCase()}`}>
                      <span className="dir">{msg.direction === 'INBOUND' ? '↓' : '↑'}</span>
                      <span className="name">{contact?.name || contact?.phone || '...'}</span>
                      <span className="content">{msg.content?.slice(0, 60) || '[Media]'}</span>
                      <span className="time">{new Date(msg.timestamp).toLocaleString()}</span>
                      <span className="status">{msg.status}</span>
                    </div>
                  );
                })}
                {filteredMessages.length === 0 && <div className="empty">No messages found</div>}
              </div>
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <div className="payments-tab">
              <div className="section-header">
                <h3>Payment Records</h3>
                <Link href="/pay" className="btn-primary">+ New Payment</Link>
              </div>
              
              <div className="stats-grid small">
                <div className="stat-card success">
                  <div className="stat-value">{capturedPayments}</div>
                  <div className="stat-label">Captured</div>
                </div>
                <div className="stat-card error">
                  <div className="stat-value">{failedPayments}</div>
                  <div className="stat-label">Failed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{paymentMessages.length}</div>
                  <div className="stat-label">Total</div>
                </div>
              </div>

              <div className="payment-info">
                <span>Payments sent from: <strong>{PAYMENT_PHONE}</strong> ({PAYMENT_NAME})</span>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Phone</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentMessages.map(p => (
                    <tr key={p.id} className={(p as any).paymentStatus}>
                      <td>{(p as any).paymentReferenceId || '-'}</td>
                      <td>{p.senderPhone || '-'}</td>
                      <td>{p.content}</td>
                      <td><span className={`badge ${(p as any).paymentStatus}`}>{(p as any).paymentStatus || p.status}</span></td>
                      <td>{new Date(p.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                  {paymentMessages.length === 0 && (
                    <tr><td colSpan={5} className="empty">No payment records</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* DATA TAB */}
          {activeTab === 'data' && (
            <div className="data-tab">
              <h3>Data Management</h3>
              
              <div className="delete-options">
                <button 
                  className={deleteMode === 'messages' ? 'active' : ''} 
                  onClick={() => setDeleteMode(deleteMode === 'messages' ? null : 'messages')}
                >
                  ◫ Delete Messages
                </button>
                <button 
                  className={`danger ${deleteMode === 'hard' ? 'active' : ''}`}
                  onClick={() => setDeleteMode(deleteMode === 'hard' ? null : 'hard')}
                >
                  ⊗ Hard Delete
                </button>
              </div>

              {deleteMode === 'messages' && (
                <div className="delete-panel">
                  <div className="form-row">
                    <label>Filter by Contact</label>
                    <select value={selectedContact} onChange={e => setSelectedContact(e.target.value)}>
                      <option value="">All contacts</option>
                      {contacts.map(c => (
                        <option key={c.id} value={c.id}>{c.name || c.phone}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="msg-select-list">
                    <div className="select-header">
                      <span>{selectedMessages.length} selected</span>
                      <button onClick={() => setSelectedMessages(
                        selectedMessages.length === contactMessages.length ? [] : contactMessages.map(m => m.id)
                      )}>
                        {selectedMessages.length === contactMessages.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    {contactMessages.slice(0, 30).map(msg => (
                      <label key={msg.id} className="msg-select-row">
                        <input
                          type="checkbox"
                          checked={selectedMessages.includes(msg.id)}
                          onChange={() => setSelectedMessages(prev =>
                            prev.includes(msg.id) ? prev.filter(id => id !== msg.id) : [...prev, msg.id]
                          )}
                        />
                        <span className="dir">{msg.direction === 'INBOUND' ? '↓' : '↑'}</span>
                        <span className="content">{msg.content?.slice(0, 40) || '[Media]'}</span>
                        <span className="time">{new Date(msg.timestamp).toLocaleDateString()}</span>
                      </label>
                    ))}
                  </div>
                  
                  <div className="delete-actions">
                    <button className="btn-secondary" onClick={() => { setDeleteMode(null); setSelectedMessages([]); }}>Cancel</button>
                    <button className="btn-danger" onClick={handleDeleteMessages} disabled={deleting || selectedMessages.length === 0}>
                      {deleting ? '...' : `Delete ${selectedMessages.length}`}
                    </button>
                  </div>
                </div>
              )}

              {deleteMode === 'hard' && (
                <div className="delete-panel danger">
                  <div className="warning">⚠ Permanently deletes contact, messages, and media files!</div>
                  
                  <div className="form-row">
                    <label>Select Contact</label>
                    <select value={selectedContact} onChange={e => setSelectedContact(e.target.value)}>
                      <option value="">Select...</option>
                      {contacts.map(c => (
                        <option key={c.id} value={c.id}>{c.name || c.phone}</option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedContact && (
                    <>
                      <div className="preview">
                        <p>Contact: {contacts.find(c => c.id === selectedContact)?.name || selectedContact}</p>
                        <p>{contactMessages.length} messages, {contactMessages.filter(m => m.s3Key).length} media</p>
                      </div>
                      <div className="form-row">
                        <label>Type DELETE to confirm:</label>
                        <input type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="DELETE" />
                      </div>
                    </>
                  )}
                  
                  <div className="delete-actions">
                    <button className="btn-secondary" onClick={() => { setDeleteMode(null); setSelectedContact(''); setConfirmText(''); }}>Cancel</button>
                    <button className="btn-danger hard" onClick={handleHardDelete} disabled={deleting || confirmText !== 'DELETE'}>
                      {deleting ? '...' : 'Hard Delete'}
                    </button>
                  </div>
                </div>
              )}

              {!deleteMode && (
                <div className="stats-grid">
                  <div className="stat-card"><div className="stat-value">{contacts.length}</div><div className="stat-label">Contacts</div></div>
                  <div className="stat-card"><div className="stat-value">{messages.length}</div><div className="stat-label">Messages</div></div>
                  <div className="stat-card"><div className="stat-value">{messages.filter(m => m.s3Key).length}</div><div className="stat-label">Media</div></div>
                </div>
              )}
            </div>
          )}

          {/* BILLING TAB */}
          {activeTab === 'billing' && (
            <div className="billing-tab">
              <div className="section-header">
                <h3>AWS Billing & Usage</h3>
                <button className="refresh-btn" onClick={() => loadData()}>↻</button>
              </div>
              
              {billingData && (
                <>
                  <div className="billing-summary">
                    <div className="billing-total">
                      <span className="amount">${billingData.totalCost.toFixed(2)}</span>
                      <span className="label">Estimated Cost</span>
                    </div>
                    <div className="billing-meta">
                      <div className="period">{billingData.period}</div>
                      <div className="account">Account: 809904170947</div>
                    </div>
                  </div>

                  <table className="billing-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Service</th>
                        <th>Usage</th>
                        <th>Free Limit</th>
                        <th>Cost</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingData.services.map((svc, idx) => {
                        const resource = AWS_RESOURCES[svc.service] || { 
                          arn: `arn:aws:*:us-east-1:809904170947:${svc.service.toLowerCase().replace(/\s+/g, '-')}/*`, 
                          accountId: '809904170947' 
                        };
                        const isExpanded = expandedServices.has(svc.service);
                        return (
                          <React.Fragment key={idx}>
                            <tr className={`billing-row ${svc.status}`}>
                              <td className="expand-cell">
                                <button className="expand-btn" onClick={() => toggleServiceExpand(svc.service)}>
                                  {isExpanded ? '−' : '+'}
                                </button>
                              </td>
                              <td className="service-name">{svc.service}</td>
                              <td>{svc.usage.toLocaleString()} <small>{svc.unit}</small></td>
                              <td>{svc.freeLimit}</td>
                              <td>${svc.cost.toFixed(4)}</td>
                              <td>
                                <span className={`badge ${svc.status}`}>
                                  {svc.status === 'free' ? '✓ Free' : svc.status === 'warning' ? '! Near' : '$ Paid'}
                                </span>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="resource-row">
                                <td></td>
                                <td colSpan={5}>
                                  <div className="resource-details">
                                    <div><strong>Account ID:</strong> {resource.accountId}</div>
                                    <div><strong>Resource ARN:</strong> <code>{resource.arn}</code></div>
                                    {resource.details && resource.details.length > 0 && (
                                      <div className="resource-list">
                                        <strong>Resources:</strong>
                                        <ul>
                                          {resource.details.map((detail, i) => (
                                            <li key={i}>{detail}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .dash { padding: 16px; max-width: 1200px; margin: 0 auto; }
        
        .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #eee; }
        .dash-brand h1 { font-size: 18px; margin: 0; font-weight: 600; }
        .dash-status { font-size: 12px; color: #666; display: flex; align-items: center; gap: 6px; margin-top: 4px; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-dot.online { background: #22c55e; }
        .status-dot.offline { background: #ef4444; }
        .sep { color: #ddd; }
        .refresh-btn { width: 32px; height: 32px; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px; }
        .refresh-btn:hover { background: #f5f5f5; }
        
        .dash-tabs { display: flex; gap: 4px; margin-bottom: 20px; overflow-x: auto; }
        .tab { display: flex; align-items: center; gap: 6px; padding: 10px 16px; border: none; background: #f5f5f5; border-radius: 8px; cursor: pointer; font-size: 13px; color: #666; white-space: nowrap; }
        .tab:hover { background: #eee; }
        .tab.active { background: #25D366; color: #fff; }
        
        .tab-content { animation: fadeIn 0.2s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .stats-grid.small { grid-template-columns: repeat(3, 1fr); max-width: 360px; }
        .stat-card { background: #fff; padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #eee; }
        .stat-card.accent { border-left: 3px solid #3b82f6; }
        .stat-card.accent2 { border-left: 3px solid #22c55e; }
        .stat-card.success { background: #f0fdf4; border-color: #bbf7d0; }
        .stat-card.error { background: #fef2f2; border-color: #fecaca; }
        .stat-value { font-size: 24px; font-weight: 600; }
        .stat-label { font-size: 12px; color: #666; margin-top: 4px; }
        
        .section { margin-bottom: 24px; }
        .section h3 { font-size: 14px; font-weight: 600; margin: 0 0 12px 0; color: #333; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .section-header h3 { margin: 0; }
        .link { color: #25D366; text-decoration: none; font-size: 13px; }
        
        .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; }
        .action-card { display: flex; flex-direction: column; align-items: center; padding: 16px 12px; background: #fff; border-radius: 10px; text-decoration: none; color: #333; border: 1px solid #eee; transition: all 0.2s; }
        .action-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .action-card .icon { font-size: 20px; margin-bottom: 6px; }
        .action-card.whatsapp { border-left: 3px solid #25D366; }
        .action-card.payment { border-left: 3px solid #f59e0b; }
        .action-card.invoice { border-left: 3px solid #8b5cf6; }
        .action-card.link-card { border-left: 3px solid #3b82f6; }
        
        .msg-list { background: #fff; border-radius: 10px; border: 1px solid #eee; overflow: hidden; }
        .msg-list.full { max-height: 400px; overflow-y: auto; }
        .msg-item { display: grid; grid-template-columns: 20px 100px 1fr 60px; gap: 10px; padding: 10px 14px; border-bottom: 1px solid #f5f5f5; align-items: center; font-size: 13px; }
        .msg-item:last-child { border-bottom: none; }
        .msg-item.inbound { background: #fafafa; }
        .msg-item .dir { font-weight: 600; }
        .msg-item.inbound .dir { color: #3b82f6; }
        .msg-item.outbound .dir { color: #22c55e; }
        .msg-item .name { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .msg-item .content { color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .msg-item .time { color: #999; font-size: 11px; }
        .msg-item .status { font-size: 11px; color: #999; }
        
        .phones-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
        .phone-card { background: #fff; padding: 14px; border-radius: 10px; border: 1px solid #eee; }
        .phone-name { font-weight: 500; font-size: 13px; }
        .phone-num { font-size: 15px; font-weight: 600; margin: 4px 0 8px; }
        .badge { font-size: 11px; padding: 2px 8px; border-radius: 10px; background: #f0f0f0; }
        .badge.green { background: #dcfce7; color: #166534; }
        .badge.captured { background: #dcfce7; color: #166534; }
        .badge.failed { background: #fee2e2; color: #991b1b; }
        .badge.free { background: #dcfce7; color: #166534; }
        .badge.warning { background: #fef3c7; color: #92400e; }
        .badge.paid { background: #fee2e2; color: #991b1b; }
        
        .search-bar { display: flex; gap: 8px; margin-bottom: 16px; }
        .search-bar input { flex: 1; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
        .search-bar button { padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; background: #fff; cursor: pointer; }
        
        .btn-primary { padding: 8px 16px; background: #25D366; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; text-decoration: none; }
        .btn-primary:hover { background: #1da851; }
        .btn-secondary { padding: 8px 16px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; font-size: 13px; }
        .btn-danger { padding: 8px 16px; background: #ef4444; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
        .btn-danger.hard { background: #991b1b; }
        .btn-danger:disabled { background: #fca5a5; }
        
        .payment-info { background: #f0fdf4; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; border: 1px solid #bbf7d0; }
        
        .data-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; border: 1px solid #eee; }
        .data-table th, .data-table td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
        .data-table th { background: #fafafa; font-weight: 500; color: #666; }
        .data-table td small { color: #999; }
        .empty { text-align: center; padding: 24px; color: #999; }
        
        .delete-options { display: flex; gap: 10px; margin-bottom: 16px; }
        .delete-options button { padding: 10px 16px; border: 2px solid #ddd; border-radius: 8px; background: #fff; cursor: pointer; font-size: 13px; }
        .delete-options button:hover { border-color: #999; }
        .delete-options button.active { border-color: #25D366; background: #f0fdf4; }
        .delete-options button.danger.active { border-color: #ef4444; background: #fef2f2; }
        
        .delete-panel { background: #fafafa; padding: 16px; border-radius: 10px; }
        .delete-panel.danger { background: #fef2f2; border: 1px solid #fecaca; }
        .warning { background: #fef3c7; color: #92400e; padding: 10px 14px; border-radius: 8px; margin-bottom: 12px; font-size: 13px; }
        .preview { background: #fff; padding: 10px 14px; border-radius: 8px; margin-bottom: 12px; font-size: 13px; }
        .preview p { margin: 4px 0; }
        .form-row { margin-bottom: 12px; }
        .form-row label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
        .form-row select, .form-row input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
        .delete-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
        
        .msg-select-list { background: #fff; border-radius: 8px; max-height: 250px; overflow-y: auto; margin-bottom: 12px; border: 1px solid #eee; }
        .select-header { display: flex; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid #eee; font-size: 13px; }
        .select-header button { background: none; border: none; color: #25D366; cursor: pointer; font-size: 13px; }
        .msg-select-row { display: grid; grid-template-columns: 20px 20px 1fr 70px; gap: 10px; padding: 8px 14px; border-bottom: 1px solid #f5f5f5; align-items: center; cursor: pointer; font-size: 13px; }
        .msg-select-row:hover { background: #fafafa; }
        .btn-secondary { padding: 8px 16px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; font-size: 13px; }
        .btn-danger { padding: 8px 16px; background: #ef4444; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
        .btn-danger.hard { background: #991b1b; }
        .btn-danger:disabled { background: #fca5a5; }
        
        .payment-info { background: #f0fdf4; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; border: 1px solid #bbf7d0; }
        
        .data-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; border: 1px solid #eee; }
        .data-table th, .data-table td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
        .data-table th { background: #fafafa; font-weight: 500; color: #666; }
        .data-table td small { color: #999; }
        .empty { text-align: center; padding: 24px; color: #999; }
        
        .delete-options { display: flex; gap: 10px; margin-bottom: 16px; }
        .delete-options button { padding: 10px 16px; border: 2px solid #ddd; border-radius: 8px; background: #fff; cursor: pointer; font-size: 13px; }
        .delete-options button:hover { border-color: #999; }
        .delete-options button.active { border-color: #25D366; background: #f0fdf4; }
        .delete-options button.danger.active { border-color: #ef4444; background: #fef2f2; }
        
        .delete-panel { background: #fafafa; padding: 16px; border-radius: 10px; }
        .delete-panel.danger { background: #fef2f2; border: 1px solid #fecaca; }
        .warning { background: #fef3c7; color: #92400e; padding: 10px 14px; border-radius: 8px; margin-bottom: 12px; font-size: 13px; }
        .preview { background: #fff; padding: 10px 14px; border-radius: 8px; margin-bottom: 12px; font-size: 13px; }
        .preview p { margin: 4px 0; }
        .form-row { margin-bottom: 12px; }
        .form-row label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
        .form-row select, .form-row input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
        .delete-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
        
        .msg-select-list { background: #fff; border-radius: 8px; max-height: 250px; overflow-y: auto; margin-bottom: 12px; border: 1px solid #eee; }
        .select-header { display: flex; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid #eee; font-size: 13px; }
        .select-header button { background: none; border: none; color: #25D366; cursor: pointer; font-size: 13px; }
        .msg-select-row { display: grid; grid-template-columns: 20px 20px 1fr 70px; gap: 10px; padding: 8px 14px; border-bottom: 1px solid #f5f5f5; align-items: center; cursor: pointer; font-size: 13px; }
        .msg-select-row:hover { background: #fafafa; }
        
        .billing-summary { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 20px; border-radius: 10px; border: 1px solid #eee; margin-bottom: 20px; }
        .billing-total .amount { font-size: 32px; font-weight: 600; }
        .billing-total .label { display: block; font-size: 12px; color: #666; }
        .billing-meta { text-align: right; }
        .billing-meta .period { font-size: 13px; color: #666; }
        .billing-meta .account { font-size: 12px; color: #999; margin-top: 4px; }
        
        .billing-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; border: 1px solid #eee; }
        .billing-table th, .billing-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
        .billing-table th { background: #fafafa; font-weight: 500; color: #666; }
        .billing-row.warning { background: #fffbeb; }
        .billing-row.paid { background: #fef2f2; }
        .expand-cell { width: 30px; }
        .expand-btn { width: 24px; height: 24px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; font-size: 14px; }
        .expand-btn:hover { background: #f5f5f5; }
        .service-name { font-weight: 500; }
        .resource-row { background: #f9fafb; }
        .resource-details { padding: 8px 0; font-size: 12px; }
        .resource-details div { margin: 4px 0; }
        .resource-details code { background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-size: 11px; word-break: break-all; }
        .resource-list { margin-top: 8px; }
        .resource-list ul { margin: 4px 0 0 16px; padding: 0; }
        .resource-list li { margin: 2px 0; color: #666; font-family: monospace; font-size: 11px; }
        
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(3, 1fr); }
          .msg-item { grid-template-columns: 20px 80px 1fr; }
          .msg-item .time { display: none; }
          .billing-summary { flex-direction: column; text-align: center; gap: 12px; }
          .billing-meta { text-align: center; }
        }
      `}</style>
    </Layout>
  );
};

export default Dashboard;
