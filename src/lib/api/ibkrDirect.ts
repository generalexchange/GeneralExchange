/**
 * Server-side IBKR REST client — proxies to the IBKR FastAPI service.
 */
import { envelope } from './envelope';

const IBKR_BASE = (process.env.IBKR_API_URL ?? 'http://localhost:8093').replace(/\/$/, '');
const IBKR_KEY = process.env.IBKR_API_KEY ?? process.env.GE_API_KEY ?? '';
const TIMEOUT_MS = 12_000;

function headers(): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/json' };
  if (IBKR_KEY) h['X-API-Key'] = IBKR_KEY;
  return h;
}

async function ibkrGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${IBKR_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), {
    cache: 'no-store',
    headers: headers(),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IBKR ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export function canUseIbkrDirect(): boolean {
  return Boolean(IBKR_BASE);
}

type QuotePayload = {
  symbol: string;
  price: number;
  prevClose: number;
  change: number;
  changePct: number;
  timestamp?: number;
};

/** GET quote/{symbol} */
export async function ibkrQuote(symbol: string) {
  const sym = symbol.toUpperCase();
  const q = await ibkrGet<{
    symbol: string;
    last: number | null;
    close: number | null;
    bid: number | null;
    ask: number | null;
    volume: number | null;
    timestamp?: string;
  }>('/market-data', { symbol: sym, sec_type: 'STK' });

  const price = q.last ?? q.close ?? q.bid ?? q.ask ?? 0;
  const prevClose = q.close ?? price;
  const change = price - prevClose;
  const changePct = prevClose ? (change / prevClose) * 100 : 0;

  return envelope(
    {
      symbol: sym,
      price,
      prevClose,
      change,
      changePct,
      timestamp: q.timestamp ? Date.parse(q.timestamp) : Date.now(),
    } satisfies QuotePayload,
    'ibkr',
  );
}

/** GET candles/{symbol}/{interval} */
export async function ibkrCandles(symbol: string, interval: string, limit: number) {
  const sym = symbol.toUpperCase();
  const barMap: Record<string, { bar_size: string; duration: string }> = {
    '1m': { bar_size: '1 min', duration: '1 D' },
    '5m': { bar_size: '5 mins', duration: '5 D' },
    '15m': { bar_size: '15 mins', duration: '10 D' },
    '1h': { bar_size: '1 hour', duration: '1 M' },
    '1d': { bar_size: '1 day', duration: '1 Y' },
  };
  const spec = barMap[interval] ?? barMap['1d'];
  const json = await ibkrGet<{
    bars: Array<{
      timestamp: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
      vwap?: number;
    }>;
  }>('/historical', {
    symbol: sym,
    bar_size: spec.bar_size,
    duration: spec.duration,
    persist: 'true',
    cached: 'true',
  });

  const bars = (json.bars ?? []).slice(-limit);
  const data = bars.map((b) => ({
    symbol: sym,
    interval,
    open_time: b.timestamp,
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
    volume: b.volume,
    vwap: b.vwap ?? b.close,
  }));

  return envelope(data, 'ibkr');
}

/** GET options/chain/{symbol} */
export async function ibkrOptionsChain(symbol: string) {
  const json = await ibkrGet<{
    symbol: string;
    underlying_price: number | null;
    contracts: Array<{
      symbol: string;
      expiry: string;
      strike: number;
      right: string;
      bid: number | null;
      ask: number | null;
      last: number | null;
      volume: number | null;
      open_interest: number | null;
      implied_volatility: number | null;
      delta: number | null;
      gamma: number | null;
      theta: number | null;
      vega: number | null;
    }>;
  }>('/options-chain', { symbol: symbol.toUpperCase() });

  const data = (json.contracts ?? []).map((c) => {
    const bid = c.bid ?? 0;
    const ask = c.ask ?? 0;
    return {
      symbol: json.symbol,
      expiration_date: c.expiry,
      strike: c.strike,
      option_type: c.right === 'P' ? 'PUT' : 'CALL',
      bid,
      ask,
      mid: bid || ask ? (bid + ask) / 2 : c.last ?? 0,
      last: c.last ?? 0,
      volume: c.volume ?? 0,
      open_interest: c.open_interest ?? 0,
      implied_volatility: (c.implied_volatility ?? 0) * (c.implied_volatility && c.implied_volatility < 3 ? 100 : 1),
      delta: c.delta ?? 0,
      gamma: c.gamma ?? 0,
      theta: c.theta ?? 0,
      vega: c.vega ?? 0,
      underlying_price: json.underlying_price ?? 0,
    };
  });

  return envelope(data, 'ibkr');
}

/** News not available from IBKR — return empty list. */
export async function ibkrNews(_symbol: string) {
  return envelope([], 'ibkr-unavailable');
}

/** Route a GET path to IBKR handlers. */
export async function tryIbkrDirect(path: string[], _searchParams: URLSearchParams) {
  if (!canUseIbkrDirect() || path.length < 2) return null;
  const limit = 200;

  try {
    if (path[0] === 'quote') return ibkrQuote(path[1]);
    if (path[0] === 'candles' && path.length >= 3) {
      return ibkrCandles(path[1], path[2], limit);
    }
    if (path[0] === 'options' && path[1] === 'chain') return ibkrOptionsChain(path[2]);
    if (path[0] === 'news') return ibkrNews(path[1]);
    if (path[0] === 'account') return envelope(await ibkrGet('/account'), 'ibkr');
    if (path[0] === 'positions') return envelope(await ibkrGet('/positions'), 'ibkr');
    if (path[0] === 'signals') return envelope(await ibkrGet('/signals'), 'ibkr');
  } catch (err) {
    console.error('[ibkrDirect]', path.join('/'), err);
    return null;
  }
  return null;
}
