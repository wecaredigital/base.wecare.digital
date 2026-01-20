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
  
  // Navigation items - Unicode symbols only (no emoji)
  const menuItems: MenuItem[] = [
    { path: '/', label: 'Dashboard', icon: '⌂' },
    { path: '/pay', label: 'Pay', icon: '¤' },
    { path: '/link', label: 'Link', icon: '⛓' },
    { path: '/forms', label: 'Forms', icon: '☐' },
    { path: '/docs', label: 'Docs', icon: '⎙' },
    { path: '/invoice', label: 'Invoice', icon: '⧉' },
    { path: '/dm', label: 'DM', icon: '✉', subItems: [
      { path: '/dm/whatsapp', label: 'WhatsApp' },
      { path: '/dm/sms', label: 'SMS' },
      { path: '/dm/email', label: 'Email' },
    ]},
    { path: '/contacts', label: 'Contacts', icon: '☎' },
    { path: '/bulk-messaging', label: 'Bulk', icon: '⋮⋮' },
    { path: '/agent', label: 'Agent', icon: '⌘' },
    { path: '/admin', label: 'Settings', icon: '⚙', adminOnly: true },
  ];

  // Auto-expand DM menu if on a DM page
  useEffect(() => {
    if (router.pathname.startsWith('/dm')) {
      setExpandedMenus(prev => prev.includes('/dm') ? prev : [...prev, '/dm']);
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
        
        {/* Floating Agent Chatbot (CAS) */}
        <FloatingAgent />
      </div>
    </>
  );
};

export default Layout;
