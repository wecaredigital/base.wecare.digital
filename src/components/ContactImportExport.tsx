/**
 * Contact Import/Export Component
 * CSV import and export functionality
 */

import React, { useState, useRef } from 'react';
import * as api from '../api/client';

interface ContactImportExportProps {
  contacts: api.Contact[];
  onImportComplete?: () => void;
}

const ContactImportExport: React.FC<ContactImportExportProps> = ({ contacts, onImportComplete }) => {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<api.ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<Partial<api.Contact>[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = api.parseContactsCSV(content);
      setPreviewData(parsed);
      setImportResult(null);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;
    
    setImporting(true);
    try {
      const result = await api.importContacts(previewData);
      setImportResult(result);
      if (result.created > 0 || result.updated > 0) {
        onImportComplete?.();
      }
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setImporting(false);
    }
  };

  const handleExport = () => {
    const csv = api.exportContactsToCSV(contacts);
    api.downloadFile(csv, `contacts_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const clearPreview = () => {
    setPreviewData([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="import-export-section">
      <div className="section-header">
        <h3>Import / Export Contacts</h3>
        <button className="export-btn" onClick={handleExport}>
          ⬇️ Export CSV ({contacts.length})
        </button>
      </div>

      <div 
        className={`import-zone ${dragOver ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />
        <div className="import-zone-icon">📁</div>
        <div className="import-zone-text">
          Drop CSV file here or click to browse
        </div>
        <div className="import-zone-hint">
          Required columns: name, phone. Optional: email, whatsapp_opt_in, sms_opt_in
        </div>
      </div>

      {previewData.length > 0 && (
        <div className="import-preview">
          <div className="preview-header">
            <h4>Preview ({previewData.length} contacts)</h4>
            <button className="clear-btn" onClick={clearPreview}>Clear</button>
          </div>
          
          <div className="preview-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 5).map((contact, i) => (
                  <tr key={i}>
                    <td>{contact.name || '-'}</td>
                    <td>{contact.phone}</td>
                    <td>{contact.email || '-'}</td>
                    <td>{contact.optInWhatsApp ? '✓' : '-'}</td>
                  </tr>
                ))}
                {previewData.length > 5 && (
                  <tr>
                    <td colSpan={4} className="more-rows">
                      ... and {previewData.length - 5} more
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button 
            className="import-btn"
            onClick={handleImport}
            disabled={importing}
          >
            {importing ? 'Importing...' : `Import ${previewData.length} Contacts`}
          </button>
        </div>
      )}

      {importResult && (
        <div className={`import-result ${importResult.failed > 0 ? 'has-errors' : 'success'}`}>
          <div className="import-stats">
            <div className="import-stat">
              <div className="import-stat-value">{importResult.created}</div>
              <div className="import-stat-label">Created</div>
            </div>
            <div className="import-stat">
              <div className="import-stat-value">{importResult.updated}</div>
              <div className="import-stat-label">Updated</div>
            </div>
            <div className="import-stat">
              <div className="import-stat-value">{importResult.failed}</div>
              <div className="import-stat-label">Failed</div>
            </div>
          </div>
          {importResult.errors.length > 0 && (
            <div className="import-errors">
              <strong>Errors:</strong>
              <ul>
                {importResult.errors.slice(0, 5).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .import-export-section {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e5e7eb;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .section-header h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .preview-header h4 {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
        }
        .clear-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          font-size: 13px;
        }
        .clear-btn:hover {
          color: #ef4444;
        }
        .preview-table {
          overflow-x: auto;
          margin-bottom: 16px;
        }
        .preview-table table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .preview-table th {
          text-align: left;
          padding: 8px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          color: #6b7280;
        }
        .preview-table td {
          padding: 8px;
          border-bottom: 1px solid #f3f4f6;
        }
        .more-rows {
          text-align: center;
          color: #9ca3af;
          font-style: italic;
        }
        .import-btn {
          width: 100%;
          padding: 12px;
          background: #25d366;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .import-btn:hover:not(:disabled) {
          background: #128c7e;
        }
        .import-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .import-result {
          margin-top: 16px;
          padding: 16px;
          border-radius: 8px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
        }
        .import-result.has-errors {
          background: #fef3c7;
          border-color: #fcd34d;
        }
        .import-errors {
          margin-top: 12px;
          font-size: 13px;
          color: #92400e;
        }
        .import-errors ul {
          margin: 8px 0 0 20px;
          padding: 0;
        }
        .import-errors li {
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
};

export default ContactImportExport;
