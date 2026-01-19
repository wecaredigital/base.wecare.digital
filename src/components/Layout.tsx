/**
 * Layout Component with Sidebar Navigation
 * 
 * Requirements:
 * - 12.1: Display "WECARE.DIGITAL" as application title
 * - 12.2: Sidebar navigation with menu items
 * - 12.3: Helvetica Light font
 * - 12.4: White background
 * - 12.5: Black buttons with 13px border radius
 * - 12.7: SPA navigation (no full page reload)
 */

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
  user?: any;
  onSignOut?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onSignOut }) => {
  const router = useRouter();
  
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/contacts', label: 'Contacts', icon: '👥' },
    { path: '/messaging', label: 'DM', icon: '💬' },
    { path: '/bulk-messaging', label: 'Bulk Messaging', icon: '📨' },
    { path: '/ai-automation', label: 'Agent', icon: '🤖' },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="app-title">WECARE.DIGITAL</h1>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-item ${router.pathname === item.path ? 'nav-item-active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          {user && (
            <div className="user-info">
              <span className="user-email">{user.signInDetails?.loginId}</span>
              <button className="btn-signout" onClick={onSignOut}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
