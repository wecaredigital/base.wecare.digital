/**
 * Bulk Messaging Page
 * Separate tabs for WhatsApp, SMS, Email bulk operations
 * Includes bulk contact update
 */

import React, { useState } from 'react';
import Layout from '../components/Layout';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

interface BulkJob {
  id: string;
  channel: 'whatsapp' | 'sms' | 'email';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  totalRecipients: number;
  sent: number;
  delivered: number;
  failed: number;
  createdAt: string;
  template?: string;
  message?: string;
}

const BulkMessaging: React.FC<PageProps> = ({ signOut, user }) => {
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [activeTab, setActiveTab] = useState<'jobs' | 'create' | 'contacts'>('jobs');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create job form
  const [recipients, setRecipients] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  
  // Bulk contact update
  const [contactsCsv, setContactsCsv] = useState<File | null>(null);
  const [updateMode, setUpdateMode] = useState<'add' | 'update' | 'delete'>('add');


  // Mock jobs
  const [jobs, setJobs] = useState<BulkJob[]>([
    { id: '1', channel: 'whatsapp', status: 'completed', totalRecipients: 100, sent: 100, delivered: 95, failed: 5, createdAt: '2026-01-18 14:00', template: 'order_confirmation' },
    { id: '2', channel: 'sms', status: 'running', totalRecipients: 50, sent: 30, delivered: 28, failed: 2, createdAt: '2026-01-19 09:00', message: 'Your OTP is {{code}}' }
  ]);

  const filteredJobs = jobs.filter(j => j.channel === activeChannel);

  const handleCreateJob = () => {
    const newJob: BulkJob = {
      id: Date.now().toString(),
      channel: activeChannel,
      status: 'pending',
      totalRecipients: recipients.split('\n').filter(r => r.trim()).length || 100,
      sent: 0, delivered: 0, failed: 0,
      createdAt: new Date().toLocaleString(),
      template: activeChannel === 'whatsapp' ? selectedTemplate : undefined,
      message: messageContent
    };
    setJobs(prev => [newJob, ...prev]);
    setShowCreateModal(false);
    setRecipients(''); setMessageContent(''); setSelectedTemplate(''); setEmailSubject('');
  };

  const handleJobAction = (jobId: string, action: 'pause' | 'resume' | 'cancel' | 'delete') => {
    if (action === 'delete') {
      if (!confirm('Delete this job?')) return;
      setJobs(prev => prev.filter(j => j.id !== jobId));
    } else {
      setJobs(prev => prev.map(j => {
        if (j.id !== jobId) return j;
        if (action === 'pause') return { ...j, status: 'paused' };
        if (action === 'resume') return { ...j, status: 'running' };
        if (action === 'cancel') return { ...j, status: 'failed' };
        return j;
      }));
    }
  };

  const handleBulkContactUpdate = () => {
    if (!contactsCsv) return;
    alert(`Bulk ${updateMode} operation started for ${contactsCsv.name}`);
    setContactsCsv(null);
  };

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Bulk Messaging</h1>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>+ New Bulk Job</button>
        </div>

        {/* Channel Tabs */}
        <div className="channel-tabs">
          <button className={`channel-tab ${activeChannel === 'whatsapp' ? 'active' : ''}`} onClick={() => setActiveChannel('whatsapp')}>
            💬 WhatsApp
          </button>
          <button className={`channel-tab ${activeChannel === 'sms' ? 'active' : ''}`} onClick={() => setActiveChannel('sms')}>
            📱 SMS
          </button>
          <button className={`channel-tab ${activeChannel === 'email' ? 'active' : ''}`} onClick={() => setActiveChannel('email')}>
            📧 Email
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="sub-tabs">
          <button className={`sub-tab ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
            Jobs ({filteredJobs.length})
          </button>
          <button className={`sub-tab ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
            Quick Create
          </button>
          <button className={`sub-tab ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}>
            Bulk Contacts
          </button>
        </div>


        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{filteredJobs.length}</div>
            <div className="stat-label">Total Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{filteredJobs.filter(j => j.status === 'running').length}</div>
            <div className="stat-label">Running</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{filteredJobs.filter(j => j.status === 'completed').length}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {filteredJobs.length > 0 ? Math.round(filteredJobs.reduce((acc, j) => acc + (j.delivered / Math.max(j.sent, 1) * 100), 0) / filteredJobs.length) : 100}%
            </div>
            <div className="stat-label">Avg Delivery</div>
          </div>
        </div>

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="section">
            <h2 className="section-title">{activeChannel.toUpperCase()} Jobs</h2>
            {filteredJobs.length === 0 ? (
              <div className="empty-state">
                <p>No {activeChannel} bulk jobs yet</p>
                <button className="btn-primary" onClick={() => setShowCreateModal(true)}>Create First Job</button>
              </div>
            ) : (
              <div className="jobs-list">
                {filteredJobs.map(job => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <span className="job-id">#{job.id}</span>
                      <span className={`job-status status-${job.status}`}>{job.status}</span>
                      <span className="job-time">{job.createdAt}</span>
                    </div>
                    <div className="job-content">
                      {job.template && <div className="job-template">Template: {job.template}</div>}
                      {job.message && <div className="job-message">{job.message.substring(0, 100)}</div>}
                    </div>
                    <div className="job-stats">
                      <div className="job-stat"><span className="stat-num">{job.totalRecipients}</span><span className="stat-lbl">Total</span></div>
                      <div className="job-stat"><span className="stat-num">{job.sent}</span><span className="stat-lbl">Sent</span></div>
                      <div className="job-stat text-green"><span className="stat-num">{job.delivered}</span><span className="stat-lbl">Delivered</span></div>
                      <div className="job-stat text-red"><span className="stat-num">{job.failed}</span><span className="stat-lbl">Failed</span></div>
                    </div>
                    <div className="job-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${(job.sent / job.totalRecipients) * 100}%` }}></div>
                      </div>
                      <span>{Math.round((job.sent / job.totalRecipients) * 100)}%</span>
                    </div>
                    <div className="job-actions">
                      {job.status === 'running' && <button className="btn-small" onClick={() => handleJobAction(job.id, 'pause')}>⏸ Pause</button>}
                      {job.status === 'paused' && <button className="btn-small" onClick={() => handleJobAction(job.id, 'resume')}>▶ Resume</button>}
                      {(job.status === 'running' || job.status === 'paused') && <button className="btn-small btn-danger" onClick={() => handleJobAction(job.id, 'cancel')}>✕ Cancel</button>}
                      <button className="btn-small btn-danger" onClick={() => handleJobAction(job.id, 'delete')}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* Quick Create Tab */}
        {activeTab === 'create' && (
          <div className="section">
            <h2 className="section-title">Quick Create {activeChannel.toUpperCase()} Job</h2>
            <div className="create-form">
              <div className="form-group">
                <label>Recipients (one per line)</label>
                <textarea 
                  value={recipients} 
                  onChange={e => setRecipients(e.target.value)}
                  placeholder={activeChannel === 'email' ? 'email1@example.com\nemail2@example.com' : '+919876543210\n+447123456789'}
                  rows={5}
                />
              </div>
              <div className="form-group">
                <label>Or Upload CSV</label>
                <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
                <div className="help-text">CSV with columns: {activeChannel === 'email' ? 'email, name' : 'phone, name'}</div>
              </div>
              
              {activeChannel === 'whatsapp' && (
                <div className="form-group">
                  <label>Template (required for WhatsApp)</label>
                  <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}>
                    <option value="">Select template...</option>
                    <option value="hello_world">hello_world</option>
                    <option value="order_confirmation">order_confirmation</option>
                    <option value="appointment_reminder">appointment_reminder</option>
                    <option value="shipping_update">shipping_update</option>
                  </select>
                </div>
              )}
              
              {activeChannel === 'email' && (
                <div className="form-group">
                  <label>Subject</label>
                  <input type="text" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Email subject" />
                </div>
              )}
              
              <div className="form-group">
                <label>Message {activeChannel === 'whatsapp' ? '(for template variables)' : ''}</label>
                <textarea 
                  value={messageContent} 
                  onChange={e => setMessageContent(e.target.value)}
                  placeholder={activeChannel === 'whatsapp' ? '{{1}}=John, {{2}}=ORD-123' : 'Your message here. Use {{name}} for personalization.'}
                  rows={4}
                />
              </div>
              
              <div className="form-actions">
                <button className="btn-primary" onClick={handleCreateJob} disabled={!recipients && !csvFile}>
                  Create {activeChannel.toUpperCase()} Job
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="section">
            <h2 className="section-title">Bulk Contact Operations</h2>
            <div className="bulk-contacts-form">
              <div className="form-group">
                <label>Operation</label>
                <div className="operation-buttons">
                  <button className={`op-btn ${updateMode === 'add' ? 'active' : ''}`} onClick={() => setUpdateMode('add')}>
                    ➕ Add Contacts
                  </button>
                  <button className={`op-btn ${updateMode === 'update' ? 'active' : ''}`} onClick={() => setUpdateMode('update')}>
                    ✏️ Update Contacts
                  </button>
                  <button className={`op-btn ${updateMode === 'delete' ? 'active' : ''}`} onClick={() => setUpdateMode('delete')}>
                    🗑️ Delete Contacts
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label>Upload CSV File</label>
                <input type="file" accept=".csv" onChange={e => setContactsCsv(e.target.files?.[0] || null)} />
              </div>
              
              <div className="csv-format-info">
                <h4>CSV Format:</h4>
                {updateMode === 'add' && (
                  <pre>phone,name,email,optInWhatsApp,optInSms,optInEmail
+919876543210,John Doe,john@example.com,true,false,true
+447123456789,Jane Smith,jane@example.com,true,true,false</pre>
                )}
                {updateMode === 'update' && (
                  <pre>phone,name,email,optInWhatsApp,optInSms,optInEmail
+919876543210,John Updated,john.new@example.com,true,true,true</pre>
                )}
                {updateMode === 'delete' && (
                  <pre>phone
+919876543210
+447123456789</pre>
                )}
              </div>
              
              <div className="form-actions">
                <button className="btn-primary" onClick={handleBulkContactUpdate} disabled={!contactsCsv}>
                  {updateMode === 'add' ? 'Add Contacts' : updateMode === 'update' ? 'Update Contacts' : 'Delete Contacts'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Job Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal modal-large" onClick={e => e.stopPropagation()}>
              <h2>Create {activeChannel.toUpperCase()} Bulk Job</h2>
              
              <div className="form-group">
                <label>Recipients</label>
                <textarea 
                  value={recipients} 
                  onChange={e => setRecipients(e.target.value)}
                  placeholder="One recipient per line"
                  rows={4}
                />
              </div>
              
              <div className="form-group">
                <label>Or Upload CSV</label>
                <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
              </div>
              
              {activeChannel === 'whatsapp' && (
                <div className="form-group">
                  <label>Template</label>
                  <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}>
                    <option value="">Select...</option>
                    <option value="hello_world">hello_world</option>
                    <option value="order_confirmation">order_confirmation</option>
                  </select>
                </div>
              )}
              
              {activeChannel === 'email' && (
                <div className="form-group">
                  <label>Subject</label>
                  <input type="text" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
                </div>
              )}
              
              <div className="form-group">
                <label>Message</label>
                <textarea value={messageContent} onChange={e => setMessageContent(e.target.value)} rows={4} />
              </div>
              
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleCreateJob}>Create Job</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BulkMessaging;
