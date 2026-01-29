/**
 * Docs Page - Documentation
 * WECARE.DIGITAL Admin Platform
 */

import React from 'react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const DocsPage: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <PageHeader 
          title="Docs" 
          subtitle="API documentation and guides"
          icon="document"
        />
        <div className="section">
          <div className="empty-state">
            <p>📚 Documentation coming soon</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocsPage;
