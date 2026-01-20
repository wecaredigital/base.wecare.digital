/**
 * SMS DM Page
 * WECARE.DIGITAL Admin Platform
 * Full SMS messaging interface with AWS Pinpoint
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
}

interface DisplayContact {
  id: string;
  name: string;
  phone: string;
  unread: number;
  lastMessage?: string;
  optIn: boolean;
  allowlist: boolean;
}

const SmsDM: React.FC<PageProps> = ({ signOut, user }) => {
  const [selectedContact, setSelectedContact] = useState<DisplayContact | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [contacts, setContacts] = useState<DisplayContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [contactsData, messagesData] = await Promise.all([
        api.listContacts(),
        api.listMessages(undefined, 'SMS'),
      ]);

      const displayContacts: DisplayContact[] = contactsData
        .filter(c => c.phone)
        .map(c => {
          const contactMessages = messagesData.filter(m => m.contactId === c.contactId);
          const lastMsg = contactMessages[0];
          return {
            id: c.contactId,
            name: c.name || c.phone,
            phone: c.phone,
            unread: contactMessages.filter(m => m.direction === 'INBOUND' && m.status === 'received').length,
            lastMessage: lastMsg?.content?.substring(0, 50) || '',
            optIn: c.optInSms,
            allowlist: c.allowlistSms,
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

  const canSend = () => {
    if (!selectedContact) return { allowed: false, reason: 'Select a contact' };
    if (!selectedContact.optIn) return { allowed: false, reason: 'Contact has not opted in to SMS' };
    if (!selectedContact.allowlist) return { allowed: false, reason: 'Contact is not allowlisted for SMS' };
    return { allowed: true, reason: '' };
  };

  const handleSend = async () => {
    if (!selectedContact || sending || !messageText.trim()) return;
    const sendCheck = canSend();
    if (!sendCheck.allowed) {
      setError(sendCheck.reason);
      return;
    }

    setSending(true);
    setError(null);

    try {
      const result = await api.sendSmsMessage(selectedContact.id, messageText);
      if (result) {
        setMessageText('');
        await loadData();
      } else {
        setError('SMS sending not yet implemented');
      }
    } catch (err) {
      setError('Failed to send SMS');
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page dm-page">
        <div className="dm-header">
          <h1 className="page-title">📱 SMS</h1>
          <div className="header-actions">
            <button className="btn-secondary" onClick={loadData} disabled={loading}>
              🔄 {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && <div className="error-banner">{error} <button onClick={() => setError(null)}>✕</button></div>}

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
                    {!contact.optIn && <span className="status-dot red" title="Not opted in">⚠️</span>}
                  </div>
                </div>
              ))}
              {contacts.length === 0 && <div className="empty-sidebar">No SMS contacts</div>}
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
                    <div className="block-reason-title">⚠️ Cannot Send SMS</div>
                    <div>{canSend().reason}</div>
                  </div>
                )}

                <div className="messages-list">
                  {filteredMessages.length > 0 ? filteredMessages.map(msg => (
                    <div key={msg.id} className={`message-item ${msg.direction}`}>
                      <div className="message-bubble">
                        <div className="message-content">{msg.content}</div>
                        <div className="message-meta">
                          <span className="message-time">{new Date(msg.timestamp).toLocaleString()}</span>
                          {msg.direction === 'outbound' && (
                            <span className={`message-status ${msg.status}`}>
                              {msg.status === 'delivered' ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="empty-messages">No SMS messages with this contact</div>
                  )}
                </div>

                <div className="compose-area">
                  <div className="sms-char-counter">
                    <span>{messageText.length}/160 characters</span>
                    {messageText.length > 160 && <span className="warning"> (will be split into {Math.ceil(messageText.length / 160)} messages)</span>}
                  </div>
                  <div className="compose-input-row">
                    <textarea
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      placeholder="Type an SMS message..."
                      disabled={!canSend().allowed}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    />
                    <button className="btn-send" onClick={handleSend} disabled={!canSend().allowed || sending || !messageText.trim()}>
                      {sending ? '...' : 'Send'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-contact-selected">
                <div className="empty-state">
                  <p>📱 Select a conversation</p>
                  <p className="help-text">Choose a contact from the list to start messaging via SMS</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SmsDM;
