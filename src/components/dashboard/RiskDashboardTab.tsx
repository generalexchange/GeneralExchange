'use client';

import React, { useMemo, useState } from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  MOCK_DRAWDOWN_DISTRIBUTION,
  MOCK_MONTE_CARLO_PATHS,
  MOCK_RISK_METRICS,
  MOCK_RISK_NARRATIVE,
  MOCK_RISK_TRENDS,
  MOCK_STRESS_SCENARIOS,
  buildDrawdownHistogramFromDistribution,
  buildMonteCarloSeriesFromPaths,
  riskBadgeLabel,
  riskLevelForFragility,
  type RiskLevel,
  type RiskMetrics,
  type StressSeverity,
} from './mockRiskDashboardData';

const tooltipStyle = {
  background: 'rgba(10,10,10,0.98)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  fontSize: '12px',
};

function toneColor(tone: 'positive' | 'negative' | 'neutral'): string {
  if (tone === 'positive') return 'text-emerald-400/90';
  if (tone === 'negative') return 'text-rose-400/90';
  return 'text-zinc-500';
}

function severityStyles(sev: RiskLevel | StressSeverity): { bar: string; badge: string } {
  if (sev === 'low' || sev === 'safe') return { bar: 'bg-emerald-500/25', badge: 'text-emerald-300/90 border-emerald-500/35' };
  if (sev === 'moderate') return { bar: 'bg-amber-500/25', badge: 'text-amber-200/90 border-amber-500/35' };
  return { bar: 'bg-rose-500/25', badge: 'text-rose-200/90 border-rose-500/35' };
}

function KpiCard({
  label,
  value,
  valueSuffix,
  trend,
  riskBadge,
}: {
  label: string;
  value: string;
  valueSuffix?: string;
  trend: { label: string; deltaLabel: string; tone: 'positive' | 'negative' | 'neutral' };
  riskBadge: RiskLevel;
}) {
  const badge = riskBadgeLabel(riskBadge);
  const sev = severityStyles(riskBadge);
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-md p-4 sm:p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 mb-2">{label}</p>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="text-2xl sm:text-3xl font-semibold tabular-nums text-white tracking-tight">{value}</span>
        {valueSuffix ? <span className="text-sm text-zinc-500">{valueSuffix}</span> : null}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`text-xs font-medium ${toneColor(trend.tone)}`}>{trend.deltaLabel}</span>
        <span className="text-[11px] text-zinc-600">{trend.label}</span>
        <span
          className={`ml-auto text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${sev.badge}`}
        >
          {badge}
        </span>
      </div>
    </div>
  );
}

function metricRiskLevel(key: keyof RiskMetrics, metrics: RiskMetrics): RiskLevel {
  if (key === 'survivalProbability') return metrics.survivalProbability >= 75 ? 'safe' : metrics.survivalProbability >= 55 ? 'moderate' : 'high';
  if (key === 'expectedReturn') return metrics.expectedReturn >= 5 ? 'safe' : metrics.expectedReturn >= 2 ? 'moderate' : 'high';
  if (key === 'maxDrawdown') return metrics.maxDrawdown <= 12 ? 'safe' : metrics.maxDrawdown <= 20 ? 'moderate' : 'high';
  if (key === 'var95') return metrics.var95 <= 2.5 ? 'safe' : metrics.var95 <= 4 ? 'moderate' : 'high';
  return riskLevelForFragility(metrics.fragilityScore);
}

export function RiskDashboardTab() {
  const [selectedStress, setSelectedStress] = useState<string | null>(null);
  const metrics = MOCK_RISK_METRICS;
  const mcSeries = useMemo(() => buildMonteCarloSeriesFromPaths(MOCK_MONTE_CARLO_PATHS), []);
  const ddBins = useMemo(() => buildDrawdownHistogramFromDistribution(MOCK_DRAWDOWN_DISTRIBUTION), []);
  const ddSorted = useMemo(() => [...MOCK_DRAWDOWN_DISTRIBUTION].sort((a, b) => a - b), []);
  const medianDd = ddSorted[Math.floor(ddSorted.length / 2)];
  const worst5Dd = ddSorted[Math.floor(ddSorted.length * 0.05)];

  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="border-b border-white/[0.06] pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-institutional-green/90 mb-2">
          Simulation analytics
        </p>
        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Risk cockpit</h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-3xl leading-relaxed">
          Monte Carlo distributions, drawdown profiles, and stress overlays for algorithmic books. Execution and live
          routes are out of scope—this surface answers survivability under synthetic regimes.
        </p>
      </header>

      {/* Top KPI row */}
      <section aria-labelledby="risk-kpis">
        <h2 id="risk-kpis" className="sr-only">
          Key risk metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4">
          <KpiCard
            label="Survival probability"
            value={metrics.survivalProbability.toFixed(1)}
            valueSuffix="%"
            trend={MOCK_RISK_TRENDS.survivalProbability}
            riskBadge={metricRiskLevel('survivalProbability', metrics)}
          />
          <KpiCard
            label="Expected return"
            value={metrics.expectedReturn >= 0 ? `+${metrics.expectedReturn.toFixed(1)}` : metrics.expectedReturn.toFixed(1)}
            valueSuffix="%"
            trend={MOCK_RISK_TRENDS.expectedReturn}
            riskBadge={metricRiskLevel('expectedReturn', metrics)}
          />
          <KpiCard
            label="Max drawdown"
            value={`−${metrics.maxDrawdown.toFixed(1)}`}
            valueSuffix="%"
            trend={MOCK_RISK_TRENDS.maxDrawdown}
            riskBadge={metricRiskLevel('maxDrawdown', metrics)}
          />
          <KpiCard
            label="VaR (95%)"
            value={`−${metrics.var95.toFixed(2)}`}
            valueSuffix="%"
            trend={MOCK_RISK_TRENDS.var95}
            riskBadge={metricRiskLevel('var95', metrics)}
          />
          <KpiCard
            label="Strategy fragility"
            value={String(metrics.fragilityScore)}
            valueSuffix="/ 100"
            trend={MOCK_RISK_TRENDS.fragilityScore}
            riskBadge={metricRiskLevel('fragilityScore', metrics)}
          />
        </div>
      </section>

      {/* Main chart + drawdown */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 xl:gap-6">
        <section
          className="xl:col-span-3 rounded-2xl border border-white/[0.07] bg-[#090909]/90 backdrop-blur-xl p-4 sm:p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
          aria-labelledby="risk-mc-title"
        >
          <h2 id="risk-mc-title" className="text-sm font-semibold text-white tracking-tight">
            Monte Carlo trade outcome simulation
          </h2>
          <p className="text-xs text-zinc-600 mt-1 mb-4">
            Shaded band: 5th–95th percentile · lines: median, best, worst path (mock ensemble)
          </p>
          <div className="h-[320px] sm:h-[380px] w-full min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mcSeries} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mcBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity={0.14} />
                    <stop offset="100%" stopColor="#4ade80" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  tickLine={false}
                  tickFormatter={(v) => (Number(v) % 14 === 0 ? `D${v}` : '')}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  tickLine={false}
                  width={40}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(d) => `Day ${d}`}
                  formatter={(val: number, name: string) => [val.toFixed(2), name]}
                />
                <Area type="monotone" dataKey="p5" stackId="band" stroke="none" fill="transparent" />
                <Area type="monotone" dataKey="spread" stackId="band" stroke="none" fill="url(#mcBand)" />
                <Line type="monotone" dataKey="median" stroke="#e4e4e7" strokeWidth={2} dot={false} name="Median" />
                <Line
                  type="monotone"
                  dataKey="best"
                  stroke="#4ade80"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Best case"
                  opacity={0.85}
                />
                <Line
                  type="monotone"
                  dataKey="worst"
                  stroke="#f87171"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Worst case"
                  opacity={0.85}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-[11px] text-zinc-500">
            <span className="flex items-center gap-2">
              <span className="h-2 w-4 rounded-lg bg-zinc-300" /> Median
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-4 rounded-lg bg-emerald-400/70" /> Best
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-4 rounded-lg bg-rose-400/70" /> Worst
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30" /> 5–95% band
            </span>
          </div>
        </section>

        <section
          className="xl:col-span-2 rounded-2xl border border-white/[0.07] bg-[#090909]/90 backdrop-blur-xl p-4 sm:p-6 flex flex-col shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
          aria-labelledby="risk-dd-title"
        >
          <h2 id="risk-dd-title" className="text-sm font-semibold text-white tracking-tight">
            Drawdown distribution
          </h2>
          <p className="text-xs text-zinc-600 mt-1 mb-4">Histogram of path max drawdowns (mock). Markers: median · worst 5%.</p>
          <div className="flex-1 min-h-[220px] sm:min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ddBins} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="binMidPct"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  tickLine={false}
                  tickFormatter={(v) => `${v.toFixed(0)}%`}
                />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} width={32} />
                <Tooltip contentStyle={tooltipStyle} formatter={(c: number) => [c, 'Paths']} labelFormatter={(v) => `≈ ${Number(v).toFixed(1)}%`} />
                <ReferenceLine x={medianDd} stroke="#c4b5fd" strokeDasharray="3 3" label={{ value: 'Median', fill: '#a1a1aa', fontSize: 10 }} />
                <ReferenceLine x={worst5Dd} stroke="#fb7185" strokeDasharray="3 3" label={{ value: 'Worst 5%', fill: '#fb7185', fontSize: 10 }} />
                <Bar dataKey="count" fill="rgba(161,161,170,0.45)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Stress + narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
        <section aria-labelledby="risk-stress-title">
          <h2 id="risk-stress-title" className="text-sm font-semibold text-white tracking-tight mb-1">
            Stress tests
          </h2>
          <p className="text-xs text-zinc-600 mb-4">Select a scenario to emphasize in the run manifest (UI only).</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MOCK_STRESS_SCENARIOS.map((s) => {
              const active = selectedStress === s.id;
              const st = severityStyles(s.severity);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStress((prev) => (prev === s.id ? null : s.id))}
                  className={`text-left rounded-xl border p-4 transition-all ${
                    active
                      ? 'border-institutional-green/50 bg-institutional-green/[0.07] shadow-[0_0_0_1px_rgba(74,222,128,0.12)]'
                      : 'border-white/[0.07] bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-sm font-medium text-zinc-100 leading-snug">{s.name}</span>
                    <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${st.badge}`}>
                      {s.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">{s.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                    <span className="text-zinc-400">
                      Sim. PnL:{' '}
                      <span className={s.pnlImpactPct < 0 ? 'text-rose-300/90' : 'text-emerald-300/90'}>
                        {s.pnlImpactPct > 0 ? '+' : ''}
                        {s.pnlImpactPct.toFixed(1)}%
                      </span>
                    </span>
                    <span className="text-zinc-400">
                      Prob. adj:{' '}
                      <span className="text-amber-200/90">{s.probabilityAdjustmentPts.toFixed(1)} pts</span>
                    </span>
                  </div>
                  <div className={`mt-3 h-1 rounded-full ${st.bar}`} />
                </button>
              );
            })}
          </div>
        </section>

        <section
          className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-5 sm:p-6"
          aria-labelledby="risk-narrative-title"
        >
          <h2 id="risk-narrative-title" className="text-sm font-semibold text-tan/90 tracking-tight mb-3">
            Institutional summary
          </h2>
          <p className="text-xs text-zinc-600 mb-4 leading-relaxed">{MOCK_RISK_NARRATIVE.headline}</p>
          <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                What this strategy looks like under uncertainty
              </p>
              <p>{MOCK_RISK_NARRATIVE.uncertainty}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                How fragile the strategy is to volatility shifts
              </p>
              <p>{MOCK_RISK_NARRATIVE.volatilityFragility}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Whether returns are stable or tail-dependent
              </p>
              <p>{MOCK_RISK_NARRATIVE.tailDependence}</p>
            </div>
          </div>
          <p className="mt-6 text-[11px] text-zinc-600 border-t border-white/[0.06] pt-4 leading-relaxed">
            How likely is this strategy to survive real market conditions? With the current mock calibration, the
            majority of simulated paths clear the survival threshold, but tail shocks remain the binding constraint—
            prioritize stress coverage and capital rules before scaling leverage.
          </p>
        </section>
      </div>
    </div>
  );
}
