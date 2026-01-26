/**
 * WECARE.DIGITAL Landing Page
 * WhatsApp-themed, Sinch-inspired design
 */

import React from 'react';
import Head from 'next/head';

const HomePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>WECARE.DIGITAL - WhatsApp Business Communication Platform</title>
        <meta name="description" content="Connect with customers on WhatsApp, SMS, Voice. Collect payments, automate support." />
      </Head>

      <div className="page">
        {/* Header */}
        <header className="header">
          <div className="header-in">
            <div className="logo">
              <img src="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" alt="WECARE.DIGITAL" />
              <span>WECARE.DIGITAL</span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero">
          <div className="hero-in">
            <div className="hero-text">
              <span className="hero-label">WHATSAPP BUSINESS API</span>
              <h1>Connect with customers on the world's most popular messaging app</h1>
              <p>Send notifications, collect payments, automate support - all through official WhatsApp Business API. Built on AWS infrastructure.</p>
              <div className="partners">
                <span>AWS</span>
                <span>Razorpay</span>
                <span>Airtel</span>
              </div>
            </div>
            <div className="hero-visual">
              {/* WhatsApp Phone Mockup */}
              <div className="phone">
                <div className="phone-header">
                  <div className="phone-back">←</div>
                  <div className="phone-avatar">W</div>
                  <div className="phone-info">
                    <strong>WECARE.DIGITAL</strong>
                    <span>online</span>
                  </div>
                  <div className="phone-tick">✓</div>
                </div>
                <div className="phone-chat">
                  <div className="msg out">Hi! Your order #1234 has been shipped 📦<span className="time">10:30</span></div>
                  <div className="msg in">When will it arrive?<span className="time">10:31</span></div>
                  <div className="msg out">Tomorrow by 6 PM<span className="time">10:31</span></div>
                  <div className="msg out">Track here: wecare.digital/track/1234<span className="time">10:31</span></div>
                  <div className="msg typing"><span></span><span></span><span></span></div>
                </div>
              </div>
              {/* Code Snippet */}
              <div className="code">
                <div className="code-header">
                  <i className="dot red"></i>
                  <i className="dot yellow"></i>
                  <i className="dot green"></i>
                  <span>send_message.py</span>
                </div>
                <pre className="code-body">{`response = requests.post(
  "api.wecare.digital/v1/send",
  json={
    "to": "+919876543210",
    "type": "text",
    "message": "Your OTP: 123456"
  },
  headers={"Authorization": api_key}
)`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="products">
          <div className="products-in">
            <h2>Everything you need to engage customers</h2>
            <div className="product-grid">
              <div className="product-card">
                <div className="product-icon wa">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <h3>WhatsApp Business API</h3>
                <p>Official API access with templates, media messages, interactive buttons, and catalog support.</p>
              </div>
              <div className="product-card">
                <div className="product-icon sms">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <h3>SMS and Voice</h3>
                <p>Reach customers instantly with SMS notifications and automated voice calls across India.</p>
              </div>
              <div className="product-card">
                <div className="product-icon pay">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                </div>
                <h3>In-Chat Payments</h3>
                <p>Collect payments via UPI, cards, and wallets directly in WhatsApp. Powered by Razorpay.</p>
              </div>
              <div className="product-card">
                <div className="product-icon ai">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <h3>AI-Powered Support</h3>
                <p>Automate customer queries 24/7 with intelligent chatbots that understand context.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="how">
          <div className="how-in">
            <h2>From first message to first million</h2>
            <div className="how-grid">
              <div className="how-item">
                <div className="how-icon"></div>
                <h3>Setup in Minutes</h3>
                <p>Go live with WhatsApp Business API in under 10 minutes. No complex integrations.</p>
              </div>
              <div className="how-item">
                <div className="how-icon"></div>
                <h3>Scale Without Limits</h3>
                <p>From 100 to 100,000 messages. Our infrastructure grows with your business.</p>
              </div>
              <div className="how-item">
                <div className="how-icon"></div>
                <h3>Enterprise Security</h3>
                <p>Built on AWS with bank-grade encryption. Your data is always protected.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-in">
            <div className="footer-brand">
              <img src="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" alt="" />
              <span>WECARE.DIGITAL</span>
            </div>
            <p className="footer-mission">Building the digital railroads for business communication across Bharat and beyond.</p>
            <div className="footer-divider"></div>
            <p className="footer-eco">Part of the WECARE.DIGITAL ecosystem</p>
            <p className="footer-copy"> 2026 WECARE.DIGITAL</p>
          </div>
        </footer>

        <style jsx>{`
          .page{background:#fff;color:#111B21;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}

          /* Header */
          .header{position:fixed;top:0;left:0;right:0;z-index:100;background:#fff;border-bottom:1px solid #e5e5e5}
          .header-in{max-width:1200px;margin:0 auto;padding:16px 24px}
          .logo{display:flex;align-items:center;gap:12px;font-weight:700;font-size:20px;color:#111B21}
          .logo img{width:40px;height:40px;border-radius:10px}

          /* Hero */
          .hero{background:#E7F7EF;padding:120px 24px 80px}
          .hero-in{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1.2fr;gap:60px;align-items:center}
          .hero-label{display:inline-block;background:#25D366;color:#fff;padding:6px 14px;border-radius:4px;font-size:12px;font-weight:700;letter-spacing:1px;margin-bottom:20px}
          .hero-text h1{font-size:42px;font-weight:800;line-height:1.2;color:#111B21;margin:0 0 20px;letter-spacing:-1px}
          .hero-text p{font-size:18px;color:#667781;line-height:1.7;margin:0 0 28px;max-width:500px}
          .partners{display:flex;gap:32px}
          .partners span{font-size:16px;font-weight:700;color:#667781}

          /* Phone Mockup */
          .hero-visual{position:relative;display:flex;justify-content:center}
          .phone{width:280px;background:#fff;border-radius:32px;box-shadow:0 25px 80px rgba(0,0,0,.15);overflow:hidden;position:relative;z-index:2}
          .phone-header{background:#075E54;padding:12px 16px;display:flex;align-items:center;gap:10px}
          .phone-back{color:#fff;font-size:18px}
          .phone-avatar{width:36px;height:36px;background:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px}
          .phone-info{flex:1;display:flex;flex-direction:column}
          .phone-info strong{color:#fff;font-size:14px}
          .phone-info span{color:rgba(255,255,255,.7);font-size:11px}
          .phone-tick{background:#25D366;color:#fff;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px}
          .phone-chat{background:linear-gradient(180deg,#ECE5DD 0%,#D9D2C5 100%);padding:16px 12px;min-height:280px;display:flex;flex-direction:column;gap:8px}
          .msg{max-width:85%;padding:8px 12px;border-radius:8px;font-size:13px;line-height:1.4;position:relative}
          .msg .time{display:block;font-size:10px;color:#667781;text-align:right;margin-top:4px}
          .msg.out{background:#DCF8C6;align-self:flex-end;border-bottom-right-radius:2px}
          .msg.in{background:#fff;align-self:flex-start;border-bottom-left-radius:2px}
          .msg.typing{background:#fff;display:flex;gap:4px;padding:12px 16px;align-self:flex-start;border-bottom-left-radius:2px}
          .msg.typing span{width:8px;height:8px;background:#667781;border-radius:50%;animation:bounce 1.4s infinite}
          .msg.typing span:nth-child(2){animation-delay:.2s}
          .msg.typing span:nth-child(3){animation-delay:.4s}
          @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}

          /* Code Snippet */
          .code{position:absolute;right:-40px;bottom:20px;width:320px;background:#1E293B;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.25);z-index:3}
          .code-header{background:#0F172A;padding:10px 14px;display:flex;align-items:center;gap:6px}
          .dot{width:10px;height:10px;border-radius:50%}
          .dot.red{background:#EF4444}
          .dot.yellow{background:#EAB308}
          .dot.green{background:#22C55E}
          .code-header span{margin-left:auto;font-size:11px;color:#64748B}
          .code-body{margin:0;padding:14px;font-family:'SF Mono',Monaco,Consolas,monospace;font-size:11px;line-height:1.6;color:#E2E8F0;overflow-x:auto}

          /* Products */
          .products{padding:100px 24px;background:#fff}
          .products-in{max-width:1100px;margin:0 auto}
          .products-in h2{font-size:36px;font-weight:800;color:#111B21;text-align:center;margin:0 0 50px;letter-spacing:-1px}
          .product-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
          .product-card{background:#fff;border:1px solid #E5E5E5;border-radius:16px;padding:32px;transition:all .3s}
          .product-card:hover{border-color:#25D366;box-shadow:0 10px 40px rgba(37,211,102,.1)}
          .product-icon{width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px}
          .product-icon svg{width:26px;height:26px}
          .product-icon.wa{background:#DCFCE7;color:#16A34A}
          .product-icon.sms{background:#E0F2FE;color:#0284C7}
          .product-icon.pay{background:#FEF3C7;color:#D97706}
          .product-icon.ai{background:#F3E8FF;color:#9333EA}
          .product-card h3{font-size:20px;font-weight:700;color:#111B21;margin:0 0 10px}
          .product-card p{font-size:15px;color:#667781;line-height:1.6;margin:0}

          /* How It Works */
          .how{padding:100px 24px;background:#F8FAF9}
          .how-in{max-width:1000px;margin:0 auto}
          .how-in h2{font-size:36px;font-weight:800;color:#111B21;text-align:center;margin:0 0 50px;letter-spacing:-1px}
          .how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:40px}
          .how-item{text-align:center}
          .how-icon{font-size:40px;margin-bottom:16px}
          .how-item h3{font-size:20px;font-weight:700;color:#111B21;margin:0 0 10px}
          .how-item p{font-size:15px;color:#667781;line-height:1.6;margin:0}

          /* Footer */
          .footer{padding:60px 24px;background:#fff;border-top:1px solid #E5E5E5}
          .footer-in{max-width:600px;margin:0 auto;text-align:center}
          .footer-brand{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:16px}
          .footer-brand img{width:32px;height:32px;border-radius:8px}
          .footer-brand span{font-size:18px;font-weight:700;color:#111B21}
          .footer-mission{font-size:15px;color:#667781;line-height:1.6;margin:0 0 24px}
          .footer-divider{width:60px;height:2px;background:#25D366;margin:0 auto 24px}
          .footer-eco{font-size:13px;color:#667781;margin:0 0 8px}
          .footer-copy{font-size:13px;color:#9CA3AF;margin:0}

          /* Responsive */
          @media(max-width:1024px){
            .hero-in{grid-template-columns:1fr;text-align:center}
            .hero-text p{margin-left:auto;margin-right:auto}
            .partners{justify-content:center}
            .hero-visual{margin-top:40px}
            .code{position:relative;right:0;bottom:0;margin-top:-60px;margin-left:auto;margin-right:auto}
            .product-grid{grid-template-columns:1fr}
          }
          @media(max-width:768px){
            .hero{padding:100px 16px 60px}
            .hero-text h1{font-size:32px}
            .products-in h2,.how-in h2{font-size:28px}
            .how-grid{grid-template-columns:1fr;gap:32px}
            .phone{width:260px}
            .code{width:280px}
          }
        `}</style>
      </div>
    </>
  );
};

export default HomePage;