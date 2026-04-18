/**
 * Almanac — trade history journal and performance narrative (linked from homepage History).
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';

export const Almanac: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-12 sm:pt-14">
        <header className="border-b border-white/[0.06] px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
          <div className="mx-auto max-w-content">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px]">
              <span className="text-tan/90">History</span>
              <span className="text-zinc-600"> · </span>
              Almanac
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-[2.75rem]">
              There is a story in every trade
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
              The Almanac is your chronological journal of simulated outcomes—P&L, entries and exits, strategy labels, and
              session context—so you can review decisions, compare symbols, and see what actually moved the book over time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-tan px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-tan-muted"
              >
                Open dashboard
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-white/[0.12] bg-transparent px-6 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-institutional-green/40 hover:bg-institutional-green/10 hover:text-tan"
              >
                Back to home
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-content px-4 py-12 sm:px-6 sm:py-14 lg:px-10">
          <h2 className="font-display text-lg font-medium text-neutral-200 sm:text-xl">Coming into focus</h2>
          <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-zinc-500">
            Session tagging, exportable ledgers, and drill-down by strategy are on the roadmap. For now, use the dashboard to
            track live simulated activity; this page will grow into the full almanac experience.
          </p>
        </div>
      </div>

      <InstitutionalFooter />
    </div>
  );
};
