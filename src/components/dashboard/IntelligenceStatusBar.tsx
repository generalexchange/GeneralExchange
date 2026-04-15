'use client';

import React, { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { IntelligenceRibbonProps, VolRegime } from './mockMlDashboardData';

const easeLuxury = [0.22, 1, 0.36, 1] as const;

type ModalPanel = 'edge' | 'hitrate' | 'vol' | null;

function bandAccent(band: IntelligenceRibbonProps['edgeBand']): string {
  if (band === 'strong') return 'border-emerald-500/25 hover:border-emerald-500/40';
  if (band === 'weak') return 'border-rose-500/25 hover:border-rose-500/40';
  return 'border-cyan-500/20 hover:border-cyan-500/35';
}

function volRegimeStyles(regime: VolRegime): { badge: string; label: string } {
  if (regime === 'controlled')
    return { badge: 'text-emerald-300/90 border-emerald-500/30 bg-emerald-500/10', label: 'Controlled' };
  if (regime === 'elevated')
    return { badge: 'text-amber-200/90 border-amber-500/30 bg-amber-500/10', label: 'Elevated' };
  return { badge: 'text-rose-200/90 border-rose-500/35 bg-rose-500/12', label: 'Stress' };
}

function hitRateSparkPath(values: number[], w = 140, h = 40, pad = 4): string {
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

function HitRateSparkline({ values, w = 140, h = 40 }: { values: number[]; w?: number; h?: number }) {
  const path = hitRateSparkPath(values, w, h);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="text-zinc-400" aria-hidden>
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

function IntelligenceModal({
  open,
  panel,
  ribbon,
  onClose,
}: {
  open: boolean;
  panel: Exclude<ModalPanel, null>;
  ribbon: IntelligenceRibbonProps;
  onClose: () => void;
}) {
  const titleId = useId();
  const volMax = Math.max(ribbon.rvPct, ribbon.ivPct, 1);
  const volStyles = volRegimeStyles(ribbon.volRegime);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const titles: Record<Exclude<ModalPanel, null>, string> = {
    edge: 'Active edge & model',
    hitrate: 'Hit rate context',
    vol: 'Volatility readout',
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="intel-modal"
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative flex max-h-[min(90vh,640px)] w-full max-w-lg flex-col rounded-t-xl border border-white/[0.1] bg-[#0a0a0a] shadow-2xl sm:rounded-xl"
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', damping: 32, stiffness: 380 }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-5">
              <h2 id={titleId} className="text-base font-semibold text-white tracking-tight">
                {titles[panel]}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-zinc-500 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 text-sm text-zinc-400">
              {panel === 'edge' && (
                <div className={`rounded-xl border p-4 ${bandAccent(ribbon.edgeBand)} bg-white/[0.02]`}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-2">Headline</p>
                  <p className="text-base font-semibold text-white">{ribbon.edgeTitle}</p>
                  <p className="mt-2 text-xs leading-relaxed">{ribbon.edgeSubtitle}</p>
                  <div className="mt-5 pt-4 border-t border-white/[0.08] space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Strategy model</p>
                      <p className="text-sm font-medium text-zinc-200 mt-1">{ribbon.modelName}</p>
                      <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{ribbon.modelDescription}</p>
                    </div>
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Win rate (mock)</p>
                        <p className="text-2xl font-semibold tabular-nums text-tan mt-1">{ribbon.winRatePct.toFixed(1)}%</p>
                        <p className="text-[11px] text-zinc-600 mt-0.5">Directional hit rate · rolling book</p>
                      </div>
                      <Link
                        href="/dashboard?tab=backtesting"
                        onClick={onClose}
                        className="text-[11px] font-semibold uppercase tracking-wide text-institutional-green hover:text-tan border border-institutional-green/40 rounded-sm px-3 py-2 transition-colors"
                      >
                        Research stack
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              {panel === 'hitrate' && (
                <div className="space-y-5">
                  <p className="text-sm font-medium text-zinc-200">{ribbon.confTrendLabel}</p>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
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
                      <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
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
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-600">7d mock path</span>
                    <HitRateSparkline values={ribbon.hitRateSpark} />
                  </div>
                </div>
              )}
              {panel === 'vol' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${volStyles.badge}`}>
                      {volStyles.label}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">{ribbon.volRatioLabel}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-1">Realized (trail)</p>
                      <p className="text-xl font-semibold tabular-nums text-white">{ribbon.rvPct.toFixed(1)}%</p>
                      <div className="mt-2 h-28 w-full rounded-sm bg-zinc-900/80 overflow-hidden flex items-end">
                        <div
                          className="w-full rounded-sm bg-gradient-to-t from-amber-900/50 to-amber-400/70"
                          style={{ height: `${Math.min(100, (ribbon.rvPct / volMax) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-1">Implied (ATM)</p>
                      <p className="text-xl font-semibold tabular-nums text-zinc-200">{ribbon.ivPct.toFixed(1)}%</p>
                      <div className="mt-2 h-28 w-full rounded-sm bg-zinc-900/80 overflow-hidden flex items-end">
                        <div
                          className="w-full rounded-sm bg-gradient-to-t from-zinc-700 to-zinc-400/85"
                          style={{ height: `${Math.min(100, (ribbon.ivPct / volMax) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const IntelligenceStatusBar: React.FC<IntelligenceRibbonProps> = (ribbon) => {
  const [panel, setPanel] = useState<ModalPanel>(null);
  const volStyles = volRegimeStyles(ribbon.volRegime);

  return (
    <>
      <motion.div
        className="mb-6 flex flex-wrap gap-2 sm:gap-2.5"
        aria-label="Session intelligence — tap for detail"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easeLuxury }}
      >
        <button
          type="button"
          onClick={() => setPanel('edge')}
          className={`min-w-0 flex-1 basis-[calc(50%-0.25rem)] sm:basis-0 sm:flex-1 rounded-lg border bg-white/[0.02] px-2.5 py-2 text-left transition-colors ${bandAccent(ribbon.edgeBand)}`}
          aria-haspopup="dialog"
        >
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Edge</p>
          <p className="mt-0.5 text-[11px] sm:text-xs font-medium text-zinc-200 leading-tight line-clamp-2">{ribbon.edgeTitle}</p>
          <p className="mt-0.5 text-[10px] text-zinc-500 truncate">{ribbon.modelSlug}</p>
        </button>
        <button
          type="button"
          onClick={() => setPanel('hitrate')}
          className="min-w-0 flex-1 basis-[calc(50%-0.25rem)] sm:basis-0 sm:flex-1 rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-2 text-left hover:border-white/15 hover:bg-white/[0.04] transition-colors"
          aria-haspopup="dialog"
        >
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Hit</p>
          <p className="mt-0.5 tabular-nums text-xs sm:text-sm font-medium text-zinc-200">
            {ribbon.winRatePct.toFixed(1)}% <span className="text-zinc-600 font-normal">·</span>{' '}
            {ribbon.priorWinRatePct.toFixed(1)}%
          </p>
          <p className="mt-0.5 text-[10px] text-zinc-500 line-clamp-1">{ribbon.confTrendLabel}</p>
        </button>
        <button
          type="button"
          onClick={() => setPanel('vol')}
          className="min-w-0 flex-[1_1_100%] sm:flex-1 rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-2 text-left hover:border-white/15 hover:bg-white/[0.04] transition-colors"
          aria-haspopup="dialog"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Vol</p>
            <span className={`text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border shrink-0 ${volStyles.badge}`}>
              {volStyles.label}
            </span>
          </div>
          <p className="mt-0.5 tabular-nums text-xs sm:text-sm font-medium text-zinc-200">
            RV {ribbon.rvPct.toFixed(1)}% <span className="text-zinc-600 font-normal">·</span> IV {ribbon.ivPct.toFixed(1)}%
          </p>
        </button>
      </motion.div>

      {panel ? (
        <IntelligenceModal open panel={panel} ribbon={ribbon} onClose={() => setPanel(null)} />
      ) : null}
    </>
  );
};
