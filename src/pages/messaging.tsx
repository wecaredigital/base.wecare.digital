/**
 * WhatsApp Messaging Page
 * Full-featured messaging with text, media, interactive buttons/lists
 * AWS End User Messaging Social Integration
 */

import React, { useState } from 'react';
import Layout from '../components/Layout';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'template' | 'interactive';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  mediaUrl?: string;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread: number;
  windowOpen: boolean; // 24-hour customer service window
}

const WhatsAppMessaging: React.FC<PageProps> = ({ signOut, user }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'template' | 'interactive'>('text');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showInteractiveModal, setShowInteractiveModal] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState('phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54');

  // Mock contacts - will be replaced with API calls
  const [contacts] = useState<Contact[]>([
    { id: '1', name: 'Test Customer', phone: '+919876543210', lastMessage: 'Hello!', lastMessageTime: '10:30 AM', unread: 2, windowOpen: true },
  ]);

  // Mock messages
  const [messages] = useState<Message[]>([
    { id: '1', direction: 'inbound', type: 'text', content: 'Hello!', timestamp: '10:30 AM', status: 'read' },
    { id: '2', direction: 'outbound', type: 'text', content: 'Hi! How can I help you?', timestamp: '10:31 AM', status: 'delivered' },
  ]);

  // WhatsApp Phone Numbers
  const phoneNumbers = [
    { id: 'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54', name: 'WECARE.DIGITAL', number: '+91 93309 94400' },
    { id: 'phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06', name: 'Manish Agarwal', number: '+91 99033 00044' },
  ];

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedContact) return;
    
    // API call would go here
    console.log('Sending message:', {
      to: selectedContact.phone,
      from: selectedPhone,
      type: messageType,
      content: messageText
    });
    
    setMessageText('');
  };

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page messaging-page">
        <div className="messaging-container">
          {/* Sidebar - Contact List */}
          <div className="contacts-sidebar">
            <div className="sidebar-header">
              <h2>WhatsApp</h2>
              <select 
                value={selectedPhone} 
                onChange={(e) => setSelectedPhone(e.target.value)}
                className="phone-selector"
              >
                {phoneNumbers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <div className="contacts-list">
              {contacts.map(contact => (
                <div 
                  key={contact.id}
                  className={`contact-item ${selectedContact?.id === contact.id ? 'active' : ''}`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="contact-avatar">{contact.name[0]}</div>
                  <div className="contact-info">
                    <div className="contact-name">
                      {contact.name}
                      {contact.windowOpen && <span className="window-badge" title="24h window open">●</span>}
                    </div>
                    <div className="contact-phone">{contact.phone}</div>
                    <div className="contact-preview">{contact.lastMessage}</div>
                  </div>
                  {contact.unread > 0 && <span className="unread-badge">{contact.unread}</span>}
                </div>
              ))}
              
              {contacts.length === 0 && (
                <div className="empty-contacts">
                  <p>No conversations yet</p>
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
                    <div className="contact-avatar">{selectedContact.name[0]}</div>
                    <div>
                      <div className="contact-name">{selectedContact.name}</div>
                      <div className="contact-phone">{selectedContact.phone}</div>
                    </div>
                  </div>
                  <div className="chat-status">
                    {selectedContact.windowOpen ? (
                      <span className="status-badge status-green">24h Window Open</span>
                    ) : (
                      <span className="status-badge status-yellow">Templates Only</span>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="messages-container">
                  {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.direction}`}>
                      <div className="message-bubble">
                        {msg.type === 'image' && msg.mediaUrl && (
                          <img src={msg.mediaUrl} alt="Media" className="message-media" />
                        )}
                        <div className="message-content">{msg.content}</div>
                        <div className="message-meta">
                          <span className="message-time">{msg.timestamp}</span>
                          {msg.direction === 'outbound' && (
                            <span className={`message-status ${msg.status}`}>
                              {msg.status === 'sent' && '✓'}
                              {msg.status === 'delivered' && '✓✓'}
                              {msg.status === 'read' && '✓✓'}
                              {msg.status === 'failed' && '✗'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="message-input-area">
                  <div className="input-toolbar">
                    <button 
                      className="toolbar-btn" 
                      onClick={() => setShowMediaModal(true)}
                      title="Send Media"
                    >
                      📎
                    </button>
                    <button 
                      className="toolbar-btn"
                      onClick={() => setShowTemplateModal(true)}
                      title="Send Template"
                    >
                      📋
                    </button>
                    <button 
                      className="toolbar-btn"
                      onClick={() => setShowInteractiveModal(true)}
                      title="Interactive Message"
                    >
                      🔘
                    </button>
                  </div>
                  
                  <div className="input-row">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={selectedContact.windowOpen ? "Type a message..." : "Use templates (24h window closed)"}
                      disabled={!selectedContact.windowOpen && messageType === 'text'}
                      rows={1}
                    />
                    <button 
                      className="send-btn"
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-chat-selected">
                <div className="empty-state">
                  <h3>Select a conversation</h3>
                  <p>Choose a contact to start messaging</p>
                </div>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="info-panel">
            <h3>WhatsApp Info</h3>
            
            <div className="info-section">
              <h4>Active Phone</h4>
              <p>{phoneNumbers.find(p => p.id === selectedPhone)?.number}</p>
              <p className="info-label">{phoneNumbers.find(p => p.id === selectedPhone)?.name}</p>
            </div>

            <div className="info-section">
              <h4>Message Types</h4>
              <ul className="info-list">
                <li>📝 Text Messages</li>
                <li>🖼️ Images (JPEG, PNG)</li>
                <li>🎥 Videos (MP4)</li>
                <li>🎵 Audio (MP3, OGG)</li>
                <li>📄 Documents (PDF)</li>
                <li>📋 Templates</li>
                <li>🔘 Interactive (Buttons/Lists)</li>
              </ul>
            </div>

            <div className="info-section">
              <h4>24-Hour Window</h4>
              <p className="info-text">
                When a customer messages you, a 24-hour window opens. 
                During this time, you can send any message type.
                Outside the window, only template messages are allowed.
              </p>
            </div>

            <div className="info-section">
              <h4>Rate Limits</h4>
              <ul className="info-list">
                <li>Send: 1,000 req/sec</li>
                <li>Media Upload: 100 req/sec</li>
                <li>Media Download: 100 req/sec</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Media Upload Modal */}
        {showMediaModal && (
          <div className="modal-overlay" onClick={() => setShowMediaModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>Send Media</h2>
              <div className="form-group">
                <label>Media Type</label>
                <select>
                  <option value="image">Image (JPEG, PNG)</option>
                  <option value="video">Video (MP4)</option>
                  <option value="audio">Audio (MP3, OGG)</option>
                  <option value="document">Document (PDF)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Upload File</label>
                <input type="file" />
                <div className="help-text">
                  Files are stored in S3: auth.wecare.digital/whatsapp-media/
                </div>
              </div>
              <div className="form-group">
                <label>Caption (optional)</label>
                <input type="text" placeholder="Add a caption..." />
              </div>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setShowMediaModal(false)}>Cancel</button>
                <button className="btn-primary">Send Media</button>
              </div>
            </div>
          </div>
        )}

        {/* Template Modal */}
        {showTemplateModal && (
          <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
            <div className="modal modal-large" onClick={e => e.stopPropagation()}>
              <h2>Send Template Message</h2>
              <p className="modal-info">
                Template messages can be sent anytime, even outside the 24-hour window.
                Templates must be pre-approved by WhatsApp.
              </p>
              <div className="form-group">
                <label>Template Name</label>
                <select>
                  <option value="">Select a template...</option>
                  <option value="hello_world">hello_world</option>
                  <option value="order_confirmation">order_confirmation</option>
                  <option value="appointment_reminder">appointment_reminder</option>
                </select>
              </div>
              <div className="form-group">
                <label>Language</label>
                <select>
                  <option value="en_US">English (US)</option>
                  <option value="en_GB">English (UK)</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
              <div className="form-group">
                <label>Template Variables</label>
                <input type="text" placeholder="{{1}} - First variable" />
                <input type="text" placeholder="{{2}} - Second variable" style={{marginTop: '8px'}} />
              </div>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setShowTemplateModal(false)}>Cancel</button>
                <button className="btn-primary">Send Template</button>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Message Modal */}
        {showInteractiveModal && (
          <div className="modal-overlay" onClick={() => setShowInteractiveModal(false)}>
            <div className="modal modal-large" onClick={e => e.stopPropagation()}>
              <h2>Send Interactive Message</h2>
              <div className="form-group">
                <label>Interactive Type</label>
                <select>
                  <option value="button">Reply Buttons (max 3)</option>
                  <option value="list">List Menu (max 10 items)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Header (optional)</label>
                <input type="text" placeholder="Message header..." />
              </div>
              <div className="form-group">
                <label>Body Text</label>
                <textarea rows={3} placeholder="Main message content..."></textarea>
              </div>
              <div className="form-group">
                <label>Footer (optional)</label>
                <input type="text" placeholder="Footer text..." />
              </div>
              <div className="form-group">
                <label>Buttons / List Items</label>
                <input type="text" placeholder="Button 1 text" />
                <input type="text" placeholder="Button 2 text" style={{marginTop: '8px'}} />
                <input type="text" placeholder="Button 3 text" style={{marginTop: '8px'}} />
              </div>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setShowInteractiveModal(false)}>Cancel</button>
                <button className="btn-primary">Send Interactive</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WhatsAppMessaging;
