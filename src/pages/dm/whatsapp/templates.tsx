/**
 * WhatsApp Template Management
 * Create, edit, delete templates and browse Meta's template library
 * 
 * APIs Used:
 * - ListWhatsAppMessageTemplates
 * - GetWhatsAppMessageTemplate
 * - CreateWhatsAppMessageTemplate
 * - CreateWhatsAppMessageTemplateFromLibrary
 * - UpdateWhatsAppMessageTemplate
 * - DeleteWhatsAppMessageTemplate
 * - ListWhatsAppTemplateLibrary
 * - CreateWhatsAppMessageTemplateMedia
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Toast, { useToast } from '../../../components/Toast';
import * as api from '../../../api/client';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

const WABA_OPTIONS = [
  { id: 'waba-0aae9cf04cf24c66960f291c793359b4', name: 'WECARE.DIGITAL' },
  { id: 'waba-9bbe054d8404487397c38a9d197bc44a', name: 'Manish Agarwal' },
];

const CATEGORY_COLORS: Record<string, string> = {
  MARKETING: '#FF9800',
  UTILITY: '#2196F3',
  AUTHENTICATION: '#9C27B0',
};

const STATUS_COLORS: Record<string, string> = {
  APPROVED: '#4CAF50',
  PENDING: '#FFC107',
  REJECTED: '#F44336',
};

const TemplateManagement: React.FC<PageProps> = ({ signOut, user }) => {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<api.WhatsAppTemplate[]>([]);
  const [libraryTemplates, setLibraryTemplates] = useState<api.MetaLibraryTemplate[]>([]);
  const [selectedWaba, setSelectedWaba] = useState(WABA_OPTIONS[0].id);
  const [activeTab, setActiveTab] = useState<'my-templates' | 'library' | 'create'>('my-templates');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedTemplate, setSelectedTemplate] = useState<api.WhatsAppTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Create template form state
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    language: 'en_US',
    category: 'UTILITY' as 'UTILITY' | 'MARKETING' | 'AUTHENTICATION',
    headerType: 'none' as 'none' | 'text' | 'image' | 'video' | 'document',
    headerText: '',
    bodyText: '',
    footerText: '',
    buttons: [] as { type: string; text: string; url?: string; phone?: string }[],
  });

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listTemplates(selectedWaba);
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates:', err);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [selectedWaba]);

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listTemplateLibrary({ wabaId: selectedWaba });
      setLibraryTemplates(data);
    } catch (err) {
      console.error('Failed to load template library:', err);
      toast.error('Failed to load template library');
    } finally {
      setLoading(false);
    }
  }, [selectedWaba]);

  useEffect(() => {
    if (activeTab === 'my-templates') {
      loadTemplates();
    } else if (activeTab === 'library') {
      loadLibrary();
    }
  }, [activeTab, selectedWaba]);

  const handleDeleteTemplate = async (templateName: string) => {
    setDeleting(true);
    try {
      const success = await api.deleteTemplate(templateName, selectedWaba, true);
      if (success) {
        toast.success('Template deleted');
        setShowDeleteConfirm(null);
        loadTemplates();
      } else {
        toast.error('Failed to delete template');
      }
    } catch (err) {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.bodyText) {
      toast.error('Name and body text are required');
      return;
    }

    try {
      const components: any[] = [];
      
      // Header component
      if (newTemplate.headerType !== 'none') {
        components.push({
          type: 'HEADER',
          format: newTemplate.headerType.toUpperCase(),
          text: newTemplate.headerType === 'text' ? newTemplate.headerText : undefined,
        });
      }
      
      // Body component (required)
      components.push({
        type: 'BODY',
        text: newTemplate.bodyText,
      });
      
      // Footer component
      if (newTemplate.footerText) {
        components.push({
          type: 'FOOTER',
          text: newTemplate.footerText,
        });
      }
      
      // Buttons component
      if (newTemplate.buttons.length > 0) {
        components.push({
          type: 'BUTTONS',
          buttons: newTemplate.buttons,
        });
      }

      const result = await api.createTemplate({
        wabaId: selectedWaba,
        templateDefinition: {
          name: newTemplate.name.toLowerCase().replace(/\s+/g, '_'),
          language: newTemplate.language,
          category: newTemplate.category,
          components,
        },
      });

      if (result) {
        toast.success(`Template created (Status: ${result.templateStatus})`);
        setShowCreateModal(false);
        setNewTemplate({
          name: '',
          language: 'en_US',
          category: 'UTILITY',
          headerType: 'none',
          headerText: '',
          bodyText: '',
          footerText: '',
          buttons: [],
        });
        loadTemplates();
      } else {
        toast.error('Failed to create template');
      }
    } catch (err: any) {
      toast.error(err.message || 'Create failed');
    }
  };

  const handleCreateFromLibrary = async (libraryTemplate: api.MetaLibraryTemplate) => {
    try {
      const result = await api.createTemplateFromLibrary({
        wabaId: selectedWaba,
        metaLibraryTemplate: {
          libraryTemplateName: libraryTemplate.templateName,
          templateName: `${libraryTemplate.templateName}_custom`,
          templateCategory: libraryTemplate.templateCategory,
          templateLanguage: libraryTemplate.templateLanguage || 'en_US',
        },
      });

      if (result) {
        toast.success(`Template created from library (Status: ${result.templateStatus})`);
        setActiveTab('my-templates');
        loadTemplates();
      } else {
        toast.error('Failed to create template from library');
      }
    } catch (err: any) {
      toast.error(err.message || 'Create from library failed');
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLibrary = libraryTemplates.filter(t =>
    t.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.templateCategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addButton = () => {
    if (newTemplate.buttons.length >= 3) return;
    setNewTemplate({
      ...newTemplate,
      buttons: [...newTemplate.buttons, { type: 'URL', text: '', url: '' }],
    });
  };

  const removeButton = (index: number) => {
    setNewTemplate({
      ...newTemplate,
      buttons: newTemplate.buttons.filter((_, i) => i !== index),
    });
  };

  const updateButton = (index: number, field: string, value: string) => {
    const updated = [...newTemplate.buttons];
    updated[index] = { ...updated[index], [field]: value };
    setNewTemplate({ ...newTemplate, buttons: updated });
  };

  return (
    <Layout user={user} onSignOut={signOut}>
      <Toast toasts={toast.toasts} onRemove={toast.removeToast} />
      <div className="page template-management">
        <div className="page-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => router.push('/dm/whatsapp')}>
              ← Back
            </button>
            <h1>📝 Template Management</h1>
          </div>
          <div className="header-actions">
            <select
              className="waba-select"
              value={selectedWaba}
              onChange={(e) => setSelectedWaba(e.target.value)}
            >
              {WABA_OPTIONS.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              + Create Template
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'my-templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-templates')}
          >
            📋 My Templates
          </button>
          <button
            className={`tab ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            📚 Meta Library
          </button>
        </div>

        {/* Search */}
        <div className="search-section">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* My Templates Tab */}
        {activeTab === 'my-templates' && (
          <div className="templates-grid">
            {loading ? (
              <div className="loading-state">Loading templates...</div>
            ) : filteredTemplates.length === 0 ? (
              <div className="empty-state">No templates found</div>
            ) : (
              filteredTemplates.map((template) => (
                <div key={template.name} className="template-card">
                  <div className="template-header">
                    <span className="template-name">{template.name}</span>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: STATUS_COLORS[template.status] || '#6c757d' }}
                    >
                      {template.status}
                    </span>
                  </div>
                  <div className="template-meta">
                    <span
                      className="category-badge"
                      style={{ backgroundColor: CATEGORY_COLORS[template.category] || '#6c757d' }}
                    >
                      {template.category}
                    </span>
                    <span className="language">{template.language}</span>
                  </div>
                  <div className="template-body">
                    {template.components?.find(c => c.type === 'BODY')?.text || 'No body text'}
                  </div>
                  <div className="template-actions">
                    <button
                      className="btn-view"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      View
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => setShowDeleteConfirm(template.name)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div className="templates-grid">
            {loading ? (
              <div className="loading-state">Loading library...</div>
            ) : filteredLibrary.length === 0 ? (
              <div className="empty-state">No library templates found</div>
            ) : (
              filteredLibrary.map((template, idx) => (
                <div key={idx} className="template-card library">
                  <div className="template-header">
                    <span className="template-name">{template.templateName}</span>
                  </div>
                  <div className="template-meta">
                    <span
                      className="category-badge"
                      style={{ backgroundColor: CATEGORY_COLORS[template.templateCategory] || '#6c757d' }}
                    >
                      {template.templateCategory}
                    </span>
                    <span className="language">{template.templateLanguage || 'en_US'}</span>
                  </div>
                  <div className="template-body">
                    {template.templateBody || 'Preview not available'}
                  </div>
                  <div className="template-actions">
                    <button
                      className="btn-primary"
                      onClick={() => handleCreateFromLibrary(template)}
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Template Detail Modal */}
        {selectedTemplate && (
          <div className="modal-overlay" onClick={() => setSelectedTemplate(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedTemplate.name}</h2>
                <button className="close-btn" onClick={() => setSelectedTemplate(null)}>×</button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: STATUS_COLORS[selectedTemplate.status] }}
                  >
                    {selectedTemplate.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Category:</span>
                  <span>{selectedTemplate.category}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Language:</span>
                  <span>{selectedTemplate.language}</span>
                </div>
                <h3>Components</h3>
                {selectedTemplate.components?.map((comp, idx) => (
                  <div key={idx} className="component-preview">
                    <strong>{comp.type}</strong>
                    {comp.text && <p>{comp.text}</p>}
                    {comp.format && <span className="format-badge">{comp.format}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Template Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Template</h2>
                <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Template Name</label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="my_template_name"
                  />
                  <small>Use lowercase letters, numbers, and underscores only</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={newTemplate.category}
                      onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value as any })}
                    >
                      <option value="UTILITY">Utility</option>
                      <option value="MARKETING">Marketing</option>
                      <option value="AUTHENTICATION">Authentication</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Language</label>
                    <select
                      value={newTemplate.language}
                      onChange={(e) => setNewTemplate({ ...newTemplate, language: e.target.value })}
                    >
                      <option value="en_US">English (US)</option>
                      <option value="en_GB">English (UK)</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Header Type</label>
                  <select
                    value={newTemplate.headerType}
                    onChange={(e) => setNewTemplate({ ...newTemplate, headerType: e.target.value as any })}
                  >
                    <option value="none">No Header</option>
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                  </select>
                </div>

                {newTemplate.headerType === 'text' && (
                  <div className="form-group">
                    <label>Header Text</label>
                    <input
                      type="text"
                      value={newTemplate.headerText}
                      onChange={(e) => setNewTemplate({ ...newTemplate, headerText: e.target.value })}
                      placeholder="Header text..."
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Body Text *</label>
                  <textarea
                    value={newTemplate.bodyText}
                    onChange={(e) => setNewTemplate({ ...newTemplate, bodyText: e.target.value })}
                    placeholder="Hello {{1}}, your order {{2}} is ready!"
                    rows={4}
                  />
                  <small>Use {'{{1}}'}, {'{{2}}'}, etc. for variables</small>
                </div>

                <div className="form-group">
                  <label>Footer Text (optional)</label>
                  <input
                    type="text"
                    value={newTemplate.footerText}
                    onChange={(e) => setNewTemplate({ ...newTemplate, footerText: e.target.value })}
                    placeholder="Reply STOP to unsubscribe"
                  />
                </div>

                <div className="form-group">
                  <label>Buttons ({newTemplate.buttons.length}/3)</label>
                  {newTemplate.buttons.map((btn, idx) => (
                    <div key={idx} className="button-row">
                      <select
                        value={btn.type}
                        onChange={(e) => updateButton(idx, 'type', e.target.value)}
                      >
                        <option value="URL">URL</option>
                        <option value="PHONE_NUMBER">Phone</option>
                        <option value="QUICK_REPLY">Quick Reply</option>
                      </select>
                      <input
                        type="text"
                        value={btn.text}
                        onChange={(e) => updateButton(idx, 'text', e.target.value)}
                        placeholder="Button text"
                      />
                      {btn.type === 'URL' && (
                        <input
                          type="text"
                          value={btn.url || ''}
                          onChange={(e) => updateButton(idx, 'url', e.target.value)}
                          placeholder="https://..."
                        />
                      )}
                      {btn.type === 'PHONE_NUMBER' && (
                        <input
                          type="text"
                          value={btn.phone || ''}
                          onChange={(e) => updateButton(idx, 'phone', e.target.value)}
                          placeholder="+1234567890"
                        />
                      )}
                      <button className="btn-remove" onClick={() => removeButton(idx)}>×</button>
                    </div>
                  ))}
                  {newTemplate.buttons.length < 3 && (
                    <button className="btn-add" onClick={addButton}>+ Add Button</button>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleCreateTemplate}>
                  Create Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
            <div className="modal small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Delete Template</h2>
                <button className="close-btn" onClick={() => setShowDeleteConfirm(null)}>×</button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete <strong>{showDeleteConfirm}</strong>?</p>
                <p className="warning">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>
                  Cancel
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDeleteTemplate(showDeleteConfirm)}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .template-management {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .back-btn {
          background: none;
          border: 1px solid #ddd;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
        }

        .back-btn:hover {
          background: #f5f5f5;
        }

        h1 {
          margin: 0;
          font-size: 24px;
        }

        .waba-select {
          padding: 10px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          min-width: 200px;
        }

        .btn-primary {
          background: #25D366;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-primary:hover {
          background: #128C7E;
        }

        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
          padding-bottom: 12px;
        }

        .tab {
          background: none;
          border: none;
          padding: 10px 20px;
          cursor: pointer;
          border-radius: 8px;
          font-size: 14px;
        }

        .tab:hover {
          background: #f5f5f5;
        }

        .tab.active {
          background: #25D366;
          color: white;
        }

        .search-section {
          margin-bottom: 20px;
        }

        .search-input {
          width: 100%;
          max-width: 400px;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }

        .search-input:focus {
          outline: none;
          border-color: #25D366;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        .template-card {
          background: white;
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 16px;
          transition: box-shadow 0.2s;
        }

        .template-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .template-card.library {
          border-left: 4px solid #2196F3;
        }

        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .template-name {
          font-weight: 600;
          font-size: 16px;
        }

        .status-badge, .category-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          color: white;
          font-weight: 500;
        }

        .template-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .language {
          font-size: 12px;
          color: #666;
        }

        .template-body {
          font-size: 14px;
          color: #555;
          line-height: 1.5;
          margin-bottom: 16px;
          max-height: 60px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .template-actions {
          display: flex;
          gap: 8px;
        }

        .btn-view, .btn-delete {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
        }

        .btn-view {
          background: #f5f5f5;
          border: 1px solid #ddd;
          color: #333;
        }

        .btn-view:hover {
          background: #eee;
        }

        .btn-delete {
          background: none;
          border: 1px solid #DC3545;
          color: #DC3545;
        }

        .btn-delete:hover {
          background: #DC3545;
          color: white;
        }

        .loading-state, .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal.large {
          max-width: 700px;
        }

        .modal.small {
          max-width: 400px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 18px;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1px solid #eee;
        }

        .btn-secondary {
          background: #f5f5f5;
          border: 1px solid #ddd;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
        }

        .btn-secondary:hover {
          background: #eee;
        }

        .btn-danger {
          background: #DC3545;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
        }

        .btn-danger:hover:not(:disabled) {
          background: #c82333;
        }

        .btn-danger:disabled {
          opacity: 0.6;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .detail-row .label {
          font-weight: 500;
          min-width: 80px;
        }

        .component-preview {
          background: #f9f9f9;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .component-preview strong {
          display: block;
          margin-bottom: 4px;
          font-size: 12px;
          color: #666;
        }

        .component-preview p {
          margin: 0;
          font-size: 14px;
        }

        .format-badge {
          display: inline-block;
          padding: 2px 8px;
          background: #eee;
          border-radius: 4px;
          font-size: 11px;
        }

        /* Form Styles */
        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #25D366;
        }

        .form-group small {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #666;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .button-row {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .button-row select {
          width: 120px;
        }

        .button-row input {
          flex: 1;
        }

        .btn-remove {
          background: #DC3545;
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 18px;
        }

        .btn-add {
          background: none;
          border: 1px dashed #ddd;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          color: #666;
          width: 100%;
        }

        .btn-add:hover {
          border-color: #25D366;
          color: #25D366;
        }

        .warning {
          color: #DC3545;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
            flex-direction: column;
          }

          .waba-select {
            width: 100%;
          }

          .templates-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .button-row {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </Layout>
  );
};

export default TemplateManagement;
