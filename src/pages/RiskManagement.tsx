/**
 * Risk Management — immersive platform page
 */

import React from 'react';
import { Shield, AlertTriangle, Scale } from 'lucide-react';
import { PlatformPageShell } from '../components/PlatformPageShell';
import { SEO } from '../components/SEO';

export const RiskManagement: React.FC = () => {
  return (
    <PlatformPageShell>
      <SEO
        title="Risk Management — General Exchange"
        description="Portfolio-level limits, Greeks aggregation, and stress grids built for options books."
        keywords="risk management, portfolio risk, options Greeks, trading limits, General Exchange"
        canonical="https://generalexchange.com/risk-management"
      />

      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-emerald-600/20 rounded-full blur-[120px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-4">Risk Management</p>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white max-w-4xl leading-[1.05] mb-8">
            See the whole book before{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              the market does
            </span>
          </h1>
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
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Stress that respects structure</h2>
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
              <h3 className="text-xl font-semibold text-white mb-2">Concentration &amp; liquidity</h3>
              <p className="text-gray-500 leading-relaxed">
                Single-name, sector, and factor caps with depth-aware unwind estimates so limits match what you can actually trade.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Scale className="w-10 h-10 text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Governance</h3>
              <p className="text-gray-500 leading-relaxed">
                Immutable audit of limit changes, acknowledgements, and exceptions—regulators and CIOs read the same timeline.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PlatformPageShell>
  );
};
