/**
 * Invoice Page - Invoice Management
 * WECARE.DIGITAL Admin Platform
 */

import React from 'react';
import Layout from '../../components/Layout';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const InvoicePage: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <h1 className="page-title">Invoice</h1>
        <div className="section">
          <div className="empty-state">
            <p>🧾 Invoice management coming soon</p>
            <p className="help-text">Create and manage invoices</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvoicePage;
