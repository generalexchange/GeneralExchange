/**
 * Tokenomics — narrative tokenization layer plus tokenized compute pillar (moved from homepage).
 */

'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { BridgeObserverWalletThree } from '@/components/homepage/BridgeObserverWalletThree';
import { PillarSectionEmbed, getPillarById } from '@/screens/homepage/HomepageLegacyRestored';

const BAND = {
  bg00: '#ECE8E0',
  plaque: '#F5F2EB',
  border: 'rgba(46, 90, 58, 0.14)',
  text: '#1A1A1A',
  text60: '#4a4a48',
  text70: '#2f2f2d',
} as const;

export const Tokenomics: React.FC = () => {
  const pillar = getPillarById('tokenized-compute');

  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-12 sm:pt-14">
        <header className="border-b border-white/[0.06] px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
          <div className="mx-auto max-w-content">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px]">
              <span className="text-tan/90">General Exchange</span>
              <span className="text-zinc-600"> · </span>
              Tokenomics
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-[2.75rem]">
              Tokenization layer and native compute economics
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
              How narrative intelligence shares limits and receipts with trading and compute—and how wallet, scheduler, and
              yield stay on one ledger.
            </p>
          </div>
        </header>

        <div className="border-b border-white/[0.06]" style={{ backgroundColor: BAND.bg00, color: BAND.text }}>
          <div className="mx-auto max-w-content px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
            <div
              className="grid gap-8 rounded-lg border p-6 shadow-[0_8px_40px_-20px_rgba(46,90,58,0.12)] sm:gap-10 sm:p-8 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-center lg:gap-12"
              style={{ borderColor: BAND.border, backgroundColor: BAND.plaque }}
            >
              <div
                className="flex justify-center rounded-lg border p-4 sm:p-5 lg:justify-start"
                style={{ borderColor: BAND.border, backgroundColor: 'rgba(26,26,26,0.92)' }}
              >
                <BridgeObserverWalletThree />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: BAND.text60 }}>
                  Tokenization layer
                </p>
                <h2 className="mt-3 font-display text-2xl font-medium tracking-tight sm:text-3xl" style={{ color: BAND.text }}>
                  Narrative intelligence, entitled like any other workload
                </h2>
                <p
                  className="mt-4 max-w-prose text-sm font-light leading-relaxed sm:text-[15px] sm:leading-relaxed"
                  style={{ color: BAND.text70 }}
                >
                  Score and route headlines, filings, and macro events into the same limits, queues, and audit receipts as
                  trading and compute—so desks fund intelligence with explicit credits instead of shadow feeds.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="border-b border-white/[0.06] bg-dark-gray/35" aria-labelledby="tokenomics-backspace-quote">
          <div className="mx-auto max-w-content px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px]">
              <span className="text-tan/90">Backspace</span>
              <span className="text-zinc-600"> · </span>
              Proof before capital
            </p>
            <blockquote
              id="tokenomics-backspace-quote"
              className="mt-6 max-w-4xl border-l-2 border-institutional-green/45 pl-5 text-sm font-light leading-relaxed text-zinc-400 sm:text-base sm:pl-6"
            >
              Backspace is where strategies are proven before capital is committed. Feed it a dataset, select your model —
              XGBoost, LSTM, or Reinforcement Learning — and run your setup against real historical paths. Calibration reports.
              Prediction vs actual overlays. Execution simulation. Backspace isn&apos;t a research toy — it&apos;s the proof layer
              between your idea and your position.
            </blockquote>
          </div>
        </section>

        {pillar ? <PillarSectionEmbed pillar={pillar} index={0} /> : null}
      </div>

      <InstitutionalFooter />
    </div>
  );
};
