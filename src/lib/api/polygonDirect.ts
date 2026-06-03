/**
 * Server-side Polygon/Massive REST fallback when the Go data API is unreachable
 * (e.g. Vercel production without a hosted backend). Returns the same envelope
 * shape as the Go API.
 */
import { envelope } from './envelope';

const POLYGON_BASE = 'https://api.polygon.io';

function apiKey(): string | null {
  const key = process.env.POLYGON_API_KEY?.trim();
  return key || null;
}

async function polygonGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const key = apiKey();
  if (!key) throw new Error('POLYGON_API_KEY not configured');

  const url = new URL(`${POLYGON_BASE}${path}`);
  url.searchParams.set('apiKey', key);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Polygon ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

const INTERVALS: Record<string, { mult: number; span: string }> = {
  '1m': { mult: 1, span: 'minute' },
  '5m': { mult: 5, span: 'minute' },
  '15m': { mult: 15, span: 'minute' },
  '1h': { mult: 1, span: 'hour' },
  '1d': { mult: 1, span: 'day' },
};

export function canUsePolygonDirect(): boolean {
  return Boolean(apiKey());
}

/** GET ticks/{symbol} */
export async function polygonTicks(symbol: string, limit: number) {
  type Trade = {
    sip_timestamp?: number;
    participant_timestamp?: number;
    price: number;
    size: number;
    exchange?: number;
    conditions?: number[];
    tape?: number;
  };
  const json = await polygonGet<{ results?: Trade[] }>(`/v3/trades/${symbol.toUpperCase()}`, {
    limit: String(Math.min(limit, 500)),
    order: 'desc',
  });

  const data = (json.results ?? []).map((t) => ({
    symbol: symbol.toUpperCase(),
    timestamp: new Date(
      (t.sip_timestamp ?? t.participant_timestamp ?? Date.now() * 1_000_000) / 1_000_000,
    ).toISOString(),
    price: t.price,
    size: t.size,
    exchange: String(t.exchange ?? 'XNAS'),
    conditions: (t.conditions ?? []).map(String),
    tape: String(t.tape ?? 'C'),
  }));

  return envelope(data, 'polygon');
}

/** GET candles/{symbol}/{interval} */
export async function polygonCandles(symbol: string, interval: string, limit: number) {
  const spec = INTERVALS[interval] ?? INTERVALS['5m'];
  const to = new Date();
  const from = new Date(to.getTime() - limit * spec.mult * 60_000 * (spec.span === 'hour' ? 60 : spec.span === 'day' ? 1440 : 1));

  type Bar = { t: number; o: number; h: number; l: number; c: number; v: number; vw?: number; n?: number };
  const json = await polygonGet<{ results?: Bar[] }>(
    `/v2/aggs/ticker/${symbol.toUpperCase()}/range/${spec.mult}/${spec.span}/${from.toISOString().slice(0, 10)}/${to.toISOString().slice(0, 10)}`,
    { limit: String(Math.min(limit, 500)), sort: 'asc' },
  );

  const data = (json.results ?? []).map((b) => ({
    symbol: symbol.toUpperCase(),
    interval,
    open_time: new Date(b.t).toISOString(),
    open: b.o,
    high: b.h,
    low: b.l,
    close: b.c,
    volume: b.v,
    vwap: b.vw ?? (b.o + b.c) / 2,
    transactions: b.n ?? 0,
  }));

  return envelope(data, 'polygon');
}

/** GET options/chain/{symbol} */
export async function polygonOptionsChain(symbol: string) {
  type Result = {
    details?: { expiration_date?: string; strike_price?: number; contract_type?: string };
    greeks?: Record<string, number>;
    day?: { close?: number; volume?: number };
    last_quote?: { bid?: number; ask?: number };
    underlying_asset?: { price?: number };
    implied_volatility?: number;
    open_interest?: number;
  };
  const json = await polygonGet<{ results?: Result[] }>(
    `/v3/snapshot/options/${symbol.toUpperCase()}`,
    { limit: '250' },
  );

  const snapshotTime = new Date().toISOString();
  let spot = 0;
  const ivs: number[] = [];

  const data = (json.results ?? []).map((r) => {
    const det = r.details ?? {};
    const greeks = r.greeks ?? {};
    const quote = r.last_quote ?? {};
    const day = r.day ?? {};
    spot = r.underlying_asset?.price ?? spot;
    const iv = (r.implied_volatility ?? 0) * 100;
    if (iv) ivs.push(iv);
    const bid = quote.bid ?? 0;
    const ask = quote.ask ?? 0;
    return {
      symbol: symbol.toUpperCase(),
      snapshot_time: snapshotTime,
      expiration_date: det.expiration_date ?? '',
      strike: det.strike_price ?? 0,
      option_type: det.contract_type === 'call' ? 'CALL' : 'PUT',
      bid,
      ask,
      mid: bid || ask ? Math.round(((bid + ask) / 2) * 100) / 100 : 0,
      last: day.close ?? 0,
      volume: day.volume ?? 0,
      open_interest: r.open_interest ?? 0,
      implied_volatility: Math.round(iv * 100) / 100,
      delta: greeks.delta ?? 0,
      gamma: greeks.gamma ?? 0,
      theta: greeks.theta ?? 0,
      vega: greeks.vega ?? 0,
      rho: 0,
      charm: 0,
      vanna: 0,
      volga: 0,
      speed: 0,
      zomma: 0,
      color: 0,
      underlying_price: spot,
      underlying_iv: 0,
      iv_rank: 0,
      iv_percentile: 0,
    };
  });

  const atmIv = ivs.length ? ivs.reduce((a, b) => a + b, 0) / ivs.length : 0;
  for (const row of data) {
    row.underlying_iv = Math.round(atmIv * 100) / 100;
  }

  return envelope(data, 'polygon');
}

/** GET news/{symbol} */
export async function polygonNews(symbol: string) {
  type Article = {
    id?: string;
    title?: string;
    author?: string;
    published_utc?: string;
    article_url?: string;
    tickers?: string[];
    description?: string;
  };
  const json = await polygonGet<{ results?: Article[] }>('/v2/reference/news', {
    ticker: symbol.toUpperCase(),
    limit: '20',
    order: 'desc',
  });

  const data = (json.results ?? []).map((a) => ({
    id: a.id ?? '',
    title: a.title ?? '',
    author: a.author ?? '',
    published_at: a.published_utc ?? new Date().toISOString(),
    url: a.article_url ?? '',
    symbols: a.tickers ?? [symbol.toUpperCase()],
    summary: a.description ?? '',
    sentiment: 0,
  }));

  return envelope(data, 'polygon');
}

/** Route a GET path to a Polygon handler when supported. */
export async function tryPolygonDirect(path: string[], searchParams: URLSearchParams) {
  if (!canUsePolygonDirect() || path.length < 2) return null;

  const limit = Math.min(Number(searchParams.get('limit') ?? '200') || 200, 500);

  try {
    if (path[0] === 'ticks' && path.length === 2) {
      return polygonTicks(path[1], limit);
    }
    if (path[0] === 'candles' && path.length === 3) {
      return polygonCandles(path[1], path[2], limit);
    }
    if (path[0] === 'options' && path[1] === 'chain' && path.length === 3) {
      return polygonOptionsChain(path[2]);
    }
    if (path[0] === 'news' && path.length === 2) {
      return polygonNews(path[1]);
    }
  } catch (err) {
    console.error('[polygonDirect]', path.join('/'), err);
  }
  return null;
}
