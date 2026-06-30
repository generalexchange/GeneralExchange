/**
 * BSM synthetic market data for public web (matches options_chain Python synth).
 * Used when IBKR is disabled and no gateway/Redis pipeline is reachable.
 */
import { blackScholes } from '@gx/analytics';
import { envelope } from '@/lib/api/envelope';

const BASE_PRICES: Record<string, number> = {
  SPY: 512.4,
  QQQ: 438.9,
  NVDA: 121.3,
  AAPL: 224.8,
  TSLA: 248.5,
  AMD: 158.2,
};

const BASE_VOL: Record<string, number> = {
  SPY: 0.14,
  QQQ: 0.18,
  NVDA: 0.46,
  AAPL: 0.22,
  TSLA: 0.52,
  AMD: 0.44,
};

const RISK_FREE = 0.045;

function spot(symbol: string): number {
  return BASE_PRICES[symbol.toUpperCase()] ?? 100;
}

function vol(symbol: string): number {
  return BASE_VOL[symbol.toUpperCase()] ?? 0.3;
}

function expiryIso(days = 18): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function synthQuote(symbol: string) {
  const sym = symbol.toUpperCase();
  const price = spot(sym);
  const prevClose = price * 0.998;
  return envelope(
    {
      symbol: sym,
      price,
      prevClose,
      sessionOpen: prevClose,
      change: price - prevClose,
      changePct: ((price - prevClose) / prevClose) * 100,
      timestamp: Date.now(),
    },
    'pipeline-synth',
  );
}

export function synthCandles(symbol: string, interval: string, limit: number) {
  const sym = symbol.toUpperCase();
  const s = spot(sym);
  const v = vol(sym);
  const n = Math.min(limit || 120, 500);
  const ms =
    interval === '1m'
      ? 60_000
      : interval === '5m'
        ? 300_000
        : interval === '15m'
          ? 900_000
          : interval === '1h'
            ? 3_600_000
            : 86_400_000;
  const now = Date.now();
  const bars = [];
  let px = s;
  for (let i = n - 1; i >= 0; i--) {
    const t = now - i * ms;
    const shock = (Math.sin(i * 0.17) + Math.cos(i * 0.09)) * v * px * 0.02;
    const o = px;
    px = Math.max(1, px + shock);
    const h = Math.max(o, px) * 1.001;
    const l = Math.min(o, px) * 0.999;
    bars.push({
      symbol: sym,
      interval,
      open_time: new Date(t).toISOString(),
      open: o,
      high: h,
      low: l,
      close: px,
      volume: Math.floor(1000 + Math.abs(shock) * 50),
      vwap: (o + px) / 2,
    });
  }
  return envelope(bars, 'pipeline-synth');
}

export function synthOptionsChain(symbol: string) {
  const sym = symbol.toUpperCase();
  const s = spot(sym);
  const baseVol = vol(sym);
  const step = s > 200 ? 5 : 2.5;
  const atm = Math.round(s / step) * step;
  const expiry = expiryIso();
  const tYears = 18 / 365;
  const contracts = [];

  for (let i = -6; i <= 6; i++) {
    const strike = atm + i * step;
    const m = strike / s;
    for (const optType of ['CALL', 'PUT'] as const) {
      const iv = Math.max(
        0.05,
        baseVol * (1 + Math.abs(m - 1) * 1.6 + (optType === 'PUT' ? (1 - m) * 0.4 : 0)),
      );
      const g = blackScholes({
        stockPrice: s,
        strike,
        timeToExpiration: tYears,
        riskFreeRate: RISK_FREE,
        volatility: iv,
        optionType: optType.toLowerCase() as 'call' | 'put',
      });
      const mid = Math.max(0.02, g.theoreticalPrice);
      const spread = Math.max(0.02, mid * 0.02);
      contracts.push({
        symbol: sym,
        expiration_date: expiry,
        strike,
        option_type: optType,
        bid: Math.round((mid - spread / 2) * 100) / 100,
        ask: Math.round((mid + spread / 2) * 100) / 100,
        mid: Math.round(mid * 100) / 100,
        last: Math.round(mid * 100) / 100,
        volume: 0,
        open_interest: 0,
        implied_volatility: Math.round(iv * 10000) / 100,
        delta: g.delta,
        gamma: g.gamma,
        theta: g.theta,
        vega: g.vega,
        underlying_price: Math.round(s * 100) / 100,
        underlying_iv: Math.round(baseVol * 10000) / 100,
        iv_rank: 50,
        iv_percentile: 50,
      });
    }
  }
  return envelope(contracts, 'pipeline-synth');
}

export function synthNews(_symbol: string) {
  return envelope([], 'pipeline-synth');
}

export async function tryWebSynth(path: string[], searchParams: URLSearchParams) {
  if (path.length < 2) return null;
  const limit = Number(searchParams.get('limit') ?? 0);

  try {
    if (path[0] === 'quote') return synthQuote(path[1]);
    if (path[0] === 'candles' && path.length >= 3) {
      return synthCandles(path[1], path[2], limit);
    }
    if (path[0] === 'options' && path[1] === 'chain') return synthOptionsChain(path[2]);
    if (path[0] === 'news') return synthNews(path[1]);
  } catch (err) {
    console.error('[webSynth]', path.join('/'), err);
    return null;
  }
  return null;
}
