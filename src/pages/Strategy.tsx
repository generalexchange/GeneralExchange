/**
 * Strategy — immersive platform page
 */

import React from 'react';
import { GitBranch, Layers, Sparkles } from 'lucide-react';
import { PlatformPageShell } from '../components/PlatformPageShell';
import { SEO } from '../components/SEO';

export const Strategy: React.FC = () => {
  return (
    <PlatformPageShell>
      <SEO
        title="Strategy — General Exchange"
        description="Design, branch, and deploy options strategies with clear rules, versioning, and signal lineage."
        keywords="trading strategy, options strategies, systematic trading, General Exchange"
        canonical="https://generalexchange.com/strategy"
      />

      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute bottom-0 left-0 w-[min(100%,32rem)] h-64 bg-violet-600/25 rounded-full blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">Strategy</p>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white max-w-4xl leading-[1.05] mb-8">
            From thesis to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-300">
              executable logic
            </span>
          </h1>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Branching &amp; promotion</h2>
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
                <h3 className="text-xl font-semibold text-white mb-2">Multi-leg templates</h3>
                <p className="text-gray-500 leading-relaxed">
                  Spreads, condors, and ratio rolls as first-class blocks—constraints propagate to risk and execution automatically.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Sparkles className="w-10 h-10 text-violet-400 shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Signal hygiene</h3>
                <p className="text-gray-500 leading-relaxed">
                  Feature stores and label definitions travel with the strategy ID so research and live never drift apart.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PlatformPageShell>
  );
};
