import React from 'react';
import type { IntelligenceItem } from './mockMlDashboardData';

interface IntelligenceStatusBarProps {
  items: IntelligenceItem[];
}

/** Luxury mono: subtle elevation only (tone kept for a11y variety in border weight). */
const toneClasses: Record<IntelligenceItem['tone'], string> = {
  emerald: 'text-zinc-300 border-white/[0.1] bg-white/[0.04]',
  violet: 'text-zinc-300 border-white/[0.1] bg-white/[0.04]',
  amber: 'text-zinc-300 border-white/[0.1] bg-white/[0.04]',
  rose: 'text-zinc-300 border-white/[0.1] bg-white/[0.04]',
  cyan: 'text-zinc-300 border-white/[0.1] bg-white/[0.04]',
};

export const IntelligenceStatusBar: React.FC<IntelligenceStatusBarProps> = ({ items }) => {
  return (
    <div
      className="mb-8 flex animate-dash-fade-in flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-start sm:gap-3"
      aria-label="Real-time intelligence feedback"
    >
      {items.map((item) => (
        <div
          key={item.text}
          className={`w-full max-w-md rounded-xl border px-3 py-2.5 text-center text-xs font-medium transition-all duration-300 hover:border-white/15 sm:w-auto sm:max-w-none sm:flex-1 sm:min-w-[200px] sm:text-left ${toneClasses[item.tone]}`}
        >
          <span className="tabular-nums">{item.text}</span>
        </div>
      ))}
    </div>
  );
};
