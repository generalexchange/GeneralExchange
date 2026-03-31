/**
 * Deterministic mock options chain rows (premiums intentionally omitted in UI).
 */

export interface OptionChainRow {
  strike: number;
  callVolume: number;
  callOpenInterest: number;
  putVolume: number;
  putOpenInterest: number;
  callDelta: number;
  putDelta: number;
}

export const OPTION_EXPIRATIONS: { id: string; label: string }[] = [
  { id: '2026-04-03', label: 'Apr 03, 2026 · Weekly' },
  { id: '2026-04-10', label: 'Apr 10, 2026 · Weekly' },
  { id: '2026-04-18', label: 'Apr 18, 2026 · Monthly' },
  { id: '2026-05-15', label: 'May 15, 2026 · Monthly' },
  { id: '2026-06-19', label: 'Jun 19, 2026 · Monthly' },
];

function hashCombine(parts: string): number {
  let h = 0;
  for (let i = 0; i < parts.length; i++) h = (h * 31 + parts.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function buildOptionChainRows(symbol: string, spot: number, expirationId: string): OptionChainRow[] {
  const step = spot > 400 ? 10 : spot > 120 ? 5 : spot > 40 ? 2.5 : 1;
  const center = Math.round(spot / step) * step;
  const rows: OptionChainRow[] = [];
  for (let i = -7; i <= 7; i++) {
    const strike = Math.round((center + i * step) * 1000) / 1000;
    if (strike <= 0) continue;
    const n = hashCombine(`${symbol}|${expirationId}|${strike}|c`);
    const m = hashCombine(`${symbol}|${expirationId}|${strike}|p`);
    const skew = (spot - strike) / Math.max(spot, 1) * 1.2;
    const callDelta = Math.max(0.03, Math.min(0.97, 0.5 + skew * 0.35 + ((n % 13) - 6) * 0.008));
    rows.push({
      strike,
      callVolume: 120 + (n % 920),
      callOpenInterest: 800 + (m % 14000),
      putVolume: 100 + (n % 880),
      putOpenInterest: 700 + (m % 12000),
      callDelta: Math.round(callDelta * 1000) / 1000,
      putDelta: Math.round((callDelta - 1) * 1000) / 1000,
    });
  }
  return rows;
}
