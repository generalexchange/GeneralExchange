'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, History, Layers, Loader2, X } from 'lucide-react';
import {
  useExpiredOutcomes,
  useOpportunityAnalysis,
  useOpportunityDiscovery,
} from '@/hooks/useOpportunityDiscovery';
import type { RankedContract } from '@/lib/opportunity/types';

const FACTOR_LABELS: Record<string, string> = {
  expected_return: 'Expected return',
  probability_of_profit: 'P(profit)',
  liquidity: 'Liquidity',
  spread_quality: 'Spread quality',
  gamma_positioning: 'Gamma positioning',
  monte_carlo: 'Monte Carlo',
};

function glowClass(confidence: number): string {
  if (confidence >= 85) return 'border-amber-400/60 bg-amber-500/10 shadow-[0_0_24px_rgba(251,191,36,0.25)]';
  if (confidence >= 70) return 'border-tan/40 bg-tan/5 shadow-[0_0_16px_rgba(210,180,140,0.15)]';
  return 'border-white/10 bg-charcoal/60';
}

function OpportunityCard({
  opp,
  selected,
  onSelect,
}: {
  opp: RankedContract;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`mb-2 w-full rounded-md border p-2.5 text-left transition-colors ${glowClass(opp.confidence)} ${
        selected ? 'ring-1 ring-tan/50' : 'hover:border-tan/30'
      }`}
    >
      <p className="font-mono text-xs font-semibold text-zinc-100">
        {opp.symbol}{' '}
        <span className={opp.optionType === 'CALL' ? 'text-moss' : 'text-rose-400'}>{opp.optionType}</span> $
        {opp.strike.toFixed(1)}
      </p>
      <p className="mt-0.5 font-mono text-[10px] text-zinc-500">Exp {opp.expiration}</p>
      <div className="mt-2 flex items-center justify-between font-mono text-[10px] tabular-nums">
        <span className="text-moss">+${opp.expectedReturn.toLocaleString()}</span>
        <span className="text-tan">{opp.confidence}% conf</span>
      </div>
      <p className="mt-1 font-mono text-[9px] tabular-nums text-zinc-500">
        Δ {opp.delta.toFixed(2)} · Θ {opp.theta.toFixed(3)} · ν {opp.vega.toFixed(3)}
      </p>
      <p className="mt-1 font-mono text-[8px] uppercase tracking-wide text-zinc-600">Top pick · tap for analysis</p>
    </button>
  );
}

function AnalysisPanel({
  opp,
  loading,
  showChain,
  onToggleChain,
  onClose,
}: {
  opp: RankedContract | null;
  loading: boolean;
  showChain: boolean;
  onToggleChain: () => void;
  onClose: () => void;
}) {
  if (!opp && !loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-white/10 bg-black/30"
    >
      <div className="flex items-center justify-between px-3 py-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-tan">Opportunity analysis</p>
        <button type="button" onClick={onClose} className="rounded p-1 text-zinc-500 hover:text-zinc-200" aria-label="Close">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
        </div>
      ) : opp ? (
        <div className="space-y-3 px-3 pb-3">
          <p className="text-[11px] leading-relaxed text-zinc-300">{opp.analysis.rationale}</p>

          <div className="grid grid-cols-2 gap-2">
            <Stat label="P(ITM)" value={`${opp.monteCarlo.probabilityITM}%`} />
            <Stat label="P(profit)" value={`${opp.monteCarlo.probabilityProfitable}%`} />
            <Stat label="Expected payoff" value={`$${opp.monteCarlo.expectedPayoff.toFixed(2)}`} />
            <Stat label="Composite" value={opp.compositeScore.toFixed(3)} />
          </div>

          <div>
            <p className="mb-1.5 font-mono text-[9px] uppercase tracking-wide text-zinc-500">Ranking factors</p>
            <div className="space-y-1">
              {Object.entries(opp.factorScores).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-28 shrink-0 font-mono text-[9px] text-zinc-500">{FACTOR_LABELS[key] ?? key}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-tan/70" style={{ width: `${Math.round(val * 100)}%` }} />
                  </div>
                  <span className="w-8 font-mono text-[9px] tabular-nums text-zinc-400">{Math.round(val * 100)}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleChain}
            className="flex w-full items-center justify-center gap-1.5 rounded border border-white/10 py-1.5 font-mono text-[9px] uppercase tracking-wide text-zinc-400 hover:border-tan/30 hover:text-tan"
          >
            <Layers className="h-3 w-3" />
            {showChain ? 'Hide full chain' : 'Advanced · full filtered chain'}
            {showChain ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {showChain && opp.chain && opp.chain.length > 0 && (
            <div className="max-h-40 overflow-y-auto rounded border border-white/10">
              <table className="w-full font-mono text-[9px]">
                <thead className="sticky top-0 bg-dark-gray text-zinc-500">
                  <tr>
                    <th className="px-2 py-1 text-left">Type</th>
                    <th className="px-2 py-1 text-right">Strike</th>
                    <th className="px-2 py-1 text-right">Score</th>
                    <th className="px-2 py-1 text-right">P%</th>
                  </tr>
                </thead>
                <tbody>
                  {opp.chain.map((c) => (
                    <tr key={`${c.optionType}-${c.strike}-${c.expiration}`} className="border-t border-white/5 text-zinc-300">
                      <td className="px-2 py-1">{c.optionType}</td>
                      <td className="px-2 py-1 text-right">${c.strike.toFixed(1)}</td>
                      <td className="px-2 py-1 text-right">{c.compositeScore.toFixed(3)}</td>
                      <td className="px-2 py-1 text-right">{c.probabilityOfProfit.toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-white/10 bg-white/[0.03] px-2 py-1.5">
      <p className="font-mono text-[8px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="font-mono text-[11px] tabular-nums text-zinc-200">{value}</p>
    </div>
  );
}

export function OpportunityDiscoveryFeed() {
  const { opportunities, loading, error, refresh } = useOpportunityDiscovery();
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [showChain, setShowChain] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const { analysis, loading: analysisLoading } = useOpportunityAnalysis(selectedSymbol);
  const { data: expiredData, loading: expiredLoading } = useExpiredOutcomes(showExpired);

  const sorted = useMemo(
    () => [...opportunities].sort((a, b) => b.confidence - a.confidence),
    [opportunities],
  );

  const handleSelect = (symbol: string) => {
    setShowChain(false);
    setSelectedSymbol((prev) => (prev === symbol ? null : symbol));
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-white/10 bg-dark-gray/90 shadow-lg backdrop-blur-sm">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-3 py-2.5">
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">Opportunity Discovery</h3>
          <p className="text-[9px] text-zinc-600">1 top contract per symbol · ML-ranked</p>
        </div>
        <button
          type="button"
          onClick={() => refresh()}
          className="font-mono text-[9px] uppercase tracking-wide text-zinc-500 hover:text-tan"
        >
          Refresh
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {loading && sorted.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
          </div>
        ) : error ? (
          <p className="py-6 text-center font-mono text-[10px] text-rose-400">{error}</p>
        ) : (
          sorted.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              selected={selectedSymbol === opp.symbol}
              onSelect={() => handleSelect(opp.symbol)}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedSymbol && (
          <AnalysisPanel
            opp={analysis}
            loading={analysisLoading}
            showChain={showChain}
            onToggleChain={() => setShowChain((v) => !v)}
            onClose={() => setSelectedSymbol(null)}
          />
        )}
      </AnimatePresence>

      <footer className="shrink-0 border-t border-white/10 p-2">
        <button
          type="button"
          onClick={() => setShowExpired((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 rounded border border-white/10 py-2 font-mono text-[10px] uppercase tracking-wide text-zinc-400 transition-colors hover:border-tan/30 hover:text-tan"
        >
          <History className="h-3.5 w-3.5" />
          {showExpired ? 'Hide expired outcomes' : 'View expired outcomes'}
        </button>

        {showExpired && (
          <div className="mt-2 max-h-36 overflow-y-auto rounded border border-white/10 bg-black/20 p-2">
            {expiredLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
              </div>
            ) : expiredData?.outcomes?.length ? (
              <>
                {expiredData.ml.hitRate != null && (
                  <p className="mb-2 font-mono text-[9px] text-zinc-500">
                    ML hit rate {Math.round(expiredData.ml.hitRate * 100)}% · {expiredData.ml.calibrationRuns} calibration
                    runs
                  </p>
                )}
                <ul className="space-y-1.5">
                  {expiredData.outcomes.map((o) => (
                    <li key={o.id} className="font-mono text-[9px] text-zinc-400">
                      {o.symbol} {o.optionType} ${o.strike} — pred {o.confidence}% →{' '}
                      <span className={o.actualProfitable ? 'text-moss' : 'text-rose-400'}>
                        {o.actualProfitable ? 'win' : 'loss'}
                      </span>{' '}
                      ({o.actualReturn != null ? `$${o.actualReturn}` : '—'})
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="py-2 text-center font-mono text-[9px] text-zinc-600">
                No expired outcomes yet. Signals are stored on the Monte Carlo service as contracts expire.
              </p>
            )}
          </div>
        )}
      </footer>
    </section>
  );
}
