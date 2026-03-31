import React from 'react';
import type { IntelligenceItem } from './mockMlDashboardData';

interface IntelligenceStatusBarProps {
  items: IntelligenceItem[];
}

const toneClasses: Record<IntelligenceItem['tone'], string> = {
  emerald: 'text-emerald-400/95 border-emerald-500/25 bg-emerald-500/[0.07]',
  violet: 'text-violet-300/95 border-violet-500/25 bg-violet-500/[0.08]',
  amber: 'text-amber-300/95 border-amber-500/25 bg-amber-500/[0.08]',
  rose: 'text-rose-300/95 border-rose-500/25 bg-rose-500/[0.08]',
  cyan: 'text-cyan-300/95 border-cyan-500/25 bg-cyan-500/[0.08]',
};

export const IntelligenceStatusBar: React.FC<IntelligenceStatusBarProps> = ({ items }) => {
  return (
    <div
      className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 mb-8 animate-dash-fade-in"
      aria-label="Real-time intelligence feedback"
    >
      {items.map((item) => (
        <div
          key={item.text}
          className={`flex-1 min-w-[200px] rounded-xl border px-3 py-2.5 text-xs font-medium transition-all duration-300 hover:border-white/20 ${toneClasses[item.tone]}`}
        >
          <span className="tabular-nums">{item.text}</span>
        </div>
      ))}
    </div>
  );
};
