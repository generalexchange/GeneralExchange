/**
 * Options intelligence panels — volatility surface, skew, term structure,
 * options flow, and the intelligence grid (IV regime, RV/IV spread, delta
 * squeeze risk, dealer gamma, implied vs realized move).
 */

'use client';

import React from 'react';
import { Panel } from '@/components/dashboard/terminal/panels';
import type {
  OptionsIntel,
  SurfaceCell,
  SkewPoint,
  TermPoint,
  FlowMetrics,
  RegimeSnapshot,
} from '@/components/dashboard/terminal/terminalData';

const MOSS = '#3f9d57';
const ROSE = '#f47272';
const BRASS = '#C9A96E';

const fmt = (n: number, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const signed = (n: number, d = 1) => `${n >= 0 ? '+' : ''}${fmt(n, d)}`;
const compact = (n: number) => Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

/* ------------------------- volatility surface ------------------------- */

export function VolSurface({ surface }: { surface: SurfaceCell[] }) {
  const expDays = [...new Set(surface.map((c) => c.expDays))].sort((a, b) => a - b);
  const moneyness = [...new Set(surface.map((c) => c.moneyness))].sort((a, b) => a - b);
  const ivs = surface.map((c) => c.iv);
  const lo = Math.min(...ivs), hi = Math.max(...ivs);
  const get = (d: number, m: number) => surface.find((c) => c.expDays === d && c.moneyness === m);

  return (
    <Panel title="Implied volatility surface" right={<span className="font-mono text-[8px] text-zinc-600">IV % · moneyness × tenor</span>}>
      <div className="overflow-auto p-3">
        <table className="border-separate" style={{ borderSpacing: '2px' }}>
          <thead>
            <tr>
              <th className="pr-1 text-right text-[8px] font-medium text-zinc-600">DTE</th>
              {moneyness.map((m) => (
                <th key={m} className="px-1 text-center text-[8px] font-medium text-zinc-600">{m.toFixed(2)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expDays.map((d) => (
              <tr key={d}>
                <td className="pr-1 text-right font-mono text-[9px] tabular text-zinc-500">{d}d</td>
                {moneyness.map((m) => {
                  const cell = get(d, m);
                  if (!cell) return <td key={m} />;
                  const a = ((cell.iv - lo) / (hi - lo || 1)) * 0.72 + 0.1;
                  return (
                    <td
                      key={m}
                      title={`${d}d @ ${m}: ${cell.iv}% IV`}
                      className="h-6 w-10 rounded-[2px] text-center font-mono text-[8px] tabular text-white/85"
                      style={{ backgroundColor: `rgba(201,169,110,${a.toFixed(2)})` }}
                    >
                      {cell.iv.toFixed(0)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ----------------------------- skew panel ----------------------------- */

export function SkewPanel({ skew }: { skew: SkewPoint[] }) {
  const max = Math.max(...skew.map((s) => s.skew), 1);
  return (
    <Panel title="Volatility skew" right={<span className="font-mono text-[8px] text-zinc-600">25Δ put − call</span>}>
      <div className="space-y-1.5 p-3">
        {skew.map((s) => (
          <div key={s.expDays} className="flex items-center gap-2 font-mono text-[9px] tabular">
            <span className="w-7 shrink-0 text-zinc-500">{s.expLabel}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
              <div className="h-full rounded-full" style={{ width: `${(s.skew / max) * 100}%`, backgroundColor: s.skew > 4 ? ROSE : BRASS }} />
            </div>
            <span className="w-16 shrink-0 text-right text-zinc-400">
              P{fmt(s.putIv, 0)} <span className="text-zinc-600">/</span> C{fmt(s.callIv, 0)}
            </span>
            <span className={`w-8 shrink-0 text-right ${s.skew > 4 ? 'text-rose-400' : 'text-tan'}`}>{signed(s.skew)}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ------------------------- term structure ----------------------------- */

export function TermStructure({ term }: { term: TermPoint[] }) {
  const W = 360, H = 130, padL = 28, padR = 10, padB = 22, padT = 10;
  const ivs = term.map((t) => t.atmIv);
  const lo = Math.min(...ivs) - 1, hi = Math.max(...ivs) + 1;
  const x = (i: number) => padL + (i / (term.length - 1)) * (W - padL - padR);
  const y = (v: number) => padT + ((hi - v) / (hi - lo || 1)) * (H - padT - padB);
  const path = term.map((t, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(t.atmIv).toFixed(1)}`).join(' ');
  const inverted = term[0].atmIv > term[term.length - 1].atmIv;

  return (
    <Panel title="Term structure" right={<span className={`text-[9px] ${inverted ? 'text-rose-400' : 'text-moss'}`}>{inverted ? 'inverted' : 'upward'}</span>}>
      <div className="p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[130px] w-full" aria-hidden>
          {[lo, (lo + hi) / 2, hi].map((v, i) => (
            <g key={i}>
              <line x1={padL} y1={y(v)} x2={W - padR} y2={y(v)} stroke="rgba(255,255,255,0.05)" />
              <text x={4} y={y(v) + 3} fill="rgba(148,163,184,0.7)" fontSize="8" fontFamily="ui-monospace, monospace">{v.toFixed(0)}</text>
            </g>
          ))}
          <path d={path} fill="none" stroke={BRASS} strokeWidth="1.5" />
          {term.map((t, i) => (
            <g key={t.expDays}>
              <circle cx={x(i)} cy={y(t.atmIv)} r="2.4" fill={BRASS} />
              <text x={x(i)} y={H - 6} textAnchor="middle" fill="rgba(148,163,184,0.7)" fontSize="8" fontFamily="ui-monospace, monospace">{t.expDays}d</text>
            </g>
          ))}
        </svg>
      </div>
    </Panel>
  );
}

/* ------------------------------ flow panel ---------------------------- */

export function FlowPanel({ flow }: { flow: FlowMetrics }) {
  const totalVol = flow.netCallVolume + flow.netPutVolume || 1;
  const callPct = (flow.netCallVolume / totalVol) * 100;
  return (
    <Panel title="Options flow">
      <div className="space-y-3 p-3">
        <div>
          <div className="mb-1 flex justify-between font-mono text-[9px] tabular">
            <span className="text-moss">Calls {compact(flow.netCallVolume)}</span>
            <span className="text-rose-400">Puts {compact(flow.netPutVolume)}</span>
          </div>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-white/[0.05]">
            <div className="h-full" style={{ width: `${callPct}%`, backgroundColor: MOSS }} />
            <div className="h-full flex-1" style={{ backgroundColor: ROSE }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-[10px] tabular">
          <Cell label="Call OI Δ" value={signed(flow.netCallOiChange, 0)} tone={flow.netCallOiChange >= 0 ? 'text-moss' : 'text-rose-400'} />
          <Cell label="Put OI Δ" value={signed(flow.netPutOiChange, 0)} tone={flow.netPutOiChange >= 0 ? 'text-rose-400' : 'text-moss'} />
          <Cell label="P/C volume" value={fmt(flow.pcrVolume)} />
          <Cell label="P/C OI" value={fmt(flow.pcrOpenInterest)} />
        </div>
      </div>
    </Panel>
  );
}

function Cell({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
      <p className="text-[8px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`mt-0.5 ${tone ?? 'text-neutral-100'}`}>{value}</p>
    </div>
  );
}

/* --------------------------- intelligence grid ------------------------ */

function GaugeCard({ label, value, pct, tone, note }: { label: string; value: string; pct: number; tone: string; note?: string }) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-charcoal/70 p-3">
      <p className="text-[9px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`mt-1 font-mono text-lg tabular ${tone}`}>{value}</p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: tone.includes('rose') ? ROSE : tone.includes('moss') ? MOSS : BRASS }} />
      </div>
      {note && <p className="mt-1.5 text-[9px] text-zinc-500">{note}</p>}
    </div>
  );
}

export function IntelGrid({ intel, regime, ivRank }: { intel: OptionsIntel; regime: RegimeSnapshot; ivRank: number }) {
  const { flow } = intel;
  const premiumRich = regime.impliedVol - regime.realizedVol > 4;
  const squeezeHigh = flow.deltaSqueezeRisk > 0.6;
  const moveMispriced = Math.abs(flow.impliedMovePct - flow.realizedMovePct) > 0.6;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <GaugeCard label="IV rank" value={`${ivRank}`} pct={ivRank} tone="text-tan" note="vs 1-year range" />
      <GaugeCard
        label="Volatility regime"
        value={regime.volRegime}
        pct={(['COMPRESSED', 'NORMAL', 'ELEVATED', 'HIGH', 'SPIKE'].indexOf(regime.volRegime) + 1) * 20}
        tone={regime.volRegime === 'SPIKE' || regime.volRegime === 'HIGH' ? 'text-rose-400' : 'text-moss'}
      />
      <GaugeCard
        label="RV − IV spread"
        value={`${signed(regime.rvIvSpread)}%`}
        pct={Math.abs(regime.rvIvSpread) * 6}
        tone={premiumRich ? 'text-moss' : 'text-tan'}
        note={premiumRich ? 'premium-rich · sell vol' : 'fairly priced'}
      />
      <GaugeCard
        label="Delta squeeze risk"
        value={`${(flow.deltaSqueezeRisk * 100).toFixed(0)}%`}
        pct={flow.deltaSqueezeRisk * 100}
        tone={squeezeHigh ? 'text-rose-400' : 'text-tan'}
        note={squeezeHigh ? 'dealers short gamma' : 'dealers balanced'}
      />
      <GaugeCard
        label="Dealer GEX total"
        value={`${signed(regime.dealerGexTotal)}mm`}
        pct={Math.min(100, Math.abs(regime.dealerGexTotal))}
        tone={regime.dealerGexTotal >= 0 ? 'text-moss' : 'text-rose-400'}
        note={regime.dealerGexTotal >= 0 ? 'price stabilizing' : 'price destabilizing'}
      />
      <GaugeCard
        label="Unusual activity"
        value={`${(flow.unusualActivityScore * 100).toFixed(0)}%`}
        pct={flow.unusualActivityScore * 100}
        tone={flow.unusualActivityScore > 0.6 ? 'text-rose-400' : 'text-tan'}
        note="informed-flow probability"
      />
      <GaugeCard
        label="Implied move"
        value={`±${flow.impliedMovePct}%`}
        pct={flow.impliedMovePct * 12}
        tone="text-tan"
        note={`±$${fmt(flow.impliedMove)} ATM straddle`}
      />
      <GaugeCard
        label="Implied vs realized"
        value={`${flow.impliedMovePct} / ${flow.realizedMovePct}`}
        pct={Math.abs(flow.impliedMovePct - flow.realizedMovePct) * 30}
        tone={moveMispriced ? 'text-rose-400' : 'text-moss'}
        note={moveMispriced ? 'potential mispricing' : 'in line with history'}
      />
    </div>
  );
}
