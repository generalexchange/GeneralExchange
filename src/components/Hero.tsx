/**
 * Homepage hero — tall institutional band with TradeEngine CTA
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, Brain, Activity } from 'lucide-react';
const LIVE_QUOTES: { symbol: string; pct: number }[] = [
  { symbol: 'AAPL', pct: 1.57 },
  { symbol: 'TSLA', pct: -5.35 },
  { symbol: 'NVDA', pct: 1.83 },
];

const fadeEase = [0.22, 1, 0.36, 1] as const;
const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: fadeEase },
};

export const Hero: React.FC = () => {
  return (
    <section className="relative flex min-h-[min(85vh,800px)] flex-col overflow-hidden border-b border-white/[0.05]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_-15%,rgba(46,90,58,0.12),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_90%_20%,rgba(210,180,140,0.06),transparent_50%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />

      <div className="relative mx-auto flex w-full max-w-content flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <motion.div className="space-y-6 lg:space-y-8" {...fade}>
            <h1 className="font-display text-[2.25rem] sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem] leading-[1.06] font-medium tracking-[-0.02em] text-neutral-50">
              Institutional Risk &amp; Execution on Tokenized Compute
            </h1>

            <p className="text-base sm:text-lg text-neutral-400 max-w-2xl leading-relaxed font-light">
              GPU-accelerated risk engines, backtesting, and governance, integrated with Lubbock.Cloud and AMD-optimized
              workloads.
            </p>

            <ul className="flex flex-wrap gap-2 pt-1" aria-label="Capability highlights">
              {[
                'Advanced Risk & Scenario Engines',
                'Compute-Driven Backtesting & RL Lab',
                'Deterministic Risk-First Execution Loop',
              ].map((label) => (
                <li
                  key={label}
                  className="text-[11px] sm:text-xs font-medium tracking-wide text-neutral-300 border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 rounded-sm"
                >
                  {label}
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <Link
                href="/trade-engine"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-tan text-charcoal text-sm font-semibold tracking-wide rounded-sm hover:bg-tan-muted transition-all duration-300 shadow-[0_12px_40px_-12px_rgba(210,180,140,0.35)]"
              >
                TradeEngine
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: fadeEase }}
          >
            <div className="relative rounded-sm border border-white/[0.08] bg-dark-gray/80 backdrop-blur-xl shadow-[0_32px_64px_-28px_rgba(0,0,0,0.65)] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <span className="text-[10px] font-semibold tracking-[0.2em] text-neutral-500 uppercase">Live book</span>
                <span className="text-[10px] text-institutional-green font-mono tabular-nums px-2 py-0.5 rounded-sm bg-institutional-green/15 border border-institutional-green/25">
                  ACTIVE
                </span>
              </div>
              <div className="p-6 sm:p-7">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase mb-4">Tape snapshot</p>
                <div className="space-y-2.5">
                  {LIVE_QUOTES.map(({ symbol, pct }) => {
                    const up = pct >= 0;
                    return (
                      <div
                        key={symbol}
                        className="flex items-center justify-between py-3.5 px-4 rounded-sm bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-px w-6 ${up ? 'bg-institutional-green' : 'bg-rose-400/70'}`}
                            aria-hidden
                          />
                          <span className="font-mono text-sm font-medium text-neutral-200">{symbol}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm font-medium tabular-nums ${up ? 'text-institutional-green/90' : 'text-rose-400/85'}`}
                          >
                            {up ? '+' : ''}
                            {pct.toFixed(2)}%
                          </span>
                          <Activity className={`w-3.5 h-3.5 ${up ? 'text-institutional-green/50' : 'text-rose-400/50'}`} strokeWidth={1.5} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="hidden sm:block absolute -right-2 top-[18%] w-[min(100%,200px)] p-4 rounded-sm border border-tan/20 bg-dark-gray/95 backdrop-blur-md shadow-lg shadow-black/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-tan" strokeWidth={1.5} />
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Simulation leg</span>
              </div>
              <p className="font-mono text-xs text-neutral-200">MC paths 2.4M</p>
              <p className="text-[10px] text-neutral-600 mt-1">Convergence 99.2%</p>
              <p className="text-sm font-semibold text-tan mt-2 tabular-nums">−VaR 14bp</p>
            </div>
            <div className="hidden sm:block absolute -left-2 bottom-[22%] w-[min(100%,200px)] p-4 rounded-sm border border-institutional-green/25 bg-dark-gray/95 backdrop-blur-md shadow-lg shadow-black/30">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-3.5 h-3.5 text-institutional-green/90" strokeWidth={1.5} />
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Model edge</span>
              </div>
              <p className="text-2xl font-display font-medium text-institutional-green/90 tabular-nums">72%</p>
              <p className="text-[10px] text-neutral-600 mt-1">Trailing 90d · paper</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
