import React from 'react';

export interface DetectionCardProps {
  title: string;
  location: string;
  severity: 'High' | 'Medium' | 'Low';
  source: string;
}

const severityClasses: Record<DetectionCardProps['severity'], string> = {
  High: 'text-rose-300 border-rose-500/30 bg-rose-500/10',
  Medium: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
  Low: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
};

function DetectionCard({ title, location, severity, source }: DetectionCardProps) {
  return (
    <article className="rounded-2xl border border-cyan-500/20 bg-white/5 p-4 shadow-[0_0_20px_rgba(0,255,255,0.12)] backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-cyan-100">{title}</h3>
          <p className="mt-1 text-sm text-slate-300">{location}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${severityClasses[severity]}`}>
          {severity}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>Source</span>
        <span>{source}</span>
      </div>
    </article>
  );
}

export default React.memo(DetectionCard);
