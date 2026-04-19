/**
 * Company — corporate hub (also served at company.general.exchange via middleware)
 */

import React from 'react';
import { Building2 } from 'lucide-react';
import { PlatformPageShell } from '../components/PlatformPageShell';

export const CompanyHub: React.FC = () => {
  return (
    <PlatformPageShell>
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 bg-emerald-600/15 rounded-full blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-10 h-10 text-emerald-400" />
            <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase">Company</p>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white max-w-4xl leading-[1.05] mb-8">
            General Exchange.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Built for institutional flow.
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
            Mission, leadership, and how we partner with desks—from onboarding to production support.
          </p>
        </div>
      </section>
    </PlatformPageShell>
  );
};
