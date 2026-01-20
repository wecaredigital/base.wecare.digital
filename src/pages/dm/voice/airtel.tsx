/**
 * Airtel IQ Voice DM
 * Voice calls via Airtel IQ Voice API
 */

import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '../../../components/Layout';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const TABS = ['Overview', 'Click-to-Call', 'IVR', 'Call Logs'];

const AirtelVoiceDM: React.FC<PageProps> = ({ signOut, user }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="voice-page">
        <div className="voice-header">
          <Link href="/dm/voice" className="back-btn">←</Link>
          <div className="voice-header-info">
            <span className="voice-icon">📞</span>
            <div>
              <h1>Airtel IQ Voice</h1>
              <span className="voice-provider">Voice API for India</span>
            </div>
          </div>
        </div>

        <div className="tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === 'Overview' && (
            <div className="overview">
              <div className="status-card">
                <h3>API Status</h3>
                <div className="status-row">
                  <span className="status-dot coming"></span>
                  <span>Integration Pending</span>
                </div>
              </div>
              <div className="features-card">
                <h3>Features</h3>
                <ul>
                  <li>✓ Outbound Voice Calls</li>
                  <li>✓ Click-to-Call Widget</li>
                  <li>✓ IVR Builder</li>
                  <li>✓ Call Recording</li>
                  <li>✓ Call Analytics</li>
                  <li>✓ DND Compliance</li>
                </ul>
              </div>
              <div className="docs-card">
                <h3>Documentation</h3>
                <a href="https://www.airtel.in/business/b2b/airtel-iq/api-docs/voice/callflow-component-apis" target="_blank" rel="noopener noreferrer">
                  Airtel IQ Voice API Docs →
                </a>
              </div>
            </div>
          )}

          {activeTab === 'Click-to-Call' && (
            <div className="coming-soon">
              <h2>Click-to-Call</h2>
              <p>Initiate calls directly from the dashboard</p>
              <span className="badge">Coming Soon</span>
            </div>
          )}

          {activeTab === 'IVR' && (
            <div className="coming-soon">
              <h2>IVR Builder</h2>
              <p>Create interactive voice response flows</p>
              <span className="badge">Coming Soon</span>
            </div>
          )}

          {activeTab === 'Call Logs' && (
            <div className="coming-soon">
              <h2>Call Logs</h2>
              <p>View call history and recordings</p>
              <span className="badge">Coming Soon</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .voice-page { height: calc(100vh - 60px); display: flex; flex-direction: column; }
        .voice-header { display: flex; align-items: center; gap: 16px; padding: 12px 20px; background: #e31837; color: #fff; }
        .back-btn { background: rgba(255,255,255,0.2); border: none; color: #fff; padding: 8px 12px; border-radius: 8px; cursor: pointer; text-decoration: none; }
        .voice-header-info { display: flex; align-items: center; gap: 12px; flex: 1; }
        .voice-icon { font-size: 28px; }
        .voice-header h1 { font-size: 18px; font-weight: 500; margin: 0; }
        .voice-provider { font-size: 13px; opacity: 0.9; }
        .tabs { display: flex; gap: 4px; padding: 12px 20px; background: #fff; border-bottom: 1px solid #e5e5e5; }
        .tab { background: none; border: none; padding: 8px 16px; font-size: 14px; cursor: pointer; border-radius: 6px; color: #666; }
        .tab:hover { background: #f5f5f5; }
        .tab.active { background: #1a1a1a; color: #fff; }
        .tab-content { flex: 1; padding: 24px; overflow-y: auto; }
        .overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .status-card, .features-card, .docs-card { background: #fff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 20px; }
        .status-card h3, .features-card h3, .docs-card h3 { font-size: 14px; margin: 0 0 16px 0; color: #666; text-transform: uppercase; }
        .status-row { display: flex; align-items: center; gap: 8px; }
        .status-dot { width: 10px; height: 10px; border-radius: 50%; }
        .status-dot.coming { background: #fbbf24; }
        .features-card ul { list-style: none; padding: 0; margin: 0; }
        .features-card li { padding: 6px 0; font-size: 14px; }
        .docs-card a { color: #e31837; text-decoration: none; font-size: 14px; }
        .coming-soon { text-align: center; padding: 60px 20px; }
        .coming-soon h2 { font-size: 24px; margin: 0 0 8px 0; }
        .coming-soon p { color: #666; margin: 0 0 16px 0; }
        .badge { background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 12px; }
      `}</style>
    </Layout>
  );
};

export default AirtelVoiceDM;
