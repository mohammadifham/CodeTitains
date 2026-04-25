'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! I am the Disaster Response Assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate bot response - memoized to prevent unnecessary updates
  const getBotResponse = useCallback((userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes('status') ||
      lowerMessage.includes('resources') ||
      lowerMessage.includes('allocation')
    ) {
      return 'Current system status is optimal. All resources are being tracked in real-time. Would you like detailed information about any specific resource?';
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('?')) {
      return 'I can help with resource allocation, disaster tracking, emergency requests, and system status updates. What do you need assistance with?';
    }

    if (
      lowerMessage.includes('emergency') ||
      lowerMessage.includes('urgent') ||
      lowerMessage.includes('critical')
    ) {
      return 'I am flagging this as critical. Please provide more details about the emergency so we can allocate appropriate resources immediately.';
    }

    return 'I understand your message. Could you provide more details so I can assist you better?';
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: getBotResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 500);
  }, [input, getBotResponse]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  return (
    <div className="neon-card h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b" style={{ borderBottomColor: 'rgba(0, 255, 255, 0.2)' }}>
        <MessageCircle size={20} className="text-purple-400" />
        <h2 className="text-lg font-bold text-cyan-400">AI Assistant</h2>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-xs px-4 py-2 rounded-lg text-sm" 
              style={{
                backgroundColor: message.sender === 'user' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 255, 255, 0.2)',
                color: message.sender === 'user' ? '#bfdbfe' : '#cffafe',
                borderWidth: '1px',
                borderColor: message.sender === 'user' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(0, 255, 255, 0.4)'
              }}
            >
              {message.text}
              <div className="text-xs mt-1" style={{ opacity: 0.7 }}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-lg border" style={{ backgroundColor: 'rgba(0, 255, 255, 0.2)', borderColor: 'rgba(0, 255, 255, 0.4)' }}>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2 pt-4 border-t" style={{ borderTopColor: 'rgba(0, 255, 255, 0.2)' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me something..."
          className="neon-input text-sm flex-1"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className="neon-button p-2"
          style={{ opacity: isLoading || !input.trim() ? 0.5 : 1 }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default React.memo(Chatbot);
