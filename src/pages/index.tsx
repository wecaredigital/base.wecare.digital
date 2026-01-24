/**
 * Unified Dashboard - WECARE.DIGITAL
 * Combined Dashboard + Admin with improved UI
 * Real-time data, Payment logs, Quick actions
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

interface PaymentRecord {
  id: string;
  referenceId: string;
  status: string;
  amount: string;
  phone: string;
  timestamp: string;
}

const Dashboard: React.FC<PageProps> = ({ signOut, user }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  
  // Data
  const [contacts, setContacts] = useState<api.Contact[]>([]);
  const [messages, setMessages] = useState<api.Message[]>([]);
  const [billingData, setBillingData] = useState<api.AWSBillingData | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [selectedContact, setSelectedContact] = useState('');
  const [composeMessage, setComposeMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [newMessageAlert, setNewMessageAlert] = useState(false);
  const lastMessageCount = useRef(0);

  // Delete state
  const [deleteType, setDeleteType] = useState<string | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

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
      
      // Check for new messages
      if (messagesData.length > lastMessageCount.current && lastMessageCount.current > 0) {
        setNewMessageAlert(true);
        setTimeout(() => setNewMessageAlert(false), 5000);
      }
      lastMessageCount.current = messagesData.length;
      
      setContacts(contactsData);
      setMessages(messagesData);
      setBillingData(billingResult);
      
      // Extract payment records
      const paymentMsgs = messagesData.filter(m => m.messageType === 'payment');
      setPayments(paymentMsgs.map(m => ({
        id: m.id,
        referenceId: (m as any).paymentReferenceId || '',
        status: (m as any).paymentStatus || m.status,
        amount: m.content || '',
        phone: m.senderPhone || '',
        timestamp: m.timestamp
      })));
      
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

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => loadData(true), 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSend = async () => {
    if (!selectedContact || !composeMessage.trim()) return;
    setSending(true);
    try {
      const result = await api.sendWhatsAppMessage({
        contactId: selectedContact,
        content: composeMessage,
        phoneNumberId: 'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54'
      });
      if (result) {
        setComposeMessage('');
        setShowCompose(false);
        await loadData();
      }
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessages = async () => {
    if (selectedMessages.length === 0) return;
    if (deleteType === 'hard' && confirmText !== 'DELETE') return;
    
    setDeleting(true);
    try {
      for (const msgId of selectedMessages) {
        const msg = messages.find(m => m.id === msgId);
        if (msg) await api.deleteMessage(msgId, msg.direction);
      }
      setSelectedMessages([]);
      setDeleteType(null);
      setConfirmText('');
      await loadData();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleHardDeleteContact = async () => {
    if (!selectedContact || confirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      await api.hardDeleteContact(selectedContact);
      setSelectedContact('');
      setDeleteType(null);
      setConfirmText('');
      await loadData();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Stats
  const todayMessages = messages.filter(m => {
    const msgDate = new Date(m.timestamp);
    const today = new Date();
    return msgDate.toDateString() === today.toDateString();
  });
  const inboundCount = messages.filter(m => m.direction === 'INBOUND').length;
  const outboundCount = messages.filter(m => m.direction === 'OUTBOUND').length;
  const capturedPayments = payments.filter(p => p.status === 'captured').length;
  const failedPayments = payments.filter(p => p.status === 'failed').length;

  // Filter
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
      <div className="dashboard-unified">
        {/* Alert */}
        {newMessageAlert && (
          <div className="alert-banner success" onClick={() => setNewMessageAlert(false)}>
            <span>◉ New message received</span>
            <button>×</button>
          </div>
        )}

        {/* Header */}
        <header className="dash-header">
          <div className="dash-title">
            <h1>WECARE.DIGITAL</h1>
            <div className="api-status">
              <span className={`dot ${apiConnected ? 'green' : 'red'}`}></span>
              <span>{apiConnected ? `${apiLatency}ms` : 'Offline'}</span>
              <span className="sep">|</span>
              <span>{lastRefresh.toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="dash-actions">
            <button className="btn-icon" onClick={() => loadData()} disabled={loading}>↻</button>
            <button className="btn-primary" onClick={() => setShowCompose(!showCompose)}>+ Send</button>
          </div>
        </header>

        {/* Quick Compose */}
        {showCompose && (
          <div className="compose-panel">
            <select value={selectedContact} onChange={e => setSelectedContact(e.target.value)}>
              <option value="">Select contact...</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>{c.name || c.phone}</option>
              ))}
            </select>
            <textarea
              value={composeMessage}
              onChange={e => setComposeMessage(e.target.value)}
              placeholder="Message..."
              rows={2}
            />
            <div className="compose-actions">
              <button className="btn-secondary" onClick={() => setShowCompose(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSend} disabled={sending || !selectedContact}>
                {sending ? '...' : 'Send WhatsApp'}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <nav className="dash-tabs">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            ◉ Overview
          </button>
          <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>
            ◫ Messages
          </button>
          <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>
            $ Payments
          </button>
          <button className={activeTab === 'data' ? 'active' : ''} onClick={() => setActiveTab('data')}>
            ⊗ Data
          </button>
          <button className={activeTab === 'billing' ? 'active' : ''} onClick={() => setActiveTab('billing')}>
            ≡ Billing
          </button>
        </nav>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            {/* Stats Grid */}
            <div className="stats-row">
              <div className="stat-box">
                <div className="stat-num">{contacts.length}</div>
                <div className="stat-lbl">Contacts</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">{messages.length}</div>
                <div className="stat-lbl">Messages</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">{todayMessages.length}</div>
                <div className="stat-lbl">Today</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">{inboundCount}</div>
                <div className="stat-lbl">Inbound</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">{outboundCount}</div>
                <div className="stat-lbl">Outbound</div>
              </div>
              <div className="stat-box highlight">
                <div className="stat-num">{capturedPayments}</div>
                <div className="stat-lbl">Paid</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="section">
              <h3>Quick Actions</h3>
              <div className="actions-grid">
                <Link href="/dm/whatsapp" className="action-card wa">
                  <span className="icon">◈</span>
                  <span>WhatsApp</span>
                </Link>
                <Link href="/pay" className="action-card pay">
                  <span className="icon">$</span>
                  <span>Payments</span>
                </Link>
                <Link href="/contacts" className="action-card">
                  <span className="icon">⊕</span>
                  <span>Contacts</span>
                </Link>
                <Link href="/bulk" className="action-card">
                  <span className="icon">⫶</span>
                  <span>Bulk Send</span>
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

            {/* Recent Messages */}
            <div className="section">
              <div className="section-head">
                <h3>Recent Messages</h3>
                <Link href="/dm" className="link">View All →</Link>
              </div>
              <div className="msg-list">
                {messages.slice(0, 6).map(msg => {
                  const contact = contacts.find(c => c.id === msg.contactId);
                  return (
                    <div key={msg.id} className={`msg-row ${msg.direction.toLowerCase()}`}>
                      <span className="dir">{msg.direction === 'INBOUND' ? '↓' : '↑'}</span>
                      <span className="name">{contact?.name || contact?.phone || msg.contactId?.slice(0, 8)}</span>
                      <span className="preview">{msg.content?.slice(0, 50) || '[Media]'}</span>
                      <span className="time">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* WhatsApp Numbers */}
            <div className="section">
              <h3>WhatsApp Numbers</h3>
              <div className="phone-row">
                <div className="phone-box">
                  <div className="phone-name">WECARE.DIGITAL</div>
                  <div className="phone-num">+91 93309 94400</div>
                  <span className="badge green">● GREEN</span>
                </div>
                <div className="phone-box">
                  <div className="phone-name">Manish Agarwal</div>
                  <div className="phone-num">+91 99033 00044</div>
                  <span className="badge green">● GREEN</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="tab-content">
            <div className="search-row">
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
                  <div key={msg.id} className={`msg-row ${msg.direction.toLowerCase()}`}>
                    <span className="dir">{msg.direction === 'INBOUND' ? '↓' : '↑'}</span>
                    <span className="name">{contact?.name || contact?.phone || msg.contactId?.slice(0, 8)}</span>
                    <span className="preview">{msg.content?.slice(0, 80) || '[Media]'}</span>
                    <span className="time">{new Date(msg.timestamp).toLocaleString()}</span>
                    <span className="status">{msg.status}</span>
                  </div>
                );
              })}
              {filteredMessages.length === 0 && <div className="empty">No messages found</div>}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="tab-content">
            <div className="section-head">
              <h3>Payment Records</h3>
              <Link href="/pay" className="btn-primary">+ New Payment</Link>
            </div>
            
            <div className="stats-row small">
              <div className="stat-box success">
                <div className="stat-num">{capturedPayments}</div>
                <div className="stat-lbl">Captured</div>
              </div>
              <div className="stat-box error">
                <div className="stat-num">{failedPayments}</div>
                <div className="stat-lbl">Failed</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">{payments.length}</div>
                <div className="stat-lbl">Total</div>
              </div>
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
                {payments.map(p => (
                  <tr key={p.id} className={p.status}>
                    <td>{p.referenceId}</td>
                    <td>{p.phone}</td>
                    <td>{p.amount}</td>
                    <td><span className={`badge ${p.status}`}>{p.status}</span></td>
                    <td>{new Date(p.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={5} className="empty">No payment records yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Data Management Tab */}
        {activeTab === 'data' && (
          <div className="tab-content">
            <h3>Data Management</h3>
            
            <div className="delete-options">
              <button className={deleteType === 'messages' ? 'active' : ''} onClick={() => setDeleteType('messages')}>
                ◫ Delete Messages
              </button>
              <button className={deleteType === 'hard' ? 'active danger' : ''} onClick={() => setDeleteType('hard')}>
                ⊗ Hard Delete Contact
              </button>
            </div>

            {deleteType === 'messages' && (
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
                      <span className="preview">{msg.content?.slice(0, 50) || '[Media]'}</span>
                      <span className="time">{new Date(msg.timestamp).toLocaleDateString()}</span>
                    </label>
                  ))}
                </div>
                
                <div className="delete-actions">
                  <button className="btn-secondary" onClick={() => { setDeleteType(null); setSelectedMessages([]); }}>Cancel</button>
                  <button className="btn-danger" onClick={handleDeleteMessages} disabled={deleting || selectedMessages.length === 0}>
                    {deleting ? '...' : `Delete ${selectedMessages.length} Messages`}
                  </button>
                </div>
              </div>
            )}

            {deleteType === 'hard' && (
              <div className="delete-panel danger">
                <div className="warning-box">
                  ⚠ This will permanently delete the contact, all messages, and media files!
                </div>
                
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
                    <div className="preview-box">
                      <p>Will delete: {contacts.find(c => c.id === selectedContact)?.name || selectedContact}</p>
                      <p>{contactMessages.length} messages, {contactMessages.filter(m => m.s3Key).length} media files</p>
                    </div>
                    <div className="form-row">
                      <label>Type DELETE to confirm:</label>
                      <input type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="DELETE" />
                    </div>
                  </>
                )}
                
                <div className="delete-actions">
                  <button className="btn-secondary" onClick={() => { setDeleteType(null); setSelectedContact(''); setConfirmText(''); }}>Cancel</button>
                  <button className="btn-danger hard" onClick={handleHardDeleteContact} disabled={deleting || confirmText !== 'DELETE'}>
                    {deleting ? '...' : 'Hard Delete'}
                  </button>
                </div>
              </div>
            )}

            {!deleteType && (
              <div className="data-stats">
                <div className="stat-box"><div className="stat-num">{contacts.length}</div><div className="stat-lbl">Contacts</div></div>
                <div className="stat-box"><div className="stat-num">{messages.length}</div><div className="stat-lbl">Messages</div></div>
                <div className="stat-box"><div className="stat-num">{messages.filter(m => m.s3Key).length}</div><div className="stat-lbl">Media</div></div>
              </div>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="tab-content">
            <div className="section-head">
              <h3>AWS Usage & Billing</h3>
              <button className="btn-icon" onClick={() => loadData()}>↻</button>
            </div>
            
            {billingData && (
              <>
                <div className="billing-header">
                  <div className="billing-total">
                    <span className="amount">${billingData.totalCost.toFixed(2)}</span>
                    <span className="label">Estimated Cost</span>
                  </div>
                  <div className="billing-period">{billingData.period}</div>
                </div>

                <table className="data-table billing">
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
                    {billingData.services.map((svc, idx) => (
                      <tr key={idx} className={svc.status}>
                        <td>{svc.service}</td>
                        <td>{svc.usage.toLocaleString()} <small>{svc.unit}</small></td>
                        <td>{svc.freeLimit}</td>
                        <td>${svc.cost.toFixed(4)}</td>
                        <td><span className={`badge ${svc.status}`}>
                          {svc.status === 'free' ? '✓ Free' : svc.status === 'warning' ? '! Near' : '$ Paid'}
                        </span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard-unified { padding: 16px; max-width: 1400px; margin: 0 auto; }
        
        .alert-banner { padding: 10px 16px; background: #dcfce7; color: #166534; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; cursor: pointer; }
        .alert-banner button { background: none; border: none; font-size: 18px; cursor: pointer; }
        
        .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .dash-title h1 { font-size: 20px; margin: 0; font-weight: 600; }
        .api-status { font-size: 12px; color: #666; display: flex; align-items: center; gap: 6px; margin-top: 4px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.green { background: #22c55e; }
        .dot.red { background: #ef4444; }
        .sep { color: #ddd; }
        .dash-actions { display: flex; gap: 8px; }
        .btn-icon { width: 36px; height: 36px; border: 1px solid #ddd; border-radius: 8px; background: #fff; cursor: pointer; font-size: 16px; }
        .btn-icon:hover { background: #f5f5f5; }
        .btn-primary { padding: 8px 16px; background: #25D366; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
        .btn-primary:hover { background: #1da851; }
        .btn-primary:disabled { background: #ccc; }
        .btn-secondary { padding: 8px 16px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; }
        .btn-danger { padding: 8px 16px; background: #ef4444; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
        .btn-danger.hard { background: #991b1b; }
        .btn-danger:disabled { background: #fca5a5; }
        
        .compose-panel { background: #f9f9f9; padding: 16px; border-radius: 12px; margin-bottom: 16px; }
        .compose-panel select, .compose-panel textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 8px; font-size: 14px; }
        .compose-actions { display: flex; gap: 8px; justify-content: flex-end; }
        
        .dash-tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; overflow-x: auto; }
        .dash-tabs button { padding: 8px 16px; border: none; background: none; cursor: pointer; font-size: 14px; color: #666; border-radius: 8px 8px 0 0; white-space: nowrap; }
        .dash-tabs button:hover { background: #f5f5f5; }
        .dash-tabs button.active { background: #25D366; color: #fff; }
        
        .tab-content { animation: fadeIn 0.2s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 12px; margin-bottom: 20px; }
        .stats-row.small { grid-template-columns: repeat(3, 1fr); max-width: 400px; }
        .stat-box { background: #fff; padding: 16px; border-radius: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .stat-box.highlight { background: #dcfce7; }
        .stat-box.success { background: #dcfce7; }
        .stat-box.error { background: #fee2e2; }
        .stat-num { font-size: 24px; font-weight: 600; }
        .stat-lbl { font-size: 12px; color: #666; margin-top: 4px; }
        
        .section { margin-bottom: 24px; }
        .section h3 { font-size: 16px; margin: 0 0 12px 0; }
        .section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .section-head h3 { margin: 0; }
        .link { color: #25D366; text-decoration: none; font-size: 14px; }
        
        .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; }
        .action-card { display: flex; flex-direction: column; align-items: center; padding: 20px 16px; background: #fff; border-radius: 12px; text-decoration: none; color: #333; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s; }
        .action-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .action-card .icon { font-size: 24px; margin-bottom: 8px; }
        .action-card.wa { border-left: 3px solid #25D366; }
        .action-card.pay { border-left: 3px solid #f59e0b; }
        
        .msg-list { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .msg-list.full { max-height: 500px; overflow-y: auto; }
        .msg-row { display: grid; grid-template-columns: 24px 120px 1fr 60px; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #f0f0f0; align-items: center; font-size: 14px; }
        .msg-row:last-child { border-bottom: none; }
        .msg-row.inbound { background: #f9fafb; }
        .msg-row .dir { font-weight: 600; }
        .msg-row.inbound .dir { color: #3b82f6; }
        .msg-row.outbound .dir { color: #22c55e; }
        .msg-row .name { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .msg-row .preview { color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .msg-row .time { color: #999; font-size: 12px; }
        .msg-row .status { font-size: 11px; color: #999; }
        
        .phone-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
        .phone-box { background: #fff; padding: 16px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .phone-name { font-weight: 500; margin-bottom: 4px; }
        .phone-num { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
        .badge { font-size: 11px; padding: 2px 8px; border-radius: 12px; }
        .badge.green { background: #dcfce7; color: #166534; }
        .badge.captured { background: #dcfce7; color: #166534; }
        .badge.failed { background: #fee2e2; color: #991b1b; }
        .badge.free { background: #dcfce7; color: #166534; }
        .badge.warning { background: #fef3c7; color: #92400e; }
        .badge.paid { background: #fee2e2; color: #991b1b; }
        
        .search-row { display: flex; gap: 8px; margin-bottom: 16px; }
        .search-row input { flex: 1; padding: 10px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
        .search-row button { padding: 10px 16px; border: 1px solid #ddd; border-radius: 8px; background: #fff; cursor: pointer; }
        
        .data-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .data-table th, .data-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
        .data-table th { background: #f9fafb; font-weight: 500; color: #666; }
        .data-table td small { color: #999; }
        .data-table .empty { text-align: center; color: #999; padding: 32px; }
        
        .delete-options { display: flex; gap: 12px; margin-bottom: 16px; }
        .delete-options button { padding: 12px 20px; border: 2px solid #ddd; border-radius: 8px; background: #fff; cursor: pointer; font-size: 14px; }
        .delete-options button:hover { border-color: #999; }
        .delete-options button.active { border-color: #25D366; background: #f0fdf4; }
        .delete-options button.danger { border-color: #ef4444; background: #fef2f2; }
        
        .delete-panel { background: #f9f9f9; padding: 20px; border-radius: 12px; }
        .delete-panel.danger { background: #fef2f2; border: 1px solid #fecaca; }
        .warning-box { background: #fef3c7; color: #92400e; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
        .preview-box { background: #fff; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
        .preview-box p { margin: 4px 0; font-size: 14px; }
        .form-row { margin-bottom: 12px; }
        .form-row label { display: block; font-size: 13px; color: #666; margin-bottom: 4px; }
        .form-row select, .form-row input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
        .delete-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
        
        .msg-select-list { background: #fff; border-radius: 8px; max-height: 300px; overflow-y: auto; margin-bottom: 16px; }
        .select-header { display: flex; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #eee; }
        .select-header button { background: none; border: none; color: #25D366; cursor: pointer; }
        .msg-select-row { display: grid; grid-template-columns: 24px 24px 1fr 80px; gap: 12px; padding: 10px 16px; border-bottom: 1px solid #f0f0f0; align-items: center; cursor: pointer; font-size: 14px; }
        .msg-select-row:hover { background: #f9f9f9; }
        
        .data-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 20px; }
        
        .billing-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 20px; background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .billing-total .amount { font-size: 32px; font-weight: 600; }
        .billing-total .label { display: block; font-size: 13px; color: #666; }
        .billing-period { font-size: 14px; color: #666; }
        
        .empty { text-align: center; padding: 32px; color: #999; }
        
        @media (max-width: 768px) {
          .stats-row { grid-template-columns: repeat(3, 1fr); }
          .msg-row { grid-template-columns: 24px 80px 1fr; }
          .msg-row .time { display: none; }
          .actions-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </Layout>
  );
};

export default Dashboard;
