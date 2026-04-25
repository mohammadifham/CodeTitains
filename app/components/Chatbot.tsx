'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const apiBase = process.env.NEXT_PUBLIC_CHAT_API_URL ?? 'http://localhost:8000';

export const Chatbot: React.FC = () => {
  const { user, loading } = useAuth();
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
  const [sessionId, setSessionId] = useState('');
  const [historyLoadedSession, setHistoryLoadedSession] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const storedSessionId = window.localStorage.getItem('drs_chat_session_id') || '';
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);

  useEffect(() => {
    if (!user || !sessionId || historyLoadedSession === sessionId) return;

    const loadHistory = async () => {
      try {
        const response = await fetch(
          `${apiBase}/api/chat/history?session_id=${encodeURIComponent(sessionId)}`,
        );

        if (!response.ok) {
          setHistoryLoadedSession(sessionId);
          return;
        }

        const payload = await response.json();
        const history = payload.messages.map((item: { role: string; content: string }, index: number) => ({
          id: `${Date.now()}-${index}`,
          sender: item.role === 'assistant' ? 'bot' : 'user',
          text: item.content,
          timestamp: new Date(),
        }));

        if (history.length > 0) {
          setMessages(history);
        }
      } catch {
        // ignore history load failure and continue
      } finally {
        setHistoryLoadedSession(sessionId);
      }
    };

    void loadHistory();
  }, [historyLoadedSession, sessionId, user]);

  const handleSendMessage = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading || !user) return;

    setError('');
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmedInput,
      timestamp: new Date(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    const historyPayload = nextMessages.slice(-12).map((msg) => ({
      role: msg.sender === 'bot' ? 'assistant' : 'user',
      content: msg.text,
    }));

    try {
      const response = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedInput,
          history: historyPayload,
          session_id: sessionId || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Backend chat request failed.');
      }

      const payload = (await response.json()) as { reply?: string; session_id?: string };
      const botReply = payload.reply?.trim() || 'No response received from assistant.';

      if (payload.session_id?.trim()) {
        const normalizedId = payload.session_id.trim();
        window.localStorage.setItem('drs_chat_session_id', normalizedId);
        setSessionId(normalizedId);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: botReply,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setError('Failed to contact AI backend. Check the backend server and environment settings.');
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'I could not reach the AI backend. Please verify the backend server and API key setup.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, sessionId, user]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  if (loading) {
    return <div className="neon-card p-4">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="neon-card p-4">
        <p className="text-sm text-cyan-200">Please sign in to use the AI chatbot.</p>
      </div>
    );
  }

  return (
    <div className="neon-card h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b" style={{ borderBottomColor: 'rgba(0, 255, 255, 0.2)' }}>
        <MessageCircle size={20} className="text-purple-400" />
        <div>
          <h2 className="text-lg font-bold text-cyan-400">AI Assistant</h2>
          <p className="text-xs text-cyan-200">Live backend conversation powered by Mistral.</p>
        </div>
      </div>

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
                borderColor: message.sender === 'user' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(0, 255, 255, 0.4)',
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

      {error ? <p className="text-sm text-red-300 mb-3">{error}</p> : null}

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
          onClick={() => void handleSendMessage()}
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
