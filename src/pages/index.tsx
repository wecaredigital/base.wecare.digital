/**
 * Home Page - WECARE.DIGITAL Landing
 * Notion + WhatsApp themed - Clean, minimal design
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';

const HomePage: React.FC = () => {
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);
  const [activeUseCaseTab, setActiveUseCaseTab] = useState(0);
  
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setVisible((p) => new Set([...p, e.target.id]));
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.anim').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const show = (id: string) => visible.has(id);

  const featureTabs = [
    { title: 'Rich Media', desc: 'Send images, videos, documents, and interactive buttons', icon: '' },
    { title: 'Templates', desc: 'Pre-approved message templates for notifications', icon: '' },
    { title: 'Catalogs', desc: 'Showcase products directly in WhatsApp chats', icon: '' },
    { title: 'Payments', desc: 'Accept payments without leaving the conversation', icon: '' },
    { title: 'Chatbots', desc: 'AI-powered automated responses 24/7', icon: '' },
  ];

  const useCaseTabs = [
    { title: 'Promotional', desc: 'Drive sales with targeted campaigns, offers, and product launches. Reach customers with personalized promotions that convert.', icon: '' },
    { title: 'Transactional', desc: 'Send order confirmations, shipping updates, and delivery notifications. Keep customers informed at every step.', icon: '' },
    { title: 'Appointments', desc: 'Automate booking confirmations, reminders, and rescheduling. Reduce no-shows with timely notifications.', icon: '' },
    { title: 'OTPs', desc: 'Secure authentication with one-time passwords. Fast, reliable delivery for login and verification flows.', icon: '' },
    { title: 'Orders', desc: 'Complete order management from cart to delivery. Enable customers to track, modify, and confirm orders.', icon: '' },
    { title: 'Surveys', desc: 'Collect feedback and insights directly in chat. Interactive surveys with high response rates.', icon: '' },
  ];

  return (
    <>
      <Head>
        <title>WECARE.DIGITAL - Business Communication Platform</title>
        <meta name="description" content="WhatsApp Business API Platform" />
      </Head>
      <div className="page">
        <header className="hdr">
          <div className="hdr-in">
            <div className="logo">
              <img src="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" alt="" className="logo-img" />
              <span>WECARE.DIGITAL</span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className={`hero anim ${show('hero') ? 'show' : ''}`} id="hero">
          <div className="hero-content">
            <div className="hero-left">
              <h1>Business messaging<br/>made simple</h1>
              <p>Connect with customers on WhatsApp, SMS, and more. One platform for all your business communication needs.</p>
            </div>
            <div className="hero-right">
              <div className="mockup-wrapper">
                <div className="phone">
                  <div className="phone-header">
                    <span className="back-arrow"></span>
                    <div className="avatar">W</div>
                    <div className="contact-info">
                      <span className="contact-name">WECARE.DIGITAL</span>
                      <span className="contact-status">online</span>
                    </div>
                    <div className="verified-badge"></div>
                  </div>
                  <div className="chat-area">
                    <div className="msg sent">
                      <p>Hi! Your order #WDSR87A6G has been shipped </p>
                      <span className="msg-time">10:30</span>
                    </div>
                    <div className="msg received">
                      <p>When will it arrive?</p>
                      <span className="msg-time">10:31</span>
                    </div>
                    <div className="msg sent">
                      <p>Tomorrow by 6 PM</p>
                      <span className="msg-time">10:31</span>
                    </div>
                    <div className="msg sent">
                      <p>Track here:<br/>wecare.digital/track</p>
                      <span className="msg-time">10:31</span>
                    </div>
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
                <div className="code-box">
                  <div className="code-header">
                    <div className="dots">
                      <span className="dot-red"></span>
                      <span className="dot-yellow"></span>
                      <span className="dot-green"></span>
                    </div>
                    <span className="file-name">send_message.py</span>
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
          </div>
        </section>

        {/* Reach 2 Billion Section with Tabs */}
        <section className={`reach-section anim ${show('reach') ? 'show' : ''}`} id="reach">
          <div className="reach-content">
            <h2>Reach 2 Billion Users on Their Preferred Channel</h2>
            <p>Delight your customers with dynamic WhatsApp messaging features to elevate your interactions</p>
            <div className="tabs-container">
              <div className="tabs-nav">
                {featureTabs.map((tab, i) => (
                  <button key={i} className={`tab-btn ${activeFeatureTab === i ? 'active' : ''}`} onClick={() => setActiveFeatureTab(i)}>
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-title">{tab.title}</span>
                  </button>
                ))}
              </div>
              <div className="tab-content">
                <div className="tab-panel">
                  <span className="panel-icon">{featureTabs[activeFeatureTab].icon}</span>
                  <h3>{featureTabs[activeFeatureTab].title}</h3>
                  <p>{featureTabs[activeFeatureTab].desc}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WhatsApp for Every Touchpoint Section with Tabs */}
        <section className={`touchpoint-section anim ${show('touchpoint') ? 'show' : ''}`} id="touchpoint">
          <div className="touchpoint-content">
            <h2>WhatsApp for every touchpoint</h2>
            <p>Explore how WhatsApp is powering engagement, support, and conversions across the customer journey</p>
            <div className="usecase-tabs">
              <div className="usecase-nav">
                {useCaseTabs.map((tab, i) => (
                  <button key={i} className={`usecase-btn ${activeUseCaseTab === i ? 'active' : ''}`} onClick={() => setActiveUseCaseTab(i)}>
                    {tab.title}
                  </button>
                ))}
              </div>
              <div className="usecase-content">
                <div className="usecase-panel">
                  <div className="usecase-icon">{useCaseTabs[activeUseCaseTab].icon}</div>
                  <h3>{useCaseTabs[activeUseCaseTab].title} Messages</h3>
                  <p>{useCaseTabs[activeUseCaseTab].desc}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* AI Section */}
        <section className={`ai-section anim ${show('ai') ? 'show' : ''}`} id="ai">
          <div className="ai-header">
            <h2>Built for the AI era.</h2>
            <p>The complete platform for enterprise brands to acquire, convert, and retain customers across every channel—powered by AI that actually understands your business.</p>
          </div>
          <div className="ai-grid">
            <div className="ai-card">
              <div className="ai-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/></svg></div>
              <h3>Customer Data Platform</h3>
              <p>Every signal, unified and current</p>
            </div>
            <div className="ai-card">
              <div className="ai-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div>
              <h3>Custom Data Modeling</h3>
              <p>Objects and segments for your business</p>
            </div>
            <div className="ai-card">
              <div className="ai-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg></div>
              <h3>Multichannel Orchestration</h3>
              <p>Reach customers anywhere</p>
            </div>
            <div className="ai-card">
              <div className="ai-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>
              <h3>Smart Personalization</h3>
              <p>Marketing that runs itself</p>
            </div>
            <div className="ai-card">
              <div className="ai-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
              <h3>Enterprise Infrastructure</h3>
              <p>APIs and security that scale</p>
            </div>
            <div className="ai-card">
              <div className="ai-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></div>
              <h3>Predictive Analytics</h3>
              <p>See revenue before it happens</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={`features anim ${show('features') ? 'show' : ''}`} id="features">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon whatsapp"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></div>
              <h3>WhatsApp Business API</h3>
              <p>Official API access with verified business profiles</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon sms"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
              <h3>SMS Gateway</h3>
              <p>Reliable SMS delivery with DLT compliance</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon voice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
              <h3>Voice Calls</h3>
              <p>Automated voice calls and IVR</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
              <h3>Email Campaigns</h3>
              <p>Transactional and marketing emails</p>
            </div>
          </div>
        </section>

        <footer className="ftr">
          <div className="ftr-in">
            <a href="https://www.wecare.digital/contact" className="ftr-contact">Contact</a>
            <span className="ftr-tagline">Tap. Track. Done. Everyday things made easy.</span>
          </div>
        </footer>
        <style jsx>{`
          .page{min-height:100vh;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;overflow-x:hidden}
          .hdr{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,.97);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.06)}
          .hdr-in{max-width:1200px;margin:0 auto;padding:16px 24px;display:flex;justify-content:space-between;align-items:center}
          .logo{display:flex;align-items:center;gap:12px;font-weight:600;font-size:17px;color:#1a1a1a}
          .logo-img{width:36px;height:36px;border-radius:10px}
          .anim{opacity:0;transform:translateY(40px);transition:all .8s cubic-bezier(.16,1,.3,1)}
          .anim.show{opacity:1;transform:translateY(0)}

          /* Hero */
          .hero{padding:140px 24px 100px;max-width:1300px;margin:0 auto}
          .hero-content{display:grid;grid-template-columns:1fr 1.5fr;gap:40px;align-items:center}
          .hero-left h1{font-size:52px;font-weight:700;line-height:1.1;color:#1a1a1a;margin:0 0 20px;letter-spacing:-2px}
          .hero-left p{font-size:18px;color:#6b7280;line-height:1.7;margin:0;max-width:420px}
          .hero-right{display:flex;justify-content:center}
          .mockup-wrapper{position:relative;width:640px;height:580px;background:#e8f5f0;border-radius:32px;padding:40px;overflow:visible}
          .phone{position:absolute;left:40px;top:30px;width:360px;background:#d4ddd4;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.08);z-index:1}
          .phone-header{background:#075e54;padding:14px 16px;display:flex;align-items:center;gap:12px}
          .back-arrow{color:#fff;font-size:22px;font-weight:300}
          .avatar{width:46px;height:46px;background:#25d366;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:20px}
          .contact-info{flex:1;display:flex;flex-direction:column}
          .contact-name{color:#fff;font-size:18px;font-weight:600;letter-spacing:.3px}
          .contact-status{color:rgba(255,255,255,.75);font-size:13px}
          .verified-badge{width:26px;height:26px;background:#25d366;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700}
          .chat-area{background:#e8efe5;padding:20px 16px;min-height:420px;display:flex;flex-direction:column;gap:12px}
          .msg{max-width:75%;padding:12px 16px;border-radius:12px;font-size:16px;line-height:1.5;position:relative;color:#000}
          .msg.received{background:#fff;align-self:flex-start;border-top-left-radius:4px}
          .msg.sent{background:#d9fdd3;align-self:flex-end;border-top-right-radius:4px}
          .msg p{margin:0;color:#000}
          .msg-time{font-size:11px;color:#667781;display:block;text-align:right;margin-top:6px}
          .typing-indicator{background:#fff;padding:14px 18px;border-radius:12px;align-self:flex-start;display:flex;gap:5px;border-top-left-radius:4px}
          .typing-indicator span{width:9px;height:9px;background:#90949c;border-radius:50%;animation:bounce 1.4s infinite}
          .typing-indicator span:nth-child(2){animation-delay:.2s}
          .typing-indicator span:nth-child(3){animation-delay:.4s}
          @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}
          .code-box{position:absolute;right:20px;bottom:30px;width:400px;background:#3d4654;border-radius:16px;overflow:hidden;box-shadow:0 25px 70px rgba(0,0,0,.18);z-index:2}
          .code-header{display:flex;align-items:center;padding:14px 18px;background:#2d3440}
          .dots{display:flex;gap:8px}
          .dot-red,.dot-yellow,.dot-green{width:14px;height:14px;border-radius:50%}
          .dot-red{background:#ff5f57}
          .dot-yellow{background:#febc2e}
          .dot-green{background:#28c840}
          .file-name{margin-left:auto;font-size:14px;color:#9ca3af}
          .code-body{margin:0;padding:22px;font-family:'SF Mono',Monaco,'Courier New',monospace;font-size:15px;line-height:1.7;color:#e5e7eb;overflow-x:auto}

          /* Reach Section */
          .reach-section{padding:100px 24px;background:#f8faf9}
          .reach-content{max-width:1000px;margin:0 auto;text-align:center}
          .reach-content h2{font-size:38px;font-weight:700;color:#1a1a1a;margin:0 0 12px;letter-spacing:-1px}
          .reach-content>p{font-size:18px;color:#6b7280;margin:0 0 50px}
          .tabs-container{background:#fff;border-radius:20px;padding:8px;box-shadow:0 4px 30px rgba(0,0,0,.06)}
          .tabs-nav{display:flex;gap:4px;padding:8px;background:#f5f5f5;border-radius:14px;margin-bottom:24px}
          .tab-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 12px;border:none;background:transparent;border-radius:10px;cursor:pointer;transition:all .2s}
          .tab-btn:hover{background:rgba(255,255,255,.5)}
          .tab-btn.active{background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.08)}
          .tab-icon{font-size:24px}
          .tab-title{font-size:13px;font-weight:600;color:#1a1a1a}
          .tab-content{padding:40px}
          .tab-panel{text-align:center}
          .panel-icon{font-size:48px;display:block;margin-bottom:16px}
          .tab-panel h3{font-size:24px;font-weight:700;color:#1a1a1a;margin:0 0 12px}
          .tab-panel p{font-size:16px;color:#6b7280;max-width:500px;margin:0 auto;line-height:1.6}

          /* Touchpoint Section */
          .touchpoint-section{padding:100px 24px;background:#fff}
          .touchpoint-content{max-width:1000px;margin:0 auto;text-align:center}
          .touchpoint-content h2{font-size:38px;font-weight:700;color:#1a1a1a;margin:0 0 12px;letter-spacing:-1px}
          .touchpoint-content>p{font-size:18px;color:#6b7280;margin:0 0 50px}
          .usecase-tabs{background:#f8faf9;border-radius:20px;overflow:hidden}
          .usecase-nav{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;padding:24px;border-bottom:1px solid #eaeaea}
          .usecase-btn{padding:12px 24px;border:1px solid #e5e5e5;background:#fff;border-radius:30px;font-size:14px;font-weight:600;color:#1a1a1a;cursor:pointer;transition:all .2s}
          .usecase-btn:hover{border-color:#25d366;color:#25d366}
          .usecase-btn.active{background:#25d366;border-color:#25d366;color:#fff}
          .usecase-content{padding:50px 40px}
          .usecase-panel{text-align:center}
          .usecase-icon{font-size:56px;margin-bottom:20px}
          .usecase-panel h3{font-size:28px;font-weight:700;color:#1a1a1a;margin:0 0 16px}
          .usecase-panel p{font-size:17px;color:#6b7280;max-width:600px;margin:0 auto;line-height:1.7}
          /* AI Section */
          .ai-section{padding:100px 24px;max-width:1100px;margin:0 auto}
          .ai-header{text-align:center;margin-bottom:60px}
          .ai-header h2{font-size:42px;font-weight:700;color:#1a1a1a;margin:0 0 16px;letter-spacing:-1.5px}
          .ai-header p{font-size:18px;color:#6b7280;line-height:1.7;max-width:700px;margin:0 auto}
          .ai-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
          .ai-card{background:#fafafa;border:1px solid #eaeaea;border-radius:12px;padding:28px 24px;transition:all .2s ease}
          .ai-card:hover{background:#fff;border-color:#ddd}
          .ai-icon{width:40px;height:40px;background:#fff;border:1px solid #eaeaea;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:18px}
          .ai-icon svg{width:20px;height:20px;color:#666}
          .ai-card h3{font-size:17px;font-weight:600;color:#1a1a1a;margin:0 0 6px}
          .ai-card p{font-size:15px;color:#888;line-height:1.5;margin:0}

          /* Features Section */
          .features{padding:60px 24px 100px;max-width:1100px;margin:0 auto}
          .features-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
          .feature-card{background:#fafafa;border:1px solid #eaeaea;border-radius:12px;padding:24px 20px;text-align:center;transition:all .2s ease}
          .feature-card:hover{background:#fff;border-color:#ddd}
          .feature-icon{width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
          .feature-icon svg{width:26px;height:26px}
          .feature-icon.whatsapp{background:#dcfce7;color:#25d366}
          .feature-icon.sms{background:#dbeafe;color:#3b82f6}
          .feature-icon.voice{background:#fef3c7;color:#f59e0b}
          .feature-icon.email{background:#fce7f3;color:#ec4899}
          .feature-card h3{font-size:15px;font-weight:600;color:#1a1a1a;margin:0 0 6px}
          .feature-card p{font-size:13px;color:#888;line-height:1.4;margin:0}

          /* Footer */
          .ftr{border-top:1px solid #eaeaea;padding:24px}
          .ftr-in{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
          .ftr-contact{font-size:14px;color:#9ca3af;text-decoration:none;transition:color .2s}
          .ftr-contact:hover{color:#6b7280}
          .ftr-tagline{font-size:14px;color:#9ca3af}

          @media(max-width:1200px){
            .mockup-wrapper{width:560px;height:520px}
            .phone{width:320px}
            .chat-area{min-height:380px}
            .code-box{width:360px}
          }
          @media(max-width:1024px){
            .hero-content{grid-template-columns:1fr;text-align:center;gap:50px}
            .hero-left h1{font-size:42px}
            .hero-left p{margin:0 auto}
            .mockup-wrapper{width:100%;max-width:520px;height:auto;min-height:540px;margin:0 auto}
            .phone{position:relative;left:auto;top:auto;width:100%;max-width:320px;margin:0 auto 20px}
            .code-box{position:relative;right:auto;bottom:auto;width:100%;max-width:360px;margin:0 auto}
            .tabs-nav{flex-wrap:wrap}
            .tab-btn{min-width:80px}
            .ai-grid{grid-template-columns:repeat(2,1fr)}
            .features-grid{grid-template-columns:repeat(2,1fr)}
          }
          @media(max-width:768px){
            .hero-left h1{font-size:34px}
            .reach-content h2,.touchpoint-content h2,.ai-header h2{font-size:32px}
            .ai-grid{grid-template-columns:1fr}
            .features-grid{grid-template-columns:repeat(2,1fr)}
            .usecase-nav{gap:6px}
            .usecase-btn{padding:10px 16px;font-size:13px}
          }
          @media(max-width:480px){
            .hero{padding:120px 16px 60px}
            .hero-left h1{font-size:28px}
            .features-grid{grid-template-columns:1fr}
            .ftr-in{flex-direction:column;gap:12px;text-align:center}
            .tabs-nav{flex-direction:column}
            .tab-btn{flex-direction:row;justify-content:flex-start;gap:12px}
          }
        `}</style>
      </div>
    </>
  );
};

export default HomePage;