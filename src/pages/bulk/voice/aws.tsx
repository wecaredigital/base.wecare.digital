/**
 * Bulk AWS Voice Campaigns
 * Voice campaigns via Amazon Pinpoint
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import * as api from '../../../api/client';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const TABS = ['Campaigns', 'Create', 'Templates', 'Analytics'];

const BulkAWSVoice: React.FC<PageProps> = ({ signOut, user }) => {
  const [activeTab, setActiveTab] = useState('Campaigns');
  const [jobs, setJobs] = useState<api.BulkJob[]>([]);
  const [contacts, setContacts] = useState<api.Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsData, contactsData] = await Promise.all([
        api.listBulkJobs('VOICE'),
        api.listContacts(),
      ]);
      setJobs(jobsData);
      setContacts(contactsData.filter(c => c.phone));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="voice-page">
        <div className="voice-header">
          <Link href="/bulk/voice" className="back-btn">←</Link>
          <div className="voice-header-info">
            <span className="voice-icon">☎️</span>
            <div>
              <h1>Bulk Voice - AWS Pinpoint</h1>
              <span className="voice-provider">Voice Campaigns</span>
            </div>
          </div>
        </div>

        <div className="tabs">
          {TABS.map(tab => (
            <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </div>

        <div className="main-content">
        <div className="tab-content">
          {activeTab === 'Campaigns' && (
            <div className="campaigns-section">
              {loading ? <p>Loading...</p> : jobs.length === 0 ? (
                <div className="empty-state">
                  <p>No voice campaigns yet</p>
                  <button onClick={() => setActiveTab('Create')}>Create First Campaign</button>
                </div>
              ) : (
                <div className="jobs-list">
                  {jobs.map(job => (
                    <div key={job.id} className="job-card">
                      <span className={`status-badge ${job.status.toLowerCase()}`}>{job.status}</span>
                      <div className="job-stats">
                        <div className="stat"><span className="stat-value">{job.totalRecipients}</span><span className="stat-label">Recipients</span></div>
                        <div className="stat"><span className="stat-value">{job.sentCount}</span><span className="stat-label">Completed</span></div>
                        <div className="stat"><span className="stat-value">{job.failedCount}</span><span className="stat-label">Failed</span></div>
                      </div>
                      <div className="job-date">{new Date(job.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Create' && (
            <div className="create-section">
              <div className="coming-soon">
                <h2>Create Voice Campaign</h2>
                <p>AWS Pinpoint voice campaign</p>
                <span className="badge">Coming Soon</span>
                <div className="feature-preview">
                  <h4>Campaign Options</h4>
                  <ul>
                    <li>Text-to-speech (Polly)</li>
                    <li>SSML support</li>
                    <li>Multiple voices</li>
                    <li>Schedule delivery</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Templates' && (
            <div className="coming-soon">
              <h2>Voice Templates</h2>
              <p>Polly voice templates</p>
              <span className="badge">Coming Soon</span>
            </div>
          )}

          {activeTab === 'Analytics' && (
            <div className="coming-soon">
              <h2>Campaign Analytics</h2>
              <p>Delivery and engagement metrics</p>
              <span className="badge">Coming Soon</span>
            </div>
          )}
        </div>

        <div className="info-panel">
          <h3>AWS Pinpoint Voice</h3>
          <div className="info-section">
            <h4>Features</h4>
            <ul><li>✓ Text-to-Speech</li><li>✓ Amazon Polly</li><li>✓ Global Coverage</li><li>✓ Event Tracking</li></ul>
          </div>
          <div className="info-section">
            <h4>Documentation</h4>
            <a href="https://docs.aws.amazon.com/pinpoint/latest/developerguide/send-voice-message.html" target="_blank" rel="noopener noreferrer">Pinpoint Voice Docs →</a>
          </div>
        </div>
        </div>
      </div>

      <style jsx>{`
        .voice-page { height: calc(100vh - 60px); display: flex; flex-direction: column; }
        .voice-header { display: flex; align-items: center; gap: 16px; padding: 12px 20px; background: #232f3e; color: #fff; }
        .back-btn { background: rgba(255,255,255,0.2); border: none; color: #fff; padding: 8px 12px; border-radius: 8px; cursor: pointer; text-decoration: none; }
        .voice-header-info { display: flex; align-items: center; gap: 12px; flex: 1; }
        .voice-icon { font-size: 28px; }
        .voice-header h1 { font-size: 18px; font-weight: 500; margin: 0; }
        .voice-provider { font-size: 13px; opacity: 0.9; }
        .tabs { display: flex; gap: 4px; padding: 12px 20px; background: #fff; border-bottom: 1px solid #e5e5e5; }
        .tab { background: none; border: none; padding: 8px 16px; font-size: 14px; cursor: pointer; border-radius: 6px; color: #666; }
        .tab:hover { background: #f5f5f5; }
        .tab.active { background: #ff9900; color: #000; }
        .main-content { flex: 1; display: flex; overflow: hidden; }
        .tab-content { flex: 1; padding: 24px; overflow-y: auto; }
        .info-panel { width: 280px; background: #fff; border-left: 1px solid #e5e5e5; padding: 20px; overflow-y: auto; }
        .info-panel h3 { font-size: 16px; margin: 0 0 20px 0; }
        .info-section { margin-bottom: 20px; }
        .info-section h4 { font-size: 12px; color: #666; text-transform: uppercase; margin: 0 0 8px 0; }
        .info-section ul { list-style: none; padding: 0; margin: 0; font-size: 13px; }
        .info-section li { padding: 4px 0; }
        .info-section a { color: #ff9900; text-decoration: none; font-size: 13px; }
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
        .coming-soon { text-align: center; padding: 60px 20px; }
        .coming-soon h2 { font-size: 24px; margin: 0 0 8px 0; }
        .coming-soon p { color: #666; margin: 0 0 16px 0; }
        .badge { background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 12px; }
        .feature-preview { margin-top: 32px; text-align: left; max-width: 300px; margin-left: auto; margin-right: auto; background: #f9f9f9; padding: 20px; border-radius: 12px; }
        .feature-preview h4 { font-size: 14px; margin: 0 0 12px 0; }
        .feature-preview ul { list-style: none; padding: 0; margin: 0; }
        .feature-preview li { padding: 4px 0; font-size: 13px; color: #666; }
      `}</style>
    </Layout>
  );
};

export default BulkAWSVoice;
