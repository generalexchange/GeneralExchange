import type { Candle } from '@/components/dashboard/terminal/terminalData';

const ET = 'America/New_York';
const TRADING_DAYS = 252;

export type SpyRegression = {
  beta: number;
  alphaDaily: number;
  alphaAnnualizedPct: number;
  correlation: number;
  rSquared: number;
  sampleDays: number;
};

export type NormalizedSeries = {
  dates: string[];
  symbol: number[];
  spy: number[];
};

function etDateKey(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ET, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

function closesByDay(candles: Candle[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const c of candles) {
    if (c.c > 0) map.set(etDateKey(new Date(c.t)), c.c);
  }
  return map;
}

/** Align symbol and SPY daily closes, then compute simple returns. */
export function alignedDailyReturns(
  symbolCandles: Candle[],
  spyCandles: Candle[],
): { symbol: number[]; spy: number[]; dates: string[] } {
  const symMap = closesByDay(symbolCandles);
  const spyMap = closesByDay(spyCandles);
  const shared = [...symMap.keys()].filter((d) => spyMap.has(d)).sort();
  const symbol: number[] = [];
  const spy: number[] = [];
  const dates: string[] = [];

  for (let i = 1; i < shared.length; i++) {
    const prev = shared[i - 1];
    const cur = shared[i];
    const pSym = symMap.get(prev)!;
    const cSym = symMap.get(cur)!;
    const pSpy = spyMap.get(prev)!;
    const cSpy = spyMap.get(cur)!;
    if (pSym <= 0 || cSym <= 0 || pSpy <= 0 || cSpy <= 0) continue;
    dates.push(cur);
    symbol.push((cSym - pSym) / pSym);
    spy.push((cSpy - pSpy) / pSpy);
  }

  return { symbol, spy, dates };
}

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function covariance(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const ma = mean(a.slice(0, n));
  const mb = mean(b.slice(0, n));
  let sum = 0;
  for (let i = 0; i < n; i++) sum += (a[i] - ma) * (b[i] - mb);
  return sum / (n - 1);
}

function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1);
}

function stdDev(values: number[]): number {
  return Math.sqrt(variance(values));
}

/** OLS regression vs SPY daily returns: R_s = alpha + beta * R_spy. */
export function regressionVsSpy(symbolCandles: Candle[], spyCandles: Candle[]): SpyRegression | null {
  const { symbol, spy } = alignedDailyReturns(symbolCandles, spyCandles);
  const n = Math.min(symbol.length, spy.length);
  if (n < 10) return null;

  const symR = symbol.slice(-n);
  const spyR = spy.slice(-n);
  const varSpy = variance(spyR);
  if (varSpy <= 0) return null;

  const beta = covariance(symR, spyR) / varSpy;
  const alphaDaily = mean(symR) - beta * mean(spyR);
  const stdSym = stdDev(symR);
  const stdSpy = stdDev(spyR);
  const correlation =
    stdSym > 0 && stdSpy > 0 ? covariance(symR, spyR) / (stdSym * stdSpy) : 0;

  return {
    beta,
    alphaDaily,
    alphaAnnualizedPct: alphaDaily * TRADING_DAYS * 100,
    correlation,
    rSquared: correlation * correlation,
    sampleDays: n,
  };
}

/** Cumulative indexed performance (base 100) for symbol vs SPY. */
export function normalizedVsSpy(symbolCandles: Candle[], spyCandles: Candle[]): NormalizedSeries | null {
  const { symbol, spy, dates } = alignedDailyReturns(symbolCandles, spyCandles);
  if (dates.length < 5) return null;

  let symLevel = 100;
  let spyLevel = 100;
  const symOut: number[] = [100];
  const spyOut: number[] = [100];
  const dateOut: string[] = [dates[0]];

  for (let i = 0; i < symbol.length; i++) {
    symLevel *= 1 + symbol[i];
    spyLevel *= 1 + spy[i];
    symOut.push(symLevel);
    spyOut.push(spyLevel);
    dateOut.push(dates[i]);
  }

  return { dates: dateOut, symbol: symOut, spy: spyOut };
}

/** @deprecated use regressionVsSpy */
export function betaFromCandles(symbolCandles: Candle[], spyCandles: Candle[]): number | null {
  return regressionVsSpy(symbolCandles, spyCandles)?.beta ?? null;
}
