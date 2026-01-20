/**
 * Bulk RCS - Airtel IQ
 * Bulk RCS campaigns via Airtel IQ RCS API
 */

import React from 'react';
import Link from 'next/link';
import Layout from '../../../components/Layout';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const BulkRcs: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <div className="page-header">
          <Link href="/bulk" className="back-link">← Bulk Hub</Link>
          <h1 className="page-title">Bulk RCS - Airtel IQ</h1>
          <p className="page-subtitle">Rich Communication Services campaigns</p>
        </div>

        <div className="coming-soon">
          <div className="coming-icon">💎</div>
          <h2>Coming Soon</h2>
          <p>Bulk RCS campaigns via Airtel IQ RCS API</p>
          <div className="features">
            <h3>Planned Features</h3>
            <ul>
              <li>✓ Rich media messages</li>
              <li>✓ Carousels & cards</li>
              <li>✓ Quick reply buttons</li>
              <li>✓ Read receipts</li>
            </ul>
          </div>
          <div className="docs-link">
            <a href="https://www.airtel.in/business/b2b/airtel-iq/api-docs/rcs/overview" target="_blank" rel="noopener noreferrer">
              View Airtel IQ RCS API Docs →
            </a>
          </div>
        </div>

        <style jsx>{`
          .page-header { margin-bottom: 24px; }
          .back-link { color: #666; text-decoration: none; font-size: 14px; }
          .page-title { font-size: 24px; font-weight: 500; margin: 8px 0 4px 0; }
          .page-subtitle { color: #666; margin: 0; }
          .coming-soon { text-align: center; padding: 60px 20px; max-width: 500px; margin: 0 auto; }
          .coming-icon { font-size: 64px; margin-bottom: 16px; }
          .coming-soon h2 { font-size: 24px; margin: 0 0 8px 0; }
          .coming-soon > p { color: #666; margin: 0 0 32px 0; }
          .features { background: #f9f9f9; border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 24px; }
          .features h3 { font-size: 14px; margin: 0 0 12px 0; }
          .features ul { list-style: none; padding: 0; margin: 0; }
          .features li { padding: 6px 0; font-size: 14px; }
          .docs-link a { color: #0066b3; text-decoration: none; }
        `}</style>
      </div>
    </Layout>
  );
};

export default BulkRcs;
