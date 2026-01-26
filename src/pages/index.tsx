/**
 * Home Page - WECARE.DIGITAL Landing
 * Phone mockup with code overlay design
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';

const HomePage: React.FC = () => {
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [activeUseCase, setActiveUseCase] = useState(0);
  
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
    { title: 'Promotional', desc: 'Drive sales with targeted campaigns.', icon: '' },
    { title: 'Transactional', desc: 'Order confirmations, shipping updates.', icon: '' },
    { title: 'Appointments', desc: 'Booking confirmations, reminders.', icon: '' },
    { title: 'OTPs', desc: 'Secure one-time passwords.', icon: '' },
    { title: 'Orders', desc: 'Complete order management.', icon: '' },
    { title: 'Surveys', desc: 'Collect feedback in chat.', icon: '' },
  ];

  return (
    <>
      <Head>
        <title>Base CRM by WECARE.DIGITAL</title>
        <meta name="description" content="WhatsApp Business API made simple" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <meta name="theme-color" content="#25d366" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>
      <div className="page">
        <header className="hdr">
          <div className="hdr-in">
            <div className="logo">
              <img src="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" alt="Logo" className="logo-img" />
              <div className="logo-txt">
                <span className="logo-main">Base CRM</span>
                <span className="logo-sub">by WECARE.DIGITAL</span>
              </div>
            </div>
          </div>
        </header>

        <section className={`hero anim ${show('hero') ? 'show' : ''}`} id="hero">
          <div className="hero-grid">
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
              <div className="mockup-wrap">
                <div className="phone">
                  <div className="phone-hdr">
                    <div className="wa-avatar">W</div>
                    <div className="wa-info">
                      <span className="wa-name">WECARE.DIGITAL</span>
                      <span className="wa-status">online</span>
                    </div>
                    <div className="wa-dot"></div>
                  </div>
                  <div className="chat">
                    <div className="bubble out">Hi! Your order #WDSR87A6G has been shipped<span className="ts">10:30</span></div>
                    <div className="bubble in">When will it arrive?<span className="ts">10:31</span></div>
                    <div className="bubble out">Tomorrow by 6 PM<span className="ts">10:31</span></div>
                    <div className="bubble out">Track here: wecare.digital/track<span className="ts">10:32</span></div>
                    <div className="typing"><span></span><span></span><span></span></div>
                  </div>
                </div>
                <div className="code-box">
                  <div className="code-hdr">
                    <div className="dots"><i className="d r"></i><i className="d y"></i><i className="d g"></i></div>
                    <span className="fname">send_message.py</span>
                  </div>
                  <pre className="code">{`response = requests.post(
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

        <section className={`features anim ${show('features') ? 'show' : ''}`} id="features">
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="fcard">
                <div className="ficon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={`touchpoint anim ${show('touchpoint') ? 'show' : ''}`} id="touchpoint">
          <div className="sec-hdr">
            <h2>WhatsApp for every touchpoint</h2>
            <p>Powering engagement across the customer journey</p>
          </div>
          <div className="pills">
            {useCases.map((u, i) => (
              <button key={i} className={`pill ${activeUseCase === i ? 'active' : ''}`} onClick={() => setActiveUseCase(i)}>{u.title}</button>
            ))}
          </div>
          <div className="uc-box">
            <div className="uc-icon">{useCases[activeUseCase].icon}</div>
            <h3>{useCases[activeUseCase].title} Messages</h3>
            <p>{useCases[activeUseCase].desc}</p>
          </div>
        </section>

        <section className={`api anim ${show('api') ? 'show' : ''}`} id="api">
          <div className="api-content">
            <h2>Built for the AI era.</h2>
            <p>The all-in-one platform for enterprise brands—powered by AI that truly understands your business.</p>
          </div>
        </section>

        <footer className="ftr">
          <div className="ftr-in">
            <a href="https://www.wecare.digital/contact" className="ftr-link">Contact</a>
            <span className="ftr-tag">Tap. Track. Done.</span>
          </div>
        </footer>
        <style jsx>{`
          *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
          .page{min-height:100vh;min-height:100dvh;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch}
          .hdr{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,.97);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.06);padding-top:env(safe-area-inset-top)}
          .hdr-in{max-width:1200px;margin:0 auto;padding:12px 16px;display:flex;align-items:center}
          .logo{display:flex;align-items:center;gap:10px}
          .logo-img{width:40px;height:40px;border-radius:10px}
          .logo-txt{display:flex;flex-direction:column;line-height:1.2}
          .logo-main{font-size:18px;font-weight:700}
          .logo-sub{font-size:10px;color:#6b7280}
          .anim{opacity:0;transform:translateY(30px);transition:all .6s cubic-bezier(.16,1,.3,1)}
          .anim.show{opacity:1;transform:translateY(0)}
          .hero{padding:calc(80px + env(safe-area-inset-top)) 16px 40px;max-width:1200px;margin:0 auto}
          .hero-grid{display:flex;flex-direction:column;gap:32px}
          .hero-left h1{font-size:clamp(26px,5.5vw,40px);font-weight:700;line-height:1.15;margin:0 0 16px;letter-spacing:-0.5px}
          .hero-left p{font-size:clamp(14px,3vw,17px);color:#6b7280;line-height:1.6;margin:0 0 20px}
          .hero-stats{display:flex;gap:10px;flex-wrap:wrap}
          .stat{background:#f8faf9;border:1px solid #eaeaea;border-radius:12px;padding:12px 14px;flex:1;min-width:85px;text-align:center}
          .stat span{display:block;font-size:18px;font-weight:700}
          .stat small{font-size:11px;color:#6b7280}
          .hero-right{display:flex;justify-content:center}
          .mockup-wrap{display:flex;flex-direction:column;align-items:center;gap:16px;width:100%;max-width:320px}
          .phone{width:100%;background:#e5f5ed;border-radius:20px;overflow:hidden;box-shadow:0 16px 50px rgba(0,0,0,.1)}
          .phone-hdr{background:#075e54;padding:10px 12px;display:flex;align-items:center;gap:8px}
          .wa-avatar{width:36px;height:36px;background:#25d366;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px}
          .wa-info{flex:1;display:flex;flex-direction:column}
          .wa-name{color:#fff;font-size:14px;font-weight:600}
          .wa-status{color:rgba(255,255,255,.7);font-size:10px}
          .wa-dot{width:10px;height:10px;background:#25d366;border-radius:50%}
          .chat{background:#e8efe5;padding:12px 10px;min-height:200px;display:flex;flex-direction:column;gap:6px}
          .bubble{max-width:82%;padding:8px 10px;border-radius:8px;font-size:12px;line-height:1.4}
          .bubble.in{background:#fff;align-self:flex-start;border-top-left-radius:2px}
          .bubble.out{background:#d9fdd3;align-self:flex-end;border-top-right-radius:2px}
          .bubble .ts{font-size:8px;color:#667781;display:block;text-align:right;margin-top:3px}
          .typing{background:#fff;padding:10px 14px;border-radius:8px;border-top-left-radius:2px;align-self:flex-start;display:flex;gap:4px}
          .typing span{width:6px;height:6px;background:#90a4ae;border-radius:50%;animation:typ 1.4s infinite}
          .typing span:nth-child(2){animation-delay:.2s}
          .typing span:nth-child(3){animation-delay:.4s}
          @keyframes typ{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-3px)}}
          .code-box{width:100%;background:#3d4f5f;border-radius:10px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.18)}
          .code-hdr{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#4a5d6e}
          .dots{display:flex;gap:5px}
          .d{width:9px;height:9px;border-radius:50%;display:block}
          .d.r{background:#ff5f57}
          .d.y{background:#ffbd2e}
          .d.g{background:#28c840}
          .fname{font-size:10px;color:rgba(255,255,255,.65);font-family:monospace}
          .code{margin:0;padding:12px;font-family:'SF Mono',Monaco,Consolas,monospace;font-size:10px;line-height:1.5;color:#e5e7eb;white-space:pre;overflow-x:auto;-webkit-overflow-scrolling:touch}
          .features{padding:50px 16px;background:#f8f9fa}
          .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;max-width:1200px;margin:0 auto}
          .fcard{background:#fff;border-radius:14px;padding:16px 12px;text-align:center;touch-action:manipulation}
          .fcard:active{transform:scale(.98)}
          .ficon{font-size:28px;margin-bottom:10px}
          .fcard h3{font-size:14px;font-weight:700;margin:0 0 6px}
          .fcard p{font-size:11px;color:#6b7280;line-height:1.4;margin:0}
          .sec-hdr{text-align:center;max-width:600px;margin:0 auto 32px;padding:0 16px}
          .sec-hdr h2{font-size:clamp(22px,5vw,32px);font-weight:700;line-height:1.2;margin:0 0 10px}
          .sec-hdr p{font-size:clamp(13px,3vw,15px);color:#6b7280;margin:0}
          .touchpoint{padding:50px 16px;background:#fff}
          .pills{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:24px}
          .pill{padding:8px 14px;border:2px solid #e5e7eb;background:#fff;border-radius:50px;font-size:12px;font-weight:600;cursor:pointer;color:#4b5563;touch-action:manipulation;white-space:nowrap}
          .pill:active{transform:scale(.96)}
          .pill.active{background:#25d366;border-color:#25d366;color:#fff}
          .uc-box{text-align:center;max-width:450px;margin:0 auto;padding:24px 16px;background:#f8f9fa;border-radius:16px}
          .uc-icon{font-size:40px;margin-bottom:12px}
          .uc-box h3{font-size:20px;font-weight:700;margin:0 0 10px}
          .uc-box p{font-size:14px;color:#6b7280;line-height:1.5;margin:0}
          .api{padding:50px 16px;background:#f8f9fa}
          .api-content{text-align:center;max-width:600px;margin:0 auto}
          .api-content h2{font-size:clamp(22px,5vw,30px);font-weight:700;margin:0 0 12px}
          .api-content p{font-size:clamp(13px,3vw,16px);color:#6b7280;line-height:1.6;margin:0}
          .ftr{border-top:1px solid #eaeaea;padding:16px;padding-bottom:calc(16px + env(safe-area-inset-bottom))}
          .ftr-in{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
          .ftr-link{font-size:13px;color:#6b7280;text-decoration:none}
          .ftr-tag{font-size:13px;color:#9ca3af}
          @media(min-width:768px){
            .hdr-in{padding:14px 24px}
            .logo-img{width:44px;height:44px}
            .logo-main{font-size:20px}
            .hero{padding:calc(90px + env(safe-area-inset-top)) 24px 60px}
            .hero-grid{flex-direction:row;align-items:center;gap:50px}
            .hero-left{flex:1}
            .hero-right{flex:1}
            .mockup-wrap{position:relative;max-width:480px;min-height:380px;flex-direction:row}
            .phone{position:absolute;left:0;top:0;width:260px}
            .code-box{position:absolute;right:0;bottom:0;width:240px}
            .code{font-size:11px}
            .features{padding:70px 24px}
            .features-grid{gap:16px}
            .fcard{padding:22px 16px}
            .ficon{font-size:34px}
            .fcard h3{font-size:16px}
            .fcard p{font-size:13px}
            .touchpoint{padding:70px 24px}
            .pill{padding:10px 20px;font-size:13px}
            .uc-box{padding:32px 24px}
            .uc-icon{font-size:48px}
            .uc-box h3{font-size:24px}
            .api{padding:70px 24px}
            .ftr{padding:20px 24px}
          }
          @media(min-width:1024px){
            .hero-grid{gap:70px}
            .features-grid{grid-template-columns:repeat(5,1fr)}
            .mockup-wrap{max-width:520px;min-height:400px}
            .phone{width:280px}
            .code-box{width:260px}
          }
        `}</style>
      </div>
    </>
  );
};

export default HomePage;