'use client';

/**
 * Graduate-level Monte Carlo live-stream showcase for Legend.
 * IBKR historical backtest → calibrated GBM fan → strategy win-rate MC → tuned BSM options.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import NumberFlow from '@number-flow/react';
import { useReducedMotion } from 'framer-motion';
import { Activity, RefreshCw, TrendingUp } from 'lucide-react';
import { AnimatedPrice } from '@/components/dashboard/AnimatedPrice';
import { LegendPanelSkeleton } from '@/components/dashboard/LegendPanelSkeleton';
import { useMonteCarloLegendStream } from '@/hooks/useMonteCarloLegendStream';
import type { OptionRow } from '@/components/dashboard/terminal/terminalData';
import type { McPathBand, OptionMcRow, TradeMarker } from '@/lib/monteCarloLegend/analyze';
import { blackScholes } from '@gx/analytics';

const PANEL = 'overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0b0e] shadow-[0_24px_48px_-28px_rgba(0,0,0,0.6)]';
const HEAD =
  'flex items-center justify-between border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5';

type MonteCarloLegendShowcaseProps = {
  symbol: string;
  spot: number;
  chain: OptionRow[];
  live?: boolean;
};

const CHART_W = 640;
const CHART_H = 220;
const MC_OVERLAY_H = 100;

function scaleSeries(values: number[], w: number, h: number, pad = 8) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v, i) => ({
    x: values.length > 1 ? pad + (i / (values.length - 1)) * (w - pad * 2) : w / 2,
    y: h - pad - ((v - min) / span) * (h - pad * 2),
    v,
  }));
}

function McFanOverlay({
  bands,
  paths,
  spot,
  reveal,
  reduceMotion,
}: {
  bands: McPathBand[];
  paths: number[][];
  spot: number;
  reveal: number;
  reduceMotion: boolean;
}) {
  const allY = bands.flatMap((b) => [b.p10, b.p90]);
  const minY = Math.min(spot, ...allY);
  const maxY = Math.max(spot, ...allY);
  const span = maxY - minY || 1;
  const pad = 6;
  const w = CHART_W;
  const h = MC_OVERLAY_H;

  const toX = (t: number, maxT: number) => pad + (t / maxT) * (w - pad * 2);
  const toY = (v: number) => h - pad - ((v - minY) / span) * (h - pad * 2);

  const maxT = bands.length > 0 ? bands[bands.length - 1].t : 1;
  const histW = w * 0.62;
  const mcStart = histW;

  const bandPath = (key: keyof McPathBand) => {
    const pts = bands.map((b) => `${mcStart + toX(b.t, maxT) * ((w - mcStart - pad) / w)},${toY(b[key] as number)}`);
    return pts.length ? `M ${pts.join(' L ')}` : '';
  };

  const visiblePaths = reduceMotion ? paths.slice(0, 12) : paths.slice(0, Math.floor(paths.length * reveal));

  return (
    <g opacity={0.92}>
      <path
        d={`M ${mcStart},${toY(bands[0]?.p90 ?? spot)} ${bands
          .map((b) => `L ${mcStart + toX(b.t, maxT) * ((w - mcStart - pad) / w)},${toY(b.p90)}`)
          .join(' ')} L ${w - pad},${toY(bands.at(-1)?.p10 ?? spot)} ${[...bands]
          .reverse()
          .map(
            (b) =>
              `L ${mcStart + toX(b.t, maxT) * ((w - mcStart - pad) / w)},${toY(b.p10)}`,
          )
          .join(' ')} Z`}
        fill="rgba(0,200,5,0.08)"
      />
      <path d={bandPath('p50')} fill="none" stroke="rgba(0,200,5,0.55)" strokeWidth="1.5" strokeDasharray="4 3" />
      {visiblePaths.map((path, i) => {
        const pts = path.map((v, t) => {
          const x = mcStart + toX(t, maxT) * ((w - mcStart - pad) / w);
          return `${x},${toY(v)}`;
        });
        return (
          <path
            key={i}
            d={`M ${pts.join(' L ')}`}
            fill="none"
            stroke={`rgba(0,200,5,${0.08 + (i % 5) * 0.03})`}
            strokeWidth="0.8"
          />
        );
      })}
      <line x1={mcStart} y1={toY(spot)} x2={w - pad} y2={toY(spot)} stroke="rgba(210,180,140,0.35)" strokeDasharray="2 4" />
    </g>
  );
}

function TradeMarkersLayer({
  markers,
  series,
}: {
  markers: TradeMarker[];
  series: { x: number; y: number }[];
}) {
  return (
    <g>
      {markers.map((m, i) => {
        const pt = series[m.barIndex];
        if (!pt) return null;
        const isEntry = m.type === 'entry';
        const color = isEntry ? '#00C805' : m.win ? '#7dd87d' : '#f87171';
        const size = 7;
        const cy = isEntry ? pt.y + size : pt.y - size;
        const points = isEntry
          ? `${pt.x},${cy - size} ${pt.x - size},${cy + size} ${pt.x + size},${cy + size}`
          : `${pt.x},${cy + size} ${pt.x - size},${cy - size} ${pt.x + size},${cy - size}`;
        return (
          <g key={`${m.type}-${m.barIndex}-${i}`} style={{ animation: 'mcMarker 0.5s ease-out' }}>
            <polygon points={points} fill={color} opacity={0.9} />
            {m.type === 'exit' && m.pnl !== undefined ? (
              <text x={pt.x} y={cy + (isEntry ? 14 : -14)} textAnchor="middle" fill={color} fontSize="8" fontFamily="monospace">
                {(m.pnl * 100).toFixed(1)}%
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

function WinRateTile({ label, value, accent = 'text-tan' }: { label: string; value: number; accent?: string }) {
  return (
    <div className="px-4 py-3">
      <p className="text-[9px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`mt-1 font-mono text-2xl tabular-nums ${accent}`}>
        <NumberFlow
          value={value * 100}
          locales="en-US"
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        />
        %
      </p>
    </div>
  );
}

const CALC_PHASES = [
  'Correlation vs SPY',
  'CAPM α · β',
  'Monte Carlo GBM',
  'Black–Scholes tune',
  'Regime classify',
] as const;

function LiveCalcTicker({ active, phase }: { active: boolean; phase: number }) {
  return (
    <div className="flex items-center gap-2 border-b border-white/[0.06] bg-black/20 px-4 py-1.5 font-mono text-[9px] text-zinc-500">
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'animate-pulse bg-emerald-400' : 'bg-zinc-600'}`} />
      <span className="uppercase tracking-wider text-zinc-600">Engine</span>
      <span className="text-tan">{CALC_PHASES[phase % CALC_PHASES.length]}</span>
      {active ? <span className="animate-pulse text-emerald-400/80">···</span> : null}
    </div>
  );
}

function FactorStrip({
  beta,
  alpha,
  correlation,
  regime,
  capmReturn,
}: {
  beta: number;
  alpha: number;
  correlation: number;
  regime: string;
  capmReturn: number;
}) {
  return (
    <div className="grid grid-cols-2 divide-x divide-white/[0.06] border-b border-white/[0.06] sm:grid-cols-5">
      <div className="px-3 py-2.5">
        <p className="text-[9px] uppercase tracking-wider text-zinc-500">β vs SPY</p>
        <p className="mt-0.5 font-mono text-lg tabular-nums text-zinc-100">
          <NumberFlow value={beta} locales="en-US" format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
        </p>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[9px] uppercase tracking-wider text-zinc-500">α ann.</p>
        <p className={`mt-0.5 font-mono text-lg tabular-nums ${alpha >= 0 ? 'text-moss' : 'text-red-400/85'}`}>
          {alpha >= 0 ? '+' : ''}
          <NumberFlow value={Math.abs(alpha)} locales="en-US" format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />%
        </p>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[9px] uppercase tracking-wider text-zinc-500">ρ vs SPY</p>
        <p className="mt-0.5 font-mono text-lg tabular-nums text-tan">
          <NumberFlow value={correlation} locales="en-US" format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
        </p>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[9px] uppercase tracking-wider text-zinc-500">CAPM E[R]</p>
        <p className="mt-0.5 font-mono text-lg tabular-nums text-zinc-200">
          {(capmReturn * 100).toFixed(1)}%
        </p>
      </div>
      <div className="col-span-2 px-3 py-2.5 sm:col-span-1">
        <p className="text-[9px] uppercase tracking-wider text-zinc-500">Regime</p>
        <p className="mt-0.5 font-mono text-sm text-emerald-400/90">{regime}</p>
      </div>
    </div>
  );
}

function liveBsmRows(rows: OptionMcRow[], spot: number): OptionMcRow[] {
  if (spot <= 0) return rows;
  return rows.map((row) => {
    const optType = row.type === 'CALL' ? 'call' : 'put';
    const bs = blackScholes({
      stockPrice: spot,
      strike: row.strike,
      timeToExpiration: row.timeYears,
      volatility: row.tunedVol,
      riskFreeRate: 0.043,
      optionType: optType,
    });
    const edgePct = row.marketMid > 0 ? (bs.theoreticalPrice / row.marketMid - 1) * 100 : 0;
    return { ...row, bsmFair: bs.theoreticalPrice, edgePct };
  });
}

export function MonteCarloLegendShowcase({ symbol, spot, chain, live }: MonteCarloLegendShowcaseProps) {
  const reduceMotion = useReducedMotion();
  const { snapshot, loading, error, lastUpdated, refresh } = useMonteCarloLegendStream(symbol, spot, chain);
  const [reveal, setReveal] = useState(0);
  const [pulseTrade, setPulseTrade] = useState(0);
  const [calcPhase, setCalcPhase] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!snapshot || reduceMotion) {
      setReveal(1);
      return;
    }
    setReveal(0);
    const start = performance.now();
    const duration = 2200;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setReveal(0.15 + t * 0.85);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [snapshot, snapshot?.computedAt, reduceMotion]);

  useEffect(() => {
    if (!snapshot || reduceMotion) return;
    const id = window.setInterval(() => setPulseTrade((n) => n + 1), 180);
    return () => window.clearInterval(id);
  }, [snapshot, snapshot?.computedAt, reduceMotion]);

  useEffect(() => {
    const ms = loading ? 400 : 1400;
    const id = window.setInterval(() => setCalcPhase((p) => p + 1), ms);
    return () => window.clearInterval(id);
  }, [loading, snapshot?.computedAt]);

  const chart = useMemo(() => {
    if (!snapshot) return null;
    const pts = scaleSeries(snapshot.historyCloses, CHART_W, CHART_H - MC_OVERLAY_H);
    const line = pts.map((p) => `${p.x},${p.y}`).join(' L ');
    const area = line ? `M ${line} L ${CHART_W - 8},${CHART_H - MC_OVERLAY_H} L 8,${CHART_H - MC_OVERLAY_H} Z` : '';
    return { pts, line: line ? `M ${line}` : '', area };
  }, [snapshot]);

  const liveWinRate = snapshot
    ? snapshot.historicalTrades > 0
      ? snapshot.historicalWins / snapshot.historicalTrades
      : snapshot.historicalWinRate
    : 0;

  const sessionWins = useMemo(() => {
    if (!snapshot) return { wins: 0, total: 0 };
    const exits = snapshot.tradeMarkers.filter((m) => m.type === 'exit');
    const visible = Math.min(exits.length, 8 + (pulseTrade % 12));
    const slice = exits.slice(0, visible);
    return {
      wins: slice.filter((m) => m.win).length,
      total: slice.length,
    };
  }, [snapshot, pulseTrade]);

  const liveOptionRows = useMemo(
    () => (snapshot ? liveBsmRows(snapshot.optionRows, spot) : []),
    [snapshot, spot],
  );

  return (
    <section className={PANEL}>
      <header className={HEAD}>
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-emerald-400/80" />
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
              Monte Carlo live stream
            </h2>
            <p className="text-[11px] text-zinc-500">
              IBKR history · SMA backtest · tuned Black–Scholes · @gx/analytics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {live ? (
            <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-400/90">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              live
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => refresh()}
            disabled={loading}
            className="rounded border border-white/[0.1] p-1 text-zinc-400 transition-colors hover:text-zinc-200 disabled:opacity-40"
            aria-label="Refresh Monte Carlo"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <LiveCalcTicker active={loading || !!live} phase={calcPhase} />

      {error && !snapshot ? (
        <div className="px-4 py-6 font-mono text-[11px] text-rose-300/90">{error}</div>
      ) : null}

      {snapshot && chart ? (
        <>
          <FactorStrip
            beta={snapshot.beta}
            alpha={snapshot.alphaAnnualizedPct}
            correlation={snapshot.correlationVsSpy}
            regime={snapshot.regimeLabel}
            capmReturn={snapshot.capmExpectedReturn}
          />
          <div className="grid grid-cols-2 divide-x divide-white/[0.06] border-b border-white/[0.06] sm:grid-cols-4">
            <WinRateTile label="Historical win rate" value={liveWinRate} accent="text-[#00C805]" />
            <WinRateTile label="MC P(profit)" value={snapshot.mcProbProfit} accent="text-tan" />
            <WinRateTile label="P(spot ↑)" value={snapshot.probSpotUp} accent="text-zinc-100" />
            <div className="px-4 py-3">
              <p className="text-[9px] uppercase tracking-wider text-zinc-500">Trade grade</p>
              <p className="mt-1 font-mono text-2xl tabular-nums text-tan">{snapshot.tradeGrade}</p>
              <p className="mt-0.5 font-mono text-[9px] text-zinc-600">
                σ {(snapshot.realizedVol * 100).toFixed(1)}% · μ {(snapshot.drift * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="relative border-b border-white/[0.06] px-3 py-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                Entries / exits · {snapshot.historicalTrades} trades on IBKR daily
              </span>
              <span className="font-mono text-[9px] text-zinc-600">
                Session replay {sessionWins.wins}/{sessionWins.total || '—'}
              </span>
            </div>
            <svg
              viewBox={`0 0 ${CHART_W} ${CHART_H}`}
              className="h-[200px] w-full sm:h-[220px]"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="mcHistFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(210,180,140,0.22)" />
                  <stop offset="100%" stopColor="rgba(210,180,140,0)" />
                </linearGradient>
              </defs>
              {chart.area ? <path d={chart.area} fill="url(#mcHistFill)" /> : null}
              {chart.line ? (
                <path d={chart.line} fill="none" stroke="rgb(210,180,140)" strokeWidth="1.8" />
              ) : null}
              <g transform={`translate(0, ${CHART_H - MC_OVERLAY_H})`}>
                <McFanOverlay
                  bands={snapshot.mcBands}
                  paths={snapshot.mcPaths}
                  spot={snapshot.spot}
                  reveal={reveal}
                  reduceMotion={!!reduceMotion}
                />
              </g>
              <TradeMarkersLayer markers={snapshot.tradeMarkers} series={chart.pts} />
              <line
                x1={CHART_W * 0.62}
                y1={4}
                x2={CHART_W * 0.62}
                y2={CHART_H - MC_OVERLAY_H - 4}
                stroke="rgba(255,255,255,0.12)"
                strokeDasharray="3 4"
              />
              <text x={CHART_W * 0.62 + 6} y={14} fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="monospace">
                MC +{snapshot.mcHorizonDays}d
              </text>
            </svg>
            <div className="mt-2 flex flex-wrap gap-1 px-1">
              {snapshot.tradeMarkers
                .filter((m) => m.type === 'exit')
                .slice(-24)
                .map((m, i) => (
                  <span
                    key={i}
                    className={`h-2.5 w-2.5 rounded-[2px] ${m.win ? 'bg-[#00C805]/80' : 'bg-red-400/60'}`}
                    title={m.pnl !== undefined ? `${(m.pnl * 100).toFixed(2)}%` : undefined}
                  />
                ))}
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-b border-white/[0.06]">
            <div className="px-4 py-3">
              <p className="text-[9px] uppercase tracking-wider text-zinc-500">Expected return</p>
              <p className="mt-1 font-mono text-lg text-moss">
                {(snapshot.mcExpectedReturn * 100).toFixed(2)}%
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-[9px] uppercase tracking-wider text-zinc-500">Median equity</p>
              <p className="mt-1 font-mono text-lg text-zinc-200">
                $<AnimatedPrice value={snapshot.mcMedianEquity} decimals={0} />
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-[9px] uppercase tracking-wider text-zinc-500">Ruin risk</p>
              <p className="mt-1 font-mono text-lg text-red-400/85">
                {(snapshot.mcRuinProb * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          {liveOptionRows.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-2">
                <TrendingUp className="h-3 w-3 text-zinc-500" />
                <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                  Options · peak-tuned BSM vs chain mid
                </span>
                {live && spot > 0 ? (
                  <span className="ml-auto flex items-center gap-1 font-mono text-[8px] text-emerald-400/80">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
                    BSM live @ ${spot.toFixed(2)}
                  </span>
                ) : null}
              </div>
              <table className="w-full min-w-[520px] text-left font-mono text-[10px]">
                <thead>
                  <tr className="border-b border-white/[0.06] text-zinc-500">
                    <th className="px-3 py-2 font-normal">Contract</th>
                    <th className="px-3 py-2 font-normal">Mid</th>
                    <th className="px-3 py-2 font-normal">BSM fair</th>
                    <th className="px-3 py-2 font-normal">Edge</th>
                    <th className="px-3 py-2 font-normal">MC P(π)</th>
                    <th className="px-3 py-2 font-normal">σ tuned</th>
                  </tr>
                </thead>
                <tbody>
                  {liveOptionRows.map((row) => (
                    <tr key={row.id} className="border-b border-white/[0.04] text-zinc-300 hover:bg-white/[0.02]">
                      <td className="px-3 py-2">
                        <span className={row.type === 'CALL' ? 'text-emerald-400/90' : 'text-rose-400/90'}>
                          {row.type[0]}
                        </span>{' '}
                        {row.strike}
                        <span className="ml-1 text-zinc-600">{row.expiry.slice(5)}</span>
                      </td>
                      <td className="px-3 py-2 tabular-nums">${row.marketMid.toFixed(2)}</td>
                      <td className="px-3 py-2 tabular-nums text-tan">
                        $<AnimatedPrice value={row.bsmFair} decimals={2} durationMs={180} />
                      </td>
                      <td
                        className={`px-3 py-2 tabular-nums ${row.edgePct >= 0 ? 'text-moss' : 'text-red-400/80'}`}
                      >
                        {row.edgePct >= 0 ? '+' : ''}
                        {row.edgePct.toFixed(1)}%
                      </td>
                      <td className="px-3 py-2 tabular-nums">{(row.mcProbProfit * 100).toFixed(1)}%</td>
                      <td className="px-3 py-2 tabular-nums text-zinc-500">{(row.tunedVol * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-4 py-3 font-mono text-[10px] text-zinc-600">
              Options chain loading — BSM overlay activates when IBKR chain is available.
            </p>
          )}

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-4 py-2.5 text-[10px] text-zinc-600">
            <span>
              Conviction {(snapshot.evaluation.convictionScore * 100).toFixed(0)} · Confidence{' '}
              {(snapshot.evaluation.confidenceScore * 100).toFixed(0)} · R² {(snapshot.rSquared * 100).toFixed(0)}% ·
              3,200 GBM paths · 6,000 strategy trials
            </span>
            {lastUpdated ? (
              <span className="font-mono">
                Updated {new Date(lastUpdated).toLocaleTimeString()}
                {loading ? ' · recalibrating…' : ''}
              </span>
            ) : null}
          </footer>
        </>
      ) : loading ? (
        <div className="p-4">
          <LegendPanelSkeleton label="Monte Carlo · calibrating from IBKR" rows={6} height={32} />
        </div>
      ) : null}
    </section>
  );
}
