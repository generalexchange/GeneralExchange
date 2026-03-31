import React from 'react';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { ModelEdge } from './mockMlDashboardData';
import { METRIC_TOOLTIPS } from './mockMlDashboardData';

interface ModelEdgeCardProps {
  edge: ModelEdge;
}

const bandStyle: Record<ModelEdge['band'], string> = {
  strong: 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-transparent to-transparent text-emerald-100',
  neutral: 'border-amber-500/35 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent text-amber-100',
  weak: 'border-rose-500/35 bg-gradient-to-br from-rose-500/12 via-transparent to-transparent text-rose-100',
};

const bandLabel: Record<ModelEdge['band'], string> = {
  strong: 'Strong edge',
  neutral: 'Neutral',
  weak: 'Weak edge',
};

export const ModelEdgeCard: React.FC<ModelEdgeCardProps> = ({ edge }) => {
  const TrendIcon = edge.trend === 'up' ? TrendingUp : edge.trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    edge.trend === 'up' ? 'text-emerald-400' : edge.trend === 'down' ? 'text-rose-400' : 'text-zinc-400';

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 shadow-lg shadow-black/25 transition-all duration-500 hover:shadow-[0_12px_40px_-16px_rgba(167,139,246,0.2)] ${bandStyle[edge.band]}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-[11px] uppercase tracking-wider font-semibold opacity-90">
          <span title={METRIC_TOOLTIPS.modelEdge} className="cursor-help border-b border-dotted border-white/30">
            Model Edge
          </span>
        </p>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/30 border border-white/10">
          {bandLabel[edge.band]}
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <p className="text-3xl sm:text-4xl font-semibold tabular-nums text-white">{edge.score}</p>
        <div className={`flex items-center gap-1 text-sm font-semibold ${trendColor}`} title="Mock trend vs prior evaluation window">
          <TrendIcon className="w-5 h-5" />
          <span className="sr-only">Trend {edge.trend}</span>
        </div>
      </div>
      <p className="text-[11px] text-white/70 mt-2 leading-relaxed">
        Blends directional accuracy, rolling accuracy trend, and volatility regime (mock).
      </p>
    </div>
  );
};
