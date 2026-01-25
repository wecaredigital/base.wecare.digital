/**
 * Home Page - WECARE.DIGITAL Landing
 * AWS End User Messaging inspired design
 */

import React from 'react';
import Head from 'next/head';

const HomePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>WECARE.DIGITAL - Business Communication Platform</title>
        <meta name="description" content="Dependable, cost-effective messaging for WhatsApp, SMS, Email and Voice" />
      </Head>
      <div className="page">
        <header className="hdr">
          <div className="hdr-in">
            <div className="logo">
              <img src="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" alt="WECARE.DIGITAL" />
              <span>WECARE.DIGITAL</span>
            </div>
            <a href="mailto:hello@wecare.digital" className="hdr-btn">Contact Sales</a>
          </div>
        </header>

        <section className="hero">
          <div className="hero-in">
            <h1>Dependable, cost-effective messaging without compromising safety, security, or results</h1>
            <p>WECARE.DIGITAL empowers businesses to integrate scalable and reliable messaging capabilities. Whether it is time-sensitive alerts, one-time passwords, or two-way communications, we help ensure your messages reach their destination across multiple channels.</p>
            <div className="hero-btns">
              <a href="mailto:hello@wecare.digital" className="btn-primary">Get Started</a>
              <a href="mailto:hello@wecare.digital" className="btn-secondary">Contact a Specialist</a>
            </div>
          </div>
        </section>

        <section className="what">
          <div className="what-in">
            <h2>What is WECARE.DIGITAL?</h2>
            <p>WECARE.DIGITAL is a unified business communication platform that connects your applications directly to your end-users across the channels they use and trust - WhatsApp, SMS, Email, and Voice. Built on AWS infrastructure with Razorpay payments integration, we help unlock the full potential of your messaging strategy.</p>
          </div>
        </section>

        <section className="usecases">
          <div className="uc-grid">
            <div className="uc-card">
              <div className="uc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              </div>
              <h3>Verifications</h3>
              <p className="uc-sub">Strengthen account security and streamline user onboarding</p>
              <p>Leverage One-Time Password (OTP) verifications via SMS or WhatsApp during signup and login processes to validate user identities and enable multi-factor authentication.</p>
            </div>
            <div className="uc-card">
              <div className="uc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <h3>Notifications</h3>
              <p className="uc-sub">Communicate urgent information, alerts, and reminders</p>
              <p>Send messages to a broad audience or a targeted customer list directly to their mobile device via SMS, WhatsApp, Email, or Voice calls.</p>
            </div>
            <div className="uc-card">
              <div className="uc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3>Conversations</h3>
              <p className="uc-sub">Send and receive messages with two-way communication</p>
              <p>Deploy bi-directional communications with your customers via WhatsApp. Send messages and receive customer responses to create an interactive messaging experience.</p>
            </div>
            <div className="uc-card">
              <div className="uc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
              </div>
              <h3>Payments</h3>
              <p className="uc-sub">Collect payments directly in chat conversations</p>
              <p>Let customers pay via UPI, cards, and wallets without leaving WhatsApp. Secure transactions powered by Razorpay with instant payment confirmations.</p>
            </div>
          </div>
        </section>

        <section className="benefits">
          <h2>Benefits of WECARE.DIGITAL</h2>
          <div className="ben-grid">
            <div className="ben-card">
              <h3>Send messages at scale</h3>
              <p>WECARE.DIGITAL provides the scale, resiliency, and flexibility required to deliver SMS, WhatsApp, Email, and Voice messaging capabilities. Trust that your messages are delivered to the geographies that matter most.</p>
            </div>
            <div className="ben-card">
              <h3>Trustworthy messaging</h3>
              <p>We help safeguard your business and your messages by supporting regulatory requirements. It is our mission to help you maintain message integrity and build trust with your end users.</p>
            </div>
            <div className="ben-card">
              <h3>Optimize your communications</h3>
              <p>Integrate with AWS services to keep data, app source code, compute, and messaging all in the same place. Flexible workflows, analytics, and insights allow you to build applications faster.</p>
            </div>
          </div>
        </section>

        <section className="channels">
          <h2>Get Started with WECARE.DIGITAL</h2>
          <div className="ch-grid">
            <div className="ch-card">
              <div className="ch-badge">SMS</div>
              <h3>Getting started with SMS</h3>
              <p>Increase customer engagement and response rates by sending messages directly to your customers device.</p>
              <a href="mailto:hello@wecare.digital" className="ch-link">Learn more</a>
            </div>
            <div className="ch-card">
              <div className="ch-badge wa">WhatsApp</div>
              <h3>Getting started with WhatsApp</h3>
              <p>Send rich, interactive messages on the most used messaging app in the world with official Business API.</p>
              <a href="mailto:hello@wecare.digital" className="ch-link">Learn more</a>
            </div>
            <div className="ch-card">
              <div className="ch-badge voice">Voice</div>
              <h3>Getting started with Voice</h3>
              <p>Reach customers with automated voice calls for alerts, reminders, and important notifications.</p>
              <a href="mailto:hello@wecare.digital" className="ch-link">Learn more</a>
            </div>
          </div>
        </section>

        <section className="cta">
          <h2>Ready to get started?</h2>
          <p>Transform how you communicate with customers today</p>
          <a href="mailto:hello@wecare.digital" className="btn-primary">Contact Sales</a>
        </section>

        <footer className="ftr">
          <div className="ftr-in">
            <div className="ftr-brand">
              <img src="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" alt="" />
              <span>WECARE.DIGITAL</span>
            </div>
            <span>2026 WECARE.DIGITAL. All rights reserved.</span>
          </div>
        </footer>

        <style jsx>{`
          .page{min-height:100vh;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#16191f}

          .hdr{position:fixed;top:0;left:0;right:0;z-index:100;background:#fff;border-bottom:1px solid #d5dbdb}
          .hdr-in{max-width:1200px;margin:0 auto;padding:12px 24px;display:flex;justify-content:space-between;align-items:center}
          .logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px;color:#16191f}
          .logo img{width:36px;height:36px;border-radius:8px}
          .hdr-btn{background:#f90;color:#16191f;text-decoration:none;font-size:14px;font-weight:600;padding:8px 16px;border-radius:4px;transition:background .2s}
          .hdr-btn:hover{background:#ec7211}

          .hero{background:linear-gradient(135deg,#232f3e 0%,#1b2838 100%);padding:120px 24px 80px;text-align:center}
          .hero-in{max-width:900px;margin:0 auto}
          .hero h1{font-size:42px;font-weight:700;color:#fff;line-height:1.25;margin:0 0 20px;letter-spacing:-0.5px}
          .hero p{font-size:18px;color:#d5dbdb;line-height:1.7;margin:0 0 32px}
          .hero-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
          .btn-primary{background:#f90;color:#16191f;padding:14px 28px;border-radius:4px;text-decoration:none;font-size:15px;font-weight:600;transition:background .2s}
          .btn-primary:hover{background:#ec7211}
          .btn-secondary{background:transparent;color:#fff;padding:14px 28px;border-radius:4px;text-decoration:none;font-size:15px;font-weight:600;border:1px solid #fff;transition:all .2s}
          .btn-secondary:hover{background:rgba(255,255,255,.1)}

          .what{padding:80px 24px;background:#f2f3f3}
          .what-in{max-width:900px;margin:0 auto;text-align:center}
          .what h2{font-size:32px;font-weight:700;color:#16191f;margin:0 0 20px}
          .what p{font-size:17px;color:#545b64;line-height:1.8}

          .usecases{padding:80px 24px;background:#fff}
          .uc-grid{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(2,1fr);gap:32px}
          .uc-card{background:#fff;border:1px solid #d5dbdb;border-radius:8px;padding:32px;transition:box-shadow .3s}
          .uc-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.08)}
          .uc-icon{width:48px;height:48px;background:#232f3e;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:20px}
          .uc-icon svg{width:24px;height:24px;color:#f90}
          .uc-card h3{font-size:22px;font-weight:700;color:#16191f;margin:0 0 8px}
          .uc-sub{font-size:15px;color:#f90;font-weight:600;margin:0 0 12px}
          .uc-card p{font-size:15px;color:#545b64;line-height:1.7;margin:0}

          .benefits{padding:80px 24px;background:#232f3e}
          .benefits h2{font-size:32px;font-weight:700;color:#fff;text-align:center;margin:0 0 48px}
          .ben-grid{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:32px}
          .ben-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:32px}
          .ben-card h3{font-size:20px;font-weight:700;color:#fff;margin:0 0 16px}
          .ben-card p{font-size:15px;color:#d5dbdb;line-height:1.7;margin:0}

          .channels{padding:80px 24px;background:#f2f3f3}
          .channels h2{font-size:32px;font-weight:700;color:#16191f;text-align:center;margin:0 0 48px}
          .ch-grid{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
          .ch-card{background:#fff;border:1px solid #d5dbdb;border-radius:8px;padding:28px;transition:box-shadow .3s}
          .ch-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.08)}
          .ch-badge{display:inline-block;background:#037f0c;color:#fff;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:700;margin-bottom:16px}
          .ch-badge.wa{background:#25d366}
          .ch-badge.voice{background:#0073bb}
          .ch-card h3{font-size:18px;font-weight:700;color:#16191f;margin:0 0 12px}
          .ch-card p{font-size:14px;color:#545b64;line-height:1.6;margin:0 0 16px}
          .ch-link{color:#0073bb;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;gap:4px}
          .ch-link:hover{text-decoration:underline}

          .cta{padding:80px 24px;background:#fff;text-align:center}
          .cta h2{font-size:32px;font-weight:700;color:#16191f;margin:0 0 12px}
          .cta p{font-size:17px;color:#545b64;margin:0 0 28px}

          .ftr{background:#232f3e;padding:24px}
          .ftr-in{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
          .ftr-brand{display:flex;align-items:center;gap:10px;color:#fff;font-weight:600;font-size:14px}
          .ftr-brand img{width:24px;height:24px;border-radius:4px}
          .ftr-in>span{font-size:13px;color:#d5dbdb}

          @media(max-width:1024px){
            .uc-grid,.ben-grid,.ch-grid{grid-template-columns:1fr}
            .hero h1{font-size:32px}
          }
          @media(max-width:768px){
            .hero{padding:100px 16px 60px}
            .hero h1{font-size:28px}
            .hero p{font-size:16px}
            .hero-btns{flex-direction:column;align-items:center}
            .what h2,.benefits h2,.channels h2,.cta h2{font-size:26px}
            .ftr-in{flex-direction:column;gap:12px;text-align:center}
          }
        `}</style>
      </div>
    </>
  );
};

export default HomePage;