/**
 * Documents — corporate and legal reference library
 */

import React from 'react';
import { FileText, FolderOpen, ShieldCheck } from 'lucide-react';
import { PlatformPageShell } from '../components/PlatformPageShell';

export const Documents: React.FC = () => {
  return (
    <PlatformPageShell>
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(71,85,105,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(71,85,105,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <FileText className="w-10 h-10 text-slate-500 mb-6" />
          <p className="text-slate-500 text-sm font-semibold tracking-widest uppercase mb-4">Documents</p>
          <h1 className="text-4xl sm:text-6xl font-bold text-white max-w-4xl leading-[1.05] mb-8">
            Policies, filings,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-200">
              and reference packs
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
            Central library for charters, terms, regulatory summaries, and operational policies—versioned and easy to audit.
          </p>
        </div>
      </section>

      <section className="relative min-h-screen flex items-center border-t border-[#1a1a1a] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
              <FolderOpen className="w-8 h-8 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Corporate</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Articles, bylaws, resolutions, and board materials as published.</p>
            </div>
            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
              <ShieldCheck className="w-8 h-8 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Compliance</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Risk disclosures, vendor policies, and security attestations.</p>
            </div>
            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] sm:col-span-2 lg:col-span-1">
              <FileText className="w-8 h-8 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Legal &amp; terms</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Master agreements, DPA templates, and customer-facing terms of use.</p>
            </div>
          </div>
        </div>
      </section>
    </PlatformPageShell>
  );
};
