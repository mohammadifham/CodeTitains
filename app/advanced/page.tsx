'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/app/components/LiveMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse bg-slate-900/50 rounded-[28px]" />
});
import { useAuth } from '@/lib/auth-context';
import DetectionCard from './components/DetectionCard';
import AlertCard from './components/AlertCard';
import NGOCard from './components/NGOCard';
import RouteCard from './components/RouteCard';
import ResourceCard from './components/ResourceCard';

interface DetectionItem {
  title: string;
  location: string;
  severity: 'High' | 'Medium' | 'Low';
  source: string;
}

interface AlertItem {
  title: string;
  message: string;
  severity: 'Critical' | 'High' | 'Medium';
  timestamp: string;
}

interface NGOItem {
  name: string;
  area: string;
  status: 'Active' | 'En route' | 'Completed';
}

interface RouteItem {
  name: string;
  status: 'Safe' | 'Blocked';
  eta: string;
  coords?: [number, number][];
}

interface ResourceItem {
  name: string;
  location: string;
  availability: 'Available' | 'Limited' | 'Deployed';
}

interface AdvancedData {
  detections: DetectionItem[];
  alerts: AlertItem[];
  ngos: NGOItem[];
  routes: RouteItem[];
  resources: ResourceItem[];
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

interface DashboardDataResponse {
  incidents: IncidentRecord[];
  requests: RequestRecord[];
  resources: ResourceRecord[];
  allocations: Array<Record<string, unknown>>;
}

interface MetricBar {
  label: string;
  value: number;
}

interface NasaEventSummary {
  id: string;
  title: string;
  category: string;
  source: string;
  updated: string | null;
}

interface LiveIntelligenceResponse {
  generated_at: string;
  incident_severity: MetricBar[];
  request_priority: MetricBar[];
  resource_status: MetricBar[];
  nasa_open_events: number;
  nasa_categories: MetricBar[];
  nasa_events: NasaEventSummary[];
  nasa_error: string | null;
}

type RouteStatus = 'Safe' | 'Blocked';

const getCoordinatesFromLabel = (label: string): [number, number] => {
  const hash = [...label].reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0);
  const lat = 40.68 + ((Math.abs(hash) % 140) / 200);
  const lng = -74.02 + (((Math.abs(hash) >> 4) % 140) / 200);
  return [lat, lng];
};

const getNgoStatus = (status: ResourceRecord['status']): NGOItem['status'] =>
  status === 'available' ? 'Active' : status === 'limited' ? 'En route' : 'Completed';

const getRouteStatus = (priority: RequestRecord['priority']): RouteStatus =>
  priority === 'Critical' || priority === 'High' ? 'Blocked' : 'Safe';

const getRouteEta = (index: number): string => `${15 + index * 4} min`;

const apiBase = process.env.NEXT_PUBLIC_CHAT_API_URL ?? 'http://localhost:8000';

function AdvancedPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const getStoredRole = (uid: string): 'admin' | 'user' => {
    if (typeof window === 'undefined') return 'user';
    const role = localStorage.getItem(`disasterhub_user_role_${uid}`);
    return role === 'admin' ? 'admin' : 'user';
  };

  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [data, setData] = useState<AdvancedData>({
    detections: [],
    alerts: [],
    ngos: [],
    routes: [],
    resources: [],
  });
  const [liveMetrics, setLiveMetrics] = useState<LiveIntelligenceResponse>({
    generated_at: '',
    incident_severity: [],
    request_priority: [],
    resource_status: [],
    nasa_open_events: 0,
    nasa_categories: [],
    nasa_events: [],
    nasa_error: null,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }

    if (!loading && user) {
      const role = getStoredRole(user.uid);
      if (role === 'user') {
        router.replace('/user');
      }
    }
  }, [loading, router, user]);

  const fetchAdvancedData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setDataError('');

    try {
      const [dashboardResponse, metricsResponse] = await Promise.all([
        fetch(`${apiBase}/api/dashboard-data`),
        fetch(`${apiBase}/api/live-intelligence`),
      ]);

      if (!dashboardResponse.ok) {
        const errorBody = await dashboardResponse.json().catch(() => null);
        throw new Error(errorBody?.detail || 'Failed to load live dashboard data.');
      }

      if (!metricsResponse.ok) {
        const errorBody = await metricsResponse.json().catch(() => null);
        throw new Error(errorBody?.detail || 'Failed to load live intelligence metrics.');
      }

      const payload = (await dashboardResponse.json()) as DashboardDataResponse;
      const metricsPayload = (await metricsResponse.json()) as LiveIntelligenceResponse;
      const detections = payload.incidents.map((incident) => ({
        title: incident.title,
        location: incident.location || 'Unknown location',
        severity: incident.severity === 'Critical' ? 'High' : incident.severity,
        source: 'Live feed',
      }));

      const alerts = payload.incidents.slice(0, 3).map((incident) => ({
        title: incident.title,
        message: incident.description || `Incident reported at ${incident.location}`,
        severity: incident.severity === 'Low' ? 'Medium' : incident.severity,
        timestamp: new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));

      if (alerts.length === 0) {
        payload.requests.slice(0, 2).forEach((request) => {
          alerts.push({
            title: request.title,
            message: request.description,
            severity: request.priority === 'Low' ? 'Medium' : request.priority,
            timestamp: new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        });
      }

      const ngos = payload.resources.slice(0, 3).map((resource) => ({
        name: resource.name,
        area: resource.category.charAt(0).toUpperCase() + resource.category.slice(1),
        status: getNgoStatus(resource.status),
      }));

      const routes = payload.requests.slice(0, 3).map((request, index) => {
        const incident = payload.incidents[index] ?? payload.incidents[0];
        const resource = payload.resources[index] ?? payload.resources[0];
        return {
          name: `Route ${String.fromCharCode(65 + index)}`,
          status: getRouteStatus(request.priority),
          eta: getRouteEta(index),
          coords: [
            resource ? getCoordinatesFromLabel(resource.name) : getCoordinatesFromLabel(request.title),
            incident ? getCoordinatesFromLabel(incident.location || incident.title) : getCoordinatesFromLabel(request.title),
          ],
        };
      });

      const getAvailability = (status: ResourceRecord['status']): ResourceItem['availability'] =>
        status === 'available' ? 'Available' : status === 'limited' ? 'Limited' : 'Deployed';

      const resources = payload.resources.map((resource) => ({
        name: resource.name,
        location: resource.category,
        availability: getAvailability(resource.status),
      }));

      setData({ detections, alerts, ngos, routes, resources });
      setLiveMetrics(metricsPayload);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to load advanced intelligence data.';
      setDataError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const timeoutId = window.setTimeout(() => {
      void fetchAdvancedData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchAdvancedData, user]);

  const handleRefresh = () => void fetchAdvancedData();

  const detectionCards = useMemo(
    () =>
      data.detections.map((item) => (
        <DetectionCard
          key={item.title + item.location}
          title={item.title}
          location={item.location}
          severity={item.severity}
          source={item.source}
        />
      )),
    [data.detections],
  );

  const alertCards = useMemo(
    () =>
      data.alerts.map((item) => (
        <AlertCard
          key={item.title}
          title={item.title}
          message={item.message}
          severity={item.severity}
          timestamp={item.timestamp}
        />
      )),
    [data.alerts],
  );

  const ngoCards = useMemo(
    () =>
      data.ngos.map((item) => (
        <NGOCard key={item.name} name={item.name} area={item.area} status={item.status} />
      )),
    [data.ngos],
  );

  const routeCards = useMemo(
    () =>
      data.routes.map((item) => (
        <RouteCard key={item.name} name={item.name} status={item.status} eta={item.eta} />
      )),
    [data.routes],
  );

  const resourceCards = useMemo(
    () =>
      data.resources.map((item) => (
        <ResourceCard
          key={item.name}
          name={item.name}
          location={item.location}
          availability={item.availability}
        />
      )),
    [data.resources],
  );

  const maxSeverityValue = useMemo(
    () => Math.max(...liveMetrics.incident_severity.map((item) => item.value), 1),
    [liveMetrics.incident_severity],
  );

  const maxPriorityValue = useMemo(
    () => Math.max(...liveMetrics.request_priority.map((item) => item.value), 1),
    [liveMetrics.request_priority],
  );

  const maxNasaValue = useMemo(
    () => Math.max(...liveMetrics.nasa_categories.map((item) => item.value), 1),
    [liveMetrics.nasa_categories],
  );

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-black text-cyan-300">
        Verifying access...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-80px)] bg-slate-950 text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="mb-6 rounded-[32px] border border-cyan-500/10 bg-slate-950/95 p-6 shadow-[0_35px_80px_rgba(5,15,35,0.55)] backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Advanced Disaster Intelligence</p>
                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-cyan-50 sm:text-4xl">
                  Automatic detection, coordination, and routing simulation
                </h1>
                <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                  A polished operational view for commanding relief teams with live incident insights, satellite visibility,
                  and intelligent route guidance.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-cyan-500/15 bg-white/5 p-4 text-center">
                  <p className="text-sm text-slate-400">Live detections</p>
                  <p className="mt-2 text-3xl font-bold text-cyan-100">{data.detections.length}</p>
                </div>
                <div className="rounded-3xl border border-cyan-500/15 bg-white/5 p-4 text-center">
                  <p className="text-sm text-slate-400">Active alerts</p>
                  <p className="mt-2 text-3xl font-bold text-cyan-100">{data.alerts.length}</p>
                </div>
                <div className="rounded-3xl border border-cyan-500/15 bg-white/5 p-4 text-center">
                  <p className="text-sm text-slate-400">Safe routes</p>
                  <p className="mt-2 text-3xl font-bold text-cyan-100">{data.routes.filter((item) => item.status === 'Safe').length}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="rounded-3xl bg-slate-900/70 px-4 py-3 text-sm text-slate-300 shadow-inner shadow-slate-950/40">
                <span className="font-semibold text-cyan-100">Operational posture:</span> live command center active with satellite-backed analytics.
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Refresh data
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/20 bg-white/5 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-400/40 hover:bg-white/10"
                >
                  Return to dashboard
                </button>
              </div>
            </div>
          </section>

          {dataError ? (
            <div className="mb-6 rounded-3xl border border-red-500/20 bg-red-950/70 p-6 text-red-200 shadow-[0_24px_50px_rgba(189,47,47,0.18)] backdrop-blur-md">
              <strong className="block text-base font-semibold text-red-100">Live data load failed</strong>
              <p className="mt-2 text-sm">{dataError}</p>
            </div>
          ) : null}

          {isLoading ? (
            <div className="mb-6 rounded-3xl border border-cyan-500/20 bg-white/5 p-6 text-cyan-200 shadow-[0_24px_50px_rgba(40,177,255,0.12)] backdrop-blur-md">
              Loading live intelligence data...
            </div>
          ) : (
            <div className="space-y-6">
              <section className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-[28px] border border-cyan-500/10 bg-slate-950/90 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
                  <h3 className="text-lg font-semibold text-cyan-50">Response Pressure Bars</h3>

                  <div className="mt-5 grid gap-5">
                    <div>
                      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-cyan-200">Incident severity</p>
                      <div className="space-y-3">
                        {liveMetrics.incident_severity.map((item) => (
                          <div key={item.label}>
                            <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
                              <span>{item.label}</span>
                              <span>{item.value}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                              <span className="block h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300" style={{ width: `${(item.value / maxSeverityValue) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-cyan-200">Request priority</p>
                      <div className="space-y-3">
                        {liveMetrics.request_priority.map((item) => (
                          <div key={item.label}>
                            <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
                              <span>{item.label}</span>
                              <span>{item.value}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                              <span className="block h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-400" style={{ width: `${(item.value / maxPriorityValue) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-cyan-500/10 bg-slate-950/90 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
                  <h3 className="text-lg font-semibold text-cyan-50">NASA EONET Live Events</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Open events: <span className="font-semibold text-cyan-100">{liveMetrics.nasa_open_events}</span>
                  </p>
                  {liveMetrics.nasa_error ? (
                    <p className="mt-3 rounded-2xl border border-amber-500/25 bg-amber-900/20 px-3 py-2 text-xs text-amber-200">
                      {liveMetrics.nasa_error}
                    </p>
                  ) : null}

                  <div className="mt-5 space-y-3">
                    {liveMetrics.nasa_categories.length ? (
                      liveMetrics.nasa_categories.map((item) => (
                        <div key={item.label}>
                          <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
                            <span>{item.label}</span>
                            <span>{item.value}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <span className="block h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400" style={{ width: `${(item.value / maxNasaValue) * 100}%` }} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">NASA category feed is unavailable right now.</p>
                    )}
                  </div>

                  <div className="mt-5 space-y-2">
                    {liveMetrics.nasa_events.slice(0, 3).map((event) => (
                      <div key={event.id} className="rounded-2xl border border-cyan-500/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                        <p className="font-medium text-cyan-100">{event.title}</p>
                        <p className="mt-1 text-xs text-slate-400">{event.category} · {event.source}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <div className="rounded-[28px] border border-cyan-500/10 bg-slate-950/90 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.4)]">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-cyan-50">Satellite Map & Safe Route</h2>
                      <p className="text-sm text-slate-400">Live satellite imagery and recommended safe corridors for responders.</p>
                    </div>
                    <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                      Powered by NASA satellite data
                    </div>
                  </div>
                  <LiveMap
                    incidents={data.detections.map((det) => ({
                      id: det.title.length,
                      title: det.title,
                      location: det.location,
                      severity: det.severity === 'High' ? 'High' : det.severity === 'Medium' ? 'Medium' : 'Low',
                    }))}
                    resources={data.resources.map((resource, index) => ({
                      id: index,
                      name: resource.name,
                      category: resource.location as ResourceRecord['category'],
                      available_units: 1,
                      total_units: 1,
                      status:
                        resource.availability === 'Available'
                          ? 'available'
                          : resource.availability === 'Limited'
                          ? 'limited'
                          : 'depleted',
                    }))}
                    route={data.routes.find((route) => route.status === 'Safe') ?? data.routes[0]}
                  />
                </div>

                <div className="grid gap-6">
                  <div className="rounded-[28px] border border-cyan-500/10 bg-slate-950/90 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
                    <h3 className="text-lg font-semibold text-cyan-50">Current Route Status</h3>
                    <p className="mt-2 text-sm text-slate-400">Overview of corridor risk and recommended passage.</p>
                    <div className="mt-5 space-y-4">
                      {data.routes.slice(0, 3).map((route) => (
                        <div key={route.name} className="rounded-3xl border border-cyan-500/10 bg-white/5 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-cyan-100">{route.name}</p>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                              route.status === 'Safe' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                            }`}>
                              {route.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-400">ETA: {route.eta}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-cyan-500/10 bg-slate-950/90 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
                    <h3 className="text-lg font-semibold text-cyan-50">Data Summary</h3>
                    <div className="mt-4 grid gap-3 text-sm text-slate-300">
                      <div className="rounded-3xl bg-white/5 p-4">Incident feeds: <span className="font-semibold text-cyan-100">{data.detections.length}</span></div>
                      <div className="rounded-3xl bg-white/5 p-4">Alert buffers: <span className="font-semibold text-cyan-100">{data.alerts.length}</span></div>
                      <div className="rounded-3xl bg-white/5 p-4">Resource clusters: <span className="font-semibold text-cyan-100">{data.ngos.length}</span></div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-[28px] border border-cyan-500/10 bg-slate-950/90 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
                  <h3 className="text-lg font-semibold text-cyan-50">Disaster Detection</h3>
                  <p className="mt-2 text-sm text-slate-400">Automatic identification from weather, seismic, and satellite feeds.</p>
                  <div className="mt-4 space-y-3">{detectionCards}</div>
                </div>
                <div className="rounded-[28px] border border-cyan-500/10 bg-slate-950/90 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
                  <h3 className="text-lg font-semibold text-cyan-50">Alert System</h3>
                  <p className="mt-2 text-sm text-slate-400">High-priority warnings generated from active feeds.</p>
                  <div className="mt-4 space-y-3">{alertCards}</div>
                </div>
                <div className="rounded-[28px] border border-cyan-500/10 bg-slate-950/90 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
                  <h3 className="text-lg font-semibold text-cyan-50">Resource Coordination</h3>
                  <p className="mt-2 text-sm text-slate-400">NGOs and response teams prioritized for deployment.</p>
                  <div className="mt-4 space-y-3">{ngoCards}</div>
                </div>
              </section>

              <section className="grid gap-6 md:grid-cols-2">
                <div className="rounded-[28px] border border-cyan-500/10 bg-slate-950/90 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
                  <h3 className="text-lg font-semibold text-cyan-50">Safe Route Generation</h3>
                  <p className="mt-2 text-sm text-slate-400">Route risk evaluation with safe and blocked corridors.</p>
                  <div className="mt-4 space-y-3">{routeCards}</div>
                </div>
                <div className="rounded-[28px] border border-cyan-500/10 bg-slate-950/90 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
                  <h3 className="text-lg font-semibold text-cyan-50">Resource Availability</h3>
                  <p className="mt-2 text-sm text-slate-400">Availability view for rescue teams, ambulances, and food units.</p>
                  <div className="mt-4 space-y-3">{resourceCards}</div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default React.memo(AdvancedPage);
