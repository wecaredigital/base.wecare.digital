/**
 * Pay WA - WhatsApp Interactive Payment Page
 * 
 * Message Structure:
 * BODY TEXT: Your payment is overdue—please tap below to complete it 💳🤝
 * 
 * CART ITEMS:
 * - Name: (user input)
 * - Amount: ₹(user input)
 * - Quantity: (user input)
 * - Convenience Fee (Collected by Bank): ₹(auto-calculated by backend: 2% + 18% GST)
 * 
 * BREAKDOWN:
 * - Subtotal: ₹(auto from items)
 * - Promo: ₹(user input)
 * - Express: ₹(user input)
 * - Tax: ₹(GST auto-calculated based on rate selected) | "GSTIN: 19AADFW7431N1ZK"
 * 
 * TOTAL: ₹(auto-calculated by WhatsApp)
 * 
 * All fields mandatory (show even if 0)
 * 
 * Status Messages:
 * 1. Payment Request: Your payment is overdue—please tap below to complete it 💳🤝
 * 2. Payment Success (Captured): Payment of ₹{amount} received successfully! Thank you ✅
 * 3. Payment Failed: Payment failed. Please try again ❌
 */

import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import * as api from '../../../api/client';
import { formatReferenceNumber, generateReferenceId } from '../../../lib/formatters';

// Payment phone number configuration
const PAYMENT_PHONE_NUMBER_ID = 'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54';
const PAYMENT_PHONE_DISPLAY = '+91 93309 94400';
const PAYMENT_PHONE_NAME = 'WECARE.DIGITAL';

// Convenience fee: 2% + 18% GST on that (calculated by backend)
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

const PayWAPage: React.FC<PageProps> = ({ signOut, user }) => {
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
  const [shipping, setShipping] = useState<number>(0);
  const [gstRate, setGstRate] = useState<number>(0);
  const [gstin, setGstin] = useState<string>(DEFAULT_GSTIN);

  useEffect(() => {
    loadContacts();
    setReferenceId(generateReferenceId());
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

  const calculateConvenienceFee = () => {
    const feeBase = itemAmount * (CONVENIENCE_FEE_PERCENT / 100);
    const feeGst = feeBase * (CONVENIENCE_FEE_GST_PERCENT / 100);
    return feeBase + feeGst;
  };

  const calculateTax = () => itemAmount * (gstRate / 100);
  const calculateSubtotal = () => itemAmount + calculateConvenienceFee();
  const calculateTotal = () => calculateSubtotal() - discount + shipping + calculateTax();

  const handleGenerateReferenceId = () => {
    setReferenceId(generateReferenceId());
  };

  const sendPaymentRequest = async () => {
    if (!selectedContact) { setMessage({ type: 'error', text: 'Please select a contact' }); return; }
    if (!referenceId) { setMessage({ type: 'error', text: 'Please generate a Reference ID' }); return; }
    if (!itemName) { setMessage({ type: 'error', text: 'Please enter item name' }); return; }
    if (itemAmount <= 0) { setMessage({ type: 'error', text: 'Please enter item amount' }); return; }

    setSending(true);
    setMessage(null);

    try {
      const result = await api.sendWhatsAppPaymentMessage({
        contactId: selectedContact,
        phoneNumberId: PAYMENT_PHONE_NUMBER_ID,
        referenceId: referenceId,
        items: [{ name: itemName, amount: Math.round(itemAmount * 100), quantity: itemQuantity, productId: 'ITEM_MAIN' }],
        discount: Math.round(discount * 100),
        delivery: Math.round(shipping * 100),
        tax: Math.round(calculateTax() * 100),
        gstRate: gstRate,
        gstin: gstin,
        useInteractive: true,
      });

      if (result) {
        setMessage({ type: 'success', text: `Payment request sent! ID: ${result.messageId}` });
        setReferenceId(generateReferenceId());
        setItemName('');
        setItemAmount(0);
        setItemQuantity(1);
        setDiscount(0);
        setShipping(0);
      } else {
        const connStatus = api.getConnectionStatus();
        setMessage({ type: 'error', text: `Failed: ${connStatus.lastError || 'Unknown error'}` });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to send' });
    } finally {
      setSending(false);
    }
  };

  const selectedContactInfo = contacts.find(c => c.contactId === selectedContact);

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="pay-page">
        <div className="pay-header">
          <h1>💬 WhatsApp Pay</h1>
          <p>Send payment requests via WhatsApp UPI (India only)</p>
        </div>

        <div className="sender-notice">
          <div className="sender-icon">📱</div>
          <div className="sender-info">
            <div className="sender-label">Sending From</div>
            <div className="sender-number">{PAYMENT_PHONE_DISPLAY}</div>
            <div className="sender-name">{PAYMENT_PHONE_NAME}</div>
          </div>
          <div className="sender-badge"><span className="badge-dot"></span>Razorpay</div>
        </div>

        {message && (
          <div className={`message-bar ${message.type}`}>
            {message.text}
            <button onClick={() => setMessage(null)}>×</button>
          </div>
        )}

        <div className="pay-layout">
          <div className="order-form">
            <div className="form-section">
              <h3>📱 Recipient *</h3>
              <select value={selectedContact} onChange={(e) => setSelectedContact(e.target.value)} disabled={loading}>
                <option value="">Select contact (+91 only)</option>
                {contacts.map(c => <option key={c.contactId} value={c.contactId}>{c.name || c.phone} - {c.phone}</option>)}
              </select>
            </div>

            <div className="form-section">
              <h3>🔖 Reference ID</h3>
              <div className="ref-row">
                <input type="text" value={formatReferenceNumber(referenceId)} readOnly placeholder="WDSR+XXXXXXXX" />
                <button type="button" onClick={handleGenerateReferenceId} className="gen-btn">New</button>
              </div>
            </div>

            <div className="form-section">
              <h3>📦 Item Details *</h3>
              <div className="item-grid">
                <div className="item-field"><label>Item Name *</label><input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Service Fee" /></div>
                <div className="item-field"><label>Amount (₹) *</label><input type="number" value={itemAmount || ''} onChange={(e) => setItemAmount(parseFloat(e.target.value) || 0)} placeholder="0" min="0" step="0.01" /></div>
                <div className="item-field"><label>Qty *</label><input type="number" value={itemQuantity} onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)} min="1" /></div>
              </div>
            </div>

            <div className="form-section">
              <h3>💰 Breakdown</h3>
              <div className="breakdown-grid">
                <div className="breakdown-field"><label>Promo (₹)</label><input type="number" value={discount || ''} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} placeholder="0" min="0" step="0.01" /></div>
                <div className="breakdown-field"><label>Express (₹)</label><input type="number" value={shipping || ''} onChange={(e) => setShipping(parseFloat(e.target.value) || 0)} placeholder="0" min="0" step="0.01" /></div>
                <div className="breakdown-field"><label>Tax Rate</label><select value={gstRate} onChange={(e) => setGstRate(parseInt(e.target.value))}>{GST_RATES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
                <div className="breakdown-field full-width"><label>GSTIN</label><input type="text" value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="19AADFW7431N1ZK" /></div>
              </div>
            </div>
          </div>

          <div className="order-preview">
            <h3>📋 Preview</h3>
            <div className="preview-card">
              <div className="preview-header"><span className="wa-icon">💬</span><span>Interactive Payment</span></div>
              <div className="preview-body">Your payment is overdue—please tap below to complete it 💳🤝</div>
              <div className="preview-section">
                <div className="section-title">CART ITEMS</div>
                <div className="cart-item"><span>{itemName || '—'}</span><span>₹{itemAmount.toFixed(2)} × {itemQuantity}</span></div>
                <div className="cart-item conv-fee"><span>Conv. Fee (Bank)</span><span>₹{calculateConvenienceFee().toFixed(2)}</span></div>
              </div>
              <div className="preview-section">
                <div className="section-title">BREAKDOWN</div>
                <div className="breakdown-row"><span>Subtotal</span><span>₹{calculateSubtotal().toFixed(2)}</span></div>
                <div className="breakdown-row"><span>Promo</span><span>-₹{discount.toFixed(2)}</span></div>
                <div className="breakdown-row"><span>Express</span><span>₹{shipping.toFixed(2)}</span></div>
                <div className="breakdown-row"><span>Tax</span><span>₹{calculateTax().toFixed(2)}</span></div>
              </div>
              <div className="preview-total"><span>TOTAL</span><span>₹{calculateTotal().toFixed(2)}</span></div>
              <div className="preview-config"><small>To: {selectedContactInfo?.name || '—'}</small><small>Ref: {formatReferenceNumber(referenceId)}</small></div>
            </div>
            <button className="send-btn" onClick={sendPaymentRequest} disabled={sending || !selectedContact || !itemName || itemAmount <= 0}>
              {sending ? 'Sending...' : '💳 Send Payment'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .pay-page { padding: 20px; max-width: 1100px; margin: 0 auto; }
        .pay-header { margin-bottom: 20px; }
        .pay-header h1 { font-size: 22px; margin: 0 0 4px 0; }
        .pay-header p { color: #666; margin: 0; font-size: 14px; }
        .sender-notice { display: flex; align-items: center; gap: 16px; background: var(--notion-green-bg, #f0fdf4); padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; border: 1px solid var(--notion-border, #e9e9e7); }
        .sender-icon { font-size: 24px; }
        .sender-info { flex: 1; }
        .sender-label { font-size: 10px; color: #166534; text-transform: uppercase; }
        .sender-number { font-size: 16px; font-weight: 600; color: #166534; }
        .sender-name { font-size: 12px; color: #15803d; }
        .sender-badge { display: flex; align-items: center; gap: 4px; background: #166534; color: #fff; padding: 4px 10px; border-radius: 16px; font-size: 11px; }
        .badge-dot { width: 6px; height: 6px; background: #4ade80; border-radius: 50%; }
        .message-bar { padding: 10px 14px; border-radius: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; font-size: 13px; }
        .message-bar.success { background: #dcfce7; color: #166534; }
        .message-bar.error { background: #fee2e2; color: #991b1b; }
        .message-bar button { background: none; border: none; font-size: 16px; cursor: pointer; }
        .pay-layout { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }
        .order-form { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .form-section { margin-bottom: 20px; }
        .form-section h3 { font-size: 13px; margin: 0 0 10px 0; color: #333; }
        .form-section select, .form-section input { width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; box-sizing: border-box; }
        .form-section select:focus, .form-section input:focus { outline: none; border-color: #25D366; }
        .ref-row { display: flex; gap: 8px; }
        .ref-row input { flex: 1; background: #f9fafb; }
        .gen-btn { padding: 8px 12px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; font-size: 12px; }
        .gen-btn:hover { background: #e5e5e5; }
        .item-grid { display: grid; grid-template-columns: 2fr 1fr 60px; gap: 10px; }
        .item-field label { display: block; font-size: 11px; color: #666; margin-bottom: 4px; }
        .breakdown-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .breakdown-field label { display: block; font-size: 11px; color: #666; margin-bottom: 4px; }
        .breakdown-field.full-width { grid-column: span 2; }
        .order-preview h3 { font-size: 13px; margin: 0 0 10px 0; }
        .preview-card { background: #fff; border-radius: 10px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 12px; border: 2px solid #25D366; }
        .preview-header { display: flex; align-items: center; gap: 6px; padding-bottom: 10px; border-bottom: 1px solid #eee; margin-bottom: 10px; font-weight: 600; font-size: 13px; }
        .wa-icon { font-size: 16px; }
        .preview-body { background: #dcfce7; padding: 10px; border-radius: 6px; font-size: 12px; margin-bottom: 12px; }
        .preview-section { margin-bottom: 12px; padding: 10px; background: #f9fafb; border-radius: 6px; }
        .section-title { font-size: 10px; color: #666; text-transform: uppercase; font-weight: 600; margin-bottom: 8px; }
        .cart-item { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
        .cart-item.conv-fee { color: #666; font-style: italic; }
        .breakdown-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 12px; }
        .preview-total { display: flex; justify-content: space-between; padding: 10px; background: #25D366; color: #fff; border-radius: 6px; font-size: 16px; font-weight: 600; }
        .preview-config { display: flex; flex-direction: column; gap: 2px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee; }
        .preview-config small { color: #666; font-size: 11px; }
        .send-btn { width: 100%; padding: 12px; background: #25D366; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .send-btn:hover:not(:disabled) { background: #128C7E; }
        .send-btn:disabled { background: #ccc; cursor: not-allowed; }
        @media (max-width: 800px) { .pay-layout { grid-template-columns: 1fr; } .item-grid { grid-template-columns: 1fr; } .breakdown-grid { grid-template-columns: 1fr; } .breakdown-field.full-width { grid-column: span 1; } }
      `}</style>
    </Layout>
  );
};

export default PayWAPage;
