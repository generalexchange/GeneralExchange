import type { Candle } from '@/components/dashboard/terminal/terminalData';

function dailyReturns(candles: Candle[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1].c;
    const cur = candles[i].c;
    if (prev > 0 && cur > 0) out.push((cur - prev) / prev);
  }
  return out;
}

function covariance(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const meanA = a.slice(0, n).reduce((s, v) => s + v, 0) / n;
  const meanB = b.slice(0, n).reduce((s, v) => s + v, 0) / n;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += (a[i] - meanA) * (b[i] - meanB);
  return sum / (n - 1);
}

function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1);
}

/** Beta vs SPY from aligned daily return series. */
export function betaFromCandles(symbolCandles: Candle[], spyCandles: Candle[]): number | null {
  if (symbolCandles.length < 5 || spyCandles.length < 5) return null;
  const symR = dailyReturns(symbolCandles);
  const spyR = dailyReturns(spyCandles);
  const n = Math.min(symR.length, spyR.length);
  if (n < 4) return null;
  const a = symR.slice(-n);
  const b = spyR.slice(-n);
  const varSpy = variance(b);
  if (varSpy <= 0) return null;
  return covariance(a, b) / varSpy;
}
