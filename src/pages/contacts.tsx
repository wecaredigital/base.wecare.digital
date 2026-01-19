/**
 * Contacts Management Page
 * Full CRUD operations
 */

import React, { useState } from 'react';
import Layout from '../components/Layout';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  optInWhatsApp: boolean;
  optInSms: boolean;
  optInEmail: boolean;
  lastInboundMessageAt?: string;
  createdAt: string;
}

const Contacts: React.FC<PageProps> = ({ signOut, user }) => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formOptInWA, setFormOptInWA] = useState(false);
  const [formOptInSms, setFormOptInSms] = useState(false);
  const [formOptInEmail, setFormOptInEmail] = useState(false);
  
  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '61004f7e-43b2-4a80-b247-7eeab58077bc',
      name: 'UK Test',
      phone: '+447123456789',
      email: '',
      optInWhatsApp: true,
      optInSms: false,
      optInEmail: false,
      lastInboundMessageAt: '2026-01-19 10:30',
      createdAt: '2026-01-19'
    }
  ]);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormOptInWA(false);
    setFormOptInSms(false);
    setFormOptInEmail(false);
  };

  const handleCreate = () => {
    if (!formPhone) return;
    
    const newContact: Contact = {
      id: Date.now().toString(),
      name: formName,
      phone: formPhone.startsWith('+') ? formPhone : `+${formPhone}`,
      email: formEmail || undefined,
      optInWhatsApp: formOptInWA,
      optInSms: formOptInSms,
      optInEmail: formOptInEmail,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setContacts(prev => [newContact, ...prev]);
    setShowModal(false);
    resetForm();
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormName(contact.name);
    setFormPhone(contact.phone);
    setFormEmail(contact.email || '');
    setFormOptInWA(contact.optInWhatsApp);
    setFormOptInSms(contact.optInSms);
    setFormOptInEmail(contact.optInEmail);
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!editingContact || !formPhone) return;
    
    setContacts(prev => prev.map(c => 
      c.id === editingContact.id 
        ? {
            ...c,
            name: formName,
            phone: formPhone.startsWith('+') ? formPhone : `+${formPhone}`,
            email: formEmail || undefined,
            optInWhatsApp: formOptInWA,
            optInSms: formOptInSms,
            optInEmail: formOptInEmail
          }
        : c
    ));
    setShowEditModal(false);
    setEditingContact(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      setContacts(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Contacts</h1>
          <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            + Add Contact
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{contacts.length}</div>
            <div className="stat-label">Total Contacts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{contacts.filter(c => c.optInWhatsApp).length}</div>
            <div className="stat-label">WhatsApp Opt-In</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{contacts.filter(c => c.optInSms).length}</div>
            <div className="stat-label">SMS Opt-In</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{contacts.filter(c => c.optInEmail).length}</div>
            <div className="stat-label">Email Opt-In</div>
          </div>
        </div>

        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search contacts by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="section">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Opt-In</th>
                  <th>Last Message</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map(contact => (
                  <tr key={contact.id}>
                    <td><strong>{contact.name || '-'}</strong></td>
                    <td>{contact.phone}</td>
                    <td>{contact.email || '-'}</td>
                    <td>
                      <div className="opt-in-badges">
                        {contact.optInWhatsApp && <span className="badge badge-green">WA</span>}
                        {contact.optInSms && <span className="badge badge-blue">SMS</span>}
                        {contact.optInEmail && <span className="badge badge-purple">Email</span>}
                        {!contact.optInWhatsApp && !contact.optInSms && !contact.optInEmail && (
                          <span className="badge badge-gray">None</span>
                        )}
                      </div>
                    </td>
                    <td>{contact.lastInboundMessageAt || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon" 
                          title="Edit"
                          onClick={() => handleEdit(contact)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-icon" 
                          title="Message"
                          onClick={() => window.location.href = '/messaging'}
                        >
                          💬
                        </button>
                        <button 
                          className="btn-icon btn-icon-danger" 
                          title="Delete"
                          onClick={() => handleDelete(contact.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredContacts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-table">
                      {searchQuery ? 'No contacts match your search' : 'No contacts yet. Add your first contact!'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Contact Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>Add Contact</h2>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contact name" 
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input 
                  type="tel" 
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+91 98765 43210" 
                />
                <div className="help-text">Include country code</div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="email@example.com" 
                />
              </div>
              <div className="form-group">
                <label>Opt-In Channels</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={formOptInWA}
                      onChange={(e) => setFormOptInWA(e.target.checked)}
                    />
                    <span>WhatsApp</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={formOptInSms}
                      onChange={(e) => setFormOptInSms(e.target.checked)}
                    />
                    <span>SMS</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={formOptInEmail}
                      onChange={(e) => setFormOptInEmail(e.target.checked)}
                    />
                    <span>Email</span>
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleCreate} disabled={!formPhone}>
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Contact Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>Edit Contact</h2>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contact name" 
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input 
                  type="tel" 
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+91 98765 43210" 
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="email@example.com" 
                />
              </div>
              <div className="form-group">
                <label>Opt-In Channels</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={formOptInWA}
                      onChange={(e) => setFormOptInWA(e.target.checked)}
                    />
                    <span>WhatsApp</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={formOptInSms}
                      onChange={(e) => setFormOptInSms(e.target.checked)}
                    />
                    <span>SMS</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={formOptInEmail}
                      onChange={(e) => setFormOptInEmail(e.target.checked)}
                    />
                    <span>Email</span>
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => { setShowEditModal(false); setEditingContact(null); }}>Cancel</button>
                <button className="btn-primary" onClick={handleUpdate} disabled={!formPhone}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Contacts;
