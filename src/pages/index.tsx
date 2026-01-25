/**
 * Home Page - Public Landing/Promo Page
 * URL: https://base.wecare.digital/
 * Modern SaaS design with white background
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const HomePage: React.FC = () => {
  const [messagesCount, setMessagesCount] = useState(0);
  const [contactsCount, setContactsCount] = useState(0);

  useEffect(() => {
    // Animate counters
    const animateCounter = (target: number, setter: (n: number) => void, duration: number) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
    };
    
    animateCounter(50000, setMessagesCount, 2000);
    animateCounter(2500, setContactsCount, 2000);
  }, []);

  return (
    <>
      <Head>
        <title>WECARE.DIGITAL - Business Communication Platform</title>
        <meta name="description" content="WhatsApp, SMS, Email, Voice & RCS - All in One Place" />
      </Head>
      <div className="landing">
        {/* Header */}
        <header className="landing-header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-mark">W</div>
              <span className="logo-text">WECARE.DIGITAL</span>
            </div>
            <nav className="header-nav">
              <Link href="#features" className="nav-item">Features</Link>
              <Link href="#stats" className="nav-item">Impact</Link>
              <Link href="/access" className="nav-btn">Login →</Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            The only communication toolkit you need
          </div>
          <h1 className="hero-title">
            Empowering businesses to<br />
            <span className="gradient-text">communicate smarter</span>
          </h1>
          <p className="hero-subtitle">
            From first message to final payment, automate every step with our modular communication suite
          </p>
          <div className="hero-cta">
            <Link href="/access" className="cta-primary">
              Get Started Free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/dashboard" className="cta-secondary">View Dashboard</Link>
          </div>
          <div className="hero-visual">
            <div className="visual-card card-1">
              <div className="card-icon">💬</div>
              <div className="card-label">WhatsApp</div>
              <div className="card-status online">Connected</div>
            </div>
            <div className="visual-card card-2">
              <div className="card-icon">💳</div>
              <div className="card-label">Payment</div>
              <div className="card-amount">₹2,450</div>
            </div>
            <div className="visual-card card-3">
              <div className="card-icon">✓</div>
              <div className="card-label">Delivered</div>
              <div className="card-time">Just now</div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="features-section" id="features">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2 className="section-title">Everything you need to scale</h2>
            <p className="section-desc">Seamlessly integrate all your communication channels in one powerful platform</p>
          </div>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon-wrap">
                <span className="feature-icon">💬</span>
              </div>
              <h3>WhatsApp Business API</h3>
              <p>Send messages, collect payments, and share media through official WhatsApp Business API</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrap">
                <span className="feature-icon">💳</span>
              </div>
              <h3>Integrated Payments</h3>
              <p>Collect payments via UPI, cards, and wallets with Razorpay integration directly in chat</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrap">
                <span className="feature-icon">📱</span>
              </div>
              <h3>Multi-Channel Messaging</h3>
              <p>SMS, Email, Voice calls, and RCS messaging from a single unified dashboard</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrap">
                <span className="feature-icon">⫶</span>
              </div>
              <h3>Bulk Campaigns</h3>
              <p>Send personalized campaigns to thousands of contacts with smart scheduling</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrap">
                <span className="feature-icon">🤖</span>
              </div>
              <h3>AI-Powered Responses</h3>
              <p>Automate customer support with intelligent AI responses powered by AWS Bedrock</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrap">
                <span className="feature-icon">📊</span>
              </div>
              <h3>Real-time Analytics</h3>
              <p>Track delivery, engagement, and conversion metrics with detailed dashboards</p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section" id="stats">
          <div className="stats-content">
            <div className="stats-text">
              <span className="section-tag">Impact</span>
              <h2>Real Results. Real Fast.</h2>
              <p>Trusted by businesses to streamline their communication workflows and scale smarter</p>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{messagesCount.toLocaleString()}+</div>
                <div className="stat-label">Messages Delivered</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{contactsCount.toLocaleString()}+</div>
                <div className="stat-label">Active Contacts</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">&lt;1s</div>
                <div className="stat-label">Avg Response Time</div>
              </div>
            </div>
          </div>
        </section>

        {/* Integration Section */}
        <section className="integration-section">
          <div className="section-header">
            <span className="section-tag">Integrations</span>
            <h2 className="section-title">Seamless Integration</h2>
            <p className="section-desc">Connect your favorite tools with a single click</p>
          </div>
          <div className="integration-logos">
            <div className="integration-item">AWS</div>
            <div className="integration-item">Razorpay</div>
            <div className="integration-item">WhatsApp</div>
            <div className="integration-item">Airtel</div>
            <div className="integration-item">SES</div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to transform your communication?</h2>
            <p>Start sending messages in minutes, not days</p>
            <Link href="/access" className="cta-primary large">
              Get Started Now
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo-mark small">W</div>
              <span>WECARE.DIGITAL</span>
            </div>
            <div className="footer-links">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/contacts">Contacts</Link>
              <Link href="/access">Login</Link>
            </div>
            <div className="footer-copy">© 2026 WECARE.DIGITAL. All rights reserved.</div>
          </div>
        </footer>

        <style jsx>{`
          .landing {
            min-height: 100vh;
            background: #fff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          /* Header */
          .landing-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            background: rgba(255,255,255,0.9);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(0,0,0,0.05);
          }
          .header-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo-section {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .logo-mark {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 700;
            font-size: 18px;
          }
          .logo-mark.small {
            width: 28px;
            height: 28px;
            font-size: 14px;
            border-radius: 8px;
          }
          .logo-text {
            font-weight: 600;
            font-size: 16px;
            color: #1a1a1a;
          }
          .header-nav {
            display: flex;
            align-items: center;
            gap: 32px;
          }
          .nav-item {
            color: #666;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: color 0.2s;
          }
          .nav-item:hover { color: #1a1a1a; }
          .nav-btn {
            background: #1a1a1a;
            color: #fff;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
          }
          .nav-btn:hover { background: #333; transform: translateY(-1px); }

          /* Hero */
          .hero-section {
            padding: 140px 24px 80px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #f5f5f5;
            padding: 8px 16px;
            border-radius: 100px;
            font-size: 13px;
            color: #666;
            margin-bottom: 24px;
          }
          .badge-dot {
            width: 8px;
            height: 8px;
            background: #22c55e;
            border-radius: 50%;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .hero-title {
            font-size: 56px;
            font-weight: 600;
            line-height: 1.1;
            color: #1a1a1a;
            margin: 0 0 20px 0;
            letter-spacing: -1px;
          }
          .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .hero-subtitle {
            font-size: 18px;
            color: #666;
            max-width: 540px;
            margin: 0 auto 32px;
            line-height: 1.6;
          }
          .hero-cta {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-bottom: 60px;
          }
          .cta-primary {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
            color: #fff;
            padding: 14px 28px;
            border-radius: 10px;
            text-decoration: none;
            font-size: 15px;
            font-weight: 500;
            transition: all 0.2s;
            box-shadow: 0 4px 14px rgba(0,0,0,0.1);
          }
          .cta-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
          .cta-primary.large { padding: 16px 32px; font-size: 16px; }
          .cta-secondary {
            display: inline-flex;
            align-items: center;
            background: #fff;
            color: #1a1a1a;
            padding: 14px 28px;
            border-radius: 10px;
            text-decoration: none;
            font-size: 15px;
            font-weight: 500;
            border: 1px solid #e5e5e5;
            transition: all 0.2s;
          }
          .cta-secondary:hover { background: #f9f9f9; border-color: #ddd; }

          /* Hero Visual */
          .hero-visual {
            position: relative;
            max-width: 600px;
            height: 200px;
            margin: 0 auto;
          }
          .visual-card {
            position: absolute;
            background: #fff;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
            border: 1px solid #f0f0f0;
            animation: float 3s ease-in-out infinite;
          }
          .card-1 { left: 0; top: 20px; animation-delay: 0s; }
          .card-2 { left: 50%; transform: translateX(-50%); top: 0; animation-delay: 0.5s; }
          .card-3 { right: 0; top: 40px; animation-delay: 1s; }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .card-2 { animation: float2 3s ease-in-out infinite; animation-delay: 0.5s; }
          @keyframes float2 {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-10px); }
          }
          .card-icon { font-size: 28px; margin-bottom: 8px; }
          .card-label { font-size: 14px; font-weight: 600; color: #1a1a1a; }
          .card-status { font-size: 12px; color: #22c55e; margin-top: 4px; }
          .card-status.online::before { content: '● '; }
          .card-amount { font-size: 18px; font-weight: 600; color: #1a1a1a; margin-top: 4px; }
          .card-time { font-size: 12px; color: #999; margin-top: 4px; }

          /* Sections */
          .section-header {
            text-align: center;
            margin-bottom: 48px;
          }
          .section-tag {
            display: inline-block;
            background: #f5f5f5;
            padding: 6px 14px;
            border-radius: 100px;
            font-size: 12px;
            font-weight: 600;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
          }
          .section-title {
            font-size: 36px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 12px 0;
          }
          .section-desc {
            font-size: 16px;
            color: #666;
            margin: 0;
          }

          /* Features */
          .features-section {
            padding: 80px 24px;
            max-width: 1200px;
            margin: 0 auto;
          }
          .features-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
          .feature-item {
            background: #fafafa;
            border-radius: 16px;
            padding: 32px;
            transition: all 0.3s;
          }
          .feature-item:hover {
            background: #fff;
            box-shadow: 0 10px 40px rgba(0,0,0,0.06);
            transform: translateY(-4px);
          }
          .feature-icon-wrap {
            width: 56px;
            height: 56px;
            background: #fff;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          }
          .feature-icon { font-size: 28px; }
          .feature-item h3 {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 8px 0;
          }
          .feature-item p {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
            margin: 0;
          }

          /* Stats */
          .stats-section {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            padding: 80px 24px;
          }
          .stats-content {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 60px;
            align-items: center;
          }
          .stats-text { color: #fff; }
          .stats-text .section-tag { background: rgba(255,255,255,0.1); color: #fff; }
          .stats-text h2 { font-size: 32px; margin: 0 0 12px 0; }
          .stats-text p { color: rgba(255,255,255,0.7); margin: 0; }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
          .stat-item {
            background: rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 28px;
            border: 1px solid rgba(255,255,255,0.1);
          }
          .stat-value {
            font-size: 36px;
            font-weight: 700;
            color: #fff;
            margin-bottom: 4px;
          }
          .stat-label {
            font-size: 14px;
            color: rgba(255,255,255,0.6);
          }

          /* Integration */
          .integration-section {
            padding: 80px 24px;
            max-width: 1200px;
            margin: 0 auto;
          }
          .integration-logos {
            display: flex;
            justify-content: center;
            gap: 40px;
            flex-wrap: wrap;
          }
          .integration-item {
            padding: 20px 40px;
            background: #f9f9f9;
            border-radius: 12px;
            font-weight: 600;
            color: #666;
            font-size: 16px;
          }

          /* CTA */
          .cta-section {
            padding: 80px 24px;
            text-align: center;
            background: linear-gradient(180deg, #fff 0%, #f9f9f9 100%);
          }
          .cta-content h2 {
            font-size: 36px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 12px 0;
          }
          .cta-content p {
            font-size: 16px;
            color: #666;
            margin: 0 0 28px 0;
          }

          /* Footer */
          .landing-footer {
            border-top: 1px solid #eee;
            padding: 40px 24px;
          }
          .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .footer-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
            color: #1a1a1a;
          }
          .footer-links {
            display: flex;
            gap: 24px;
          }
          .footer-links a {
            color: #666;
            text-decoration: none;
            font-size: 14px;
          }
          .footer-links a:hover { color: #1a1a1a; }
          .footer-copy {
            font-size: 13px;
            color: #999;
          }

          /* Responsive */
          @media (max-width: 900px) {
            .hero-title { font-size: 40px; }
            .features-grid { grid-template-columns: repeat(2, 1fr); }
            .stats-content { grid-template-columns: 1fr; text-align: center; }
            .hero-visual { display: none; }
            .footer-content { flex-direction: column; gap: 20px; text-align: center; }
          }
          @media (max-width: 600px) {
            .hero-title { font-size: 32px; }
            .hero-cta { flex-direction: column; }
            .features-grid { grid-template-columns: 1fr; }
            .stats-grid { grid-template-columns: 1fr; }
            .header-nav { gap: 16px; }
            .nav-item { display: none; }
            .section-title { font-size: 28px; }
          }
        `}</style>
      </div>
    </>
  );
};

export default HomePage;
