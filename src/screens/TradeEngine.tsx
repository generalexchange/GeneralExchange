/**
 * The Exchange product page — order workflow hero, ticket mock, platform topology.
 * Route remains /trade-engine.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { HeroSystemTopologyIllustration } from '@/components/homepage/HomepageMechanicsIllustrations';
import {
  HomepageExecutionLoopRestored,
  PillarSectionEmbed,
  getPillarById,
} from '@/screens/homepage/HomepageLegacyRestored';

const easeLux = [0.22, 1, 0.36, 1] as const;

function TradeTicketMock() {
  return (
    <div
      className="relative w-full max-w-sm border border-white/[0.08] bg-[#0e0e0e]/95 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] backdrop-blur-sm sm:max-w-md sm:p-6 lg:max-w-sm"
      aria-hidden
    >
      <div className="mb-4 flex items-baseline justify-between border-b border-white/[0.06] pb-3">
        <span className="font-display text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">Order instruction</span>
        <span className="font-mono text-[10px] tabular-nums text-zinc-600">REF · 88421</span>
      </div>
      <div className="space-y-0 divide-y divide-white/[0.06]">
        {(
          [
            ['Entry', '$482.40'],
            ['Target', '$491.25'],
            ['Stop', '$476.10'],
            ['Risk / reward', '1 : 1.8'],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-6 py-2.5 first:pt-0">
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">{k}</span>
            <span className="font-mono text-xs tabular-nums tracking-tight text-zinc-300">{v}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-white/[0.06] pt-3 text-[10px] font-light leading-relaxed text-zinc-600">
        Pre-trade risk and routing review. Indicative values for illustration only.
      </p>
    </div>
  );
}

export const TradeEngine: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        <section
          className="relative overflow-hidden border-b border-white/[0.06] md:min-h-[min(100dvh,900px)]"
          aria-labelledby="the-exchange-title"
        >
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-20%,rgba(46,90,58,0.08),transparent_55%)]"
              aria-hidden
            />
            <div
              className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:72px_72px]"
              aria-hidden
            />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-content flex-col px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
            <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_auto] lg:gap-16 xl:gap-24">
              <div className="min-w-0 max-w-2xl lg:max-w-none lg:pr-8">
                <div className="mb-5 h-px w-12 bg-tan/50" aria-hidden />
                <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px]">
                  <span className="text-tan/90">01</span>
                  <span className="text-zinc-600"> · </span>
                  The Exchange
                </p>
                <motion.h1
                  id="the-exchange-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, ease: easeLux }}
                  className="mt-4 font-display text-[clamp(2.25rem,5.5vw,3.75rem)] font-medium leading-[1.08] tracking-tight text-neutral-100"
                >
                  The Exchange
                </motion.h1>
                <p className="mt-6 max-w-xl border-l border-white/[0.08] pl-5 text-sm font-light leading-relaxed text-zinc-500 sm:text-[15px] sm:leading-[1.65]">
                  General Exchange&apos;s execution surface: tickets, routing, and evidence-bound checks so strategy intent
                  becomes a controlled release—aligned to desk policy and limits before size touches the tape.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-12 inline-flex w-full max-w-xs items-center justify-center border border-white/[0.18] bg-white/[0.04] px-10 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-100 transition-colors hover:border-tan/45 hover:bg-white/[0.07] sm:w-auto"
                >
                  Open The Exchange
                </Link>
              </div>

              <div className="flex justify-center border-t border-white/[0.06] pt-10 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
                <TradeTicketMock />
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.06] py-14 sm:py-16 lg:py-20" aria-labelledby="exchange-topology-title">
          <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10">
            <h2 id="exchange-topology-title" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-tan/90">
              End-to-end platform topology
            </h2>
            <p className="mt-2 max-w-2xl text-xs font-light leading-relaxed text-neutral-500">
              How orders, risk, compute, routing, and evidence connect through The Exchange—one direction of travel so auditors
              and desks share the same mental model.
            </p>
            <div className="mt-6 rounded-lg border border-white/[0.1] bg-dark-gray/55 px-3 py-4 backdrop-blur-sm sm:px-5 sm:py-5">
              <HeroSystemTopologyIllustration />
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.06] bg-charcoal py-12 sm:py-16 lg:py-20" aria-labelledby="execution-loop-heading">
          <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10">
            <HomepageExecutionLoopRestored />
          </div>
        </section>

        <div className="space-y-10 border-t border-white/[0.06] py-12 sm:space-y-12 sm:py-16 lg:py-20">
          {(() => {
            const routing = getPillarById('execution-routing');
            const workflow = getPillarById('institutional-workflow');
            const governance = getPillarById('governance-compliance');
            return (
              <>
                {routing ? <PillarSectionEmbed pillar={routing} index={0} /> : null}
                {workflow ? <PillarSectionEmbed pillar={workflow} index={1} /> : null}
                {governance ? <PillarSectionEmbed pillar={governance} index={2} /> : null}
              </>
            );
          })()}
        </div>
      </div>

      <InstitutionalFooter />
    </div>
  );
};
