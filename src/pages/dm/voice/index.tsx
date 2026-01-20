/**
 * Voice DM Hub - Voice Provider Selection
 * Choose between Airtel IQ Voice and AWS Voice
 */

import React from 'react';
import Link from 'next/link';
import Layout from '../../../components/Layout';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const VOICE_PROVIDERS = [
  {
    id: 'airtel',
    name: 'Airtel IQ Voice',
    icon: '📞',
    description: 'Voice calls via Airtel IQ',
    href: '/dm/voice/airtel',
    status: 'coming',
    features: ['Outbound Calls', 'IVR', 'Call Recording', 'India Coverage'],
  },
  {
    id: 'aws',
    name: 'AWS Voice',
    icon: '☎️',
    description: 'Voice via Amazon Connect / Pinpoint',
    href: '/dm/voice/aws',
    status: 'coming',
    features: ['Amazon Connect', 'Pinpoint Voice', 'Global Coverage', 'AI Integration'],
  },
];

const VoiceDMHub: React.FC<PageProps> = ({ signOut, user }) => {
  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page">
        <div className="page-header">
          <Link href="/dm" className="back-link">← DM Hub</Link>
          <h1 className="page-title">Voice</h1>
          <p className="page-subtitle">Select voice provider</p>
        </div>

        <div className="providers-grid">
          {VOICE_PROVIDERS.map((provider) => (
            <Link key={provider.id} href={provider.href} className="provider-card">
              <div className="provider-icon">{provider.icon}</div>
              <div className="provider-info">
                <h3 className="provider-name">
                  {provider.name}
                  {provider.status === 'coming' && <span className="badge-coming">Coming Soon</span>}
                </h3>
                <p className="provider-desc">{provider.description}</p>
                <div className="provider-features">
                  {provider.features.map((f, i) => (
                    <span key={i} className="feature-tag">{f}</span>
                  ))}
                </div>
              </div>
              <span className="provider-arrow">→</span>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .page-header { margin-bottom: 24px; }
        .back-link { color: #666; text-decoration: none; font-size: 14px; }
        .back-link:hover { color: #1a1a1a; }
        .page-title { font-size: 24px; font-weight: 500; margin: 8px 0 4px 0; }
        .page-subtitle { color: #666; margin: 0; }
        .providers-grid { display: grid; gap: 16px; max-width: 600px; }
        .provider-card { display: flex; align-items: flex-start; gap: 16px; padding: 20px 24px; background: #fff; border: 1px solid #e5e5e5; border-radius: 12px; text-decoration: none; color: inherit; transition: all 0.2s; }
        .provider-card:hover { border-color: #1a1a1a; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .provider-icon { font-size: 36px; flex-shrink: 0; }
        .provider-info { flex: 1; }
        .provider-name { font-size: 18px; font-weight: 500; margin: 0 0 4px 0; display: flex; align-items: center; gap: 8px; }
        .provider-desc { font-size: 14px; color: #666; margin: 0 0 12px 0; }
        .provider-features { display: flex; flex-wrap: wrap; gap: 6px; }
        .feature-tag { font-size: 11px; background: #f5f5f5; padding: 3px 8px; border-radius: 4px; color: #666; }
        .provider-arrow { font-size: 24px; color: #ccc; align-self: center; }
        .badge-coming { font-size: 10px; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; }
      `}</style>
    </Layout>
  );
};

export default VoiceDMHub;
