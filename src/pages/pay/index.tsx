/**
 * Pay Hub - Payment Options
 */

import React from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const PayHubPage: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="pay-hub">
        <div className="pay-header">
          <h1>💳 Payment Options</h1>
          <p>Choose a payment method to send payment requests</p>
        </div>

        <div className="pay-options">
          <Link href="/pay/wa" className="pay-option whatsapp">
            <div className="option-icon">💬</div>
            <div className="option-info">
              <h3>Pay WA</h3>
              <p>WhatsApp Interactive Payment</p>
              <span className="option-desc">Send UPI payment requests via WhatsApp (India only)</span>
            </div>
            <div className="option-badge">Razorpay</div>
          </Link>

          <Link href="/pay/link" className="pay-option link">
            <div className="option-icon">🔗</div>
            <div className="option-info">
              <h3>Pay Link</h3>
              <p>Payment Link Generator</p>
              <span className="option-desc">Generate shareable payment links for any channel</span>
            </div>
            <div className="option-badge">Coming Soon</div>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .pay-hub { padding: 20px; max-width: 800px; margin: 0 auto; }
        .pay-header { margin-bottom: 32px; text-align: center; }
        .pay-header h1 { font-size: 28px; margin: 0 0 8px 0; }
        .pay-header p { color: #666; margin: 0; font-size: 16px; }
        
        .pay-options { display: flex; flex-direction: column; gap: 16px; }
        
        .pay-option { display: flex; align-items: center; gap: 20px; background: #fff; border: 2px solid #e5e7eb; border-radius: 16px; padding: 24px; text-decoration: none; color: inherit; transition: all 0.2s; }
        .pay-option:hover { border-color: #25D366; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.15); transform: translateY(-2px); }
        
        .pay-option.whatsapp { border-left: 4px solid #25D366; }
        .pay-option.link { border-left: 4px solid #3b82f6; }
        
        .option-icon { font-size: 40px; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background: #f9fafb; border-radius: 12px; }
        
        .option-info { flex: 1; }
        .option-info h3 { margin: 0 0 4px 0; font-size: 20px; color: #111; }
        .option-info p { margin: 0 0 8px 0; font-size: 14px; color: #666; font-weight: 500; }
        .option-desc { font-size: 13px; color: #9ca3af; }
        
        .option-badge { padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
        .pay-option.whatsapp .option-badge { background: #dcfce7; color: #166534; }
        .pay-option.link .option-badge { background: #dbeafe; color: #1e40af; }
        
        @media (max-width: 600px) {
          .pay-option { flex-direction: column; text-align: center; padding: 20px; }
          .option-info { text-align: center; }
        }
      `}</style>
    </Layout>
  );
};

export default PayHubPage;
