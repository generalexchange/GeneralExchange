/**
 * Risk Management — trading-tool risk surfaces and compute token context (linked from homepage).
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { PillarSectionEmbed, getPillarById } from '@/screens/homepage/HomepageLegacyRestored';

export const RiskManagement: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-12 sm:pt-14">
        <header className="border-b border-white/[0.06] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
          <div className="mx-auto max-w-content">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px]">
              <span className="text-tan/90">Risk</span>
              <span className="text-zinc-600"> · </span>
              Management
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-[2.75rem]">
              Model the stack before you size risk in production.
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
              Risk tooling in the trading workflow, backed by tokenized AMD compute on Lubbock.Cloud—so scenarios, limits, and
              evidence stay aligned from research through release.
            </p>
            <Link
              href="/dashboard?tab=risk"
              className="mt-8 inline-flex items-center justify-center rounded-lg border border-white/[0.18] bg-white/[0.04] px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-100 transition-colors hover:border-tan/45 hover:bg-white/[0.07]"
            >
              Open live risk workspace
            </Link>
          </div>
        </header>

        {(() => {
          const pillar = getPillarById('advanced-risk-scenario');
          return pillar ? <PillarSectionEmbed pillar={pillar} index={0} /> : null;
        })()}

        <section className="border-b border-white/[0.06] px-4 py-12 sm:px-6 sm:py-16 lg:px-10" aria-labelledby="risk-trading-tools-heading">
          <div className="mx-auto max-w-content">
            <h2 id="risk-trading-tools-heading" className="font-display text-xl font-medium tracking-tight text-neutral-100 sm:text-2xl">
              Risk in trading tools
            </h2>
            <p className="mt-4 max-w-3xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
              VaR and ES grids, stress paths, factor decomposition, and tail heatmaps live alongside the same strategy and
              execution surfaces your desk already uses. Risk is not a separate spreadsheet—it is embedded in the tools where
              orders are built, replayed, and released.
            </p>
            <ul className="mt-6 max-w-2xl space-y-2 text-sm text-zinc-500">
              <li className="flex gap-2">
                <span className="text-tan/80">·</span>
                Scenario libraries tied to reproducible manifests and compute spend.
              </li>
              <li className="flex gap-2">
                <span className="text-tan/80">·</span>
                Pre-trade gates that read the same limits as live execution and audit trails.
              </li>
            </ul>
            <Link
              href="/features#feature-risk-management"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-tan px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-tan-muted"
            >
              View risk in trading tools
            </Link>
          </div>
        </section>

        <section className="border-b border-white/[0.06] bg-dark-gray/30 px-4 py-12 sm:px-6 sm:py-16 lg:px-10" aria-labelledby="compute-tokens-heading">
          <div className="mx-auto max-w-content">
            <h2 id="compute-tokens-heading" className="font-display text-xl font-medium tracking-tight text-neutral-100 sm:text-2xl">
              Compute tokens
            </h2>
            <p className="mt-4 max-w-3xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
              Tokenized GPU capacity funds the heavy paths—parallel backtests, Monte Carlo sweeps, and RL training—without
              opaque cloud bills. Credits, queues, and yield mechanics are visible to finance and risk the same way notional
              and margin are.
            </p>
            <p className="mt-4 max-w-3xl text-sm font-light leading-relaxed text-zinc-500 sm:text-base">
              Plans and top-ups map directly to the workloads that feed your risk engines and research grids, so capacity and
              governance stay in one ledger.
            </p>
            <Link
              href="/pricing"
              className="mt-8 inline-flex items-center justify-center rounded-lg border border-institutional-green/45 bg-institutional-green/10 px-6 py-3 text-sm font-semibold text-neutral-100 transition-colors hover:border-institutional-green hover:bg-institutional-green/20"
            >
              Compute tokens &amp; plans
            </Link>
          </div>
        </section>
      </div>

      <InstitutionalFooter />
    </div>
  );
};
