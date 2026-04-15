'use client';

import React, { useId, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { IntelligenceRibbonProps, VolRegime } from './mockMlDashboardData';

const easeLuxury = [0.22, 1, 0.36, 1] as const;

function bandAccent(band: IntelligenceRibbonProps['edgeBand']): string {
  if (band === 'strong') return 'border-emerald-500/35 bg-emerald-500/[0.06]';
  if (band === 'weak') return 'border-rose-500/35 bg-rose-500/[0.06]';
  return 'border-cyan-500/30 bg-cyan-500/[0.05]';
}

function volRegimeStyles(regime: VolRegime): { badge: string; label: string } {
  if (regime === 'controlled')
    return { badge: 'text-emerald-300/95 border-emerald-500/35 bg-emerald-500/10', label: 'Controlled' };
  if (regime === 'elevated')
    return { badge: 'text-amber-200/95 border-amber-500/35 bg-amber-500/10', label: 'Elevated' };
  return { badge: 'text-rose-200/95 border-rose-500/40 bg-rose-500/12', label: 'Stress' };
}

function hitRateSparkPath(values: number[], w = 120, h = 36, pad = 4): string {
  if (values.length === 0) return '';
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const span = Math.max(0.001, max - min);
  return values
    .map((v, i) => {
      const x = pad + (i / Math.max(1, values.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / span) * (h - pad * 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function HitRateSparkline({ values }: { values: number[] }) {
  const w = 120;
  const h = 36;
  const path = hitRateSparkPath(values, w, h);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0 text-zinc-400" aria-hidden>
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-tan/70"
      />
    </svg>
  );
}

export const IntelligenceStatusBar: React.FC<IntelligenceRibbonProps> = (ribbon) => {
  const [modelOpen, setModelOpen] = useState(false);
  const panelId = useId();
  const volMax = Math.max(ribbon.rvPct, ribbon.ivPct, 1);
  const volStyles = volRegimeStyles(ribbon.volRegime);

  return (
    <motion.div
      className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5"
      aria-label="Session intelligence"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easeLuxury }}
    >
      {/* Model + edge headline (opens detail) */}
      <div className={`rounded-2xl border p-4 sm:p-5 ${bandAccent(ribbon.edgeBand)}`}>
        <button
          type="button"
          className="w-full text-left group"
          aria-expanded={modelOpen}
          aria-controls={panelId}
          onClick={() => setModelOpen((o) => !o)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-1.5">Active edge</p>
              <p className="text-sm sm:text-base font-semibold text-white leading-snug">{ribbon.edgeTitle}</p>
              <p className="mt-1.5 text-xs text-zinc-500 flex items-center gap-1.5">
                <span className="truncate">{ribbon.modelSlug}</span>
                <ChevronRight
                  size={14}
                  className={`shrink-0 text-tan/70 transition-transform ${modelOpen ? 'rotate-90' : 'group-hover:translate-x-0.5'}`}
                  aria-hidden
                />
              </p>
            </div>
            <ChevronDown
              size={18}
              className={`shrink-0 text-zinc-500 transition-transform mt-0.5 ${modelOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </div>
          <p className="mt-2 text-[11px] text-zinc-600 leading-relaxed">{ribbon.edgeSubtitle}</p>
        </button>
        <AnimatePresence initial={false}>
          {modelOpen ? (
            <motion.div
              id={panelId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: easeLuxury }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Strategy model</p>
                  <p className="text-sm font-medium text-zinc-200 mt-0.5">{ribbon.modelName}</p>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{ribbon.modelDescription}</p>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Win rate (mock)</p>
                    <p className="text-2xl font-semibold tabular-nums text-tan mt-0.5">{ribbon.winRatePct.toFixed(1)}%</p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">Directional hit rate · rolling book</p>
                  </div>
                  <Link
                    href="/dashboard?tab=backtesting"
                    className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-institutional-green hover:text-tan transition-colors border border-institutional-green/40 rounded-sm px-3 py-2"
                  >
                    Research stack
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Confidence vs hit rate */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5 flex flex-col">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-2">Hit rate context</p>
        <p className="text-sm font-medium text-zinc-200 leading-snug mb-4">{ribbon.confTrendLabel}</p>
        <div className="space-y-3 flex-1">
          <div>
            <div className="flex justify-between text-[11px] text-zinc-500 mb-1">
              <span>This window</span>
              <span className="tabular-nums text-zinc-300 font-medium">{ribbon.winRatePct.toFixed(1)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600/90 to-emerald-400/80"
                style={{ width: `${Math.min(100, ribbon.winRatePct)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-zinc-500 mb-1">
              <span>Prior session</span>
              <span className="tabular-nums text-zinc-400">{ribbon.priorWinRatePct.toFixed(1)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-zinc-600/90"
                style={{ width: `${Math.min(100, ribbon.priorWinRatePct)}%` }}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
          <span className="text-[10px] uppercase tracking-wider text-zinc-600">7d mock path</span>
          <HitRateSparkline values={ribbon.hitRateSpark} />
        </div>
      </div>

      {/* Realized vs implied vol */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Volatility</p>
          <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${volStyles.badge}`}>
            {volStyles.label}
          </span>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed mb-4">{ribbon.volRatioLabel}</p>
        <div className="grid grid-cols-2 gap-4 flex-1 items-end">
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-1">Realized (trail)</p>
            <p className="text-xl font-semibold tabular-nums text-white">{ribbon.rvPct.toFixed(1)}%</p>
            <div className="mt-2 h-24 w-full rounded-sm bg-zinc-900/80 overflow-hidden flex items-end">
              <div
                className="w-full rounded-sm bg-gradient-to-t from-amber-900/50 to-amber-400/70"
                style={{ height: `${Math.min(100, (ribbon.rvPct / volMax) * 100)}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-1">Implied (ATM)</p>
            <p className="text-xl font-semibold tabular-nums text-zinc-200">{ribbon.ivPct.toFixed(1)}%</p>
            <div className="mt-2 h-24 w-full rounded-sm bg-zinc-900/80 overflow-hidden flex items-end">
              <div
                className="w-full rounded-sm bg-gradient-to-t from-zinc-700 to-zinc-400/85"
                style={{ height: `${Math.min(100, (ribbon.ivPct / volMax) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
