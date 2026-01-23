/**
 * Floating Agent - Internal Admin Chatbot
 * WECARE.DIGITAL Admin Platform
 * 
 * AI-powered assistant for internal task automation
 * Uses Amazon Bedrock Agent with Nova Lite
 * 
 * Model: Amazon Nova Lite (~$0.06/1M input tokens)
 * 
 * Bedrock Resources (INTERNAL - Admin Tasks):
 * - Agent ID: TJAZR473IJ
 * - KB ID: 08LG9AKAHN
 * 
 * Note: External (WhatsApp auto-reply) uses separate Agent/KB
 */

import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod';

// Internal Agent Configuration (for admin tasks)
const INTERNAL_AGENT_ID = 'TJAZR473IJ';
const INTERNAL_AGENT_ALIAS = 'O4U1HF2MSX';
const INTERNAL_KB_ID = '08LG9AKAHN';

const FloatingAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your WECARE assistant. I can help you send messages, find contacts, check stats, and answer questions. Just type what you need!',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 100) + 'px';
    }
  }, [input]);


  const processCommand = async (text: string): Promise<string> => {
    const lowerText = text.toLowerCase();
    
    try {
      // Send WhatsApp message
      if (lowerText.includes('send') && (lowerText.includes('whatsapp') || lowerText.includes('message'))) {
        const phoneMatch = text.match(/(\+?\d[\d\s-]{8,})/);
        const contentMatch = text.match(/(?:saying|message|content|text)[:\s]+["']?(.+?)["']?$/i);
        
        if (!phoneMatch) {
          return 'Please provide a phone number. Example: "Send WhatsApp to +919330994400 saying Hello!"';
        }
        
        const phone = phoneMatch[1].replace(/\s/g, '');
        const contactsRes = await fetch(`${API_BASE}/contacts?q=${encodeURIComponent(phone)}`);
        const contactsData = await contactsRes.json();
        const contacts = contactsData.contacts || [];
        
        if (contacts.length === 0) {
          return `No contact found with phone ${phone}. Add the contact first.`;
        }
        
        const contact = contacts[0];
        
        if (!contentMatch) {
          return `Found: ${contact.name || 'Unknown'} (${contact.phone})\n\nWhat message would you like to send?`;
        }
        
        const sendRes = await fetch(`${API_BASE}/whatsapp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactId: contact.contactId || contact.id,
            content: contentMatch[1],
          }),
        });
        
        if (sendRes.ok) {
          const result = await sendRes.json();
          return `✓ Message sent!\n\nTo: ${contact.name || contact.phone}\nMessage: "${contentMatch[1]}"\nStatus: ${result.status}`;
        }
        return 'Failed to send message. Please try again.';
      }
      
      // Find contact
      if (lowerText.includes('find') || lowerText.includes('search') || lowerText.includes('contact')) {
        const phoneMatch = text.match(/(\+?\d[\d\s-]{8,})/);
        const nameMatch = text.match(/(?:named?|called?|for)\s+["']?(\w+)["']?/i);
        const query = phoneMatch?.[1]?.replace(/\s/g, '') || nameMatch?.[1] || '';
        
        if (!query) {
          return 'Please provide a phone number or name to search.';
        }
        
        const res = await fetch(`${API_BASE}/contacts?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        const contacts = data.contacts || [];
        
        if (contacts.length === 0) {
          return `No contacts found matching "${query}"`;
        }
        
        const results = contacts.slice(0, 5).map((c: any) => 
          `• ${c.name || 'Unknown'} - ${c.phone || 'No phone'}`
        ).join('\n');
        
        return `Found ${contacts.length} contact(s):\n\n${results}`;
      }
      
      // Stats
      if (lowerText.includes('stats') || lowerText.includes('dashboard') || lowerText.includes('today')) {
        const [contactsRes, messagesRes] = await Promise.all([
          fetch(`${API_BASE}/contacts`),
          fetch(`${API_BASE}/messages`),
        ]);
        
        const contactsData = await contactsRes.json();
        const messagesData = await messagesRes.json();
        
        const contacts = contactsData.contacts || [];
        const allMessages = messagesData.messages || [];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayMessages = allMessages.filter((m: any) => new Date(m.timestamp) >= today);
        const inbound = todayMessages.filter((m: any) => m.direction === 'INBOUND').length;
        const outbound = todayMessages.filter((m: any) => m.direction === 'OUTBOUND').length;
        
        return `📊 Today's Stats:\n\nMessages: ${todayMessages.length}\n  ↙ Inbound: ${inbound}\n  ↗ Outbound: ${outbound}\n\nTotal Contacts: ${contacts.length}`;
      }
      
      // Help
      if (lowerText.includes('help') || lowerText.includes('what can')) {
        return `I can help you with:\n\n• Send WhatsApp to +91... saying Hello\n• Find contact +91... or named John\n• Show today's stats\n• Check recent messages\n\nJust type naturally!`;
      }
      
      // AI fallback - use Bedrock Agent with Nova Lite
      // TODO: Enable after configuring internal agent
      if (INTERNAL_AGENT_ID) {
        const aiRes = await fetch(`${API_BASE}/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: text,
            sessionId: sessionId,
            agentId: INTERNAL_AGENT_ID,
            agentAlias: INTERNAL_AGENT_ALIAS,
            model: 'nova-lite',
            context: 'internal-admin'
          }),
        });
        
        if (aiRes.ok) {
          const data = await aiRes.json();
          return data.response || data.suggestion || 'I can help you send messages, find contacts, or check stats. Try "help" for examples.';
        }
      }
      
      return 'I can help you send messages, find contacts, or check stats. Try "help" for examples.';
      
    } catch (error) {
      console.error('Agent error:', error);
      return 'Connection error. Please try again.';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const loadingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: loadingId,
      role: 'assistant',
      content: '...',
      timestamp: new Date(),
      status: 'sending',
    }]);

    const response = await processCommand(userMessage.content);

    setMessages(prev => prev.map(m => 
      m.id === loadingId ? { ...m, content: response, status: 'sent' } : m
    ));
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button className="agent-fab" onClick={() => setIsOpen(true)} title="Open Assistant">
        <span className="agent-fab-icon">💬</span>
      </button>
    );
  }

  return (
    <div className="agent-panel">
      <div className="agent-header">
        <div className="agent-header-info">
          <span className="agent-avatar">🤖</span>
          <div>
            <span className="agent-name">WECARE Assistant</span>
            <span className="agent-status-dot">● Online</span>
          </div>
        </div>
        <button className="agent-close" onClick={() => setIsOpen(false)}>✕</button>
      </div>

      <div className="agent-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`agent-message ${msg.role}`}>
            <div className="agent-message-content">
              {msg.content.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < msg.content.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
            <div className="agent-message-time">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="agent-input-area">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message or command..."
          disabled={isLoading}
          rows={1}
        />
        <button 
          className="agent-send-btn" 
          onClick={handleSend} 
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? '...' : '➤'}
        </button>
      </div>
    </div>
  );
};

export default FloatingAgent;
