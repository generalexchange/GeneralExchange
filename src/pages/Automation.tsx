/**
 * Automation — immersive platform page
 */

import React from 'react';
import { Workflow, Webhook, Clock } from 'lucide-react';
import { PlatformPageShell } from '../components/PlatformPageShell';
import { SEO } from '../components/SEO';

export const Automation: React.FC = () => {
  return (
    <PlatformPageShell>
      <SEO
        title="Automation — General Exchange"
        description="Schedules, webhooks, and guarded deployments so strategies run without manual babysitting."
        keywords="trading automation, algo deployment, webhooks, scheduled trading, General Exchange"
        canonical="https://generalexchange.com/automation"
      />

      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-20 right-20 w-80 h-80 bg-pink-600/15 rounded-full blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <p className="text-pink-400 text-sm font-semibold tracking-widest uppercase mb-4">Automation</p>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white max-w-4xl leading-[1.05] mb-8">
            Run the desk on{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-blue-400">
              rails you trust
            </span>
          </h1>
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
              <h2 className="text-xl font-bold text-white mb-3">Playbooks</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Visual flows for open, adjust, roll, and flatten—each step gated by risk checks and dual approval where required.
              </p>
            </div>
            <div className="md:col-span-1 p-8 rounded-2xl border border-blue-500/20 bg-[#0f0f0f]">
              <Webhook className="w-10 h-10 text-blue-400 mb-4" />
              <h2 className="text-xl font-bold text-white mb-3">Webhooks &amp; events</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Push fills, breaches, and research signals to Slack, PagerDuty, or your data lake—signed payloads, idempotent handlers.
              </p>
            </div>
            <div className="md:col-span-1 p-8 rounded-2xl border border-pink-500/20 bg-[#0f0f0f]">
              <Clock className="w-10 h-10 text-pink-400 mb-4" />
              <h2 className="text-xl font-bold text-white mb-3">Schedules</h2>
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
    </PlatformPageShell>
  );
};
