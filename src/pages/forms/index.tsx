/**
 * Forms Page - Form Builder
 * WECARE.DIGITAL Admin Platform
 */

import React from 'react';
import Layout from '../../components/Layout';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const FormsPage: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <h1 className="page-title">Forms</h1>
        <div className="section">
          <div className="empty-state">
            <p>📝 Form builder coming soon</p>
            <p className="help-text">Create and manage data collection forms</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FormsPage;
