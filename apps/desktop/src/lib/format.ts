// Number / display formatting. Pure functions, no React.

export function formatPrice(value: number | null | undefined, digits = 2): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatCurrency(value: number | null | undefined, digits = 2): string {
  if (value == null || !Number.isFinite(value)) return '—';
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

export function formatSignedCurrency(value: number | null | undefined, digits = 2): string {
  if (value == null || !Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

export function formatPercent(value: number | null | undefined, digits = 2, alreadyPct = false): string {
  if (value == null || !Number.isFinite(value)) return '—';
  const pct = alreadyPct ? value : value * 100;
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(digits)}%`;
}

export function formatNumber(value: number | null | undefined, digits = 0): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** Abbreviate large numbers: 1.2K, 3.4M, 5.6B. */
export function abbreviate(value: number | null | undefined, digits = 1): string {
  if (value == null || !Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(digits)}T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(digits)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(digits)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(digits)}K`;
  return `${sign}${abs.toFixed(0)}`;
}

/** Tailwind text color class for a P&L value. */
export function pnlColorClass(value: number | null | undefined): string {
  if (value == null || value === 0) return 'text-zinc-300';
  return value > 0 ? 'text-emerald-400' : 'text-red-400';
}

/** Raw hex for a P&L value, for canvas/ECharts contexts. */
export function pnlColorHex(value: number): string {
  if (value === 0) return '#d4d4d8';
  return value > 0 ? '#34d399' : '#f87171';
}

export function formatTime(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString('en-US', { hour12: false });
}

export function formatTimeShort(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
