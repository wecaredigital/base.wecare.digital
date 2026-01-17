/**
 * Messaging Page
 * 
 * Requirements:
 * - 5.2, 5.3, 5.4, 5.5: Message compose with channel selection
 * - Media upload for WhatsApp
 * - Message history view
 */

import React, { useState, useEffect } from 'react';
import './Pages.css';

interface Message {
  messageId: string;
  contactId: string;
  contactName?: string;
  channel: 'whatsapp' | 'sms' | 'email';
  direction: 'inbound' | 'outbound';
  content: string;
  status: string;
  timestamp: number;
}

const Messaging: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [selectedContact, setSelectedContact] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      // API call to fetch messages
      setMessages([]);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleSend = async () => {
    if (!selectedContact || !messageContent.trim()) {
      alert('Please select a contact and enter a message');
      return;
    }

    setIsSending(true);
    try {
      // API call to send message
      // const response = await fetch('/api/send-message', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     contactId: selectedContact,
      //     channel: selectedChannel,
      //     content: messageContent,
      //     mediaFile: mediaFile ? await toBase64(mediaFile) : null,
      //   }),
      // });
      
      setMessageContent('');
      setMediaFile(null);
      loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 16MB for WhatsApp)
      if (file.size > 16 * 1024 * 1024) {
        alert('File size must be less than 16MB');
        return;
      }
      setMediaFile(file);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return '💬';
      case 'sms': return '📱';
      case 'email': return '📧';
      default: return '📨';
    }
  };

  const formatTimestamp = (ts: number) => {
    return new Date(ts * 1000).toLocaleString();
  };

  return (
    <div className="page">
      <h1 className="page-title">Messaging</h1>

      {/* Compose Section */}
      <div className="compose-section">
        <h2 className="section-title">Send Message</h2>
        
        <div className="compose-form">
          {/* Channel Selection */}
          <div className="form-group">
            <label>Channel</label>
            <div className="channel-selector">
              <button
                className={`channel-btn ${selectedChannel === 'whatsapp' ? 'active' : ''}`}
                onClick={() => setSelectedChannel('whatsapp')}
              >
                💬 WhatsApp
              </button>
              <button
                className={`channel-btn ${selectedChannel === 'sms' ? 'active' : ''}`}
                onClick={() => setSelectedChannel('sms')}
              >
                📱 SMS
              </button>
              <button
                className={`channel-btn ${selectedChannel === 'email' ? 'active' : ''}`}
                onClick={() => setSelectedChannel('email')}
              >
                📧 Email
              </button>
            </div>
          </div>

          {/* Contact Selection */}
          <div className="form-group">
            <label>Recipient</label>
            <input
              type="text"
              placeholder="Enter contact ID or search..."
              value={selectedContact}
              onChange={(e) => setSelectedContact(e.target.value)}
            />
          </div>

          {/* Message Content */}
          <div className="form-group">
            <label>Message</label>
            <textarea
              placeholder="Type your message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={4}
              maxLength={selectedChannel === 'whatsapp' ? 4096 : selectedChannel === 'sms' ? 1600 : undefined}
            />
            <div className="char-count">
              {messageContent.length} / {selectedChannel === 'whatsapp' ? 4096 : selectedChannel === 'sms' ? 1600 : '∞'}
            </div>
          </div>

          {/* Media Upload (WhatsApp only) */}
          {selectedChannel === 'whatsapp' && (
            <div className="form-group">
              <label>Media Attachment (optional)</label>
              <input
                type="file"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              {mediaFile && (
                <div className="file-preview">
                  <span>{mediaFile.name}</span>
                  <button className="btn-icon" onClick={() => setMediaFile(null)}>❌</button>
                </div>
              )}
            </div>
          )}

          <button
            className="btn-primary btn-send"
            onClick={handleSend}
            disabled={isSending || !selectedContact || !messageContent.trim()}
          >
            {isSending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>

      {/* Message History */}
      <div className="section">
        <h2 className="section-title">Message History</h2>
        
        {isLoading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages yet. Send your first message above.</p>
          </div>
        ) : (
          <div className="message-list">
            {messages.map((msg) => (
              <div key={msg.messageId} className={`message-item ${msg.direction}`}>
                <div className="message-header">
                  <span className="message-channel">{getChannelIcon(msg.channel)}</span>
                  <span className="message-contact">{msg.contactName || msg.contactId}</span>
                  <span className="message-time">{formatTimestamp(msg.timestamp)}</span>
                </div>
                <div className="message-content">{msg.content}</div>
                <div className="message-status">
                  <span className={`status-badge status-${msg.status}`}>{msg.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
