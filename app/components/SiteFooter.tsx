import Link from 'next/link';
import { Activity, Clock3, ShieldCheck, ArrowUpRight } from 'lucide-react';

const footerLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Advanced Intelligence', href: '/advanced' },
  { label: 'Login', href: '/login' },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-cyan-500/15 bg-slate-950/95">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr_0.8fr] lg:items-start">
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 shadow-[0_0_18px_rgba(0,255,255,0.16)]">
                <Activity size={18} />
              </span>
              <div>
                <p className="text-base font-semibold tracking-wide text-cyan-50">Disaster Response Hub</p>
                <p className="text-sm text-slate-400">Command &amp; coordination platform</p>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-300">
              A professional emergency management interface for detection, resource coordination, safe routing,
              and incident response.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Quick Links</h2>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 text-slate-300 transition hover:text-cyan-100"
                >
                  <ArrowUpRight size={14} />
                  {item.label}
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">System Status</h2>
            <div className="mt-4 space-y-3 rounded-2xl border border-cyan-500/15 bg-white/5 p-4 backdrop-blur-md">
              <p className="flex items-center gap-2 text-sm text-slate-200">
                <ShieldCheck size={14} className="text-emerald-300" />
                Services online and monitored
              </p>
              <p className="flex items-center gap-2 text-sm text-slate-200">
                <Clock3 size={14} className="text-cyan-300" />
                Continuous operations tracking
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">© {new Date().getFullYear()} Disaster Response Hub</p>
            </div>
          </section>
        </div>
      </div>
    </footer>
  );
}
