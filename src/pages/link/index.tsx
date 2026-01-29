/**
 * Link Page - Link Management
 * WECARE.DIGITAL Admin Platform
 */

import React from 'react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const LinkPage: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <PageHeader 
          title="Link" 
          subtitle="Create and manage shareable links"
          icon="link"
        />
        <div className="section">
          <div className="empty-state">
            <p>🔗 Link management coming soon</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LinkPage;
