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
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Check if backend is available
    const checkBackend = async () => {
      try {
        console.log(`[Chatbot] Checking backend health at: ${apiBase}/health`);
        const response = await fetch(`${apiBase}/health`, { signal: AbortSignal.timeout(3000) });
        setBackendAvailable(response.ok);
        console.log(`[Chatbot] Backend health check: ${response.ok}`);
      } catch (err) {
        console.error('[Chatbot] Backend health check failed:', err);
        setBackendAvailable(false);
      }
    };
    checkBackend();
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

    if (!backendAvailable) {
      setError('Backend service is not available. Please check NEXT_PUBLIC_CHAT_API_URL in your environment variables.');
      return;
    }

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
        setBackendAvailable(false);
        throw new Error('Backend chat request failed. Service may be down.');
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
      setError('Failed to contact AI backend. Ensure the backend service is running and NEXT_PUBLIC_CHAT_API_URL is set correctly.');
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'I could not reach the AI backend. Please verify the backend server and API configuration.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, sessionId, user, backendAvailable]);

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

  if (renderError) {
    return (
      <div className="h-full flex flex-col p-4 bg-slate-950/80 backdrop-blur-2xl justify-center items-center gap-3">
        <div className="text-center">
          <p className="text-sm text-red-300 font-semibold mb-2">⚠️ Render Error</p>
          <p className="text-xs text-red-200/70">{renderError}</p>
          <button 
            onClick={() => setRenderError(null)}
            className="mt-3 px-3 py-1 text-xs bg-red-500/20 border border-red-400 text-red-300 rounded hover:bg-red-500/30"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!backendAvailable) {
    return (
      <div className="h-full flex flex-col p-4 bg-slate-950/80 backdrop-blur-2xl justify-center items-center gap-3">
        <div className="text-center">
          <p className="text-sm text-yellow-300 font-semibold mb-2">⚠️ Service Unavailable</p>
          <p className="text-xs text-yellow-200/70">The chat backend is not currently available.</p>
          <p className="text-xs text-yellow-200/70 mt-1">Check that:</p>
          <ul className="text-xs text-yellow-200/50 mt-2 space-y-1 text-left">
            <li>✓ Backend service is running</li>
            <li>✓ NEXT_PUBLIC_CHAT_API_URL is configured</li>
            <li>✓ Backend API URL is correct: {apiBase}</li>
          </ul>
        </div>
      </div>
    );
  }

  try {
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
  } catch (err) {
    console.error('Chatbot render error:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
    setRenderError(errorMsg);
    return (
      <div className="h-full flex flex-col p-4 bg-slate-950/80 backdrop-blur-2xl justify-center items-center gap-3">
        <div className="text-center">
          <p className="text-sm text-red-300 font-semibold mb-2">⚠️ Error</p>
          <p className="text-xs text-red-200/70">{errorMsg}</p>
        </div>
      </div>
    );
  }
};

export default React.memo(Chatbot);
