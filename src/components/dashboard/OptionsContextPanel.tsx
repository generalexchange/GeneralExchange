import React from 'react';
import { Sigma } from 'lucide-react';
import type { OptionsContext } from './mockMlDashboardData';
import { DashboardTooltip } from './DashboardTooltip';

const OPTIONS_TOOLTIPS = {
  iv: 'Implied volatility (mock): annualized from the desk curve, not live.',
  delta: 'Delta (mock): sensitivity of contract value to a $1 move in the underlying.',
  gamma: 'Gamma (mock): rate of change of delta with respect to spot.',
  strike: 'Strike price for the reference leg in this mock book.',
  expiration: 'Expiration label with mock days-to-expiration.',
} as const;

interface OptionsContextPanelProps {
  context: OptionsContext;
}

export const OptionsContextPanel: React.FC<OptionsContextPanelProps> = ({ context }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 sm:p-5 h-full transition-all duration-300 hover:border-emerald-500/20">
      <div className="flex items-center gap-2 mb-3">
        <Sigma className="w-4 h-4 text-emerald-400/90" aria-hidden />
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-400/90">Options context</p>
      </div>
      <p className="text-[11px] text-zinc-500 mb-4">Mock greeks & terms · same underlying as chart</p>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-xs">
        <div>
          <dt className="text-zinc-500 mb-0.5">
            <DashboardTooltip label="IV" description={OPTIONS_TOOLTIPS.iv} />
          </dt>
          <dd className="font-mono text-white tabular-nums">{(context.impliedVolatility * 100).toFixed(1)}%</dd>
        </div>
        <div>
          <dt className="text-zinc-500 mb-0.5">
            <DashboardTooltip label="Delta" description={OPTIONS_TOOLTIPS.delta} />
          </dt>
          <dd className="font-mono text-white tabular-nums">{context.delta.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 mb-0.5">
            <DashboardTooltip label="Gamma" description={OPTIONS_TOOLTIPS.gamma} />
          </dt>
          <dd className="font-mono text-white tabular-nums">{context.gamma.toFixed(3)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 mb-0.5">
            <DashboardTooltip label="Strike" description={OPTIONS_TOOLTIPS.strike} />
          </dt>
          <dd className="font-mono text-white tabular-nums">${context.strikePrice}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-zinc-500 mb-0.5">
            <DashboardTooltip label="Expiration" description={OPTIONS_TOOLTIPS.expiration} />
          </dt>
          <dd className="text-zinc-200">{context.expiration}</dd>
        </div>
      </dl>
    </div>
  );
};
