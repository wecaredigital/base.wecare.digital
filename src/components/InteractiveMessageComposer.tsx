/**
 * Interactive Message Composer
 * Compose and send WhatsApp interactive messages:
 * - List messages (up to 10 sections with rows)
 * - Reply buttons (up to 3 buttons)
 * - Location request
 */

import React, { useState } from 'react';
import * as api from '../api/client';

interface InteractiveMessageComposerProps {
  contactId: string;
  phoneNumberId: string;
  onClose: () => void;
  onSent: () => void;
  onError: (msg: string) => void;
}

interface ListRow {
  id: string;
  title: string;
  description: string;
}

interface ListSection {
  title: string;
  rows: ListRow[];
}

interface Button {
  id: string;
  title: string;
}

type InteractiveType = 'list' | 'button' | 'location_request';

const InteractiveMessageComposer: React.FC<InteractiveMessageComposerProps> = ({
  contactId,
  phoneNumberId,
  onClose,
  onSent,
  onError,
}) => {
  const [sending, setSending] = useState(false);
  const [messageType, setMessageType] = useState<InteractiveType>('button');
  
  // Common fields
  const [header, setHeader] = useState('');
  const [body, setBody] = useState('');
  const [footer, setFooter] = useState('');

  // Button message fields
  const [buttons, setButtons] = useState<Button[]>([
    { id: 'btn_1', title: '' },
  ]);

  // List message fields
  const [buttonText, setButtonText] = useState('View Options');
  const [sections, setSections] = useState<ListSection[]>([
    { title: 'Options', rows: [{ id: 'row_1', title: '', description: '' }] },
  ]);

  const addButton = () => {
    if (buttons.length >= 3) return;
    setButtons([...buttons, { id: `btn_${buttons.length + 1}`, title: '' }]);
  };

  const removeButton = (index: number) => {
    if (buttons.length <= 1) return;
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const updateButton = (index: number, title: string) => {
    const updated = [...buttons];
    updated[index] = { ...updated[index], title };
    setButtons(updated);
  };

  const addSection = () => {
    if (sections.length >= 10) return;
    setSections([...sections, { title: `Section ${sections.length + 1}`, rows: [{ id: `row_${Date.now()}`, title: '', description: '' }] }]);
  };

  const removeSection = (index: number) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((_, i) => i !== index));
  };

  const updateSectionTitle = (index: number, title: string) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], title };
    setSections(updated);
  };

  const addRow = (sectionIndex: number) => {
    const totalRows = sections.reduce((sum, s) => sum + s.rows.length, 0);
    if (totalRows >= 10) return;
    const updated = [...sections];
    updated[sectionIndex].rows.push({ id: `row_${Date.now()}`, title: '', description: '' });
    setSections(updated);
  };

  const removeRow = (sectionIndex: number, rowIndex: number) => {
    if (sections[sectionIndex].rows.length <= 1) return;
    const updated = [...sections];
    updated[sectionIndex].rows = updated[sectionIndex].rows.filter((_, i) => i !== rowIndex);
    setSections(updated);
  };

  const updateRow = (sectionIndex: number, rowIndex: number, field: 'title' | 'description', value: string) => {
    const updated = [...sections];
    updated[sectionIndex].rows[rowIndex] = { ...updated[sectionIndex].rows[rowIndex], [field]: value };
    setSections(updated);
  };

  const handleSend = async () => {
    if (!body.trim()) {
      onError('Body text is required');
      return;
    }

    if (messageType === 'button' && buttons.every(b => !b.title.trim())) {
      onError('At least one button is required');
      return;
    }

    if (messageType === 'list' && sections.every(s => s.rows.every(r => !r.title.trim()))) {
      onError('At least one list item is required');
      return;
    }

    setSending(true);
    try {
      const interactiveData: api.SendInteractiveRequest['interactiveData'] = {
        body,
        header: header || undefined,
        footer: footer || undefined,
      };

      if (messageType === 'button') {
        interactiveData.buttons = buttons.filter(b => b.title.trim()).map(b => ({
          id: b.id,
          title: b.title.trim().substring(0, 20),
        }));
      } else if (messageType === 'list') {
        interactiveData.buttonText = buttonText || 'View Options';
        interactiveData.sections = sections.map(s => ({
          title: s.title,
          rows: s.rows.filter(r => r.title.trim()).map(r => ({
            id: r.id,
            title: r.title.trim().substring(0, 24),
            description: r.description.trim().substring(0, 72),
          })),
        })).filter(s => s.rows.length > 0);
      }

      const result = await api.sendWhatsAppInteractive({
        contactId,
        phoneNumberId,
        interactiveType: messageType,
        interactiveData,
      });

      if (result) {
        onSent();
        onClose();
      } else {
        onError('Failed to send interactive message');
      }
    } catch (err: any) {
      onError(err.message || 'Send failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="interactive-composer">
      <div className="composer-header">
        <h3>📱 Interactive Message</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="composer-body">
        {/* Message Type Selector */}
        <div className="type-selector">
          <button
            className={`type-btn ${messageType === 'button' ? 'active' : ''}`}
            onClick={() => setMessageType('button')}
          >
            🔘 Buttons
          </button>
          <button
            className={`type-btn ${messageType === 'list' ? 'active' : ''}`}
            onClick={() => setMessageType('list')}
          >
            📋 List
          </button>
          <button
            className={`type-btn ${messageType === 'location_request' ? 'active' : ''}`}
            onClick={() => setMessageType('location_request')}
          >
            📍 Location
          </button>
        </div>

        {/* Common Fields */}
        <div className="form-group">
          <label>Header (optional)</label>
          <input
            type="text"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            placeholder="Header text..."
            maxLength={60}
          />
        </div>

        <div className="form-group">
          <label>Body *</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={messageType === 'location_request' ? 'Please share your location' : 'Message body...'}
            rows={3}
            maxLength={1024}
          />
        </div>

        <div className="form-group">
          <label>Footer (optional)</label>
          <input
            type="text"
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
            placeholder="Footer text..."
            maxLength={60}
          />
        </div>

        {/* Button Message Fields */}
        {messageType === 'button' && (
          <div className="buttons-section">
            <label>Reply Buttons ({buttons.length}/3)</label>
            {buttons.map((btn, idx) => (
              <div key={btn.id} className="button-row">
                <input
                  type="text"
                  value={btn.title}
                  onChange={(e) => updateButton(idx, e.target.value)}
                  placeholder={`Button ${idx + 1}`}
                  maxLength={20}
                />
                {buttons.length > 1 && (
                  <button className="remove-btn" onClick={() => removeButton(idx)}>×</button>
                )}
              </div>
            ))}
            {buttons.length < 3 && (
              <button className="add-btn" onClick={addButton}>+ Add Button</button>
            )}
          </div>
        )}

        {/* List Message Fields */}
        {messageType === 'list' && (
          <div className="list-section">
            <div className="form-group">
              <label>Menu Button Text</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="View Options"
                maxLength={20}
              />
            </div>

            <label>Sections & Items (max 10 items total)</label>
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="section-block">
                <div className="section-header">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                    placeholder="Section title"
                    maxLength={24}
                  />
                  {sections.length > 1 && (
                    <button className="remove-btn" onClick={() => removeSection(sIdx)}>×</button>
                  )}
                </div>
                {section.rows.map((row, rIdx) => (
                  <div key={row.id} className="row-block">
                    <input
                      type="text"
                      value={row.title}
                      onChange={(e) => updateRow(sIdx, rIdx, 'title', e.target.value)}
                      placeholder="Item title"
                      maxLength={24}
                    />
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) => updateRow(sIdx, rIdx, 'description', e.target.value)}
                      placeholder="Description (optional)"
                      maxLength={72}
                    />
                    {section.rows.length > 1 && (
                      <button className="remove-btn small" onClick={() => removeRow(sIdx, rIdx)}>×</button>
                    )}
                  </div>
                ))}
                <button className="add-btn small" onClick={() => addRow(sIdx)}>+ Add Item</button>
              </div>
            ))}
            {sections.length < 10 && (
              <button className="add-btn" onClick={addSection}>+ Add Section</button>
            )}
          </div>
        )}

        {/* Location Request Info */}
        {messageType === 'location_request' && (
          <div className="info-box">
            <span className="info-icon">ℹ️</span>
            <span>This will ask the user to share their current location.</span>
          </div>
        )}
      </div>

      <div className="composer-footer">
        <button className="cancel-btn" onClick={onClose}>Cancel</button>
        <button className="send-btn" onClick={handleSend} disabled={sending}>
          {sending ? 'Sending...' : 'Send Message'}
        </button>
      </div>

      <style jsx>{`
        .interactive-composer {
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 380px;
          max-height: 80vh;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }
        .composer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #eee;
        }
        .composer-header h3 {
          margin: 0;
          font-size: 16px;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }
        .composer-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .type-selector {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .type-btn {
          flex: 1;
          padding: 10px 8px;
          border: 1px solid #ddd;
          background: #f9f9f9;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }
        .type-btn:hover {
          background: #f0f0f0;
        }
        .type-btn.active {
          background: #25D366;
          color: white;
          border-color: #25D366;
        }
        .form-group {
          margin-bottom: 12px;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 4px;
          color: #333;
        }
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #25D366;
        }
        .buttons-section,
        .list-section {
          margin-top: 16px;
        }
        .buttons-section > label,
        .list-section > label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 8px;
          color: #333;
        }
        .button-row {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        .button-row input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }
        .remove-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }
        .remove-btn:hover {
          background: #fecaca;
        }
        .remove-btn.small {
          width: 24px;
          height: 24px;
          font-size: 14px;
        }
        .add-btn {
          width: 100%;
          padding: 8px;
          border: 1px dashed #ddd;
          background: none;
          border-radius: 6px;
          cursor: pointer;
          color: #666;
          font-size: 13px;
        }
        .add-btn:hover {
          border-color: #25D366;
          color: #25D366;
        }
        .add-btn.small {
          padding: 6px;
          font-size: 12px;
          margin-top: 4px;
        }
        .section-block {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
        }
        .section-header {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        .section-header input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
        }
        .row-block {
          display: flex;
          gap: 6px;
          margin-bottom: 6px;
        }
        .row-block input {
          flex: 1;
          padding: 6px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
        }
        .row-block input:first-child {
          flex: 0.8;
        }
        .info-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #e0f2fe;
          border-radius: 8px;
          font-size: 13px;
          color: #0369a1;
          margin-top: 16px;
        }
        .info-icon {
          font-size: 16px;
        }
        .composer-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid #eee;
        }
        .cancel-btn {
          padding: 8px 16px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        .cancel-btn:hover {
          background: #f5f5f5;
        }
        .send-btn {
          padding: 8px 20px;
          border: none;
          background: #25D366;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        .send-btn:hover:not(:disabled) {
          background: #128C7E;
        }
        .send-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default InteractiveMessageComposer;
