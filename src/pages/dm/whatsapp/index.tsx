/**
 * WhatsApp Unified Inbox
 * Single inbox showing messages from all WABAs
 * Select WABA when sending messages
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../../../components/Layout';
import RichTextEditor from '../../../components/RichTextEditor';
import Toast, { useToast } from '../../../components/Toast';
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
  whatsappMessageId?: string | null;
  mediaUrl?: string | null;
  receivingPhone?: string | null;
  awsPhoneNumberId?: string | null;
  senderName?: string | null;
  senderPhone?: string | null;
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
  const [selectedWaba, setSelectedWaba] = useState<string>('phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

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
        mediaUrl: m.mediaUrl,  // Use pre-signed URL from API
        receivingPhone: m.receivingPhone,
        awsPhoneNumberId: m.awsPhoneNumberId,
        senderName: m.senderName,  // Sender's WhatsApp profile name
        senderPhone: m.senderPhone,  // Sender's phone number
      })));

      // Auto-select WABA based on last message
      if (selectedContact) {
        const contact = displayContacts.find(c => c.id === selectedContact.id);
        if (contact?.lastWabaId && WABA_CONFIG[contact.lastWabaId as keyof typeof WABA_CONFIG]) {
          setSelectedWaba(contact.lastWabaId);
        }
      }
    } catch (err) {
      toast.error('Failed to load data');
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
    if (!selectedContact || (!messageText.trim() && !mediaFile) || sending) return;
    setSending(true);

    try {
      let mediaBase64 = undefined;
      let mediaFileName = undefined;
      
      // Convert media file to base64 if present
      if (mediaFile) {
        mediaFileName = mediaFile.name; // Capture real filename
        mediaBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Extract base64 part (remove data:image/jpeg;base64, prefix)
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(mediaFile);
        });
      }

      const result = await api.sendWhatsAppMessage({
        contactId: selectedContact.id,
        content: messageText,
        phoneNumberId: selectedWaba,
        mediaFile: mediaBase64,
        mediaType: mediaFile?.type,
        mediaFileName: mediaFileName, // Pass real filename
      });

      if (result) {
        toast.success(`Sent via ${WABA_CONFIG[selectedWaba as keyof typeof WABA_CONFIG]?.name || 'WhatsApp'}`);
        setMessageText('');
        setMediaFile(null);
        setMediaPreview(null);
        await loadData();
      } else {
        toast.error('Failed to send. Check if 24h window is open or use a template.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size based on type per AWS Social Messaging docs
    let maxSize = 5 * 1024 * 1024; // Default 5MB for images
    
    if (file.type.startsWith('video/')) {
      maxSize = 16 * 1024 * 1024; // 16MB for video
    } else if (file.type.startsWith('audio/')) {
      maxSize = 16 * 1024 * 1024; // 16MB for audio
    } else if (file.type === 'application/pdf' || file.type.startsWith('application/')) {
      maxSize = 100 * 1024 * 1024; // 100MB for documents
    } else if (file.type === 'image/webp') {
      maxSize = 500 * 1024; // 500KB for stickers
    }
    
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      toast.error(`File too large. Max size: ${maxSizeMB.toFixed(0)}MB`);
      return;
    }
    
    setMediaFile(file);
    
    // Create preview for images and videos
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (e) => setMediaPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      // For documents, show filename
      setMediaPreview(file.name);
    }
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReaction = async (whatsappMessageId: string, wabaId?: string | null) => {
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

  const handleDeleteMessage = async (msg: Message) => {
    if (!confirm('Delete this message?')) return;
    setDeleting(msg.id);
    try {
      const direction = msg.direction === 'inbound' ? 'INBOUND' : 'OUTBOUND';
      const success = await api.deleteMessage(msg.id, direction);
      if (success) {
        toast.success('Message deleted');
        await loadData();
      } else {
        toast.error('Failed to delete message');
      }
    } catch (err) {
      toast.error('Delete error occurred');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteContact = async (contact: Contact) => {
    if (!confirm(`Delete contact "${contact.name}"? This will also remove all messages.`)) return;
    setDeleting(contact.id);
    try {
      const success = await api.deleteContact(contact.id);
      if (success) {
        toast.success('Contact deleted');
        setSelectedContact(null);
        await loadData();
      } else {
        toast.error('Failed to delete contact');
      }
    } catch (err) {
      toast.error('Delete error occurred');
    } finally {
      setDeleting(null);
    }
  };

  const getWabaInfo = (wabaId?: string | null) => {
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
      <Toast toasts={toast.toasts} onRemove={toast.removeToast} />
      <div className="whatsapp-inbox">
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
                    <button 
                      className="contact-delete-btn"
                      onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact); }}
                      disabled={deleting === contact.id}
                      title="Delete contact"
                    >
                      {deleting === contact.id ? '...' : '✕'}
                    </button>
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
                        {msg.direction === 'inbound' && msg.senderName && (
                          <div className="message-sender-name">
                            {msg.senderName}
                          </div>
                        )}
                        {msg.mediaUrl && (
                          <div className="message-media-container">
                            {msg.content && msg.content.toLowerCase().includes('image') || msg.content && msg.content.toLowerCase().includes('.jpg') || msg.content && msg.content.toLowerCase().includes('.png') ? (
                              <img 
                                src={msg.mediaUrl} 
                                alt="Image" 
                                className="message-media message-image"
                                onError={(e) => {
                                  console.error('Image load error:', msg.mediaUrl);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : msg.content && msg.content.toLowerCase().includes('video') || msg.content && msg.content.toLowerCase().includes('.mp4') ? (
                              <video 
                                src={msg.mediaUrl} 
                                controls 
                                className="message-media message-video"
                                onError={(e) => {
                                  console.error('Video load error:', msg.mediaUrl);
                                  (e.target as HTMLVideoElement).style.display = 'none';
                                }}
                              />
                            ) : msg.content && msg.content.toLowerCase().includes('audio') || msg.content && msg.content.toLowerCase().includes('.mp3') || msg.content && msg.content.toLowerCase().includes('.ogg') ? (
                              <audio 
                                src={msg.mediaUrl} 
                                controls 
                                className="message-media message-audio"
                                onError={(e) => {
                                  console.error('Audio load error:', msg.mediaUrl);
                                  (e.target as HTMLAudioElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="message-media message-document">
                                <a 
                                  href={msg.mediaUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="document-link"
                                >
                                  📄 Download Document
                                </a>
                              </div>
                            )}
                          </div>
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
                          {msg.mediaUrl && (
                            <a 
                              href={msg.mediaUrl} 
                              download 
                              className="media-download-btn"
                              title="Download media"
                            >
                              ⬇️
                            </a>
                          )}
                        </div>
                        {msg.direction === 'inbound' && msg.whatsappMessageId && (
                          <div className="message-actions">
                            <button 
                              className="reaction-btn"
                              onClick={() => handleReaction(msg.whatsappMessageId!, msg.awsPhoneNumberId)}
                              title="React with thumbs up"
                            >
                              +
                            </button>
                            <button 
                              className="delete-msg-btn"
                              onClick={() => handleDeleteMessage(msg)}
                              disabled={deleting === msg.id}
                              title="Delete message"
                            >
                              {deleting === msg.id ? '...' : '✕'}
                            </button>
                          </div>
                        )}
                        {msg.direction === 'outbound' && (
                          <div className="message-actions">
                            <button 
                              className="delete-msg-btn"
                              onClick={() => handleDeleteMessage(msg)}
                              disabled={deleting === msg.id}
                              title="Delete message"
                            >
                              {deleting === msg.id ? '...' : '✕'}
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
                {/* Media Preview */}
                {mediaPreview && (
                  <div className="media-preview">
                    {mediaFile?.type.startsWith('image/') ? (
                      <img src={mediaPreview} alt="Preview" />
                    ) : (
                      <div className="file-preview">
                        <span>📎</span>
                        <span>{mediaFile?.name}</span>
                      </div>
                    )}
                    <button className="clear-media-btn" onClick={clearMedia}>✕</button>
                  </div>
                )}
                
                <div className="input-wrapper">
                  {/* Media Upload Button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleMediaSelect}
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/3gpp,audio/mpeg,audio/mp3,audio/ogg,audio/aac,audio/amr,audio/mp4,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
                    style={{ display: 'none' }}
                  />
                  <button 
                    className="attach-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingMedia}
                    title="Attach media"
                  >
                    📎
                  </button>
                  
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
                    disabled={(!messageText.trim() && !mediaFile) || sending}
                  >
                    {sending ? '...' : '→'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-chat">
              <div className="empty-chat-icon">✉</div>
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
