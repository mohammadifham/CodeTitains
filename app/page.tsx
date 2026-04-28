import Link from 'next/link';
import { Activity, ArrowRight, Radio, ShieldAlert, Truck } from 'lucide-react';

const capabilityCards = [
  {
    title: 'Live Incident Intelligence',
    description: 'Stream alerts, classify severity, and prioritize active zones in seconds.',
    icon: Radio,
  },
  {
    title: 'Automated Resource Dispatch',
    description: 'Match requests to available teams, vehicles, and relief assets instantly.',
    icon: Truck,
  },
  {
    title: 'Coordinated Multi-Agency Control',
    description: 'Keep local responders, NGOs, and operations leaders aligned in one view.',
    icon: ShieldAlert,
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.16)_0%,transparent_36%),radial-gradient(circle_at_85%_12%,rgba(56,189,248,0.12)_0%,transparent_35%),linear-gradient(180deg,rgba(2,6,23,0.8)_0%,rgba(2,6,23,1)_72%)]" />

      <section className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pt-24">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              <Activity size={14} />
              AI powered DisasterHub Management Systen
            </div>

            <div className="space-y-6">
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-slate-50 sm:text-6xl lg:text-7xl">
                Command the chaos with
                <span className="block text-cyan-300">one real-time control center.</span>
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                AI powered DisasterHub Management Systen gives response teams instant situational awareness, triage automation, and clear cross-agency coordination from the first alert to final resolution.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-cyan-400 px-6 text-sm font-semibold uppercase tracking-[0.08em] text-slate-950 transition hover:bg-cyan-300"
              >
                Open Dashboard
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/60 p-6 shadow-[0_20px_60px_rgba(2,132,199,0.25)] backdrop-blur-xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Active Operations Snapshot</p>
            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-slate-400">Incidents Monitored</p>
                <p className="mt-2 text-3xl font-semibold text-cyan-200">128</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Teams Live</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-100">42</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Avg Dispatch</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-100">3.8m</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {capabilityCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="group rounded-3xl border border-cyan-500/15 bg-slate-900/55 p-6 transition hover:-translate-y-1 hover:border-cyan-400/45 hover:bg-slate-900/75"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
                  <Icon size={18} />
                </span>
                <h2 className="mt-5 text-xl font-semibold text-slate-100">{card.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{card.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
