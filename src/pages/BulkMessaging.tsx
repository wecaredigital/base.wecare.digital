/**
 * Bulk Messaging Page
 * 
 * Requirements:
 * - 8.1: Confirmation dialog for >20 recipients
 * - 8.6: Progress tracking display
 * - 8.7: Job control buttons (pause/resume/cancel)
 */

import React, { useState, useEffect } from 'react';
import './Pages.css';

interface BulkJob {
  jobId: string;
  channel: 'whatsapp' | 'sms' | 'email';
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  status: 'pending' | 'processing' | 'paused' | 'completed' | 'cancelled';
  createdAt: number;
}

const BulkMessaging: React.FC = () => {
  const [jobs, setJobs] = useState<BulkJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    channel: 'whatsapp' as 'whatsapp' | 'sms' | 'email',
    recipients: '',
    content: '',
    templateName: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      // API call to fetch bulk jobs
      setJobs([]);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    // Poll for updates every 5 seconds
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async () => {
    const recipientList = formData.recipients
      .split('\n')
      .map(r => r.trim())
      .filter(r => r);

    if (recipientList.length === 0) {
      alert('Please enter at least one recipient');
      return;
    }

    // Requirement 8.1: Confirmation for >20 recipients
    if (recipientList.length > 20) {
      const confirmed = confirm(
        `You are about to send messages to ${recipientList.length} recipients. ` +
        `This action cannot be undone. Are you sure you want to proceed?`
      );
      if (!confirmed) return;
    }

    setIsCreating(true);
    try {
      // API call to create bulk job
      // await fetch('/api/bulk-jobs', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     channel: formData.channel,
      //     recipients: recipientList,
      //     content: formData.content,
      //     templateName: formData.templateName,
      //     confirmed: recipientList.length > 20,
      //   }),
      // });
      
      setShowCreateForm(false);
      setFormData({ channel: 'whatsapp', recipients: '', content: '', templateName: '' });
      loadJobs();
    } catch (error) {
      console.error('Failed to create bulk job:', error);
      alert('Failed to create bulk job');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJobControl = async (jobId: string, action: 'pause' | 'resume' | 'cancel') => {
    if (action === 'cancel') {
      const confirmed = confirm('Are you sure you want to cancel this job? This cannot be undone.');
      if (!confirmed) return;
    }

    try {
      // API call to control job
      // await fetch(`/api/bulk-jobs/${jobId}/${action}`, { method: 'POST' });
      loadJobs();
    } catch (error) {
      console.error(`Failed to ${action} job:`, error);
    }
  };

  const getProgressPercent = (job: BulkJob) => {
    const processed = job.sentCount + job.failedCount;
    return job.totalRecipients > 0 ? Math.round((processed / job.totalRecipients) * 100) : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'processing': return 'blue';
      case 'paused': return 'yellow';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Bulk Messaging</h1>
        <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
          + New Bulk Job
        </button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <h2>Create Bulk Message Job</h2>
            
            <div className="form-group">
              <label>Channel</label>
              <select
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="form-group">
              <label>Recipients (one contact ID per line)</label>
              <textarea
                placeholder="Enter contact IDs, one per line..."
                value={formData.recipients}
                onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                rows={6}
              />
              <div className="help-text">
                {formData.recipients.split('\n').filter(r => r.trim()).length} recipients
              </div>
            </div>

            <div className="form-group">
              <label>Message Content</label>
              <textarea
                placeholder="Type your message..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
            </div>

            {formData.channel === 'whatsapp' && (
              <div className="form-group">
                <label>Template Name (optional, for outside 24h window)</label>
                <input
                  type="text"
                  placeholder="e.g., hello_world"
                  value={formData.templateName}
                  onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                />
              </div>
            )}

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Job'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="section">
        <h2 className="section-title">Bulk Jobs</h2>
        
        {isLoading && jobs.length === 0 ? (
          <div className="loading">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <p>No bulk jobs yet. Create your first bulk messaging job above.</p>
          </div>
        ) : (
          <div className="jobs-list">
            {jobs.map((job) => (
              <div key={job.jobId} className="job-card">
                <div className="job-header">
                  <span className="job-id">Job #{job.jobId.slice(0, 8)}</span>
                  <span className={`status-badge status-${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                
                <div className="job-details">
                  <div className="job-stat">
                    <span className="stat-label">Channel</span>
                    <span className="stat-value">{job.channel.toUpperCase()}</span>
                  </div>
                  <div className="job-stat">
                    <span className="stat-label">Total</span>
                    <span className="stat-value">{job.totalRecipients}</span>
                  </div>
                  <div className="job-stat">
                    <span className="stat-label">Sent</span>
                    <span className="stat-value text-green">{job.sentCount}</span>
                  </div>
                  <div className="job-stat">
                    <span className="stat-label">Failed</span>
                    <span className="stat-value text-red">{job.failedCount}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="progress-container">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${getProgressPercent(job)}%` }}
                    />
                  </div>
                  <span className="progress-text">{getProgressPercent(job)}%</span>
                </div>

                {/* Job Controls */}
                {(job.status === 'processing' || job.status === 'paused' || job.status === 'pending') && (
                  <div className="job-controls">
                    {job.status === 'processing' && (
                      <button
                        className="btn-secondary btn-small"
                        onClick={() => handleJobControl(job.jobId, 'pause')}
                      >
                        ⏸️ Pause
                      </button>
                    )}
                    {job.status === 'paused' && (
                      <button
                        className="btn-secondary btn-small"
                        onClick={() => handleJobControl(job.jobId, 'resume')}
                      >
                        ▶️ Resume
                      </button>
                    )}
                    <button
                      className="btn-danger btn-small"
                      onClick={() => handleJobControl(job.jobId, 'cancel')}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkMessaging;
