/**
 * Invoice Page - Invoice Management
 * WECARE.DIGITAL Admin Platform
 */

import React from 'react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const InvoicePage: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <PageHeader 
          title="Invoice" 
          subtitle="Create and manage invoices"
          icon="invoice"
        />
        <div className="section">
          <div className="empty-state">
            <p>🧾 Invoice management coming soon</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvoicePage;
