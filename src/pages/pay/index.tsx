/**
 * WhatsApp Payment / Order Details Page
 * Create and send payment requests via WhatsApp order_details template
 * 
 * IMPORTANT: Interactive payments MUST be sent from +91 93309 94400 (WECARE.DIGITAL)
 * This is the only number configured with Razorpay payment gateway
 */

import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import * as api from '../../api/client';

// Payment phone number configuration
// Interactive payments ONLY work from this number (has Razorpay configured)
const PAYMENT_PHONE_NUMBER_ID = 'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54';
const PAYMENT_PHONE_DISPLAY = '+91 93309 94400';
const PAYMENT_PHONE_NAME = 'WECARE.DIGITAL';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

interface OrderItem {
  name: string;
  amount: number;
  quantity: number;
  productId: string;
}

interface Contact {
  id: string;
  contactId: string;
  name: string;
  phone: string;
}

const PaymentPage: React.FC<PageProps> = ({ signOut, user }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Order form state
  const [referenceId, setReferenceId] = useState('');
  const [items, setItems] = useState<OrderItem[]>([{ name: '', amount: 0, quantity: 1, productId: '' }]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [useInteractive, setUseInteractive] = useState(true); // Default to interactive mode
  const [bodyText, setBodyText] = useState(''); // For template body variable

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await api.listContacts();
      // Filter contacts with Indian phone numbers (+91)
      const indianContacts = data.filter(c => c.phone?.startsWith('+91'));
      setContacts(indianContacts);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load contacts' });
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { name: '', amount: 0, quantity: 1, productId: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - discount + tax + shipping;
  };

  const generateReferenceId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    setReferenceId(`WD-${timestamp}`);
  };

  const sendPaymentRequest = async () => {
    if (!selectedContact) {
      setMessage({ type: 'error', text: 'Please select a contact' });
      return;
    }
    if (!referenceId) {
      setMessage({ type: 'error', text: 'Please enter or generate a Reference ID' });
      return;
    }
    if (items.some(item => !item.name || item.amount <= 0)) {
      setMessage({ type: 'error', text: 'Please fill in all item details' });
      return;
    }

    setSending(true);
    setMessage(null);

    try {
      const result = await api.sendWhatsAppPaymentMessage({
        contactId: selectedContact,
        // HARDCODED: Interactive payments MUST go from WECARE.DIGITAL number
        phoneNumberId: PAYMENT_PHONE_NUMBER_ID,
        templateName: '02_wd_order_payment',
        referenceId: referenceId,
        items: items.map((item, idx) => ({
          name: item.name,
          amount: Math.round(item.amount * 100), // Convert to paise
          quantity: item.quantity,
          productId: item.productId || `ITEM_${idx + 1}`,
        })),
        discount: Math.round(discount * 100),
        tax: Math.round(tax * 100),
        shipping: Math.round(shipping * 100),
        useInteractive: useInteractive,
        bodyText: bodyText || `Invoice ${referenceId}`,
      });

      if (result) {
        setMessage({ type: 'success', text: `Payment request sent from ${PAYMENT_PHONE_DISPLAY}! Message ID: ${result.messageId}` });
        // Reset form
        setReferenceId('');
        setItems([{ name: '', amount: 0, quantity: 1, productId: '' }]);
        setDiscount(0);
        setTax(0);
        setShipping(0);
      } else {
        setMessage({ type: 'error', text: 'Failed to send payment request' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to send payment request' });
    } finally {
      setSending(false);
    }
  };

  const selectedContactInfo = contacts.find(c => c.contactId === selectedContact);

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="pay-page">
        <div className="pay-header">
          <h1>💳 WhatsApp Payment Request</h1>
          <p>Send payment requests via WhatsApp UPI (India only)</p>
        </div>

        {/* Sender Number Notice */}
        <div className="sender-notice">
          <div className="sender-icon">📱</div>
          <div className="sender-info">
            <div className="sender-label">Sending From</div>
            <div className="sender-number">{PAYMENT_PHONE_DISPLAY}</div>
            <div className="sender-name">{PAYMENT_PHONE_NAME}</div>
          </div>
          <div className="sender-badge">
            <span className="badge-dot"></span>
            Razorpay Enabled
          </div>
        </div>

        {message && (
          <div className={`message-bar ${message.type}`}>
            {message.text}
            <button onClick={() => setMessage(null)}>×</button>
          </div>
        )}

        <div className="pay-layout">
          {/* Order Form */}
          <div className="order-form">
            <div className="form-section">
              <h3>📱 Recipient</h3>
              <select
                value={selectedContact}
                onChange={(e) => setSelectedContact(e.target.value)}
                disabled={loading}
              >
                <option value="">Select a contact (+91 only)</option>
                {contacts.map(contact => (
                  <option key={contact.contactId} value={contact.contactId}>
                    {contact.name || contact.phone} - {contact.phone}
                  </option>
                ))}
              </select>
              {contacts.length === 0 && !loading && (
                <p className="hint">No Indian contacts found. Add contacts with +91 numbers.</p>
              )}
            </div>

            <div className="form-section">
              <h3>⚙️ Message Type</h3>
              <div className="mode-toggle">
                <label className={`mode-option ${useInteractive ? 'active' : ''}`}>
                  <input
                    type="radio"
                    checked={useInteractive}
                    onChange={() => setUseInteractive(true)}
                  />
                  <span className="mode-icon">💬</span>
                  <span className="mode-label">Interactive</span>
                  <span className="mode-desc">Within 24h window (Razorpay PG)</span>
                </label>
                <label className={`mode-option ${!useInteractive ? 'active' : ''}`}>
                  <input
                    type="radio"
                    checked={!useInteractive}
                    onChange={() => setUseInteractive(false)}
                  />
                  <span className="mode-icon">📋</span>
                  <span className="mode-label">Template</span>
                  <span className="mode-desc">Outside 24h window</span>
                </label>
              </div>
              {!useInteractive && (
                <div className="body-text-input">
                  <label>Template Body Text (variable 1)</label>
                  <input
                    type="text"
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    placeholder={`Invoice ${referenceId || 'REF-001'}`}
                  />
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>🔖 Reference ID</h3>
              <div className="ref-row">
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="INV-001 or ORDER-123"
                />
                <button type="button" onClick={generateReferenceId} className="gen-btn">
                  Generate
                </button>
              </div>
            </div>

            <div className="form-section">
              <h3>📦 Items</h3>
              {items.map((item, index) => (
                <div key={index} className="item-row">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    placeholder="Item name"
                    className="item-name"
                  />
                  <input
                    type="number"
                    value={item.amount || ''}
                    onChange={(e) => updateItem(index, 'amount', parseFloat(e.target.value) || 0)}
                    placeholder="₹ Amount"
                    className="item-amount"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    placeholder="Qty"
                    className="item-qty"
                    min="1"
                  />
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="remove-btn">
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addItem} className="add-item-btn">
                + Add Item
              </button>
            </div>

            <div className="form-section">
              <h3>💰 Adjustments</h3>
              <div className="adjustments">
                <div className="adj-row">
                  <label>Discount (₹)</label>
                  <input
                    type="number"
                    value={discount || ''}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="adj-row">
                  <label>Tax (₹)</label>
                  <input
                    type="number"
                    value={tax || ''}
                    onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="adj-row">
                  <label>Shipping (₹)</label>
                  <input
                    type="number"
                    value={shipping || ''}
                    onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Preview */}
          <div className="order-preview">
            <h3>📋 Order Preview</h3>
            <div className="preview-card">
              <div className="preview-header">
                <span className="wa-icon">💬</span>
                <span>WhatsApp Payment</span>
              </div>
              
              <div className="preview-recipient">
                <strong>To:</strong> {selectedContactInfo?.name || selectedContactInfo?.phone || 'Select contact'}
              </div>

              <div className="preview-ref">
                <strong>Ref:</strong> {referenceId || 'Not set'}
              </div>

              <div className="preview-items">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.filter(i => i.name).map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{(item.amount * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="preview-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="total-row discount">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="total-row">
                    <span>Tax</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                )}
                {shipping > 0 && (
                  <div className="total-row">
                    <span>Shipping</span>
                    <span>₹{shipping.toFixed(2)}</span>
                  </div>
                )}
                <div className="total-row grand">
                  <span>Total</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="preview-config">
                <small><strong>From:</strong> {PAYMENT_PHONE_DISPLAY} ({PAYMENT_PHONE_NAME})</small>
                <small>Mode: {useInteractive ? '💬 Interactive (Razorpay PG)' : '📋 Template'}</small>
                <small>Payment Config: WECARE-DIGITAL</small>
                <small>Payment Type: UPI + Cards + NetBanking</small>
              </div>
            </div>

            <button
              className="send-btn"
              onClick={sendPaymentRequest}
              disabled={sending || !selectedContact || !referenceId || calculateTotal() <= 0}
            >
              {sending ? 'Sending...' : '💳 Send Payment Request'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .pay-page { padding: 20px; max-width: 1200px; margin: 0 auto; }
        .pay-header { margin-bottom: 24px; }
        .pay-header h1 { font-size: 24px; margin: 0 0 8px 0; }
        .pay-header p { color: #666; margin: 0; }
        
        .sender-notice { display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%); padding: 16px 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #bbf7d0; }
        .sender-icon { font-size: 28px; }
        .sender-info { flex: 1; }
        .sender-label { font-size: 11px; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; }
        .sender-number { font-size: 18px; font-weight: 600; color: #166534; }
        .sender-name { font-size: 13px; color: #15803d; }
        .sender-badge { display: flex; align-items: center; gap: 6px; background: #166534; color: #fff; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .badge-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        
        .message-bar { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
        .message-bar.success { background: #dcfce7; color: #166534; }
        .message-bar.error { background: #fee2e2; color: #991b1b; }
        .message-bar button { background: none; border: none; font-size: 18px; cursor: pointer; }
        
        .pay-layout { display: grid; grid-template-columns: 1fr 400px; gap: 24px; }
        
        .order-form { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .form-section { margin-bottom: 24px; }
        .form-section h3 { font-size: 16px; margin: 0 0 12px 0; color: #333; }
        .form-section select, .form-section input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
        .form-section select:focus, .form-section input:focus { outline: none; border-color: #25D366; }
        
        .ref-row { display: flex; gap: 8px; }
        .ref-row input { flex: 1; }
        .gen-btn { padding: 10px 16px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; white-space: nowrap; }
        .gen-btn:hover { background: #e5e5e5; }
        
        .item-row { display: flex; gap: 8px; margin-bottom: 8px; }
        .item-name { flex: 2; }
        .item-amount { flex: 1; }
        .item-qty { width: 60px; flex: none; }
        .remove-btn { width: 36px; background: #fee2e2; border: none; border-radius: 8px; cursor: pointer; color: #991b1b; }
        .add-item-btn { padding: 8px 16px; background: #f0f0f0; border: 1px dashed #ccc; border-radius: 8px; cursor: pointer; width: 100%; }
        .add-item-btn:hover { background: #e5e5e5; }
        
        .adjustments { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .adj-row label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
        .adj-row input { width: 100%; }
        
        .order-preview { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); height: fit-content; position: sticky; top: 20px; }
        .order-preview h3 { margin: 0 0 16px 0; }
        
        .preview-card { background: #f9f9f9; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
        .preview-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-weight: 500; }
        .wa-icon { font-size: 20px; }
        .preview-recipient, .preview-ref { font-size: 14px; margin-bottom: 8px; }
        
        .preview-items table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        .preview-items th, .preview-items td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
        .preview-items th { color: #666; font-weight: 500; }
        .preview-items td:last-child { text-align: right; }
        
        .preview-totals { border-top: 1px solid #ddd; padding-top: 12px; }
        .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
        .total-row.discount { color: #166534; }
        .total-row.grand { font-weight: 600; font-size: 16px; border-top: 1px solid #ddd; padding-top: 8px; margin-top: 8px; }
        
        .preview-config { margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee; }
        .preview-config small { display: block; color: #999; font-size: 11px; }
        
        .mode-toggle { display: flex; gap: 12px; margin-bottom: 12px; }
        .mode-option { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 12px; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .mode-option:hover { border-color: #25D366; }
        .mode-option.active { border-color: #25D366; background: #f0fdf4; }
        .mode-option input { display: none; }
        .mode-icon { font-size: 24px; margin-bottom: 4px; }
        .mode-label { font-weight: 500; font-size: 14px; }
        .mode-desc { font-size: 11px; color: #666; text-align: center; margin-top: 4px; }
        .body-text-input { margin-top: 12px; }
        .body-text-input label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
        
        .send-btn { width: 100%; padding: 14px; background: #25D366; color: #fff; border: none; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer; }
        .send-btn:hover:not(:disabled) { background: #1da851; }
        .send-btn:disabled { background: #ccc; cursor: not-allowed; }
        
        .hint { font-size: 12px; color: #999; margin-top: 8px; }
        
        @media (max-width: 900px) {
          .pay-layout { grid-template-columns: 1fr; }
          .order-preview { position: static; }
          .adjustments { grid-template-columns: 1fr; }
        }
      `}</style>
    </Layout>
  );
};

export default PaymentPage;
