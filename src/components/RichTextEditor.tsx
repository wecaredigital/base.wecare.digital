/**
 * Rich Text Editor Component
 * Full-featured editor with emoji picker and AI suggestions
 * For WhatsApp, SMS, Email messaging
 */

import React, { useState, useRef, useEffect } from 'react';
import styles from './RichTextEditor.module.css';
import * as api from '../lib/api';

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
}

// Common emoji categories
const EMOJI_CATEGORIES = {
  smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷'],
  gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿'],
  hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  objects: ['📱', '💻', '🖥️', '📞', '☎️', '📧', '✉️', '📨', '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🗳️', '✏️', '✒️', '🖊️', '🖋️', '📝', '💼', '📁', '📂', '🗂️', '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊'],
  symbols: ['✅', '❌', '⭕', '❗', '❓', '‼️', '⁉️', '💯', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '▶️', '⏸️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '🔀', '🔁', '🔂', '🔃', '🔄'],
  business: ['💰', '💵', '💴', '💶', '💷', '💸', '💳', '🧾', '💹', '📊', '📈', '📉', '🏦', '🏢', '🏬', '🏭', '🏗️', '🏛️', '⚖️', '🔒', '🔓', '🔐', '🔑', '🗝️'],
};

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
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState<keyof typeof EMOJI_CATEGORIES>('smileys');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
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

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + emoji + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      onChange(value + emoji);
    }
  };

  const fetchAISuggestions = async () => {
    if (!value.trim() || value.length < 3) {
      setAiError('Type at least 3 characters');
      setTimeout(() => setAiError(null), 2000);
      return;
    }
    
    setLoadingAI(true);
    setAiError(null);
    try {
      const suggestions = await api.getAISuggestions(value, channel, contactContext);
      setAiSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('AI suggestions error:', error);
      // Fallback suggestions
      setAiSuggestions([
        'Thank you for reaching out!',
        'I\'ll get back to you shortly.',
        'How can I assist you further?',
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

  return (
    <div className={styles['rich-text-editor']}>
      {/* AI Suggestions Panel */}
      {showAISuggestions && showSuggestions && aiSuggestions.length > 0 && (
        <div className={styles['ai-suggestions-panel']}>
          <div className={styles['ai-suggestions-header']}>
            <span>✨ AI Suggestions</span>
            <button onClick={() => setShowSuggestions(false)}>✕</button>
          </div>
          <div className={styles['ai-suggestions-list']}>
            {aiSuggestions.map((suggestion, i) => (
              <button key={i} className={styles['ai-suggestion-item']} onClick={() => applySuggestion(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className={styles['editor-toolbar']}>
        <button
          type="button"
          className={`${styles['toolbar-btn']} ${showEmojiPicker ? styles['active'] : ''}`}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Emoji"
        >
          😊
        </button>
        
        {showAISuggestions && (
          <button
            type="button"
            className={`${styles['toolbar-btn']} ${styles['ai-btn']} ${aiError ? styles['error'] : ''}`}
            onClick={fetchAISuggestions}
            disabled={loadingAI}
            title={aiError || "Get AI Suggestions"}
          >
            {loadingAI ? '...' : '✨ AI'}
          </button>
        )}

        {channel === 'whatsapp' && (
          <>
            <button type="button" className={styles['toolbar-btn']} title="Bold" onClick={() => onChange(value + '*bold*')}>
              <strong>B</strong>
            </button>
            <button type="button" className={styles['toolbar-btn']} title="Italic" onClick={() => onChange(value + '_italic_')}>
              <em>I</em>
            </button>
            <button type="button" className={styles['toolbar-btn']} title="Strikethrough" onClick={() => onChange(value + '~strike~')}>
              <s>S</s>
            </button>
          </>
        )}

        {channel === 'email' && (
          <>
            <button type="button" className={styles['toolbar-btn']} title="Bold">
              <strong>B</strong>
            </button>
            <button type="button" className={styles['toolbar-btn']} title="Italic">
              <em>I</em>
            </button>
            <button type="button" className={styles['toolbar-btn']} title="Underline">
              <u>U</u>
            </button>
            <button type="button" className={styles['toolbar-btn']} title="Link">
              🔗
            </button>
          </>
        )}

        <div className={styles['toolbar-spacer']} />

        {showCharCount && (
          <span className={`${styles['char-counter']} ${isOverLimit ? styles['over-limit'] : ''}`}>
            {charCount}{maxLength ? `/${maxLength}` : ''}
          </span>
        )}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className={styles['emoji-picker']} ref={emojiPickerRef}>
          <div className={styles['emoji-categories']}>
            {Object.keys(EMOJI_CATEGORIES).map((cat) => (
              <button
                key={cat}
                className={`${styles['emoji-cat-btn']} ${activeEmojiCategory === cat ? styles['active'] : ''}`}
                onClick={() => setActiveEmojiCategory(cat as keyof typeof EMOJI_CATEGORIES)}
              >
                {EMOJI_CATEGORIES[cat as keyof typeof EMOJI_CATEGORIES][0]}
              </button>
            ))}
          </div>
          <div className={styles['emoji-grid']}>
            {EMOJI_CATEGORIES[activeEmojiCategory].map((emoji, i) => (
              <button key={i} className={styles['emoji-btn']} onClick={() => insertEmoji(emoji)}>
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

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
          >
            ➤
          </button>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
