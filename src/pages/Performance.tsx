/**
 * Performance — immersive platform page
 */

import React from 'react';
import { BarChart3, Target, TrendingUp } from 'lucide-react';
import { PlatformPageShell } from '../components/PlatformPageShell';
import { SEO } from '../components/SEO';

export const Performance: React.FC = () => {
  return (
    <PlatformPageShell>
      <SEO
        title="Performance — General Exchange"
        description="Live and historical performance analytics: attribution, benchmark comparison, and drawdown discipline for options books."
        keywords="portfolio performance, trading performance, PnL attribution, drawdown, General Exchange"
        canonical="https://generalexchange.com/performance"
      />

      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[120px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <p className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-4">Performance</p>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white max-w-4xl leading-[1.05] mb-8">
            Measure what the book{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">
              actually earned
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
            Roll up realized and mark-to-market P&amp;L with clean attribution to vol, carry, skew, and execution. Compare to your
            benchmark and risk budget—not just yesterday&apos;s print.
          </p>
        </div>
      </section>

      <section className="relative min-h-screen flex items-center border-t border-[#1a1a1a] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center w-full">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Attribution &amp; drill-down</h2>
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
            <div className="text-gray-500 mb-4">// performance summary · YTD</div>
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
    </PlatformPageShell>
  );
};
