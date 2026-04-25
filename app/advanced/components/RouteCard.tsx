import React from 'react';

export interface RouteCardProps {
  name: string;
  status: 'Safe' | 'Blocked';
  eta: string;
}

const statusClasses: Record<RouteCardProps['status'], string> = {
  Safe: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
  Blocked: 'text-rose-300 border-rose-500/30 bg-rose-500/10',
};

function RouteCard({ name, status, eta }: RouteCardProps) {
  return (
    <article className="rounded-2xl border border-cyan-500/20 bg-white/5 p-4 shadow-[0_0_20px_rgba(0,255,255,0.12)] backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-cyan-100">{name}</h3>
          <p className="mt-1 text-sm text-slate-300">ETA: {eta}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[status]}`}>
          {status}
        </span>
      </div>
    </article>
  );
}

export default React.memo(RouteCard);
