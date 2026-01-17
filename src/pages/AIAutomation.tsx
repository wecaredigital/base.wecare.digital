/**
 * AI Automation Page
 * 
 * Requirements:
 * - 15.3: AI response suggestion display with approval/reject buttons
 * - 15.6: Feedback form for AI response quality
 */

import React, { useState, useEffect } from 'react';
import './Pages.css';

interface AIInteraction {
  interactionId: string;
  messageId: string;
  contactName?: string;
  query: string;
  response: string;
  approved: boolean | null;
  feedback?: string;
  timestamp: number;
}

const AIAutomation: React.FC = () => {
  const [interactions, setInteractions] = useState<AIInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{ interactionId: string; feedback: string } | null>(null);

  const loadInteractions = async () => {
    setIsLoading(true);
    try {
      // API call to fetch AI interactions
      setInteractions([]);
    } catch (error) {
      console.error('Failed to load interactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAIStatus = async () => {
    try {
      // API call to get AI automation status
      // const response = await fetch('/api/system-config/ai_automation_enabled');
      // setAiEnabled(response.data.value === 'true');
    } catch (error) {
      console.error('Failed to load AI status:', error);
    }
  };

  useEffect(() => {
    loadInteractions();
    loadAIStatus();
  }, []);

  const toggleAI = async () => {
    try {
      // API call to toggle AI automation
      // await fetch('/api/system-config/ai_automation_enabled', {
      //   method: 'PUT',
      //   body: JSON.stringify({ value: !aiEnabled ? 'true' : 'false' }),
      // });
      setAiEnabled(!aiEnabled);
    } catch (error) {
      console.error('Failed to toggle AI:', error);
    }
  };

  const handleApprove = async (interactionId: string) => {
    try {
      // API call to approve AI response
      // await fetch(`/api/ai-interactions/${interactionId}/approve`, { method: 'POST' });
      loadInteractions();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (interactionId: string) => {
    try {
      // API call to reject AI response
      // await fetch(`/api/ai-interactions/${interactionId}/reject`, { method: 'POST' });
      loadInteractions();
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const handleFeedback = async () => {
    if (!feedbackModal) return;
    
    try {
      // API call to submit feedback
      // await fetch(`/api/ai-interactions/${feedbackModal.interactionId}/feedback`, {
      //   method: 'POST',
      //   body: JSON.stringify({ feedback: feedbackModal.feedback }),
      // });
      setFeedbackModal(null);
      loadInteractions();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const formatTimestamp = (ts: number) => {
    return new Date(ts * 1000).toLocaleString();
  };

  const pendingInteractions = interactions.filter(i => i.approved === null);
  const processedInteractions = interactions.filter(i => i.approved !== null);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">AI Automation</h1>
        <div className="ai-toggle">
          <span className="toggle-label">AI Automation</span>
          <button
            className={`toggle-btn ${aiEnabled ? 'active' : ''}`}
            onClick={toggleAI}
          >
            {aiEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* AI Status Card */}
      <div className="ai-status-card">
        <div className="status-indicator">
          <span className={`status-dot ${aiEnabled ? 'active' : ''}`}></span>
          <span>AI Agent: {aiEnabled ? 'Active' : 'Inactive'}</span>
        </div>
        <div className="ai-info">
          <p>Bedrock Agent ID: HQNT0JXN8G</p>
          <p>Knowledge Base: FZBPKGTOYE</p>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="section">
        <h2 className="section-title">
          Pending Approvals
          {pendingInteractions.length > 0 && (
            <span className="badge badge-yellow">{pendingInteractions.length}</span>
          )}
        </h2>
        
        {pendingInteractions.length === 0 ? (
          <div className="empty-state">
            <p>No pending AI responses to review.</p>
          </div>
        ) : (
          <div className="interactions-list">
            {pendingInteractions.map((interaction) => (
              <div key={interaction.interactionId} className="interaction-card pending">
                <div className="interaction-header">
                  <span className="interaction-contact">
                    {interaction.contactName || 'Unknown Contact'}
                  </span>
                  <span className="interaction-time">
                    {formatTimestamp(interaction.timestamp)}
                  </span>
                </div>
                
                <div className="interaction-query">
                  <label>Customer Message:</label>
                  <p>{interaction.query}</p>
                </div>
                
                <div className="interaction-response">
                  <label>AI Suggested Response:</label>
                  <p>{interaction.response}</p>
                </div>
                
                <div className="interaction-actions">
                  <button
                    className="btn-success"
                    onClick={() => handleApprove(interaction.interactionId)}
                  >
                    ✓ Approve & Send
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleReject(interaction.interactionId)}
                  >
                    ✗ Reject
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setFeedbackModal({ interactionId: interaction.interactionId, feedback: '' })}
                  >
                    📝 Feedback
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Interactions */}
      <div className="section">
        <h2 className="section-title">Recent Activity</h2>
        
        {processedInteractions.length === 0 ? (
          <div className="empty-state">
            <p>No processed interactions yet.</p>
          </div>
        ) : (
          <div className="interactions-list">
            {processedInteractions.slice(0, 10).map((interaction) => (
              <div
                key={interaction.interactionId}
                className={`interaction-card ${interaction.approved ? 'approved' : 'rejected'}`}
              >
                <div className="interaction-header">
                  <span className="interaction-contact">
                    {interaction.contactName || 'Unknown Contact'}
                  </span>
                  <span className={`status-badge ${interaction.approved ? 'status-green' : 'status-red'}`}>
                    {interaction.approved ? 'Approved' : 'Rejected'}
                  </span>
                  <span className="interaction-time">
                    {formatTimestamp(interaction.timestamp)}
                  </span>
                </div>
                
                <div className="interaction-query">
                  <label>Query:</label>
                  <p>{interaction.query}</p>
                </div>
                
                <div className="interaction-response">
                  <label>Response:</label>
                  <p>{interaction.response}</p>
                </div>
                
                {interaction.feedback && (
                  <div className="interaction-feedback">
                    <label>Feedback:</label>
                    <p>{interaction.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Provide Feedback</h2>
            <p className="modal-description">
              Help improve AI responses by providing feedback on this suggestion.
            </p>
            
            <div className="form-group">
              <label>Your Feedback</label>
              <textarea
                placeholder="What could be improved about this response?"
                value={feedbackModal.feedback}
                onChange={(e) => setFeedbackModal({ ...feedbackModal, feedback: e.target.value })}
                rows={4}
              />
            </div>
            
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setFeedbackModal(null)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleFeedback}>
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAutomation;
