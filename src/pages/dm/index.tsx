/**
 * DM Hub - Direct Messaging Overview
 * Links to all messaging channels
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
    name: 'WhatsApp',
    icon: '💬',
    description: 'AWS End User Messaging Social',
    href: '/dm/whatsapp',
    status: 'active',
    accounts: ['WECARE.DIGITAL (+91 93309 94400)', 'Manish Agarwal (+91 99033 00044)'],
  },
  {
    id: 'sms',
    name: 'SMS',
    icon: '📱',
    description: 'Airtel IQ SMS Gateway',
    href: '/dm/sms',
    status: 'active',
    accounts: ['Airtel IQ Account'],
  },
  {
    id: 'ses',
    name: 'Email (SES)',
    icon: '✉️',
    description: 'AWS Simple Email Service',
    href: '/dm/ses',
    status: 'active',
    accounts: ['noreply@wecare.digital'],
  },
  {
    id: 'voice',
    name: 'Voice',
    icon: '📞',
    description: 'Airtel IQ Voice Calls',
    href: '/dm/voice',
    status: 'coming',
    accounts: ['Airtel IQ Voice'],
  },
  {
    id: 'rcs',
    name: 'RCS',
    icon: '💎',
    description: 'Airtel IQ Rich Communication',
    href: '/dm/rcs',
    status: 'coming',
    accounts: ['Airtel IQ RCS'],
  },
];

const DMHub: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <PageHeader 
          title="Direct Messaging" 
          subtitle="Send messages across all channels"
          icon="message"
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
                <div className="channel-accounts">
                  {channel.accounts.map((acc, i) => (
                    <span key={i} className="account-badge">{acc}</span>
                  ))}
                </div>
              </div>
              <span className="channel-arrow">→</span>
            </Link>
          ))}
        </div>

        <style jsx>{`
          .channels-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
          .channel-card { display: flex; align-items: center; gap: 16px; padding: 20px 24px; background: #fff; border: 1px solid #e5e5e5; border-radius: 12px; text-decoration: none; color: inherit; transition: all 0.2s; }
          .channel-card:hover { border-color: #1a1a1a; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .channel-icon { font-size: 32px; flex-shrink: 0; }
          .channel-info { flex: 1; }
          .channel-name { font-size: 16px; font-weight: 500; margin: 0 0 4px 0; display: flex; align-items: center; gap: 8px; }
          .channel-desc { font-size: 13px; color: #666; margin: 0 0 8px 0; }
          .channel-accounts { display: flex; flex-wrap: wrap; gap: 4px; }
          .account-badge { font-size: 11px; background: #f5f5f5; padding: 2px 8px; border-radius: 4px; color: #666; }
          .channel-arrow { font-size: 20px; color: #ccc; }
          .badge-coming { font-size: 10px; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; }
        `}</style>
      </div>
    </Layout>
  );
};

export default DMHub;
