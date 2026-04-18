/**
 * Governance — manifest-bound lineage, reproducibility, and shared deterministic truth.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';

export const Governance: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-12 sm:pt-14">
        <header className="border-b border-white/[0.06] px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
          <div className="mx-auto max-w-content">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px]">
              <span className="text-tan/90">Platform</span>
              <span className="text-zinc-600"> · </span>
              Governance
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-[2.75rem]">
              The governance layer (the real insight)
            </h1>
            <p className="mt-4 max-w-3xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
              How manifests, deterministic runs, and a single evidence geometry keep risk, research, and audit aligned—from
              signal to fills—without hand-wavy reproducibility.
            </p>
            <div className="mt-8">
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
          <div className="max-w-3xl space-y-12">
            <section>
              <h2 className="font-display text-xl font-medium text-neutral-100 sm:text-2xl">Manifest-bound lineage</h2>
              <p className="mt-4 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
                Every result is tied to a <span className="text-tan/90">manifest</span>—a complete audit trail of: which
                model? which dataset version? which code kernel? Run it again and you get identical results. No &quot;I can&apos;t
                reproduce this&quot; or &quot;the model drifted.&quot;
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-medium text-neutral-100 sm:text-2xl">Reproducible results</h2>
              <p className="mt-4 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
                Deterministic. No hidden randomness. Audit teams can verify what risk team found, what research team
                backtested, what execution actually did.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-medium text-neutral-100 sm:text-2xl">
                Risk, research, and audit teams read the same deterministic geometry
              </h2>
              <p className="mt-4 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
                Everyone has one source of truth. No spreadsheet copies, no version conflicts, no &quot;my model says X but
                your model says Y because we ran different code.&quot;
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-medium text-neutral-100 sm:text-2xl">
                Signal generation through execution and evidence
              </h2>
              <p className="mt-4 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
                The lineage traces the entire flow: how the trading signal was generated (RL model? rules engine?) → how it
                was executed (what slippage? what fills?) → what the actual evidence shows (did it work as backtested?).
              </p>
            </section>
          </div>
        </article>
      </div>

      <InstitutionalFooter />
    </div>
  );
};
