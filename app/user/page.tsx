'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/app/components/Navbar';
import { useAuth } from '@/lib/auth-context';
import styles from '@/app/dashboard/dashboard.module.css';
import { AlertTriangle, MapPinned, Package } from 'lucide-react';

const LiveMap = dynamic(() => import('@/app/components/LiveMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse bg-slate-900/50 rounded-2xl" />,
});

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

interface DashboardDataResponse {
  incidents: IncidentRecord[];
  requests: RequestRecord[];
  resources: ResourceRecord[];
}

const apiBase = process.env.NEXT_PUBLIC_CHAT_API_URL ?? 'http://localhost:8000';

export default function UserPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [resources, setResources] = useState<ResourceRecord[]>([]);

  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    priority: 'High' as RequestRecord['priority'],
  });

  const criticalAlerts = useMemo(
    () => incidents.filter((i) => i.severity === 'Critical' || i.severity === 'High'),
    [incidents],
  );

  const sortedRequests = useMemo(
    () =>
      [...requests].sort((a, b) => {
        const aTime = Date.parse(a.created_at || '');
        const bTime = Date.parse(b.created_at || '');

        if (Number.isNaN(aTime) && Number.isNaN(bTime)) return b.id - a.id;
        if (Number.isNaN(aTime)) return 1;
        if (Number.isNaN(bTime)) return -1;
        return bTime - aTime;
      }),
    [requests],
  );

  const statusProgress = (status: RequestRecord['status']) => {
    if (status === 'fulfilled') return 100;
    if (status === 'in_progress') return 60;
    return 20;
  };

  const statusLabel = (status: RequestRecord['status']) => {
    if (status === 'fulfilled') return 'Completed';
    if (status === 'in_progress') return 'In progress';
    return 'Received';
  };

  const statusHint = (status: RequestRecord['status']) => {
    if (status === 'fulfilled') return 'Help has been delivered.';
    if (status === 'in_progress') return 'Response team is handling your request.';
    return 'Request received and waiting for assignment.';
  };

  const formatCreatedAt = (value: string) => {
    const parsed = Date.parse(value || '');
    if (Number.isNaN(parsed)) return 'Just now';
    return new Date(parsed).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/user');
    }
  }, [loading, router, user]);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoadingData(true);
      setDataError('');

      const response = await fetch(`${apiBase}/api/dashboard-data`);
      if (!response.ok) {
        throw new Error('Failed to load user data');
      }

      const payload = (await response.json()) as DashboardDataResponse;
      setIncidents(payload.incidents ?? []);
      setRequests(payload.requests ?? []);
      setResources(payload.resources ?? []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not load data';
      setDataError(message);
    } finally {
      setIsLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void loadData();
  }, [loadData, user]);

  useEffect(() => {
    if (!user) return;

    const intervalId = window.setInterval(() => {
      void loadData();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [loadData, user]);

  const handleSubmitRequest = async () => {
    if (!requestForm.title.trim() || !requestForm.description.trim()) {
      setDataError('Please fill all request fields.');
      return;
    }

    try {
      setDataError('');
      setSubmitMessage('');
      const response = await fetch(`${apiBase}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: requestForm.title.trim(),
          priority: requestForm.priority,
          description: requestForm.description.trim(),
          status: 'open',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      const created = (await response.json()) as RequestRecord;
      setRequests((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);

      setRequestForm({ title: '', description: '', priority: 'High' });
      setSubmitMessage('Request submitted. Tracking has started and updates refresh automatically.');
      await loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not submit request';
      setDataError(message);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-cyan-300 grid place-items-center">Verifying access...</div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-slate-950 text-cyan-300 grid place-items-center">Redirecting to sign in...</div>;
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>User Emergency Portal</h1>
              <p className={styles.subtitle}>
                See alerts near you, request emergency help, and track request status.
              </p>
            </div>
          </header>

          {dataError ? <div className={styles.alertCard}>{dataError}</div> : null}
          {submitMessage ? <div className={styles.infoCard}>{submitMessage}</div> : null}
          {isLoadingData ? <div className={styles.infoCard}>Loading user data...</div> : null}

          <section className={styles.stats}>
            <article className={styles.statCard}>
              <p className={styles.statValue}>{criticalAlerts.length}</p>
              <p className={styles.statLabel}>Critical Alerts Nearby</p>
            </article>
            <article className={styles.statCard}>
              <p className={styles.statValue}>{resources.filter((r) => r.status === 'available').length}</p>
              <p className={styles.statLabel}>Available Resources</p>
            </article>
            <article className={styles.statCard}>
              <p className={styles.statValue}>{sortedRequests.filter((r) => r.status === 'open').length}</p>
              <p className={styles.statLabel}>Open Requests</p>
            </article>
            <article className={styles.statCard}>
              <p className={styles.statValue}>{sortedRequests.filter((r) => r.status === 'fulfilled').length}</p>
              <p className={styles.statLabel}>Fulfilled Requests</p>
            </article>
          </section>

          <section className={styles.grid}>
            <article className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h2 className={styles.cardTitle}>Live Emergency Map</h2>
                  <p className={styles.cardSub}>Incidents and response resources around your area</p>
                </div>
                <MapPinned size={16} color="#85f8ff" />
              </div>
              <div className={styles.mapBody}>
                <LiveMap incidents={incidents} resources={resources} />
              </div>
            </article>

            <article className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h2 className={styles.cardTitle}>Nearby Alerts</h2>
                  <p className={styles.cardSub}>Highest-priority incidents first</p>
                </div>
                <AlertTriangle size={16} color="#85f8ff" />
              </div>
              <div className={styles.sideBody}>
                {criticalAlerts.length ? (
                  criticalAlerts.slice(0, 8).map((item) => (
                    <div className={styles.feedItem} key={item.id}>
                      <p className={styles.feedTitle}>{item.title}</p>
                      <p className={styles.feedMeta}>
                        {item.severity} • {item.location}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className={styles.feedMeta}>No critical alerts right now.</p>
                )}
              </div>
            </article>
          </section>

          <section className={styles.bottomGrid}>
            <article className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h2 className={styles.cardTitle}>Request Help</h2>
                  <p className={styles.cardSub}>Submit what you need and track progress below</p>
                </div>
                <Package size={16} color="#85f8ff" />
              </div>
              <div className={styles.formBody}>
                <div className={styles.inputGrid}>
                  <input
                    className={styles.input}
                    placeholder="Request title"
                    value={requestForm.title}
                    onChange={(e) => setRequestForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                  <textarea
                    className={styles.input}
                    rows={3}
                    placeholder="Describe your emergency need"
                    value={requestForm.description}
                    onChange={(e) => setRequestForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                  <select
                    className={styles.select}
                    value={requestForm.priority}
                    onChange={(e) =>
                      setRequestForm((prev) => ({
                        ...prev,
                        priority: e.target.value as RequestRecord['priority'],
                      }))
                    }
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <button className={styles.allocateBtn} onClick={handleSubmitRequest}>
                  Submit Request
                </button>

                <div className={styles.allocList}>
                  {sortedRequests.slice(0, 6).map((r) => (
                    <div className={styles.allocItem} key={r.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-cyan-100">#{r.id} {r.title}</span>
                        <span className="text-xs text-slate-300">{formatCreatedAt(r.created_at)}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-300">Priority: {r.priority} · {statusLabel(r.status)}</p>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
                          style={{ width: `${statusProgress(r.status)}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-400">{statusHint(r.status)}</p>
                    </div>
                  ))}
                  {!sortedRequests.length ? <div className={styles.allocItem}>No request history yet.</div> : null}
                </div>
              </div>
            </article>
          </section>
        </div>
      </div>
    </>
  );
}
