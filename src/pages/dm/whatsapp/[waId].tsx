/**
 * WhatsApp Conversation View
 * Full messaging interface for specific WABA
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import RichTextEditor from '../../../components/RichTextEditor';
import * as api from '../../../api/client';

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
  windowOpen: boolean;
  unread: number;
  lastMessage?: string;
}

const WABA_INFO: Record<string, { name: string; phone: string }> = {
  'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54': { name: 'WECARE.DIGITAL', phone: '+91 93309 94400' },
  'phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06': { name: 'Manish Agarwal', phone: '+91 99033 00044' },
};

const WhatsAppConversation: React.FC<PageProps> = ({ signOut, user }) => {
  const router = useRouter();
  const { waId } = router.query;
  const wabaInfo = waId ? WABA_INFO[waId as string] : null;

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadData = useCallback(async () => {
    if (!waId) return;
    setLoading(true);
    try {
      const [contactsData, messagesData] = await Promise.all([
        api.listContacts(),
        api.listMessages(undefined, 'WHATSAPP'),
      ]);

      // Filter messages for this WABA (if awsPhoneNumberId is set)
      const wabaMessages = messagesData.filter(m => 
        !m.awsPhoneNumberId || m.awsPhoneNumberId === waId
      );

      const displayContacts: Contact[] = contactsData
        .filter(c => c.phone)
        .map(c => {
          const contactMsgs = wabaMessages.filter(m => m.contactId === c.contactId);
          const lastMsg = contactMsgs[0];
          const lastInbound = c.lastInboundMessageAt ? new Date(c.lastInboundMessageAt).getTime() : 0;
          const windowEnd = lastInbound + 24 * 60 * 60 * 1000;
          return {
            id: c.contactId,
            name: c.name || c.phone,
            phone: c.phone,
            windowOpen: Date.now() < windowEnd,
            unread: contactMsgs.filter(m => m.direction === 'INBOUND' && m.status === 'received').length,
            lastMessage: lastMsg?.content?.substring(0, 40) || '',
          };
        });

      setContacts(displayContacts);
      setMessages(wabaMessages.map(m => ({
        id: m.messageId,
        direction: m.direction.toLowerCase() as 'inbound' | 'outbound',
        content: m.content || '',
        timestamp: m.timestamp,
        status: m.status?.toLowerCase() || 'sent',
        contactId: m.contactId,
        whatsappMessageId: m.whatsappMessageId,
        mediaUrl: m.s3Key ? `https://auth.wecare.digital/${m.s3Key}` : undefined,
      })));
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [waId]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const filteredMessages = messages.filter(m => selectedContact && m.contactId === selectedContact.id);

  const handleSend = async () => {
    if (!selectedContact || !messageText.trim() || sending) return;
    setSending(true);
    setError(null);

    try {
      const result = await api.sendWhatsAppMessage({
        contactId: selectedContact.id,
        content: messageText,
        phoneNumberId: waId as string,
      });

      if (result) {
        setMessageText('');
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

  const handleReaction = async (whatsappMessageId: string) => {
    if (!selectedContact || !whatsappMessageId) return;
    try {
      await api.sendWhatsAppReaction({
        contactId: selectedContact.id,
        reactionMessageId: whatsappMessageId,
        reactionEmoji: '👍',
        phoneNumberId: waId as string,
      });
    } catch (err) {
      console.error('Reaction failed:', err);
    }
  };

  if (!waId || !wabaInfo) {
    return (
      <Layout user={user} onSignOut={signOut}>
        <div className="page">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="wa-page">
        <div className="wa-header">
          <button onClick={() => router.push('/dm/whatsapp')} className="back-btn">←</button>
          <div className="wa-header-info">
            <span className="wa-icon">💬</span>
            <div>
              <h1>{wabaInfo.name}</h1>
              <span className="wa-phone">{wabaInfo.phone}</span>
            </div>
          </div>
          <button onClick={loadData} className="refresh-btn" disabled={loading}>
            {loading ? '...' : '↻'}
          </button>
        </div>

        {error && <div className="error-bar">{error}</div>}

        <div className="wa-layout">
          {/* Contacts Sidebar */}
          <div className="wa-sidebar">
            <div className="sidebar-search">
              <input type="text" placeholder="Search contacts..." />
            </div>
            <div className="contacts-list">
              {contacts.map(contact => (
                <div
                  key={contact.id}
                  className={`contact-row ${selectedContact?.id === contact.id ? 'active' : ''}`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="contact-avatar">{contact.name.charAt(0).toUpperCase()}</div>
                  <div className="contact-details">
                    <div className="contact-name">
                      {contact.name}
                      {contact.unread > 0 && <span className="unread">{contact.unread}</span>}
                    </div>
                    <div className="contact-preview">{contact.lastMessage || 'No messages'}</div>
                  </div>
                  {contact.windowOpen && <span className="window-indicator">●</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="wa-chat">
            {selectedContact ? (
              <>
                <div className="chat-header">
                  <div className="chat-contact">
                    <div className="contact-avatar large">{selectedContact.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="chat-name">{selectedContact.name}</div>
                      <div className="chat-phone">{selectedContact.phone}</div>
                    </div>
                  </div>
                  <div className={`window-badge ${selectedContact.windowOpen ? 'open' : 'closed'}`}>
                    {selectedContact.windowOpen ? '● 24h Window Open' : '○ Window Closed'}
                  </div>
                </div>

                <div className="messages-area">
                  {filteredMessages.map(msg => (
                    <div key={msg.id} className={`message ${msg.direction}`}>
                      <div className="message-bubble">
                        {msg.mediaUrl && <img src={msg.mediaUrl} alt="Media" className="message-media" />}
                        <div className="message-text">{msg.content}</div>
                        <div className="message-footer">
                          <span className="message-time">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.direction === 'outbound' && (
                            <span className={`message-status ${msg.status}`}>
                              {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                      {msg.direction === 'inbound' && msg.whatsappMessageId && (
                        <button 
                          className="reaction-btn" 
                          onClick={() => handleReaction(msg.whatsappMessageId!)}
                          title="React with 👍"
                        >
                          👍
                        </button>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="compose-area">
                  <RichTextEditor
                    value={messageText}
                    onChange={setMessageText}
                    placeholder="Type a message..."
                    channel="whatsapp"
                    showAISuggestions={true}
                    onSend={handleSend}
                    disabled={sending}
                    contactContext={selectedContact.name}
                  />
                </div>
              </>
            ) : (
              <div className="no-chat">
                <p>💬 Select a conversation</p>
                <small>Choose a contact from the list</small>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .wa-page { height: calc(100vh - 60px); display: flex; flex-direction: column; }
        .wa-header { display: flex; align-items: center; gap: 16px; padding: 12px 20px; background: #25D366; color: #fff; }
        .back-btn, .refresh-btn { background: rgba(255,255,255,0.2); border: none; color: #fff; padding: 8px 12px; border-radius: 8px; cursor: pointer; }
        .wa-header-info { display: flex; align-items: center; gap: 12px; flex: 1; }
        .wa-icon { font-size: 28px; }
        .wa-header h1 { font-size: 18px; font-weight: 500; margin: 0; }
        .wa-phone { font-size: 13px; opacity: 0.9; }
        .error-bar { background: #fee2e2; color: #991b1b; padding: 8px 16px; font-size: 13px; }
        .wa-layout { display: grid; grid-template-columns: 300px 1fr; flex: 1; overflow: hidden; }
        .wa-sidebar { background: #fff; border-right: 1px solid #e5e5e5; display: flex; flex-direction: column; }
        .sidebar-search { padding: 12px; border-bottom: 1px solid #e5e5e5; }
        .sidebar-search input { width: 100%; padding: 10px 14px; border: 1px solid #e5e5e5; border-radius: 20px; font-size: 14px; }
        .contacts-list { flex: 1; overflow-y: auto; }
        .contact-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; border-bottom: 1px solid #f5f5f5; }
        .contact-row:hover { background: #f9f9f9; }
        .contact-row.active { background: #e7f5e7; }
        .contact-avatar { width: 44px; height: 44px; background: #e5e5e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 500; color: #666; }
        .contact-avatar.large { width: 40px; height: 40px; }
        .contact-details { flex: 1; min-width: 0; }
        .contact-name { font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 6px; }
        .contact-preview { font-size: 12px; color: #999; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .unread { background: #25D366; color: #fff; font-size: 11px; padding: 2px 6px; border-radius: 10px; }
        .window-indicator { color: #25D366; font-size: 10px; }
        .wa-chat { display: flex; flex-direction: column; background: #e5ddd5; }
        .chat-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: #f0f0f0; border-bottom: 1px solid #e5e5e5; }
        .chat-contact { display: flex; align-items: center; gap: 12px; }
        .chat-name { font-weight: 500; }
        .chat-phone { font-size: 12px; color: #666; }
        .window-badge { font-size: 12px; padding: 4px 12px; border-radius: 12px; }
        .window-badge.open { background: #dcfce7; color: #166534; }
        .window-badge.closed { background: #fee2e2; color: #991b1b; }
        .messages-area { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
        .message { display: flex; align-items: flex-end; gap: 4px; max-width: 70%; }
        .message.inbound { align-self: flex-start; }
        .message.outbound { align-self: flex-end; flex-direction: row-reverse; }
        .message-bubble { background: #fff; padding: 8px 12px; border-radius: 8px; max-width: 100%; }
        .message.outbound .message-bubble { background: #dcf8c6; }
        .message-media { max-width: 200px; border-radius: 8px; margin-bottom: 8px; }
        .message-text { font-size: 14px; line-height: 1.4; word-wrap: break-word; }
        .message-footer { display: flex; justify-content: flex-end; gap: 4px; margin-top: 4px; }
        .message-time { font-size: 11px; color: #999; }
        .message-status { font-size: 12px; }
        .message-status.read, .message-status.delivered { color: #53bdeb; }
        .reaction-btn { background: none; border: none; cursor: pointer; font-size: 14px; opacity: 0.5; }
        .reaction-btn:hover { opacity: 1; }
        .compose-area { padding: 12px 16px; background: #f0f0f0; }
        .no-chat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; }
        .no-chat p { font-size: 24px; margin: 0; }
        .no-chat small { margin-top: 8px; }
      `}</style>
    </Layout>
  );
};

export default WhatsAppConversation;
