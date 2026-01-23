/**
 * Dashboard Page - WECARE.DIGITAL
 * Real-time dashboard with auto-refresh on new messages
 * NO FAKE DATA - All from real AWS resources
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import * as api from '../api/client';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const Dashboard: React.FC<PageProps> = ({ signOut, user }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  
  // Real data from API
  const [contacts, setContacts] = useState<api.Contact[]>([]);
  const [messages, setMessages] = useState<api.Message[]>([]);
  const [billingData, setBillingData] = useState<api.AWSBillingData | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ contacts: api.Contact[]; messages: api.Message[] } | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Quick compose state
  const [showCompose, setShowCompose] = useState(false);
  const [composeChannel, setComposeChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [selectedContact, setSelectedContact] = useState('');
  const [composeMessage, setComposeMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Real-time tracking
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [newMessageAlert, setNewMessageAlert] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    
    const connectionTest = await api.testConnection();
    setApiConnected(connectionTest.success);
    setApiLatency(connectionTest.latency || null);
    
    if (!connectionTest.success) {
      setError(connectionTest.message);
      if (!silent) setLoading(false);
      return;
    }
    
    try {
      const [contactsData, messagesData] = await Promise.all([
        api.listContacts(),
        api.listMessages()
      ]);
      
      // Check for new messages
      if (messagesData.length > lastMessageCount && lastMessageCount > 0) {
        setNewMessageAlert(true);
        // Play notification sound (optional)
        try {
          const audio = new Audio('/notification.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch {}
        
        // Auto-dismiss alert after 5 seconds
        setTimeout(() => setNewMessageAlert(false), 5000);
      }
      
      setContacts(contactsData);
      setMessages(messagesData);
      setLastMessageCount(messagesData.length);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Load error:', err);
      if (!silent) setError('Failed to load data');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [lastMessageCount]);

  const loadBillingData = useCallback(async () => {
    setBillingLoading(true);
    try {
      const data = await api.getAWSBilling();
      setBillingData(data);
    } catch (err) {
      console.error('Billing load error:', err);
    } finally {
      setBillingLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadBillingData();
  }, [loadData, loadBillingData]);

  // Real-time auto-refresh every 10 seconds (silent)
  useEffect(() => {
    const interval = setInterval(() => loadData(true), 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Search on type with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const filteredContacts = contacts.filter(c => 
        c.name?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query)
      );
      const filteredMessages = messages.filter(m =>
        m.content?.toLowerCase().includes(query) ||
        contacts.find(c => c.id === m.contactId)?.name?.toLowerCase().includes(query) ||
        contacts.find(c => c.id === m.contactId)?.phone?.toLowerCase().includes(query)
      );
      setSearchResults({ contacts: filteredContacts, messages: filteredMessages });
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, contacts, messages]);

  const handleSend = async () => {
    if (!selectedContact || !composeMessage.trim()) return;
    
    setSending(true);
    setSendResult(null);
    
    try {
      let result = null;
      if (composeChannel === 'whatsapp') {
        result = await api.sendWhatsAppMessage({
          contactId: selectedContact,
          content: composeMessage,
          phoneNumberId: 'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54'
        });
      } else if (composeChannel === 'sms') {
        result = await api.sendSmsMessage(selectedContact, composeMessage);
      } else {
        result = await api.sendEmailMessage(selectedContact, 'Message from WECARE.DIGITAL', composeMessage);
      }
      
      if (result) {
        setSendResult({ success: true, message: `Message sent! ID: ${result.messageId}` });
        setComposeMessage('');
        await loadData();
      } else {
        setSendResult({ success: false, message: 'Failed to send message' });
      }
    } catch (err) {
      setSendResult({ success: false, message: 'Send error occurred' });
    } finally {
      setSending(false);
    }
  };

  const todayMessages = messages.filter(m => {
    const msgDate = new Date(m.timestamp);
    const today = new Date();
    return msgDate.toDateString() === today.toDateString();
  });

  const inboundCount = messages.filter(m => m.direction === 'INBOUND').length;
  const outboundCount = messages.filter(m => m.direction === 'OUTBOUND').length;

  const handleDeleteMessage = async (msg: api.Message) => {
    if (!confirm('Delete this message?')) return;
    setDeleting(msg.id);
    try {
      const success = await api.deleteMessage(msg.id, msg.direction);
      if (success) {
        await loadData();
      } else {
        setError('Failed to delete message');
      }
    } catch (err) {
      setError('Delete error occurred');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteContact = async (contact: api.Contact) => {
    if (!confirm(`Delete contact "${contact.name || contact.phone}"?`)) return;
    setDeleting(contact.id);
    try {
      const success = await api.deleteContact(contact.id);
      if (success) {
        await loadData();
      } else {
        setError('Failed to delete contact');
      }
    } catch (err) {
      setError('Delete error occurred');
    } finally {
      setDeleting(null);
    }
  };

  // Display data (filtered if searching)
  const displayContacts = searchResults?.contacts ?? contacts;
  const displayMessages = searchResults?.messages ?? messages;

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        {/* New Message Alert */}
        {newMessageAlert && (
          <div className="new-message-alert" onClick={() => setNewMessageAlert(false)}>
            <span className="alert-icon">🔔</span>
            <span>New message received!</span>
            <button className="alert-dismiss">✕</button>
          </div>
        )}

        {/* Header */}
        <div className="dashboard-header">
          <h1 className="page-title">📊 Dashboard</h1>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => loadData()} disabled={loading}>
              🔄 {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button className="btn-primary" onClick={() => setShowCompose(!showCompose)}>
              ✉️ Quick Send
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span>❌ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Search Bar */}
        <div className="search-bar-global">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search contacts, messages..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input-global"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        {/* Search Results */}
        {searchResults && (
          <div className="search-results-panel">
            <div className="search-results-header">
              <span>Found {searchResults.contacts.length} contacts, {searchResults.messages.length} messages</span>
              <button className="btn-link" onClick={() => setSearchQuery('')}>Clear</button>
            </div>
          </div>
        )}

        {/* API Status */}
        <div className="api-status-bar">
          <span className={`status-dot ${apiConnected ? 'connected' : 'disconnected'}`}></span>
          <span>API: {apiConnected ? `Connected (${apiLatency}ms)` : 'Disconnected'}</span>
          <span className="status-separator">|</span>
          <span className="last-refresh">Last refresh: {lastRefresh.toLocaleTimeString()}</span>
          <span className="auto-refresh-indicator">🔄 Auto-refresh: 10s</span>
        </div>

        {/* Quick Compose Panel */}
        {showCompose && (
          <div className="section compose-panel">
            <h2 className="section-title">✉️ Quick Send Message</h2>
            
            {sendResult && (
              <div className={`send-result ${sendResult.success ? 'success' : 'error'}`}>
                {sendResult.success ? '✅' : '❌'} {sendResult.message}
              </div>
            )}
            
            <div className="compose-form">
              <div className="channel-selector">
                <button 
                  className={`channel-btn ${composeChannel === 'whatsapp' ? 'active' : ''}`}
                  onClick={() => setComposeChannel('whatsapp')}
                >
                  💬 WhatsApp
                </button>
                <button 
                  className={`channel-btn ${composeChannel === 'sms' ? 'active' : ''}`}
                  onClick={() => setComposeChannel('sms')}
                >
                  📱 SMS
                </button>
                <button 
                  className={`channel-btn ${composeChannel === 'email' ? 'active' : ''}`}
                  onClick={() => setComposeChannel('email')}
                >
                  📧 Email
                </button>
              </div>
              
              <div className="form-group">
                <label>To Contact</label>
                <select 
                  value={selectedContact} 
                  onChange={e => setSelectedContact(e.target.value)}
                >
                  <option value="">Select contact...</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.phone || c.email} ({c.phone || c.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Message</label>
                <textarea 
                  value={composeMessage}
                  onChange={e => setComposeMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                />
              </div>
              
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setShowCompose(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleSend}
                  disabled={!selectedContact || !composeMessage.trim() || sending}
                >
                  {sending ? '⏳ Sending...' : `📤 Send ${composeChannel.toUpperCase()}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{displayContacts.length}</div>
            <div className="stat-label">Contacts</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-value">{displayMessages.length}</div>
            <div className="stat-label">Total Messages</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-value">{todayMessages.length}</div>
            <div className="stat-label">Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📥</div>
            <div className="stat-value">{inboundCount}</div>
            <div className="stat-label">Inbound</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📤</div>
            <div className="stat-value">{outboundCount}</div>
            <div className="stat-label">Outbound</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section">
          <h2 className="section-title">⚡ Quick Actions</h2>
          <div className="quick-actions-grid">
            <Link href="/dm/whatsapp" className="quick-action-card">
              <span className="qa-icon">💬</span>
              <span className="qa-title">WhatsApp</span>
            </Link>
            <Link href="/dm/sms" className="quick-action-card">
              <span className="qa-icon">📱</span>
              <span className="qa-title">SMS</span>
            </Link>
            <Link href="/dm/ses" className="quick-action-card">
              <span className="qa-icon">📧</span>
              <span className="qa-title">Email</span>
            </Link>
            <Link href="/contacts" className="quick-action-card">
              <span className="qa-icon">➕</span>
              <span className="qa-title">Add Contact</span>
            </Link>
            <Link href="/bulk" className="quick-action-card">
              <span className="qa-icon">📤</span>
              <span className="qa-title">Bulk Send</span>
            </Link>
            <Link href="/admin" className="quick-action-card">
              <span className="qa-icon">⚙️</span>
              <span className="qa-title">Admin</span>
            </Link>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">💬 Recent Messages</h2>
            <Link href="/dm" className="view-all-link">View All →</Link>
          </div>
          
          {displayMessages.length > 0 ? (
            <div className="messages-list">
              {displayMessages.slice(0, 10).map(msg => {
                const contact = contacts.find(c => c.id === msg.contactId || c.contactId === msg.contactId);
                return (
                  <div key={msg.id} className={`message-row ${msg.direction.toLowerCase()}`}>
                    <div className="message-direction">
                      {msg.direction === 'INBOUND' ? '📥' : '📤'}
                    </div>
                    <div className="message-info">
                      <div className="message-contact">
                        {contact?.name || contact?.phone || msg.contactId?.substring(0, 8)}
                      </div>
                      <div className="message-preview">
                        {msg.mediaUrl ? `📎 ${msg.messageType || 'Media'}` : (
                          <>
                            {msg.content?.substring(0, 50) || '(no content)'}
                            {(msg.content?.length || 0) > 50 ? '...' : ''}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="message-meta">
                      <span className="message-channel">{msg.channel}</span>
                      <span className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteMessage(msg)}
                        disabled={deleting === msg.id}
                      >
                        {deleting === msg.id ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>No messages yet</p>
              <button className="btn-primary" onClick={() => setShowCompose(true)}>
                ✉️ Send First Message
              </button>
            </div>
          )}
        </div>

        {/* Contacts List */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">👥 Contacts ({displayContacts.length})</h2>
            <Link href="/contacts" className="view-all-link">Manage →</Link>
          </div>
          
          {displayContacts.length > 0 ? (
            <div className="contacts-grid">
              {displayContacts.slice(0, 6).map(contact => (
                <div key={contact.id} className="contact-card-mini">
                  <div className="contact-avatar-mini">
                    {(contact.name || contact.phone || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="contact-details-mini">
                    <div className="contact-name-mini">{contact.name || 'No name'}</div>
                    <div className="contact-phone-mini">{contact.phone || contact.email}</div>
                  </div>
                  <button 
                    className="delete-btn-mini" 
                    onClick={() => handleDeleteContact(contact)}
                    disabled={deleting === contact.id}
                  >
                    {deleting === contact.id ? '⏳' : '🗑️'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No contacts yet</p>
              <Link href="/contacts" className="btn-primary">➕ Add Contact</Link>
            </div>
          )}
        </div>

        {/* AWS Billing Section */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">💰 AWS Usage & Billing</h2>
            <button 
              className="btn-secondary btn-sm" 
              onClick={loadBillingData}
              disabled={billingLoading}
            >
              {billingLoading ? '⏳' : '🔄'}
            </button>
          </div>
          
          {billingData && (
            <>
              <div className="billing-summary">
                <div className="billing-total">
                  <span className="billing-amount">${billingData.totalCost.toFixed(2)}</span>
                  <span className="billing-label">Estimated Cost</span>
                </div>
                <div className="billing-period">
                  <span className="billing-dates">{billingData.period}</span>
                  <span className="billing-updated">Updated: {new Date(billingData.lastUpdated).toLocaleTimeString()}</span>
                </div>
              </div>
              
              <div className="billing-table-container">
                <table className="billing-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Usage</th>
                      <th>Free Limit</th>
                      <th>Cost</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingData.services.slice(0, 8).map((svc, idx) => (
                      <tr key={idx} className={`billing-row ${svc.status}`}>
                        <td className="service-name">{svc.service}</td>
                        <td className="service-usage">
                          {svc.usage.toLocaleString()} <span className="usage-unit">{svc.unit}</span>
                        </td>
                        <td className="service-limit">{svc.freeLimit}</td>
                        <td className="service-cost">${svc.cost.toFixed(4)}</td>
                        <td>
                          <span className={`status-badge ${svc.status}`}>
                            {svc.status === 'free' ? '✅ Free' : svc.status === 'warning' ? '⚠️ Near' : '💰 Paid'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* WhatsApp Numbers */}
        <div className="section">
          <h2 className="section-title">📱 WhatsApp Numbers</h2>
          <div className="phone-cards">
            <div className="phone-card">
              <div className="phone-header">
                <span className="phone-name">WECARE.DIGITAL</span>
                <span className="badge badge-green">🟢 GREEN</span>
              </div>
              <div className="phone-number">+91 93309 94400</div>
              <div className="phone-id">Primary</div>
            </div>
            <div className="phone-card">
              <div className="phone-header">
                <span className="phone-name">Manish Agarwal</span>
                <span className="badge badge-green">🟢 GREEN</span>
              </div>
              <div className="phone-number">+91 99033 00044</div>
              <div className="phone-id">Secondary</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
