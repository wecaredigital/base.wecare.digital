/**
 * WhatsApp Payment / Order Details Page
 * 
 * Structure:
 * BODY: Your payment is overdue—please tap below to complete it 💳🤝
 * CART ITEMS: Item Name + Convenience Fee
 * BREAKDOWN: Subtotal, Discount, Shipping, Tax (with GSTIN)
 * TOTAL: auto-calculated
 * 
 * All fields mandatory (show even if 0)
 */

import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import * as api from '../../api/client';

// Payment phone number configuration
const PAYMENT_PHONE_NUMBER_ID = 'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54';
const PAYMENT_PHONE_DISPLAY = '+91 93309 94400';
const PAYMENT_PHONE_NAME = 'WECARE.DIGITAL';

// Convenience fee: 2% + 18% GST on that
const CONVENIENCE_FEE_PERCENT = 2.0;
const CONVENIENCE_FEE_GST_PERCENT = 18.0;

// GST rate options (0 = default/no GST)
const GST_RATES = [
  { value: 0, label: 'No GST (0%)' },
  { value: 3, label: 'GST 3%' },
  { value: 5, label: 'GST 5%' },
  { value: 12, label: 'GST 12%' },
  { value: 18, label: 'GST 18%' },
  { value: 28, label: 'GST 28%' },
];

// Default GSTIN
const DEFAULT_GSTIN = '19AADFW7431N1ZK';

interface PageProps {
  signOut?: () => void;
  user?: any;
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

  // Form state - all mandatory
  const [referenceId, setReferenceId] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemAmount, setItemAmount] = useState<number>(0);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(0);
  const [delivery, setDelivery] = useState<number>(0);
  const [gstRate, setGstRate] = useState<number>(0); // Default 0 (no GST)
  const [gstin, setGstin] = useState<string>(DEFAULT_GSTIN);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await api.listContacts();
      const indianContacts = data.filter(c => c.phone?.startsWith('+91'));
      setContacts(indianContacts);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load contacts' });
    } finally {
      setLoading(false);
    }
  };

  // Calculate convenience fee: 2% of item amount + 18% GST on that
  const calculateConvenienceFee = () => {
    const feeBase = itemAmount * (CONVENIENCE_FEE_PERCENT / 100);
    const feeGst = feeBase * (CONVENIENCE_FEE_GST_PERCENT / 100);
    return feeBase + feeGst;
  };

  // Calculate GST on item amount
  const calculateGst = () => {
    return itemAmount * (gstRate / 100);
  };

  // Subtotal = item + convenience fee
  const calculateSubtotal = () => {
    return itemAmount + calculateConvenienceFee();
  };

  // Total = subtotal - discount + delivery + tax
  const calculateTotal = () => {
    return calculateSubtotal() - discount + delivery + calculateGst();
  };

  const generateReferenceId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    setReferenceId(`WC_${timestamp}`);
  };

  const sendPaymentRequest = async () => {
    // Validation
    if (!selectedContact) {
      setMessage({ type: 'error', text: 'Please select a contact' });
      return;
    }
    if (!referenceId) {
      setMessage({ type: 'error', text: 'Please enter or generate a Reference ID' });
      return;
    }
    if (!itemName) {
      setMessage({ type: 'error', text: 'Please enter item name' });
      return;
    }
    if (itemAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter item amount' });
      return;
    }

    setSending(true);
    setMessage(null);

    try {
      const result = await api.sendWhatsAppPaymentMessage({
        contactId: selectedContact,
        phoneNumberId: PAYMENT_PHONE_NUMBER_ID,
        referenceId: referenceId,
        items: [{
          name: itemName,
          amount: Math.round(itemAmount * 100), // Convert to paise
          quantity: itemQuantity,
          productId: 'ITEM_MAIN',
        }],
        discount: Math.round(discount * 100),
        delivery: Math.round(delivery * 100),
        tax: Math.round(calculateGst() * 100),
        gstRate: gstRate,
        gstin: gstin,
        useInteractive: true,
      });

      if (result) {
        setMessage({ type: 'success', text: `Payment request sent! Message ID: ${result.messageId}` });
        // Reset form
        setReferenceId('');
        setItemName('');
        setItemAmount(0);
        setItemQuantity(1);
        setDiscount(0);
        setDelivery(0);
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

        {/* Sender Notice */}
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
            {/* Recipient */}
            <div className="form-section">
              <h3>📱 Recipient *</h3>
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
            </div>

            {/* Reference ID */}
            <div className="form-section">
              <h3>🔖 Reference ID *</h3>
              <div className="ref-row">
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="WC_ABC123"
                />
                <button type="button" onClick={generateReferenceId} className="gen-btn">
                  Generate
                </button>
              </div>
            </div>

            {/* Item Details */}
            <div className="form-section">
              <h3>📦 Item Details *</h3>
              <div className="item-grid">
                <div className="item-field">
                  <label>Item Name *</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Service Fee"
                  />
                </div>
                <div className="item-field">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    value={itemAmount || ''}
                    onChange={(e) => setItemAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="item-field">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Breakdown Fields - All Mandatory */}
            <div className="form-section">
              <h3>💰 Breakdown (All Mandatory)</h3>
              <div className="breakdown-grid">
                <div className="breakdown-field">
                  <label>Promo (₹)</label>
                  <input
                    type="number"
                    value={discount || ''}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="breakdown-field">
                  <label>Express (₹)</label>
                  <input
                    type="number"
                    value={delivery || ''}
                    onChange={(e) => setDelivery(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="breakdown-field">
                  <label>GST Rate</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(parseInt(e.target.value))}
                  >
                    {GST_RATES.map(rate => (
                      <option key={rate.value} value={rate.value}>{rate.label}</option>
                    ))}
                  </select>
                </div>
                <div className="breakdown-field full-width">
                  <label>GSTIN</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="19AADFW7431N1ZK"
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

              {/* Body Text */}
              <div className="preview-body">
                Your payment is overdue—please tap below to complete it 💳🤝
              </div>

              {/* Cart Items */}
              <div className="preview-section">
                <div className="section-title">Cart Items</div>
                <div className="cart-item">
                  <span className="item-name">{itemName || '(Item Name)'}</span>
                  <span className="item-details">₹{itemAmount.toFixed(2)} × {itemQuantity}</span>
                </div>
                <div className="cart-item conv-fee">
                  <span className="item-name">Convenience Fee</span>
                  <span className="item-details">₹{calculateConvenienceFee().toFixed(2)}</span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="preview-section">
                <div className="section-title">Breakdown</div>
                <div className="breakdown-row">
                  <span>Subtotal</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="breakdown-row">
                  <span>Promo</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
                <div className="breakdown-row">
                  <span>Express</span>
                  <span>₹{delivery.toFixed(2)}</span>
                </div>
                <div className="breakdown-row">
                  <span>Tax {gstRate > 0 && `(GST ${gstRate}%)`}</span>
                  <span>₹{calculateGst().toFixed(2)}</span>
                </div>
                <div className="breakdown-row gstin">
                  <span>GSTIN: {gstin}</span>
                </div>
              </div>

              {/* Total */}
              <div className="preview-total">
                <span>Total</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>

              <div className="preview-config">
                <small>To: {selectedContactInfo?.name || selectedContactInfo?.phone || '—'}</small>
                <small>Ref: {referenceId || '—'}</small>
              </div>
            </div>

            <button
              className="send-btn"
              onClick={sendPaymentRequest}
              disabled={sending || !selectedContact || !referenceId || !itemName || itemAmount <= 0}
            >
              {sending ? 'Sending...' : '💳 Send Payment Request'}
            </button>

            {/* Status Messages Info */}
            <div className="status-info">
              <div className="status-title">Status Messages</div>
              <div className="status-item success">✅ Payment of ₹{'{amount}'} received successfully! Thank you</div>
              <div className="status-item failed">❌ Payment failed. Please try again</div>
            </div>
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
        .sender-label { font-size: 11px; color: #166534; text-transform: uppercase; }
        .sender-number { font-size: 18px; font-weight: 600; color: #166534; }
        .sender-name { font-size: 13px; color: #15803d; }
        .sender-badge { display: flex; align-items: center; gap: 6px; background: #166534; color: #fff; padding: 6px 12px; border-radius: 20px; font-size: 12px; }
        .badge-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        
        .message-bar { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; }
        .message-bar.success { background: #dcfce7; color: #166534; }
        .message-bar.error { background: #fee2e2; color: #991b1b; }
        .message-bar button { background: none; border: none; font-size: 18px; cursor: pointer; }
        
        .pay-layout { display: grid; grid-template-columns: 1fr 380px; gap: 24px; }
        
        .order-form { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .form-section { margin-bottom: 24px; }
        .form-section h3 { font-size: 15px; margin: 0 0 12px 0; color: #333; }
        .form-section select, .form-section input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
        .form-section select:focus, .form-section input:focus { outline: none; border-color: #25D366; }
        
        .ref-row { display: flex; gap: 8px; }
        .ref-row input { flex: 1; }
        .gen-btn { padding: 10px 16px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; white-space: nowrap; }
        .gen-btn:hover { background: #e5e5e5; }
        
        .item-grid { display: grid; grid-template-columns: 2fr 1fr 80px; gap: 12px; }
        .item-field label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
        
        .breakdown-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .breakdown-field label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
        .breakdown-field.full-width { grid-column: span 2; }
        
        .order-preview { }
        .order-preview h3 { font-size: 15px; margin: 0 0 12px 0; }
        .preview-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 16px; }
        .preview-header { display: flex; align-items: center; gap: 8px; padding-bottom: 12px; border-bottom: 1px solid #eee; margin-bottom: 12px; }
        .wa-icon { font-size: 20px; }
        
        .preview-body { background: #dcfce7; padding: 12px; border-radius: 8px; font-size: 14px; margin-bottom: 16px; }
        
        .preview-section { margin-bottom: 16px; }
        .section-title { font-size: 11px; color: #666; text-transform: uppercase; margin-bottom: 8px; }
        
        .cart-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee; }
        .cart-item.conv-fee { color: #666; font-size: 13px; }
        .item-name { font-weight: 500; }
        .item-details { color: #666; }
        
        .breakdown-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        .breakdown-row.gstin { color: #666; font-size: 12px; justify-content: flex-start; }
        
        .preview-total { display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #333; font-size: 18px; font-weight: 600; }
        
        .preview-config { display: flex; flex-direction: column; gap: 4px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee; }
        .preview-config small { color: #666; font-size: 12px; }
        
        .send-btn { width: 100%; padding: 14px; background: #25D366; color: #fff; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; }
        .send-btn:hover:not(:disabled) { background: #128C7E; }
        .send-btn:disabled { background: #ccc; cursor: not-allowed; }
        
        .status-info { margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 8px; }
        .status-title { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 8px; }
        .status-item { font-size: 13px; padding: 4px 0; }
        .status-item.success { color: #166534; }
        .status-item.failed { color: #991b1b; }
        
        @media (max-width: 900px) {
          .pay-layout { grid-template-columns: 1fr; }
          .item-grid { grid-template-columns: 1fr; }
          .breakdown-grid { grid-template-columns: 1fr; }
          .breakdown-field.full-width { grid-column: span 1; }
        }
      `}</style>
    </Layout>
  );
};

export default PaymentPage;
