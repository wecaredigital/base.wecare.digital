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
    { title: 'Promotional', desc: 'Drive sales with targeted campaigns.', icon: '' },
    { title: 'Transactional', desc: 'Order confirmations, shipping updates.', icon: '' },
    { title: 'Appointments', desc: 'Booking confirmations, reminders.', icon: '' },
    { title: 'OTPs', desc: 'Secure one-time passwords.', icon: '' },
    { title: 'Orders', desc: 'Complete order management.', icon: '' },
    { title: 'Surveys', desc: 'Collect feedback in chat.', icon: '' },
  ];

  const heroCode = "response = requests.post(\n    \"api.wecare.digital/v1/send\",\n    json={\n        \"to\": \"+919330994400\",\n        \"type\": \"text\",\n        \"message\": \"Your OTP: 847291\"\n    },\n    headers={\"Authorization\": api_key}\n)";

  const pythonCode = "import requests\n\nresponse = requests.post(\n    \"https://api.wecare.digital/v1/messages\",\n    headers={\"Authorization\": \"Bearer API_KEY\"},\n    json={\"to\": \"+919330994400\", \"type\": \"template\"}\n)";

  const jsCode = "const response = await fetch(\n    \"https://api.wecare.digital/v1/messages\",\n    {\n        method: \"POST\",\n        headers: {\"Authorization\": \"Bearer API_KEY\"},\n        body: JSON.stringify({to: \"+919330994400\", type: \"template\"})\n    }\n);";

  const curlCode = "curl -X POST \\\n    \"https://api.wecare.digital/v1/messages\" \\\n    -H \"Authorization: Bearer API_KEY\" \\\n    -d '{\"to\": \"+919330994400\", \"type\": \"template\"}'";

  const codeExamples = [
    { lang: 'Python', code: pythonCode },
    { lang: 'JavaScript', code: jsCode },
    { lang: 'cURL', code: curlCode },
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
              <span className="logo-main">WECARE.DIGITAL</span>
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
                  <pre className="code">{heroCode}</pre>
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
          <div className="api-grid">
            <div className="api-info">
              <h2>Built for the AI era.</h2>
              <p>The all-in-one platform for enterprise brands—powered by AI that truly understands your business.</p>
            </div>
            <div className="api-demo">
              <div className="code-tabs">
                {codeExamples.map((c, i) => (
                  <button key={i} className={`tab ${activeCode === i ? 'active' : ''}`} onClick={() => setActiveCode(i)}>{c.lang}</button>
                ))}
              </div>
              <pre className="api-code">{codeExamples[activeCode].code}</pre>
            </div>
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
          .page{min-height:100vh;min-height:100dvh;background:#fff;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch}
          .hdr{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,.97);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.06);padding-top:env(safe-area-inset-top)}
          .hdr-in{max-width:1200px;margin:0 auto;padding:14px 20px;display:flex;align-items:center}
          .logo{display:flex;align-items:center;gap:12px}
          .logo-img{width:36px;height:36px;border-radius:8px}
          .logo-main{font-size:16px;font-weight:700;letter-spacing:0.5px}
          .anim{opacity:0;transform:translateY(30px);transition:all .6s cubic-bezier(.16,1,.3,1)}
          .anim.show{opacity:1;transform:translateY(0)}
          .hero{padding:calc(90px + env(safe-area-inset-top)) 20px 50px;max-width:1200px;margin:0 auto}
          .hero-grid{display:flex;flex-direction:column;gap:40px}
          .hero-left h1{font-size:clamp(28px,6vw,44px);font-weight:800;line-height:1.1;margin:0 0 20px;letter-spacing:-1px;color:#0f172a}
          .hero-left p{font-size:clamp(15px,3.5vw,18px);color:#64748b;line-height:1.7;margin:0 0 28px;max-width:480px}
          .hero-stats{display:flex;gap:12px;flex-wrap:wrap}
          .stat{background:#f8faf9;border:1px solid #e2e8f0;border-radius:14px;padding:16px 20px;flex:1;min-width:100px;text-align:center}
          .stat span{display:block;font-size:22px;font-weight:800;color:#0f172a}
          .stat small{font-size:12px;color:#64748b;margin-top:4px;display:block}
          .hero-right{display:flex;justify-content:center}
          .mockup-wrap{display:flex;flex-direction:column;align-items:center;gap:20px;width:100%;max-width:360px}
          .phone{width:100%;background:#e5f5ed;border-radius:24px;overflow:hidden;box-shadow:0 25px 80px rgba(0,0,0,.12)}
          .phone-hdr{background:#075e54;padding:14px 16px;display:flex;align-items:center;gap:12px}
          .wa-avatar{width:44px;height:44px;background:#25d366;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:20px}
          .wa-info{flex:1;display:flex;flex-direction:column}
          .wa-name{color:#fff;font-size:16px;font-weight:600}
          .wa-status{color:rgba(255,255,255,.7);font-size:12px}
          .wa-dot{width:12px;height:12px;background:#25d366;border-radius:50%}
          .chat{background:#e8efe5;padding:16px 14px;min-height:280px;display:flex;flex-direction:column;gap:8px}
          .bubble{max-width:85%;padding:12px 14px;border-radius:12px;font-size:14px;line-height:1.5}
          .bubble.in{background:#fff;align-self:flex-start;border-top-left-radius:4px}
          .bubble.out{background:#d9fdd3;align-self:flex-end;border-top-right-radius:4px}
          .bubble .ts{font-size:10px;color:#667781;display:block;text-align:right;margin-top:4px}
          .typing{background:#fff;padding:14px 18px;border-radius:12px;border-top-left-radius:4px;align-self:flex-start;display:flex;gap:5px}
          .typing span{width:8px;height:8px;background:#90a4ae;border-radius:50%;animation:typ 1.4s infinite}
          .typing span:nth-child(2){animation-delay:.2s}
          .typing span:nth-child(3){animation-delay:.4s}
          @keyframes typ{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}
          .code-box{width:100%;background:#3d4f5f;border-radius:14px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.2)}
          .code-hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#4a5d6e}
          .dots{display:flex;gap:6px}
          .d{width:12px;height:12px;border-radius:50%;display:block}
          .d.r{background:#ff5f57}
          .d.y{background:#ffbd2e}
          .d.g{background:#28c840}
          .fname{font-size:12px;color:rgba(255,255,255,.7);font-family:monospace}
          .code{margin:0;padding:16px;font-family:monospace;font-size:12px;line-height:1.6;color:#e5e7eb;white-space:pre;overflow-x:auto;-webkit-overflow-scrolling:touch}
          .features{padding:60px 20px;background:#f8fafc}
          .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;max-width:1200px;margin:0 auto}
          .fcard{background:#fff;border-radius:16px;padding:24px 18px;text-align:center;touch-action:manipulation;border:1px solid #e2e8f0}
          .fcard:active{transform:scale(.98)}
          .ficon{font-size:36px;margin-bottom:14px}
          .fcard h3{font-size:16px;font-weight:700;margin:0 0 8px;color:#0f172a}
          .fcard p{font-size:13px;color:#64748b;line-height:1.5;margin:0}
          .sec-hdr{text-align:center;max-width:600px;margin:0 auto 40px;padding:0 20px}
          .sec-hdr h2{font-size:clamp(24px,5vw,36px);font-weight:800;line-height:1.2;margin:0 0 12px;color:#0f172a}
          .sec-hdr p{font-size:clamp(14px,3vw,17px);color:#64748b;margin:0}
          .touchpoint{padding:60px 20px;background:#fff}
          .pills{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:32px}
          .pill{padding:12px 20px;border:2px solid #e2e8f0;background:#fff;border-radius:50px;font-size:14px;font-weight:600;cursor:pointer;color:#475569;touch-action:manipulation;white-space:nowrap}
          .pill:active{transform:scale(.96)}
          .pill.active{background:#25d366;border-color:#25d366;color:#fff}
          .uc-box{text-align:center;max-width:500px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:20px;border:1px solid #e2e8f0}
          .uc-icon{font-size:52px;margin-bottom:16px}
          .uc-box h3{font-size:24px;font-weight:700;margin:0 0 12px;color:#0f172a}
          .uc-box p{font-size:16px;color:#64748b;line-height:1.6;margin:0}
          .api{padding:60px 20px;background:#f8fafc}
          .api-grid{display:flex;flex-direction:column;gap:40px;max-width:1000px;margin:0 auto}
          .api-info{text-align:center}
          .api-info h2{font-size:clamp(24px,5vw,36px);font-weight:800;margin:0 0 16px;color:#0f172a}
          .api-info p{font-size:clamp(14px,3vw,17px);color:#64748b;line-height:1.6;margin:0 auto;max-width:600px}
          .api-demo{background:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.15)}
          .code-tabs{display:flex;gap:8px;padding:16px 20px;background:#0f172a;overflow-x:auto;-webkit-overflow-scrolling:touch}
          .tab{padding:12px 24px;border:none;border-radius:10px;font-size:15px;font-weight:600;color:#94a3b8;background:transparent;cursor:pointer;touch-action:manipulation;white-space:nowrap;flex-shrink:0}
          .tab:active{transform:scale(.96)}
          .tab.active{background:#25d366;color:#fff}
          .api-code{margin:0;padding:24px;font-family:monospace;font-size:14px;line-height:1.7;color:#e2e8f0;overflow-x:auto;-webkit-overflow-scrolling:touch;white-space:pre}
          .ftr{border-top:1px solid #e2e8f0;padding:20px;padding-bottom:calc(20px + env(safe-area-inset-bottom))}
          .ftr-in{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
          .ftr-link{font-size:14px;color:#64748b;text-decoration:none}
          .ftr-tag{font-size:14px;color:#94a3b8}
          @media(min-width:768px){
            .hdr-in{padding:16px 32px}
            .logo-img{width:40px;height:40px}
            .logo-main{font-size:18px}
            .hero{padding:calc(100px + env(safe-area-inset-top)) 32px 70px}
            .hero-grid{flex-direction:row;align-items:center;gap:60px}
            .hero-left{flex:1}
            .hero-right{flex:1}
            .mockup-wrap{position:relative;max-width:560px;min-height:500px;flex-direction:row}
            .phone{position:absolute;left:0;top:0;width:340px}
            .code-box{position:absolute;right:0;bottom:20px;width:320px}
            .features{padding:80px 32px}
            .features-grid{gap:20px}
            .fcard{padding:28px 20px}
            .ficon{font-size:40px}
            .fcard h3{font-size:17px}
            .fcard p{font-size:14px}
            .touchpoint{padding:80px 32px}
            .pill{padding:14px 28px;font-size:15px}
            .uc-box{padding:40px 32px}
            .uc-icon{font-size:60px}
            .uc-box h3{font-size:28px}
            .api{padding:80px 32px}
            .api-grid{flex-direction:row;align-items:center;gap:60px}
            .api-info{text-align:left;flex:1}
            .api-info p{margin:0}
            .api-demo{flex:1}
            .api-code{font-size:15px;padding:28px}
            .ftr{padding:24px 32px}
          }
          @media(min-width:1024px){
            .hero-grid{gap:80px}
            .features-grid{grid-template-columns:repeat(5,1fr)}
            .mockup-wrap{max-width:640px;min-height:560px}
            .phone{width:380px}
            .code-box{width:360px;bottom:30px}
            .code{font-size:13px}
          }
        `}</style>
      </div>
    </>
  );
};

export default HomePage;
