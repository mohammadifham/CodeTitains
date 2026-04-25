'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Chatbot from '@/app/components/Chatbot';
import LiveMap from '@/app/components/LiveMap';
import { useAuth } from '@/lib/auth-context';
import { AlertTriangle, Bot, MapPinned, Package, Plus } from 'lucide-react';
import styles from './dashboard.module.css';

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

const getCoordinatesFromLabel = (value: string): [number, number] => {
  const hash = [...value].reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0);
  const lat = 40.68 + ((Math.abs(hash) % 140) / 200);
  const lng = -74.02 + (((Math.abs(hash) >> 4) % 140) / 200);
  return [lat, lng];
};

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
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');
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
        const errorBody = await response.json().catch(() => null);
        const message = errorBody?.detail || 'Failed to load dashboard data.';
        throw new Error(message);
      }

      const payload = (await response.json()) as DashboardDataResponse;
      setStats(payload.stats);
      setIncidents(payload.incidents);
      setRequests(payload.requests);
      setResources(payload.resources);
      setAllocations(payload.allocations);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not load live dashboard data. Check backend and Supabase tables.';
      setDataError(message);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-cyan-300 grid place-items-center">
        Verifying access...
      </div>
    );
  }

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

          {dataError ? <div className={styles.alertCard}>{dataError}</div> : null}
          {isLoadingData ? <div className={styles.infoCard}>Loading live dashboard data...</div> : null}

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
                <LiveMap
                  incidents={incidents}
                  resources={resources}
                  route={
                    incidents.length && resources.length
                      ? {
                          name: 'Priority Response',
                          status: incidents.some((incident) => incident.severity === 'Critical' || incident.severity === 'High')
                            ? 'Blocked'
                            : 'Safe',
                          eta: '18 min',
                          coords: [
                            getCoordinatesFromLabel(resources[0].name),
                            getCoordinatesFromLabel(incidents[0].location),
                          ],
                        }
                      : undefined
                  }
                />
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
                {requests.length ? (
                  requests.map((req) => (
                    <div className={styles.feedItem} key={req.id}>
                      <p className={styles.feedTitle}>{req.title}</p>
                      <p className={styles.feedMeta}>{req.priority} priority • {req.status}</p>
                    </div>
                  ))
                ) : (
                  <p className={styles.feedMeta}>No request data found in database.</p>
                )}
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
                <Chatbot />
              </aside>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
