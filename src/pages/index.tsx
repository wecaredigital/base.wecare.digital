/**
 * Home Page - WECARE.DIGITAL Landing
 * WhatsApp Business API Platform
 * Fully responsive for mobile, touch, PWA
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';

const HomePage: React.FC = () => {
  const [visible, setVisible] = useState<Set<string>>(new Set());
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
    { icon: '', title: 'Rich Media', desc: 'Images, videos, documents & buttons' },
    { icon: '', title: 'Templates', desc: 'Pre-approved message templates' },
    { icon: '', title: 'Catalogs', desc: 'Products directly in chat' },
    { icon: '', title: 'Payments', desc: 'Collect payments in chat' },
    { icon: '', title: 'Chatbots', desc: 'AI-powered 24/7 support' },
  ];

  const useCases = [
    { title: 'Promotional', desc: 'Drive sales with targeted campaigns and personalized offers.', icon: '' },
    { title: 'Transactional', desc: 'Order confirmations, shipping updates, delivery notifications.', icon: '' },
    { title: 'Appointments', desc: 'Booking confirmations, reminders, rescheduling.', icon: '' },
    { title: 'OTPs', desc: 'Secure one-time passwords for verification.', icon: '' },
    { title: 'Orders', desc: 'Complete order management from cart to delivery.', icon: '' },
    { title: 'Surveys', desc: 'Collect feedback directly in chat.', icon: '' },
  ];

  const codeExamples = [
    { lang: 'Python', code: "import requests\n\nresponse = requests.post(\n  \"https://api.wecare.digital/v1/messages\",\n  headers={\"Authorization\": \"Bearer API_KEY\"},\n  json={\"to\": \"+91xxx\", \"type\": \"template\"}\n)" },
    { lang: 'JavaScript', code: "const response = await fetch(\n  \"https://api.wecare.digital/v1/messages\",\n  {\n    method: \"POST\",\n    headers: {\"Authorization\": \"Bearer API_KEY\"},\n    body: JSON.stringify({to: \"+91xxx\"})\n  }\n);" },
    { lang: 'cURL', code: "curl -X POST \\\n  \"https://api.wecare.digital/v1/messages\" \\\n  -H \"Authorization: Bearer API_KEY\" \\\n  -d '{\"to\": \"+91xxx\"}'" },
  ];

  return (
    <>
      <Head>
        <title>Base CRM by WECARE.DIGITAL</title>
        <meta name="description" content="Reach more customers on WhatsApp" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#25d366" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </Head>
      <div className="page">
        <header className="hdr">
          <div className="hdr-in">
            <div className="logo">
              <img src="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" alt="Logo" className="logo-img" />
              <div className="logo-text">
                <span className="logo-main">Base CRM</span>
                <span className="logo-sub">by WECARE.DIGITAL</span>
              </div>
            </div>
          </div>
        </header>

        <section className={`hero anim ${show('hero') ? 'show' : ''}`} id="hero">
          <div className="hero-content">
            <div className="hero-left">
              <h1>Reach more customers wherever they are</h1>
              <p>Engage on every channel, in every scenario - from our platform or your stack.</p>
              <div className="hero-stats">
                <div className="stat"><span>B+</span><small>Users reachable</small></div>
                <div className="stat"><span>Fast</span><small>Onboarding</small></div>
                <div className="stat"><span>Secure</span><small>Trusted channel</small></div>
              </div>
            </div>
            <div className="hero-right">
              <div className="phone-mockup">
                <div className="phone-header">
                  <div className="avatar">W</div>
                  <div className="contact-info">
                    <span className="contact-name">WECARE.DIGITAL</span>
                    <span className="contact-status">online</span>
                  </div>
                  <div className="verified"></div>
                </div>
                <div className="chat-area">
                  <div className="msg sent">Your order #WD87A6G shipped <span className="time">10:30</span></div>
                  <div className="msg received">When will it arrive?<span className="time">10:31</span></div>
                  <div className="msg sent">Tomorrow by 6 PM<span className="time">10:31</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`features anim ${show('features') ? 'show' : ''}`} id="features">
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={`touchpoint anim ${show('touchpoint') ? 'show' : ''}`} id="touchpoint">
          <div className="section-header">
            <h2>WhatsApp for every touchpoint</h2>
            <p>Powering engagement across the customer journey</p>
          </div>
          <div className="usecase-pills">
            {useCases.map((u, i) => (
              <button key={i} className={`pill ${activeUseCase === i ? 'active' : ''}`} onClick={() => setActiveUseCase(i)}>{u.title}</button>
            ))}
          </div>
          <div className="usecase-content">
            <div className="usecase-icon">{useCases[activeUseCase].icon}</div>
            <h3>{useCases[activeUseCase].title} Messages</h3>
            <p>{useCases[activeUseCase].desc}</p>
          </div>
        </section>

        <section className={`api anim ${show('api') ? 'show' : ''}`} id="api">
          <div className="api-grid">
            <div className="api-info">
              <h2>Built for the AI era.</h2>
              <p className="api-desc">The all-in-one platform for enterprise brands-powered by AI that truly understands your business.</p>
            </div>
            <div className="api-demo">
              <div className="code-tabs">
                {codeExamples.map((c, i) => (
                  <button key={i} className={`tab ${activeCode === i ? 'active' : ''}`} onClick={() => setActiveCode(i)}>{c.lang}</button>
                ))}
              </div>
              <pre className="code-block">{codeExamples[activeCode].code}</pre>
            </div>
          </div>
        </section>

        <footer className="ftr">
          <div className="ftr-in">
            <a href="https://www.wecare.digital/contact" className="ftr-contact">Contact</a>
            <span className="ftr-tagline">Tap. Track. Done.</span>
          </div>
        </footer>

        <style jsx>{`
          * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
          .page { min-height: 100vh; min-height: 100dvh; background: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; overflow-x: hidden; }
          .hdr { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(255,255,255,.97); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(0,0,0,.06); padding-top: env(safe-area-inset-top); }
          .hdr-in { max-width: 1200px; margin: 0 auto; padding: 12px 16px; display: flex; align-items: center; }
          .logo { display: flex; align-items: center; gap: 10px; }
          .logo-img { width: 40px; height: 40px; border-radius: 10px; }
          .logo-text { display: flex; flex-direction: column; line-height: 1.2; }
          .logo-main { font-size: 18px; font-weight: 700; color: #1a1a1a; }
          .logo-sub { font-size: 10px; font-weight: 500; color: #6b7280; }
          .anim { opacity: 0; transform: translateY(30px); transition: all .6s cubic-bezier(.16,1,.3,1); }
          .anim.show { opacity: 1; transform: translateY(0); }
          .hero { padding: calc(80px + env(safe-area-inset-top)) 16px 60px; max-width: 1200px; margin: 0 auto; }
          .hero-content { display: flex; flex-direction: column; gap: 40px; }
          .hero-left h1 { font-size: clamp(28px, 6vw, 42px); font-weight: 700; line-height: 1.15; margin: 0 0 16px; letter-spacing: -1px; }
          .hero-left p { font-size: clamp(15px, 3.5vw, 18px); color: #6b7280; line-height: 1.6; margin: 0 0 24px; }
          .hero-stats { display: flex; gap: 12px; flex-wrap: wrap; }
          .stat { background: #f8faf9; border: 1px solid #eaeaea; border-radius: 12px; padding: 12px 16px; flex: 1; min-width: 90px; text-align: center; }
          .stat span { display: block; font-size: 20px; font-weight: 700; }
          .stat small { font-size: 11px; color: #6b7280; }
          .hero-right { display: flex; justify-content: center; }
          .phone-mockup { width: 100%; max-width: 320px; background: #e8f5f0; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.1); }
          .phone-header { background: #075e54; padding: 12px 14px; display: flex; align-items: center; gap: 10px; }
          .avatar { width: 36px; height: 36px; background: #25d366; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 16px; }
          .contact-info { flex: 1; display: flex; flex-direction: column; }
          .contact-name { color: #fff; font-size: 15px; font-weight: 600; }
          .contact-status { color: rgba(255,255,255,.75); font-size: 11px; }
          .verified { width: 20px; height: 20px; background: #25d366; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 10px; }
          .chat-area { background: #e8efe5; padding: 16px 12px; min-height: 200px; display: flex; flex-direction: column; gap: 8px; }
          .msg { max-width: 80%; padding: 10px 12px; border-radius: 10px; font-size: 14px; line-height: 1.4; position: relative; }
          .msg.received { background: #fff; align-self: flex-start; border-top-left-radius: 4px; }
          .msg.sent { background: #d9fdd3; align-self: flex-end; border-top-right-radius: 4px; }
          .msg .time { font-size: 9px; color: #667781; display: block; text-align: right; margin-top: 4px; }
          .features { padding: 60px 16px; background: #f8f9fa; }
          .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; max-width: 1200px; margin: 0 auto; }
          .feature-card { background: #fff; border-radius: 16px; padding: 20px 16px; text-align: center; transition: transform .2s; touch-action: manipulation; }
          .feature-card:active { transform: scale(0.98); }
          .feature-icon { font-size: 32px; margin-bottom: 12px; }
          .feature-card h3 { font-size: 15px; font-weight: 700; margin: 0 0 8px; color: #1a1a1a; }
          .feature-card p { font-size: 12px; color: #6b7280; line-height: 1.4; margin: 0; }
          .section-header { text-align: center; max-width: 600px; margin: 0 auto 40px; padding: 0 16px; }
          .section-header h2 { font-size: clamp(24px, 5vw, 36px); font-weight: 700; line-height: 1.2; margin: 0 0 12px; color: #1a1a1a; }
          .section-header p { font-size: clamp(14px, 3vw, 16px); color: #6b7280; line-height: 1.5; margin: 0; }
          .touchpoint { padding: 60px 16px; background: #fff; }
          .usecase-pills { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-bottom: 32px; padding: 0 8px; }
          .pill { padding: 10px 18px; border: 2px solid #e5e7eb; background: #fff; border-radius: 50px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; color: #4b5563; touch-action: manipulation; white-space: nowrap; }
          .pill:active { transform: scale(0.96); }
          .pill.active { background: #25d366; border-color: #25d366; color: #fff; }
          .usecase-content { text-align: center; max-width: 500px; margin: 0 auto; padding: 32px 20px; background: #f8f9fa; border-radius: 20px; }
          .usecase-icon { font-size: 48px; margin-bottom: 16px; }
          .usecase-content h3 { font-size: 22px; font-weight: 700; margin: 0 0 12px; color: #1a1a1a; }
          .usecase-content p { font-size: 15px; color: #6b7280; line-height: 1.6; margin: 0; }
          .api { padding: 60px 16px; background: #f8f9fa; }
          .api-grid { display: flex; flex-direction: column; gap: 32px; max-width: 1000px; margin: 0 auto; }
          .api-info { text-align: center; }
          .api-info h2 { font-size: clamp(24px, 5vw, 32px); font-weight: 700; color: #1a1a1a; margin: 0 0 16px; line-height: 1.2; }
          .api-desc { font-size: clamp(14px, 3vw, 16px); color: #6b7280; line-height: 1.6; margin: 0 auto; max-width: 500px; }
          .api-demo { background: #1e293b; border-radius: 16px; overflow: hidden; }
          .code-tabs { display: flex; gap: 4px; padding: 12px; background: #0f172a; overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .tab { padding: 8px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; color: #9ca3af; background: transparent; cursor: pointer; transition: all .2s; touch-action: manipulation; white-space: nowrap; flex-shrink: 0; }
          .tab:active { transform: scale(0.96); }
          .tab.active { background: #25d366; color: #fff; }
          .code-block { margin: 0; padding: 16px; font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 12px; line-height: 1.6; color: #e5e7eb; overflow-x: auto; -webkit-overflow-scrolling: touch; white-space: pre; }
          .ftr { border-top: 1px solid #eaeaea; padding: 20px 16px; padding-bottom: calc(20px + env(safe-area-inset-bottom)); }
          .ftr-in { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
          .ftr-contact { font-size: 14px; color: #6b7280; text-decoration: none; }
          .ftr-tagline { font-size: 14px; color: #9ca3af; }
          @media (min-width: 768px) {
            .hdr-in { padding: 16px 24px; }
            .logo-img { width: 44px; height: 44px; }
            .logo-main { font-size: 20px; }
            .hero { padding: calc(100px + env(safe-area-inset-top)) 24px 80px; }
            .hero-content { flex-direction: row; align-items: center; gap: 60px; }
            .hero-left { flex: 1; }
            .hero-right { flex: 1; }
            .phone-mockup { max-width: 360px; }
            .features { padding: 80px 24px; }
            .features-grid { gap: 20px; }
            .feature-card { padding: 28px 20px; }
            .feature-icon { font-size: 40px; }
            .feature-card h3 { font-size: 17px; }
            .feature-card p { font-size: 14px; }
            .touchpoint { padding: 80px 24px; }
            .pill { padding: 12px 24px; font-size: 14px; }
            .usecase-content { padding: 40px 32px; }
            .usecase-icon { font-size: 56px; }
            .usecase-content h3 { font-size: 26px; }
            .api { padding: 80px 24px; }
            .api-grid { flex-direction: row; align-items: center; gap: 60px; }
            .api-info { text-align: left; flex: 1; }
            .api-desc { margin: 0; }
            .api-demo { flex: 1; }
            .code-block { font-size: 13px; padding: 20px; }
            .ftr { padding: 24px; }
          }
          @media (min-width: 1024px) {
            .hero-content { gap: 80px; }
            .features-grid { grid-template-columns: repeat(5, 1fr); }
          }
        `}</style>
      </div>
    </>
  );
};

export default HomePage;
