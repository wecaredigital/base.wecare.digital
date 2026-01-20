/**
 * WhatsApp DM Page
 * WECARE.DIGITAL Admin Platform
 * Full WhatsApp messaging interface with AWS End User Messaging Social
 */

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import * as api from '../../lib/api';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

interface DisplayMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: string;
  status: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  mediaUrl?: string;
  whatsappMessageId?: string;
}

interface DisplayContact {
  id: string;
  name: string;
  phone: string;
  windowOpen: boolean;
  windowExpiresAt?: string;
  unread: number;
  lastMessage?: string;
  optIn: boolean;
  allowlist: boolean;
}

const PHONE_NUMBERS = [
  { id: 'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54', name: 'WECARE.DIGITAL', number: '+91 93309 94400', qualityRating: 'GREEN' },
  { id: 'phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06', name: 'Manish Agarwal', number: '+91 99033 00044', qualityRating: 'GREEN' }
];

const TEMPLATES = [
  { name: 'hello_world', language: 'en_US', category: 'UTILITY', variables: [] as string[], preview: 'Hello World!' },
  { name: 'order_confirmation', language: 'en_US', category: 'UTILITY', variables: ['Name', 'Order ID', 'Amount'], preview: 'Hi {{1}}, order {{2}} confirmed for ₹{{3}}' },
  { name: 'appointment_reminder', language: 'en_US', category: 'UTILITY', variables: ['Name', 'Date', 'Time'], preview: 'Hi {{1}}, reminder: {{2}} at {{3}}' },
];

const WhatsAppDM: React.FC<PageProps> = ({ signOut, user }) => {
  const [selectedContact, setSelectedContact] = useState<DisplayContact | null>(null);
  const [selectedPhone, setSelectedPhone] = useState(PHONE_NUMBERS[0].id);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [contacts, setContacts] = useState<DisplayContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateVars, setTemplateVars] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [contactsData, messagesData] = await Promise.all([
        api.listContacts(),
        api.listMessages(undefined, 'WHATSAPP'),
      ]);

      const displayContacts: DisplayContact[] = contactsData
        .filter(c => c.phone)
        .map(c => {
          const contactMessages = messagesData.filter(m => m.contactId === c.contactId);
          const lastMsg = contactMessages[0];
          const lastInbound = c.lastInboundMessageAt ? new Date(c.lastInboundMessageAt).getTime() : 0;
          const windowEnd = lastInbound + 24 * 60 * 60 * 1000;
          const windowOpen = Date.now() < windowEnd;

          return {
            id: c.contactId,
            name: c.name || c.phone,
            phone: c.phone,
            windowOpen,
            windowExpiresAt: windowOpen ? new Date(windowEnd).toISOString() : undefined,
            unread: contactMessages.filter(m => m.direction === 'INBOUND' && m.status === 'received').length,
            lastMessage: lastMsg?.content?.substring(0, 50) || '',
            optIn: c.optInWhatsApp,
            allowlist: c.allowlistWhatsApp,
          };
        });

      const displayMessages: DisplayMessage[] = messagesData.map(m => {
        const contact = contactsData.find(c => c.contactId === m.contactId);
        return {
          id: m.messageId,
          direction: m.direction.toLowerCase() as 'inbound' | 'outbound',
          content: m.content || '',
          timestamp: m.timestamp,
          status: m.status?.toLowerCase() || 'sent',
          contactId: m.contactId,
          contactName: contact?.name || contact?.phone || 'Unknown',
          contactPhone: contact?.phone || '',
          mediaUrl: m.s3Key ? `https://auth.wecare.digital/${m.s3Key}` : undefined,
          whatsappMessageId: m.whatsappMessageId,
        };
      });

      setContacts(displayContacts);
      setMessages(displayMessages);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const filteredMessages = messages.filter(m => selectedContact && m.contactId === selectedContact.id);

  const getWindowTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) return null;
    return `${Math.floor(remaining / (1000 * 60 * 60))}h ${Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))}m`;
  };

  const canSend = () => {
    if (!selectedContact) return { allowed: false, reason: 'Select a contact' };
    if (!selectedContact.optIn) return { allowed: false, reason: 'Contact has not opted in to WhatsApp' };
    if (!selectedContact.allowlist) return { allowed: false, reason: 'Contact is not allowlisted' };
    if (!selectedContact.windowOpen && !selectedTemplate) return { allowed: false, reason: '24h window closed - use template' };
    return { allowed: true, reason: '' };
  };

  const handleSend = async () => {
    if (!selectedContact || sending) return;
    const sendCheck = canSend();
    if (!sendCheck.allowed) {
      setError(sendCheck.reason);
      return;
    }

    setSending(true);
    setError(null);

    try {
      const result = await api.sendWhatsAppMessage({
        contactId: selectedContact.id,
        content: messageText,
        phoneNumberId: selectedPhone,
        isTemplate: !!selectedTemplate,
        templateName: selectedTemplate || undefined,
        templateParams: templateVars.length > 0 ? templateVars : undefined,
      });

      if (result) {
        setMessageText('');
        setSelectedTemplate('');
        setTemplateVars([]);
        await loadData();
      } else {
        setError('Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page dm-page">
        <div className="dm-header">
          <h1 className="page-title">💬 WhatsApp</h1>
          <div className="header-actions">
            <button className="btn-secondary" onClick={loadData} disabled={loading}>
              🔄 {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && <div className="error-banner">{error} <button onClick={() => setError(null)}>✕</button></div>}

        <div className="phone-selector-bar">
          <label>Send from:</label>
          <select value={selectedPhone} onChange={e => setSelectedPhone(e.target.value)}>
            {PHONE_NUMBERS.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.number}) - {p.qualityRating}</option>
            ))}
          </select>
        </div>

        <div className="dm-layout">
          <div className="dm-sidebar">
            <div className="sidebar-header">
              <h3>Conversations</h3>
              <span className="count">{contacts.length}</span>
            </div>
            <div className="contacts-list">
              {contacts.map(contact => (
                <div
                  key={contact.id}
                  className={`contact-item ${selectedContact?.id === contact.id ? 'active' : ''}`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="contact-avatar">{(contact.name || '?').charAt(0).toUpperCase()}</div>
                  <div className="contact-info">
                    <div className="contact-name">
                      {contact.name}
                      {contact.unread > 0 && <span className="unread-badge">{contact.unread}</span>}
                    </div>
                    <div className="contact-phone">{contact.phone}</div>
                    <div className="contact-preview">{contact.lastMessage || 'No messages'}</div>
                  </div>
                  <div className="contact-status">
                    {contact.windowOpen && <span className="window-dot" title="24h window open">🟢</span>}
                    {!contact.optIn && <span className="status-dot red" title="Not opted in">⚠️</span>}
                  </div>
                </div>
              ))}
              {contacts.length === 0 && <div className="empty-sidebar">No WhatsApp contacts</div>}
            </div>
          </div>

          <div className="dm-main">
            {selectedContact ? (
              <>
                <div className="conversation-header">
                  <div className="conv-contact">
                    <div className="contact-avatar large">{(selectedContact.name || '?').charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="conv-name">{selectedContact.name}</div>
                      <div className="conv-phone">{selectedContact.phone}</div>
                    </div>
                  </div>
                  <div className="conv-status">
                    <div className={`window-badge ${selectedContact.windowOpen ? 'open' : 'closed'}`}>
                      {selectedContact.windowOpen 
                        ? `🟢 Window: ${getWindowTimeRemaining(selectedContact.windowExpiresAt)}`
                        : '🔴 Window Closed'}
                    </div>
                    <div className="opt-badges">
                      <span className={`badge ${selectedContact.optIn ? 'badge-green' : 'badge-red'}`}>
                        {selectedContact.optIn ? 'Opted In' : 'Not Opted In'}
                      </span>
                      <span className={`badge ${selectedContact.allowlist ? 'badge-green' : 'badge-yellow'}`}>
                        {selectedContact.allowlist ? 'Allowlisted' : 'Not Allowlisted'}
                      </span>
                    </div>
                  </div>
                </div>

                {!canSend().allowed && (
                  <div className="block-reason">
                    <div className="block-reason-title">⚠️ Cannot Send Message</div>
                    <div>{canSend().reason}</div>
                  </div>
                )}

                <div className="messages-list">
                  {filteredMessages.length > 0 ? filteredMessages.map(msg => (
                    <div key={msg.id} className={`message-item ${msg.direction}`}>
                      <div className="message-bubble">
                        {msg.mediaUrl && (
                          <div className="message-media">
                            <img src={msg.mediaUrl} alt="Media" />
                          </div>
                        )}
                        <div className="message-content">{msg.content}</div>
                        <div className="message-meta">
                          <span className="message-time">{new Date(msg.timestamp).toLocaleString()}</span>
                          {msg.direction === 'outbound' && (
                            <span className={`message-status ${msg.status}`}>
                              {msg.status === 'delivered' || msg.status === 'read' ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="empty-messages">No messages with this contact</div>
                  )}
                </div>

                <div className="compose-area">
                  <div className="compose-toolbar">
                    <button onClick={() => setShowTemplateModal(true)} title="Use Template">📋 Template</button>
                    <button title="Attach Media">📎 Media</button>
                    <button title="Send Location">📍 Location</button>
                  </div>
                  {selectedTemplate && (
                    <div className="template-preview-bar">
                      <span>Template: {selectedTemplate}</span>
                      <button onClick={() => { setSelectedTemplate(''); setTemplateVars([]); }}>✕</button>
                    </div>
                  )}
                  <div className="compose-input-row">
                    <textarea
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      placeholder={!selectedContact.windowOpen ? 'Window closed - select a template' : 'Type a message...'}
                      disabled={!canSend().allowed && !selectedTemplate}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    />
                    <button className="btn-send" onClick={handleSend} disabled={!canSend().allowed || sending}>
                      {sending ? '...' : 'Send'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-contact-selected">
                <div className="empty-state">
                  <p>💬 Select a conversation</p>
                  <p className="help-text">Choose a contact from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {showTemplateModal && (
          <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
            <div className="modal modal-large" onClick={e => e.stopPropagation()}>
              <h2>Select Template</h2>
              <div className="templates-grid">
                {TEMPLATES.map(tpl => (
                  <div
                    key={tpl.name}
                    className={`template-card ${selectedTemplate === tpl.name ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedTemplate(tpl.name);
                      setTemplateVars(tpl.variables.map(() => ''));
                    }}
                  >
                    <div className="template-name">{tpl.name}</div>
                    <div className="template-category">{tpl.category}</div>
                    <div className="template-preview">{tpl.preview}</div>
                  </div>
                ))}
              </div>
              {selectedTemplate && TEMPLATES.find(t => t.name === selectedTemplate)?.variables.length! > 0 && (
                <div className="template-vars-form">
                  <h3>Fill Variables</h3>
                  {TEMPLATES.find(t => t.name === selectedTemplate)?.variables.map((v, i) => (
                    <div key={i} className="form-group">
                      <label>{v}</label>
                      <input
                        type="text"
                        value={templateVars[i] || ''}
                        onChange={e => {
                          const nv = [...templateVars];
                          nv[i] = e.target.value;
                          setTemplateVars(nv);
                        }}
                        placeholder={`Enter ${v}`}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setShowTemplateModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={() => setShowTemplateModal(false)} disabled={!selectedTemplate}>
                  Use Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WhatsAppDM;
