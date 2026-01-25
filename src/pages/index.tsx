/**
 * Home Page - Public Promotional Landing Page
 * URL: https://base.wecare.digital/
 * Customer-facing promotional page - no login/dashboard links
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';

const HomePage: React.FC = () => {
  const [messagesCount, setMessagesCount] = useState(0);

  useEffect(() => {
    // Animate counter
    let start = 0;
    const target = 125000;
    const duration = 2500;
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
        <meta name="description" content="Empowering businesses to communicate smarter, faster, and better" />
      </Head>
      <div className="landing">
        {/* Header */}
        <header className="header">
          <div className="header-inner">
            <div className="logo">
              <div className="logo-icon">W</div>
              <span className="logo-text">WECARE.DIGITAL</span>
            </div>
            <nav className="nav">
              <a href="#features" className="nav-link">Features</a>
              <a href="#impact" className="nav-link">Impact</a>
              <a href="#integrations" className="nav-link">Integrations</a>
              <a href="#testimonials" className="nav-link">Testimonials</a>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">◆</span>
              Empowering businesses to communicate smarter, faster, and better
            </div>
            <h1 className="hero-title">
              The only Communication<br />
              Toolkit you'll ever need
            </h1>
            <p className="hero-subtitle">
              From first message to final payment, automate every step with our modular communication suite
            </p>
            <div className="hero-cta">
              <a href="#features" className="btn-primary">Explore Features</a>
              <a href="#contact" className="btn-secondary">Contact Sales</a>
            </div>
          </div>
          <div className="hero-gradient"></div>
        </section>

        {/* Features Section */}
        <section className="features" id="features">
          <div className="features-grid">
            <div className="feature-card feature-highlight">
              <div className="feature-icon">💬</div>
              <h3>WhatsApp Business API</h3>
              <p>Send messages, collect payments, and share rich media through official WhatsApp Business API with 99.9% delivery rate</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Responses</h3>
              <p>Intelligent conversations with effortless support. Seamlessly integrate your data to generate accurate responses</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>In-Chat Payments</h3>
              <p>Collect payments via UPI, cards, and wallets directly within conversations. Powered by Razorpay</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Multi-Channel Suite</h3>
              <p>SMS, Email, Voice calls, and RCS messaging from a single unified platform</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⫶</div>
              <h3>Bulk Campaigns</h3>
              <p>Send personalized campaigns to thousands of contacts with smart scheduling and analytics</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Real-time Analytics</h3>
              <p>Track delivery, engagement, and conversion metrics with detailed dashboards and reports</p>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="impact" id="impact">
          <div className="impact-inner">
            <div className="impact-header">
              <span className="section-badge">Impact Driven Communication</span>
              <h2>Boosting operational efficiency and customer satisfaction for faster scaling</h2>
            </div>
            <div className="impact-stats">
              <div className="stat-card stat-main">
                <div className="stat-value">{messagesCount.toLocaleString()}+</div>
                <div className="stat-label">Messages delivered last month</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">99.9%</div>
                <div className="stat-label">Delivery Rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">&lt;1s</div>
                <div className="stat-label">Avg Response Time</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">24/7</div>
                <div className="stat-label">AI Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="integrations" id="integrations">
          <div className="integrations-inner">
            <span className="section-badge">Seamless Integration</span>
            <h2>Connect your favorite tools with a single click</h2>
            <div className="integration-grid">
              <div className="integration-item">
                <div className="integration-icon">☁️</div>
                <span>AWS</span>
              </div>
              <div className="integration-item">
                <div className="integration-icon">💳</div>
                <span>Razorpay</span>
              </div>
              <div className="integration-item">
                <div className="integration-icon">💬</div>
                <span>WhatsApp</span>
              </div>
              <div className="integration-item">
                <div className="integration-icon">📱</div>
                <span>Airtel</span>
              </div>
              <div className="integration-item">
                <div className="integration-icon">✉️</div>
                <span>AWS SES</span>
              </div>
              <div className="integration-item">
                <div className="integration-icon">🤖</div>
                <span>Bedrock AI</span>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials" id="testimonials">
          <div className="testimonials-inner">
            <span className="section-badge">Real Results. Real Fast.</span>
            <h2>See how businesses streamlined their communication workflows</h2>
            <div className="testimonial-grid">
              <div className="testimonial-card">
                <div className="testimonial-content">
                  "WECARE.DIGITAL transformed how we communicate with customers. The WhatsApp integration alone saved us 20 hours per week."
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">R</div>
                  <div className="author-info">
                    <div className="author-name">Rahul Sharma</div>
                    <div className="author-role">Head of Operations</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  "The AI-powered responses handle 70% of our customer queries automatically. Our team can now focus on complex issues."
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">P</div>
                  <div className="author-info">
                    <div className="author-name">Priya Patel</div>
                    <div className="author-role">Customer Success Lead</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  "In-chat payments increased our conversion rate by 35%. Customers love the seamless experience."
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">A</div>
                  <div className="author-info">
                    <div className="author-name">Amit Kumar</div>
                    <div className="author-role">E-commerce Director</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section" id="contact">
          <div className="cta-inner">
            <h2>Ready to transform your business communication?</h2>
            <p>Get started today and see results within days, not months</p>
            <div className="cta-buttons">
              <a href="mailto:hello@wecare.digital" className="btn-primary btn-large">Contact Sales</a>
              <a href="#features" className="btn-secondary btn-large">Learn More</a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="logo-icon small">W</div>
              <span>WECARE.DIGITAL</span>
            </div>
            <div className="footer-links">
              <a href="#features">Features</a>
              <a href="#impact">Impact</a>
              <a href="#integrations">Integrations</a>
              <a href="mailto:hello@wecare.digital">Contact</a>
            </div>
            <div className="footer-copy">© 2026 WECARE.DIGITAL. All rights reserved.</div>
          </div>
        </footer>

        <style jsx>{`
          .landing {
            min-height: 100vh;
            background: #fff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            color: #1a1a1a;
          }

          /* Header */
          .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(0,0,0,0.06);
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
          .logo-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 700;
            font-size: 18px;
          }
          .logo-icon.small {
            width: 32px;
            height: 32px;
            font-size: 14px;
            border-radius: 8px;
          }
          .logo-text {
            font-weight: 600;
            font-size: 17px;
            color: #1a1a1a;
          }
          .nav {
            display: flex;
            gap: 32px;
          }
          .nav-link {
            color: #666;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: color 0.2s;
          }
          .nav-link:hover { color: #1a1a1a; }

          /* Hero */
          .hero {
            position: relative;
            padding: 160px 32px 100px;
            text-align: center;
            overflow: hidden;
            background: linear-gradient(180deg, #fafafa 0%, #fff 100%);
          }
          .hero-gradient {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 800px;
            height: 600px;
            background: radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%);
            pointer-events: none;
          }
          .hero-content {
            position: relative;
            z-index: 1;
            max-width: 800px;
            margin: 0 auto;
          }
          .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%);
            padding: 10px 20px;
            border-radius: 100px;
            font-size: 13px;
            color: #6366f1;
            font-weight: 500;
            margin-bottom: 28px;
            border: 1px solid rgba(99,102,241,0.15);
          }
          .badge-icon {
            font-size: 10px;
          }
          .hero-title {
            font-size: 60px;
            font-weight: 700;
            line-height: 1.1;
            color: #1a1a1a;
            margin: 0 0 24px 0;
            letter-spacing: -2px;
          }
          .hero-subtitle {
            font-size: 20px;
            color: #666;
            max-width: 560px;
            margin: 0 auto 40px;
            line-height: 1.6;
          }
          .hero-cta {
            display: flex;
            gap: 16px;
            justify-content: center;
          }
          .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: #fff;
            padding: 16px 32px;
            border-radius: 12px;
            text-decoration: none;
            font-size: 15px;
            font-weight: 600;
            transition: all 0.3s;
            box-shadow: 0 4px 20px rgba(99,102,241,0.3);
          }
          .btn-primary:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 8px 30px rgba(99,102,241,0.4);
          }
          .btn-secondary {
            display: inline-flex;
            align-items: center;
            background: #fff;
            color: #1a1a1a;
            padding: 16px 32px;
            border-radius: 12px;
            text-decoration: none;
            font-size: 15px;
            font-weight: 600;
            border: 1px solid #e5e5e5;
            transition: all 0.3s;
          }
          .btn-secondary:hover { 
            background: #fafafa; 
            border-color: #ddd;
          }
          .btn-large {
            padding: 18px 40px;
            font-size: 16px;
          }

          /* Features */
          .features {
            padding: 100px 32px;
            max-width: 1200px;
            margin: 0 auto;
          }
          .features-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
          .feature-card {
            background: #fafafa;
            border-radius: 20px;
            padding: 36px;
            transition: all 0.3s;
            border: 1px solid transparent;
          }
          .feature-card:hover {
            background: #fff;
            border-color: #eee;
            box-shadow: 0 20px 60px rgba(0,0,0,0.06);
            transform: translateY(-4px);
          }
          .feature-highlight {
            background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.08) 100%);
            border: 1px solid rgba(99,102,241,0.15);
          }
          .feature-highlight:hover {
            background: linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.12) 100%);
            border-color: rgba(99,102,241,0.25);
          }
          .feature-icon {
            font-size: 36px;
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

          /* Impact */
          .impact {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            padding: 100px 32px;
          }
          .impact-inner {
            max-width: 1200px;
            margin: 0 auto;
          }
          .impact-header {
            text-align: center;
            margin-bottom: 60px;
          }
          .section-badge {
            display: inline-block;
            background: rgba(255,255,255,0.1);
            padding: 8px 16px;
            border-radius: 100px;
            font-size: 12px;
            font-weight: 600;
            color: rgba(255,255,255,0.8);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 20px;
          }
          .impact h2 {
            font-size: 36px;
            font-weight: 600;
            color: #fff;
            margin: 0;
            max-width: 600px;
            margin: 0 auto;
          }
          .impact-stats {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 24px;
          }
          .stat-card {
            background: rgba(255,255,255,0.05);
            border-radius: 20px;
            padding: 36px;
            border: 1px solid rgba(255,255,255,0.1);
            text-align: center;
          }
          .stat-main {
            background: linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%);
            border-color: rgba(99,102,241,0.3);
          }
          .stat-value {
            font-size: 48px;
            font-weight: 700;
            color: #fff;
            margin-bottom: 8px;
          }
          .stat-main .stat-value {
            font-size: 56px;
          }
          .stat-label {
            font-size: 14px;
            color: rgba(255,255,255,0.6);
          }

          /* Integrations */
          .integrations {
            padding: 100px 32px;
            background: #fafafa;
          }
          .integrations-inner {
            max-width: 1000px;
            margin: 0 auto;
            text-align: center;
          }
          .integrations .section-badge {
            background: rgba(99,102,241,0.1);
            color: #6366f1;
          }
          .integrations h2 {
            font-size: 36px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 48px 0;
          }
          .integration-grid {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
          }
          .integration-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            padding: 28px 36px;
            background: #fff;
            border-radius: 16px;
            border: 1px solid #eee;
            transition: all 0.3s;
          }
          .integration-item:hover {
            border-color: #ddd;
            box-shadow: 0 10px 40px rgba(0,0,0,0.06);
            transform: translateY(-2px);
          }
          .integration-icon {
            font-size: 32px;
          }
          .integration-item span {
            font-size: 14px;
            font-weight: 600;
            color: #666;
          }

          /* Testimonials */
          .testimonials {
            padding: 100px 32px;
          }
          .testimonials-inner {
            max-width: 1200px;
            margin: 0 auto;
            text-align: center;
          }
          .testimonials .section-badge {
            background: rgba(99,102,241,0.1);
            color: #6366f1;
          }
          .testimonials h2 {
            font-size: 36px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 48px 0;
          }
          .testimonial-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            text-align: left;
          }
          .testimonial-card {
            background: #fafafa;
            border-radius: 20px;
            padding: 32px;
            border: 1px solid transparent;
            transition: all 0.3s;
          }
          .testimonial-card:hover {
            background: #fff;
            border-color: #eee;
            box-shadow: 0 20px 60px rgba(0,0,0,0.06);
          }
          .testimonial-content {
            font-size: 16px;
            line-height: 1.7;
            color: #444;
            margin-bottom: 24px;
          }
          .testimonial-author {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .author-avatar {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 600;
            font-size: 16px;
          }
          .author-name {
            font-weight: 600;
            color: #1a1a1a;
            font-size: 15px;
          }
          .author-role {
            font-size: 13px;
            color: #888;
          }

          /* CTA */
          .cta-section {
            padding: 100px 32px;
            background: linear-gradient(180deg, #fff 0%, #fafafa 100%);
            text-align: center;
          }
          .cta-inner {
            max-width: 600px;
            margin: 0 auto;
          }
          .cta-section h2 {
            font-size: 40px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0 0 16px 0;
          }
          .cta-section p {
            font-size: 18px;
            color: #666;
            margin: 0 0 36px 0;
          }
          .cta-buttons {
            display: flex;
            gap: 16px;
            justify-content: center;
          }

          /* Footer */
          .footer {
            border-top: 1px solid #eee;
            padding: 48px 32px;
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
          .footer-links {
            display: flex;
            gap: 28px;
          }
          .footer-links a {
            color: #666;
            text-decoration: none;
            font-size: 14px;
            transition: color 0.2s;
          }
          .footer-links a:hover { color: #1a1a1a; }
          .footer-copy {
            font-size: 13px;
            color: #999;
          }

          /* Responsive */
          @media (max-width: 1024px) {
            .features-grid { grid-template-columns: repeat(2, 1fr); }
            .impact-stats { grid-template-columns: repeat(2, 1fr); }
            .testimonial-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 768px) {
            .hero-title { font-size: 42px; }
            .nav { display: none; }
            .features-grid { grid-template-columns: 1fr; }
            .impact-stats { grid-template-columns: 1fr; }
            .testimonial-grid { grid-template-columns: 1fr; }
            .footer-inner { flex-direction: column; gap: 24px; text-align: center; }
            .hero-cta { flex-direction: column; }
            .cta-buttons { flex-direction: column; }
            .integration-grid { gap: 12px; }
            .integration-item { padding: 20px 24px; }
          }
          @media (max-width: 480px) {
            .hero-title { font-size: 32px; letter-spacing: -1px; }
            .hero { padding: 140px 20px 80px; }
            .section-title, .impact h2, .integrations h2, .testimonials h2 { font-size: 28px; }
            .cta-section h2 { font-size: 28px; }
            .stat-value { font-size: 36px; }
            .stat-main .stat-value { font-size: 42px; }
          }
        `}</style>
      </div>
    </>
  );
};

export default HomePage;
