/**
 * Bulk SMS - Airtel IQ
 * Bulk SMS campaigns via Airtel IQ
 */

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../../components/Layout';
import RichTextEditor from '../../../components/RichTextEditor';
import '../../../components/RichTextEditor.css';
import * as api from '../../../lib/api';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const BulkSms: React.FC<PageProps> = ({ signOut, user }) => {
  const [jobs, setJobs] = useState<api.BulkJob[]>([]);
  const [contacts, setContacts] = useState<api.Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsData, contactsData] = await Promise.all([
        api.listBulkJobs('SMS'),
        api.listContacts(),
      ]);
      setJobs(jobsData);
      setContacts(contactsData.filter(c => c.phone && c.optInSms));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSelectAll = () => {
    setSelectedContacts(prev => prev.length === contacts.length ? [] : contacts.map(c => c.contactId));
  };

  const handleCreateCampaign = async () => {
    if (selectedContacts.length === 0 || !messageText.trim()) return;
    setCreating(true);
    try {
      await api.createBulkJob({ channel: 'SMS', totalRecipients: selectedContacts.length });
      setShowCreate(false);
      setSelectedContacts([]);
      setMessageText('');
      await loadData();
    } finally {
      setCreating(false);
    }
  };

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="bulk-page">
        <div className="bulk-header">
          <a href="/bulk" className="back-btn">←</a>
          <div className="bulk-header-info">
            <span className="bulk-icon">📱</span>
            <div>
              <h1>Bulk SMS - Airtel IQ</h1>
              <span className="bulk-provider">Airtel IQ SMS Gateway</span>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className="create-btn">+ New Campaign</button>
        </div>

        <div className="bulk-content">
          <div className="jobs-section">
            <h2>SMS Campaigns</h2>
            {loading ? <p>Loading...</p> : jobs.length === 0 ? (
              <div className="empty-state">
                <p>No SMS campaigns yet</p>
                <button onClick={() => setShowCreate(true)}>Create First Campaign</button>
              </div>
            ) : (
              <div className="jobs-list">
                {jobs.map(job => (
                  <div key={job.id} className="job-card">
                    <span className={`status-badge ${job.status.toLowerCase()}`}>{job.status}</span>
                    <div className="job-stats">
                      <div className="stat"><span className="stat-value">{job.totalRecipients}</span><span className="stat-label">Recipients</span></div>
                      <div className="stat"><span className="stat-value">{job.sentCount}</span><span className="stat-label">Sent</span></div>
                      <div className="stat"><span className="stat-value">{job.failedCount}</span><span className="stat-label">Failed</span></div>
                    </div>
                    <div className="job-date">{new Date(job.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="info-panel">
            <h3>Airtel IQ SMS</h3>
            <div className="info-section">
              <h4>Features</h4>
              <ul><li>✓ Transactional SMS</li><li>✓ Promotional SMS</li><li>✓ DLT Compliance</li><li>✓ Delivery Reports</li></ul>
            </div>
            <div className="info-section">
              <h4>Documentation</h4>
              <a href="https://www.airtel.in/business/b2b/airtel-iq/api-docs/sms/overview" target="_blank" rel="noopener noreferrer">Airtel IQ SMS API Docs →</a>
            </div>
          </div>
        </div>

        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>New SMS Campaign</h2>
                <button onClick={() => setShowCreate(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-section">
                  <h3>Select Recipients ({selectedContacts.length} selected)</h3>
                  <button className="select-all-btn" onClick={handleSelectAll}>
                    {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <div className="contacts-grid">
                    {contacts.map(c => (
                      <label key={c.contactId} className="contact-checkbox">
                        <input type="checkbox" checked={selectedContacts.includes(c.contactId)} onChange={() => setSelectedContacts(prev => prev.includes(c.contactId) ? prev.filter(id => id !== c.contactId) : [...prev, c.contactId])} />
                        <span>{c.name || c.phone}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-section">
                  <h3>Message ({messageText.length}/160 chars)</h3>
                  <RichTextEditor value={messageText} onChange={setMessageText} placeholder="Type your SMS..." channel="sms" maxLength={1600} showCharCount={true} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleCreateCampaign} disabled={creating || selectedContacts.length === 0 || !messageText.trim()}>
                  {creating ? 'Creating...' : `Send to ${selectedContacts.length} contacts`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .bulk-page { height: calc(100vh - 60px); display: flex; flex-direction: column; }
        .bulk-header { display: flex; align-items: center; gap: 16px; padding: 12px 20px; background: #0066b3; color: #fff; }
        .back-btn { background: rgba(255,255,255,0.2); border: none; color: #fff; padding: 8px 12px; border-radius: 8px; cursor: pointer; text-decoration: none; }
        .bulk-header-info { display: flex; align-items: center; gap: 12px; flex: 1; }
        .bulk-icon { font-size: 28px; }
        .bulk-header h1 { font-size: 18px; font-weight: 500; margin: 0; }
        .bulk-provider { font-size: 13px; opacity: 0.9; }
        .create-btn { background: #fff; color: #0066b3; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 500; }
        .bulk-content { flex: 1; display: grid; grid-template-columns: 1fr 280px; overflow: hidden; }
        .jobs-section { padding: 24px; overflow-y: auto; }
        .jobs-section h2 { font-size: 18px; margin: 0 0 16px 0; }
        .empty-state { text-align: center; padding: 40px; color: #666; }
        .empty-state button { margin-top: 12px; background: #1a1a1a; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
        .jobs-list { display: grid; gap: 12px; }
        .job-card { background: #fff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 20px; }
        .status-badge { font-size: 12px; padding: 4px 12px; border-radius: 12px; text-transform: uppercase; background: #f5f5f5; }
        .job-stats { display: flex; gap: 24px; flex: 1; }
        .stat { text-align: center; }
        .stat-value { display: block; font-size: 20px; font-weight: 500; }
        .stat-label { font-size: 12px; color: #666; }
        .job-date { font-size: 13px; color: #999; }
        .info-panel { background: #fff; border-left: 1px solid #e5e5e5; padding: 20px; overflow-y: auto; }
        .info-panel h3 { font-size: 16px; margin: 0 0 20px 0; }
        .info-section { margin-bottom: 20px; }
        .info-section h4 { font-size: 12px; color: #666; text-transform: uppercase; margin: 0 0 8px 0; }
        .info-section ul { list-style: none; padding: 0; margin: 0; font-size: 13px; }
        .info-section li { padding: 4px 0; }
        .info-section a { color: #0066b3; text-decoration: none; font-size: 13px; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: #fff; border-radius: 12px; width: 90%; max-width: 700px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #e5e5e5; }
        .modal-header h2 { margin: 0; font-size: 18px; }
        .modal-header button { background: none; border: none; font-size: 20px; cursor: pointer; }
        .modal-body { padding: 20px; flex: 1; overflow-y: auto; }
        .form-section { margin-bottom: 20px; }
        .form-section h3 { font-size: 14px; margin: 0 0 12px 0; }
        .select-all-btn { background: #f5f5f5; border: 1px solid #e5e5e5; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; margin-bottom: 12px; }
        .contacts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; max-height: 200px; overflow-y: auto; }
        .contact-checkbox { display: flex; align-items: center; gap: 8px; padding: 8px; background: #f9f9f9; border-radius: 6px; cursor: pointer; font-size: 13px; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 20px; border-top: 1px solid #e5e5e5; }
        .btn-secondary { background: #fff; border: 1px solid #e5e5e5; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
        .btn-primary { background: #0066b3; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
        .btn-primary:disabled { background: #ccc; }
      `}</style>
    </Layout>
  );
};

export default BulkSms;
