/**
 * Home Page - Public Landing/Promo Page
 * URL: https://base.wecare.digital/
 */

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const HomePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>WECARE.DIGITAL - Business Communication Platform</title>
      </Head>
      <div className="home-page">
        <header className="home-header">
          <div className="logo">WECARE.DIGITAL</div>
          <nav className="home-nav">
            <Link href="/access" className="nav-link">Login</Link>
          </nav>
        </header>

        <main className="home-main">
          <section className="hero">
            <h1>Business Communication Platform</h1>
            <p>WhatsApp, SMS, Email, Voice & RCS - All in One Place</p>
            <div className="hero-actions">
              <Link href="/access" className="btn-primary">Get Started</Link>
              <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
            </div>
          </section>

          <section className="features">
            <div className="feature-card">
              <span className="feature-icon">💬</span>
              <h3>WhatsApp Business</h3>
              <p>Send messages, payments, and media via WhatsApp API</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💳</span>
              <h3>Payments</h3>
              <p>Collect payments via UPI with Razorpay integration</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📱</span>
              <h3>Multi-Channel</h3>
              <p>SMS, Email, Voice calls, and RCS messaging</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⫶</span>
              <h3>Bulk Messaging</h3>
              <p>Send campaigns to thousands of contacts</p>
            </div>
          </section>
        </main>

        <footer className="home-footer">
          <p>© 2026 WECARE.DIGITAL. All rights reserved.</p>
        </footer>

        <style jsx>{`
          .home-page { min-height: 100vh; display: flex; flex-direction: column; background: #fff; }
          
          .home-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; border-bottom: 1px solid #eee; }
          .logo { font-size: 20px; font-weight: 600; color: #1a1a1a; }
          .home-nav { display: flex; gap: 20px; }
          .nav-link { color: #666; text-decoration: none; font-size: 14px; }
          .nav-link:hover { color: #1a1a1a; }
          
          .home-main { flex: 1; }
          
          .hero { text-align: center; padding: 80px 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); }
          .hero h1 { font-size: 42px; font-weight: 300; margin: 0 0 16px 0; color: #1a1a1a; }
          .hero p { font-size: 18px; color: #666; margin: 0 0 32px 0; }
          .hero-actions { display: flex; gap: 16px; justify-content: center; }
          .btn-primary { background: #1a1a1a; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; }
          .btn-primary:hover { background: #333; }
          .btn-secondary { background: #fff; color: #1a1a1a; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; border: 1px solid #ddd; }
          .btn-secondary:hover { background: #f5f5f5; }
          
          .features { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; padding: 60px 40px; max-width: 1200px; margin: 0 auto; }
          .feature-card { background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 32px; text-align: center; }
          .feature-icon { font-size: 40px; display: block; margin-bottom: 16px; }
          .feature-card h3 { font-size: 18px; margin: 0 0 8px 0; color: #1a1a1a; }
          .feature-card p { font-size: 14px; color: #666; margin: 0; }
          
          .home-footer { text-align: center; padding: 24px; border-top: 1px solid #eee; color: #999; font-size: 13px; }
          
          @media (max-width: 900px) {
            .features { grid-template-columns: repeat(2, 1fr); }
            .hero h1 { font-size: 32px; }
          }
          @media (max-width: 600px) {
            .features { grid-template-columns: 1fr; }
            .hero-actions { flex-direction: column; }
            .home-header { padding: 16px 20px; }
          }
        `}</style>
      </div>
    </>
  );
};

export default HomePage;
