/**
 * Home Page - WECARE.DIGITAL Landing
 * Nugget-style clean design
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';

const HomePage: React.FC = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      n += 2500;
      if (n >= 125000) { setCount(125000); clearInterval(t); }
      else setCount(n);
    }, 30);
    return () => clearInterval(t);
  }, []);

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
            <a href="mailto:hello@wecare.digital" className="hdr-btn">Contact Sales</a>
          </div>
        </header>

        <section className="hero">
          <div className="hero-badge">Empowering businesses to communicate smarter, faster, and better</div>
          <h1>The only Communication<br/>Toolkit you will ever need</h1>
          <p>From first message to final payment, automate every step with our modular communication suite</p>
          <a href="mailto:hello@wecare.digital" className="btn-p">Get Started</a>
        </section>

        <section className="features">
          <div className="f-grid">
            <div className="f-card main">
              <div className="f-icon">AI</div>
              <h3>AI Image Analyzer</h3>
              <p>Enhance support by precisely categorizing images for faster resolutions</p>
            </div>
            <div className="f-card">
              <div className="f-icon">Chat</div>
              <h3>Intelligent Conversations</h3>
              <p>Seamlessly integrate data sources to generate accurate responses and actions</p>
            </div>
          </div>
        </section>

        <section className="impact">
          <div className="impact-in">
            <div className="impact-txt">
              <span className="badge">Impact Driven Communication</span>
              <h2>Boosting operational efficiency and customer satisfaction for faster scaling</h2>
            </div>
            <div className="impact-stat">
              <div className="stat-num">{count.toLocaleString()}+</div>
              <div className="stat-label">Messages delivered last month</div>
            </div>
          </div>
        </section>

        <section className="cta">
          <h2>Ready to get started?</h2>
          <p>Transform how you communicate with customers</p>
          <a href="mailto:hello@wecare.digital" className="btn-p">Contact Sales</a>
        </section>

        <footer className="ftr">
          <div className="ftr-in">
            <div className="ftr-brand">
              <img src="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" alt="" />
              <span>WECARE.DIGITAL</span>
            </div>
            <span>2026 WECARE.DIGITAL</span>
          </div>
        </footer>

        <style jsx>{`
          .page{min-height:100vh;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;overflow-x:hidden}
          .hdr{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,.95);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.05)}
          .hdr-in{max-width:1200px;margin:0 auto;padding:16px 24px;display:flex;justify-content:space-between;align-items:center}
          .logo{display:flex;align-items:center;gap:12px;font-weight:700;font-size:18px}
          .logo-img{width:40px;height:40px;border-radius:12px}
          .hdr-btn{color:#555;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:10px;border:1px solid #e5e5e5;transition:all .2s}
          .hdr-btn:hover{background:#f5f5f5}
          .hero{padding:160px 24px 100px;text-align:center;max-width:900px;margin:0 auto}
          .hero-badge{display:inline-block;background:#f0fdf4;color:#16a34a;padding:8px 16px;border-radius:20px;font-size:14px;font-weight:500;margin-bottom:24px}
          .hero h1{font-size:56px;font-weight:800;line-height:1.1;color:#0f172a;margin:0 0 24px;letter-spacing:-2px}
          .hero p{font-size:20px;color:#64748b;line-height:1.6;margin:0 0 32px;max-width:600px;margin-left:auto;margin-right:auto}
          .btn-p{display:inline-flex;align-items:center;background:#f59e0b;color:#fff;padding:16px 32px;border-radius:12px;text-decoration:none;font-size:16px;font-weight:600;transition:all .3s;box-shadow:0 4px 20px rgba(245,158,11,.3)}
          .btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(245,158,11,.4)}
          .features{padding:80px 24px;background:#f8fafc}
          .f-grid{max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
          .f-card{background:#fff;border-radius:20px;padding:32px;border:1px solid #e2e8f0;transition:all .3s}
          .f-card:hover{box-shadow:0 20px 50px rgba(0,0,0,.08);transform:translateY(-4px)}
          .f-card.main{grid-column:span 2}
          .f-icon{width:48px;height:48px;background:#f0fdf4;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#16a34a;margin-bottom:16px}
          .f-card h3{font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px}
          .f-card p{font-size:15px;color:#64748b;margin:0;line-height:1.6}
          .impact{padding:80px 24px;background:#0f172a}
          .impact-in{max-width:1000px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:40px}
          .impact-txt{flex:1}
          .badge{display:inline-block;background:rgba(245,158,11,.15);color:#f59e0b;padding:6px 14px;border-radius:6px;font-size:12px;font-weight:600;margin-bottom:16px;letter-spacing:.5px}
          .impact h2{font-size:32px;font-weight:700;color:#fff;margin:0;line-height:1.3}
          .impact-stat{text-align:right}
          .stat-num{font-size:64px;font-weight:800;color:#f59e0b;line-height:1}
          .stat-label{font-size:16px;color:#94a3b8;margin-top:8px}
          .cta{padding:100px 24px;text-align:center;background:#fff}
          .cta h2{font-size:40px;font-weight:800;color:#0f172a;margin:0 0 16px;letter-spacing:-1px}
          .cta p{font-size:18px;color:#64748b;margin:0 0 32px}
          .ftr{border-top:1px solid #e2e8f0;padding:24px}
          .ftr-in{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
          .ftr-brand{display:flex;align-items:center;gap:10px;font-weight:600;font-size:14px}
          .ftr-brand img{width:24px;height:24px;border-radius:6px}
          .ftr-in>span{font-size:13px;color:#94a3b8}
          @media(max-width:768px){
            .hero h1{font-size:36px}
            .f-grid{grid-template-columns:1fr}
            .f-card.main{grid-column:span 1}
            .impact-in{flex-direction:column;text-align:center}
            .impact-stat{text-align:center}
            .stat-num{font-size:48px}
            .cta h2{font-size:30px}
            .ftr-in{flex-direction:column;gap:12px}
          }
        `}</style>
      </div>
    </>
  );
};

export default HomePage;