/**
 * Home Page - Public Promotional Landing Page
 * URL: https://base.wecare.digital/
 * Clean, minimal design inspired by BotSpace
 */

import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';

const HomePage: React.FC = () => {
  const [messagesCount, setMessagesCount] = useState(0);
  const [isVisible, setIsVisible] = useState<{[key: string]: boolean}>({});
  const featuresRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate counter
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

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    if (featuresRef.current) observer.observe(featuresRef.current);
    if (stepsRef.current) observer.observe(stepsRef.current);
    if (ctaRef.current) observer.observe(ctaRef.current);

    return () => {
      clearInterval(timer);
      observer.disconnect();
    };
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
          <div className="hero-bg"></div>
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Trusted by 500+ Businesses
            </div>
            <h1 className="hero-title">
              Boost your business<br />
              <span className="highlight">communication</span>
            </h1>
            <p className="hero-subtitle">
              Send WhatsApp messages, collect payments, and automate customer support - all from one powerful platform.
            </p>
            <div className="hero-cta">
              <a href="mailto:hello@wecare.digital" className="btn-primary">
                Get Started
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
                <span className="stat-num">&lt;1s</span>
                <span className="stat-text">Response Time</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="phone-mockup">
              <div className="phone-header">
                <div className="phone-avatar">W</div>
                <div className="phone-info">
                  <div className="phone-name">WECARE.DIGITAL</div>
                  <div className="phone-status">Online</div>
                </div>
                <div className="phone-badge">✓</div>
              </div>
              <div className="phone-messages">
                <div className="msg msg-in">
                  <p>Hi! I'd like to place an order 👋</p>
                  <span className="msg-time">10:30 AM</span>
                </div>
                <div className="msg msg-out">
                  <p>Hello! Sure, I can help you with that. Here's your order summary:</p>
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

        {/* How it Works */}
        <section className={`steps ${isVisible['steps'] ? 'visible' : ''}`} id="steps" ref={stepsRef}>
          <div className="steps-inner">
            <h2>How it works</h2>
            <p className="steps-subtitle">Get started in 3 simple steps</p>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-num">1</div>
                <h3>Sign Up</h3>
                <p>Create your account and connect your WhatsApp Business number</p>
              </div>
              <div className="step-arrow">→</div>
              <div className="step-card">
                <div className="step-num">2</div>
                <h3>Configure</h3>
                <p>Set up templates, payment links, and AI responses</p>
              </div>
              <div className="step-arrow">→</div>
              <div className="step-card">
                <div className="step-num">3</div>
                <h3>Launch</h3>
                <p>Start sending messages and collecting payments instantly</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={`features ${isVisible['features'] ? 'visible' : ''}`} id="features" ref={featuresRef}>
          <div className="features-inner">
            <h2>Everything you need</h2>
            <p className="features-subtitle">Powerful features to scale your business</p>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3>WhatsApp Business API</h3>
                <p>Official API with green tick. Send unlimited broadcasts and promotions.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💳</div>
                <h3>In-Chat Payments</h3>
                <p>Collect payments via UPI & cards directly in WhatsApp conversations.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📢</div>
                <h3>Bulk Campaigns</h3>
                <p>Send personalized messages to thousands with smart scheduling.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🤖</div>
                <h3>AI Support</h3>
                <p>Automate responses 24/7 with intelligent AI-powered chatbot.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3>Multi-Channel</h3>
                <p>SMS, Email, Voice & RCS from a single unified dashboard.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Analytics</h3>
                <p>Track delivery, engagement & conversions in real-time.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`cta-section ${isVisible['cta'] ? 'visible' : ''}`} id="cta" ref={ctaRef}>
          <div className="cta-content">
            <h2>Ready to get started?</h2>
            <p>Transform your business communication today</p>
            <a href="mailto:hello@wecare.digital" className="btn-primary btn-large">
              Contact Sales
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
            <div className="footer-copy">© 2026 WECARE.DIGITAL</div>
          </div>
        </footer>

        <style jsx>{`
          .landing {
            min-height: 100vh;
            background: #fff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1a1a1a;
            overflow-x: hidden;
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
            border-bottom: 1px solid rgba(0,0,0,0.05);
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
            width: 40px;
            height: 40px;
            border-radius: 12px;
          }
          .logo-text {
            font-weight: 700;
            font-size: 18px;
            color: #1a1a1a;
            letter-spacing: -0.5px;
          }
          .header-cta {
            color: #666;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            padding: 10px 20px;
            border-radius: 10px;
            border: 1px solid #eee;
            transition: all 0.2s;
          }
          .header-cta:hover {
            background: #f9f9f9;
            border-color: #ddd;
          }

          /* Hero */
          .hero {
            position: relative;
            padding: 140px 32px 100px;
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            align-items: center;
            min-height: 100vh;
          }
          .hero-bg {
            position: absolute;
            top: 0;
            right: -200px;
            width: 800px;
            height: 800px;
            background: radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%);
            pointer-events: none;
          }
          .hero-content {
            position: relative;
            z-index: 1;
          }
          .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #f0fdf4;
            padding: 10px 18px;
            border-radius: 100px;
            font-size: 14px;
            color: #16a34a;
            font-weight: 500;
            margin-bottom: 28px;
            border: 1px solid #dcfce7;
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
            50% { opacity: 0.6; transform: scale(1.2); }
          }
          .hero-title {
            font-size: 56px;
            font-weight: 800;
            line-height: 1.1;
            color: #1a1a1a;
            margin: 0 0 24px 0;
            letter-spacing: -2px;
          }
          .highlight {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .hero-subtitle {
            font-size: 19px;
            color: #555;
            line-height: 1.7;
            margin: 0 0 36px 0;
            max-width: 480px;
          }
          .hero-cta {
            margin-bottom: 48px;
          }
          .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: #fff;
            padding: 18px 36px;
            border-radius: 14px;
            text-decoration: none;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s;
            box-shadow: 0 8px 30px rgba(34,197,94,0.3);
          }
          .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 40px rgba(34,197,94,0.4);
          }
          .btn-large {
            padding: 20px 44px;
            font-size: 17px;
          }
          .hero-stats {
            display: flex;
            align-items: center;
            gap: 32px;
          }
          .hero-stat {
            display: flex;
            flex-direction: column;
          }
          .stat-num {
            font-size: 32px;
            font-weight: 800;
            color: #1a1a1a;
            letter-spacing: -1px;
          }
          .stat-text {
            font-size: 14px;
            color: #888;
            margin-top: 2px;
          }
          .stat-divider {
            width: 1px;
            height: 48px;
            background: #e5e5e5;
          }

          /* Phone Mockup */
          .hero-visual {
            display: flex;
            justify-content: center;
            position: relative;
            z-index: 1;
          }
          .phone-mockup {
            width: 340px;
            background: #1a1a1a;
            border-radius: 40px;
            padding: 12px;
            box-shadow: 0 60px 120px rgba(0,0,0,0.15);
            animation: float 4s ease-in-out infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
          .phone-header {
            background: #075e54;
            padding: 14px 16px;
            border-radius: 28px 28px 0 0;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .phone-avatar {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 700;
            font-size: 18px;
          }
          .phone-info { flex: 1; }
          .phone-name {
            color: #fff;
            font-weight: 600;
            font-size: 16px;
          }
          .phone-status {
            color: rgba(255,255,255,0.7);
            font-size: 12px;
          }
          .phone-badge {
            background: #25d366;
            color: #fff;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
          }
          .phone-messages {
            background: linear-gradient(180deg, #ece5dd 0%, #d9d2c5 100%);
            padding: 20px 16px;
            border-radius: 0 0 28px 28px;
            min-height: 340px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .msg {
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 16px;
            font-size: 14px;
            line-height: 1.5;
            position: relative;
            box-shadow: 0 1px 2px rgba(0,0,0,0.08);
          }
          .msg p { margin: 0 0 6px 0; }
          .msg-time {
            font-size: 11px;
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
            background: #d9fdd3;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
          }
          .msg-payment {
            padding: 14px;
          }
          .payment-card {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
          }
          .payment-icon {
            font-size: 28px;
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
            font-size: 22px;
            font-weight: 700;
            color: #1a1a1a;
          }
          .payment-btn {
            display: block;
            background: #25d366;
            color: #fff;
            text-align: center;
            padding: 12px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 8px;
            cursor: pointer;
          }

          /* Steps */
          .steps {
            padding: 100px 32px;
            background: #fafafa;
            opacity: 0;
            transform: translateY(40px);
            transition: all 0.8s ease;
          }
          .steps.visible {
            opacity: 1;
            transform: translateY(0);
          }
          .steps-inner {
            max-width: 1000px;
            margin: 0 auto;
            text-align: center;
          }
          .steps h2 {
            font-size: 42px;
            font-weight: 800;
            color: #1a1a1a;
            margin: 0 0 12px 0;
            letter-spacing: -1px;
          }
          .steps-subtitle {
            font-size: 18px;
            color: #666;
            margin: 0 0 60px 0;
          }
          .steps-grid {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 24px;
          }
          .step-card {
            background: #fff;
            border-radius: 24px;
            padding: 40px 32px;
            width: 260px;
            border: 1px solid #eee;
            transition: all 0.3s;
          }
          .step-card:hover {
            border-color: #ddd;
            box-shadow: 0 20px 60px rgba(0,0,0,0.06);
            transform: translateY(-4px);
          }
          .step-num {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 700;
            font-size: 20px;
            margin: 0 auto 20px;
          }
          .step-card h3 {
            font-size: 20px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0 0 10px 0;
          }
          .step-card p {
            font-size: 15px;
            color: #666;
            line-height: 1.6;
            margin: 0;
          }
          .step-arrow {
            font-size: 28px;
            color: #ccc;
            font-weight: 300;
          }

          /* Features */
          .features {
            padding: 100px 32px;
            opacity: 0;
            transform: translateY(40px);
            transition: all 0.8s ease;
          }
          .features.visible {
            opacity: 1;
            transform: translateY(0);
          }
          .features-inner {
            max-width: 1200px;
            margin: 0 auto;
            text-align: center;
          }
          .features h2 {
            font-size: 42px;
            font-weight: 800;
            color: #1a1a1a;
            margin: 0 0 12px 0;
            letter-spacing: -1px;
          }
          .features-subtitle {
            font-size: 18px;
            color: #666;
            margin: 0 0 60px 0;
          }
          .features-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            text-align: left;
          }
          .feature-card {
            background: #fafafa;
            border-radius: 24px;
            padding: 36px;
            border: 1px solid transparent;
            transition: all 0.3s;
          }
          .feature-card:hover {
            background: #fff;
            border-color: #eee;
            box-shadow: 0 20px 60px rgba(0,0,0,0.06);
            transform: translateY(-4px);
          }
          .feature-icon {
            font-size: 44px;
            margin-bottom: 20px;
          }
          .feature-card h3 {
            font-size: 20px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0 0 10px 0;
          }
          .feature-card p {
            font-size: 15px;
            color: #666;
            line-height: 1.6;
            margin: 0;
          }

          /* CTA */
          .cta-section {
            padding: 120px 32px;
            text-align: center;
            background: linear-gradient(180deg, #fff 0%, #f0fdf4 100%);
            opacity: 0;
            transform: translateY(40px);
            transition: all 0.8s ease;
          }
          .cta-section.visible {
            opacity: 1;
            transform: translateY(0);
          }
          .cta-content {
            max-width: 600px;
            margin: 0 auto;
          }
          .cta-content h2 {
            font-size: 44px;
            font-weight: 800;
            color: #1a1a1a;
            margin: 0 0 16px 0;
            letter-spacing: -1px;
          }
          .cta-content p {
            font-size: 19px;
            color: #666;
            margin: 0 0 40px 0;
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
            border-radius: 8px;
          }
          .footer-copy {
            font-size: 14px;
            color: #999;
          }

          /* Responsive */
          @media (max-width: 1024px) {
            .hero { 
              grid-template-columns: 1fr; 
              text-align: center; 
              padding-top: 120px;
              min-height: auto;
            }
            .hero-subtitle { margin-left: auto; margin-right: auto; }
            .hero-stats { justify-content: center; }
            .hero-visual { margin-top: 60px; }
            .features-grid { grid-template-columns: repeat(2, 1fr); }
            .steps-grid { flex-wrap: wrap; }
            .step-arrow { display: none; }
          }
          @media (max-width: 768px) {
            .hero-title { font-size: 42px; }
            .features-grid { grid-template-columns: 1fr; }
            .steps h2, .features h2, .cta-content h2 { font-size: 32px; }
            .hero-stats { flex-wrap: wrap; gap: 20px; }
            .stat-divider { display: none; }
            .phone-mockup { width: 300px; }
            .step-card { width: 100%; max-width: 300px; }
          }
          @media (max-width: 480px) {
            .hero { padding: 100px 20px 60px; }
            .hero-title { font-size: 36px; letter-spacing: -1px; }
            .hero-subtitle { font-size: 16px; }
            .header-inner { padding: 12px 20px; }
            .logo-text { font-size: 16px; }
            .footer-inner { flex-direction: column; gap: 16px; }
            .phone-mockup { width: 280px; }
            .stat-num { font-size: 26px; }
          }
        `}</style>
      </div>
    </>
  );
};

export default HomePage;
