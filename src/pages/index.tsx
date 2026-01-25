/**
 * Home Page - WECARE.DIGITAL Landing
 * BotSpace-style with smooth animations
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';

const HomePage: React.FC = () => {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.15, rootMargin: '-50px' }
    );
    
    document.querySelectorAll('.animate-section').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);
  return (
    <>
      <Head>
        <title>WECARE.DIGITAL - Business Communication Platform</title>
        <meta name="description" content="WhatsApp Business API, Payments, Bulk Messaging & AI Support" />
      </Head>
      <div className="landing">
        <header className="header">
          <div className="header-inner">
            <div className="logo">
              <img src="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" alt="WECARE.DIGITAL" className="logo-img" />
              <span className="logo-text">WECARE.DIGITAL</span>
            </div>
            <a href="mailto:hello@wecare.digital" className="header-cta">Contact Us</a>
          </div>
        </header>

        <section className={`hero-section hero-1 animate-section ${isVisible('hero-1') ? 'visible' : ''}`} id="hero-1">
          <div className="hero-content">
            <div className="hero-tag"><span className="tag-dot"></span>WhatsApp Business API</div>
            <h1>Send messages where your customers are</h1>
            <p>Reach customers directly on WhatsApp. No more emails getting lost — just tap, read, and respond instantly.</p>
            <a href="mailto:hello@wecare.digital" className="btn-primary">Get Started </a>
          </div>
          <div className="hero-visual">
            <div className="phone-mockup float-anim">
              <div className="phone-notch"></div>
              <div className="phone-screen">
                <div className="wa-header"><div className="wa-avatar">W</div><div className="wa-info"><span className="wa-name">WECARE.DIGITAL</span><span className="wa-status">online</span></div><span className="wa-verified"></span></div>
                <div className="wa-chat">
                  <div className="wa-msg wa-out"><p>Hi! Your order #1234 has been shipped </p><span className="wa-time">10:30 </span></div>
                  <div className="wa-msg wa-in"><p>Great! When will it arrive?</p><span className="wa-time">10:31</span></div>
                  <div className="wa-msg wa-out"><p>Expected delivery: Tomorrow by 6 PM </p><span className="wa-time">10:31 </span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`hero-section hero-2 animate-section ${isVisible('hero-2') ? 'visible' : ''}`} id="hero-2">
          <div className="hero-visual">
            <div className="phone-mockup float-anim d1">
              <div className="phone-notch"></div>
              <div className="phone-screen">
                <div className="wa-header"><div className="wa-avatar">W</div><div className="wa-info"><span className="wa-name">WECARE.DIGITAL</span><span className="wa-status">online</span></div><span className="wa-verified">?</span></div>
                <div className="wa-chat">
                  <div className="wa-msg wa-out wa-payment">
                    <div className="pay-box"><span className="pay-label">Payment Request</span><span className="pay-amount">?2,499</span><span className="pay-desc">Premium Plan</span></div>
                    <button className="pay-btn">Pay with UPI</button>
                    <span className="wa-time">10:32 ??</span>
                  </div>
                  <div className="wa-msg wa-in"><p>? Payment successful!</p><span className="wa-time">10:33</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-content">
            <div className="hero-tag tag-blue"><span className="tag-dot blue"></span>In-Chat Payments</div>
            <h1>Collect payments without leaving the chat</h1>
            <p>Let customers pay via UPI, cards, and wallets directly in WhatsApp. Secure transactions powered by Razorpay.</p>
            <a href="mailto:hello@wecare.digital" className="btn-primary">Get Started ?</a>
          </div>
        </section>

        <section className={`hero-section hero-3 animate-section ${isVisible('hero-3') ? 'visible' : ''}`} id="hero-3">
          <div className="hero-content">
            <div className="hero-tag tag-purple"><span className="tag-dot purple"></span>AI-Powered Support</div>
            <h1>Respond instantly, around the clock</h1>
            <p>Always-on, lightning-fast replies to customer queries. Let AI handle the routine so your team can focus on what matters.</p>
            <a href="mailto:hello@wecare.digital" className="btn-primary">Get Started ?</a>
          </div>
          <div className="hero-visual">
            <div className="phone-mockup float-anim d2">
              <div className="phone-notch"></div>
              <div className="phone-screen">
                <div className="wa-header"><div className="wa-avatar ai"></div><div className="wa-info"><span className="wa-name">AI Assistant</span><span className="wa-status">always online</span></div></div>
                <div className="wa-chat">
                  <div className="wa-msg wa-in"><p>What are your business hours?</p><span className="wa-time">2:15 AM</span></div>
                  <div className="wa-msg wa-out"><p>We are available 24/7! I can help you anytime. What do you need? </p><span className="wa-time">2:15 </span></div>
                  <div className="typing"><span></span><span></span><span></span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`hero-section hero-4 animate-section ${isVisible('hero-4') ? 'visible' : ''}`} id="hero-4">
          <div className="hero-visual">
            <div className="campaign-card float-anim d3">
              <div className="camp-header"><span className="camp-icon">??</span><div><span className="camp-title">Diwali Sale Campaign</span><span className="camp-date">Sent Oct 15, 2025</span></div></div>
              <div className="camp-stats">
                <div className="stat-box"><span className="stat-num">5,000</span><span className="stat-label">Sent</span></div>
                <div className="stat-box"><span className="stat-num">4,892</span><span className="stat-label">Delivered</span></div>
                <div className="stat-box hl"><span className="stat-num">2,341</span><span className="stat-label">Read</span></div>
              </div>
              <div className="camp-bar"><div className="bar-fill"></div></div>
              <div className="camp-footer"><span className="camp-status">? Completed</span><span className="camp-rate">98% delivery</span></div>
            </div>
          </div>
          <div className="hero-content">
            <div className="hero-tag tag-orange"><span className="tag-dot orange"></span>Bulk Campaigns</div>
            <h1>Scale your outreach effortlessly</h1>
            <p>Send personalized messages to thousands of contacts. Schedule campaigns, track delivery, and measure engagement in real-time.</p>
            <a href="mailto:hello@wecare.digital" className="btn-primary">Get Started ?</a>
          </div>
        </section>

        <section className={`features animate-section ${isVisible('features') ? 'visible' : ''}`} id="features">
          <div className="features-inner">
            <h2>Everything you need to grow</h2>
            <p className="features-sub">One platform for all your business communication</p>
            <div className="features-grid">
              <div className="f-card"><div className="f-icon">??</div><h3>WhatsApp API</h3><p>Official Business API with green tick</p></div>
              <div className="f-card"><div className="f-icon">??</div><h3>Payments</h3><p>UPI, cards and wallets via Razorpay</p></div>
              <div className="f-card"><div className="f-icon">??</div><h3>AI Support</h3><p>24/7 automated responses</p></div>
              <div className="f-card"><div className="f-icon">??</div><h3>Bulk Messaging</h3><p>Send to thousands instantly</p></div>
              <div className="f-card"><div className="f-icon">??</div><h3>Multi-Channel</h3><p>SMS, Email, Voice and RCS</p></div>
              <div className="f-card"><div className="f-icon">??</div><h3>Analytics</h3><p>Real-time insights and reports</p></div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to get started?</h2>
          <p>Transform how you communicate with customers</p>
          <a href="mailto:hello@wecare.digital" className="btn-primary btn-lg">Contact Sales ?</a>
        </section>

        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand"><img src="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" alt="" className="footer-logo" /><span>WECARE.DIGITAL</span></div>
            <span className="footer-copy">© 2026 WECARE.DIGITAL</span>
          </div>
        </footer>

        <style jsx>{`
          .landing { min-height:100vh; background:#fff; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#1a1a1a; overflow-x:hidden; }
          .header { position:fixed; top:0; left:0; right:0; z-index:100; background:rgba(255,255,255,0.95); backdrop-filter:blur(20px); border-bottom:1px solid rgba(0,0,0,0.05); }
          .header-inner { max-width:1200px; margin:0 auto; padding:16px 24px; display:flex; justify-content:space-between; align-items:center; }
          .logo { display:flex; align-items:center; gap:12px; }
          .logo-img { width:42px; height:42px; border-radius:12px; }
          .logo-text { font-weight:700; font-size:18px; color:#1a1a1a; letter-spacing:-0.5px; }
          .header-cta { color:#555; text-decoration:none; font-size:14px; font-weight:600; padding:12px 24px; border-radius:12px; border:1px solid #e5e5e5; transition:all 0.2s; }
          .header-cta:hover { background:#f5f5f5; border-color:#ddd; }
          .hero-section { min-height:100vh; display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; padding:100px 24px; max-width:1200px; margin:0 auto; opacity:0; transform:translateY(60px); transition:all 0.8s cubic-bezier(0.16,1,0.3,1); }
          .hero-section.visible { opacity:1; transform:translateY(0); }
          .hero-1 { padding-top:140px; }
          .hero-2,.hero-4 { direction:rtl; }
          .hero-2>*,.hero-4>* { direction:ltr; }
          .hero-2 { background:linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%); margin-left:calc(-50vw + 50%); margin-right:calc(-50vw + 50%); padding-left:calc(50vw - 600px + 24px); padding-right:calc(50vw - 600px + 24px); max-width:none; }
          .hero-4 { background:linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%); margin-left:calc(-50vw + 50%); margin-right:calc(-50vw + 50%); padding-left:calc(50vw - 600px + 24px); padding-right:calc(50vw - 600px + 24px); max-width:none; }
          .hero-content h1 { font-size:52px; font-weight:800; line-height:1.1; color:#0f172a; margin:0 0 20px; letter-spacing:-2px; }
          .hero-content p { font-size:19px; color:#475569; line-height:1.7; margin:0 0 32px; max-width:460px; }
          .hero-tag { display:inline-flex; align-items:center; gap:8px; background:#ecfdf5; padding:10px 18px; border-radius:100px; font-size:13px; color:#059669; font-weight:600; margin-bottom:24px; border:1px solid #a7f3d0; }
          .tag-blue { background:#eff6ff; color:#2563eb; border-color:#bfdbfe; }
          .tag-purple { background:#f5f3ff; color:#7c3aed; border-color:#ddd6fe; }
          .tag-orange { background:#fff7ed; color:#ea580c; border-color:#fed7aa; }
          .tag-dot { width:8px; height:8px; background:#10b981; border-radius:50%; animation:pulse 2s infinite; }
          .tag-dot.blue { background:#3b82f6; }
          .tag-dot.purple { background:#8b5cf6; }
          .tag-dot.orange { background:#f97316; }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
          .btn-primary { display:inline-flex; align-items:center; gap:10px; background:linear-gradient(135deg,#25d366 0%,#128c7e 100%); color:#fff; padding:16px 32px; border-radius:14px; text-decoration:none; font-size:16px; font-weight:600; transition:all 0.3s; box-shadow:0 8px 30px rgba(37,211,102,0.3); }
          .btn-primary:hover { transform:translateY(-3px); box-shadow:0 12px 40px rgba(37,211,102,0.4); }
          .btn-lg { padding:18px 40px; font-size:17px; }
          .hero-visual { display:flex; justify-content:center; }
          .phone-mockup { width:320px; background:#1a1a1a; border-radius:44px; padding:12px; box-shadow:0 50px 100px rgba(0,0,0,0.15); }
          .phone-notch { width:120px; height:28px; background:#1a1a1a; border-radius:20px; margin:0 auto 8px; }
          .phone-screen { background:#fff; border-radius:32px; overflow:hidden; }
          .wa-header { background:#075e54; padding:14px 16px; display:flex; align-items:center; gap:12px; }
          .wa-avatar { width:42px; height:42px; background:linear-gradient(135deg,#25d366 0%,#128c7e 100%); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:16px; }
          .wa-avatar.ai { background:linear-gradient(135deg,#8b5cf6 0%,#6366f1 100%); font-size:20px; }
          .wa-info { flex:1; }
          .wa-name { display:block; color:#fff; font-weight:600; font-size:15px; }
          .wa-status { display:block; color:rgba(255,255,255,0.7); font-size:12px; }
          .wa-verified { background:#25d366; color:#fff; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; }
          .wa-chat { background:linear-gradient(180deg,#ece5dd 0%,#d9d2c5 100%); padding:16px 12px; min-height:300px; display:flex; flex-direction:column; gap:8px; }
          .wa-msg { max-width:85%; padding:10px 14px; border-radius:12px; font-size:14px; line-height:1.5; box-shadow:0 1px 2px rgba(0,0,0,0.06); }
          .wa-msg p { margin:0 0 4px; }
          .wa-time { font-size:11px; color:#667781; display:block; text-align:right; }
          .wa-in { background:#fff; align-self:flex-start; border-bottom-left-radius:4px; }
          .wa-out { background:#d9fdd3; align-self:flex-end; border-bottom-right-radius:4px; }
          .wa-payment { padding:14px; }
          .pay-box { display:flex; flex-direction:column; gap:2px; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid rgba(0,0,0,0.08); }
          .pay-label { font-size:12px; color:#667781; }
          .pay-amount { font-size:32px; font-weight:800; color:#1a1a1a; }
          .pay-desc { font-size:13px; color:#475569; }
          .pay-btn { background:#25d366; color:#fff; border:none; padding:14px; border-radius:10px; font-weight:600; font-size:15px; cursor:pointer; margin-bottom:8px; width:100%; }
          .typing { display:flex; gap:4px; padding:14px 18px; background:#fff; border-radius:12px; align-self:flex-start; border-bottom-left-radius:4px; }
          .typing span { width:8px; height:8px; background:#90949c; border-radius:50%; animation:bounce 1.4s infinite; }
          .typing span:nth-child(2) { animation-delay:0.2s; }
          .typing span:nth-child(3) { animation-delay:0.4s; }
          @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-8px)} }
          .float-anim { animation:float 5s ease-in-out infinite; }
          .d1 { animation-delay:0.5s; }
          .d2 { animation-delay:1s; }
          .d3 { animation-delay:1.5s; }
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
          .campaign-card { width:360px; background:#fff; border-radius:28px; padding:28px; box-shadow:0 50px 100px rgba(0,0,0,0.1); border:1px solid #f1f5f9; }
          .camp-header { display:flex; align-items:center; gap:14px; margin-bottom:28px; }
          .camp-icon { font-size:36px; }
          .camp-title { display:block; font-size:18px; font-weight:700; color:#0f172a; }
          .camp-date { display:block; font-size:13px; color:#64748b; }
          .camp-stats { display:flex; justify-content:space-between; margin-bottom:20px; }
          .stat-box { text-align:center; }
          .stat-box.hl .stat-num { color:#059669; }
          .stat-num { display:block; font-size:32px; font-weight:800; color:#0f172a; }
          .stat-label { font-size:13px; color:#64748b; }
          .camp-bar { height:10px; background:#f1f5f9; border-radius:5px; overflow:hidden; margin-bottom:16px; }
          .bar-fill { height:100%; width:98%; background:linear-gradient(90deg,#25d366 0%,#128c7e 100%); border-radius:5px; }
          .camp-footer { display:flex; justify-content:space-between; align-items:center; }
          .camp-status { font-size:14px; color:#059669; font-weight:600; }
          .camp-rate { font-size:13px; color:#64748b; }
          .features { padding:120px 24px; background:#f8fafc; opacity:0; transform:translateY(60px); transition:all 0.8s cubic-bezier(0.16,1,0.3,1); }
          .features.visible { opacity:1; transform:translateY(0); }
          .features-inner { max-width:1200px; margin:0 auto; text-align:center; }
          .features-inner h2 { font-size:44px; font-weight:800; color:#0f172a; margin:0 0 12px; letter-spacing:-1.5px; }
          .features-sub { font-size:19px; color:#64748b; margin:0 0 60px; }
          .features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
          .f-card { background:#fff; border-radius:24px; padding:36px 28px; text-align:center; border:1px solid #e2e8f0; transition:all 0.3s; }
          .f-card:hover { border-color:#cbd5e1; box-shadow:0 25px 60px rgba(0,0,0,0.08); transform:translateY(-6px); }
          .f-icon { font-size:48px; display:block; margin-bottom:20px; }
          .f-card h3 { font-size:20px; font-weight:700; color:#0f172a; margin:0 0 8px; }
          .f-card p { font-size:15px; color:#64748b; margin:0; line-height:1.5; }
          .cta-section { padding:120px 24px; text-align:center; background:linear-gradient(180deg,#fff 0%,#ecfdf5 100%); }
          .cta-section h2 { font-size:44px; font-weight:800; color:#0f172a; margin:0 0 12px; letter-spacing:-1.5px; }
          .cta-section p { font-size:19px; color:#64748b; margin:0 0 36px; }
          .footer { border-top:1px solid #e2e8f0; padding:28px 24px; background:#fff; }
          .footer-inner { max-width:1200px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; }
          .footer-brand { display:flex; align-items:center; gap:10px; font-weight:600; color:#0f172a; font-size:15px; }
          .footer-logo { width:28px; height:28px; border-radius:8px; }
          .footer-copy { font-size:14px; color:#94a3b8; }
          @media (max-width:1024px) {
            .hero-section { grid-template-columns:1fr; min-height:auto; padding:80px 24px; gap:50px; text-align:center; }
            .hero-1 { padding-top:120px; }
            .hero-2,.hero-4 { direction:ltr; padding-left:24px; padding-right:24px; }
            .hero-content p { margin-left:auto; margin-right:auto; }
            .hero-content h1 { font-size:42px; }
            .features-grid { grid-template-columns:repeat(2,1fr); }
          }
          @media (max-width:768px) {
            .hero-content h1 { font-size:36px; letter-spacing:-1px; }
            .hero-content p { font-size:17px; }
            .features-grid { grid-template-columns:1fr; max-width:400px; margin:0 auto; }
            .features-inner h2,.cta-section h2 { font-size:34px; }
            .phone-mockup { width:280px; }
            .campaign-card { width:300px; }
          }
          @media (max-width:480px) {
            .hero-section { padding:60px 16px; }
            .hero-1 { padding-top:100px; }
            .hero-content h1 { font-size:32px; }
            .hero-content p { font-size:16px; }
            .logo-text { font-size:16px; }
            .header-inner { padding:12px 16px; }
            .footer-inner { flex-direction:column; gap:12px; }
            .phone-mockup { width:260px; }
            .campaign-card { width:100%; max-width:300px; }
            .btn-primary { padding:14px 28px; font-size:15px; }
          }
        `}</style>
      </div>
    </>
  );
};

export default HomePage;
