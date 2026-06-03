/**
 * Homepage — commercial narrative for sophisticated buyers.
 *
 * Seven sections, in order:
 *   I    Hero ................. decisions made on evidence, not intuition
 *   II   Backtesting ......... replay any trade against any environment
 *   III  Options intelligence  see every dimension of a position
 *   IV   Market intelligence . noise vs conviction
 *   V    Strategy library .... versioned, portable strategies
 *   VI   Data access ......... institutional access layer
 *   VII  Trust & audit ....... traceable lineage for every number
 *
 * Rule: never name infrastructure. No Greek letters in copy. Show, don't tell.
 */

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SectionShell } from '@/components/homepage/SectionShell';
import {
  BacktestIllustration,
  OptionsIllustration,
  MarketIntelIllustration,
  StrategyLibraryIllustration,
  DataAccessIllustration,
  LineageIllustration,
} from '@/components/homepage/HomepageProductIllustrations';

const easeLux = [0.22, 1, 0.36, 1] as const;

const btnPrimary =
  'inline-flex min-h-11 w-full items-center justify-center rounded-md bg-tan px-6 py-3 text-sm font-semibold tracking-wide text-charcoal shadow-[0_12px_40px_-12px_rgba(210,180,140,0.35)] transition-all duration-300 hover:bg-tan-muted active:scale-[0.99] sm:w-auto sm:min-w-[10.5rem] sm:px-8 sm:py-3.5';

const btnOutline =
  'inline-flex min-h-11 w-full items-center justify-center rounded-md border border-brass/50 bg-transparent px-6 py-3 text-sm font-semibold tracking-wide text-zinc-200 transition-colors hover:border-brass hover:bg-brass/5 hover:text-tan active:scale-[0.99] sm:w-auto sm:min-w-[10.5rem] sm:px-8 sm:py-3.5';

const btnSection =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-brass bg-black px-5 py-3 text-[13px] font-semibold tracking-wide text-tan transition-all duration-300 hover:border-brass-deep hover:bg-neutral-950 hover:text-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40 active:scale-[0.99] sm:w-auto sm:min-w-[10.25rem] sm:px-7 sm:py-3.5';

function SectionActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-10 flex w-full max-w-lg flex-col gap-3 border-t border-white/[0.06] pt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section I — Hero                                                    */
/* ------------------------------------------------------------------ */

function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100svh-3.5rem)] flex-col justify-start overflow-hidden border-b border-white/[0.06] bg-dark-gray sm:min-h-[calc(100svh-3.75rem)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_-15%,rgba(46,90,58,0.12),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_85%_85%,rgba(210,180,140,0.07),transparent_55%)]"
        aria-hidden
      />
      <div className="relative z-10 mx-auto w-full max-w-content layout-gutter pb-16 pt-20 sm:pb-20 sm:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.88fr] lg:gap-14">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeLux }}
          >
            <p className="sc-serif mb-5 text-[11px] text-zinc-400">
              <span className="font-display text-[14px] tracking-[0.2em] text-tan/90">general.exchange</span>
            </p>
            <h1 className="text-pretty font-display text-[clamp(2rem,7vw,3.75rem)] font-normal leading-[1.05] tracking-[-0.02em] text-neutral-50">
              Every decision, settled on evidence before it is made.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base font-normal leading-[1.75] text-zinc-400 sm:text-lg">
              A terminal for traders who would rather know than guess. Test what you are about to do against the
              conditions that actually occurred — then act on what the record tells you, not on a feeling.
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
              <Link href="/download" className={btnPrimary}>
                Download App
              </Link>
              <Link href="/the-engine" className={btnOutline}>
                Trade Engine
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="relative mx-auto w-full max-w-[18rem] sm:max-w-[22rem] lg:max-w-[26rem] lg:justify-self-end"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: easeLux }}
          >
            {/* Bezel — brass rounded frame, no black outline */}
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[#8B7D6B]/55 shadow-[0_48px_100px_-28px_rgba(0,0,0,0.75)]">
              <Image
                src="/images/generalexchangehorse.png"
                alt="General Exchange — rider crossing the ford at dawn"
                width={994}
                height={1040}
                priority
                className="h-auto w-full object-cover brightness-[0.66] contrast-[1.28] saturate-[0.82] sepia-[0.14]"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(0,0,0,0.42)_100%)]"
                aria-hidden
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function HomepageFullPageSections() {
  return (
    <div className="bg-charcoal text-neutral-100">
      <HeroSection />

      {/* II — Backtesting */}
      <SectionShell
        tone="primary"
        eyebrowNum="II"
        eyebrowLabel="The proving ground"
        ariaLabelledBy="hp-bt-title"
        title={<span id="hp-bt-title">Replay any trade against any environment that ever happened.</span>}
        lede="Run the decision as if for the first time, against the market exactly as it was. See not only what happened, but why it worked in the conditions where it worked — and why it failed in the ones where it did not."
      >
        <div className="mt-10">
          <BacktestIllustration />
        </div>
        <SectionActions>
          <Link href="/backspace" className={btnSection}>
            Open the proving ground
          </Link>
        </SectionActions>
      </SectionShell>

      {/* III — Options intelligence */}
      <SectionShell
        tone="secondary"
        eyebrowNum="III"
        eyebrowLabel="Position clarity"
        ariaLabelledBy="hp-opt-title"
        title={<span id="hp-opt-title">See every dimension of a position — before and after you enter it.</span>}
        lede="Watch how a position bleeds time value, how it responds if the underlying moves two percent in the next hour, how it behaves when volatility expands, and exactly where it needs to be managed or closed. Nothing hidden, nothing assumed."
      >
        <div className="mt-10">
          <OptionsIllustration />
        </div>
        <SectionActions>
          <Link href="/options" className={btnSection}>
            Inspect the chain
          </Link>
        </SectionActions>
      </SectionShell>

      {/* IV — Market intelligence */}
      <SectionShell
        tone="primary"
        eyebrowNum="IV"
        eyebrowLabel="Who, and why"
        ariaLabelledBy="hp-mi-title"
        title={<span id="hp-mi-title">Understand not just what the market is doing, but who is making it happen.</span>}
        lede="The system models institutional positioning, hedging behavior, and the patterns underneath order flow to find the environments where the risk and reward on a strategy is most in your favor. It tells the difference between noise and conviction."
      >
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <MarketIntelIllustration />
          <div className="space-y-5">
            {[
              ['Positioning', 'Where the largest participants are leaning, and how heavily.'],
              ['Hedging pressure', 'The flows that are forced, not chosen — and the levels they cluster around.'],
              ['Conviction', 'Whether activity reflects information, or just movement.'],
            ].map(([h, b]) => (
              <div key={h} className="border-l-2 border-brass/40 pl-4">
                <h3 className="sc-serif text-[13px] text-neutral-50">{h}</h3>
                <p className="mt-1.5 text-[14px] leading-[1.7] text-zinc-400">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      {/* V — Strategy library */}
      <SectionShell
        tone="secondary"
        eyebrowNum="V"
        eyebrowLabel="Versioned & portable"
        ariaLabelledBy="hp-lib-title"
        title={<span id="hp-lib-title">Build a strategy, test it, and keep every version of its results beside it.</span>}
        lede="Each strategy is versioned and portable — stored alongside every backtest it ever produced. Start from your own work, or from a strategy someone else has already proven, and make it yours."
      >
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div className="space-y-5">
            {[
              ['Nothing is lost', 'Every revision and every result is preserved and reproducible.'],
              ['Portable by design', 'Move a strategy between research, paper, and the desk without rewriting it.'],
              ['Start from proven work', 'Fork a published strategy and run it against your own parameters.'],
            ].map(([h, b]) => (
              <div key={h} className="border-l-2 border-brass/40 pl-4">
                <h3 className="sc-serif text-[13px] text-neutral-50">{h}</h3>
                <p className="mt-1.5 text-[14px] leading-[1.7] text-zinc-400">{b}</p>
              </div>
            ))}
          </div>
          <StrategyLibraryIllustration />
        </div>
        <SectionActions>
          <Link href="/dashboard" className={btnSection}>
            Browse the library
          </Link>
        </SectionActions>
      </SectionShell>

      {/* VI — Institutional data access */}
      <SectionShell
        tone="primary"
        eyebrowNum="VI"
        eyebrowLabel="For institutions"
        ariaLabelledBy="hp-data-title"
        title={<span id="hp-data-title">The access layer you have been looking for.</span>}
        lede="If you need institutional market data, options analytics, or computed signals to power your own systems, the platform's infrastructure is available to your firm directly. One access layer, built to be relied on."
      >
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <DataAccessIllustration />
          <div className="space-y-5">
            {[
              ['Market data', 'The same record the platform itself runs on.'],
              ['Options analytics', 'Every sensitivity, surface, and flow measure, computed and ready.'],
              ['Computed signals', 'Delivered to your systems, with the timestamp of the data behind them.'],
            ].map(([h, b]) => (
              <div key={h} className="border-l-2 border-brass/40 pl-4">
                <h3 className="sc-serif text-[13px] text-neutral-50">{h}</h3>
                <p className="mt-1.5 text-[14px] leading-[1.7] text-zinc-400">{b}</p>
              </div>
            ))}
            <Link href="/pricing" className={btnSection}>
              Talk to us about access
            </Link>
          </div>
        </div>
      </SectionShell>

      {/* VII — Trust & audit */}
      <SectionShell
        tone="secondary"
        verticalRhythm="lastOnPage"
        eyebrowNum="VII"
        eyebrowLabel="Provenance"
        ariaLabelledBy="hp-trust-title"
        title={<span id="hp-trust-title">If a number is wrong, you can find out exactly why.</span>}
        lede="Every signal, every backtest, and every computation traces back to the raw data that produced it. Nothing is a black box. When you need to defend a number, the whole chain is there."
      >
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <LineageIllustration />
          <div>
            <blockquote className="border-l-2 border-brass pl-5 text-pretty text-[15px] leading-[1.75] text-zinc-300 sm:text-base">
              The point of provenance is not bookkeeping. It is the difference between a result you can stand behind in
              front of a risk committee and one you simply hope is right. Here, every figure is the end of a chain you
              can walk, all the way back to the tick.
            </blockquote>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/request-access" className={btnPrimary}>
                Request access
              </Link>
              <Link href="/our-story" className={btnOutline}>
                Our story
              </Link>
            </div>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}
