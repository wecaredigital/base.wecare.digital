/**
 * WhatsApp Unified Inbox
 * Single inbox showing messages from all WABAs
 * Select WABA when sending messages
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../../../components/Layout';
import RichTextEditor from '../../../components/RichTextEditor';
import * as api from '../../../lib/api';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: string;
  status: string;
  contactId: string;
  whatsappMessageId?: string;
  mediaUrl?: string;
  receivingPhone?: string;
  awsPhoneNumberId?: string;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage?: string;
  lastMessageTime?: string;
  lastWabaId?: string;
  unread: number;
}

const WABA_CONFIG = {
  'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54': {
    name: 'WECARE.DIGITAL',
    phone: '+91 93309 94400',
    color: '#25D366',
    shortName: 'WC'
  },
  'phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06': {
    name: 'Manish Agarwal',
    phone: '+91 99033 00044',
    color: '#128C7E',
    shortName: 'MA'
  },
};

const WhatsAppUnifiedInbox: React.FC<PageProps> = ({ signOut, user }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedWaba, setSelectedWaba] = useState<string>('phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedContact]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [contactsData, messagesData] = await Promise.all([
        api.listContacts(),
        api.listMessages(undefined, 'WHATSAPP'),
      ]);

      // Process messages to get last message info per contact
      const contactMsgMap = new Map<string, { lastMsg: any; lastWabaId: string; unread: number }>();
      
      messagesData.forEach(m => {
        const existing = contactMsgMap.get(m.contactId);
        const msgTime = new Date(m.timestamp).getTime();
        
        if (!existing || msgTime > new Date(existing.lastMsg.timestamp).getTime()) {
          contactMsgMap.set(m.contactId, {
            lastMsg: m,
            lastWabaId: m.awsPhoneNumberId || '',
            unread: (existing?.unread || 0) + (m.direction === 'INBOUND' && m.status === 'received' ? 1 : 0)
          });
        }
      });

      const displayContacts: Contact[] = contactsData
        .filter(c => c.phone)
        .map(c => {
          const msgInfo = contactMsgMap.get(c.contactId);
          return {
            id: c.contactId,
            name: c.name || c.phone,
            phone: c.phone,
            lastMessage: msgInfo?.lastMsg?.content?.substring(0, 50) || '',
            lastMessageTime: msgInfo?.lastMsg?.timestamp,
            lastWabaId: msgInfo?.lastWabaId || '',
            unread: msgInfo?.unread || 0,
          };
        })
        .sort((a, b) => {
          if (!a.lastMessageTime) return 1;
          if (!b.lastMessageTime) return -1;
          return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
        });

      setContacts(displayContacts);
      setMessages(messagesData.map(m => ({
        id: m.messageId,
        direction: m.direction.toLowerCase() as 'inbound' | 'outbound',
        content: m.content || '',
        timestamp: m.timestamp,
        status: m.status?.toLowerCase() || 'sent',
        contactId: m.contactId,
        whatsappMessageId: m.whatsappMessageId,
        mediaUrl: m.s3Key ? `https://auth.wecare.digital/${m.s3Key}` : undefined,
        receivingPhone: m.receivingPhone,
        awsPhoneNumberId: m.awsPhoneNumberId,
      })));

      // Auto-select WABA based on last message
      if (selectedContact) {
        const contact = displayContacts.find(c => c.id === selectedContact.id);
        if (contact?.lastWabaId && WABA_CONFIG[contact.lastWabaId as keyof typeof WABA_CONFIG]) {
          setSelectedWaba(contact.lastWabaId);
        }
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [selectedContact]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  // When selecting a contact, auto-select the WABA they last messaged from
  useEffect(() => {
    if (selectedContact?.lastWabaId && WABA_CONFIG[selectedContact.lastWabaId as keyof typeof WABA_CONFIG]) {
      setSelectedWaba(selectedContact.lastWabaId);
    }
  }, [selectedContact]);

  const filteredMessages = messages
    .filter(m => selectedContact && m.contactId === selectedContact.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const handleSend = async () => {
    if (!selectedContact || !messageText.trim() || sending) return;
    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await api.sendWhatsAppMessage({
        contactId: selectedContact.id,
        content: messageText,
        phoneNumberId: selectedWaba,
      });

      if (result) {
        setSuccess(`Sent via ${WABA_CONFIG[selectedWaba as keyof typeof WABA_CONFIG]?.name || 'WhatsApp'}`);
        setMessageText('');
        await loadData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to send. Check if 24h window is open or use a template.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleReaction = async (whatsappMessageId: string, wabaId?: string) => {
    if (!selectedContact || !whatsappMessageId) return;
    try {
      await api.sendWhatsAppReaction({
        contactId: selectedContact.id,
        reactionMessageId: whatsappMessageId,
        reactionEmoji: '👍',
        phoneNumberId: wabaId || selectedWaba,
      });
    } catch (err) {
      console.error('Reaction failed:', err);
    }
  };

  const getWabaInfo = (wabaId?: string) => {
    if (!wabaId) return null;
    return WABA_CONFIG[wabaId as keyof typeof WABA_CONFIG];
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 86400000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 604800000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="whatsapp-inbox">
        <style jsx>{`
          .whatsapp-inbox {
            display: flex;
            height: calc(100vh - 60px);
            background: #111b21;
          }
          
          /* Contacts Sidebar */
          .contacts-sidebar {
            width: 350px;
            border-right: 1px solid #2a3942;
            display: flex;
            flex-direction: column;
            background: #111b21;
          }
          
          .sidebar-header {
            padding: 16px;
            background: #202c33;
            border-bottom: 1px solid #2a3942;
          }
          
          .sidebar-header h2 {
            color: #e9edef;
            font-size: 20px;
            margin: 0 0 12px 0;
          }
          
          .search-box {
            display: flex;
            align-items: center;
            background: #2a3942;
            border-radius: 8px;
            padding: 8px 12px;
          }
          
          .search-box input {
            flex: 1;
            background: transparent;
            border: none;
            color: #e9edef;
            font-size: 14px;
            outline: none;
          }
          
          .search-box input::placeholder {
            color: #8696a0;
          }
          
          .contacts-list {
            flex: 1;
            overflow-y: auto;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            cursor: pointer;
            border-bottom: 1px solid #2a3942;
            transition: background 0.2s;
          }
          
          .contact-item:hover {
            background: #202c33;
          }
          
          .contact-item.selected {
            background: #2a3942;
          }
          
          .contact-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #00a884;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 18px;
            margin-right: 12px;
            flex-shrink: 0;
          }
          
          .contact-info {
            flex: 1;
            min-width: 0;
          }
          
          .contact-name {
            color: #e9edef;
            font-size: 16px;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .contact-last-msg {
            color: #8696a0;
            font-size: 13px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          
          .contact-meta {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
          }
          
          .contact-time {
            color: #8696a0;
            font-size: 12px;
          }
          
          .unread-badge {
            background: #00a884;
            color: white;
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 10px;
            font-weight: 600;
          }
          
          .waba-indicator {
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 4px;
            color: white;
            font-weight: 600;
          }
          
          /* Chat Area */
          .chat-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: #0b141a;
          }
          
          .chat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: #202c33;
            border-bottom: 1px solid #2a3942;
          }
          
          .chat-contact-info {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .chat-contact-name {
            color: #e9edef;
            font-size: 16px;
            font-weight: 500;
          }
          
          .chat-contact-phone {
            color: #8696a0;
            font-size: 13px;
          }
          
          .waba-selector {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .waba-selector label {
            color: #8696a0;
            font-size: 13px;
          }
          
          .waba-selector select {
            background: #2a3942;
            border: 1px solid #3b4a54;
            border-radius: 6px;
            color: #e9edef;
            padding: 8px 12px;
            font-size: 13px;
            cursor: pointer;
          }
          
          .messages-area {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          
          .message-bubble {
            max-width: 65%;
            padding: 8px 12px;
            border-radius: 8px;
            position: relative;
          }
          
          .message-bubble.inbound {
            align-self: flex-start;
            background: #202c33;
            border-top-left-radius: 0;
          }
          
          .message-bubble.outbound {
            align-self: flex-end;
            background: #005c4b;
            border-top-right-radius: 0;
          }
          
          .message-content {
            color: #e9edef;
            font-size: 14px;
            line-height: 1.4;
            word-wrap: break-word;
          }
          
          .message-footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 6px;
            margin-top: 4px;
          }
          
          .message-time {
            color: rgba(255,255,255,0.6);
            font-size: 11px;
          }
          
          .message-status {
            font-size: 14px;
          }
          
          .message-waba-tag {
            font-size: 9px;
            padding: 1px 4px;
            border-radius: 3px;
            color: white;
            font-weight: 600;
          }
          
          .message-media {
            max-width: 250px;
            border-radius: 6px;
            margin-bottom: 4px;
          }
          
          .message-actions {
            position: absolute;
            right: -30px;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0;
            transition: opacity 0.2s;
          }
          
          .message-bubble:hover .message-actions {
            opacity: 1;
          }
          
          .reaction-btn {
            background: #2a3942;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            cursor: pointer;
            font-size: 12px;
          }
          
          /* Input Area */
          .input-area {
            padding: 12px 16px;
            background: #202c33;
            border-top: 1px solid #2a3942;
          }
          
          .input-wrapper {
            display: flex;
            align-items: flex-end;
            gap: 12px;
          }
          
          .input-box {
            flex: 1;
          }
          
          .send-btn {
            background: #00a884;
            border: none;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: white;
            font-size: 20px;
            transition: background 0.2s;
          }
          
          .send-btn:hover:not(:disabled) {
            background: #00c49a;
          }
          
          .send-btn:disabled {
            background: #3b4a54;
            cursor: not-allowed;
          }
          
          /* Empty State */
          .empty-chat {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #8696a0;
          }
          
          .empty-chat-icon {
            font-size: 80px;
            margin-bottom: 20px;
            opacity: 0.5;
          }
          
          .empty-chat h3 {
            color: #e9edef;
            margin: 0 0 8px 0;
          }
          
          /* Alerts */
          .alert {
            padding: 12px 16px;
            border-radius: 8px;
            margin: 8px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .alert-error {
            background: rgba(220, 53, 69, 0.2);
            color: #ff6b6b;
            border: 1px solid rgba(220, 53, 69, 0.3);
          }
          
          .alert-success {
            background: rgba(0, 168, 132, 0.2);
            color: #00c49a;
            border: 1px solid rgba(0, 168, 132, 0.3);
          }
          
          .alert button {
            background: transparent;
            border: none;
            color: inherit;
            cursor: pointer;
            font-size: 16px;
          }
          
          .date-divider {
            text-align: center;
            margin: 16px 0;
          }
          
          .date-divider span {
            background: #182229;
            color: #8696a0;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 12px;
          }
        `}</style>

        {/* Contacts Sidebar */}
        <div className="contacts-sidebar">
          <div className="sidebar-header">
            <h2>WhatsApp Inbox</h2>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="contacts-list">
            {filteredContacts.map(contact => {
              const wabaInfo = getWabaInfo(contact.lastWabaId);
              return (
                <div
                  key={contact.id}
                  className={`contact-item ${selectedContact?.id === contact.id ? 'selected' : ''}`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="contact-avatar">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="contact-info">
                    <div className="contact-name">{contact.name}</div>
                    <div className="contact-last-msg">
                      {wabaInfo && (
                        <span 
                          className="waba-indicator" 
                          style={{ background: wabaInfo.color }}
                        >
                          {wabaInfo.shortName}
                        </span>
                      )}
                      {contact.lastMessage || 'No messages'}
                    </div>
                  </div>
                  <div className="contact-meta">
                    {contact.lastMessageTime && (
                      <span className="contact-time">{formatTime(contact.lastMessageTime)}</span>
                    )}
                    {contact.unread > 0 && (
                      <span className="unread-badge">{contact.unread}</span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {filteredContacts.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#8696a0' }}>
                {searchQuery ? 'No contacts found' : 'No WhatsApp conversations yet'}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-contact-info">
                  <div className="contact-avatar" style={{ width: 40, height: 40, fontSize: 16 }}>
                    {selectedContact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="chat-contact-name">{selectedContact.name}</div>
                    <div className="chat-contact-phone">{selectedContact.phone}</div>
                  </div>
                </div>
                
                <div className="waba-selector">
                  <label>Send from:</label>
                  <select 
                    value={selectedWaba} 
                    onChange={(e) => setSelectedWaba(e.target.value)}
                  >
                    {Object.entries(WABA_CONFIG).map(([id, config]) => (
                      <option key={id} value={id}>
                        {config.name} ({config.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Alerts */}
              {error && (
                <div className="alert alert-error">
                  <span>{error}</span>
                  <button onClick={() => setError(null)}>✕</button>
                </div>
              )}
              {success && (
                <div className="alert alert-success">
                  <span>{success}</span>
                  <button onClick={() => setSuccess(null)}>✕</button>
                </div>
              )}

              {/* Messages */}
              <div className="messages-area">
                {loading && filteredMessages.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#8696a0', padding: '20px' }}>
                    Loading messages...
                  </div>
                )}
                
                {filteredMessages.map((msg, idx) => {
                  const wabaInfo = getWabaInfo(msg.awsPhoneNumberId);
                  const showDate = idx === 0 || 
                    new Date(msg.timestamp).toDateString() !== 
                    new Date(filteredMessages[idx - 1].timestamp).toDateString();
                  
                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="date-divider">
                          <span>{new Date(msg.timestamp).toLocaleDateString([], { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                      )}
                      <div className={`message-bubble ${msg.direction}`}>
                        {msg.mediaUrl && (
                          <img src={msg.mediaUrl} alt="Media" className="message-media" />
                        )}
                        <div className="message-content">{msg.content}</div>
                        <div className="message-footer">
                          {wabaInfo && (
                            <span 
                              className="message-waba-tag" 
                              style={{ background: wabaInfo.color }}
                            >
                              {wabaInfo.shortName}
                            </span>
                          )}
                          <span className="message-time">
                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {msg.direction === 'outbound' && (
                            <span className="message-status">
                              {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                        {msg.direction === 'inbound' && msg.whatsappMessageId && (
                          <div className="message-actions">
                            <button 
                              className="reaction-btn"
                              onClick={() => handleReaction(msg.whatsappMessageId!, msg.awsPhoneNumberId)}
                              title="React with 👍"
                            >
                              👍
                            </button>
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="input-area">
                <div className="input-wrapper">
                  <div className="input-box">
                    <RichTextEditor
                      value={messageText}
                      onChange={setMessageText}
                      placeholder="Type a message..."
                      channel="whatsapp"
                      onSend={handleSend}
                      showAISuggestions={true}
                    />
                  </div>
                  <button 
                    className="send-btn"
                    onClick={handleSend}
                    disabled={!messageText.trim() || sending}
                  >
                    {sending ? '...' : '➤'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-chat">
              <div className="empty-chat-icon">💬</div>
              <h3>WhatsApp Unified Inbox</h3>
              <p>Select a contact to view messages</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>
                Messages from both WABAs appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WhatsAppUnifiedInbox;
