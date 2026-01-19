/**
 * Contacts Management Page
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
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock contacts
  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Test Customer',
      phone: '+919876543210',
      email: 'test@example.com',
      optInWhatsApp: true,
      optInSms: false,
      optInEmail: true,
      lastInboundMessageAt: '2026-01-19 10:30',
      createdAt: '2026-01-15'
    }
  ]);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Contacts</h1>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
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
                    <td>{contact.name || '-'}</td>
                    <td>{contact.phone}</td>
                    <td>{contact.email || '-'}</td>
                    <td>
                      <div className="opt-in-badges">
                        {contact.optInWhatsApp && <span className="badge badge-green">WA</span>}
                        {contact.optInSms && <span className="badge badge-blue">SMS</span>}
                        {contact.optInEmail && <span className="badge badge-purple">Email</span>}
                      </div>
                    </td>
                    <td>{contact.lastInboundMessageAt || '-'}</td>
                    <td>
                      <button className="btn-icon" title="Edit">✏️</button>
                      <button className="btn-icon" title="Message">💬</button>
                      <button className="btn-icon" title="Delete">🗑️</button>
                    </td>
                  </tr>
                ))}
                {filteredContacts.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>
                      No contacts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>Add Contact</h2>
              <div className="form-group">
                <label>Name</label>
                <input type="text" placeholder="Contact name" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="+91 98765 43210" />
              </div>
              <div className="form-group">
                <label>Email (optional)</label>
                <input type="email" placeholder="email@example.com" />
              </div>
              <div className="form-group">
                <label>Opt-In Channels</label>
                <div className="toggle-group">
                  <label className="toggle">
                    <input type="checkbox" /> WhatsApp
                  </label>
                  <label className="toggle">
                    <input type="checkbox" /> SMS
                  </label>
                  <label className="toggle">
                    <input type="checkbox" /> Email
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-primary">Add Contact</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Contacts;
