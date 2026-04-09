/**
 * Investor Relations — company disclosures and shareholder resources
 */

import React from 'react';
import { Landmark, PieChart, Mail } from 'lucide-react';
import { PlatformPageShell } from '../components/PlatformPageShell';

export const InvestorRelations: React.FC = () => {
  return (
    <PlatformPageShell>
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <Landmark className="w-10 h-10 text-slate-400 mb-6" />
          <p className="text-slate-400 text-sm font-semibold tracking-widest uppercase mb-4">Investor Relations</p>
          <h1 className="text-4xl sm:text-6xl font-bold text-white max-w-4xl leading-[1.05] mb-8">
            Transparent,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-white">
              stakeholder-grade reporting
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
            Financial summaries, strategic updates, and governance practices—in one place for current and prospective investors.
          </p>
        </div>
      </section>

      <section className="relative min-h-screen flex items-center border-t border-[#1a1a1a] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl">
            <div className="flex gap-4">
              <PieChart className="w-10 h-10 text-slate-400 shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Reports &amp; updates</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Quarterly highlights, KPI rollups, and long-form letters when material events warrant detail.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Mail className="w-10 h-10 text-slate-400 shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Inquiries</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Dedicated IR contact for institutional questions, data room access, and governance documentation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PlatformPageShell>
  );
};
