/**
 * Reconnaissance — pre-trade surveillance, tape context, and situational awareness.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';

export const Reconnaissance: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-12 sm:pt-14">
        <header className="border-b border-white/[0.06] px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
          <div className="mx-auto max-w-content">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px]">
              <span className="text-tan/90">Risk</span>
              <span className="text-zinc-600"> · </span>
              Reconnaissance
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-[2.75rem]">
              Read the tape before you lean on size
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
              Reconnaissance is continuous situational awareness: liquidity pockets, crowding, event windows, and how your book
              intersects live flow—so risk and execution see the same picture of the market, not a stale snapshot from an hour
              ago.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/risk-management"
                className="inline-flex items-center justify-center rounded-lg bg-tan px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-tan-muted"
              >
                Risk Management
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

        <article className="mx-auto max-w-content px-4 py-12 sm:px-6 sm:py-14 lg:px-10">
          <div className="max-w-3xl space-y-10">
            <section>
              <h2 className="font-display text-lg font-medium text-neutral-100 sm:text-xl">Flow and context</h2>
              <p className="mt-3 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
                Map how prints, sweeps, and resting size evolve around your names—where the book is likely to clear, where
                queues thin, and when venue behavior shifts—so decisions are grounded in what the market is doing right now.
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-medium text-neutral-100 sm:text-xl">Event and narrative windows</h2>
              <p className="mt-3 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
                Overlay earnings, macro prints, and headline volatility regimes next to exposure ladders. Reconnaissance ties
                calendar risk to live Greeks and notionals so the desk can rehearse scenarios before the bell, not after the
                move.
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-medium text-neutral-100 sm:text-xl">Shared field of view</h2>
              <p className="mt-3 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
                One reconnaissance surface for risk, research, and execution: the same ladders, the same event markers, the
                same lineage hooks—so nobody is trading off a different map of the battlefield.
              </p>
            </section>
          </div>
        </article>
      </div>

      <InstitutionalFooter />
    </div>
  );
};
