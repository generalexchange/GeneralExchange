import React, { useEffect, useId } from 'react';
import { X, Activity, BarChart3, Layers, TrendingUp, SlidersHorizontal } from 'lucide-react';

export interface PortfolioAnalyticsModalProps {
  open: boolean;
  onClose: () => void;
  onOpenTradeEngine?: () => void;
}

export const PortfolioAnalyticsModal: React.FC<PortfolioAnalyticsModalProps> = ({
  open,
  onClose,
  onOpenTradeEngine,
}) => {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const handleEngine = () => {
    onClose();
    onOpenTradeEngine?.();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-black/75 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[min(92vh,880px)] w-full max-w-3xl flex-col rounded-t-2xl border border-white/10 bg-[#090b0f] shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10">
              <BarChart3 className="h-5 w-5 text-violet-300" aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-semibold text-white tracking-tight">
                Portfolio analytics
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Paper desk metrics · mock calculations until the warehouse is live.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { k: 'Sharpe (mock)', v: '1.42', d: 'vs risk-free 4.2%' },
              { k: 'Vol (ann.)', v: '18.3%', d: 'Parkinson blend' },
              { k: 'Max drawdown', v: '−6.8%', d: '90-day window' },
              { k: 'Win days', v: '58%', d: 'Directional closes' },
            ].map((row) => (
              <div key={row.k} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{row.k}</p>
                <p className="mt-2 text-lg font-semibold tabular-nums text-white">{row.v}</p>
                <p className="mt-1 text-[11px] text-zinc-600">{row.d}</p>
              </div>
            ))}
          </div>

          <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Turnover & flow</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 text-sm">
              <div>
                <p className="text-zinc-500 text-xs">ADV participation</p>
                <p className="font-mono text-white mt-1">11.2%</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs">Net bought (session)</p>
                <p className="font-mono text-emerald-400 mt-1">+$42.1k</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs">Cost drag (est.)</p>
                <p className="font-mono text-zinc-300 mt-1">$128</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Exposure (mock)</h3>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] text-zinc-500 border-b border-white/10">
                  <th className="pb-2 font-medium">Bucket</th>
                  <th className="pb-2 font-medium text-right">Notional</th>
                  <th className="pb-2 font-medium text-right">% book</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-white/5">
                  <td className="py-2">US large cap</td>
                  <td className="py-2 text-right font-mono">$92.4k</td>
                  <td className="py-2 text-right font-mono">72%</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2">Options overlays</td>
                  <td className="py-2 text-right font-mono">$18.1k</td>
                  <td className="py-2 text-right font-mono">14%</td>
                </tr>
                <tr>
                  <td className="py-2">Cash & MMF</td>
                  <td className="py-2 text-right font-mono">$17.4k</td>
                  <td className="py-2 text-right font-mono">14%</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-300" />
              <p className="text-sm text-zinc-200">
                Best day <span className="font-mono text-white">+2.34%</span> · Worst{' '}
                <span className="font-mono text-rose-300">−1.12%</span> (mock trailing 90D)
              </p>
            </div>
          </section>

          {onOpenTradeEngine && (
            <button
              type="button"
              onClick={handleEngine}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] py-3 text-sm font-medium text-zinc-200 hover:bg-white/10"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Open trade engine configuration
            </button>
          )}
        </div>

        <div className="border-t border-white/10 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-white/10 py-2.5 text-sm font-medium text-white hover:bg-white/15"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
