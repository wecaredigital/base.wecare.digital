/**
 * Rich Text Editor Component
 * Full-featured editor with emoji picker and AI suggestions
 * For WhatsApp, SMS, Email messaging
 */

import React, { useState, useRef, useEffect } from 'react';

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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod';

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
    if (!value.trim() || value.length < 3) return;
    
    setLoadingAI(true);
    try {
      const response = await fetch(`${API_BASE}/ai/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageContent: value,
          channel,
          context: contactContext,
          type: 'reply_suggestions',
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data.suggestions || [
          `Thank you for your message. ${value.length > 20 ? 'I understand your concern.' : 'How can I help you today?'}`,
          `I'll look into this and get back to you shortly.`,
          `Is there anything else I can assist you with?`,
        ]);
        setShowSuggestions(true);
      }
    } catch (error) {
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
    <div className="rich-text-editor">
      {/* AI Suggestions Panel */}
      {showAISuggestions && showSuggestions && aiSuggestions.length > 0 && (
        <div className="ai-suggestions-panel">
          <div className="ai-suggestions-header">
            <span>✨ AI Suggestions</span>
            <button onClick={() => setShowSuggestions(false)}>✕</button>
          </div>
          <div className="ai-suggestions-list">
            {aiSuggestions.map((suggestion, i) => (
              <button key={i} className="ai-suggestion-item" onClick={() => applySuggestion(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="editor-toolbar">
        <button
          type="button"
          className={`toolbar-btn ${showEmojiPicker ? 'active' : ''}`}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Emoji"
        >
          😊
        </button>
        
        {showAISuggestions && (
          <button
            type="button"
            className="toolbar-btn ai-btn"
            onClick={fetchAISuggestions}
            disabled={loadingAI || !value.trim()}
            title="Get AI Suggestions"
          >
            {loadingAI ? '...' : '✨ AI'}
          </button>
        )}

        {channel === 'whatsapp' && (
          <>
            <button type="button" className="toolbar-btn" title="Bold" onClick={() => onChange(value + '*bold*')}>
              <strong>B</strong>
            </button>
            <button type="button" className="toolbar-btn" title="Italic" onClick={() => onChange(value + '_italic_')}>
              <em>I</em>
            </button>
            <button type="button" className="toolbar-btn" title="Strikethrough" onClick={() => onChange(value + '~strike~')}>
              <s>S</s>
            </button>
          </>
        )}

        {channel === 'email' && (
          <>
            <button type="button" className="toolbar-btn" title="Bold">
              <strong>B</strong>
            </button>
            <button type="button" className="toolbar-btn" title="Italic">
              <em>I</em>
            </button>
            <button type="button" className="toolbar-btn" title="Underline">
              <u>U</u>
            </button>
            <button type="button" className="toolbar-btn" title="Link">
              🔗
            </button>
          </>
        )}

        <div className="toolbar-spacer" />

        {showCharCount && (
          <span className={`char-counter ${isOverLimit ? 'over-limit' : ''}`}>
            {charCount}{maxLength ? `/${maxLength}` : ''}
          </span>
        )}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="emoji-picker" ref={emojiPickerRef}>
          <div className="emoji-categories">
            {Object.keys(EMOJI_CATEGORIES).map((cat) => (
              <button
                key={cat}
                className={`emoji-cat-btn ${activeEmojiCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveEmojiCategory(cat as keyof typeof EMOJI_CATEGORIES)}
              >
                {EMOJI_CATEGORIES[cat as keyof typeof EMOJI_CATEGORIES][0]}
              </button>
            ))}
          </div>
          <div className="emoji-grid">
            {EMOJI_CATEGORIES[activeEmojiCategory].map((emoji, i) => (
              <button key={i} className="emoji-btn" onClick={() => insertEmoji(emoji)}>
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text Input */}
      <div className="editor-input-wrapper">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`editor-textarea ${isOverLimit ? 'over-limit' : ''}`}
          rows={1}
        />
        
        {onSend && (
          <button
            type="button"
            className="send-btn"
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
