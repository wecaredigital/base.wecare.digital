/**
 * Agent Page - Bedrock Agent Core Chatbot
 * WECARE.DIGITAL Admin Platform
 * 
 * Internal Admin Agent chatbot for taking tasks using Bedrock Agent
 * Agent ID: HQNT0JXN8G
 * Runtime ID: base_bedrock_agentcore-1XHDxj2o3Q
 * 
 * Design: Unicode symbols only - No emoji
 */

import React, { useState, useRef, useEffect } from 'react';
import Layout from '../../components/Layout';

interface PageProps {
  signOut?: () => void;
  user?: any;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  isLoading?: boolean;
}

const AgentPage: React.FC<PageProps> = ({ signOut, user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m the WECARE.DIGITAL Admin Agent powered by Amazon Bedrock. I can help you with:\n\n• Send WhatsApp/SMS/Email messages\n• Create and manage bulk jobs\n• Query contacts and messages\n• Check system health and stats\n• DLQ replay (Admin only)\n\nHow can I assist you today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      content: '',
      timestamp: new Date(),
      isLoading: true,
    }]);

    try {
      // Call AI API
      const response = await fetch('https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageContent: userMessage.content,
          contactId: 'internal-agent',
          requestId: userMessage.id,
        }),
      });

      let assistantContent = 'I apologize, but I encountered an issue processing your request. Please try again.';
      let sources: string[] = [];

      if (response.ok) {
        const data = await response.json();
        assistantContent = data.suggestion || data.response || assistantContent;
        sources = data.sources || [];
      }

      // Replace loading message with actual response
      setMessages(prev => prev.map(m => 
        m.id === loadingId 
          ? { ...m, content: assistantContent, sources, isLoading: false }
          : m
      ));
    } catch (error) {
      console.error('Agent error:', error);
      setMessages(prev => prev.map(m => 
        m.id === loadingId 
          ? { ...m, content: 'I apologize, but I encountered a connection error. Please check your network and try again.', isLoading: false }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Chat cleared. How can I help you?',
      timestamp: new Date(),
    }]);
  };

  return (
    <Layout user={user} onSignOut={signOut}>
      <div className="page agent-page">
        <div className="agent-header">
          <div className="agent-title">
            <h1 className="page-title">⌘ Admin Agent</h1>
            <span className="agent-badge">Bedrock Nova Pro</span>
          </div>
          <div className="agent-actions">
            <button className="btn-secondary" onClick={clearChat}>⌫ Clear Chat</button>
          </div>
        </div>

        <div className="agent-info">
          <div className="info-item">
            <span className="info-label">Knowledge Base</span>
            <span className="info-value">FZBPKGTOYE</span>
          </div>
          <div className="info-item">
            <span className="info-label">Agent ID</span>
            <span className="info-value">HQNT0JXN8G</span>
          </div>
          <div className="info-item">
            <span className="info-label">Runtime ID</span>
            <span className="info-value">base_bedrock_agentcore-1XHDxj2o3Q</span>
          </div>
          <div className="info-item">
            <span className="info-label">Status</span>
            <span className="info-value status-active">● Active</span>
          </div>
        </div>

        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? '◉' : '⌬'}
                </div>
                <div className="message-content">
                  {msg.isLoading ? (
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  ) : (
                    <>
                      <div className="message-text">{msg.content}</div>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="message-sources">
                          <span className="sources-label">Sources:</span>
                          {msg.sources.map((s, i) => (
                            <span key={i} className="source-tag">{s}</span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  <div className="message-time">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the agent anything..."
              rows={2}
              disabled={isLoading}
            />
            <button 
              className="btn-send" 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>

        <div className="agent-suggestions">
          <span className="suggestions-label">Try asking:</span>
          <button onClick={() => setInput('Send a WhatsApp message to +919903300044')}>Send WhatsApp</button>
          <button onClick={() => setInput('Show me today\'s message stats')}>Today's stats</button>
          <button onClick={() => setInput('List all contacts')}>List contacts</button>
          <button onClick={() => setInput('Create a bulk SMS job')}>Create bulk job</button>
        </div>
      </div>
    </Layout>
  );
};

export default AgentPage;
