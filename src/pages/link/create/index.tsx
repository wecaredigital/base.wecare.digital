/**
 * Link Create - Create Shareable Links
 */

import React from 'react';
import Layout from '../../../components/Layout';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const LinkCreatePage: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <h1 className="page-title">⟁ Create Link</h1>
        <div className="section">
          <div className="empty-state">
            <p>🔗 Link creation coming soon</p>
            <p className="help-text">Create shareable links for payments, forms, and more</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LinkCreatePage;
