/**
 * RCS DM - Airtel IQ RCS
 * Rich Communication Services via Airtel IQ
 */

import React from 'react';
import Layout from '../../../components/Layout';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const RcsDM: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <div className="page-header">
          <a href="/dm" className="btn-secondary">← Back to DM</a>
          <h1 className="page-title">💎 RCS - Airtel IQ</h1>
        </div>

        <div className="coming-soon-card">
          <div className="coming-icon">💎</div>
          <h2>RCS Messaging Coming Soon</h2>
          <p>Airtel IQ RCS integration is under development.</p>
          
          <div className="features-preview">
            <h3>Planned Features</h3>
            <ul>
              <li>✓ Rich Media Messages</li>
              <li>✓ Carousels & Cards</li>
              <li>✓ Quick Reply Buttons</li>
              <li>✓ Suggested Actions</li>
              <li>✓ Branded Messaging</li>
              <li>✓ Read Receipts</li>
              <li>✓ Typing Indicators</li>
            </ul>
          </div>

          <div className="api-docs">
            <h3>API Documentation</h3>
            <a 
              href="https://www.airtel.in/business/b2b/airtel-iq/api-docs/rcs/overview" 
              target="_blank" 
              rel="noopener noreferrer"
              className="doc-link"
            >
              Airtel IQ RCS API Docs →
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .coming-soon-card {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 48px;
          text-align: center;
          max-width: 500px;
          margin: 40px auto;
        }
        .coming-icon {
          font-size: 64px;
          margin-bottom: 24px;
        }
        .coming-soon-card h2 {
          font-size: 24px;
          font-weight: 500;
          margin: 0 0 12px 0;
        }
        .coming-soon-card p {
          color: #666;
          margin: 0 0 32px 0;
        }
        .features-preview {
          text-align: left;
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        .features-preview h3 {
          font-size: 14px;
          font-weight: 500;
          margin: 0 0 12px 0;
        }
        .features-preview ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .features-preview li {
          padding: 6px 0;
          font-size: 14px;
          color: #666;
        }
        .api-docs {
          text-align: left;
        }
        .api-docs h3 {
          font-size: 14px;
          font-weight: 500;
          margin: 0 0 8px 0;
        }
        .doc-link {
          color: #0066b3;
          text-decoration: none;
          font-size: 14px;
        }
        .doc-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </Layout>
  );
};

export default RcsDM;
