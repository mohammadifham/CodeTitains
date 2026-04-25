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

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Learn', href: '/' },
  { label: 'Dashboard', href: '/dashboard' },
];

function Navbar({ onMenuToggle }: NavbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const activeNav = useMemo(() => pathname, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-[260px] items-center gap-3">
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
              <p className="text-sm font-semibold tracking-[0.2em] text-cyan-100">DISASTERHUB</p>
              <p className="text-xs text-slate-400">Command & Coordination</p>
            </div>
          </Link>
        </div>

        <nav className="hidden flex-1 justify-center md:flex">
          <div className="flex items-center gap-1 rounded-full border border-cyan-500/15 bg-white/5 p-1">
            {navItems.map((item) => {
              const isActive = activeNav === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-cyan-500/15 text-cyan-100' : 'text-slate-300 hover:bg-white/5 hover:text-cyan-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {!user ? (
            <span className="hidden rounded-full border border-slate-400/15 bg-slate-950/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 sm:inline-flex">
              Guest mode
            </span>
          ) : null}

          <Link
            href={user ? '/dashboard' : '/login'}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-400/40 hover:bg-white/10"
          >
            {user ? 'Open Dashboard' : 'Sign In'}
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Start Response
          </Link>
        </div>
      </div>
    </header>
  );
}

export default React.memo(Navbar);
