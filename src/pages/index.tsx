/**
 * Home Page - WECARE.DIGITAL Landing
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
    { icon: '', title: 'Rich Media', desc: 'Images, videos & buttons' },
    { icon: '', title: 'Templates', desc: 'Pre-approved messages' },
    { icon: '', title: 'Catalogs', desc: 'Products in chat' },
    { icon: '', title: 'Payments', desc: 'Collect in chat' },
    { icon: '', title: 'Chatbots', desc: '24/7 AI support' },
  ];

  const useCases = [
    { title: 'Promotional', desc: 'Drive sales with targeted campaigns.', icon: '' },
    { title: 'Transactional', desc: 'Order updates & notifications.', icon: '' },
    { title: 'Appointments', desc: 'Booking confirmations.', icon: '' },
    { title: 'OTPs', desc: 'Secure verification.', icon: '' },
    { title: 'Orders', desc: 'Cart to delivery.', icon: '' },
    { title: 'Surveys', desc: 'Feedback in chat.', icon: '' },
  ];

  const codeExamples = [
    { lang: 'Python', code: "import requests\n\nrequests.post(\n  \"api.wecare.digital/v1/send\",\n  json={\"to\": \"+91xxx\"}\n)" },
    { lang: 'JS', code: "fetch(\"api.wecare.digital/v1/send\", {\n  method: \"POST\",\n  body: JSON.stringify({to: \"+91xxx\"})\n});" },
    { lang: 'cURL', code: "curl -X POST \\\n  api.wecare.digital/v1/send \\\n  -d '{\"to\": \"+91xxx\"}'" },
  ];

  return (
    <>
      <Head>
        <title>Base CRM by WECARE.DIGITAL</title>
        <meta name="description" content="Reach customers on WhatsApp" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#25d366" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </Head>
      <div className="page">
        <header className="hdr">
          <div className="hdr-in">
            <img src="https://auth.wecare.digital/stream/media/m/wecare-digital.ico" alt="" className="logo-img" />
            <div className="logo-text">
              <span className="logo-main">Base CRM</span>
              <span className="logo-sub">WECARE.DIGITAL</span>
            </div>
          </div>
        </header>

        <section className={`hero anim ${show('hero') ? 'show' : ''}`} id="hero">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Reach customers wherever they are</h1>
              <p>Engage on every channel - from our platform or your stack.</p>
              <div className="hero-stats">
                <div className="stat"><strong>B+</strong><span>Users</span></div>
                <div className="stat"><strong>Fast</strong><span>Setup</span></div>
                <div className="stat"><strong>Secure</strong><span>Channel</span></div>
              </div>
            </div>
            <div className="hero-phone">
              <div className="phone">
                <div className="phone-top">
                  <div className="avatar">W</div>
                  <div><strong>WECARE.DIGITAL</strong><small>online</small></div>
                </div>
                <div className="chat">
                  <div className="bubble out">Order #WD87A shipped </div>
                  <div className="bubble in">When arrives?</div>
                  <div className="bubble out">Tomorrow 6 PM</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`features anim ${show('features') ? 'show' : ''}`} id="features">
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="fcard">
                <span className="ficon">{f.icon}</span>
                <strong>{f.title}</strong>
                <small>{f.desc}</small>
              </div>
            ))}
          </div>
        </section>

        <section className={`touchpoint anim ${show('touchpoint') ? 'show' : ''}`} id="touchpoint">
          <h2>WhatsApp for every touchpoint</h2>
          <div className="pills">
            {useCases.map((u, i) => (
              <button key={i} className={`pill ${activeUseCase === i ? 'on' : ''}`} onClick={() => setActiveUseCase(i)}>{u.title}</button>
            ))}
          </div>
          <div className="usecase-box">
            <span className="usecase-icon">{useCases[activeUseCase].icon}</span>
            <strong>{useCases[activeUseCase].title}</strong>
            <p>{useCases[activeUseCase].desc}</p>
          </div>
        </section>

        <section className={`api anim ${show('api') ? 'show' : ''}`} id="api">
          <div className="api-content">
            <div className="api-text">
              <h2>Built for AI era</h2>
              <p>All-in-one platform powered by AI that understands your business.</p>
            </div>
            <div className="api-code">
              <div className="tabs">
                {codeExamples.map((c, i) => (
                  <button key={i} className={`tab ${activeCode === i ? 'on' : ''}`} onClick={() => setActiveCode(i)}>{c.lang}</button>
                ))}
              </div>
              <pre>{codeExamples[activeCode].code}</pre>
            </div>
          </div>
        </section>

        <footer className="ftr">
          <a href="https://www.wecare.digital/contact">Contact</a>
          <span>Tap. Track. Done.</span>
        </footer>
