import React from 'react';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { ModelEdge } from './mockMlDashboardData';
import { METRIC_TOOLTIPS } from './mockMlDashboardData';

interface ModelEdgeCardProps {
  edge: ModelEdge;
}

const bandStyle: Record<ModelEdge['band'], string> = {
  strong: 'border-white/15 bg-white/[0.06] text-zinc-200',
  neutral: 'border-white/10 bg-white/[0.03] text-zinc-300',
  weak: 'border-zinc-700 bg-zinc-900/40 text-zinc-400',
};

const bandLabel: Record<ModelEdge['band'], string> = {
  strong: 'Strong edge',
  neutral: 'Neutral',
  weak: 'Weak edge',
};

export const ModelEdgeCard: React.FC<ModelEdgeCardProps> = ({ edge }) => {
  const TrendIcon = edge.trend === 'up' ? TrendingUp : edge.trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    edge.trend === 'up' ? 'text-zinc-200' : edge.trend === 'down' ? 'text-zinc-500' : 'text-zinc-500';

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 shadow-lg shadow-black/40 transition-all duration-500 hover:border-white/15 ${bandStyle[edge.band]}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
          <span title={METRIC_TOOLTIPS.modelEdge} className="cursor-help border-b border-dotted border-zinc-600">
            Model Edge
          </span>
        </p>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/40 border border-white/[0.08] text-zinc-400">
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
      <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
        Blends directional accuracy, rolling accuracy trend, and volatility regime (mock).
      </p>
    </div>
  );
};
