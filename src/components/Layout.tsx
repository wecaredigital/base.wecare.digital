/**
 * Layout Component with Sidebar Navigation
 * WECARE.DIGITAL Admin Platform
 * 
 * Requirements:
 * - 20.1: Display "WECARE.DIGITAL" as application title
 * - 20.3: Navigation order per spec
 * - 20.5: SEND_MODE banner (DRY_RUN vs LIVE)
 * - WebView compatible (Android WebView + iOS WKWebView)
 */

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
  user?: any;
  onSignOut?: () => void;
}

// Get SEND_MODE from environment or default to DRY_RUN
const SEND_MODE = process.env.NEXT_PUBLIC_SEND_MODE || 'DRY_RUN';

const Layout: React.FC<LayoutProps> = ({ children, user, onSignOut }) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Navigation items per Requirement 20.3 - Updated order
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/pay', label: 'Pay', icon: '💳' },
    { path: '/link', label: 'Link', icon: '🔗' },
    { path: '/forms', label: 'Forms', icon: '📝' },
    { path: '/docs', label: 'Docs', icon: '📄' },
    { path: '/invoice', label: 'Invoice', icon: '🧾' },
    { path: '/messaging', label: 'DM', icon: '💬', subItems: [
      { path: '/dm/whatsapp', label: 'WhatsApp' },
      { path: '/dm/sms', label: 'SMS' },
      { path: '/dm/email', label: 'Email (SES)' },
    ]},
    { path: '/contacts', label: 'Contacts', icon: '👥' },
    { path: '/bulk-messaging', label: 'Bulk Messaging', icon: '📨' },
    { path: '/agent', label: 'Agent', icon: '🤖' },
    { path: '/admin', label: 'Admin Tools', icon: '⚙️', adminOnly: true },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  return (
    <>
      {/* Requirement 20.5: SEND_MODE Banner */}
      <div className={`send-mode-banner ${SEND_MODE === 'LIVE' ? 'live' : 'dry-run'}`}>
        {SEND_MODE === 'LIVE' ? '🟢 LIVE MODE - Messages will be sent' : '🟡 DRY_RUN MODE - Messages simulated only'}
      </div>
      
      <div className="layout">
        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
        
        {/* Sidebar */}
        <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h1 className="app-title">WECARE.DIGITAL</h1>
          </div>
          
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-item ${router.pathname === item.path || (item.path !== '/' && router.pathname.startsWith(item.path.split('?')[0])) ? 'nav-item-active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="sidebar-footer">
            {user && (
              <div className="user-info">
                <span className="user-role">{user.role || 'Operator'}</span>
                <span className="user-email">{user.signInDetails?.loginId || user.email}</span>
                <button className="btn-signout" onClick={onSignOut}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </aside>
        
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="mobile-overlay" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
