/**
 * Logged-in dashboard sidebar — institutional dark theme
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cpu,
  LineChart,
  Shield,
  Workflow,
  User,
} from 'lucide-react';

const items: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} strokeWidth={1.5} /> },
  { href: '/pricing', label: 'Compute Tokens', icon: <Cpu size={18} strokeWidth={1.5} /> },
  { href: '/features#feature-backtesting', label: 'Backtesting', icon: <LineChart size={18} strokeWidth={1.5} /> },
  { href: '/features#feature-risk-management', label: 'Risk Models', icon: <Shield size={18} strokeWidth={1.5} /> },
  { href: '/features#feature-strategy', label: 'Strategy Builder', icon: <Workflow size={18} strokeWidth={1.5} /> },
  { href: '/login', label: 'Account', icon: <User size={18} strokeWidth={1.5} /> },
];

function linkIsActive(pathname: string, href: string): boolean {
  const base = href.split('#')[0] ?? href;
  if (base === '/dashboard') return pathname === '/dashboard';
  if (href.startsWith('/features#')) return pathname === '/features';
  return pathname === base;
}

export const DashboardSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-56 xl:w-60 shrink-0 flex-col border-r border-white/[0.08] bg-charcoal min-h-[calc(100vh-4rem)] sticky top-16 self-start">
      <div className="p-4 xl:p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-4 px-2">Platform</p>
        <nav className="space-y-1" aria-label="Dashboard">
          {items.map(({ href, label, icon }) => {
            const active = linkIsActive(pathname, href);
            return (
              <Link
                key={href + label}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                  active
                    ? 'bg-institutional-green/20 text-tan border border-institutional-green/35'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <span className="text-tan/80">{icon}</span>
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
