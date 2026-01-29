/**
 * Shared Formatters - WECARE.DIGITAL
 * Reusable formatting utilities
 */

/**
 * Format reference number to WDSR+<ID> format
 * Removes underscores and ensures consistent display
 * @param value - Raw reference number (may contain underscores)
 * @returns Formatted reference number in WDSR+<ID> format
 */
export function formatReferenceNumber(value: string): string {
  if (!value) return '';
  
  // Remove underscores and clean up
  let cleaned = value.replace(/_/g, '').trim();
  
  // If already has WDSR+ prefix, don't duplicate
  if (cleaned.toUpperCase().startsWith('WDSR+')) {
    return cleaned.toUpperCase();
  }
  
  // Add WDSR+ prefix
  return `WDSR+${cleaned.toUpperCase()}`;
}

/**
 * Generate a new reference ID in WDSR+<UUID> format
 * @returns New reference ID
 */
export function generateReferenceId(): string {
  const uuid = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
  return `WDSR+${uuid}`;
}

/**
 * Format currency for display
 * @param amount - Amount in base units (e.g., paise for INR)
 * @param currency - Currency code (default: INR)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const value = amount / 100;
  if (currency === 'INR') {
    return `₹${value.toFixed(2)}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format phone number for display
 * @param phone - Raw phone number
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Indian phone numbers
  if (phone.startsWith('+91')) {
    const digits = phone.replace(/\D/g, '').slice(2);
    if (digits.length === 10) {
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
  }
  
  return phone;
}

/**
 * Format date for display
 * @param date - Date string or Date object
 * @param format - Format type
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'time' | 'datetime' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    case 'long':
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    case 'time':
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    case 'datetime':
      return d.toLocaleString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    default:
      return d.toLocaleDateString();
  }
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
