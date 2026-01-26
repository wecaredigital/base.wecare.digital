/**
 * Home Page - WECARE.DIGITAL Landing
 * Notion + WhatsApp themed - Clean, minimal design
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';

const HomePage: React.FC = () => {
  const [visible, setVisible] = useState<Set<string>>(new Set());
  
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
              <div className="phone-mockup">
                <div className="phone-notch"></div>
                <div className="wa-header">
                  <div className="wa-back"></div>
                  <div className="wa-avatar">W</div>
                  <div className="wa-info">
                    <span className="wa-name">WECARE.DIGITAL</span>
                    <span className="wa-status">online</span>
                  </div>
                  <div className="wa-icons">  </div>
                </div>
                <div className="wa-chat">
                  <div className="bubble out b1">
                    <div className="bubble-content">
                      <p>Hi! Your order #WDSR87A6G has been shipped </p>
                      <span className="time">10:30 </span>
                    </div>
                  </div>
                  <div className="bubble in b2">
                    <div className="bubble-content">
                      <p>Great! How can I track it?</p>
                      <span className="time">10:31</span>
                    </div>
                  </div>
                  <div className="bubble out b3">
                    <div className="bubble-content">
                      <p>Track: wecare.digital/track</p>
                      <span className="time">10:31 </span>
                    </div>
                  </div>
                  <div className="bubble in b4">
                    <div className="bubble-content">
                      <p>Thanks! </p>
                      <span className="time">10:32</span>
                    </div>
                  </div>
                </div>
                <div className="wa-input">
                  <span className="wa-emoji"></span>
                  <span className="wa-placeholder">Type a message</span>
                  <span className="wa-mic"></span>
                </div>
                <div className="phone-number">+919330994400</div>
              </div>
              <div className="code-snippet">
                <div className="code-bar">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                  <span className="filename">send_message.py</span>
                </div>
                <pre className="code-content">{`import requests

response = requests.post(
  "https://api.wecare.digital/v1/messages",
  json={
    "to": "+919330994400",
    "type": "text",
    "text": "Your order has shipped!"
  },
  headers={"Authorization": "Bearer API_KEY"}
)

print(response.json())`}</pre>
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
              <div className="ai-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Smart Conversations</h3>
              <p>AI-powered chatbots that understand context and deliver human-like responses</p>
            </div>
            <div className="ai-card">
              <div className="ai-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Instant Automation</h3>
              <p>Automate repetitive tasks and respond to customers in milliseconds</p>
            </div>
            <div className="ai-card">
              <div className="ai-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Real-time Analytics</h3>
              <p>Track message delivery, engagement, and conversion in real-time</p>
            </div>
            <div className="ai-card">
              <div className="ai-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Enterprise Security</h3>
              <p>End-to-end encryption and compliance with global data regulations</p>
            </div>
            <div className="ai-card">
              <div className="ai-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Team Collaboration</h3>
              <p>Multiple agents, shared inbox, and seamless handoffs between AI and humans</p>
            </div>
            <div className="ai-card">
              <div className="ai-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Flexible Integration</h3>
              <p>Connect with your CRM, helpdesk, and business tools via APIs and webhooks</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={`features anim ${show('features') ? 'show' : ''}`} id="features">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon whatsapp">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h3>WhatsApp Business API</h3>
              <p>Official API access with verified business profiles and green tick</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon sms">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>SMS Gateway</h3>
              <p>Reliable SMS delivery across India with DLT compliance</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon voice">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Voice Calls</h3>
              <p>Automated voice calls and IVR for customer engagement</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon email">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Email Campaigns</h3>
              <p>Transactional and marketing emails with high deliverability</p>
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
          .hero{padding:140px 24px 80px;max-width:1200px;margin:0 auto}
          .hero-content{display:grid;grid-template-columns:1fr 1.3fr;gap:60px;align-items:center}
          .hero-left h1{font-size:52px;font-weight:700;line-height:1.1;color:#1a1a1a;margin:0 0 20px;letter-spacing:-2px}
          .hero-left p{font-size:18px;color:#6b7280;line-height:1.7;margin:0;max-width:420px}
          
          .hero-right{display:flex;gap:24px;align-items:flex-start}
          
          /* Phone Mockup */
          .phone-mockup{width:280px;background:#1a1a1a;border-radius:40px;padding:12px;box-shadow:0 50px 100px rgba(0,0,0,.15);position:relative;animation:float 6s ease-in-out infinite}
          .phone-notch{width:120px;height:28px;background:#1a1a1a;border-radius:0 0 20px 20px;position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:10}
          .wa-header{background:#075e54;padding:50px 12px 12px;border-radius:28px 28px 0 0;display:flex;align-items:center;gap:10px}
          .wa-back{color:#fff;font-size:18px}
          .wa-avatar{width:36px;height:36px;background:#25d366;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px}
          .wa-info{display:flex;flex-direction:column;flex:1}
          .wa-name{color:#fff;font-size:14px;font-weight:600}
          .wa-status{color:rgba(255,255,255,.7);font-size:11px}
          .wa-icons{color:#fff;font-size:14px;letter-spacing:8px}
          
          .wa-chat{background:linear-gradient(180deg,#ece5dd 0%,#d9d2c5 100%);padding:16px 12px;min-height:280px;display:flex;flex-direction:column;gap:8px}
          .bubble{max-width:85%;padding:8px 12px;border-radius:12px;font-size:13px;line-height:1.5}
          .bubble.in{background:#fff;align-self:flex-start;border-bottom-left-radius:4px}
          .bubble.out{background:#d9fdd3;align-self:flex-end;border-bottom-right-radius:4px}
          .bubble-content p{margin:0 0 4px}
          .time{font-size:10px;color:#667781;display:block;text-align:right}
          
          .b1{animation:bubbleIn .5s ease .3s both}
          .b2{animation:bubbleIn .5s ease .8s both}
          .b3{animation:bubbleIn .5s ease 1.3s both}
          .b4{animation:bubbleIn .5s ease 1.8s both}
          
          @keyframes bubbleIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
          @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
          
          .wa-input{background:#f0f2f5;padding:10px 12px;border-radius:0 0 28px 28px;display:flex;align-items:center;gap:12px}
          .wa-emoji{font-size:20px}
          .wa-placeholder{flex:1;color:#667781;font-size:14px}
          .wa-mic{font-size:18px}
          .phone-number{text-align:center;color:#fff;font-size:11px;padding:8px 0 4px;opacity:.6}
          
          /* Code Snippet */
          .code-snippet{width:320px;background:#1e1e1e;border-radius:16px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,.12);animation:float 6s ease-in-out infinite;animation-delay:.5s}
          .code-bar{display:flex;align-items:center;gap:8px;padding:12px 16px;background:#2d2d2d}
          .dot{width:12px;height:12px;border-radius:50%}
          .dot.red{background:#ff5f56}
          .dot.yellow{background:#ffbd2e}
          .dot.green{background:#27ca40}
          .filename{margin-left:auto;font-size:12px;color:#808080}
          .code-content{margin:0;padding:16px;font-family:'SF Mono',Monaco,'Courier New',monospace;font-size:12px;line-height:1.6;color:#d4d4d4;overflow-x:auto}

          /* AI Section */
          .ai-section{padding:100px 24px;max-width:1200px;margin:0 auto}
          .ai-header{text-align:center;margin-bottom:60px}
          .ai-header h2{font-size:42px;font-weight:700;color:#1a1a1a;margin:0 0 16px;letter-spacing:-1.5px}
          .ai-header p{font-size:18px;color:#6b7280;line-height:1.7;max-width:700px;margin:0 auto}
          
          .ai-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
          .ai-card{background:#fafafa;border:1px solid #e5e5e5;border-radius:16px;padding:32px 28px;transition:all .3s ease}
          .ai-card:hover{background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.06);transform:translateY(-4px)}
          .ai-icon{width:48px;height:48px;background:#fff;border:1px solid #e5e5e5;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px}
          .ai-icon svg{width:24px;height:24px;color:#1a1a1a}
          .ai-card h3{font-size:18px;font-weight:600;color:#1a1a1a;margin:0 0 10px}
          .ai-card p{font-size:14px;color:#6b7280;line-height:1.6;margin:0}

          /* Features Section */
          .features{padding:80px 24px 100px;max-width:1200px;margin:0 auto}
          .features-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
          .feature-card{background:#fafafa;border:1px solid #e5e5e5;border-radius:16px;padding:28px 24px;text-align:center;transition:all .3s ease}
          .feature-card:hover{background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.06);transform:translateY(-4px)}
          .feature-icon{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px}
          .feature-icon svg{width:28px;height:28px}
          .feature-icon.whatsapp{background:#dcfce7;color:#25d366}
          .feature-icon.sms{background:#dbeafe;color:#3b82f6}
          .feature-icon.voice{background:#fef3c7;color:#f59e0b}
          .feature-icon.email{background:#fce7f3;color:#ec4899}
          .feature-card h3{font-size:16px;font-weight:600;color:#1a1a1a;margin:0 0 8px}
          .feature-card p{font-size:13px;color:#6b7280;line-height:1.5;margin:0}

          /* Footer */
          .ftr{border-top:1px solid #e5e5e5;padding:24px}
          .ftr-in{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
          .ftr-contact{font-size:14px;color:#9ca3af;text-decoration:none;transition:color .2s}
          .ftr-contact:hover{color:#6b7280}
          .ftr-tagline{font-size:14px;color:#9ca3af}

          @media(max-width:1024px){
            .hero-content{grid-template-columns:1fr;text-align:center;gap:50px}
            .hero-left h1{font-size:42px}
            .hero-left p{margin:0 auto}
            .hero-right{justify-content:center;flex-wrap:wrap}
            .ai-grid{grid-template-columns:repeat(2,1fr)}
            .features-grid{grid-template-columns:repeat(2,1fr)}
          }
          @media(max-width:768px){
            .hero-left h1{font-size:34px}
            .ai-header h2{font-size:32px}
            .ai-grid{grid-template-columns:1fr}
            .features-grid{grid-template-columns:1fr}
            .phone-mockup{width:260px}
            .code-snippet{width:280px}
          }
          @media(max-width:480px){
            .hero{padding:120px 16px 60px}
            .hero-left h1{font-size:28px}
            .hero-right{flex-direction:column;align-items:center}
            .phone-mockup,.code-snippet{width:100%;max-width:300px}
            .ftr-in{flex-direction:column;gap:12px;text-align:center}
          }
        `}</style>
      </div>
    </>
  );
};

export default HomePage;