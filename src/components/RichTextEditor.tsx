/**
 * Rich Text Editor Component
 * WhatsApp-style editor with templates, variables, and AI suggestions
 * Fetches real templates from WhatsApp API
 */

import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/RichTextEditor.module.css';
import * as api from '../api/client';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  showAISuggestions?: boolean;
  channel?: 'whatsapp' | 'sms' | 'email' | 'rcs' | 'voice';
  onSend?: () => void;
  contactContext?: string;
  onTemplateSelect?: (template: api.WhatsAppTemplate) => void;
}

// Variable placeholders for templates
const VARIABLES = [
  { key: '{{1}}', label: 'Variable 1', icon: '①' },
  { key: '{{2}}', label: 'Variable 2', icon: '②' },
  { key: '{{3}}', label: 'Variable 3', icon: '③' },
  { key: '{{4}}', label: 'Variable 4', icon: '④' },
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Type a message...',
  disabled = false,
  maxLength,
  showCharCount = false,
  showAISuggestions = true,
  channel = 'whatsapp',
  onSend,
  contactContext,
  onTemplateSelect,
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [templates, setTemplates] = useState<api.WhatsAppTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load templates from API
  useEffect(() => {
    if (channel === 'whatsapp') {
      loadTemplates();
    }
  }, [channel]);

  const loadTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const data = await api.listWhatsAppTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setTemplatesLoading(false);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowTemplates(false);
        setShowVariables(false);
        setShowFormatting(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [value]);

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + text + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
      }, 0);
    } else {
      onChange(value + text);
    }
  };

  const wrapSelection = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.substring(start, end);
      const newValue = value.substring(0, start) + prefix + selected + suffix + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = start + prefix.length;
        textarea.selectionEnd = end + prefix.length;
        textarea.focus();
      }, 0);
    }
    setShowFormatting(false);
  };

  const applyTemplate = (template: api.WhatsAppTemplate) => {
    // Extract body text from template components
    const bodyComponent = template.components.find(c => c.type === 'BODY');
    const bodyText = bodyComponent?.text || template.name;
    onChange(bodyText);
    setShowTemplates(false);
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
    textareaRef.current?.focus();
  };

  const insertVariable = (variable: typeof VARIABLES[0]) => {
    insertAtCursor(variable.key);
    setShowVariables(false);
  };

  const fetchAISuggestions = async () => {
    if (!value.trim() || value.length < 3) {
      setAiError('Type at least 3 characters');
      setTimeout(() => setAiError(null), 2000);
      return;
    }
    
    setLoadingAI(true);
    setAiError(null);
    setShowSuggestions(false);
    
    try {
      console.log('Fetching AI suggestion for:', value.substring(0, 50));
      
      // Use the AI generate API with external context for inbox
      const result = await api.generateAIResponse(value, {
        contactName: contactContext,
        channel: channel,
      });
      
      console.log('AI response:', result);
      
      if (result && result.response && result.response.trim()) {
        setAiSuggestions([result.response]);
        setShowSuggestions(true);
        setAiError(null);
      } else {
        // Show fallback if no response
        setAiSuggestions([
          'Thank you for reaching out! How can I assist you today?',
          'I understand. Let me help you with that.',
        ]);
        setShowSuggestions(true);
      }
    } catch (error: any) {
      console.error('AI suggestions error:', error);
      setAiError('AI service error');
      setTimeout(() => setAiError(null), 3000);
      
      // Show fallback suggestions even on error
      setAiSuggestions([
        'Thank you for your message. How can I help you?',
        'Is there anything else you need assistance with?',
      ]);
      setShowSuggestions(true);
    } finally {
      setLoadingAI(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && onSend) {
      e.preventDefault();
      onSend();
    }
  };

  const charCount = value.length;
  const isOverLimit = maxLength ? charCount > maxLength : false;
  const hasVariables = value.includes('{{');

  // Get template status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return { text: '✓', class: 'approved' };
      case 'PENDING': return { text: '○', class: 'pending' };
      case 'REJECTED': return { text: '×', class: 'rejected' };
      default: return { text: '?', class: '' };
    }
  };

  return (
    <div className={styles['rich-text-editor']} ref={dropdownRef}>
      {/* AI Suggestions Panel */}
      {showAISuggestions && showSuggestions && aiSuggestions.length > 0 && (
        <div className={styles['ai-suggestions-panel']}>
          <div className={styles['ai-suggestions-header']}>
            <span>◇ AI Suggestion</span>
            <button onClick={() => setShowSuggestions(false)}>×</button>
          </div>
          <div className={styles['ai-suggestions-list']}>
            {aiSuggestions.map((suggestion, i) => (
              <button key={i} className={styles['ai-suggestion-item']} onClick={() => applySuggestion(suggestion)}>
                {suggestion.length > 100 ? suggestion.substring(0, 100) + '...' : suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Templates Dropdown */}
      {showTemplates && (
        <div className={styles['dropdown-panel']}>
          <div className={styles['dropdown-header']}>
            <span>▤ WhatsApp Templates</span>
            <button onClick={() => setShowTemplates(false)}>×</button>
          </div>
          <div className={styles['dropdown-list']}>
            {templatesLoading ? (
              <div className={styles['dropdown-loading']}>Loading templates...</div>
            ) : templates.length > 0 ? (
              templates.map((template) => {
                const badge = getStatusBadge(template.status);
                return (
                  <button 
                    key={template.id} 
                    className={styles['dropdown-item']} 
                    onClick={() => applyTemplate(template)}
                    disabled={template.status !== 'APPROVED'}
                  >
                    <span className={`${styles['template-status']} ${styles[badge.class]}`}>{badge.text}</span>
                    <span className={styles['dropdown-item-title']}>{template.name}</span>
                    <span className={styles['template-category']}>{template.category}</span>
                  </button>
                );
              })
            ) : (
              <div className={styles['dropdown-empty']}>
                <p>No templates found</p>
                <p className={styles['dropdown-hint-text']}>Templates are managed in AWS Console or Meta Business Suite</p>
              </div>
            )}
          </div>
          <div className={styles['dropdown-hint']}>
            Templates can be sent outside 24h window
          </div>
        </div>
      )}

      {/* Variables Dropdown */}
      {showVariables && (
        <div className={styles['dropdown-panel']}>
          <div className={styles['dropdown-header']}>
            <span>⊕ Variables</span>
            <button onClick={() => setShowVariables(false)}>×</button>
          </div>
          <div className={styles['dropdown-list']}>
            {VARIABLES.map((variable) => (
              <button key={variable.key} className={styles['dropdown-item']} onClick={() => insertVariable(variable)}>
                <span className={styles['variable-icon']}>{variable.icon}</span>
                <span>{variable.key}</span>
                <span className={styles['variable-label']}>{variable.label}</span>
              </button>
            ))}
          </div>
          <div className={styles['dropdown-hint']}>
            Variables are replaced when sending templates
          </div>
        </div>
      )}

      {/* Formatting Dropdown */}
      {showFormatting && channel === 'whatsapp' && (
        <div className={styles['dropdown-panel']}>
          <div className={styles['dropdown-header']}>
            <span>◈ Formatting</span>
            <button onClick={() => setShowFormatting(false)}>×</button>
          </div>
          <div className={styles['dropdown-list']}>
            <button className={styles['dropdown-item']} onClick={() => wrapSelection('*', '*')}>
              <span className={styles['format-icon']}><strong>B</strong></span>
              <span>Bold</span>
              <span className={styles['format-hint']}>*text*</span>
            </button>
            <button className={styles['dropdown-item']} onClick={() => wrapSelection('_', '_')}>
              <span className={styles['format-icon']}><em>I</em></span>
              <span>Italic</span>
              <span className={styles['format-hint']}>_text_</span>
            </button>
            <button className={styles['dropdown-item']} onClick={() => wrapSelection('~', '~')}>
              <span className={styles['format-icon']}><s>S</s></span>
              <span>Strikethrough</span>
              <span className={styles['format-hint']}>~text~</span>
            </button>
            <button className={styles['dropdown-item']} onClick={() => wrapSelection('```', '```')}>
              <span className={styles['format-icon']}>{'<>'}</span>
              <span>Monospace</span>
              <span className={styles['format-hint']}>```text```</span>
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className={styles['editor-toolbar']}>
        {/* Templates Button (WhatsApp only) */}
        {channel === 'whatsapp' && (
          <button
            type="button"
            className={`${styles['toolbar-btn']} ${showTemplates ? styles['active'] : ''}`}
            onClick={() => { setShowTemplates(!showTemplates); setShowVariables(false); setShowFormatting(false); }}
            title="Templates (can send outside 24h window)"
          >
            ▤
          </button>
        )}

        {/* Variables Button */}
        <button
          type="button"
          className={`${styles['toolbar-btn']} ${showVariables ? styles['active'] : ''} ${hasVariables ? styles['has-vars'] : ''}`}
          onClick={() => { setShowVariables(!showVariables); setShowTemplates(false); setShowFormatting(false); }}
          title="Insert Variable"
        >
          {'{{}}'}
        </button>

        {/* Formatting Button (WhatsApp only) */}
        {channel === 'whatsapp' && (
          <button
            type="button"
            className={`${styles['toolbar-btn']} ${showFormatting ? styles['active'] : ''}`}
            onClick={() => { setShowFormatting(!showFormatting); setShowTemplates(false); setShowVariables(false); }}
            title="Formatting"
          >
            ◈
          </button>
        )}

        {/* AI Button */}
        {showAISuggestions && (
          <button
            type="button"
            className={`${styles['toolbar-btn']} ${styles['ai-btn']} ${aiError ? styles['error'] : ''}`}
            onClick={fetchAISuggestions}
            disabled={loadingAI}
            title={aiError || "Get AI Suggestion (Bedrock)"}
          >
            {loadingAI ? '...' : '◇ AI'}
          </button>
        )}

        <div className={styles['toolbar-spacer']} />

        {/* Character Count */}
        {showCharCount && (
          <span className={`${styles['char-counter']} ${isOverLimit ? styles['over-limit'] : ''}`}>
            {charCount}{maxLength ? `/${maxLength}` : ''}
          </span>
        )}

        {/* Variable indicator */}
        {hasVariables && (
          <span className={styles['var-indicator']} title="Contains variables">
            ⊕ {(value.match(/\{\{\d+\}\}/g) || []).length}
          </span>
        )}
      </div>

      {/* Text Input */}
      <div className={styles['editor-input-wrapper']}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`${styles['editor-textarea']} ${isOverLimit ? styles['over-limit'] : ''}`}
          rows={1}
        />
        
        {onSend && (
          <button
            type="button"
            className={styles['send-btn']}
            onClick={onSend}
            disabled={disabled || !value.trim() || isOverLimit}
            title="Send (Enter)"
          >
            →
          </button>
        )}
      </div>

      {/* Help hint */}
      <div className={styles['editor-hint']}>
        {channel === 'whatsapp' && (
          <span>Enter to send · Shift+Enter for new line · *bold* _italic_ ~strike~</span>
        )}
        {channel === 'sms' && (
          <span>SMS: 160 chars = 1 segment · Enter to send</span>
        )}
        {channel === 'email' && (
          <span>Enter to send · Shift+Enter for new line</span>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
