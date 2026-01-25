/**
 * WECARE.DIGITAL Landing Page
 * Modern SaaS design inspired by Twilio, Zendesk, Intercom
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';

const HomePage: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [msgCount, setMsgCount] = useState(0);

  useEffect(() => {
    setLoaded(true);
    let c = 0;
    const i = setInterval(() => {
      c += 5000;
      if (c >= 500000) { setMsgCount(500000); clearInterval(i); }
      else setMsgCount(c);
    }, 20);
    return () => clearInterval(i);
  }, []);

  return (
    <>
      <Head>
        <title>WECARE.DIGITAL - Customer Communication Platform</title>
        <meta name="description" content="WhatsApp, SMS, Email, Voice - All in one platform" />
      </Head>

      <div className="page">
        <nav className="nav">
          <div className="nav-in">
            <div className="logo">
              <img src="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" alt="" />
              <span>WECARE.DIGITAL</span>
            </div>
            <a href="mailto:hello@wecare.digital" className="nav-cta">Get Started</a>
          </div>
        </nav>

        <section className={`hero ${loaded ? 'loaded' : ''}`}>
          <div className="hero-bg"></div>
          <div className="hero-content">
            <div className="hero-badge">Trusted by growing businesses</div>
            <h1>Where amazing customer<br/>experiences are built</h1>
            <p>The complete communication platform that combines WhatsApp, SMS, Email, Voice and Payments - all powered by AI.</p>
            <div className="hero-actions">
              <a href="mailto:hello@wecare.digital" className="btn-main">Start for free</a>
              <a href="mailto:hello@wecare.digital" className="btn-ghost">Talk to sales</a>
            </div>
            <div className="hero-trust">
              <span>No credit card required</span>
              <span>Setup in minutes</span>
              <span>Cancel anytime</span>
            </div>
          </div>
        </section>

        <section className="stats">
          <div className="stats-in">
            <div className="stat">
              <div className="stat-num">{msgCount.toLocaleString()}+</div>
              <div className="stat-label">Messages delivered</div>
            </div>
            <div className="stat">
              <div className="stat-num">99.9%</div>
              <div className="stat-label">Uptime SLA</div>
            </div>
            <div className="stat">
              <div className="stat-num">24/7</div>
              <div className="stat-label">Support available</div>
            </div>
          </div>
        </section>

        <section className="products">
          <div className="products-in">
            <div className="section-head">
              <h2>The ultimate toolbox for customer engagement</h2>
              <p>Everything you need to connect with customers across every channel</p>
            </div>
            <div className="product-grid">
              <div className="product-card">
                <div className="product-icon wa">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <h3>WhatsApp Business API</h3>
                <p>Send rich, interactive messages on the world's most popular messaging app. Templates, media, buttons and more.</p>
                <a href="mailto:hello@wecare.digital" className="product-link">Learn more </a>
              </div>
              <div className="product-card">
                <div className="product-icon sms">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <h3>SMS & Voice</h3>
                <p>Reach customers instantly with SMS notifications and automated voice calls. Global coverage with local numbers.</p>
                <a href="mailto:hello@wecare.digital" className="product-link">Learn more </a>
              </div>
              <div className="product-card">
                <div className="product-icon pay">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                </div>
                <h3>In-Chat Payments</h3>
                <p>Collect payments directly in WhatsApp conversations. UPI, cards, wallets - powered by Razorpay.</p>
                <a href="mailto:hello@wecare.digital" className="product-link">Learn more </a>
              </div>
              <div className="product-card">
                <div className="product-icon ai">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <h3>AI-Powered Support</h3>
                <p>Automate responses with intelligent chatbots. Handle queries 24/7 while your team focuses on complex issues.</p>
                <a href="mailto:hello@wecare.digital" className="product-link">Learn more </a>
              </div>
            </div>
          </div>
        </section>

        <section className="value">
          <div className="value-in">
            <div className="value-content">
              <h2>Built for scale, designed for simplicity</h2>
              <p>Whether you are sending 100 messages or 100,000, our platform handles it effortlessly. No complex setup, no hidden fees.</p>
              <ul className="value-list">
                <li><span className="check"></span> Works out of the box - start in minutes</li>
                <li><span className="check"></span> Pay only for what you use</li>
                <li><span className="check"></span> Enterprise-grade security on AWS</li>
                <li><span className="check"></span> Dedicated support team</li>
              </ul>
              <a href="mailto:hello@wecare.digital" className="btn-main">Get started free</a>
            </div>
            <div className="value-visual">
              <div className="mock-chat">
                <div className="mock-header">
                  <div className="mock-avatar">W</div>
                  <div className="mock-info"><strong>WECARE.DIGITAL</strong><span>Online</span></div>
                </div>
                <div className="mock-messages">
                  <div className="mock-msg out">Hi! Your order #1234 has been shipped </div>
                  <div className="mock-msg in">When will it arrive?</div>
                  <div className="mock-msg out">Expected delivery: Tomorrow by 6 PM</div>
                  <div className="mock-msg out typing"><span></span><span></span><span></span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="cta-in">
            <h2>Ready to transform your customer communication?</h2>
            <p>Join businesses that trust WECARE.DIGITAL for their messaging needs</p>
            <a href="mailto:hello@wecare.digital" className="btn-main lg">Start your free trial</a>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-in">
            <div className="footer-brand">
              <img src="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" alt="" />
              <span>WECARE.DIGITAL</span>
            </div>
            <div className="footer-copy"> 2026 WECARE.DIGITAL. All rights reserved.</div>
          </div>
        </footer>

        <style jsx>{`
          .page{background:#fff;color:#1a1a2e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}

          .nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.06)}
          .nav-in{max-width:1200px;margin:0 auto;padding:16px 24px;display:flex;justify-content:space-between;align-items:center}
          .logo{display:flex;align-items:center;gap:12px;font-weight:700;font-size:20px;color:#1a1a2e}
          .logo img{width:40px;height:40px;border-radius:10px}
          .nav-cta{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;transition:transform .2s,box-shadow .2s}
          .nav-cta:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(102,126,234,.4)}

          .hero{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:120px 24px 80px;overflow:hidden}
          .hero-bg{position:absolute;inset:0;background:linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%);opacity:0;transition:opacity 1s ease}
          .hero.loaded .hero-bg{opacity:1}
          .hero-content{position:relative;z-index:1;text-align:center;max-width:800px}
          .hero-badge{display:inline-block;background:rgba(255,255,255,.2);color:#fff;padding:8px 20px;border-radius:50px;font-size:14px;font-weight:500;margin-bottom:24px;backdrop-filter:blur(10px)}
          .hero h1{font-size:56px;font-weight:800;color:#fff;line-height:1.15;margin:0 0 24px;letter-spacing:-2px}
          .hero p{font-size:20px;color:rgba(255,255,255,.9);line-height:1.6;margin:0 0 36px;max-width:600px;margin-left:auto;margin-right:auto}
          .hero-actions{display:flex;gap:16px;justify-content:center;margin-bottom:32px}
          .btn-main{background:#fff;color:#667eea;padding:16px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;transition:all .3s;box-shadow:0 4px 20px rgba(0,0,0,.15)}
          .btn-main:hover{transform:translateY(-3px);box-shadow:0 10px 40px rgba(0,0,0,.2)}
          .btn-main.lg{padding:18px 40px;font-size:17px}
          .btn-ghost{background:transparent;color:#fff;padding:16px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;border:2px solid rgba(255,255,255,.4);transition:all .3s}
          .btn-ghost:hover{background:rgba(255,255,255,.1);border-color:#fff}
          .hero-trust{display:flex;gap:24px;justify-content:center;flex-wrap:wrap}
          .hero-trust span{color:rgba(255,255,255,.8);font-size:14px;display:flex;align-items:center;gap:6px}
          .hero-trust span::before{content:'';color:#4ade80;font-weight:700}

          .stats{background:#f8f9fc;padding:60px 24px}
          .stats-in{max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:40px;text-align:center}
          .stat-num{font-size:48px;font-weight:800;color:#667eea;line-height:1}
          .stat-label{font-size:16px;color:#64748b;margin-top:8px}

          .products{padding:100px 24px;background:#fff}
          .products-in{max-width:1200px;margin:0 auto}
          .section-head{text-align:center;margin-bottom:60px}
          .section-head h2{font-size:40px;font-weight:800;color:#1a1a2e;margin:0 0 16px;letter-spacing:-1px}
          .section-head p{font-size:18px;color:#64748b;margin:0}
          .product-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
          .product-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:32px;transition:all .3s}
          .product-card:hover{border-color:#667eea;box-shadow:0 20px 60px rgba(102,126,234,.12);transform:translateY(-4px)}
          .product-icon{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:20px}
          .product-icon svg{width:28px;height:28px}
          .product-icon.wa{background:#dcfce7;color:#16a34a}
          .product-icon.sms{background:#dbeafe;color:#2563eb}
          .product-icon.pay{background:#fef3c7;color:#d97706}
          .product-icon.ai{background:#f3e8ff;color:#9333ea}
          .product-card h3{font-size:22px;font-weight:700;color:#1a1a2e;margin:0 0 12px}
          .product-card p{font-size:15px;color:#64748b;line-height:1.7;margin:0 0 20px}
          .product-link{color:#667eea;text-decoration:none;font-weight:600;font-size:15px;transition:color .2s}
          .product-link:hover{color:#764ba2}

          .value{padding:100px 24px;background:linear-gradient(180deg,#f8f9fc 0%,#fff 100%)}
          .value-in{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
          .value-content h2{font-size:36px;font-weight:800;color:#1a1a2e;margin:0 0 20px;letter-spacing:-1px}
          .value-content p{font-size:17px;color:#64748b;line-height:1.7;margin:0 0 28px}
          .value-list{list-style:none;padding:0;margin:0 0 32px}
          .value-list li{display:flex;align-items:center;gap:12px;font-size:16px;color:#1a1a2e;padding:10px 0}
          .check{color:#16a34a;font-weight:700}

          .mock-chat{background:#1a1a2e;border-radius:24px;padding:16px;width:320px;box-shadow:0 40px 80px rgba(0,0,0,.2)}
          .mock-header{display:flex;align-items:center;gap:12px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,.1)}
          .mock-avatar{width:44px;height:44px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px}
          .mock-info{display:flex;flex-direction:column}
          .mock-info strong{color:#fff;font-size:15px}
          .mock-info span{color:rgba(255,255,255,.5);font-size:12px}
          .mock-messages{padding-top:16px;display:flex;flex-direction:column;gap:10px}
          .mock-msg{max-width:85%;padding:12px 16px;border-radius:16px;font-size:14px;line-height:1.5}
          .mock-msg.out{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
          .mock-msg.in{background:#2d2d44;color:#fff;align-self:flex-start;border-bottom-left-radius:4px}
          .mock-msg.typing{background:#2d2d44;display:flex;gap:4px;padding:16px 20px}
          .mock-msg.typing span{width:8px;height:8px;background:rgba(255,255,255,.4);border-radius:50%;animation:bounce 1.4s infinite}
          .mock-msg.typing span:nth-child(2){animation-delay:.2s}
          .mock-msg.typing span:nth-child(3){animation-delay:.4s}
          @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}

          .cta{padding:100px 24px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);text-align:center}
          .cta-in{max-width:700px;margin:0 auto}
          .cta h2{font-size:36px;font-weight:800;color:#fff;margin:0 0 16px;letter-spacing:-1px}
          .cta p{font-size:18px;color:rgba(255,255,255,.9);margin:0 0 32px}

          .footer{background:#1a1a2e;padding:32px 24px}
          .footer-in{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
          .footer-brand{display:flex;align-items:center;gap:10px;color:#fff;font-weight:600}
          .footer-brand img{width:28px;height:28px;border-radius:6px}
          .footer-copy{color:rgba(255,255,255,.5);font-size:14px}

          @media(max-width:1024px){
            .product-grid{grid-template-columns:1fr}
            .value-in{grid-template-columns:1fr;text-align:center}
            .value-visual{display:flex;justify-content:center}
          }
          @media(max-width:768px){
            .hero h1{font-size:36px}
            .stats-in{grid-template-columns:1fr;gap:24px}
            .stat-num{font-size:36px}
            .section-head h2,.value-content h2,.cta h2{font-size:28px}
            .hero-actions{flex-direction:column;align-items:center}
            .hero-trust{flex-direction:column;gap:12px}
            .footer-in{flex-direction:column;gap:16px;text-align:center}
            .mock-chat{width:100%;max-width:300px}
          }
        `}</style>
      </div>
    </>
  );
};

export default HomePage;