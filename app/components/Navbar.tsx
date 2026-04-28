'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, ArrowUpRight, Menu, Radio } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface NavbarProps {
  onMenuToggle?: () => void;
}

interface NavItem {
  label: string;
  href: string;
}

function Navbar({ onMenuToggle }: NavbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const activeNav = useMemo(() => pathname, [pathname]);
  const dashboardHref = user ? '/dashboard' : '/login?redirect=/dashboard';

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {onMenuToggle ? (
            <button
              type="button"
              onClick={onMenuToggle}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-white/5 text-cyan-100 transition hover:border-cyan-400/50 hover:bg-cyan-500/10 md:hidden"
              aria-label="Toggle navigation menu"
            >
              <Menu size={18} />
            </button>
          ) : null}

          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300 shadow-[0_0_18px_rgba(0,255,255,0.18)]">
              <Activity size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-[0.08em] text-cyan-100">AI POWERED DISASTERHUB</p>
              <p className="text-xs text-slate-400">Management Systen</p>
            </div>
          </Link>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className={`hidden h-10 items-center gap-2 rounded-full border px-4 sm:px-5 text-xs sm:text-sm font-semibold transition whitespace-nowrap lg:inline-flex ${
              activeNav === '/'
                ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100'
                : 'border-cyan-500/20 bg-white/5 text-cyan-100 hover:border-cyan-400/40 hover:bg-white/10'
            }`}
          >
            Home
          </Link>

          {!user ? (
            <span className="hidden rounded-full border border-slate-400/15 bg-slate-950/70 px-3 py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 md:inline-flex whitespace-nowrap">
              Guest mode
            </span>
          ) : null}

          {!user ? (
            <>
              <Link
                href="/login"
                className="flex h-10 items-center gap-2 rounded-full border border-cyan-500/20 bg-white/5 px-4 sm:px-5 text-xs sm:text-sm font-semibold text-cyan-100 transition hover:border-cyan-400/40 hover:bg-white/10 whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                href={dashboardHref}
                className="flex h-10 items-center gap-2 rounded-full bg-cyan-500 px-4 sm:px-5 text-xs sm:text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 whitespace-nowrap"
              >
                Start Response
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={logout}
                className="flex h-10 items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 sm:px-5 text-xs sm:text-sm font-semibold text-red-200 transition hover:bg-red-500/20 hover:border-red-400/40 whitespace-nowrap"
              >
                Sign Out
              </button>
              <Link
                href={dashboardHref}
                className="flex h-10 items-center gap-2 rounded-full bg-cyan-500 px-4 sm:px-5 text-xs sm:text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 whitespace-nowrap"
              >
                Open Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default React.memo(Navbar);
