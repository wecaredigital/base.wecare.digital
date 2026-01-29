/**
 * Forms Page - Form Builder
 * WECARE.DIGITAL Admin Platform
 */

import React from 'react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const FormsPage: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <PageHeader 
          title="Forms" 
          subtitle="Create and manage data collection forms"
          icon="form"
        />
        <div className="section">
          <div className="empty-state">
            <p>✎ Form builder coming soon</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FormsPage;
