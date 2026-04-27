'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Radio, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [sessionId, setSessionId] = useState(() =>
    typeof window !== 'undefined' ? window.localStorage.getItem('drs_chat_session_id') || '' : '',
  );
  const [historyLoadedSession, setHistoryLoadedSession] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    return <div className="neon-card p-4 text-sm text-cyan-100">Loading command assistant...</div>;
  }

  if (!user) {
    return (
      <div className="neon-card p-4">
        <p className="text-sm text-cyan-200">Please sign in to use the operations assistant.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 bg-slate-950/80 backdrop-blur-2xl">
      <div className="mb-4 flex items-center justify-between border-b border-cyan-500/30 pb-3 shadow-[0_4px_20px_-10px_rgba(34,211,238,0.3)]">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <Radio size={20} className="animate-pulse" />
          </span>
          <div>
            <h2 className="text-base font-bold uppercase tracking-[0.2em] text-cyan-50">Ops Assistant</h2>
            <p className="text-[10px] uppercase tracking-wider text-cyan-400/80 font-[family-name:var(--font-geist-mono)]">Encrypted Channel Open</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-md backdrop-blur-sm ${
                  message.sender === 'user'
                    ? 'border border-blue-500/40 bg-blue-600/20 text-blue-50 rounded-br-sm'
                    : 'border border-cyan-500/40 bg-cyan-600/10 text-cyan-50 rounded-bl-sm shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                }`}
              >
                {message.text}
                <div className={`mt-1.5 text-[10px] font-[family-name:var(--font-geist-mono)] ${message.sender === 'user' ? 'text-blue-300/70 text-right' : 'text-cyan-400/70'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-cyan-500/40 bg-cyan-600/10 px-5 py-4 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error ? <p className="mb-3 text-xs text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20">{error}</p> : null}

      <div className="flex gap-2 border-t border-cyan-500/30 pt-4 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Transmit message..."
          className="neon-input flex-1 text-sm bg-slate-900/80 rounded-xl"
          disabled={isLoading}
        />
        <button
          onClick={() => void handleSendMessage()}
          disabled={isLoading || !input.trim()}
          className="neon-button-primary rounded-xl px-4 py-2 flex items-center justify-center transition-transform active:scale-95"
          style={{ opacity: isLoading || !input.trim() ? 0.5 : 1 }}
        >
          <Send size={18} className={input.trim() ? 'animate-pulse' : ''} />
        </button>
      </div>
    </div>
  );
};

export default React.memo(Chatbot);
