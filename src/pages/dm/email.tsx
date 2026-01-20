/**
 * Email DM Page (SES)
 * WECARE.DIGITAL Admin Platform
 * Full Email messaging interface with AWS SES
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
  subject?: string;
  content: string;
  timestamp: string;
  status: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
}

interface DisplayContact {
  id: string;
  name: string;
  email: string;
  unread: number;
  lastMessage?: string;
  optIn: boolean;
  allowlist: boolean;
}

const EmailDM: React.FC<PageProps> = ({ signOut, user }) => {
  const [selectedContact, setSelectedContact] = useState<DisplayContact | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [contacts, setContacts] = useState<DisplayContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [contactsData, messagesData] = await Promise.all([
        api.listContacts(),
        api.listMessages(undefined, 'EMAIL'),
      ]);

      const displayContacts: DisplayContact[] = contactsData
        .filter(c => c.email)
        .map(c => {
          const contactMessages = messagesData.filter(m => m.contactId === c.contactId);
          const lastMsg = contactMessages[0];
          return {
            id: c.contactId,
            name: c.name || c.email || 'Unknown',
            email: c.email || '',
            unread: contactMessages.filter(m => m.direction === 'INBOUND' && m.status === 'received').length,
            lastMessage: lastMsg?.content?.substring(0, 50) || '',
            optIn: c.optInEmail,
            allowlist: c.allowlistEmail,
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
          contactName: contact?.name || contact?.email || 'Unknown',
          contactEmail: contact?.email || '',
        };
      });

      setContacts(displayContacts);
      setMessages(displayMessages);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load emails. Please try again.');
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

  const canSend = () => {
    if (!selectedContact) return { allowed: false, reason: 'Select a contact' };
    // All contacts can receive messages - no opt-in/allowlist restrictions
    return { allowed: true, reason: '' };
  };

  const handleSend = async () => {
    if (!selectedContact || sending || !messageText.trim() || !subject.trim()) return;
    const sendCheck = canSend();
    if (!sendCheck.allowed) {
      setError(sendCheck.reason);
      return;
    }

    setSending(true);
    setError(null);

    try {
      const result = await api.sendEmailMessage(selectedContact.id, subject, messageText);
      if (result) {
        setSubject('');
        setMessageText('');
        setShowComposeModal(false);
        await loadData();
      } else {
        setError('Email sending not yet implemented');
      }
    } catch (err) {
      setError('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page dm-page email-page">
        <div className="dm-header">
          <h1 className="page-title">📧 Email (SES)</h1>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setShowComposeModal(true)} disabled={!canSend().allowed}>
              ✉️ Compose
            </button>
            <button className="btn-secondary" onClick={loadData} disabled={loading}>
              🔄 {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && <div className="error-banner">{error} <button onClick={() => setError(null)}>✕</button></div>}

        <div className="dm-layout">
          <div className="dm-sidebar">
            <div className="sidebar-header">
              <h3>Contacts</h3>
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
                    <div className="contact-email">{contact.email}</div>
                    <div className="contact-preview">{contact.lastMessage || 'No emails'}</div>
                  </div>
                  <div className="contact-status">
                    {!contact.optIn && <span className="status-dot red" title="Not opted in">⚠️</span>}
                  </div>
                </div>
              ))}
              {contacts.length === 0 && <div className="empty-sidebar">No email contacts</div>}
            </div>
          </div>

          <div className="dm-main email-main">
            {selectedContact ? (
              <>
                <div className="conversation-header">
                  <div className="conv-contact">
                    <div className="contact-avatar large">{(selectedContact.name || '?').charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="conv-name">{selectedContact.name}</div>
                      <div className="conv-email">{selectedContact.email}</div>
                    </div>
                  </div>
                  <div className="conv-status">
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
                    <div className="block-reason-title">⚠️ Cannot Send Email</div>
                    <div>{canSend().reason}</div>
                  </div>
                )}

                <div className="email-list">
                  {filteredMessages.length > 0 ? filteredMessages.map(msg => (
                    <div key={msg.id} className={`email-item ${msg.direction}`}>
                      <div className="email-header">
                        <div className="email-from">
                          {msg.direction === 'inbound' ? `From: ${msg.contactEmail}` : 'To: ' + msg.contactEmail}
                        </div>
                        <div className="email-time">{new Date(msg.timestamp).toLocaleString()}</div>
                      </div>
                      {msg.subject && <div className="email-subject">{msg.subject}</div>}
                      <div className="email-body">{msg.content}</div>
                      <div className="email-footer">
                        <span className={`email-status ${msg.status}`}>
                          {msg.status === 'delivered' ? '✓ Delivered' : msg.status === 'opened' ? '👁 Opened' : '✓ Sent'}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="empty-messages">No emails with this contact</div>
                  )}
                </div>

                <div className="email-actions">
                  <button className="btn-primary" onClick={() => setShowComposeModal(true)} disabled={!canSend().allowed}>
                    ✉️ Compose New Email
                  </button>
                </div>
              </>
            ) : (
              <div className="no-contact-selected">
                <div className="empty-state">
                  <p>📧 Select a contact</p>
                  <p className="help-text">Choose a contact from the list to view email history</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {showComposeModal && selectedContact && (
          <div className="modal-overlay" onClick={() => setShowComposeModal(false)}>
            <div className="modal modal-large" onClick={e => e.stopPropagation()}>
              <h2>Compose Email</h2>
              <div className="compose-email-form">
                <div className="form-group">
                  <label>To</label>
                  <input type="text" value={`${selectedContact.name} <${selectedContact.email}>`} disabled />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Enter email subject..."
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder="Write your email message..."
                    rows={10}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setShowComposeModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSend} disabled={sending || !subject.trim() || !messageText.trim()}>
                  {sending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EmailDM;
