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
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Advanced Intelligence', href: '/advanced' },
];

function Navbar({ onMenuToggle }: NavbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const activeNav = useMemo(() => pathname, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/15 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
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
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-wide text-cyan-50 sm:text-base">
                Disaster Response Hub
              </span>
              <span className="text-xs text-slate-400">Command &amp; Coordination</span>
            </span>
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

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 sm:inline-flex">
            <Radio size={12} />
            Operations Live
          </span>

          {user ? (
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-400/50 hover:bg-cyan-500/10"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href={pathname === '/dashboard' || pathname === '/advanced' ? '/login' : '/dashboard'}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-400/50 hover:bg-cyan-500/10"
            >
              {pathname === '/dashboard' || pathname === '/advanced' ? 'Sign In' : 'Open Dashboard'}
              <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default React.memo(Navbar);
