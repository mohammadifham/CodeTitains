'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SPLASH_KEY = 'disasterhub_splash_seen';

export default function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(SPLASH_KEY) !== '1';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!visible) return;

    sessionStorage.setItem(SPLASH_KEY, '1');

    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#050816]"
          aria-label="Loading application"
          role="status"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18)_0%,transparent_38%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15)_0%,transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.9)_0%,rgba(5,8,22,1)_100%)]" />
          <motion.div
            initial={{ scale: 0.96, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative z-10 flex w-[min(92vw,520px)] flex-col items-center rounded-[2rem] border border-cyan-400/20 bg-slate-950/70 px-8 py-10 text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-cyan-400/25 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.16)]">
              <svg viewBox="0 0 24 24" className="h-10 w-10 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80">DisasterHub</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Command center initializing</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-300 sm:text-base">
              Syncing response channels, loading live intelligence, and preparing the operations console.
            </p>

            <div className="mt-8 w-full space-y-3">
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full w-1/2 rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-cyan-200"
                  animate={{ x: ['-30%', '130%'] }}
                  transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.28em] text-slate-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                Connecting responders
                <span className="h-2 w-2 animate-pulse rounded-full bg-sky-400 [animation-delay:200ms]" />
                Loading dashboards
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-200 [animation-delay:400ms]" />
                Ready in moments
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}