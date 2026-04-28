import Link from 'next/link';
import { Activity, Clock3, ShieldCheck, ArrowUpRight } from 'lucide-react';

const footerLinks = [
  { label: 'Dashboard', href: '/login?redirect=/dashboard' },
  { label: 'Advanced Intelligence', href: '/advanced' },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-cyan-500/15 bg-slate-950/95 mt-12">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 w-fit">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <Activity size={20} />
              </span>
              <span className="text-base font-bold tracking-wide text-cyan-50 uppercase">AI powered DisasterHub Management Systen</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
              A professional emergency management interface for real-time detection, resource coordination, and incident response operations.
            </p>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-cyan-200 uppercase tracking-widest mb-4">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="group inline-flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                    {item.label}
                    <ArrowUpRight size={12} className="opacity-0 -translate-y-1 translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-cyan-200 uppercase tracking-widest mb-4">System Status</h3>
            <ul className="space-y-3 bg-white/5 rounded-xl p-4 border border-white/5">
              <li className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-sm text-slate-300">Operational</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock3 size={16} className="text-cyan-400" />
                <span className="text-sm text-slate-300">Telemetry Active</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-cyan-500/10 flex flex-col items-center gap-4 text-center md:flex-row md:justify-center md:items-center">
          <p className="text-sm text-slate-500 text-center">© {new Date().getFullYear()} AI powered DisasterHub Management Systen. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
