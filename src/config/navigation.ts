/**
 * Navigation Configuration - WECARE.DIGITAL
 * Centralized sidebar navigation with nested items
 * Updated: 2026-01-29
 */

export interface NavSubItem {
  path: string;
  label: string;
  icon?: string;
  children?: NavSubItem[];  // Support for nested sub-items
}

export interface NavItem {
  path: string;
  label: string;
  icon: string;
  children?: NavSubItem[];
}

export const navigationConfig: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    children: [
      { path: '/dashboard', label: 'Overview', icon: 'overview' },
      { path: '/dashboard/messages', label: 'Messages', icon: 'message' },
      { path: '/dashboard/payments', label: 'Payments', icon: 'payment' },
      { path: '/dashboard/data', label: 'Data', icon: 'data' },
      { path: '/dashboard/billing', label: 'Billing', icon: 'billing' },
      { path: '/dashboard/ai', label: 'AI Assistant', icon: 'ai' },
    ],
  },
  {
    path: '/pay',
    label: 'Pay',
    icon: 'payment',
    children: [
      { path: '/pay/wa', label: 'WhatsApp Pay', icon: 'whatsapp' },
      { path: '/pay/link', label: 'Pay Link', icon: 'link' },
      { path: '/pay/logs', label: 'Logs', icon: 'logs' },
    ],
  },
  {
    path: '/link',
    label: 'Link',
    icon: 'link',
    children: [
      { path: '/link/create', label: 'Create', icon: 'create' },
      { path: '/link/logs', label: 'Logs', icon: 'logs' },
    ],
  },
  {
    path: '/forms',
    label: 'Forms',
    icon: 'form',
    children: [
      { path: '/forms/create', label: 'Create', icon: 'create' },
      { path: '/forms/logs', label: 'Logs', icon: 'logs' },
    ],
  },
  {
    path: '/docs',
    label: 'Docs',
    icon: 'document',
    children: [
      { path: '/docs/create', label: 'Create', icon: 'create' },
      { path: '/docs/logs', label: 'Logs', icon: 'logs' },
    ],
  },
  {
    path: '/invoice',
    label: 'Invoice',
    icon: 'invoice',
    children: [
      { path: '/invoice/create', label: 'Create', icon: 'create' },
      { path: '/invoice/logs', label: 'Logs', icon: 'logs' },
    ],
  },
  {
    path: '/dm',
    label: 'Messages',
    icon: 'message',
    children: [
      { path: '/dm/whatsapp', label: 'WhatsApp Inbox', icon: 'whatsapp' },
      { path: '/dm/whatsapp/waba-dashboard', label: 'WA Dashboard', icon: 'dashboard' },
      { path: '/dm/whatsapp/templates', label: 'WA Templates', icon: 'template' },
      { path: '/dm/whatsapp/welcome', label: 'Welcome Message', icon: 'welcome' },
      { path: '/dm/whatsapp/ai-config', label: 'AI Config', icon: 'ai' },
      { 
        path: '/dm/sms', 
        label: 'SMS', 
        icon: 'sms',
        children: [
          { path: '/dm/sms/aws', label: 'AWS Pinpoint', icon: 'sms' },
          { path: '/dm/sms/airtel', label: 'IN SMS', icon: 'sms' },
        ]
      },
      { path: '/dm/ses', label: 'Email', icon: 'email' },
      { 
        path: '/dm/voice', 
        label: 'Voice', 
        icon: 'voice',
        children: [
          { path: '/dm/voice/aws', label: 'AWS API', icon: 'voice' },
          { path: '/dm/voice/airtel', label: 'IN Voice', icon: 'voice' },
        ]
      },
      { path: '/dm/rcs', label: 'RCS', icon: 'rcs' },
      { path: '/dm/logs', label: 'Logs', icon: 'logs' },
    ],
  },
  {
    path: '/contacts',
    label: 'Contacts',
    icon: 'contacts',
    children: [
      { path: '/contacts', label: 'All Contacts', icon: 'contacts' },
    ],
  },
  {
    path: '/bulk',
    label: 'Bulk',
    icon: 'bulk',
    children: [
      { path: '/bulk/whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
      { 
        path: '/bulk/sms', 
        label: 'SMS', 
        icon: 'sms',
        children: [
          { path: '/bulk/sms/aws', label: 'AWS Pinpoint', icon: 'sms' },
          { path: '/bulk/sms/airtel', label: 'IN SMS', icon: 'sms' },
        ]
      },
      { path: '/bulk/ses', label: 'Email', icon: 'email' },
      { 
        path: '/bulk/voice', 
        label: 'Voice', 
        icon: 'voice',
        children: [
          { path: '/bulk/voice/aws', label: 'AWS API', icon: 'voice' },
          { path: '/bulk/voice/airtel', label: 'IN Voice', icon: 'voice' },
        ]
      },
      { path: '/bulk/rcs', label: 'RCS', icon: 'rcs' },
      { path: '/bulk/logs', label: 'Logs', icon: 'logs' },
    ],
  },
];

/**
 * Get the parent path for a given route
 */
export function getParentPath(pathname: string): string | null {
  for (const item of navigationConfig) {
    if (item.children?.some(child => child.path === pathname)) {
      return item.path;
    }
    if (pathname.startsWith(item.path) && item.path !== '/') {
      return item.path;
    }
  }
  return null;
}

/**
 * Check if a nav item is active
 */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.path === '/') return pathname === '/';
  if (item.children) return pathname.startsWith(item.path);
  return pathname === item.path || pathname.startsWith(item.path + '/');
}

/**
 * Check if a sub-item is active (including nested children)
 */
export function isSubItemActive(subItem: NavSubItem, pathname: string): boolean {
  if (pathname === subItem.path) return true;
  if (subItem.children) {
    return subItem.children.some(child => pathname === child.path);
  }
  return pathname.startsWith(subItem.path + '/');
}
