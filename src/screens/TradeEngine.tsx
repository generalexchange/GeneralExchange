/**
 * TradeEngine explanation page (/tradeengine).
 * Immersive, full-width showcase of how the Monte Carlo layer works.
 */

'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { SectionShell } from '@/components/homepage/SectionShell';
import {
  AnalyticsEngineStrip,
  FanChartIllustration,
  MonteCarloPipelineIllustration,
  OptionsChainEarnPicker,
  RiskParametersIllustration,
  SimulationModesIllustration,
  TerminalDistributionIllustration,
  WinRateLiveSim,
} from '@/components/tradeengine/TradeEngineShowcase';

const easeLux = [0.22, 1, 0.36, 1] as const;
const btnPrimary =
  'inline-flex min-h-11 w-full items-center justify-center rounded-md bg-tan px-6 py-3 text-sm font-semibold tracking-wide text-charcoal shadow-[0_12px_40px_-12px_rgba(210,180,140,0.35)] transition-all duration-300 hover:bg-tan-muted active:scale-[0.99] sm:w-auto sm:min-w-[10.5rem] sm:px-8 sm:py-3.5';
const btnOutline =
  'inline-flex min-h-11 w-full items-center justify-center rounded-md border border-brass/50 bg-transparent px-6 py-3 text-sm font-semibold tracking-wide text-zinc-200 transition-colors hover:border-brass hover:bg-brass/5 hover:text-tan active:scale-[0.99] sm:w-auto sm:min-w-[10.5rem] sm:px-8 sm:py-3.5';

function useParallax(range: [number, number]) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], range);
  return { ref, y };
}

interface StickyParallaxSectionProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  visualY: MotionValue<number>;
  tone?: 'primary' | 'secondary';
  reversed?: boolean;
  copy: React.ReactNode;
  visual: React.ReactNode;
}

function StickyParallaxSection({
  scrollRef,
  visualY,
  tone = 'primary',
  reversed = false,
  copy,
  visual,
}: StickyParallaxSectionProps) {
  const bg = tone === 'primary' ? 'bg-charcoal' : 'bg-dark-gray';
  return (
    <div ref={scrollRef} className={`relative ${bg} border-b border-white/[0.06]`}>
      <div className="mx-auto w-full max-w-content layout-gutter py-16 sm:py-24 lg:min-h-[min(100dvh,960px)] lg:py-28">
        <div
          className={`grid items-start gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24 ${reversed ? 'lg:[direction:rtl]' : ''}`}
        >
          <div className={`lg:sticky lg:top-[calc(4.5rem+env(safe-area-inset-top))] lg:py-6 ${reversed ? 'lg:[direction:ltr]' : ''}`}>
            {copy}
          </div>
          <motion.div style={{ y: visualY }} className={`will-change-transform ${reversed ? 'lg:[direction:ltr]' : ''}`}>
            {visual}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export const TradeEngine: React.FC = () => {
  const fan = useParallax([80, -80]);
  const dist = useParallax([60, -60]);
  const risk = useParallax([-50, 50]);
  const chain = useParallax([70, -70]);

  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        {/* Hero — 01 Win rate */}
        <section
          className="relative border-b border-white/[0.06] bg-dark-gray md:min-h-[min(100dvh,920px)]"
          aria-labelledby="trade-engine-title"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-20%,rgba(46,90,58,0.1),transparent_55%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_90%_90%,rgba(210,180,140,0.08),transparent_55%)]"
            aria-hidden
          />
          <div className="relative z-10 mx-auto w-full max-w-content layout-gutter py-16 sm:py-20 lg:flex lg:min-h-[min(100dvh,920px)] lg:flex-col lg:justify-center lg:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 xl:gap-20">
              <div>
                <p className="sc-serif mb-3 text-[11px] font-medium text-zinc-400 sm:text-xs">
                  <span className="font-display text-[14px] not-italic tracking-[0.2em] text-tan/90">I</span>
                  <span className="mx-2 text-zinc-600 sm:mx-3">/</span>
                  <span className="text-zinc-400">Win rate · active trading</span>
                </p>
                <motion.h1
                  id="trade-engine-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, ease: easeLux }}
                  className="max-w-3xl text-pretty font-display text-[clamp(2.25rem,5.5vw,3.75rem)] font-medium leading-[1.08] tracking-tight text-neutral-100"
                >
                  TradeEngine
                </motion.h1>
                <p className="mt-4 max-w-xl text-pretty text-lg font-light leading-relaxed text-zinc-300 sm:text-xl sm:leading-[1.65]">
                  Decide what you want to earn. The engine computes the path.
                </p>
                <p className="mt-5 max-w-xl text-pretty text-base font-light leading-relaxed text-zinc-500 sm:text-[15px] sm:leading-[1.7]">
                  Every setup runs through thousands of simulated futures before risk is committed.
                  Monte Carlo turns an edge into a win rate, a win rate into risk parameters, and
                  risk parameters into an expected return you can choose — directly in the options chain.
                </p>
                <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row">
                  <Link href="/request-access" className={btnPrimary}>
                    Request access
                  </Link>
                  <Link href="/warehouse" className={btnOutline}>
                    The Warehouse
                  </Link>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: easeLux, delay: 0.12 }}
              >
                <WinRateLiveSim />
              </motion.div>
            </div>
          </div>
        </section>

        {/* II — How data flows into Monte Carlo */}
        <SectionShell
          tone="primary"
          eyebrowNum="II"
          eyebrowLabel="Data processing"
          ariaLabelledBy="te-pipeline"
          title={<span id="te-pipeline">How the engine processes data before a trade is sized.</span>}
          lede="The Warehouse publishes volatility, drift, regime, flow structure, and win-rate priors. The Monte Carlo layer consumes those inputs, runs thousands of seeded simulations, and emits a full distribution — not a single forecast. That distribution is what sets risk parameters and prices the chain."
        >
          <div className="mt-10 space-y-8">
            <MonteCarloPipelineIllustration />
            <SimulationModesIllustration />
          </div>
        </SectionShell>

        {/* III — Fan chart (parallax) */}
        <StickyParallaxSection
          scrollRef={fan.ref}
          visualY={fan.y}
          tone="secondary"
          copy={
            <>
              <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-tan/90">
                III · Simulation
              </p>
              <h2 className="font-display text-[clamp(1.75rem,3.8vw,2.75rem)] font-medium leading-[1.1] tracking-tight text-neutral-100">
                Thousands of futures, not one forecast.
              </h2>
              <p className="mt-5 max-w-lg text-[15px] font-light leading-relaxed text-zinc-400 sm:text-base sm:leading-[1.75]">
                Geometric Brownian motion draws path after path from the asset&apos;s volatility and drift.
                The engine keeps every step — median, likely band, and tails — so you see the full shape of
                what could happen over the horizon, not a single price target.
              </p>
              <dl className="mt-8 grid grid-cols-3 gap-5">
                {[
                  ['1,400', 'paths'],
                  ['42', 'steps'],
                  ['seeded', 'auditable'],
                ].map(([v, k]) => (
                  <div key={k} className="border-l-2 border-brass/45 pl-3">
                    <dt className="font-mono text-xl tabular-nums text-tan">{v}</dt>
                    <dd className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">{k}</dd>
                  </div>
                ))}
              </dl>
            </>
          }
          visual={<FanChartIllustration />}
        />

        {/* IV — Terminal distribution (parallax) */}
        <StickyParallaxSection
          scrollRef={dist.ref}
          visualY={dist.y}
          tone="primary"
          reversed
          copy={
            <>
              <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-tan/90">
                IV · Distribution
              </p>
              <h2 className="font-display text-[clamp(1.75rem,3.8vw,2.75rem)] font-medium leading-[1.1] tracking-tight text-neutral-100">
                Every outcome, counted.
              </h2>
              <p className="mt-5 max-w-lg text-[15px] font-light leading-relaxed text-zinc-400 sm:text-base sm:leading-[1.75]">
                When the simulations finish, terminal prices collapse into a probability distribution.
                That histogram is the object the engine reads — where mass clusters, where the tails sit,
                and how much of the future finishes above or below spot.
              </p>
            </>
          }
          visual={<TerminalDistributionIllustration />}
        />

        {/* V — Risk parameters (parallax) */}
        <StickyParallaxSection
          scrollRef={risk.ref}
          visualY={risk.y}
          tone="secondary"
          copy={
            <>
              <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-tan/90">
                V · Risk parameters
              </p>
              <h2 className="font-display text-[clamp(1.75rem,3.8vw,2.75rem)] font-medium leading-[1.1] tracking-tight text-neutral-100">
                The distribution becomes your risk parameters.
              </h2>
              <p className="mt-5 max-w-lg text-[15px] font-light leading-relaxed text-zinc-400 sm:text-base sm:leading-[1.75]">
                Expected price, probability of finishing up, outcome bands, downside tail, and Kelly-optimal
                size all fall out of the same simulated record. No round numbers, no gut feel — just
                statistics from the futures you already ran.
              </p>
            </>
          }
          visual={<RiskParametersIllustration />}
        />

        {/* VI — Options chain (parallax) */}
        <StickyParallaxSection
          scrollRef={chain.ref}
          visualY={chain.y}
          tone="primary"
          copy={
            <>
              <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-tan/90">
                VI · Options chain
              </p>
              <h2 className="font-display text-[clamp(1.75rem,3.8vw,2.75rem)] font-medium leading-[1.1] tracking-tight text-neutral-100">
                Pick how much you want to earn.
              </h2>
              <p className="mt-5 max-w-lg text-[15px] font-light leading-relaxed text-zinc-400 sm:text-base sm:leading-[1.75]">
                The same distribution prices every strike. Black–Scholes supplies premium and delta;
                Monte Carlo supplies P(ITM) and expected return. Choose the payoff you want — the engine
                shows the trade that targets it and the odds you are paying for.
              </p>
            </>
          }
          visual={<OptionsChainEarnPicker />}
        />

        {/* VII — Engine stack + close */}
        <SectionShell
          tone="secondary"
          verticalRhythm="lastOnPage"
          eyebrowNum="VII"
          eyebrowLabel="The quantitative stack"
          ariaLabelledBy="te-stack"
          title={<span id="te-stack">One engine, every model, one scorecard.</span>}
          lede="TradeEngine is powered by @gx/analytics — a shared Monte Carlo core surrounded by Black–Scholes, Kelly sizing, GARCH volatility, Bayesian signal fusion, and a master trade evaluation engine. The illustrations on this page run the same code path the terminal uses; what you see here is how the desk gets its numbers."
        >
          <div className="mt-10 space-y-10">
            <AnalyticsEngineStrip />
            <div className="grid gap-6 lg:grid-cols-3">
              {[
                [
                  'Win rate first',
                  'Historical edge and conviction replay trade by trade until a stable rate emerges — live in the hero simulation.',
                ],
                [
                  'Risk second',
                  'The distribution sets bands, tails, and size before any order is staged.',
                ],
                [
                  'Return last',
                  'Every strike carries modeled P(ITM) and expected return so you pick the outcome, not guess the path.',
                ],
              ].map(([h, b]) => (
                <div key={h} className="rounded-lg border border-white/[0.08] bg-charcoal/60 p-5">
                  <h3 className="sc-serif text-[13px] text-neutral-100">{h}</h3>
                  <p className="mt-2 text-[14px] leading-[1.75] text-zinc-400">{b}</p>
                </div>
              ))}
            </div>
            <div className="flex w-full flex-col gap-3 border-t border-white/[0.06] pt-10 sm:flex-row">
              <Link href="/request-access" className={btnPrimary}>
                Request access
              </Link>
              <Link href="/dashboard" className={btnOutline}>
                Open the terminal
              </Link>
            </div>
          </div>
        </SectionShell>
      </div>

      <InstitutionalFooter />
    </div>
  );
};
