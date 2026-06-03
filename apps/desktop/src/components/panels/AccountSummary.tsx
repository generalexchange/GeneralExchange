import React from 'react';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { formatCurrency, formatSignedCurrency, formatPercent, pnlColorClass } from '@/lib/format';

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-baseline justify-between py-0.5">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</span>
      <span className={`tabular text-[12px] ${valueClass ?? 'text-zinc-200'}`}>{value}</span>
    </div>
  );
}

export const AccountSummary: React.FC = () => {
  const value = usePortfolioStore((s) => s.portfolioValue);
  const cash = usePortfolioStore((s) => s.cash);
  const dayPnl = usePortfolioStore((s) => s.dayPnl);
  const dayPnlPct = usePortfolioStore((s) => s.dayPnlPct);
  const totalPnl = usePortfolioStore((s) => s.totalPnl);

  return (
    <div className="border-t border-white/[0.06] px-3 py-2">
      <Row label="Portfolio" value={formatCurrency(value)} valueClass="text-neutral-100" />
      <Row label="Cash" value={formatCurrency(cash)} />
      <Row
        label="Day P&L"
        value={`${formatSignedCurrency(dayPnl)}  ${formatPercent(dayPnlPct, 2, true)}`}
        valueClass={pnlColorClass(dayPnl)}
      />
      <Row label="Total P&L" value={formatSignedCurrency(totalPnl)} valueClass={pnlColorClass(totalPnl)} />
    </div>
  );
};
