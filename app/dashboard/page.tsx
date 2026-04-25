'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import { useAuth } from '@/lib/auth-context';
import { AlertTriangle, Bot, MapPinned, Package, Plus, SendHorizontal } from 'lucide-react';
import styles from './dashboard.module.css';

interface Message {
  id: number;
  sender: 'bot' | 'user';
  text: string;
}

interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

interface IncidentRecord {
  id: number;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  status: 'active' | 'monitoring' | 'resolved';
  location: string;
  created_at: string;
}

interface RequestRecord {
  id: number;
  title: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  status: 'open' | 'in_progress' | 'fulfilled';
  created_at: string;
}

interface ResourceRecord {
  id: number;
  name: string;
  category: 'medical' | 'rescue' | 'food' | 'transport' | 'team' | 'other';
  available_units: number;
  total_units: number;
  status: 'available' | 'limited' | 'depleted';
  created_at: string;
}

interface AllocationRecord {
  id: number;
  resource_id: number;
  request_id: number;
  units: number;
  status: 'pending' | 'in_transit' | 'completed';
  created_at: string;
}

interface DashboardStats {
  active_incidents: number;
  open_requests: number;
  response_sla: string;
  teams_deployed: string;
}

interface DashboardDataResponse {
  stats: DashboardStats;
  incidents: IncidentRecord[];
  requests: RequestRecord[];
  resources: ResourceRecord[];
  allocations: AllocationRecord[];
}

const apiBase = process.env.NEXT_PUBLIC_CHAT_API_URL ?? 'http://localhost:8000';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string>('');
  const [chatHistoryLoadedSession, setChatHistoryLoadedSession] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello Commander. I can help with dispatch priorities, resource balancing, and immediate response actions.',
    },
  ]);
  const [stats, setStats] = useState<DashboardStats>({
    active_incidents: 0,
    open_requests: 0,
    response_sla: '0%',
    teams_deployed: '0/0',
  });
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [allocations, setAllocations] = useState<AllocationRecord[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [allocation, setAllocation] = useState({ resourceId: '', requestId: '', units: 1 });

  const requestMap = useMemo(
    () => new Map(requests.map((item) => [item.id, item.title])),
    [requests],
  );

  const resourceMap = useMemo(
    () => new Map(resources.map((item) => [item.id, item.name])),
    [resources],
  );

  const statsCards = useMemo(
    () => [
      { label: 'Active incidents', value: String(stats.active_incidents) },
      { label: 'Open requests', value: String(stats.open_requests) },
      { label: 'Response SLA', value: stats.response_sla },
      { label: 'Teams deployed', value: stats.teams_deployed },
    ],
    [stats],
  );

  const allocationHistory = useMemo(
    () =>
      allocations.slice(0, 5).map((entry) => {
        const resourceName = resourceMap.get(entry.resource_id) ?? `Resource #${entry.resource_id}`;
        const requestTitle = requestMap.get(entry.request_id) ?? `Request #${entry.request_id}`;
        return `${entry.units} units of ${resourceName} assigned to ${requestTitle} | ${entry.status}`;
      }),
    [allocations, requestMap, resourceMap],
  );

  const goToAdvancedIntelligence = () => {
    router.push('/advanced');
  };

  useEffect(() => {
    const existingSessionId = window.localStorage.getItem('drs_chat_session_id') || '';
    if (existingSessionId) {
      setChatSessionId(existingSessionId);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, router, user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoadingData(true);
      setDataError('');
      const response = await fetch(`${apiBase}/api/dashboard-data`);
      if (!response.ok) {
        throw new Error('Failed to load dashboard data.');
      }

      const payload = (await response.json()) as DashboardDataResponse;
      setStats(payload.stats);
      setIncidents(payload.incidents);
      setRequests(payload.requests);
      setResources(payload.resources);
      setAllocations(payload.allocations);
    } catch {
      setDataError('Could not load live dashboard data. Check backend and Supabase tables.');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, [user]);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!chatSessionId || chatHistoryLoadedSession === chatSessionId) return;

      try {
        const response = await fetch(
          `${apiBase}/api/chat/history?session_id=${encodeURIComponent(chatSessionId)}`,
        );
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          session_id: string;
          messages: ChatHistoryItem[];
        };

        if (!payload.messages.length) {
          setChatHistoryLoadedSession(chatSessionId);
          return;
        }

        setMessages(
          payload.messages.map((item, index) => ({
            id: Date.now() + index,
            sender: item.role === 'assistant' ? 'bot' : 'user',
            text: item.content,
          })),
        );
        setChatHistoryLoadedSession(chatSessionId);
      } catch {
        setChatHistoryLoadedSession(chatSessionId);
      }
    };

    void loadChatHistory();
  }, [chatHistoryLoadedSession, chatSessionId]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-cyan-300 grid place-items-center">
        Verifying access...
      </div>
    );
  }

  const handleSend = async () => {
    if (isSending) return;
    const input = chatInput.trim();
    if (!input) return;

    const historyPayload: ChatHistoryItem[] = messages.slice(-12).map((msg) => ({
      role: msg.sender === 'bot' ? 'assistant' : 'user',
      content: msg.text,
    }));

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatInput('');

    try {
      setIsSending(true);
      const response = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: historyPayload, session_id: chatSessionId || undefined }),
      });

      if (!response.ok) {
        throw new Error('Backend chat request failed.');
      }

      const data = (await response.json()) as { reply?: string; session_id?: string };
      const botReply = data.reply?.trim() || 'No response received from assistant.';
      const receivedSessionId = data.session_id?.trim();

      if (receivedSessionId && receivedSessionId !== chatSessionId) {
        setChatSessionId(receivedSessionId);
        window.localStorage.setItem('drs_chat_session_id', receivedSessionId);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botReply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'I could not reach the AI backend. Please verify the backend server and API key setup.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleAllocate = () => {
    const createAllocation = async () => {
      const resourceId = Number(allocation.resourceId);
      const requestId = Number(allocation.requestId);
      if (!resourceId || !requestId) return;

      try {
        const response = await fetch(`${apiBase}/api/allocations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resource_id: resourceId,
            request_id: requestId,
            units: allocation.units,
            status: 'pending',
          }),
        });
        if (!response.ok) {
          throw new Error('Allocation failed');
        }

        setAllocation({ resourceId: '', requestId: '', units: 1 });
        await loadDashboardData();
      } catch {
        setDataError('Could not create allocation. Verify resources/requests tables in Supabase.');
      }
    };

    void createAllocation();
  };

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>Emergency Operations Dashboard</h1>
              <p className={styles.subtitle}>
                Live disaster intelligence, coordinated resource deployment, and AI-assisted decision support.
              </p>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.secondaryBtn} type="button" onClick={goToAdvancedIntelligence}>
                Advanced Disaster Intelligence
              </button>
              <button className={styles.newBtn}>
                <Plus size={15} /> Create New Mission
              </button>
            </div>
          </header>

          <section className={styles.stats}>
            {statsCards.map((item) => (
              <article key={item.label} className={styles.statCard}>
                <p className={styles.statValue}>{item.value}</p>
                <p className={styles.statLabel}>{item.label}</p>
              </article>
            ))}
          </section>

          {dataError ? <p className={styles.subtitle}>{dataError}</p> : null}
          {isLoadingData ? <p className={styles.subtitle}>Loading live dashboard data...</p> : null}

          <section className={styles.grid}>
            <article className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h2 className={styles.cardTitle}>Interactive Incident Map</h2>
                  <p className={styles.cardSub}>Current hotspots and active operation zones</p>
                </div>
                <MapPinned size={16} color="#85f8ff" />
              </div>
              <div className={styles.mapBody}>
                <div className={styles.mapPlaceholder}>
                  <span className={styles.mapTag}>
                    <AlertTriangle size={13} /> {incidents.length} active zones in feed
                  </span>
                  <div className={styles.zoneList}>
                    {incidents.map((incident) => (
                      <div className={styles.zoneItem} key={incident.id}>
                        <p className={styles.zoneTop}>
                          <span>{incident.title}</span>
                          <span className={incident.severity === 'Critical' ? styles.badgeHigh : styles.badgeMed}>
                            {incident.severity}
                          </span>
                        </p>
                        <p className={styles.zoneDesc}>{incident.description} ({incident.location})</p>
                      </div>
                    ))}
                    {!incidents.length ? <p className={styles.zoneDesc}>No incidents available in database.</p> : null}
                  </div>
                </div>
              </div>
            </article>

            <article className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h2 className={styles.cardTitle}>Live Requests & Resources</h2>
                  <p className={styles.cardSub}>Priority queue from command center</p>
                </div>
                <Package size={16} color="#85f8ff" />
              </div>
              <div className={styles.sideBody}>
                {requests.map((req) => (
                  <div className={styles.feedItem} key={req.id}>
                    <p className={styles.feedTitle}>{req.title}</p>
                    <p className={styles.feedMeta}>{req.priority} priority • {req.status}</p>
                  </div>
                ))}
                {!requests.length ? <p className={styles.feedMeta}>No request data found in database.</p> : null}
              </div>
            </article>
          </section>

          <section className={styles.bottomGrid}>
            <article className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h2 className={styles.cardTitle}>Resource Allocation</h2>
                  <p className={styles.cardSub}>Assign units and dispatch quickly</p>
                </div>
              </div>
              <div className={styles.formBody}>
                <div className={styles.inputGrid}>
                  <select
                    className={styles.select}
                    value={allocation.resourceId}
                    onChange={(e) => setAllocation((prev) => ({ ...prev, resourceId: e.target.value }))}
                  >
                    <option value="">Select resource</option>
                    {resources.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.available_units}/{item.total_units})
                      </option>
                    ))}
                  </select>
                  <select
                    className={styles.select}
                    value={allocation.requestId}
                    onChange={(e) => setAllocation((prev) => ({ ...prev, requestId: e.target.value }))}
                  >
                    <option value="">Select request</option>
                    {requests.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                  <select
                    className={styles.select}
                    value={allocation.units}
                    onChange={(e) => setAllocation((prev) => ({ ...prev, units: Number(e.target.value) }))}
                  >
                    {[1, 2, 3, 4, 5, 10, 15, 20].map((u) => (
                      <option value={u} key={u}>
                        {u} units
                      </option>
                    ))}
                  </select>
                </div>
                <button className={styles.allocateBtn} onClick={handleAllocate}>
                  Allocate Resources
                </button>

                <div className={styles.allocList}>
                  {allocationHistory.map((entry) => (
                    <div className={styles.allocItem} key={entry}>
                      {entry}
                    </div>
                  ))}
                  {!allocationHistory.length ? (
                    <div className={styles.allocItem}>No allocations yet. Create one to see live history.</div>
                  ) : null}
                </div>
              </div>
            </article>
          </section>

          <div className={styles.chatLauncherWrap}>
            <button
              className={styles.chatLauncher}
              onClick={() => setChatOpen((prev) => !prev)}
              type="button"
              aria-label="Open chatbot"
            >
              <Bot size={18} />
            </button>

            {chatOpen && (
              <aside className={styles.chatPopup}>
                <div className={styles.chatHeader}>
                  <div className={styles.chatHeaderLeft}>
                    <div className={styles.chatBotIcon}>
                      <Bot size={15} />
                    </div>
                    <div>
                      <h3 className={styles.chatTitle}>AI Command Assistant</h3>
                      <p className={styles.chatStatus}>Online</p>
                    </div>
                  </div>
                </div>

                <div className={styles.chatWrap}>
                  <div className={styles.chatBody}>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`${styles.msg} ${msg.sender === 'bot' ? styles.msgBot : styles.msgUser}`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>
                  <div className={styles.chatInputRow}>
                    <input
                      className={styles.input}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask a question..."
                      disabled={isSending}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend();
                      }}
                    />
                    <button className={styles.sendBtn} onClick={handleSend} type="button" disabled={isSending}>
                      <SendHorizontal size={15} />
                    </button>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
