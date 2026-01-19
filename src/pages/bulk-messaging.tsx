/**
 * Bulk Messaging Page
 */

import React, { useState } from 'react';
import Layout from '../components/Layout';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const BulkMessaging: React.FC<PageProps> = ({ signOut, user }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Bulk Messaging</h1>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + New Bulk Job
          </button>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Total Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Running</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">0%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
        
        <div className="section">
          <h2 className="section-title">Recent Jobs</h2>
          <div className="empty-state">
            <p>No bulk jobs found. Create your first bulk messaging job.</p>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal modal-large" onClick={e => e.stopPropagation()}>
              <h2>Create Bulk Job</h2>
              <div className="form-group">
                <label>Channel</label>
                <select>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div className="form-group">
                <label>Recipients (CSV)</label>
                <input type="file" accept=".csv" />
                <div className="help-text">Upload a CSV file with phone numbers or emails</div>
              </div>
              <div className="form-group">
                <label>Message Template</label>
                <textarea rows={4} placeholder="Hello {{name}}, ..."></textarea>
                <div className="help-text">Use {"{{name}}"} for personalization</div>
              </div>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-primary">Create Job</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BulkMessaging;
