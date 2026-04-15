/**
 * Logged-in dashboard sidebar — institutional dark theme
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LineChart, Shield, Workflow } from 'lucide-react';
import { useDashboardView } from '@/hooks/useDashboardView';

function navLinkClass(active: boolean): string {
  return `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors border ${
    active
      ? 'bg-institutional-green/20 text-tan border-institutional-green/35'
      : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.04] border-transparent'
  }`;
}

export const DashboardSidebar: React.FC = () => {
  const pathname = usePathname();
  const view = useDashboardView();
  const onDashboard = pathname === '/dashboard';

  return (
    <aside className="hidden lg:flex w-56 xl:w-60 shrink-0 flex-col border-r border-white/[0.08] bg-charcoal min-h-[calc(100vh-4rem)] sticky top-16 self-start">
      <div className="p-4 xl:p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-4 px-2">Workspace</p>
        <nav className="space-y-1" aria-label="Dashboard">
          {onDashboard ? (
            <>
              <Link href="/dashboard" className={navLinkClass(view === 'overview')}>
                <span className="text-tan/80">
                  <LayoutDashboard size={18} strokeWidth={1.5} />
                </span>
                <span className="font-medium">Dashboard</span>
              </Link>
              <div className="ml-2 pl-3 border-l border-white/[0.08] space-y-1 my-1">
                <Link href="/dashboard?tab=strategies" className={navLinkClass(view === 'strategies')}>
                  <span className="text-tan/80">
                    <Workflow size={18} strokeWidth={1.5} />
                  </span>
                  <span className="font-medium">Strategies</span>
                </Link>
                <Link href="/dashboard?tab=backtesting" className={navLinkClass(view === 'backtesting')}>
                  <span className="text-tan/80">
                    <LineChart size={18} strokeWidth={1.5} />
                  </span>
                  <span className="font-medium">BackTesting</span>
                </Link>
              </div>
              <Link href="/dashboard?tab=risk" className={navLinkClass(view === 'risk')}>
                <span className="text-tan/80">
                  <Shield size={18} strokeWidth={1.5} />
                </span>
                <span className="font-medium">Risk</span>
              </Link>
            </>
          ) : (
            <Link href="/dashboard" className={navLinkClass(false)}>
              <span className="text-tan/80">
                <LayoutDashboard size={18} strokeWidth={1.5} />
              </span>
              <span className="font-medium">Dashboard</span>
            </Link>
          )}
        </nav>
      </div>
    </aside>
  );
};
