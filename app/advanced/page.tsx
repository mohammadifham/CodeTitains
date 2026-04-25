'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
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

const mockAdvancedData: AdvancedData = {
  detections: [
    { title: 'Flood', location: 'Whitefield', severity: 'High', source: 'Weather API' },
    { title: 'Earthquake', location: 'Delhi', severity: 'Medium', source: 'Seismic API' },
    { title: 'Landslide', location: 'Himachal', severity: 'High', source: 'Satellite' },
  ],
  alerts: [
    {
      title: 'Flood detected in Whitefield',
      message: 'Water rise confirmed from weather and sensor feeds.',
      severity: 'Critical',
      timestamp: '2 min ago',
    },
    {
      title: 'Evacuate immediately',
      message: 'Emergency lanes opened and shelter coordination started.',
      severity: 'High',
      timestamp: 'Just now',
    },
  ],
  ngos: [
    { name: 'NDRF Unit 4', area: 'Whitefield North', status: 'Active' },
    { name: 'Red Cross Relief', area: 'Central Assembly Point', status: 'En route' },
    { name: 'Local Fire Authority', area: 'Outer Ring Road', status: 'Completed' },
  ],
  routes: [
    { name: 'Route A', status: 'Blocked', eta: '18 min' },
    { name: 'Route B', status: 'Safe', eta: '15 min' },
    { name: 'Route C', status: 'Safe', eta: '22 min' },
  ],
  resources: [
    { name: 'Rescue Teams', location: 'Command Post 1', availability: 'Available' },
    { name: 'Ambulances', location: 'Medical Hub South', availability: 'Limited' },
    { name: 'Food Supply Units', location: 'Warehouse Zone 3', availability: 'Deployed' },
  ],
};

function AdvancedPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AdvancedData>({
    detections: [],
    alerts: [],
    ngos: [],
    routes: [],
    resources: [],
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, router, user]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) return;
      setData(mockAdvancedData);
      setIsLoading(false);
    }, 420);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

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
      <main className="min-h-[calc(100vh-80px)] bg-black text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6 shadow-[0_0_30px_rgba(0,255,255,0.08)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Advanced Disaster Intelligence</p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-cyan-50 sm:text-4xl">
                  Automatic detection, coordination, and routing simulation
                </h1>
                <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
                  This module runs without user input. Mock APIs simulate live disaster feeds, route risk scoring,
                  authority coordination, and availability checks for response teams.
                </p>
              </div>
              <div className="grid gap-3 rounded-2xl border border-cyan-500/20 bg-white/5 px-4 py-3 text-sm backdrop-blur-md sm:grid-cols-3">
                <div>
                  <p className="text-slate-400">Auto detections</p>
                  <p className="mt-1 text-lg font-bold text-cyan-100">{data.detections.length}</p>
                </div>
                <div>
                  <p className="text-slate-400">Active alerts</p>
                  <p className="mt-1 text-lg font-bold text-cyan-100">{data.alerts.length}</p>
                </div>
                <div>
                  <p className="text-slate-400">Safe routes</p>
                  <p className="mt-1 text-lg font-bold text-cyan-100">{data.routes.filter((item) => item.status === 'Safe').length}</p>
                </div>
              </div>
            </div>
          </section>

          {isLoading ? (
            <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-white/5 p-6 text-cyan-200 backdrop-blur-md">
              Loading simulated intelligence feeds...
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <section>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-cyan-50">Disaster Detection</h2>
                    <p className="text-sm text-slate-400">Automatic identification from Weather, Seismic, and Satellite feeds.</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">{detectionCards}</div>
              </section>

              <section>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-cyan-50">Alert System</h2>
                  <p className="text-sm text-slate-400">High-priority warnings generated from active feeds.</p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">{alertCards}</div>
              </section>

              <section>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-cyan-50">NGO + Authority Coordination</h2>
                  <p className="text-sm text-slate-400">Operational teams and NGOs synced to active zones.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">{ngoCards}</div>
              </section>

              <section>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-cyan-50">Safe Route Generation</h2>
                  <p className="text-sm text-slate-400">Route risk evaluation with safe and blocked corridors.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">{routeCards}</div>
              </section>

              <section>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-cyan-50">Resource Availability</h2>
                  <p className="text-sm text-slate-400">Availability view for rescue teams, ambulances, and food units.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">{resourceCards}</div>
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default React.memo(AdvancedPage);
