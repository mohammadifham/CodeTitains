'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertCircle, LayoutGrid, MapPin, MessageCircle, Package, ShieldCheck, Zap, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const pathname = usePathname();

  // Static menu items - no re-renders on every render
  const menuItems = useMemo(
    () => [
      { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
      { icon: MapPin, label: 'Map View', href: '/dashboard' },
      { icon: AlertCircle, label: 'Requests', href: '/dashboard' },
      { icon: Package, label: 'Resources', href: '/dashboard' },
      { icon: Zap, label: 'Allocation', href: '/dashboard' },
      { icon: MessageCircle, label: 'Chatbot', href: '/dashboard' },
    ],
    [],
  );

  return (
    <aside
      className={`fixed md:sticky left-0 top-[73px] z-30 h-[calc(100vh-73px)] w-72 overflow-y-auto border-r border-cyan-500/15 bg-slate-950/90 backdrop-blur-xl transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } md:translate-x-0 overflow-y-auto`}
    >
      <div className="border-b border-cyan-500/10 p-4">
        <div className="rounded-2xl border border-cyan-500/15 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-cyan-50">Operations Panel</p>
              <p className="text-xs text-slate-400">Incidents, resources, dispatch</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <div
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'border-cyan-500/25 bg-cyan-500/10 text-cyan-100 shadow-[0_0_24px_rgba(0,255,255,0.08)]'
                    : 'border-transparent text-slate-400 hover:border-cyan-500/15 hover:bg-white/5 hover:text-cyan-100'
                }`}
              >
                <Icon size={18} />
                <span className="flex-1 font-medium">{item.label}</span>
                {isActive && <ChevronRight size={16} className="text-cyan-400" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-cyan-500/10 p-4">
        <div className="rounded-2xl border border-cyan-500/15 bg-white/5 p-4 text-xs text-slate-300">
          <p className="mb-3 text-sm font-semibold text-cyan-50">System Status</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Servers</span>
              <span className="text-emerald-300">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Data sync</span>
              <span className="text-emerald-300">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Dispatch queue</span>
              <span className="text-cyan-200">Active</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);
