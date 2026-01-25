/**
 * Home Page - Public Promotional Landing Page
 * URL: https://base.wecare.digital/
 * Clean, modern design inspired by AiSensy/BotSpace
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';

const HomePage: React.FC = () => {
  const [messagesCount, setMessagesCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const target = 150000;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setMessagesCount(target);
        clearInterval(timer);
      } else {
        setMessagesCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Head>
        <title>WECARE.DIGITAL - Business Communication Platform</title>
        <meta name="description" content="WhatsApp Business API, Bulk Messaging, Payments & More" />
      </Head>
      <div className="landing">
        {/* Header */}
        <header className="header">
          <div className="header-inner">
            <div className="logo">
              <img 
                src="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" 
                alt="WECARE.DIGITAL" 
                className="logo-img"
              />
              <span className="logo-text">WECARE.DIGITAL</span>
            </div>
            <a href="mailto:hello@wecare.digital" className="header-cta">Contact Us</a>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Trusted by 500+ Businesses
            </div>
            <h1 className="hero-title">
              The Smartest Business<br />
              <span className="highlight">Communication Platform</span>
            </h1>
            <p className="hero-subtitle">
              Send WhatsApp messages, collect payments, run bulk campaigns, and automate customer support - all from one powerful platform
            </p>
            <div className="hero-cta">
              <a href="mailto:hello@wecare.digital" className="btn-primary">
                Get Started Free
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-num">{messagesCount.toLocaleString()}+</span>
                <span className="stat-text">Messages Sent</span>
              </div>
              <div className="stat-divider"></div>
              <div className="hero-stat">
                <span className="stat-num">99.9%</span>
                <span className="stat-text">Delivery Rate</span>
              </div>
              <div className="stat-divider"></div>
              <div className="hero-stat">
                <span className="stat-num">24/7</span>
                <span className="stat-text">AI Support</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="phone-mockup">
              <div className="phone-header">
                <div className="phone-avatar">W</div>
                <div className="phone-name">WECARE.DIGITAL</div>
                <div className="phone-badge">✓</div>
              </div>
              <div className="phone-messages">
                <div className="msg msg-in">
                  <p>Hi! I'd like to know about your services 👋</p>
                  <span className="msg-time">10:30 AM</span>
                </div>
                <div className="msg msg-out">
                  <p>Hello! Welcome to WECARE.DIGITAL. We offer WhatsApp Business API, bulk messaging, and payment collection. How can I help you today?</p>
                  <span className="msg-time">10:30 AM ✓✓</span>
                </div>
                <div className="msg msg-out msg-payment">
                  <div className="payment-card">
                    <div className="payment-icon">💳</div>
                    <div className="payment-info">
                      <span className="payment-title">Payment Request</span>
                      <span className="payment-amount">₹2,499</span>
                    </div>
                  </div>
                  <a className="payment-btn">Pay Now</a>
                  <span className="msg-time">10:31 AM ✓✓</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features">
          <div className="features-header">
            <h2>Everything you need to scale</h2>
            <p>Powerful features that drive conversions and boost engagement</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>WhatsApp Business API</h3>
              <p>Official API with green tick verification. Send unlimited broadcasts, promotions, and updates.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>In-Chat Payments</h3>
              <p>Collect payments via UPI, cards & wallets directly in WhatsApp. Powered by Razorpay.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📢</div>
              <h3>Bulk Campaigns</h3>
              <p>Send personalized messages to thousands of contacts with smart scheduling and analytics.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Support</h3>
              <p>Automate responses with intelligent AI. Handle queries 24/7 without human intervention.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Multi-Channel</h3>
              <p>SMS, Email, Voice calls, and RCS messaging from a single unified dashboard.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Real-time Analytics</h3>
              <p>Track delivery, engagement, and conversion metrics with detailed reports.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to transform your business communication?</h2>
            <p>Get started in minutes. No credit card required.</p>
            <a href="mailto:hello@wecare.digital" className="btn-primary btn-large">
              Start Free Trial
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <img src="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" alt="" className="footer-logo" />
              <span>WECARE.DIGITAL</span>
            </div>
            <div className="footer-copy">© 2026 WECARE.DIGITAL. All rights reserved.</div>
          </div>
        </footer>

        <style jsx>{`
          .landing {
            min-height: 100vh;
            background: #fff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1a1a1a;
          }

          /* Header */
          .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            background: rgba(255,255,255,0.98);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid #f0f0f0;
          }
          .header-inner {
            max-width: 1200px;
            margin: 0 auto;
            padding: 16px 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo-img {
            width: 36px;
            height: 36px;
            border-radius: 10px;
          }
          .logo-text {
            font-weight: 600;
            font-size: 18px;
            color: #1a1a1a;
          }
          .header-cta {
            color: #666;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            padding: 10px 20px;
            border-radius: 8px;
            transition: all 0.2s;
          }
          .header-cta:hover {
            background: #f5f5f5;
            color: #1a1a1a;
          }

          /* Hero */
          .hero {
            padding: 140px 32px 80px;
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: center;
          }
          .hero-content {
            max-width: 540px;
          }
          .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #f0fdf4;
            padding: 8px 16px;
            border-radius: 100px;
            font-size: 13px;
            color: #16a34a;
            font-weight: 500;
            margin-bottom: 24px;
            border: 1px solid #bbf7d0;
          }
          .badge-dot {
            width: 8px;
            height: 8px;
            background: #22c55e;
            border-radius: 50%;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
          .hero-title {
            font-size: 52px;
            font-weight: 700;
            line-height: 1.1;
            color: #1a1a1a;
            margin: 0 0 20px 0;
            letter-spacing: -1.5px;
          }
          .highlight {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .hero-subtitle {
            font-size: 18px;
            color: #666;
            line-height: 1.7;
            margin: 0 0 32px 0;
          }
          .hero-cta {
            margin-bottom: 40px;
          }
          .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: #fff;
            padding: 16px 32px;
            border-radius: 12px;
            text-decoration: none;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s;
            box-shadow: 0 4px 20px rgba(34,197,94,0.3);
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(34,197,94,0.4);
          }
          .btn-large {
            padding: 18px 40px;
            font-size: 17px;
          }
          .hero-stats {
            display: flex;
            align-items: center;
            gap: 24px;
          }
          .hero-stat {
            display: flex;
            flex-direction: column;
          }
          .stat-num {
            font-size: 28px;
            font-weight: 700;
            color: #1a1a1a;
          }
          .stat-text {
            font-size: 13px;
            color: #888;
          }
          .stat-divider {
            width: 1px;
            height: 40px;
            background: #e5e5e5;
          }

          /* Phone Mockup */
          .hero-visual {
            display: flex;
            justify-content: center;
          }
          .phone-mockup {
            width: 320px;
            background: #f5f5f5;
            border-radius: 32px;
            padding: 12px;
            box-shadow: 0 40px 80px rgba(0,0,0,0.1);
          }
          .phone-header {
            background: #075e54;
            padding: 16px;
            border-radius: 20px 20px 0 0;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .phone-avatar {
            width: 40px;
            height: 40px;
            background: #25d366;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 700;
            font-size: 16px;
          }
          .phone-name {
            color: #fff;
            font-weight: 600;
            font-size: 15px;
            flex: 1;
          }
          .phone-badge {
            background: #25d366;
            color: #fff;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
          }
          .phone-messages {
            background: #e5ddd5;
            padding: 16px;
            border-radius: 0 0 20px 20px;
            min-height: 300px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .msg {
            max-width: 85%;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 13px;
            line-height: 1.4;
            position: relative;
          }
          .msg p { margin: 0 0 4px 0; }
          .msg-time {
            font-size: 10px;
            color: #888;
            display: block;
            text-align: right;
          }
          .msg-in {
            background: #fff;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
          }
          .msg-out {
            background: #dcf8c6;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
          }
          .msg-payment {
            padding: 12px;
          }
          .payment-card {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 10px;
          }
          .payment-icon {
            font-size: 24px;
          }
          .payment-info {
            display: flex;
            flex-direction: column;
          }
          .payment-title {
            font-size: 12px;
            color: #666;
          }
          .payment-amount {
            font-size: 18px;
            font-weight: 700;
            color: #1a1a1a;
          }
          .payment-btn {
            display: block;
            background: #25d366;
            color: #fff;
            text-align: center;
            padding: 10px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
            margin-bottom: 6px;
          }

          /* Features */
          .features {
            padding: 100px 32px;
            background: #fafafa;
          }
          .features-header {
            text-align: center;
            max-width: 600px;
            margin: 0 auto 60px;
          }
          .features-header h2 {
            font-size: 40px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0 0 16px 0;
            letter-spacing: -1px;
          }
          .features-header p {
            font-size: 18px;
            color: #666;
            margin: 0;
          }
          .features-grid {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
          .feature-card {
            background: #fff;
            border-radius: 20px;
            padding: 32px;
            border: 1px solid #eee;
            transition: all 0.3s;
          }
          .feature-card:hover {
            border-color: #ddd;
            box-shadow: 0 20px 60px rgba(0,0,0,0.06);
            transform: translateY(-4px);
          }
          .feature-icon {
            font-size: 40px;
            margin-bottom: 20px;
          }
          .feature-card h3 {
            font-size: 20px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 12px 0;
          }
          .feature-card p {
            font-size: 15px;
            color: #666;
            line-height: 1.6;
            margin: 0;
          }

          /* CTA */
          .cta-section {
            padding: 100px 32px;
            text-align: center;
            background: linear-gradient(180deg, #fff 0%, #f0fdf4 100%);
          }
          .cta-content {
            max-width: 600px;
            margin: 0 auto;
          }
          .cta-content h2 {
            font-size: 40px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0 0 16px 0;
            letter-spacing: -1px;
          }
          .cta-content p {
            font-size: 18px;
            color: #666;
            margin: 0 0 32px 0;
          }

          /* Footer */
          .footer {
            border-top: 1px solid #eee;
            padding: 32px;
            background: #fff;
          }
          .footer-inner {
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
          .footer-logo {
            width: 28px;
            height: 28px;
            border-radius: 6px;
          }
          .footer-copy {
            font-size: 13px;
            color: #999;
          }

          /* Responsive */
          @media (max-width: 1024px) {
            .hero { grid-template-columns: 1fr; text-align: center; }
            .hero-content { max-width: 100%; }
            .hero-stats { justify-content: center; }
            .hero-visual { margin-top: 40px; }
            .features-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 768px) {
            .hero-title { font-size: 38px; }
            .features-grid { grid-template-columns: 1fr; }
            .features-header h2, .cta-content h2 { font-size: 32px; }
            .hero-stats { flex-wrap: wrap; gap: 16px; }
            .stat-divider { display: none; }
            .phone-mockup { width: 280px; }
          }
          @media (max-width: 480px) {
            .hero { padding: 120px 20px 60px; }
            .hero-title { font-size: 32px; }
            .header-inner { padding: 12px 20px; }
            .logo-text { display: none; }
            .footer-inner { flex-direction: column; gap: 16px; }
          }
        `}</style>
      </div>
    </>
  );
};

export default HomePage;
