/**
 * Home Page - WECARE.DIGITAL Landing
 * Inspired by Sinch - clean API-focused design
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
        <meta name="description" content="WhatsApp, SMS, Email, Voice APIs" />
      </Head>
      <div className="page">
        <header className="hdr">
          <div className="hdr-in">
            <div className="logo">
              <img src="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" alt="" className="logo-img" />
              <span>WECARE.DIGITAL</span>
            </div>
            <a href="mailto:hello@wecare.digital" className="hdr-btn">Contact</a>
          </div>
        </header>

        <section className={`hero anim ${show('hero') ? 'show' : ''}`} id="hero">
          <div className="hero-txt">
            <span className="tag">APIS</span>
            <h1>Messaging, SMS, and voice APIs to help developers build better products</h1>
            <p>Start small or scale globally - our messaging and voice APIs provide the secure, reliable foundation you need to connect with every customer worldwide.</p>
            <div className="btns">
              <a href="mailto:hello@wecare.digital" className="btn-p">Try for free</a>
              <a href="mailto:hello@wecare.digital" className="btn-s">View APIs</a>
            </div>
            <div className="brands"><span>AWS</span><span>Razorpay</span><span>Airtel</span></div>
          </div>
          <div className="hero-vis">
            <div className="phone fl">
              <div className="ph-top">+91 98765-43210</div>
              <div className="ph-body">
                <div className="sms-box"><small>SMS Verification</small><p>Your code is <b>123456</b></p></div>
                <div className="otp-ui">
                  <div className="otp-head">Verify your account</div>
                  <div className="otp-sub">Enter the 6 digit code</div>
                  <div className="otp-row"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div>
                  <button className="otp-btn">Verify</button>
                </div>
              </div>
            </div>
            <div className="code fl d1">
              <div className="code-bar"><i className="dot r"></i><i className="dot y"></i><i className="dot g"></i><span>send_sms.py</span></div>
              <pre className="code-txt">{`payload = {
  "to": "+919876543210",
  "message": "Your OTP: 123456"
}

response = requests.post(
  "api.wecare.digital/send",
  json=payload
)`}</pre>
            </div>
          </div>
        </section>
        <section className={`apps anim ${show('apps') ? 'show' : ''}`} id="apps">
          <div className="apps-txt">
            <span className="tag t2">APPLICATIONS</span>
            <h2>User-friendly apps to help businesses engage their customers</h2>
            <p>Send messages, collect payments, and build chatbots that improve customer experience and grow your business.</p>
            <a href="mailto:hello@wecare.digital" className="btn-p">Get Started</a>
          </div>
          <div className="apps-vis">
            <div className="wa-mock fl d2">
              <div className="wa-hd"><div className="wa-av">W</div><div><b>WECARE.DIGITAL</b><small>online</small></div><span className="tick">V</span></div>
              <div className="wa-ch">
                <div className="msg out">Hi! Your order shipped<span>10:30</span></div>
                <div className="msg in">When will it arrive?<span>10:31</span></div>
                <div className="msg out">Tomorrow by 6 PM<span>10:31</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className={`pay anim ${show('pay') ? 'show' : ''}`} id="pay">
          <div className="pay-vis">
            <div className="wa-mock fl d3">
              <div className="wa-hd"><div className="wa-av">W</div><div><b>WECARE.DIGITAL</b><small>online</small></div><span className="tick">V</span></div>
              <div className="wa-ch">
                <div className="msg out pay-msg">
                  <div className="pay-card"><small>Payment Request</small><b>Rs 2,499</b><span>Premium Plan</span></div>
                  <button className="pay-btn">Pay with UPI</button>
                  <span>10:32</span>
                </div>
                <div className="msg in">Payment successful!<span>10:33</span></div>
              </div>
            </div>
          </div>
          <div className="pay-txt">
            <span className="tag t3">PAYMENTS</span>
            <h2>Collect payments directly in chat conversations</h2>
            <p>Let customers pay via UPI, cards, and wallets without leaving WhatsApp. Secure transactions powered by Razorpay.</p>
            <a href="mailto:hello@wecare.digital" className="btn-p">Get Started</a>
          </div>
        </section>

        <section className={`feat anim ${show('feat') ? 'show' : ''}`} id="feat">
          <h2>Everything you need</h2>
          <p className="feat-sub">One platform for all your business communication</p>
          <div className="feat-grid">
            <div className="fc"><span>WhatsApp API</span><small>Official Business API</small></div>
            <div className="fc"><span>SMS</span><small>Global SMS delivery</small></div>
            <div className="fc"><span>Payments</span><small>UPI, cards via Razorpay</small></div>
            <div className="fc"><span>AI Support</span><small>24/7 automated replies</small></div>
            <div className="fc"><span>Bulk Messaging</span><small>Send to thousands</small></div>
            <div className="fc"><span>Analytics</span><small>Real-time insights</small></div>
          </div>
        </section>

        <section className="cta">
          <h2>Ready to get started?</h2>
          <p>Transform how you communicate with customers</p>
          <a href="mailto:hello@wecare.digital" className="btn-p lg">Contact Sales</a>
        </section>

        <footer className="ftr">
          <div className="ftr-in">
            <div className="ftr-brand"><img src="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" alt="" /><span>WECARE.DIGITAL</span></div>
            <span>2026 WECARE.DIGITAL</span>
          </div>
        </footer>
        <style jsx>{`
          .page{min-height:100vh;background:#fff;font-family:-apple-system,BlinkMacSystemFont,Roboto,sans-serif;color:#1a1a1a;overflow-x:hidden}
          .hdr{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,.95);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.05)}
          .hdr-in{max-width:1200px;margin:0 auto;padding:16px 24px;display:flex;justify-content:space-between;align-items:center}
          .logo{display:flex;align-items:center;gap:12px;font-weight:700;font-size:18px}
          .logo-img{width:40px;height:40px;border-radius:12px}
          .hdr-btn{color:#555;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:10px;border:1px solid #e5e5e5;transition:all .2s}
          .hdr-btn:hover{background:#f5f5f5}
          .anim{opacity:0;transform:translateY(50px);transition:all .7s ease}
          .anim.show{opacity:1;transform:translateY(0)}
          .hero{display:grid;grid-template-columns:1fr 1.2fr;gap:60px;align-items:center;padding:140px 24px 100px;max-width:1200px;margin:0 auto;background:linear-gradient(135deg,#e0f2fe 0%,#bae6fd 100%);margin-left:calc(-50vw + 50%);margin-right:calc(-50vw + 50%);padding-left:calc(50vw - 600px + 24px);padding-right:calc(50vw - 600px + 24px)}
          .hero-txt h1{font-size:44px;font-weight:800;line-height:1.15;color:#0f172a;margin:0 0 20px;letter-spacing:-1.5px}
          .hero-txt p{font-size:17px;color:#475569;line-height:1.7;margin:0 0 28px;max-width:480px}
          .tag{display:inline-block;background:#0891b2;color:#fff;padding:6px 14px;border-radius:6px;font-size:12px;font-weight:700;margin-bottom:20px;letter-spacing:1px}
          .t2{background:#25d366}
          .t3{background:#6366f1}
          .btns{display:flex;gap:12px;margin-bottom:28px}
          .btn-p{display:inline-flex;align-items:center;background:#f59e0b;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600;transition:all .3s;box-shadow:0 4px 20px rgba(245,158,11,.3)}
          .btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(245,158,11,.4)}
          .btn-p.lg{padding:16px 36px;font-size:16px}
          .btn-s{display:inline-flex;align-items:center;background:#fff;color:#0f172a;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600;border:1px solid #e2e8f0;transition:all .3s}
          .btn-s:hover{background:#f8fafc}
          .brands{display:flex;gap:24px;font-size:15px;font-weight:700;color:#64748b}
          .hero-vis{display:flex;gap:20px;justify-content:center;position:relative}
          .phone{width:220px;background:#fff;border-radius:24px;padding:16px;box-shadow:0 30px 60px rgba(0,0,0,.12)}
          .ph-top{font-size:13px;font-weight:600;color:#0f172a;padding-bottom:12px;border-bottom:1px solid #f1f5f9;margin-bottom:12px}
          .ph-body{display:flex;flex-direction:column;gap:12px}
          .sms-box{background:#f1f5f9;border-radius:10px;padding:12px}
          .sms-box small{font-size:11px;color:#64748b;display:block;margin-bottom:4px}
          .sms-box p{margin:0;font-size:14px;color:#0f172a}
          .otp-ui{text-align:center}
          .otp-head{font-size:14px;font-weight:600;color:#0f172a}
          .otp-sub{font-size:12px;color:#64748b;margin-bottom:12px}
          .otp-row{display:flex;gap:6px;justify-content:center;margin-bottom:12px}
          .otp-row span{width:28px;height:36px;background:#f8fafc;border:2px solid #e2e8f0;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700}
          .otp-btn{background:#0891b2;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;width:100%}
          .code{width:300px;background:#1e293b;border-radius:14px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.2)}
          .code-bar{display:flex;align-items:center;gap:6px;padding:10px 14px;background:#0f172a}
          .dot{width:10px;height:10px;border-radius:50%}
          .dot.r{background:#ef4444}
          .dot.y{background:#eab308}
          .dot.g{background:#22c55e}
          .code-bar span{margin-left:auto;font-size:11px;color:#64748b}
          .code-txt{padding:14px;margin:0;font-family:monospace;font-size:11px;line-height:1.6;color:#e2e8f0;overflow-x:auto}
          .fl{animation:float 5s ease-in-out infinite}
          .d1{animation-delay:.5s}
          .d2{animation-delay:1s}
          .d3{animation-delay:1.5s}
          @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}          .apps,.pay{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;padding:100px 24px;max-width:1200px;margin:0 auto}
          .apps{background:#fff}
          .pay{background:linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%);margin-left:calc(-50vw + 50%);margin-right:calc(-50vw + 50%);padding-left:calc(50vw - 600px + 24px);padding-right:calc(50vw - 600px + 24px);max-width:none}
          .apps-txt h2,.pay-txt h2{font-size:38px;font-weight:800;line-height:1.15;color:#0f172a;margin:0 0 16px;letter-spacing:-1px}
          .apps-txt p,.pay-txt p{font-size:17px;color:#475569;line-height:1.7;margin:0 0 24px;max-width:440px}
          .wa-mock{width:300px;background:#1a1a1a;border-radius:36px;padding:10px;box-shadow:0 40px 80px rgba(0,0,0,.15)}
          .wa-hd{background:#075e54;padding:12px;border-radius:26px 26px 0 0;display:flex;align-items:center;gap:10px}
          .wa-av{width:36px;height:36px;background:#25d366;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px}
          .wa-hd div{flex:1}
          .wa-hd b{display:block;color:#fff;font-size:14px}
          .wa-hd small{color:rgba(255,255,255,.7);font-size:11px}
          .tick{background:#25d366;color:#fff;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700}
          .wa-ch{background:linear-gradient(180deg,#ece5dd 0%,#d9d2c5 100%);padding:14px 10px;border-radius:0 0 26px 26px;min-height:200px;display:flex;flex-direction:column;gap:6px}
          .msg{max-width:80%;padding:8px 12px;border-radius:10px;font-size:13px;line-height:1.4;position:relative}
          .msg span{font-size:10px;color:#667781;display:block;text-align:right;margin-top:2px}
          .msg.in{background:#fff;align-self:flex-start;border-bottom-left-radius:2px}
          .msg.out{background:#d9fdd3;align-self:flex-end;border-bottom-right-radius:2px}
          .pay-msg{padding:12px}
          .pay-card{display:flex;flex-direction:column;gap:2px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid rgba(0,0,0,.08)}
          .pay-card small{font-size:11px;color:#667781}
          .pay-card b{font-size:24px;color:#0f172a}
          .pay-card span{font-size:12px;color:#475569}
          .pay-btn{background:#25d366;color:#fff;border:none;padding:10px;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;margin-bottom:6px;width:100%}
          .feat{padding:100px 24px;background:#fff;text-align:center;max-width:1200px;margin:0 auto}
          .feat h2{font-size:38px;font-weight:800;color:#0f172a;margin:0 0 12px;letter-spacing:-1px}
          .feat-sub{font-size:17px;color:#64748b;margin:0 0 50px}
          .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
          .fc{background:#f8fafc;border-radius:16px;padding:28px 24px;text-align:left;border:1px solid #e2e8f0;transition:all .3s}
          .fc:hover{background:#fff;box-shadow:0 20px 50px rgba(0,0,0,.06);transform:translateY(-4px)}
          .fc span{display:block;font-size:18px;font-weight:700;color:#0f172a;margin-bottom:6px}
          .fc small{font-size:14px;color:#64748b}
          .cta{padding:100px 24px;text-align:center;background:linear-gradient(180deg,#fff 0%,#ecfdf5 100%)}
          .cta h2{font-size:38px;font-weight:800;color:#0f172a;margin:0 0 12px;letter-spacing:-1px}
          .cta p{font-size:17px;color:#64748b;margin:0 0 32px}
          .ftr{border-top:1px solid #e2e8f0;padding:24px}
          .ftr-in{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
          .ftr-brand{display:flex;align-items:center;gap:10px;font-weight:600;font-size:14px}
          .ftr-brand img{width:24px;height:24px;border-radius:6px}
          .ftr-in>span{font-size:13px;color:#94a3b8}
          @media(max-width:1024px){.hero,.apps,.pay{grid-template-columns:1fr;text-align:center;gap:40px}.hero{padding-top:120px}.hero-txt p,.apps-txt p,.pay-txt p{margin-left:auto;margin-right:auto}.btns,.brands{justify-content:center}.hero-vis,.apps-vis,.pay-vis{justify-content:center}.feat-grid{grid-template-columns:repeat(2,1fr)}}
          @media(max-width:768px){.hero-txt h1{font-size:34px}.apps-txt h2,.pay-txt h2,.feat h2,.cta h2{font-size:30px}.feat-grid{grid-template-columns:1fr;max-width:360px;margin:0 auto}.phone{width:200px}.code{width:260px}.wa-mock{width:260px}.hero-vis{flex-wrap:wrap}}
          @media(max-width:480px){.hero{padding:100px 16px 60px}.hero-txt h1{font-size:28px}.btns{flex-direction:column}.phone{width:100%;max-width:220px}.code{width:100%;max-width:280px}.wa-mock{width:100%;max-width:260px}.ftr-in{flex-direction:column;gap:12px}}
        `}</style>
      </div>
    </>
  );
};

export default HomePage;