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
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import { motion } from 'framer-motion';
import { SectionShell } from '@/components/homepage/SectionShell';
import {
  ExecutionIntegrationIllustration,
  MarketIntelIllustration,
  StrategyLibraryIllustration,
  WarehouseServiceIllustration,
  DataAccessIllustration,
  CommoditiesIllustration,
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

const HERO_TYPEWRITER_WORDS = ['Buy', 'Sell', 'Exchange'] as const;
const HERO_TYPEWRITER_DELAY_MS = 2800;
const HERO_TYPEWRITER_EXCHANGE_DELAY_MS = 5200;

function HeroTypewriter() {
  const [delaySpeed, setDelaySpeed] = React.useState(HERO_TYPEWRITER_DELAY_MS);

  const [text] = useTypewriter({
    words: [...HERO_TYPEWRITER_WORDS],
    loop: 0,
    typeSpeed: 70,
    deleteSpeed: 50,
    delaySpeed,
    onType: (loopCount) => {
      setDelaySpeed(
        loopCount % HERO_TYPEWRITER_WORDS.length === HERO_TYPEWRITER_WORDS.length - 1
          ? HERO_TYPEWRITER_EXCHANGE_DELAY_MS
          : HERO_TYPEWRITER_DELAY_MS,
      );
    },
  });

  return (
    <>
      <span>{text}</span>
      <Cursor cursorStyle="|" />
    </>
  );
}

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
      <div className="relative z-10 mx-auto w-full max-w-content layout-gutter pb-16 pt-[5.5rem] sm:pb-20 sm:pt-[6.5rem]">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.96fr] lg:gap-14">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeLux }}
          >
            <p className="sc-serif mb-5 text-[11px] text-zinc-400">
              <span className="font-display text-[14px] tracking-[0.2em] text-tan/90">By: Old West Solutions</span>
            </p>
            <h1 className="text-pretty font-display text-[clamp(2rem,7vw,3.75rem)] font-normal leading-[1.05] tracking-[-0.02em] text-neutral-50">
              <HeroTypewriter />
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
            className="relative mx-auto w-full max-w-[21rem] sm:max-w-[25rem] lg:max-w-[30rem] lg:justify-self-end"
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

      {/* II — Interactive Brokers execution */}
      <SectionShell
        tone="primary"
        eyebrowNum="II"
        eyebrowLabel="Execution"
        ariaLabelledBy="hp-exec-title"
        title={<span id="hp-exec-title">Interactive Brokers execution, embedded directly into the workflow.</span>}
        lede="Route orders through Interactive Brokers from the same terminal where the strategy is researched and validated. Every submission carries pre-trade controls, policy checks, and an audit trail from decision to fill."
      >
        <div className="mt-10">
          <ExecutionIntegrationIllustration />
        </div>
        <SectionActions>
          <Link href="/trade-engine" className={btnSection}>
            Interactive Brokers
          </Link>
        </SectionActions>
      </SectionShell>

      {/* III — Data warehouse */}
      <SectionShell
        tone="secondary"
        eyebrowNum="III"
        eyebrowLabel="The warehouse"
        ariaLabelledBy="hp-wh-title"
        title={<span id="hp-wh-title">Warehouse service: one normalized source for every model, chart, and run.</span>}
        lede="The warehouse service publishes strategy-ready parameters — regime, sentiment, liquidity state, volatility state, and flow structure — from a point-in-time governed record. Core snapshots are archived through floppydisk.cc and IPFS content-addressed layers so retrieval stays deterministic."
      >
        <div className="mt-10">
          <WarehouseServiceIllustration />
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div className="space-y-5">
            {[
              ['Regime + sentiment', 'Market state and directional pressure features produced from unified price, flow, and volatility datasets.'],
              ['Execution parameters', 'Liquidity depth, spread stress, and venue quality parameters exposed for route and sizing decisions.'],
              ['Storage and lineage', 'Versioned snapshots persisted with floppydisk.cc and IPFS CIDs so each run can recover the exact source state.'],
            ].map(([h, b]) => (
              <div key={h} className="border-l-2 border-brass/40 pl-4">
                <h3 className="sc-serif text-[13px] text-neutral-50">{h}</h3>
                <p className="mt-1.5 text-[14px] leading-[1.7] text-zinc-400">{b}</p>
              </div>
            ))}
          </div>
          <MarketIntelIllustration />
        </div>
        <SectionActions>
          <Link href="/warehouse" className={btnSection}>
            The Warehouse
          </Link>
        </SectionActions>
      </SectionShell>

      {/* IV — Backtesting */}
      <SectionShell
        tone="primary"
        eyebrowNum="IV"
        eyebrowLabel="Backtesting"
        ariaLabelledBy="hp-bt-title"
        title={<span id="hp-bt-title">Graduate-level backtesting for regime-aware strategy design.</span>}
        lede="Run path-dependent simulations with realistic fills, slippage modeling, spread-aware execution assumptions, and environment segmentation. A plain-English LLM research assistant summarizes what changed across regimes and highlights why a strategy held up or failed before risk goes live."
      >
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <MarketIntelIllustration />
          <div className="space-y-5">
            {[
              ['Historical accuracy', 'Tested against the real record — actual prices, actual spreads, actual conditions on that day.'],
              ['Environment breakdown', 'Results broken down by market regime so you know where a strategy earns and where it does not.'],
              ['Reproducibility', 'Every run is saved and traceable. The result you see today is the same one you can defend tomorrow.'],
            ].map(([h, b]) => (
              <div key={h} className="border-l-2 border-brass/40 pl-4">
                <h3 className="sc-serif text-[13px] text-neutral-50">{h}</h3>
                <p className="mt-1.5 text-[14px] leading-[1.7] text-zinc-400">{b}</p>
              </div>
            ))}
          </div>
        </div>
        <SectionActions>
          <Link href="/backspace" className={btnSection}>
            BackSpace
          </Link>
        </SectionActions>
      </SectionShell>

      {/* V — Strategy library */}
      <SectionShell
        tone="secondary"
        eyebrowNum="V"
        eyebrowLabel="Research Library"
        ariaLabelledBy="hp-lib-title"
        title={<span id="hp-lib-title">Build, fork, and govern strategy research in one institutional library.</span>}
        lede="The library keeps strategy logic, parameter sets, and every historical run versioned together. Teams can branch, review, and promote research to production without losing provenance or reproducibility."
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

      {/* VI — Newspaper */}
      <SectionShell
        tone="primary"
        eyebrowNum="VI"
        eyebrowLabel="Newspaper"
        ariaLabelledBy="hp-data-title"
        title={<span id="hp-data-title">The market newspaper for decision-makers.</span>}
        lede="Bridge Observer distills the live market record into a readable intelligence layer for the desk: what changed, who moved size, where pressure is building, and which environments are strengthening or breaking down."
      >
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <DataAccessIllustration />
          <div className="space-y-5">
            {[
              ['Market narrative', 'Session-level context on participation, pressure, and structural changes that matter now.'],
              ['Flow intelligence', 'Institutional prints, options flow, and liquidity shifts translated into an actionable brief.'],
              ['Execution context', 'Where conditions are favorable or hostile before risk is committed to the tape.'],
            ].map(([h, b]) => (
              <div key={h} className="border-l-2 border-brass/40 pl-4">
                <h3 className="sc-serif text-[13px] text-neutral-50">{h}</h3>
                <p className="mt-1.5 text-[14px] leading-[1.7] text-zinc-400">{b}</p>
              </div>
            ))}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/bridge-observer" className={btnSection}>
                Bridge Observer
              </Link>
              <Link href="/rockefeller-press" className={btnSection}>
                Rockefeller Press
              </Link>
            </div>
          </div>
        </div>
      </SectionShell>

      {/* VII — Commodities */}
      <SectionShell
        tone="secondary"
        verticalRhythm="lastOnPage"
        eyebrowNum="VII"
        eyebrowLabel="Commodities"
        ariaLabelledBy="hp-trust-title"
        title={<span id="hp-trust-title">Alternative commodity markets, transactable with the same research standard.</span>}
        lede="Trade and hedge beyond equities with commodity workflows built for real execution: energy, metals, agriculture, and related basis structures — all with replayable context, margin-aware controls, and decision-ready analytics."
      >
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <CommoditiesIllustration />
          <div>
            <blockquote className="border-l-2 border-brass pl-5 text-pretty text-[15px] leading-[1.75] text-zinc-300 sm:text-base">
              Commodities are not a side panel. They are a first-class risk lane with their own inventory cycles,
              delivery constraints, and cross-market dependencies. Here, users can rehearse those dynamics before
              committing capital, then execute with the same discipline used across the rest of the platform.
            </blockquote>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/town-and-cattle" className={btnPrimary}>
                Town & Cattle
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
