'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { RankedContract } from '@/lib/opportunity/types';

function McRing({ itm, profit, accent }: { itm: number; profit: number; accent: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const itmOffset = c - (itm / 100) * c;
  const profitOffset = c - (profit / 100) * c;

  return (
    <svg viewBox="0 0 56 56" className="h-14 w-14 shrink-0" aria-hidden>
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke={accent}
        strokeWidth="4"
        strokeDasharray={c}
        strokeDashoffset={itmOffset}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        opacity={0.35}
      />
      <circle
        cx="28"
        cy="28"
        r={r - 7}
        fill="none"
        stroke={accent}
        strokeWidth="3"
        strokeDasharray={c - 44}
        strokeDashoffset={profitOffset * 0.85}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
      />
      <text x="28" y="30" textAnchor="middle" className="fill-zinc-200 text-[9px] font-mono">
        {Math.round(profit)}%
      </text>
    </svg>
  );
}

function GreekBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((Math.abs(value) / max) * 100));
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-3 font-mono text-[8px] text-zinc-500">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="w-10 text-right font-mono text-[8px] tabular-nums text-zinc-400">{value.toFixed(2)}</span>
    </div>
  );
}

/** Compact MC + greek visuals for opportunity sidebar cards. */
export function OpportunityContractVisuals({
  opp,
  compact = false,
}: {
  opp: RankedContract;
  compact?: boolean;
}) {
  const accent = opp.optionType === 'CALL' ? '#00C805' : '#FF5000';

  if (compact) {
    return (
      <div className="mt-2 flex items-center gap-2">
        <McRing itm={opp.monteCarlo.probabilityITM} profit={opp.monteCarlo.probabilityProfitable} accent={accent} />
        <div className="min-w-0 flex-1 space-y-1">
          <GreekBar label="Δ" value={opp.delta} max={1} color="#d2b48c" />
          <GreekBar label="Γ" value={opp.gamma} max={0.05} color="#a8b5a0" />
          <GreekBar label="Θ" value={opp.theta} max={0.15} color="#f87171" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <McRing itm={opp.monteCarlo.probabilityITM} profit={opp.monteCarlo.probabilityProfitable} accent={accent} />
        <div className="flex-1 space-y-1.5">
          <p className="font-mono text-[9px] uppercase tracking-wide text-zinc-500">Monte Carlo</p>
          <p className="font-mono text-[10px] text-zinc-300">
            P(ITM) {opp.monteCarlo.probabilityITM}% · P(profit) {opp.monteCarlo.probabilityProfitable}%
          </p>
          <p className="font-mono text-[10px] text-zinc-400">
            Expected payoff ${opp.monteCarlo.expectedPayoff.toFixed(2)}
          </p>
        </div>
      </div>
      <div>
        <p className="mb-1.5 font-mono text-[9px] uppercase tracking-wide text-zinc-500">Live greeks</p>
        <div className="space-y-1">
          <GreekBar label="Δ" value={opp.delta} max={1} color="#d2b48c" />
          <GreekBar label="Γ" value={opp.gamma} max={0.05} color="#a8b5a0" />
          <GreekBar label="Θ" value={opp.theta} max={0.15} color="#f87171" />
          <GreekBar label="ν" value={opp.vega} max={0.5} color="#60a5fa" />
        </div>
      </div>
      <div>
        <p className="mb-1 font-mono text-[9px] uppercase tracking-wide text-zinc-500">Factor scores</p>
        <div className="flex h-10 items-end gap-0.5">
          {Object.entries(opp.factorScores).map(([key, val]) => (
            <motion.div
              key={key}
              className="flex-1 rounded-t bg-tan/60"
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(8, val * 100)}%` }}
              transition={{ duration: 0.45, delay: 0.05 }}
              title={key}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
