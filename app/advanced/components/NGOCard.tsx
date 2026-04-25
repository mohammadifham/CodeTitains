import React from 'react';

export interface NGOCardProps {
  name: string;
  area: string;
  status: 'Active' | 'En route' | 'Completed';
}

const statusClasses: Record<NGOCardProps['status'], string> = {
  Active: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10',
  'En route': 'text-blue-300 border-blue-500/30 bg-blue-500/10',
  Completed: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
};

function NGOCard({ name, area, status }: NGOCardProps) {
  return (
    <article className="rounded-2xl border border-cyan-500/20 bg-white/5 p-4 shadow-[0_0_20px_rgba(0,255,255,0.12)] backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-cyan-100">{name}</h3>
          <p className="mt-1 text-sm text-slate-300">{area}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[status]}`}>
          {status}
        </span>
      </div>
    </article>
  );
}

export default React.memo(NGOCard);
