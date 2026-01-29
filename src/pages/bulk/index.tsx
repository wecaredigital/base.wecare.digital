/**
 * Bulk Messaging Hub
 * Overview of all bulk messaging channels
 */

import React from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const CHANNELS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Bulk',
    icon: '💬',
    description: 'Bulk WhatsApp via AWS EUM Social',
    href: '/bulk/whatsapp',
    status: 'active',
  },
  {
    id: 'sms',
    name: 'SMS Bulk',
    icon: '📱',
    description: 'Bulk SMS via Airtel IQ',
    href: '/bulk/sms',
    status: 'active',
  },
  {
    id: 'ses',
    name: 'Email Bulk',
    icon: '✉️',
    description: 'Bulk Email via AWS SES',
    href: '/bulk/ses',
    status: 'active',
  },
  {
    id: 'voice',
    name: 'Voice Bulk',
    icon: '📞',
    description: 'Bulk Voice via Airtel IQ & AWS',
    href: '/bulk/voice',
    status: 'coming',
  },
  {
    id: 'rcs',
    name: 'RCS Bulk',
    icon: '💎',
    description: 'Bulk RCS via Airtel IQ',
    href: '/bulk/rcs',
    status: 'coming',
  },
];

const BulkHub: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <PageHeader 
          title="Bulk Messaging" 
          subtitle="Send messages to multiple recipients"
          icon="bulk"
        />

        <div className="channels-grid">
          {CHANNELS.map((channel) => (
            <Link key={channel.id} href={channel.href} className="channel-card">
              <div className="channel-icon">{channel.icon}</div>
              <div className="channel-info">
                <h3 className="channel-name">
                  {channel.name}
                  {channel.status === 'coming' && <span className="badge-coming">Coming Soon</span>}
                </h3>
                <p className="channel-desc">{channel.description}</p>
              </div>
              <span className="channel-arrow">→</span>
            </Link>
          ))}
        </div>

        <style jsx>{`
          .channels-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 16px;
          }
          .channel-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px 24px;
            background: #fff;
            border: 1px solid #e5e5e5;
            border-radius: 12px;
            text-decoration: none;
            color: inherit;
            transition: all 0.2s;
          }
          .channel-card:hover {
            border-color: #1a1a1a;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
          .channel-icon {
            font-size: 32px;
            flex-shrink: 0;
          }
          .channel-info {
            flex: 1;
          }
          .channel-name {
            font-size: 16px;
            font-weight: 500;
            margin: 0 0 4px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .channel-desc {
            font-size: 13px;
            color: #666;
            margin: 0;
          }
          .channel-arrow {
            font-size: 20px;
            color: #ccc;
          }
          .badge-coming {
            font-size: 10px;
            background: #fef3c7;
            color: #92400e;
            padding: 2px 6px;
            border-radius: 4px;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default BulkHub;
