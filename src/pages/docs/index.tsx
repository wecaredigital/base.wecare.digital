/**
 * Docs Page - Documentation
 * WECARE.DIGITAL Admin Platform
 */

import React from 'react';
import Layout from '../../components/Layout';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const DocsPage: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <h1 className="page-title">Docs</h1>
        <div className="section">
          <div className="empty-state">
            <p>📚 Documentation coming soon</p>
            <p className="help-text">API documentation and guides</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocsPage;
