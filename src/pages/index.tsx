/**
 * WECARE.DIGITAL Landing Page
 * Notion + WhatsApp theme
 */

import React from 'react';
import Head from 'next/head';

const HomePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>WECARE.DIGITAL - Business Communication Platform</title>
        <meta name="description" content="WhatsApp, SMS, Voice, Payments - all in one place" />
      </Head>

      <div className="page">
        {/* Header */}
        <header className="header">
          <div className="logo">
            <img src="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" alt="" />
            <span>WECARE.DIGITAL</span>
          </div>
        </header>

        {/* Hero */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-text">
              <h1>One platform.<br/>Every conversation.</h1>
              <p>WhatsApp, SMS, Voice, Payments — all in one place. Connect with your customers on the channels they love.</p>
            </div>
            <div className="hero-visual">
              <div className="phone float">
                <div className="phone-header">
                  <span className="back"></span>
                  <div className="avatar">W</div>
                  <div className="contact">
                    <strong>WECARE.DIGITAL</strong>
                    <span>+919330994400</span>
                  </div>
                  <div className="verified"></div>
                </div>
                <div className="chat">
                  <div className="bubble out float-1">Hi! Your order #WDSR87A6G has been shipped <span>10:30</span></div>
                  <div className="bubble in float-2">When will it arrive?<span>10:31</span></div>
                  <div className="bubble out float-3">Tomorrow by 6 PM <span>10:31</span></div>
                  <div className="bubble out float-4">Track: wecare.digital/track<span>10:32</span></div>
                  <div className="typing"><i></i><i></i><i></i></div>
                </div>
              </div>
              <div className="code float-5">
                <div className="code-bar"><i className="r"></i><i className="y"></i><i className="g"></i><span>send.py</span></div>
                <pre>{`requests.post(
  "api.wecare.digital/send",
  json={
    "to": "+919330994400",
    "message": "Your OTP: 4521"
  }
)`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features">
          <div className="features-grid">
            <div className="card">
              <span className="icon"></span>
              <h3>WhatsApp API</h3>
              <p>Official Business API with templates, media, and interactive buttons.</p>
            </div>
            <div className="card">
              <span className="icon"></span>
              <h3>SMS & Voice</h3>
              <p>Instant SMS delivery and automated voice calls across India.</p>
            </div>
            <div className="card">
              <span className="icon"></span>
              <h3>Payments</h3>
              <p>Collect payments via UPI and cards directly in WhatsApp chats.</p>
            </div>
            <div className="card">
              <span className="icon"></span>
              <h3>AI Support</h3>
              <p>Automate customer queries 24/7 with intelligent chatbots.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-left">
              <span>wecare.digital</span>
            </div>
            <div className="footer-right">
              <p className="tagline">Tap. Track. Done.</p>
              <p className="subtitle">Everyday things made easy.</p>
            </div>
          </div>
        </footer>

        <style jsx>{`
          .page{background:#fff;color:#37352F;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-height:100vh}

          .header{padding:20px 40px}
          .logo{display:flex;align-items:center;gap:12px;font-size:18px;font-weight:600;color:#37352F}
          .logo img{width:36px;height:36px;border-radius:8px}

          .hero{padding:60px 40px 100px;max-width:1200px;margin:0 auto}
          .hero-content{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
          .hero-text h1{font-size:52px;font-weight:700;line-height:1.15;color:#37352F;margin:0 0 24px;letter-spacing:-1.5px}
          .hero-text p{font-size:20px;color:#787774;line-height:1.6;margin:0;max-width:480px}

          .hero-visual{position:relative;display:flex;justify-content:center;padding:20px}

          .phone{width:300px;background:#fff;border-radius:40px;box-shadow:0 30px 100px rgba(0,0,0,.12);overflow:hidden}
          .phone-header{background:#075E54;padding:16px;display:flex;align-items:center;gap:12px}
          .back{color:#fff;font-size:20px}
          .avatar{width:44px;height:44px;background:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px}
          .contact{flex:1}
          .contact strong{display:block;color:#fff;font-size:16px}
          .contact span{color:rgba(255,255,255,.7);font-size:12px}
          .verified{width:22px;height:22px;background:#25D366;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px}
          .chat{background:#ECE5DD;padding:20px 16px;min-height:320px;display:flex;flex-direction:column;gap:10px}
          .bubble{max-width:85%;padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.5;position:relative}
          .bubble span{display:block;font-size:11px;color:#667781;text-align:right;margin-top:4px}
          .bubble.out{background:#DCF8C6;align-self:flex-end;border-bottom-right-radius:4px}
          .bubble.in{background:#fff;align-self:flex-start;border-bottom-left-radius:4px}
          .typing{background:#fff;padding:14px 18px;border-radius:12px;border-bottom-left-radius:4px;display:flex;gap:5px;align-self:flex-start;width:70px}
          .typing i{width:8px;height:8px;background:#90949c;border-radius:50%;animation:bounce 1.4s infinite}
          .typing i:nth-child(2){animation-delay:.2s}
          .typing i:nth-child(3){animation-delay:.4s}

          .code{position:absolute;right:-20px;bottom:40px;width:300px;background:#1E1E1E;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.2)}
          .code-bar{background:#323232;padding:10px 14px;display:flex;align-items:center;gap:6px}
          .code-bar i{width:12px;height:12px;border-radius:50%}
          .code-bar .r{background:#FF5F56}
          .code-bar .y{background:#FFBD2E}
          .code-bar .g{background:#27C93F}
          .code-bar span{margin-left:auto;color:#787774;font-size:12px}
          .code pre{margin:0;padding:16px;color:#D4D4D4;font-family:'SF Mono',Monaco,monospace;font-size:13px;line-height:1.6}

          .float{animation:float 6s ease-in-out infinite}
          .float-1{animation:float 5s ease-in-out infinite}
          .float-2{animation:float 5.5s ease-in-out infinite .3s}
          .float-3{animation:float 5s ease-in-out infinite .6s}
          .float-4{animation:float 5.5s ease-in-out infinite .9s}
          .float-5{animation:float 6s ease-in-out infinite .5s}
          @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
          @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}

          .features{padding:80px 40px;background:#F7F6F3}
          .features-grid{max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
          .card{background:#fff;border-radius:12px;padding:28px;transition:box-shadow .3s}
          .card:hover{box-shadow:0 8px 30px rgba(0,0,0,.08)}
          .icon{font-size:32px;display:block;margin-bottom:16px}
          .card h3{font-size:18px;font-weight:600;color:#37352F;margin:0 0 8px}
          .card p{font-size:15px;color:#787774;line-height:1.6;margin:0}

          .footer{padding:40px;border-top:1px solid #E5E5E5}
          .footer-content{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
          .footer-left span{font-size:16px;color:#C0C0C0;font-weight:500}
          .footer-right{text-align:right}
          .footer-right .tagline{font-size:18px;font-weight:600;color:#37352F;margin:0 0 4px}
          .footer-right .subtitle{font-size:14px;color:#787774;margin:0}

          @media(max-width:900px){
            .hero-content{grid-template-columns:1fr;text-align:center}
            .hero-text p{margin:0 auto}
            .hero-visual{margin-top:40px}
            .code{position:relative;right:0;bottom:0;margin-top:-40px}
            .features-grid{grid-template-columns:1fr}
            .footer-content{flex-direction:column;gap:24px;text-align:center}
            .footer-right{text-align:center}
          }
          @media(max-width:600px){
            .header{padding:16px 20px}
            .hero{padding:40px 20px 60px}
            .hero-text h1{font-size:36px}
            .hero-text p{font-size:17px}
            .phone{width:260px}
            .code{width:260px}
            .features{padding:60px 20px}
            .footer{padding:30px 20px}
          }
        `}</style>
      </div>
    </>
  );
};

export default HomePage;