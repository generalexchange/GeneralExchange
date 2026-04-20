/**
 * Solutions hub — entry to vertical solution pages linked from the footer.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';

const cards = [
  {
    href: '/oil-and-gas',
    title: 'Oil & Gas',
    body: 'Curve structure, inventory, and margin-aware simulators for hydrocarbon books—same evidence discipline as the rest of the exchange.',
  },
  {
    href: '/crop-futures',
    title: 'Crop Futures',
    body: 'Seasonal risk, basis, and weather volatility framed for agricultural futures—deterministic scenarios you can replay and audit.',
  },
  {
    href: '/fixed-income',
    title: 'Fixed Income',
    body: 'Rates, credit spreads, and carry in one surface—built for desks that need manifest-bound runs, not one-off spreadsheets.',
  },
] as const;

export const SolutionsHub: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        <header className="border-b border-white/[0.06] py-10 sm:py-12">
          <div className="mx-auto max-w-content layout-gutter">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px]">
              <span className="text-tan/90">General Exchange</span>
              <span className="text-zinc-600"> · </span>
              Solutions
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-[2.75rem]">
              Institutional solutions
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
              Vertical workflows and education paths that share the same risk-first, evidence-bound posture as TradeEngine,
              Backspace, and Bridge Observer—tailored to how different asset classes actually move.
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-content layout-gutter py-12 sm:py-16">
          <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3">
            {cards.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="flex h-full flex-col rounded-xl border border-white/[0.08] bg-dark-gray/40 p-6 transition-colors hover:border-tan/30 hover:bg-dark-gray/70"
                >
                  <h2 className="font-display text-xl font-medium text-neutral-50">{c.title}</h2>
                  <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-zinc-400">{c.body}</p>
                  <span className="mt-6 text-xs font-semibold uppercase tracking-wider text-tan">View →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <InstitutionalFooter />
    </div>
  );
};
