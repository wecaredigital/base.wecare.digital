/**
 * Layout Component with Sidebar Navigation
 * WECARE.DIGITAL Admin Platform
 * 
 * Design Rules (10.1):
 * - No emoji icons - Unicode symbols only
 * - Helvetica Light / system font
 * - White background, black buttons, 13px rounded corners
 * - No environment banner
 * - WebView compatible (Android WebView + iOS WKWebView)
 */

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import FloatingAgent from './FloatingAgent';

interface SubItem {
  path: string;
  label: string;
}

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  subItems?: SubItem[];
  adminOnly?: boolean;
}

interface LayoutProps {
  children: ReactNode;
  user?: any;
  onSignOut?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onSignOut }) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  
  // Navigation items - WhatsApp themed icons
  const menuItems: MenuItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', subItems: [
      { path: '/dashboard', label: 'Overview' },
      { path: '/dashboard/messages', label: 'Messages' },
      { path: '/dashboard/payments', label: 'Payments' },
      { path: '/dashboard/data', label: 'Data' },
      { path: '/dashboard/billing', label: 'Billing' },
      { path: '/dashboard/ai', label: 'AI Assistant' },
    ]},
    { path: '/pay', label: 'Pay', icon: '💳', subItems: [
      { path: '/pay/wa', label: 'WhatsApp Pay' },
      { path: '/pay/link', label: 'Pay Link' },
      { path: '/pay/logs', label: 'Logs' },
    ]},
    { path: '/link', label: 'Link', icon: '🔗', subItems: [
      { path: '/link/create', label: 'Create' },
      { path: '/link/logs', label: 'Logs' },
    ]},
    { path: '/forms', label: 'Forms', icon: '📝', subItems: [
      { path: '/forms/create', label: 'Create' },
      { path: '/forms/logs', label: 'Logs' },
    ]},
    { path: '/docs', label: 'Docs', icon: '📄', subItems: [
      { path: '/docs/create', label: 'Create' },
      { path: '/docs/logs', label: 'Logs' },
    ]},
    { path: '/invoice', label: 'Invoice', icon: '🧾', subItems: [
      { path: '/invoice/create', label: 'Create' },
      { path: '/invoice/logs', label: 'Logs' },
    ]},
    { path: '/dm', label: 'Messages', icon: '💬', subItems: [
      { path: '/dm/whatsapp', label: 'WhatsApp Inbox' },
      { path: '/dm/whatsapp/waba-dashboard', label: 'WA Dashboard' },
      { path: '/dm/whatsapp/templates', label: 'WA Templates' },
      { path: '/dm/whatsapp/ai-config', label: 'AI Config' },
      { path: '/dm/sms', label: 'SMS' },
      { path: '/dm/ses', label: 'Email' },
      { path: '/dm/voice', label: 'Voice' },
      { path: '/dm/rcs', label: 'RCS' },
      { path: '/dm/logs', label: 'Logs' },
    ]},
    { path: '/contacts', label: 'Contacts', icon: '👥' },
    { path: '/bulk', label: 'Bulk', icon: '📤', subItems: [
      { path: '/bulk/whatsapp', label: 'WhatsApp' },
      { path: '/bulk/sms', label: 'SMS' },
      { path: '/bulk/ses', label: 'Email' },
      { path: '/bulk/voice', label: 'Voice' },
      { path: '/bulk/rcs', label: 'RCS' },
      { path: '/bulk/logs', label: 'Logs' },
    ]},
  ];

  // Auto-expand menus if on those pages
  useEffect(() => {
    if (router.pathname.startsWith('/dashboard')) {
      setExpandedMenus(prev => prev.includes('/dashboard') ? prev : [...prev, '/dashboard']);
    }
    if (router.pathname.startsWith('/pay')) {
      setExpandedMenus(prev => prev.includes('/pay') ? prev : [...prev, '/pay']);
    }
    if (router.pathname.startsWith('/link')) {
      setExpandedMenus(prev => prev.includes('/link') ? prev : [...prev, '/link']);
    }
    if (router.pathname.startsWith('/forms')) {
      setExpandedMenus(prev => prev.includes('/forms') ? prev : [...prev, '/forms']);
    }
    if (router.pathname.startsWith('/docs')) {
      setExpandedMenus(prev => prev.includes('/docs') ? prev : [...prev, '/docs']);
    }
    if (router.pathname.startsWith('/invoice')) {
      setExpandedMenus(prev => prev.includes('/invoice') ? prev : [...prev, '/invoice']);
    }
    if (router.pathname.startsWith('/dm')) {
      setExpandedMenus(prev => prev.includes('/dm') ? prev : [...prev, '/dm']);
    }
    if (router.pathname.startsWith('/bulk')) {
      setExpandedMenus(prev => prev.includes('/bulk') ? prev : [...prev, '/bulk']);
    }
  }, [router.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  const toggleSubmenu = (path: string) => {
    setExpandedMenus(prev => 
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const isActive = (item: MenuItem) => {
    if (item.path === '/') return router.pathname === '/';
    if (item.subItems) return router.pathname.startsWith(item.path);
    return router.pathname === item.path || router.pathname.startsWith(item.path + '/');
  };

  return (
    <>
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
              <div key={item.path} className="nav-group">
                {item.subItems ? (
                  <>
                    <button
                      className={`nav-item nav-item-expandable ${isActive(item) ? 'nav-item-active' : ''}`}
                      onClick={() => toggleSubmenu(item.path)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                      <span className={`nav-arrow ${expandedMenus.includes(item.path) ? 'expanded' : ''}`}>▸</span>
                    </button>
                    {expandedMenus.includes(item.path) && (
                      <div className="nav-subitems">
                        {item.subItems.map(sub => (
                          <Link
                            key={sub.path}
                            href={sub.path}
                            className={`nav-subitem ${router.pathname === sub.path ? 'nav-subitem-active' : ''}`}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path}
                    className={`nav-item ${isActive(item) ? 'nav-item-active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                )}
              </div>
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
        
        {/* Floating Agent Chatbot */}
        <FloatingAgent />
      </div>
    </>
  );
};

export default Layout;
