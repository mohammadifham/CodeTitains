import React from 'react';
import Card from './Card';
import { motion } from 'framer-motion';

interface KPIProps {
  label: string;
  value: string;
  hint?: string;
}

function KPI({ label, value, hint }: KPIProps) {
  return (
    <Card className="flex flex-col justify-between group">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 group-hover:text-cyan-400 transition-colors duration-300">{label}</p>
      <motion.p 
        className="mt-3 text-4xl font-bold leading-none text-cyan-50 font-[family-name:var(--font-geist-mono)] tracking-tight drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {value}
      </motion.p>
      {hint ? <p className="mt-3 text-xs text-cyan-200/70 border-t border-cyan-500/20 pt-2">{hint}</p> : null}
    </Card>
  );
}

export default React.memo(KPI);
