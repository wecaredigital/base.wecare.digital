/**
 * Floating Agent Chatbot Component
 * WECARE.DIGITAL Admin Platform
 * 
 * CAS (Conversational AI System) for internal task automation
 * Design: No emoji - Unicode symbols only
 * 
 * Bedrock Resources:
 * - Knowledge Base ID: FZBPKGTOYE
 * - Agent ID: HQNT0JXN8G (WhatsApp Customer Interaction)
 * - Agent Core Runtime ID: base_bedrock_agentcore-1XHDxj2o3Q (Internal Admin)
 * - Foundation Model: amazon.nova-pro-v1:0
 * 
 * Capabilities:
 * - Send WhatsApp/SMS/Email messages
 * - Query contacts
 * - Check message status
 * - System queries
 * - Task automation
 */

import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  action?: {
    type: 'send_message' | 'query_contacts' | 'check_status' | 'bulk_job';
    status: 'pending' | 'success' | 'failed';
    details?: string;
  };
}

const QUICK_ACTIONS = [
  { label: '↗ Send WhatsApp', prompt: 'Send a WhatsApp message to ' },
  { label: '☎ Find Contact', prompt: 'Find contact with phone number ' },
  { label: '⌂ Today Stats', prompt: 'Show me today\'s messaging statistics' },
  { label: '◎ Check Status', prompt: 'Check status of recent messages' },
];

const FloatingAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your WECARE Agent. I can help you:\n\n• Send messages (WhatsApp/SMS/Email)\n• Find contacts\n• Check message status\n• Run bulk operations\n\nWhat would you like to do?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const parseCommand = (text: string): { action: string; params: Record<string, string> } | null => {
    const lowerText = text.toLowerCase();
    
    // Send message patterns
    if (lowerText.includes('send') && (lowerText.includes('whatsapp') || lowerText.includes('message'))) {
      const phoneMatch = text.match(/(\+?\d[\d\s-]{8,})/);
      const contentMatch = text.match(/(?:saying|message|content|text)[:\s]+["']?(.+?)["']?$/i);
      return {
        action: 'send_whatsapp',
        params: {
          phone: phoneMatch?.[1]?.replace(/\s/g, '') || '',
          content: contentMatch?.[1] || '',
        }
      };
    }
    
    // Find contact patterns
    if (lowerText.includes('find') || lowerText.includes('search') || lowerText.includes('lookup')) {
      const phoneMatch = text.match(/(\+?\d[\d\s-]{8,})/);
      const nameMatch = text.match(/(?:named?|called?)\s+["']?(\w+)["']?/i);
      return {
        action: 'find_contact',
        params: {
          phone: phoneMatch?.[1]?.replace(/\s/g, '') || '',
          name: nameMatch?.[1] || '',
        }
      };
    }
    
    // Stats patterns
    if (lowerText.includes('stats') || lowerText.includes('statistics') || lowerText.includes('dashboard')) {
      return { action: 'get_stats', params: {} };
    }
    
    // Status check patterns
    if (lowerText.includes('status') || lowerText.includes('check')) {
      return { action: 'check_status', params: {} };
    }
    
    return null;
  };

  const executeAction = async (action: string, params: Record<string, string>): Promise<string> => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod';
    
    try {
      switch (action) {
        case 'send_whatsapp': {
          if (!params.phone) {
            return '✗ Please provide a phone number. Example: "Send WhatsApp to +919330994400 saying Hello!"';
          }
          
          // First find the contact
          const contactsRes = await fetch(`${API_BASE}/contacts?q=${encodeURIComponent(params.phone)}`);
          const contactsData = await contactsRes.json();
          const contacts = contactsData.contacts || [];
          
          if (contacts.length === 0) {
            return `✗ No contact found with phone ${params.phone}. Please add the contact first.`;
          }
          
          const contact = contacts[0];
          
          if (!params.content) {
            return `✓ Found contact: ${contact.name || 'Unknown'} (${contact.phone})\n\nWhat message would you like to send?`;
          }
          
          // Send the message
          const sendRes = await fetch(`${API_BASE}/whatsapp/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contactId: contact.contactId || contact.id,
              content: params.content,
            }),
          });
          
          if (sendRes.ok) {
            const result = await sendRes.json();
            return `✓ Message sent successfully!\n\nTo: ${contact.name || contact.phone}\nMessage: "${params.content}"\nStatus: ${result.status}`;
          } else {
            const error = await sendRes.json();
            return `✗ Failed to send: ${error.error || 'Unknown error'}`;
          }
        }
        
        case 'find_contact': {
          const query = params.phone || params.name;
          if (!query) {
            return '✗ Please provide a phone number or name to search.';
          }
          
          const res = await fetch(`${API_BASE}/contacts?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          const contacts = data.contacts || [];
          
          if (contacts.length === 0) {
            return `○ No contacts found matching "${query}"`;
          }
          
          const results = contacts.slice(0, 5).map((c: any) => 
            `• ${c.name || 'Unknown'} - ${c.phone || 'No phone'}`
          ).join('\n\n');
          
          return `○ Found ${contacts.length} contact(s):\n\n${results}`;
        }
        
        case 'get_stats': {
          const [contactsRes, messagesRes] = await Promise.all([
            fetch(`${API_BASE}/contacts`),
            fetch(`${API_BASE}/messages`),
          ]);
          
          const contactsData = await contactsRes.json();
          const messagesData = await messagesRes.json();
          
          const contacts = contactsData.contacts || [];
          const messages = messagesData.messages || [];
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayMessages = messages.filter((m: any) => new Date(m.timestamp) >= today);
          const inbound = todayMessages.filter((m: any) => m.direction === 'INBOUND').length;
          const outbound = todayMessages.filter((m: any) => m.direction === 'OUTBOUND').length;
          
          return `⌂ Today's Statistics:\n\n` +
            `✉ Messages Today: ${todayMessages.length}\n` +
            `  ↙ Inbound: ${inbound}\n` +
            `  ↗ Outbound: ${outbound}\n\n` +
            `☎ Total Contacts: ${contacts.length}`;
        }
        
        case 'check_status': {
          const res = await fetch(`${API_BASE}/messages?limit=5`);
          const data = await res.json();
          const messages = data.messages || [];
          
          if (messages.length === 0) {
            return '○ No recent messages found.';
          }
          
          const results = messages.slice(0, 5).map((m: any) => {
            const dir = m.direction === 'INBOUND' ? '↙' : '↗';
            const status = m.status?.toLowerCase() || 'unknown';
            const statusIcon = status === 'delivered' || status === 'read' ? '✓✓' : status === 'sent' ? '✓' : '○';
            return `${dir} ${m.channel || 'WHATSAPP'} | ${statusIcon} ${status}\n   "${(m.content || '').substring(0, 40)}..."`;
          }).join('\n\n');
          
          return `◎ Recent Messages:\n\n${results}`;
        }
        
        default:
          return '? I didn\'t understand that command. Try:\n• "Send WhatsApp to +91... saying Hello"\n• "Find contact +91..."\n• "Show today\'s stats"';
      }
    } catch (error) {
      console.error('Action error:', error);
      return `✗ Error executing action: ${error instanceof Error ? error.message : 'Unknown error'}`;
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

    // Add loading message
    const loadingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: loadingId,
      role: 'assistant',
      content: '○ Processing...',
      timestamp: new Date(),
    }]);

    try {
      // Parse and execute command
      const command = parseCommand(userMessage.content);
      let response: string;
      
      if (command) {
        response = await executeAction(command.action, command.params);
      } else {
        // Fall back to AI for general queries
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod';
        const aiRes = await fetch(`${API_BASE}/ai/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageContent: userMessage.content,
            contactId: 'internal-agent',
          }),
        });
        
        if (aiRes.ok) {
          const data = await aiRes.json();
          response = data.suggestedResponse || data.suggestion || 'I can help you with:\n• Sending messages\n• Finding contacts\n• Checking stats\n\nTry a specific command!';
        } else {
          response = '? I can help you with:\n• "Send WhatsApp to +91... saying Hello"\n• "Find contact named John"\n• "Show today\'s stats"\n• "Check message status"';
        }
      }

      setMessages(prev => prev.map(m => 
        m.id === loadingId ? { ...m, content: response } : m
      ));
    } catch (error) {
      setMessages(prev => prev.map(m => 
        m.id === loadingId ? { ...m, content: '✗ Connection error. Please try again.' } : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  if (!isOpen) {
    return (
      <button className="floating-agent-button" onClick={() => setIsOpen(true)} title="Open Agent">
        <span className="agent-icon">⌘</span>
        <span className="agent-pulse"></span>
      </button>
    );
  }

  return (
    <div className={`floating-agent-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="floating-agent-header">
        <div className="agent-header-info">
          <span className="agent-avatar">⌘</span>
          <div>
            <span className="agent-name">WECARE Agent</span>
            <span className="agent-status">● Online</span>
          </div>
        </div>
        <div className="agent-header-actions">
          <button onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? 'Expand' : 'Minimize'}>
            {isMinimized ? '△' : '▽'}
          </button>
          <button onClick={() => setIsOpen(false)} title="Close">✕</button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="floating-agent-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`floating-message ${msg.role}`}>
                <div className="floating-message-content">
                  {msg.content}
                </div>
                <div className="floating-message-time">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="floating-agent-quick-actions">
            {QUICK_ACTIONS.map((action, i) => (
              <button key={i} onClick={() => handleQuickAction(action.prompt)}>
                {action.label}
              </button>
            ))}
          </div>

          <div className="floating-agent-input">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a command..."
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={!input.trim() || isLoading}>
              {isLoading ? '...' : '➤'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FloatingAgent;
