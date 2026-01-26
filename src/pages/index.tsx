/**
 * Home Page - WECARE.DIGITAL Landing
 * WhatsApp Business API Platform
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';

const HomePage: React.FC = () => {
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState(0);
  const [activeUseCase, setActiveUseCase] = useState(0);
  const [activeCode, setActiveCode] = useState(0);
  
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

  const features = [
    { icon: '', title: 'Rich Media', desc: 'Images, videos, documents & interactive buttons' },
    { icon: '', title: 'Templates', desc: 'Pre-approved message templates' },
    { icon: '', title: 'Catalogs', desc: 'Product showcases in chat' },
    { icon: '', title: 'Payments', desc: 'In-chat payment collection' },
    { icon: '', title: 'Chatbots', desc: 'AI-powered automation' },
  ];

  const useCases = [
    { title: 'Promotional', desc: 'Drive sales with targeted campaigns and personalized offers.', icon: '' },
    { title: 'Transactional', desc: 'Order confirmations, shipping updates, and delivery notifications.', icon: '' },
    { title: 'Appointments', desc: 'Booking confirmations, reminders, and rescheduling.', icon: '' },
    { title: 'OTPs', desc: 'Secure one-time passwords for login and verification.', icon: '' },
    { title: 'Orders', desc: 'Complete order management from cart to delivery.', icon: '' },
    { title: 'Surveys', desc: 'Collect feedback directly in chat.', icon: '' },
  ];

  const codeExamples = [
    { lang: 'Python', code: "import requests\nrequests.post(\n  \"api.wecare.digital/v1/send\",\n  headers={\"Authorization\": \"Bearer KEY\"},\n  json={\"to\": \"+919330994400\", \"template\": \"otp\"}\n)" },
    { lang: 'JavaScript', code: "await fetch(\"api.wecare.digital/v1/send\", {\n  method: \"POST\",\n  headers: { Authorization: \"Bearer KEY\" },\n  body: JSON.stringify({ to: \"+919330994400\" })\n});" },
    { lang: 'Java', code: "OkHttpClient client = new OkHttpClient();\nRequest request = new Request.Builder()\n  .url(\"api.wecare.digital/v1/send\")\n  .addHeader(\"Authorization\", \"Bearer KEY\")\n  .post(body).build();" },
    { lang: 'Go', code: "req, _ := http.NewRequest(\"POST\",\n  \"api.wecare.digital/v1/send\", body)\nreq.Header.Set(\"Authorization\", \"Bearer KEY\")" },
  ];

  const stories = [
    { brand: 'Retail Brand', title: 'Conversational commerce', metrics: ['14x higher sales', '290K messages in 7 days'] },
    { brand: 'Finance Co', title: 'Automated support', metrics: ['20% cases via WhatsApp', '94% CSAT rate'] },
    { brand: 'Travel App', title: 'Booking confirmations', metrics: ['90% faster response', '87% positive feedback'] },
  ];

  return (
    <>
      <Head>
        <title>WECARE.DIGITAL - WhatsApp Business API Platform</title>
        <meta name="description" content="Connect with 2B+ users on WhatsApp" />
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

        <section className={`hero anim ${show('hero') ? 'show' : ''}`} id="hero">
          <div className="hero-content">
            <div className="hero-left">
              <h1>WhatsApp Business API made simple</h1>
              <p>Connect with 2 billion+ users on their favorite app. From promotions to payments, engage, support, and grow — all in one platform.</p>
              <div className="hero-stats">
                <div className="stat"><span>2B+</span><small>Users reachable</small></div>
                <div className="stat"><span>Fast</span><small>Onboarding</small></div>
                <div className="stat"><span>Secure</span><small>Trusted channel</small></div>
              </div>
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
                    <div className="msg sent"><p>Hi! Your order #WDSR87A6G has been shipped </p><span className="msg-time">10:30</span></div>
                    <div className="msg received"><p>When will it arrive?</p><span className="msg-time">10:31</span></div>
                    <div className="msg sent left-msg"><p>Tomorrow by 6 PM</p><span className="msg-time">10:31</span></div>
                    <div className="msg sent left-msg"><p>Track here: wecare.digital/track</p><span className="msg-time">10:32</span></div>
                    <div className="typing-indicator"><span></span><span></span><span></span></div>
                  </div>
                </div>
                <div className="code-box">
                  <div className="code-header">
                    <div className="dots"><span className="dot-red"></span><span className="dot-yellow"></span><span className="dot-green"></span></div>
                    <span className="file-name">send_message.py</span>
                  </div>
                  <pre className="code-body">{`response = requests.post(
  "api.wecare.digital/v1/send",
  json={
    "to": "+919330994400",
    "type": "text",
    "message": "Your OTP: 847291"
  },
  headers={"Authorization": api_key}
)`}</pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="logos-section">
          <div className="logos-content">
            <h3>Trusted by businesses worldwide</h3>
            <div className="logos-grid">
              {['Retail', 'Finance', 'Travel', 'Healthcare', 'EdTech', 'eCommerce'].map((n, i) => (
                <div key={i} className="logo-card">{n}</div>
              ))}
            </div>
          </div>
        </section>

        <section className={`reach anim ${show('reach') ? 'show' : ''}`} id="reach">
          <h2>Reach 2 Billion Users on Their Preferred Channel</h2>
          <p className="section-sub">Delight your customers with dynamic WhatsApp messaging features</p>
          <div className="feature-tabs">
            <div className="ftabs-nav">
              {features.map((f, i) => (
                <button key={i} className={`ftab ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
                  <span className="ftab-icon">{f.icon}</span>
                  <span className="ftab-title">{f.title}</span>
                </button>
              ))}
            </div>
            <div className="ftab-panel">
              <span className="big-icon">{features[activeTab].icon}</span>
              <h3>{features[activeTab].title}</h3>
              <p>{features[activeTab].desc}</p>
            </div>
          </div>
        </section>

        <section className={`touchpoint anim ${show('touchpoint') ? 'show' : ''}`} id="touchpoint">
          <h2>WhatsApp for every touchpoint</h2>
          <p className="section-sub">Powering engagement, support, and conversions across the customer journey</p>
          <div className="usecase-tabs">
            <div className="uc-nav">
              {useCases.map((u, i) => (
                <button key={i} className={`uc-btn ${activeUseCase === i ? 'active' : ''}`} onClick={() => setActiveUseCase(i)}>{u.title}</button>
              ))}
            </div>
            <div className="uc-panel">
              <div className="uc-icon">{useCases[activeUseCase].icon}</div>
              <h3>{useCases[activeUseCase].title} Messages</h3>
              <p>{useCases[activeUseCase].desc}</p>
            </div>
          </div>
        </section>

        <section className={`api-section anim ${show('api') ? 'show' : ''}`} id="api">
          <div className="api-content">
            <div className="api-text">
              <h2>Integrate WhatsApp messaging through API in an instant</h2>
              <p>Scale communications with a flexible, developer-ready API.</p>
              <ul className="api-list">
                <li>Access detailed API documentation</li>
                <li>24/7 integration support</li>
                <li>Create custom message templates</li>
              </ul>
            </div>
            <div className="api-code">
              <div className="code-tabs">
                {codeExamples.map((c, i) => (
                  <button key={i} className={`code-tab ${activeCode === i ? 'active' : ''}`} onClick={() => setActiveCode(i)}>{c.lang}</button>
                ))}
              </div>
              <pre className="api-snippet">{codeExamples[activeCode].code}</pre>
            </div>
          </div>
        </section>

        <section className={`stories anim ${show('stories') ? 'show' : ''}`} id="stories">
          <h2>Success stories that speak for themselves</h2>
          <p className="section-sub">See how businesses are winning with WhatsApp API</p>
          <div className="stories-grid">
            {stories.map((s, i) => (
              <div key={i} className="story-card">
                <div className="story-brand">{s.brand}</div>
                <h3>{s.title}</h3>
                <ul>{s.metrics.map((m, j) => <li key={j}>{m}</li>)}</ul>
              </div>
            ))}
          </div>
          <div className="cta-banner">
            <div><h3>Ready to transform your customer experience?</h3><p>Go live on WhatsApp faster with a scalable setup.</p></div>
          </div>
        </section>

        <section className={`channels anim ${show('channels') ? 'show' : ''}`} id="channels">
          <div className="ch-grid">
            <div className="ch-card wa"><div className="ch-icon"></div><h3>WhatsApp Business API</h3><p>Official API with verified profiles</p></div>
            <div className="ch-card sms"><div className="ch-icon"></div><h3>SMS Gateway</h3><p>DLT compliant delivery</p></div>
            <div className="ch-card voice"><div className="ch-icon"></div><h3>Voice Calls</h3><p>Automated IVR systems</p></div>
            <div className="ch-card email"><div className="ch-icon"></div><h3>Email</h3><p>Transactional & marketing</p></div>
          </div>
        </section>

        <footer className="ftr">
          <div className="ftr-in">
            <a href="https://www.wecare.digital/contact" className="ftr-contact">Contact</a>
            <span className="ftr-tagline">Tap. Track. Done. Everyday things made easy.</span>
          </div>
        </footer>

        <style jsx>{`
          .page{min-height:100vh;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a}
          .hdr{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,.97);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.06)}
          .hdr-in{max-width:1200px;margin:0 auto;padding:16px 24px;display:flex;align-items:center}
          .logo{display:flex;align-items:center;gap:12px;font-weight:600;font-size:17px}
          .logo-img{width:36px;height:36px;border-radius:10px}
          .anim{opacity:0;transform:translateY(40px);transition:all .8s cubic-bezier(.16,1,.3,1)}
          .anim.show{opacity:1;transform:translateY(0)}
          .hero{padding:140px 24px 80px;max-width:1300px;margin:0 auto}
          .hero-content{display:grid;grid-template-columns:1fr 1.5fr;gap:40px;align-items:center}
          .hero-left h1{font-size:46px;font-weight:700;line-height:1.1;margin:0 0 20px;letter-spacing:-2px}
          .hero-left p{font-size:18px;color:#6b7280;line-height:1.7;margin:0 0 30px;max-width:420px}
          .hero-stats{display:flex;gap:16px}
          .stat{background:#f8faf9;border:1px solid #eaeaea;border-radius:16px;padding:16px 20px}
          .stat span{display:block;font-size:22px;font-weight:700}
          .stat small{font-size:13px;color:#6b7280}
          .hero-right{display:flex;justify-content:center}
          .mockup-wrapper{position:relative;width:620px;height:560px;background:#e8f5f0;border-radius:32px;padding:40px}
          .phone{position:absolute;left:40px;top:30px;width:340px;background:#d4ddd4;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.08);z-index:1}
          .phone-header{background:#075e54;padding:14px 16px;display:flex;align-items:center;gap:12px}
          .back-arrow{color:#fff;font-size:22px}
          .avatar{width:44px;height:44px;background:#25d366;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px}
          .contact-info{flex:1;display:flex;flex-direction:column}
          .contact-name{color:#fff;font-size:17px;font-weight:600}
          .contact-status{color:rgba(255,255,255,.75);font-size:12px}
          .verified-badge{width:24px;height:24px;background:#25d366;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px}
          .chat-area{background:#e8efe5;padding:18px 14px;min-height:400px;display:flex;flex-direction:column;gap:10px}
          .msg{max-width:75%;padding:10px 14px;border-radius:10px;font-size:15px;line-height:1.5;color:#000}
          .msg.received{background:#fff;align-self:flex-start;border-top-left-radius:4px}
          .msg.sent{background:#d9fdd3;align-self:flex-end;border-top-right-radius:4px}
          .msg.sent.left-msg{max-width:55%;align-self:flex-start !important;border-top-left-radius:4px;border-top-right-radius:10px}
          .msg p{margin:0;color:#000}
          .msg-time{font-size:10px;color:#667781;display:block;text-align:right;margin-top:4px}
          .typing-indicator{background:#fff;padding:12px 16px;border-radius:10px;align-self:flex-start;display:flex;gap:4px}
          .typing-indicator span{width:8px;height:8px;background:#90949c;border-radius:50%;animation:bounce 1.4s infinite}
          .typing-indicator span:nth-child(2){animation-delay:.2s}
          .typing-indicator span:nth-child(3){animation-delay:.4s}
          @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-3px)}}
          .code-box{position:absolute;right:20px;bottom:40px;width:380px;background:#3d4654;border-radius:16px;overflow:hidden;box-shadow:0 25px 70px rgba(0,0,0,.18);z-index:2}
          .code-header{display:flex;align-items:center;padding:12px 16px;background:#2d3440}
          .dots{display:flex;gap:6px}
          .dot-red,.dot-yellow,.dot-green{width:12px;height:12px;border-radius:50%}
          .dot-red{background:#ff5f57}
          .dot-yellow{background:#febc2e}
          .dot-green{background:#28c840}
          .file-name{margin-left:auto;font-size:13px;color:#9ca3af}
          .code-body{margin:0;padding:18px;font-family:'SF Mono',Monaco,monospace;font-size:13px;line-height:1.6;color:#e5e7eb}
          .logos-section{padding:60px 24px;background:#f8faf9;border-top:1px solid #eaeaea;border-bottom:1px solid #eaeaea}
          .logos-content{max-width:1100px;margin:0 auto}
          .logos-content h3{font-size:18px;font-weight:600;margin:0 0 24px}
          .logos-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
          .logo-card{background:#fff;border:1px solid #eaeaea;border-radius:12px;padding:16px;text-align:center;font-size:14px;color:#6b7280}
          .reach,.touchpoint{padding:100px 24px;text-align:center;max-width:1000px;margin:0 auto}
          .reach{background:#f8faf9}
          h2{font-size:36px;font-weight:700;margin:0 0 12px;letter-spacing:-1px}
          .section-sub{font-size:17px;color:#6b7280;margin:0 0 50px}
          .feature-tabs{background:#fff;border-radius:20px;padding:8px;box-shadow:0 4px 30px rgba(0,0,0,.06)}
          .ftabs-nav{display:flex;gap:4px;padding:8px;background:#f5f5f5;border-radius:14px;margin-bottom:20px}
          .ftab{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 10px;border:none;background:transparent;border-radius:10px;cursor:pointer;transition:all .2s}
          .ftab:hover{background:rgba(255,255,255,.5)}
          .ftab.active{background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.08)}
          .ftab-icon{font-size:22px}
          .ftab-title{font-size:12px;font-weight:600}
          .ftab-panel{padding:40px;text-align:center}
          .big-icon{font-size:44px;display:block;margin-bottom:14px}
          .ftab-panel h3{font-size:22px;font-weight:700;margin:0 0 10px}
          .ftab-panel p{font-size:15px;color:#6b7280;max-width:450px;margin:0 auto}
          .usecase-tabs{background:#f8faf9;border-radius:20px;overflow:hidden}
          .uc-nav{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;padding:20px;border-bottom:1px solid #eaeaea}
          .uc-btn{padding:10px 20px;border:1px solid #e5e5e5;background:#fff;border-radius:30px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s}
          .uc-btn:hover{border-color:#25d366;color:#25d366}
          .uc-btn.active{background:#25d366;border-color:#25d366;color:#fff}
          .uc-panel{padding:40px;text-align:center}
          .uc-icon{font-size:50px;margin-bottom:16px}
          .uc-panel h3{font-size:26px;font-weight:700;margin:0 0 12px}
          .uc-panel p{font-size:16px;color:#6b7280;max-width:550px;margin:0 auto}
          .api-section{padding:100px 24px;background:#1a1a1a}
          .api-content{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:center}
          .api-text h2{font-size:34px;color:#fff;margin:0 0 16px}
          .api-text p{font-size:16px;color:#9ca3af;margin:0 0 24px}
          .api-list{list-style:none;padding:0;margin:0}
          .api-list li{color:#d1d5db;font-size:14px;padding:8px 0 8px 24px;position:relative}
          .api-list li:before{content:'';position:absolute;left:0;color:#25d366}
          .api-code{background:#2d3440;border-radius:16px;overflow:hidden}
          .code-tabs{display:flex;gap:4px;padding:12px;background:#1f2937}
          .code-tab{padding:8px 14px;border:none;border-radius:8px;font-size:12px;font-weight:600;color:#9ca3af;background:transparent;cursor:pointer}
          .code-tab.active{background:#374151;color:#fff}
          .api-snippet{margin:0;padding:18px;font-family:'SF Mono',Monaco,monospace;font-size:12px;line-height:1.6;color:#e5e7eb;white-space:pre-wrap}
          .stories{padding:100px 24px;max-width:1100px;margin:0 auto;text-align:center}
          .stories-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:40px}
          .story-card{background:#f8faf9;border:1px solid #eaeaea;border-radius:20px;padding:28px;text-align:left}
          .story-brand{font-size:13px;font-weight:600;color:#6b7280;margin-bottom:8px}
          .story-card h3{font-size:18px;font-weight:700;margin:0 0 16px}
          .story-card ul{list-style:disc;padding-left:20px;margin:0;font-size:14px;color:#6b7280}
          .story-card li{margin-bottom:6px}
          .cta-banner{background:#1a1a1a;border-radius:20px;padding:40px;display:flex;align-items:center;justify-content:space-between;text-align:left}
          .cta-banner h3{font-size:22px;color:#fff;margin:0 0 8px}
          .cta-banner p{font-size:14px;color:#9ca3af;margin:0}
          .channels{padding:60px 24px 100px;max-width:1000px;margin:0 auto}
          .ch-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
          .ch-card{background:#f8faf9;border:1px solid #eaeaea;border-radius:16px;padding:24px;text-align:center}
          .ch-icon{font-size:32px;margin-bottom:12px}
          .ch-card h3{font-size:15px;font-weight:600;margin:0 0 6px}
          .ch-card p{font-size:13px;color:#6b7280;margin:0}
          .ftr{border-top:1px solid #eaeaea;padding:24px}
          .ftr-in{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
          .ftr-contact{font-size:14px;color:#9ca3af;text-decoration:none}
          .ftr-tagline{font-size:14px;color:#9ca3af}
          @media(max-width:1024px){.hero-content,.api-content{grid-template-columns:1fr;text-align:center}.hero-left p{margin:0 auto 30px}.hero-stats{justify-content:center}.mockup-wrapper{width:100%;max-width:500px;height:auto;min-height:520px;margin:0 auto}.phone{position:relative;left:auto;top:auto;width:100%;max-width:300px;margin:0 auto 20px}.code-box{position:relative;right:auto;bottom:auto;width:100%;max-width:340px;margin:0 auto}.logos-grid{grid-template-columns:repeat(3,1fr)}.stories-grid,.ch-grid{grid-template-columns:repeat(2,1fr)}}
          @media(max-width:768px){.hero-left h1{font-size:34px}h2{font-size:28px}.ftabs-nav{flex-wrap:wrap}.logos-grid{grid-template-columns:repeat(2,1fr)}.stories-grid,.ch-grid{grid-template-columns:1fr}}
          @media(max-width:480px){.hero{padding:120px 16px 60px}.hero-stats{flex-direction:column}.ftr-in{flex-direction:column;gap:12px;text-align:center}}
        `}</style>
      </div>
    </>
  );
};

export default HomePage;