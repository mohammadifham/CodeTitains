import React from 'react';

interface SectionProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

function Section({ title, subtitle, actions }: SectionProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-4">
      <div>
        <h2 className="text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">{title}</h2>
        {subtitle ? <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex-shrink-0">{actions}</div> : null}
    </div>
  );
}

export default React.memo(Section);
