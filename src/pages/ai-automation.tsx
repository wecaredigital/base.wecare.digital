/**
 * AI Automation Page
 */

import React, { useState } from 'react';
import Layout from '../components/Layout';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const AIAutomation: React.FC<PageProps> = ({ signOut, user }) => {
  const [aiEnabled, setAiEnabled] = useState(false);

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <h1 className="page-title">AI Agent</h1>
        
        <div className="ai-status-card">
          <div className="status-indicator">
            <span className={`status-dot ${aiEnabled ? 'active' : ''}`}></span>
            <span>AI Automation is {aiEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className="ai-toggle">
            <span className="toggle-label">Enable AI Responses:</span>
            <button 
              className={`toggle-btn ${aiEnabled ? 'active' : ''}`}
              onClick={() => setAiEnabled(!aiEnabled)}
            >
              {aiEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="ai-info" style={{ marginTop: '16px' }}>
            <p><strong>Knowledge Base:</strong> FZBPKGTOYE (ACTIVE)</p>
            <p><strong>Agent:</strong> HQNT0JXN8G (base-bedrock-agent)</p>
            <p><strong>Model:</strong> amazon.nova-pro-v1:0</p>
          </div>
        </div>
        
        <div className="section">
          <h2 className="section-title">How It Works</h2>
          <div style={{ lineHeight: '1.8', color: '#666' }}>
            <p>1. Customer sends a WhatsApp message</p>
            <p>2. AI queries the Knowledge Base for relevant information</p>
            <p>3. AI generates a suggested response</p>
            <p>4. Response appears below for your approval</p>
            <p>5. You approve, edit, or reject the suggestion</p>
          </div>
        </div>
        
        <div className="section">
          <h2 className="section-title">Pending Approvals</h2>
          <div className="empty-state">
            <p>No AI responses pending approval.</p>
          </div>
        </div>
        
        <div className="section">
          <h2 className="section-title">Recent AI Interactions</h2>
          <div className="empty-state">
            <p>No AI interactions yet. Enable AI automation to get started.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIAutomation;
