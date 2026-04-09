/**
 * University — learning paths and platform education
 */

import React from 'react';
import { GraduationCap, BookOpen, Lightbulb } from 'lucide-react';
import { PlatformPageShell } from '../components/PlatformPageShell';

export const University: React.FC = () => {
  return (
    <PlatformPageShell>
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="w-10 h-10 text-blue-400" />
            <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase">University</p>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white max-w-4xl leading-[1.05] mb-8">
            Learn the platform.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              Master the workflow.
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
            Self-paced modules on Greeks, surface dynamics, risk limits, and execution—designed for desks that treat education as part
            of the stack.
          </p>
        </div>
      </section>

      <section className="relative min-h-screen flex items-center border-t border-[#1a1a1a] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid md:grid-cols-2 gap-12 w-full">
          <div className="flex gap-4">
            <BookOpen className="w-10 h-10 text-blue-400 shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">Tracks &amp; prerequisites</h2>
              <p className="text-gray-500 leading-relaxed">
                Foundations → intermediate options → risk engine deep dives. Clear sequencing so new hires and seasoned PMs share the
                same vocabulary.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Lightbulb className="w-10 h-10 text-amber-400 shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">Labs &amp; scenarios</h2>
              <p className="text-gray-500 leading-relaxed">
                Guided exercises on historical regimes: roll decisions, hedge ratios, and when to stand down—without risking capital.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PlatformPageShell>
  );
};
