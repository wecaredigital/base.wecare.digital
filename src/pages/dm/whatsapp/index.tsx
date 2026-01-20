/**
 * WhatsApp DM - WABA Selection
 * Select which WhatsApp Business Account to use
 */

import React from 'react';
import Link from 'next/link';
import Layout from '../../../components/Layout';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const WABA_ACCOUNTS = [
  {
    id: 'waba1',
    waId: 'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54',
    name: 'WECARE.DIGITAL',
    phone: '+91 93309 94400',
    qualityRating: 'GREEN',
    status: 'active',
    messagesLimit: '1000/day',
    metaWabaId: 'waba-0aae9cf04cf24c66960f291c793359b4',
  },
  {
    id: 'waba2',
    waId: 'phone-number-id-1447bc72d1b040f4bf2341c9e04b2e06',
    name: 'Manish Agarwal',
    phone: '+91 99033 00044',
    qualityRating: 'GREEN',
    status: 'active',
    messagesLimit: '1000/day',
    metaWabaId: 'waba-9bbe054d8404487397c38a9d197bc44a',
  },
];

const WhatsAppHub: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">💬 WhatsApp Business</h1>
          <Link href="/dm" className="btn-secondary">← Back to DM</Link>
        </div>

        <p className="page-subtitle">Select a WhatsApp Business Account to view conversations</p>

        <div className="waba-grid">
          {WABA_ACCOUNTS.map((waba) => (
            <Link 
              key={waba.id} 
              href={`/dm/whatsapp/${encodeURIComponent(waba.waId)}`}
              className="waba-card"
            >
              <div className="waba-header">
                <div className="waba-avatar">{waba.name.charAt(0)}</div>
                <div className="waba-status">
                  <span className={`status-dot ${waba.status}`}></span>
                  {waba.qualityRating}
                </div>
              </div>
              <h3 className="waba-name">{waba.name}</h3>
              <p className="waba-phone">{waba.phone}</p>
              <div className="waba-meta">
                <span>Limit: {waba.messagesLimit}</span>
              </div>
              <div className="waba-id">
                <small>{waba.waId.substring(0, 30)}...</small>
              </div>
            </Link>
          ))}
        </div>

        <style jsx>{`
          .page-subtitle {
            color: #666;
            margin-bottom: 24px;
          }
          .waba-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
          }
          .waba-card {
            background: #fff;
            border: 1px solid #e5e5e5;
            border-radius: 12px;
            padding: 24px;
            text-decoration: none;
            color: inherit;
            transition: all 0.2s;
          }
          .waba-card:hover {
            border-color: #25D366;
            box-shadow: 0 4px 12px rgba(37, 211, 102, 0.15);
          }
          .waba-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }
          .waba-avatar {
            width: 48px;
            height: 48px;
            background: #25D366;
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 500;
          }
          .waba-status {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #22c55e;
            font-weight: 500;
          }
          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #22c55e;
          }
          .status-dot.inactive {
            background: #ef4444;
          }
          .waba-name {
            font-size: 18px;
            font-weight: 500;
            margin: 0 0 4px 0;
          }
          .waba-phone {
            font-size: 16px;
            color: #666;
            margin: 0 0 12px 0;
          }
          .waba-meta {
            font-size: 12px;
            color: #999;
            margin-bottom: 8px;
          }
          .waba-id {
            font-size: 10px;
            color: #ccc;
            font-family: monospace;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default WhatsAppHub;
