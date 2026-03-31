import React from 'react';
import { Target, Timer, TrendingDown, TrendingUp } from 'lucide-react';
import type { PredictionOutlook as Outlook } from './mockMlDashboardData';
import { METRIC_TOOLTIPS } from './mockMlDashboardData';
import { DashboardTooltip } from './DashboardTooltip';

interface PredictionOutlookPanelProps {
  outlook: Outlook;
  /** Latest actual vs predicted (for divergence display). */
  actual: number;
  predicted: number;
}

export const PredictionOutlookPanel: React.FC<PredictionOutlookPanelProps> = ({ outlook, actual, predicted }) => {
  const divergence = predicted - actual;
  const divergencePct = actual !== 0 ? (divergence / actual) * 100 : 0;
  const isUpside = divergence >= 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 sm:p-5 shadow-[0_12px_48px_-24px_rgba(0,0,0,0.55)] transition-all duration-500 hover:border-violet-500/30">
      <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-violet-400/90 mb-1">Decision readout</p>
      <p className="text-xs text-zinc-500 mb-4">Prediction → confidence → horizon (mock)</p>

      <div
        className={`rounded-xl border px-3 py-2.5 mb-4 flex items-center gap-2 ${
          isUpside
            ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
            : 'border-rose-500/35 bg-rose-500/10 text-rose-200'
        }`}
      >
        {isUpside ? <TrendingUp className="w-4 h-4 shrink-0" /> : <TrendingDown className="w-4 h-4 shrink-0" />}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/90">Actual vs predicted</p>
          <p className="text-xs tabular-nums mt-0.5">
            Gap{' '}
            <span className="font-mono font-semibold">
              {divergence >= 0 ? '+' : ''}
              {divergence.toFixed(2)}
            </span>{' '}
            <span className="text-white/70">
              ({divergencePct >= 0 ? '+' : ''}
              {divergencePct.toFixed(2)}%)
            </span>
          </p>
        </div>
      </div>

      <dl className="space-y-4">
        <div>
          <dt className="text-[11px] text-zinc-500 mb-1">
            <DashboardTooltip label="Expected move" description={METRIC_TOOLTIPS.expectedMove} />
          </dt>
          <dd
            className={`text-lg font-semibold tabular-nums ${
              outlook.expectedMovePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {outlook.expectedMovePct >= 0 ? '+' : ''}
            {outlook.expectedMovePct.toFixed(2)}%
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-zinc-500 mb-1 flex items-center gap-1">
            <Target className="w-3 h-3" aria-hidden />
            <DashboardTooltip label="Target price" description={METRIC_TOOLTIPS.targetPrice} />
          </dt>
          <dd className="text-lg font-semibold text-white tabular-nums">${outlook.targetPrice.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-zinc-500 mb-1 flex items-center gap-1">
            <Timer className="w-3 h-3" aria-hidden />
            <DashboardTooltip label="Time to target" description={METRIC_TOOLTIPS.timeToTarget} />
          </dt>
          <dd className="text-lg font-semibold text-white tabular-nums">{outlook.timeToTargetMinutes} min</dd>
        </div>
        <div>
          <dt className="text-[11px] text-zinc-500 mb-1">
            <DashboardTooltip label="Confidence strength" description={METRIC_TOOLTIPS.confidenceStrength} />
          </dt>
          <dd>
            <div className="h-2 rounded-full bg-black/50 border border-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-700 ease-out"
                style={{ width: `${outlook.confidenceStrength}%` }}
              />
            </div>
            <p className="text-xs text-zinc-400 mt-1 tabular-nums">{outlook.confidenceStrength}/100</p>
          </dd>
        </div>
      </dl>
    </div>
  );
};
