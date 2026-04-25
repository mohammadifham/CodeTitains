import React from 'react';

export interface AlertCardProps {
  title: string;
  message: string;
  severity: 'Critical' | 'High' | 'Medium';
  timestamp: string;
}

const severityClasses: Record<AlertCardProps['severity'], string> = {
  Critical: 'text-rose-300 border-rose-500/30 bg-rose-500/10',
  High: 'text-orange-300 border-orange-500/30 bg-orange-500/10',
  Medium: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
};

function AlertCard({ title, message, severity, timestamp }: AlertCardProps) {
  return (
    <article className="rounded-2xl border border-cyan-500/20 bg-white/5 p-4 shadow-[0_0_20px_rgba(0,255,255,0.12)] backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-cyan-100">{title}</h3>
          <p className="mt-2 text-sm text-slate-300">{message}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${severityClasses[severity]}`}>
          {severity}
        </span>
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">{timestamp}</p>
    </article>
  );
}

export default React.memo(AlertCard);
