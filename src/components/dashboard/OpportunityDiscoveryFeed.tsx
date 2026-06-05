'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pin, PinOff } from 'lucide-react';
import {
  generateMockOpportunitySignal,
  OPPORTUNITY_FEED_TTL_MS,
  type OpportunitySignal,
} from '@/data/opportunitySignalsMock';

type SortKey = 'confidence' | 'expectedReturn';

function glowClass(confidence: number): string {
  if (confidence >= 85) return 'border-amber-400/60 bg-amber-500/10 shadow-[0_0_24px_rgba(251,191,36,0.25)]';
  if (confidence >= 70) return 'border-tan/40 bg-tan/5 shadow-[0_0_16px_rgba(210,180,140,0.15)]';
  return 'border-white/10 bg-charcoal/60';
}

export function OpportunityDiscoveryFeed() {
  const [signals, setSignals] = useState<OpportunitySignal[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('confidence');

  const addSignal = useCallback(() => {
    const next = generateMockOpportunitySignal();
    setSignals((prev) => {
      const merged = [next, ...prev.filter((s) => s.pinned)];
      return merged.slice(0, 12);
    });
  }, []);

  useEffect(() => {
    addSignal();
    const id = window.setInterval(addSignal, 2800);
    return () => window.clearInterval(id);
  }, [addSignal]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setSignals((prev) => prev.filter((s) => s.pinned || now - s.createdAt < OPPORTUNITY_FEED_TTL_MS));
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  const sorted = useMemo(() => {
    const list = [...signals];
    list.sort((a, b) => {
      const primary = sortKey === 'confidence' ? b.confidence - a.confidence : b.expectedReturn - a.expectedReturn;
      if (primary !== 0) return primary;
      return b.confidence - a.confidence;
    });
    return list;
  }, [signals, sortKey]);

  const togglePin = (id: string) => {
    setSignals((prev) => prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s)));
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-white/10 bg-dark-gray/90 shadow-lg backdrop-blur-sm">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-3 py-2.5">
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">Opportunity Discovery</h3>
          <p className="text-[9px] text-zinc-600">Monte Carlo · correlation engine</p>
        </div>
        <div className="flex rounded border border-white/10 text-[9px] uppercase tracking-wide">
          {(['confidence', 'expectedReturn'] as SortKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setSortKey(k)}
              className={`px-2 py-1 ${sortKey === k ? 'bg-white/10 text-tan' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {k === 'confidence' ? 'Conf' : 'Return'}
            </button>
          ))}
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden px-2 py-2">
          <AnimatePresence initial={false}>
            {sorted.map((sig) => (
              <motion.article
                key={sig.id}
                layout
                initial={{ opacity: 0, y: 48 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`mb-2 rounded-md border p-2.5 ${glowClass(sig.confidence)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-zinc-100">
                      {sig.symbol}{' '}
                      <span className={sig.optionType === 'CALL' ? 'text-moss' : 'text-rose-400'}>{sig.optionType}</span>{' '}
                      ${sig.strike.toFixed(1)}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-zinc-500">Exp {sig.expiration}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePin(sig.id)}
                    className="shrink-0 rounded p-1 text-zinc-500 hover:bg-white/10 hover:text-tan"
                    aria-label={sig.pinned ? 'Unpin signal' : 'Pin signal'}
                  >
                    {sig.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between font-mono text-[10px] tabular-nums">
                  <span className="text-moss">+${sig.expectedReturn.toLocaleString()}</span>
                  <span className="text-tan">{sig.confidence}% conf</span>
                </div>
                <p className="mt-1 font-mono text-[9px] tabular-nums text-zinc-500">
                  Δ {sig.delta.toFixed(2)} · Θ {sig.theta.toFixed(3)} · ν {sig.vega.toFixed(3)}
                </p>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
