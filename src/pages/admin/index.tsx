/**
 * Admin Tools Page
 * WECARE.DIGITAL Admin Platform
 * Admin-only access
 * 
 * Features:
 * - Data Management (Delete options)
 * - System Config
 * - DLQ Replay
 * - Audit Logs
 */

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import * as api from '../../api/client';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

type DeleteType = 'hard' | 'messages-only' | 'contact-only' | 'single-message' | 'bulk';

interface DeleteOption {
  type: DeleteType;
  title: string;
  description: string;
  icon: string;
  warning: string;
}

const DELETE_OPTIONS: DeleteOption[] = [
  {
    type: 'hard',
    title: 'Hard Delete (Complete)',
    description: 'Delete contact + all messages + media files from S3',
    icon: '⚠',
    warning: 'This will permanently remove ALL data for the selected contact including media files. This cannot be undone!'
  },
  {
    type: 'messages-only',
    title: 'Delete Messages Only',
    description: 'Clear all messages but keep the contact',
    icon: '✉',
    warning: 'This will delete all messages for the contact but keep the contact record.'
  },
  {
    type: 'contact-only',
    title: 'Delete Contact Only',
    description: 'Remove contact but keep message history',
    icon: '☎',
    warning: 'This will delete the contact record but messages will remain (orphaned).'
  },
  {
    type: 'single-message',
    title: 'Delete Single Message',
    description: 'Remove a specific message',
    icon: '−',
    warning: 'This will delete only the selected message.'
  },
  {
    type: 'bulk',
    title: 'Bulk Delete',
    description: 'Select multiple items to delete',
    icon: '⧉',
    warning: 'This will delete all selected items. Review carefully before confirming.'
  }
];

const AdminPage: React.FC<PageProps> = ({ signOut, user }) => {
  const [activeTab, setActiveTab] = useState<'data' | 'config' | 'dlq' | 'audit'>('data');
  
  // Data management state
  const [contacts, setContacts] = useState<api.Contact[]>([]);
  const [messages, setMessages] = useState<api.Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteType, setDeleteType] = useState<DeleteType | null>(null);
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [contactMessages, setContactMessages] = useState<api.Message[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<{ success: boolean; message: string } | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [contactsData, messagesData] = await Promise.all([
        api.listContacts(),
        api.listMessages()
      ]);
      setContacts(contactsData);
      setMessages(messagesData);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load messages for selected contact
  useEffect(() => {
    if (selectedContact) {
      const filtered = messages.filter(m => m.contactId === selectedContact);
      setContactMessages(filtered);
    } else {
      setContactMessages([]);
    }
    setSelectedMessages([]);
  }, [selectedContact, messages]);

  const handleDeleteTypeSelect = (type: DeleteType) => {
    setDeleteType(type);
    setSelectedContact('');
    setSelectedMessages([]);
    setDeleteResult(null);
    setConfirmText('');
  };

  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const selectAllMessages = () => {
    if (selectedMessages.length === contactMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(contactMessages.map(m => m.id));
    }
  };

  const executeDelete = async () => {
    if (!deleteType) return;
    
    // Require confirmation text for hard delete
    if (deleteType === 'hard' && confirmText !== 'DELETE') {
      setDeleteResult({ success: false, message: 'Please type DELETE to confirm' });
      return;
    }
    
    setDeleting(true);
    setDeleteResult(null);
    
    try {
      let success = false;
      let message = '';
      
      switch (deleteType) {
        case 'hard':
          // Hard delete: contact + all messages + media
          if (!selectedContact) {
            setDeleteResult({ success: false, message: 'Please select a contact' });
            setDeleting(false);
            return;
          }
          success = await api.hardDeleteContact(selectedContact);
          message = success 
            ? 'Contact, messages, and media permanently deleted' 
            : 'Failed to delete. Check console for details.';
          break;
          
        case 'messages-only':
          // Delete all messages for contact
          if (!selectedContact) {
            setDeleteResult({ success: false, message: 'Please select a contact' });
            setDeleting(false);
            return;
          }
          success = await api.deleteContactMessages(selectedContact);
          message = success 
            ? `Deleted ${contactMessages.length} messages (contact kept)` 
            : 'Failed to delete messages';
          break;
          
        case 'contact-only':
          // Delete contact only
          if (!selectedContact) {
            setDeleteResult({ success: false, message: 'Please select a contact' });
            setDeleting(false);
            return;
          }
          success = await api.deleteContact(selectedContact);
          message = success 
            ? 'Contact deleted (messages kept)' 
            : 'Failed to delete contact';
          break;
          
        case 'single-message':
        case 'bulk':
          // Delete selected messages
          if (selectedMessages.length === 0) {
            setDeleteResult({ success: false, message: 'Please select messages to delete' });
            setDeleting(false);
            return;
          }
          let deleted = 0;
          let failedCount = 0;
          console.log(`Deleting ${selectedMessages.length} messages...`);
          for (const msgId of selectedMessages) {
            const msg = messages.find(m => m.id === msgId);
            if (msg) {
              console.log(`Deleting message ${msgId}, direction: ${msg.direction}`);
              const result = await api.deleteMessage(msgId, msg.direction);
              console.log(`Delete result for ${msgId}:`, result);
              if (result) {
                deleted++;
              } else {
                failedCount++;
              }
            } else {
              console.warn(`Message not found: ${msgId}`);
              failedCount++;
            }
          }
          success = deleted > 0;
          message = `Deleted ${deleted} of ${selectedMessages.length} messages${failedCount > 0 ? ` (${failedCount} failed)` : ''}`;
          break;
      }
      
      setDeleteResult({ success, message });
      
      if (success) {
        // Refresh data
        await loadData();
        setSelectedContact('');
        setSelectedMessages([]);
        setConfirmText('');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setDeleteResult({ success: false, message: 'Delete operation failed' });
    } finally {
      setDeleting(false);
    }
  };

  const getSelectedContactName = () => {
    const contact = contacts.find(c => c.id === selectedContact);
    return contact ? (contact.name || contact.phone || 'Unknown') : '';
  };


  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <h1 className="page-title">⚙ Admin Tools</h1>
        
        <div className="tabs">
          <button className={`tab ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}>
            ⌫ Data Management
          </button>
          <button className={`tab ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>
            ⚙ System Config
          </button>
          <button className={`tab ${activeTab === 'dlq' ? 'active' : ''}`} onClick={() => setActiveTab('dlq')}>
            ⚑ DLQ Replay
          </button>
          <button className={`tab ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
            ☰ Audit Logs
          </button>
        </div>

        {/* Data Management Tab */}
        {activeTab === 'data' && (
          <div className="section">
            <h2 className="section-title">Data Management</h2>
            <p className="section-description">
              Manage contacts, messages, and media files. Choose the type of deletion you need.
            </p>
            
            {/* Delete Type Selection */}
            <div className="delete-options-grid">
              {DELETE_OPTIONS.map(option => (
                <button
                  key={option.type}
                  className={`delete-option-card ${deleteType === option.type ? 'selected' : ''}`}
                  onClick={() => handleDeleteTypeSelect(option.type)}
                >
                  <span className="delete-option-icon">{option.icon}</span>
                  <span className="delete-option-title">{option.title}</span>
                  <span className="delete-option-desc">{option.description}</span>
                </button>
              ))}
            </div>
            
            {/* Delete Form */}
            {deleteType && (
              <div className="delete-form">
                <div className="delete-warning">
                  <span className="warning-icon">⚠</span>
                  <span>{DELETE_OPTIONS.find(o => o.type === deleteType)?.warning}</span>
                </div>
                
                {/* Contact Selection (for contact-based operations) */}
                {(deleteType === 'hard' || deleteType === 'messages-only' || deleteType === 'contact-only') && (
                  <div className="form-group">
                    <label>Select Contact</label>
                    <select 
                      value={selectedContact} 
                      onChange={e => setSelectedContact(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">-- Select a contact --</option>
                      {contacts.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name || 'No name'} ({c.phone || c.email || c.id.slice(0, 8)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Message Selection (for message-based operations) */}
                {(deleteType === 'single-message' || deleteType === 'bulk') && (
                  <>
                    <div className="form-group">
                      <label>Filter by Contact (optional)</label>
                      <select 
                        value={selectedContact} 
                        onChange={e => setSelectedContact(e.target.value)}
                        disabled={loading}
                      >
                        <option value="">-- All contacts --</option>
                        {contacts.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name || 'No name'} ({c.phone || c.email || c.id.slice(0, 8)})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="messages-selection">
                      <div className="selection-header">
                        <span>Select Messages ({selectedMessages.length} selected)</span>
                        <button 
                          className="btn-link" 
                          onClick={selectAllMessages}
                        >
                          {selectedMessages.length === contactMessages.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      
                      <div className="messages-list-select">
                        {(selectedContact ? contactMessages : messages.slice(0, 50)).map(msg => {
                          const contact = contacts.find(c => c.id === msg.contactId);
                          return (
                            <label key={msg.id} className="message-select-item">
                              <input
                                type="checkbox"
                                checked={selectedMessages.includes(msg.id)}
                                onChange={() => toggleMessageSelection(msg.id)}
                              />
                              <span className={`msg-direction ${msg.direction.toLowerCase()}`}>
                                {msg.direction === 'INBOUND' ? '↓' : '↑'}
                              </span>
                              <span className="msg-contact">
                                {contact?.name || contact?.phone || msg.contactId.slice(0, 8)}
                              </span>
                              <span className="msg-preview">
                                {msg.content?.slice(0, 40) || '[Media]'}
                                {(msg.content?.length || 0) > 40 ? '...' : ''}
                              </span>
                              <span className="msg-time">
                                {new Date(msg.timestamp).toLocaleDateString()}
                              </span>
                            </label>
                          );
                        })}
                        {messages.length === 0 && (
                          <div className="empty-state">No messages found</div>
                        )}
                      </div>
                    </div>
                  </>
                )}
                
                {/* Contact Info Preview */}
                {selectedContact && (deleteType === 'hard' || deleteType === 'messages-only') && (
                  <div className="delete-preview">
                    <h4>Will be deleted:</h4>
                    <ul>
                      {deleteType === 'hard' && <li>Contact: {getSelectedContactName()}</li>}
                      <li>{contactMessages.length} messages</li>
                      <li>{contactMessages.filter(m => m.s3Key || m.mediaUrl).length} media files</li>
                    </ul>
                  </div>
                )}
                
                {/* Hard Delete Confirmation */}
                {deleteType === 'hard' && selectedContact && (
                  <div className="form-group">
                    <label className="danger-label">Type DELETE to confirm:</label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={e => setConfirmText(e.target.value)}
                      placeholder="Type DELETE"
                      className="confirm-input"
                    />
                  </div>
                )}
                
                {/* Result Message */}
                {deleteResult && (
                  <div className={`delete-result ${deleteResult.success ? 'success' : 'error'}`}>
                    {deleteResult.message}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="form-actions">
                  <button 
                    className="btn-secondary" 
                    onClick={() => setDeleteType(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    className={`btn-danger ${deleteType === 'hard' ? 'btn-danger-hard' : ''}`}
                    onClick={executeDelete}
                    disabled={deleting || (deleteType === 'hard' && confirmText !== 'DELETE')}
                  >
                    {deleting ? 'Deleting...' : `Delete ${
                      deleteType === 'hard' ? 'Everything' :
                      deleteType === 'messages-only' ? 'Messages' :
                      deleteType === 'contact-only' ? 'Contact' :
                      `${selectedMessages.length} Message(s)`
                    }`}
                  </button>
                </div>
              </div>
            )}
            
            {/* Quick Stats */}
            <div className="data-stats">
              <div className="data-stat">
                <span className="data-stat-value">{contacts.length}</span>
                <span className="data-stat-label">Contacts</span>
              </div>
              <div className="data-stat">
                <span className="data-stat-value">{messages.length}</span>
                <span className="data-stat-label">Messages</span>
              </div>
              <div className="data-stat">
                <span className="data-stat-value">{messages.filter(m => m.s3Key || m.mediaUrl).length}</span>
                <span className="data-stat-label">Media Files</span>
              </div>
            </div>
          </div>
        )}


        {/* System Config Tab */}
        {activeTab === 'config' && (
          <div className="section">
            <h2 className="section-title">System Configuration</h2>
            <div className="config-grid">
              <div className="config-card">
                <h3>Send Mode</h3>
                <div className="config-item">
                  <label>Current Mode</label>
                  <div className="mode-badge live">LIVE</div>
                  <p className="help-text">All messages are sent to real recipients</p>
                </div>
              </div>
              <div className="config-card">
                <h3>AI Automation</h3>
                <div className="config-item">
                  <label>Status</label>
                  <div className="mode-badge live">ENABLED</div>
                  <p className="help-text">Auto-reply using Bedrock Nova Lite</p>
                </div>
              </div>
              <div className="config-card">
                <h3>Rate Limits</h3>
                <div className="config-item">
                  <label>WhatsApp (msg/sec)</label>
                  <input type="number" defaultValue={80} readOnly />
                </div>
                <div className="config-item">
                  <label>SMS (msg/sec)</label>
                  <input type="number" defaultValue={5} readOnly />
                </div>
                <div className="config-item">
                  <label>Email (msg/sec)</label>
                  <input type="number" defaultValue={10} readOnly />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DLQ Tab */}
        {activeTab === 'dlq' && (
          <div className="section">
            <h2 className="section-title">Dead Letter Queue</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">↓</div>
                <div className="stat-content">
                  <div className="stat-value">0</div>
                  <div className="stat-label">Inbound DLQ</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">↑</div>
                <div className="stat-content">
                  <div className="stat-value">0</div>
                  <div className="stat-label">Outbound DLQ</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⧉</div>
                <div className="stat-content">
                  <div className="stat-value">0</div>
                  <div className="stat-label">Bulk DLQ</div>
                </div>
              </div>
            </div>
            <div className="empty-state">
              <p>● No failed messages in queue</p>
            </div>
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div className="section">
            <h2 className="section-title">Audit Logs</h2>
            <div className="empty-state">
              <p>☰ Audit log viewer coming soon</p>
              <p className="help-text">View system activity and user actions</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPage;
