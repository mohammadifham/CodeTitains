import React from 'react';

export interface ResourceCardProps {
  name: string;
  location: string;
  availability: 'Available' | 'Limited' | 'Deployed';
}

const availabilityClasses: Record<ResourceCardProps['availability'], string> = {
  Available: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
  Limited: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
  Deployed: 'text-blue-300 border-blue-500/30 bg-blue-500/10',
};

function ResourceCard({ name, location, availability }: ResourceCardProps) {
  return (
    <article className="rounded-2xl border border-cyan-500/20 bg-white/5 p-4 shadow-[0_0_20px_rgba(0,255,255,0.12)] backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-cyan-100">{name}</h3>
          <p className="mt-1 text-sm text-slate-300">{location}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${availabilityClasses[availability]}`}>
          {availability}
        </span>
      </div>
    </article>
  );
}

export default React.memo(ResourceCard);
