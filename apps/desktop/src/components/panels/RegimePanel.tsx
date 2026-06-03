import React from 'react';
import { useRegimeStore } from '@/stores/regimeStore';
import { useMarketStore } from '@/stores/marketStore';
import { useGreeks } from '@/hooks/useGreeks';
import { PayoffPreview } from '@/components/analytics/PayoffPreview';

const VOL_LABEL: Record<string, string> = {
  compressed: 'Compressed',
  normal: 'Normal',
  elevated: 'Elevated',
  stressed: 'Stressed',
};
const TREND_LABEL: Record<string, string> = {
  trending_up: 'Trending up',
  trending_down: 'Trending down',
  mean_reverting: 'Mean-reverting',
  choppy: 'Choppy',
};
const SENT_COLOR: Record<string, string> = {
  positive: 'text-emerald-400',
  neutral: 'text-zinc-300',
  negative: 'text-red-400',
};

function Chip({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded border border-white/[0.06] bg-black/20 px-2 py-1.5">
      <p className="text-[9px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`mt-0.5 text-[12px] ${valueClass ?? 'text-neutral-100'}`}>{value}</p>
    </div>
  );
}

function GreekStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</span>
      <span className="tabular text-[12px] text-zinc-200">{value}</span>
    </div>
  );
}

export const RegimePanel: React.FC = () => {
  const regime = useRegimeStore((s) => s.regime);
  const selected = useMarketStore((s) => s.selectedContract);
  const spot = useMarketStore((s) => s.spot);
  const greeks = useGreeks(selected, spot);

  return (
    <div className="border-b border-white/[0.06] px-3 py-2.5" data-tour="regime-panel">
      <p className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">Environment</p>
      <div className="grid grid-cols-3 gap-1.5">
        <Chip label="Volatility" value={regime ? VOL_LABEL[regime.volRegime] : '—'} />
        <Chip label="Trend" value={regime ? TREND_LABEL[regime.trendRegime] : '—'} />
        <Chip
          label="Sentiment"
          value={regime ? regime.newsSentiment : '—'}
          valueClass={regime ? SENT_COLOR[regime.newsSentiment] : undefined}
        />
      </div>
      {regime?.summary && <p className="mt-2 text-[11px] leading-snug text-zinc-400">{regime.summary}</p>}

      <p className="mb-1.5 mt-3 text-[10px] uppercase tracking-wider text-zinc-500">
        Greeks {selected ? `· ${selected.contractSymbol}` : ''}
      </p>
      {greeks ? (
        <div className="space-y-0.5">
          <GreekStat label="Delta" value={greeks.delta.toFixed(3)} />
          <GreekStat label="Gamma" value={greeks.gamma.toFixed(4)} />
          <GreekStat label="Theta / day" value={greeks.theta.toFixed(3)} />
          <GreekStat label="Vega / 1%" value={greeks.vega.toFixed(3)} />
          <GreekStat label="Vanna" value={greeks.vanna.toFixed(4)} />
          <GreekStat label="Volga" value={greeks.volga.toFixed(4)} />
          <PayoffPreview contract={selected} spot={spot} side="buy" />
        </div>
      ) : (
        <p className="text-[11px] text-zinc-600">Select a contract from the chain.</p>
      )}
    </div>
  );
};
