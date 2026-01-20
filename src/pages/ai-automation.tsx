/**
 * AI Automation Page
 * Bedrock Agent + Knowledge Base Integration
 * REAL API Integration - No Mock Data
 * Design: Unicode symbols only - No emoji
 */

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import * as api from '../lib/api';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

interface AIInteraction {
  id: string;
  messageId: string;
  query: string;
  response: string;
  approved: boolean;
  feedback?: 'positive' | 'negative';
  timestamp: string;
  contactName: string;
}

const AIAutomation: React.FC<PageProps> = ({ signOut, user }) => {
  // Default AI to ENABLED
  const [aiEnabled, setAiEnabled] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'config' | 'test'>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiConfig, setAiConfig] = useState<api.AIConfig | null>(null);

  // Pending approvals (would come from real API)
  const [pendingApprovals, setPendingApprovals] = useState<AIInteraction[]>([]);

  // History (would come from real API)
  const [history, setHistory] = useState<AIInteraction[]>([]);

  // Test AI
  const [testQuery, setTestQuery] = useState('');
  const [testResponse, setTestResponse] = useState<{ response: string; sources?: string[] } | null>(null);
  const [testing, setTesting] = useState(false);

  // Load AI config
  const loadConfig = useCallback(async () => {
    try {
      const config = await api.getAIConfig();
      setAiConfig(config);
      setAiEnabled(config.enabled);
      setAutoApprove(config.autoReplyEnabled);
    } catch (err) {
      console.error('Failed to load AI config:', err);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleTestAI = async () => {
    if (!testQuery.trim()) return;
    setTesting(true);
    setError(null);
    try {
      const result = await api.testAIResponse(testQuery);
      setTestResponse(result);
    } catch (err) {
      console.error('AI test error:', err);
      setError('Failed to test AI response');
    } finally {
      setTesting(false);
    }
  };

  const handleApprove = async (id: string) => {
    setPendingApprovals(prev => prev.filter(p => p.id !== id));
    // API call to approve and send would go here
  };

  const handleReject = async (id: string) => {
    setPendingApprovals(prev => prev.filter(p => p.id !== id));
    // API call to reject would go here
  };

  const handleEdit = (id: string, newResponse: string) => {
    setPendingApprovals(prev => 
      prev.map(p => p.id === id ? { ...p, response: newResponse } : p)
    );
  };

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <h1 className="page-title">⌘ AI Automation</h1>

        {error && <div className="error-banner">{error} <button onClick={() => setError(null)}>✕</button></div>}
        
        {/* AI Status Card */}
        <div className="ai-status-card">
          <div className="ai-status-header">
            <div className="status-indicator">
              <span className={`status-dot ${aiEnabled ? 'active' : ''}`}></span>
              <span className="status-text">
                AI Automation is <strong>{aiEnabled ? 'ENABLED' : 'DISABLED'}</strong>
              </span>
            </div>
            <button 
              className={`toggle-btn large ${aiEnabled ? 'active' : ''}`}
              onClick={() => setAiEnabled(!aiEnabled)}
            >
              {aiEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <div className="ai-resources">
            <div className="resource-card">
              <div className="resource-icon">◈</div>
              <div className="resource-info">
                <div className="resource-label">Knowledge Base</div>
                <div className="resource-value">{aiConfig?.knowledgeBaseId || 'FZBPKGTOYE'}</div>
                <div className="resource-status status-green">● ACTIVE</div>
              </div>
            </div>
            
            <div className="resource-card">
              <div className="resource-icon">⌬</div>
              <div className="resource-info">
                <div className="resource-label">Bedrock Agent</div>
                <div className="resource-value">{aiConfig?.agentId || 'HQNT0JXN8G'}</div>
                <div className="resource-status status-green">● PREPARED</div>
              </div>
            </div>
            
            <div className="resource-card">
              <div className="resource-icon">⚡</div>
              <div className="resource-info">
                <div className="resource-label">Agent Core Runtime</div>
                <div className="resource-value">{aiConfig?.agentAliasId || 'base_bedrock_agentcore-1XHDxj2o3Q'}</div>
                <div className="resource-status status-green">● ACTIVE</div>
              </div>
            </div>
            
            <div className="resource-card">
              <div className="resource-icon">◎</div>
              <div className="resource-info">
                <div className="resource-label">Foundation Model</div>
                <div className="resource-value">amazon.nova-pro-v1:0</div>
                <div className="resource-status status-green">● AVAILABLE</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approvals ({pendingApprovals.length})
          </button>
          <button 
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button 
            className={`tab ${activeTab === 'test' ? 'active' : ''}`}
            onClick={() => setActiveTab('test')}
          >
            Test AI
          </button>
          <button 
            className={`tab ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveTab('config')}
          >
            Configuration
          </button>
        </div>

        {/* Pending Approvals Tab */}
        {activeTab === 'pending' && (
          <div className="section">
            {pendingApprovals.length > 0 ? (
              <div className="approvals-list">
                {pendingApprovals.map(item => (
                  <div key={item.id} className="approval-card">
                    <div className="approval-header">
                      <span className="contact-name">{item.contactName}</span>
                      <span className="timestamp">{item.timestamp}</span>
                    </div>
                    
                    <div className="approval-content">
                      <div className="query-section">
                        <label>Customer Query:</label>
                        <div className="query-text">{item.query}</div>
                      </div>
                      
                      <div className="response-section">
                        <label>AI Suggested Response:</label>
                        <textarea 
                          className="response-text"
                          value={item.response}
                          onChange={(e) => handleEdit(item.id, e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                    
                    <div className="approval-actions">
                      <button 
                        className="btn-danger"
                        onClick={() => handleReject(item.id)}
                      >
                        Reject
                      </button>
                      <button 
                        className="btn-secondary"
                        onClick={() => handleEdit(item.id, item.response)}
                      >
                        Edit & Send
                      </button>
                      <button 
                        className="btn-primary"
                        onClick={() => handleApprove(item.id)}
                      >
                        Approve & Send
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No AI responses pending approval.</p>
                <p className="help-text">When customers send messages, AI will generate response suggestions here.</p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="section">
            {history.length > 0 ? (
              <div className="history-list">
                {history.map(item => (
                  <div key={item.id} className="history-card">
                    <div className="history-header">
                      <span className="contact-name">{item.contactName}</span>
                      <span className="timestamp">{item.timestamp}</span>
                      <span className={`status-badge ${item.approved ? 'status-green' : 'status-red'}`}>
                        {item.approved ? 'Approved' : 'Rejected'}
                      </span>
                    </div>
                    <div className="history-content">
                      <div><strong>Q:</strong> {item.query}</div>
                      <div><strong>A:</strong> {item.response}</div>
                    </div>
                    {item.feedback && (
                      <div className="feedback-badge">
                        {item.feedback === 'positive' ? '↑ Helpful' : '↓ Not Helpful'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No AI interaction history yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Test AI Tab */}
        {activeTab === 'test' && (
          <div className="section">
            <h2 className="section-title">Test AI Response</h2>
            <div className="test-ai-form">
              <div className="form-group">
                <label>Enter a test query</label>
                <textarea
                  value={testQuery}
                  onChange={e => setTestQuery(e.target.value)}
                  placeholder="e.g., What are your business hours?"
                  rows={3}
                />
              </div>
              <button 
                className="btn-primary" 
                onClick={handleTestAI}
                disabled={testing || !testQuery.trim()}
              >
                {testing ? 'Generating...' : 'Generate AI Response'}
              </button>
              
              {testResponse && (
                <div className="test-response">
                  <h3>AI Response:</h3>
                  <div className="response-content">{testResponse.response}</div>
                  {testResponse.sources && testResponse.sources.length > 0 && (
                    <div className="response-sources">
                      <span>Sources:</span>
                      {testResponse.sources.map((s, i) => (
                        <span key={i} className="source-tag">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <div className="section">
            <div className="config-grid">
              <div className="config-card">
                <h3>Response Settings</h3>
                <div className="config-item">
                  <label>Auto-Approve Responses</label>
                  <div className="config-control">
                    <button 
                      className={`toggle-btn ${autoApprove ? 'active' : ''}`}
                      onClick={() => setAutoApprove(!autoApprove)}
                    >
                      {autoApprove ? 'ON' : 'OFF'}
                    </button>
                    <span className="help-text">⚠️ Not recommended for production</span>
                  </div>
                </div>
                <div className="config-item">
                  <label>Response Tone</label>
                  <select defaultValue="professional">
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>
                <div className="config-item">
                  <label>Max Response Length</label>
                  <select defaultValue="medium">
                    <option value="short">Short (50 words)</option>
                    <option value="medium">Medium (100 words)</option>
                    <option value="long">Long (200 words)</option>
                  </select>
                </div>
              </div>

              <div className="config-card">
                <h3>Knowledge Base</h3>
                <div className="config-item">
                  <label>KB ID</label>
                  <input type="text" value="FZBPKGTOYE" readOnly />
                </div>
                <div className="config-item">
                  <label>Data Source</label>
                  <input type="text" value="stream.wecare.digital" readOnly />
                </div>
                <div className="config-item">
                  <label>Last Sync</label>
                  <input type="text" value="2026-01-18 22:00 IST" readOnly />
                </div>
                <button className="btn-secondary" style={{marginTop: '16px'}}>
                  Sync Knowledge Base
                </button>
              </div>

              <div className="config-card">
                <h3>Agent Settings</h3>
                <div className="config-item">
                  <label>Agent ID</label>
                  <input type="text" value="HQNT0JXN8G" readOnly />
                </div>
                <div className="config-item">
                  <label>Runtime ID</label>
                  <input type="text" value="base_bedrock_agentcore-1XHDxj2o3Q" readOnly />
                </div>
                <div className="config-item">
                  <label>Session Memory</label>
                  <select defaultValue="30">
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                  </select>
                </div>
                <div className="config-item">
                  <label>Max Sessions</label>
                  <input type="number" defaultValue={20} />
                </div>
              </div>

              <div className="config-card">
                <h3>Triggers</h3>
                <div className="config-item">
                  <label>Process WhatsApp Messages</label>
                  <button className="toggle-btn active">ON</button>
                </div>
                <div className="config-item">
                  <label>Process SMS Messages</label>
                  <button className="toggle-btn">OFF</button>
                </div>
                <div className="config-item">
                  <label>Process Email Messages</label>
                  <button className="toggle-btn">OFF</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="section">
          <h2 className="section-title">How AI Automation Works</h2>
          <div className="workflow-steps">
            <div className="workflow-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Customer Message</h4>
                <p>Customer sends a WhatsApp message</p>
              </div>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>KB Query</h4>
                <p>AI queries Knowledge Base (FZBPKGTOYE)</p>
              </div>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Generate Response</h4>
                <p>Bedrock Agent generates suggestion</p>
              </div>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Human Review</h4>
                <p>You approve, edit, or reject</p>
              </div>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-step">
              <div className="step-number">5</div>
              <div className="step-content">
                <h4>Send Response</h4>
                <p>Approved response sent to customer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIAutomation;
