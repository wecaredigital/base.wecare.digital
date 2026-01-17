/**
 * Contacts Management Page
 * 
 * Requirements:
 * - 2.1, 2.2, 2.4, 2.5, 2.6: Contact CRUD operations
 * - 16.9: Display customer service window expiration
 */

import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import './Pages.css';

interface Contact {
  contactId: string;
  name: string;
  phone: string;
  email: string;
  optInWhatsApp: boolean;
  optInSms: boolean;
  optInEmail: boolean;
  lastInboundMessageAt?: number;
  createdAt: number;
  updatedAt: number;
}

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    optInWhatsApp: false,
    optInSms: false,
    optInEmail: false,
  });

  const client = generateClient();

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      // API call to fetch contacts
      // const response = await client.graphql({ query: listContacts });
      // setContacts(response.data.listContacts.items);
      setContacts([]); // Placeholder
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadContacts();
      return;
    }
    setIsLoading(true);
    try {
      // API call to search contacts
      // const response = await client.graphql({
      //   query: searchContacts,
      //   variables: { query: searchQuery }
      // });
      // setContacts(response.data.searchContacts.items);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone && !formData.email) {
      alert('At least one of phone or email is required');
      return;
    }

    try {
      if (editingContact) {
        // Update contact
        // await client.graphql({
        //   query: updateContact,
        //   variables: { input: { contactId: editingContact.contactId, ...formData } }
        // });
      } else {
        // Create contact
        // await client.graphql({
        //   query: createContact,
        //   variables: { input: formData }
        // });
      }
      
      setShowForm(false);
      setEditingContact(null);
      resetForm();
      loadContacts();
    } catch (error) {
      console.error('Failed to save contact:', error);
    }
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      // Soft delete
      // await client.graphql({
      //   query: deleteContact,
      //   variables: { contactId }
      // });
      loadContacts();
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      optInWhatsApp: false,
      optInSms: false,
      optInEmail: false,
    });
  };

  const openEditForm = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      optInWhatsApp: contact.optInWhatsApp,
      optInSms: contact.optInSms,
      optInEmail: contact.optInEmail,
    });
    setShowForm(true);
  };

  const getWindowExpiration = (lastInbound?: number): string => {
    if (!lastInbound) return 'No window';
    const expiration = lastInbound + (24 * 60 * 60);
    const now = Math.floor(Date.now() / 1000);
    if (now >= expiration) return 'Expired';
    const remaining = expiration - now;
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Contacts</h1>
        <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          + New Contact
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="search-input"
        />
        <button className="btn-secondary" onClick={handleSearch}>Search</button>
      </div>

      {/* Contact Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingContact ? 'Edit Contact' : 'New Contact'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label>Opt-In Preferences</label>
                <div className="toggle-group">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={formData.optInWhatsApp}
                      onChange={(e) => setFormData({ ...formData, optInWhatsApp: e.target.checked })}
                    />
                    <span>WhatsApp</span>
                  </label>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={formData.optInSms}
                      onChange={(e) => setFormData({ ...formData, optInSms: e.target.checked })}
                    />
                    <span>SMS</span>
                  </label>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={formData.optInEmail}
                      onChange={(e) => setFormData({ ...formData, optInEmail: e.target.checked })}
                    />
                    <span>Email</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditingContact(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingContact ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contacts List */}
      {isLoading ? (
        <div className="loading">Loading contacts...</div>
      ) : contacts.length === 0 ? (
        <div className="empty-state">
          <p>No contacts found. Create your first contact to get started.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Opt-In</th>
                <th>Service Window</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.contactId}>
                  <td>{contact.name || '-'}</td>
                  <td>{contact.phone || '-'}</td>
                  <td>{contact.email || '-'}</td>
                  <td>
                    <div className="opt-in-badges">
                      {contact.optInWhatsApp && <span className="badge badge-green">WA</span>}
                      {contact.optInSms && <span className="badge badge-blue">SMS</span>}
                      {contact.optInEmail && <span className="badge badge-purple">Email</span>}
                    </div>
                  </td>
                  <td className="window-status">
                    {getWindowExpiration(contact.lastInboundMessageAt)}
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => openEditForm(contact)}>✏️</button>
                    <button className="btn-icon" onClick={() => handleDelete(contact.contactId)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Contacts;
