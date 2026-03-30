/**
 * Backtesting — immersive platform page
 */

import React from 'react';
import { LineChart, Database, Gauge, Cpu } from 'lucide-react';
import { PlatformPageShell } from '../components/PlatformPageShell';
import { SEO } from '../components/SEO';

export const Backtesting: React.FC = () => {
  return (
    <PlatformPageShell>
      <SEO
        title="Backtesting — General Exchange"
        description="Walk-forward simulation, realistic fills, and regime-aware metrics for options and multi-leg strategies."
        keywords="backtesting, walk-forward, trading simulation, options backtest, General Exchange"
        canonical="https://generalexchange.com/backtesting"
      />

      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-4">Backtesting</p>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white max-w-4xl leading-[1.05] mb-8">
            Replay the market with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              institutional-grade fidelity
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
            Stress strategies across regimes, slippage curves, and borrow costs before capital touches the tape. Your hypotheses meet
            history—not hope.
          </p>
        </div>
      </section>

      <section className="relative min-h-screen flex items-center border-t border-[#1a1a1a] bg-[#080808]">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center w-full">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Walk-forward &amp; embargo windows</h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-6">
              Segment time into train, validate, and hold-out blocks so edge isn&apos;t a curve-fit artifact. Out-of-sample metrics stay
              pinned beside in-sample—no silent leakage.
            </p>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start gap-3">
                <LineChart className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span>Equity, drawdown, and tail-risk curves with rolling window statistics</span>
              </li>
              <li className="flex items-start gap-3">
                <Database className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span>Tick, bar, and surface snapshots aligned to your execution assumptions</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-blue-500/20 bg-[#0f0f0f] p-8 font-mono text-sm text-gray-400 shadow-2xl shadow-blue-900/20">
            <div className="text-gray-500 mb-4">// simulation manifest</div>
            <pre className="text-blue-300/90 whitespace-pre-wrap leading-relaxed">
              {`regime: volatility_cluster_v2\nslippage: adaptive_bps\nborrow: HTB_curve\nruns: 10_000 paths\nOOS Sharpe: 1.84`}
            </pre>
          </div>
        </div>
      </section>

      <section className="relative min-h-screen flex items-center border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Gauge, t: 'Latency & fill models', d: 'Queue position, partial fills, and cancel/replace semantics that mirror live routes.' },
              { icon: Cpu, t: 'Greeks pathing', d: 'Intraday surface shifts replayed so delta-hedge P&amp;L isn’t smoothed away.' },
              { icon: LineChart, t: 'Attribution', d: 'Decompose P&amp;L into vol, carry, skew, and execution—know what actually worked.' },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="p-8 rounded-xl border border-white/10 bg-white/[0.02] hover:border-blue-500/30 transition-colors">
                <Icon className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{t}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PlatformPageShell>
  );
};
