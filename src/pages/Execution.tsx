/**
 * Execution — immersive platform page
 */

import React from 'react';
import { Zap, Radio, Timer } from 'lucide-react';
import { PlatformPageShell } from '../components/PlatformPageShell';
import { SEO } from '../components/SEO';

export const Execution: React.FC = () => {
  return (
    <PlatformPageShell>
      <SEO
        title="Execution — General Exchange"
        description="Smart order routing, low-latency connectivity, and transparency from intent to fill."
        keywords="trade execution, smart order routing, options execution, broker connectivity, General Exchange"
        canonical="https://generalexchange.com/execution"
      />

      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute -bottom-20 right-0 w-[28rem] h-[28rem] bg-orange-600/20 rounded-full blur-[120px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <p className="text-orange-400 text-sm font-semibold tracking-widest uppercase mb-4">Execution</p>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white max-w-4xl leading-[1.05] mb-8">
            Route intent to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              confirmed fills
            </span>
          </h1>
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
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Connectivity &amp; transparency</h2>
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
    </PlatformPageShell>
  );
};
