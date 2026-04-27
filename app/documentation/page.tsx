import Link from 'next/link';

const sections = [
  {
    title: 'Getting Started',
    items: [
      'Open the dashboard to monitor incidents, requests, and resource allocation in real time.',
      'Use Advanced Disaster Intelligence for route simulation, NASA event overlays, and response pressure analysis.',
      'Sign in to keep mission-level operations and chat actions linked to your authenticated session.',
    ],
  },
  {
    title: 'Core Workflows',
    items: [
      'Create incidents with severity and location to seed live operational mapping.',
      'Submit resource requests and track state transitions from open to fulfilled.',
      'Allocate resources against requests and monitor dispatch completion in allocation history.',
    ],
  },
  {
    title: 'Live Data Integrations',
    items: [
      'Backend metrics are streamed from the FastAPI endpoints and Supabase-backed records.',
      'NASA EONET provides open natural event data grouped into categories for operational awareness.',
      'NASA GIBS satellite tiles power the map base layer for visual situation context.',
    ],
  },
];

export default function DocumentationPage() {
  return (
    <main className="min-h-[calc(100vh-86px)] bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-cyan-500/20 bg-slate-900/60 p-6 shadow-[0_28px_70px_rgba(2,8,23,0.5)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Documentation</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-cyan-50 sm:text-4xl">
          AI powered DisasterHub Management Systen Guide
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
          This guide explains how to run operations, interpret live intelligence, and use integrated tools across the platform.
        </p>

        <div className="mt-8 grid gap-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-cyan-500/15 bg-white/[0.03] p-5">
              <h2 className="text-xl font-semibold text-cyan-100">{section.title}</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-300 sm:text-base">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-cyan-500/15 bg-slate-950/70 p-5">
          <h2 className="text-xl font-semibold text-cyan-100">Quick Links</h2>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/api-reference" className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-cyan-100 transition hover:bg-cyan-500/20">
              API Reference
            </Link>
            <Link href="/support" className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-cyan-100 transition hover:bg-cyan-500/20">
              Support Desk
            </Link>
            <Link href="/privacy" className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-cyan-100 transition hover:bg-cyan-500/20">
              Privacy Policy
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
