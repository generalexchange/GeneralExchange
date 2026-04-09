/**
 * Full-viewport platform capability sections inlined on the Features page (formerly standalone routes).
 */

import React from 'react';
import {
  LineChart,
  Database,
  Gauge,
  Cpu,
  GitBranch,
  Layers,
  Sparkles,
  Shield,
  AlertTriangle,
  Scale,
  Zap,
  Radio,
  Timer,
  Workflow,
  Webhook,
  Clock,
  BarChart3,
  Target,
  TrendingUp,
} from 'lucide-react';

const scrollClass = 'scroll-mt-[4.5rem]';

export const FeaturesPlatformSections: React.FC = () => {
  return (
    <>
      {/* Backtesting */}
      <div id="feature-backtesting" className={scrollClass}>
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden border-t border-[#1a1a1a]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="absolute top-1/4 -right-32 w-96 h-96 bg-institutional-green/15 rounded-full blur-[128px]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <p className="text-tan text-sm font-semibold tracking-widest uppercase mb-4">Backtesting</p>
            <h2 className="font-display text-3xl sm:text-5xl lg:text-7xl font-medium text-white max-w-4xl leading-tight break-words mb-8">
              Replay the market with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-tan to-institutional-green/90">
                institutional-grade fidelity
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
              Stress strategies across regimes, slippage curves, and borrow costs before capital touches the tape. Your hypotheses meet
              history—not hope.
            </p>
          </div>
        </section>
        <section className="relative min-h-screen flex items-center border-t border-[#1a1a1a] bg-[#080808]">
          <div className="absolute inset-0 bg-gradient-to-b from-institutional-green/10 to-transparent pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center w-full">
            <div>
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">Walk-forward &amp; embargo windows</h3>
              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                Segment time into train, validate, and hold-out blocks so edge isn&apos;t a curve-fit artifact. Out-of-sample metrics stay
                pinned beside in-sample—no silent leakage.
              </p>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <LineChart className="w-5 h-5 text-tan shrink-0 mt-0.5" />
                  <span>Equity, drawdown, and tail-risk curves with rolling window statistics</span>
                </li>
                <li className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-tan shrink-0 mt-0.5" />
                  <span>Tick, bar, and surface snapshots aligned to your execution assumptions</span>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-institutional-green/25 bg-[#0f0f0f] p-8 font-mono text-sm text-gray-400 shadow-2xl shadow-institutional-green/10">
              <div className="text-gray-500 mb-4">{'// simulation manifest'}</div>
              <pre className="text-tan/90 whitespace-pre-wrap leading-relaxed">
                {`regime: volatility_cluster_v2\nslippage: adaptive_bps\nborrow: HTB_curve\nruns: 10_000 paths\nOOS Sharpe: 1.84`}
              </pre>
            </div>
          </div>
        </section>
        <section id="feature-monte-carlo" className={`relative min-h-screen flex items-center border-t border-[#1a1a1a] ${scrollClass}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Gauge, t: 'Latency & fill models', d: 'Queue position, partial fills, and cancel/replace semantics that mirror live routes.' },
                { icon: Cpu, t: 'Greeks pathing', d: 'Intraday surface shifts replayed so delta-hedge P&amp;L isn’t smoothed away.' },
                { icon: LineChart, t: 'Attribution', d: 'Decompose P&amp;L into vol, carry, skew, and execution—know what actually worked.' },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="p-8 rounded-xl border border-white/10 bg-white/[0.02] hover:border-institutional-green/35 transition-colors">
                  <Icon className="w-8 h-8 text-tan mb-4" />
                  <h4 className="text-lg font-semibold text-white mb-2">{t}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Strategy */}
      <div id="feature-strategy" className={scrollClass}>
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden border-t border-[#1a1a1a]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="absolute bottom-0 left-0 w-[min(100%,32rem)] h-64 bg-violet-600/25 rounded-full blur-[100px]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">Strategy</p>
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white max-w-4xl leading-tight break-words mb-8">
              From thesis to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-300">executable logic</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
              Compose legs, triggers, and roll rules in a versioned graph. Every branch is diffable—audit trails stay as sharp as your
              edge case tests.
            </p>
          </div>
        </section>
        <section className="relative min-h-screen flex items-center border-t border-[#1a1a1a] bg-[#080808]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center w-full">
            <div className="order-2 lg:order-1 rounded-2xl border border-violet-500/20 bg-[#0f0f0f] p-8 h-80 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-violet-300/80">
                <GitBranch className="w-16 h-16" />
                <span className="font-mono text-sm text-gray-500">strategy_graph_v3 · main</span>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">Branching &amp; promotion</h3>
              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                Promote experiments from sandbox to paper to production with signed approvals. Roll back a deployment without losing the
                lineage of signals that fired.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                Parameter sweeps and scenario matrices live next to the graph—no context switching into ad-hoc notebooks.
              </p>
            </div>
          </div>
        </section>
        <section className="relative min-h-screen flex items-center border-t border-[#1a1a1a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
            <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              <div className="flex gap-4">
                <Layers className="w-10 h-10 text-violet-400 shrink-0" />
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">Multi-leg templates</h4>
                  <p className="text-gray-500 leading-relaxed">
                    Spreads, condors, and ratio rolls as first-class blocks—constraints propagate to risk and execution automatically.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Sparkles className="w-10 h-10 text-violet-400 shrink-0" />
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">Signal hygiene</h4>
                  <p className="text-gray-500 leading-relaxed">
                    Feature stores and label definitions travel with the strategy ID so research and live never drift apart.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Risk Management */}
      <div id="feature-risk-management" className={scrollClass}>
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden border-t border-[#1a1a1a]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-emerald-600/20 rounded-full blur-[120px]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-4">Risk Management</p>
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white max-w-4xl leading-tight break-words mb-8">
              See the whole book before{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">the market does</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
              Net Greeks, concentration, and scenario P&amp;L in one surface. Limits breathe with volatility—static thresholds don&apos;t
              lull you into a false calm.
            </p>
          </div>
        </section>
        <section className="relative min-h-screen flex items-center border-t border-[#1a1a1a] bg-[#080808]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <h3 className="text-3xl sm:text-4xl font-bold text-white">Stress that respects structure</h3>
                <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                  Shock skew, term structure, and correlation blocks simultaneously. Book-level what-ifs propagate to desk-level action
                  items—who must hedge what, and by when.
                </p>
                <div className="flex flex-wrap gap-4">
                  {['VaR / CVaR', 'Spot × vol grid', 'Jump & tail overlays'].map((label) => (
                    <span
                      key={label}
                      className="px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-emerald-200/90 text-sm font-medium"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-[#0f0f0f] p-6 flex flex-col justify-center">
                <Shield className="w-12 h-12 text-emerald-400 mb-4" />
                <p className="text-gray-400 text-sm leading-relaxed">
                  Real-time breach routing: escalate to risk lead, throttle new risk, or flatten—policy-driven, not manual heroics.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="relative min-h-screen flex items-center border-t border-[#1a1a1a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid md:grid-cols-2 gap-12 w-full">
            <div className="flex gap-4">
              <AlertTriangle className="w-10 h-10 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Concentration &amp; liquidity</h4>
                <p className="text-gray-500 leading-relaxed">
                  Single-name, sector, and factor caps with depth-aware unwind estimates so limits match what you can actually trade.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Scale className="w-10 h-10 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Governance</h4>
                <p className="text-gray-500 leading-relaxed">
                  Immutable audit of limit changes, acknowledgements, and exceptions—regulators and CIOs read the same timeline.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Execution */}
      <div id="feature-execution" className={scrollClass}>
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden border-t border-[#1a1a1a]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="absolute -bottom-20 right-0 w-[18rem] sm:w-[24rem] lg:w-[28rem] h-[18rem] sm:h-[24rem] lg:h-[28rem] bg-orange-600/20 rounded-full blur-[120px]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <p className="text-orange-400 text-sm font-semibold tracking-widest uppercase mb-4">Execution</p>
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white max-w-4xl leading-tight break-words mb-8">
              Route intent to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">confirmed fills</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
              Slice size, venue selection, and cancel/replace cadence tuned for options liquidity maps. Every child order traces back to
              the parent intent—no orphaned tickets.
            </p>
          </div>
        </section>
        <section className="relative min-h-screen flex items-center border-t border-[#1a1a1a] bg-[#080808]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">Connectivity &amp; transparency</h3>
                <p className="text-lg text-gray-400 leading-relaxed mb-6">
                  Drop in broker adapters without forking your strategy layer. Latency histograms and reject reasons surface next to the
                  blotter—ops and PMs share one pulse.
                </p>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Smart routing respects your risk checks: nothing hits the wire until limits and notionals pass.
                </p>
              </div>
              <div className="rounded-2xl border border-orange-500/20 bg-[#0f0f0f] p-8 space-y-6">
                {[
                  { icon: Zap, label: 'Co-located paths', sub: 'Warm sessions, measured round-trips' },
                  { icon: Radio, label: 'Venue-aware', sub: 'Options complex vs leg-by-leg when it matters' },
                  { icon: Timer, label: 'Clock sync', sub: 'Event-time reconciliation across sessions' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-4 border-b border-white/5 pb-6 last:border-0 last:pb-0">
                    <Icon className="w-8 h-8 text-orange-400 shrink-0" />
                    <div>
                      <div className="text-white font-medium">{label}</div>
                      <div className="text-sm text-gray-500">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="relative min-h-screen flex items-center justify-center border-t border-[#1a1a1a]">
          <p className="text-center text-2xl sm:text-3xl font-light text-gray-500 max-w-3xl px-6 leading-relaxed">
            Execution isn&apos;t a black box—it&apos;s the contract between your model and the market.
          </p>
        </section>
      </div>

      {/* Automation */}
      <div id="feature-automation" className={scrollClass}>
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden border-t border-[#1a1a1a]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="absolute top-20 right-20 w-80 h-80 bg-pink-600/15 rounded-full blur-[100px]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <p className="text-pink-400 text-sm font-semibold tracking-widest uppercase mb-4">Automation</p>
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white max-w-4xl leading-tight break-words mb-8">
              Run the desk on{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-tan to-institutional-green/90">rails you trust</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
              Cron rolls, signal-driven webhooks, and circuit breakers that halt flows when variance or connectivity drifts. Automation
              amplifies discipline—it doesn&apos;t replace it.
            </p>
          </div>
        </section>
        <section className="relative min-h-screen flex items-center border-t border-[#1a1a1a] bg-[#080808]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1 p-8 rounded-2xl border border-pink-500/20 bg-[#0f0f0f]">
                <Workflow className="w-10 h-10 text-pink-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Playbooks</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Visual flows for open, adjust, roll, and flatten—each step gated by risk checks and dual approval where required.
                </p>
              </div>
              <div className="md:col-span-1 p-8 rounded-2xl border border-institutional-green/25 bg-[#0f0f0f]">
                <Webhook className="w-10 h-10 text-tan mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Webhooks &amp; events</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Push fills, breaches, and research signals to Slack, PagerDuty, or your data lake—signed payloads, idempotent handlers.
                </p>
              </div>
              <div className="md:col-span-1 p-8 rounded-2xl border border-pink-500/20 bg-[#0f0f0f]">
                <Clock className="w-10 h-10 text-pink-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Schedules</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Market-open routines, expiry week rolls, and EOD reconciliations with timezone-aware clocks and holiday calendars.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="relative min-h-screen flex items-center border-t border-[#1a1a1a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center w-full">
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Every automated path emits structured logs and replay bundles—when something breaks at 3 a.m., you reconstruct it before
              the open.
            </p>
          </div>
        </section>
      </div>

      {/* Performance */}
      <div id="feature-performance" className={scrollClass}>
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden border-t border-[#1a1a1a]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[120px]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <p className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-4">Performance</p>
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white max-w-4xl leading-tight break-words mb-8">
              Measure what the book{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">actually earned</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
              Roll up realized and mark-to-market P&amp;L with clean attribution to vol, carry, skew, and execution. Compare to your
              benchmark and risk budget—not just yesterday&apos;s print.
            </p>
          </div>
        </section>
        <section className="relative min-h-screen flex items-center border-t border-[#1a1a1a] bg-[#080808]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center w-full">
            <div>
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">Attribution &amp; drill-down</h3>
              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                Slice performance by strategy, book, or single-name complex. See which legs contributed and which hedges paid for
                themselves—without exporting to a spreadsheet fire drill.
              </p>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Time-weighted and money-weighted views with custom reporting periods</span>
                </li>
                <li className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Target risk budget vs realized: variance explained, not hidden in a single headline Sharpe</span>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-cyan-500/20 bg-[#0f0f0f] p-8 font-mono text-sm text-gray-400 shadow-2xl shadow-cyan-900/10">
              <div className="text-gray-500 mb-4">{'// performance summary · YTD'}</div>
              <pre className="text-cyan-300/90 whitespace-pre-wrap leading-relaxed">
                {`net P&L:     +14.2%\nbenchmark:   +6.1%\nmax DD:      -4.8%\nIR vs bench: 1.31`}
              </pre>
            </div>
          </div>
        </section>
        <section className="relative min-h-screen flex items-center border-t border-[#1a1a1a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 max-w-4xl mx-auto">
              <TrendingUp className="w-14 h-14 text-cyan-400 shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Discipline on display</h3>
                <p className="text-gray-500 text-lg leading-relaxed">
                  Drawdown clocks, recovery time, and streak stats sit next to live exposure so performance reviews match how the desk
                  actually ran the book—not how the slide deck wished it had.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
