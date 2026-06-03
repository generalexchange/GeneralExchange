/**
 * BackSpace showcase page.
 *
 * This route is the product narrative + architecture surface for backtesting.
 * The actual operator workflow is intentionally represented in Dashboard.
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { SectionShell } from '@/components/homepage/SectionShell';
import { BacktestIllustration } from '@/components/homepage/HomepageProductIllustrations';

const easeLux = [0.22, 1, 0.36, 1] as const;
const panel = 'rounded-lg border border-white/[0.08] bg-charcoal/65';
const btnPrimary =
  'inline-flex min-h-11 w-full items-center justify-center rounded-md bg-tan px-6 py-3 text-sm font-semibold tracking-wide text-charcoal shadow-[0_12px_40px_-12px_rgba(210,180,140,0.35)] transition-all duration-300 hover:bg-tan-muted active:scale-[0.99] sm:w-auto sm:min-w-[10.5rem] sm:px-8 sm:py-3.5';
const btnOutline =
  'inline-flex min-h-11 w-full items-center justify-center rounded-md border border-brass/50 bg-transparent px-6 py-3 text-sm font-semibold tracking-wide text-zinc-200 transition-colors hover:border-brass hover:bg-brass/5 hover:text-tan active:scale-[0.99] sm:w-auto sm:min-w-[10.5rem] sm:px-8 sm:py-3.5';

function LlmHeroCard() {
  return (
    <div className={`${panel} overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.04] px-4 py-2.5">
        <span className="sc-serif text-[10px] text-zinc-400">BackSpace LLM · decision explanation layer</span>
        <span className="rounded-full border border-moss/40 bg-moss/10 px-2 py-0.5 text-[9px] font-medium text-moss">
          HUMAN-READABLE
        </span>
      </div>
      <div className="p-4 font-mono text-[12px] text-zinc-400">
        <p>
          {'>'} Why did this strategy degrade in elevated volatility during Q4?
        </p>
        <p className="mt-3 text-zinc-300">
          The model identifies two drivers: spread expansion reduced fill quality, and entry timing drifted into low-liquidity windows.
        </p>
        <p className="mt-2 text-zinc-300">
          Suggested review: tighten liquidity filter, constrain entry to high-participation intervals, rerun by regime segment.
        </p>
        <p className="mt-4 border-t border-white/[0.08] pt-3 text-[11px] text-zinc-500">
          Decision support only. The assistant explains outcomes and tradeoffs; it does not auto-route trades.
        </p>
      </div>
    </div>
  );
}

export const Backspace: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />
      <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        <section className="relative overflow-hidden border-b border-white/[0.06] bg-dark-gray">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_-20%,rgba(46,90,58,0.11),transparent_56%)]"
            aria-hidden
          />
          <div className="relative z-10 mx-auto w-full max-w-content layout-gutter py-16 sm:py-20 lg:py-28">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeLux }}
            >
              <p className="sc-serif mb-3 text-[11px] font-medium text-zinc-400 sm:text-xs">
                <span className="font-display text-[14px] not-italic tracking-[0.2em] text-tan/90">BackSpace</span>
                <span className="mx-2 text-zinc-600 sm:mx-3">/</span>
                <span className="text-zinc-400">LLM backtesting showcase</span>
              </p>
              <h1 className="max-w-4xl text-pretty font-display text-[clamp(2rem,7vw,3.75rem)] font-normal leading-[1.05] tracking-[-0.02em] text-neutral-50">
                The backtesting lab, interpreted in plain English by the LLM layer.
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-base font-normal leading-[1.75] text-zinc-400 sm:text-lg">
                Before any deep analytics, users get a clear narrative of what changed, where performance held, and why a
                strategy failed in specific environments. The LLM component translates quantitative backtest output into
                operator-ready decision context.
              </p>
              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
                <Link href="/dashboard" className={btnPrimary}>
                  Open Dashboard
                </Link>
                <Link href="/tradeengine" className={btnOutline}>
                  Trade Engine
                </Link>
              </div>
              <div className="mt-12">
                <LlmHeroCard />
              </div>
            </motion.div>
          </div>
        </section>

        <SectionShell
          tone="primary"
          eyebrowNum="I"
          eyebrowLabel="LLM interpretation layer"
          ariaLabelledBy="backspace-llm-layer"
          title={<span id="backspace-llm-layer">The first read is narrative, not raw tables.</span>}
          lede="BackSpace runs deterministic calculations first, then the LLM layer explains outcomes in plain language: what improved, what degraded, and which conditions actually drove the result. This keeps the desk fast without hiding the underlying evidence."
        >
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {[
              ['Regime-aware explanation', 'Summaries are segmented by trend, compression, and volatility expansion regimes.'],
              ['Parameter sensitivity narrative', 'The assistant explains why sizing, slippage, or entry rules altered outcomes.'],
              ['Audit-friendly output', 'Narratives tie back to run metadata so every statement is traceable to a result set.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-lg border border-white/[0.08] bg-dark-gray/55 p-5">
                <h3 className="sc-serif text-[13px] text-neutral-100">{title}</h3>
                <p className="mt-2 text-[13px] leading-[1.75] text-zinc-400">{body}</p>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          tone="secondary"
          eyebrowNum="II"
          eyebrowLabel="Backtest compute foundation"
          ariaLabelledBy="backspace-compute"
          title={<span id="backspace-compute">Deterministic computation still drives every run.</span>}
          lede="The LLM does not replace the engine. It sits on top of reproducible calculations: historical replay, environment breakdowns, slippage modeling, and run-level metrics. Narrative quality only matters if the compute substrate is defensible."
        >
          <div className="mt-8">
            <BacktestIllustration />
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {[
              ['Historical replay', 'Run the decision against the exact market context it originally faced.'],
              ['Environment diagnostics', 'Break performance out by regime to identify where strategy edges collapse.'],
              ['Lineage & reproducibility', 'Each run keeps its seed, params, and source revision for exact reruns.'],
            ].map(([title, body]) => (
              <div key={title} className="border-l-2 border-brass/40 pl-4">
                <h3 className="sc-serif text-[13px] text-neutral-50">{title}</h3>
                <p className="mt-1.5 text-[14px] leading-[1.7] text-zinc-400">{body}</p>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          tone="primary"
          eyebrowNum="III"
          eyebrowLabel="Dashboard direction"
          ariaLabelledBy="backspace-dashboard-direction"
          title={<span id="backspace-dashboard-direction">Backtesting in Dashboard is now LLM-first.</span>}
          lede="The Dashboard backtesting component is aligned to this direction: an interactive LLM assistant that reads run context and helps users refine hypotheses. This keeps the workflow ready for a future fork to a specialized model stack."
          verticalRhythm="lastOnPage"
        >
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div className={panel}>
              <div className="border-b border-white/[0.08] bg-white/[0.04] px-4 py-2.5">
                <p className="sc-serif text-[10px] text-zinc-400">Dashboard component plan · LLM backtesting assistant</p>
              </div>
              <div className="space-y-3 p-4 text-[13px] leading-[1.75] text-zinc-400">
                <p>
                  The tab is positioned as an operator assistant: ask why drawdown clustered, compare two runs, and get
                  suggested next experiments before re-running compute.
                </p>
                <p>
                  It is built as a modular UI surface so you can fork the model provider later without redesigning the
                  surrounding dashboard workflow.
                </p>
                <p className="border-t border-white/[0.08] pt-3 text-zinc-500">
                  Current product stance: explain and prioritize decisions, never auto-execute positions.
                </p>
              </div>
            </div>
            <div className="space-y-5">
              {[
                ['Fork-ready interface', 'Prompt and response surface designed to be provider-agnostic.'],
                ['Run-context aware', 'Assistant phrasing assumes run ids, environment slices, and model metadata.'],
                ['Execution boundary', 'No direct trade routing from assistant output.'],
              ].map(([title, body]) => (
                <div key={title} className="border-l-2 border-brass/40 pl-4">
                  <h3 className="sc-serif text-[13px] text-neutral-50">{title}</h3>
                  <p className="mt-1.5 text-[14px] leading-[1.7] text-zinc-400">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionShell>
      </div>
      <InstitutionalFooter />
    </div>
  );
};
