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

const INTERVALS: Record<string, { mult: number; span: string; lookbackDays: number }> = {
  '1m': { mult: 1, span: 'minute', lookbackDays: 2 },
  '5m': { mult: 5, span: 'minute', lookbackDays: 5 },
  '15m': { mult: 15, span: 'minute', lookbackDays: 10 },
  '1h': { mult: 1, span: 'hour', lookbackDays: 14 },
  '1d': { mult: 1, span: 'day', lookbackDays: 400 },
};

export function canUsePolygonDirect(): boolean {
  return Boolean(apiKey());
}

type TickRow = {
  symbol: string;
  timestamp: string;
  price: number;
  size: number;
  exchange: string;
  conditions: string[];
  tape: string;
};

function nsToIso(ns?: number): string {
  if (!ns) return new Date().toISOString();
  return new Date(ns / 1_000_000).toISOString();
}

/** GET ticks/{symbol} — falls back to prev-day bar when trade tape is not on plan. */
export async function polygonTicks(symbol: string, limit: number) {
  const sym = symbol.toUpperCase();
  const cap = Math.min(limit, 500);

  type Trade = {
    sip_timestamp?: number;
    participant_timestamp?: number;
    price: number;
    size: number;
    exchange?: number;
    conditions?: number[];
    tape?: number;
  };

  try {
    const json = await polygonGet<{ results?: Trade[] }>(`/v3/trades/${sym}`, {
      limit: String(cap),
      order: 'desc',
    });
    const data: TickRow[] = (json.results ?? []).map((t) => ({
      symbol: sym,
      timestamp: nsToIso(t.sip_timestamp ?? t.participant_timestamp),
      price: t.price,
      size: t.size,
      exchange: String(t.exchange ?? 'XNAS'),
      conditions: (t.conditions ?? []).map(String),
      tape: String(t.tape ?? 'C'),
    }));
    if (data.length) return envelope(data, 'polygon');
  } catch {
    // Starter plans often omit the trade tape — synthesize from delayed bars.
  }

  type PrevBar = { T?: string; c?: number; v?: number; t?: number };
  const prev = await polygonGet<{ results?: PrevBar[] }>(`/v2/aggs/ticker/${sym}/prev`, {});
  const bar = prev.results?.[0];
  if (!bar?.c) throw new Error('no tick or aggregate data available for symbol');

  const data: TickRow[] = [{
    symbol: sym,
    timestamp: bar.t ? new Date(bar.t).toISOString() : new Date().toISOString(),
    price: bar.c,
    size: Math.max(1, Math.round((bar.v ?? 100) / 1000)),
    exchange: 'XNAS',
    conditions: ['@'],
    tape: 'C',
  }];

  return envelope(data, 'polygon-delayed');
}

function normalizePolygonMs(t?: number): number {
  if (!t) return Date.now();
  if (t > 1e15) return Math.floor(t / 1_000_000);
  if (t < 1e12) return t * 1000;
  return t;
}

/** Map aggregate bars to API candle rows. */
function mapAggBars(
  bars: { t: number; o: number; h: number; l: number; c: number; v: number; vw?: number; n?: number }[],
  sym: string,
  interval: string,
  source: string,
) {
  const data = bars.map((b) => ({
    symbol: sym,
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
  return envelope(data, source);
}

/** GET candles/{symbol}/{interval} — never throws; falls back through daily → prev bar. */
export async function polygonCandles(symbol: string, interval: string, limit: number) {
  const sym = symbol.toUpperCase();
  const cap = Math.min(limit, 500);
  let spec = INTERVALS[interval] ?? INTERVALS['1d'];
  let effectiveInterval = interval;

  type Bar = { t: number; o: number; h: number; l: number; c: number; v: number; vw?: number; n?: number };

  const fetchRange = async (from: string, to: string, s: typeof spec) => {
    return polygonGet<{ results?: Bar[] }>(
      `/v2/aggs/ticker/${sym}/range/${s.mult}/${s.span}/${from}/${to}`,
      { limit: String(cap), sort: 'asc' },
    );
  };

  const toDate = new Date();
  const todayStr = toDate.toISOString().slice(0, 10);
  const fromDate = new Date(toDate.getTime() - spec.lookbackDays * 86_400_000);
  const fromStr = fromDate.toISOString().slice(0, 10);

  try {
    let json = await fetchRange(fromStr, todayStr, spec);

    if (!(json.results?.length) && spec.span !== 'day') {
      spec = INTERVALS['1d'];
      effectiveInterval = '1d';
      json = await fetchRange(fromStr, todayStr, spec);
    }

    const bars = json.results ?? [];
    if (bars.length) {
      const slice = bars.length > cap ? bars.slice(-cap) : bars;
      return mapAggBars(
        slice,
        sym,
        effectiveInterval,
        effectiveInterval === interval ? 'polygon' : 'polygon-delayed',
      );
    }
  } catch {
    /* rate limit or plan restriction — try prev bar */
  }

  try {
    const prev = await polygonGet<{ results?: Bar[] }>(`/v2/aggs/ticker/${sym}/prev`);
    const bar = prev.results?.[0];
    if (bar) {
      return mapAggBars([bar], sym, '1d', 'polygon-delayed');
    }
  } catch {
    /* last resort below */
  }

  return envelope([], 'polygon-unavailable');
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

/** Daily bars for quote when snapshot is unavailable on plan. */
async function polygonQuoteFromDailyBars(sym: string) {
  type Bar = { t: number; o: number; c: number };
  const to = new Date();
  const from = new Date(to.getTime() - 14 * 86_400_000);
  const json = await polygonGet<{ results?: Bar[] }>(
    `/v2/aggs/ticker/${sym}/range/1/day/${from.toISOString().slice(0, 10)}/${to.toISOString().slice(0, 10)}`,
    { sort: 'desc', limit: '5' },
  );
  const bars = json.results ?? [];
  if (!bars.length) throw new Error('no daily bars');

  const latest = bars[0];
  const prior = bars[1];
  const price = latest.c;
  const prevClose = prior?.c ?? latest.o;
  const dayClose = latest.c;
  const change = price - prevClose;
  const changePct = prevClose ? (change / prevClose) * 100 : 0;
  const afterHoursChange = price - dayClose;
  const afterHoursChangePct = dayClose ? (afterHoursChange / dayClose) * 100 : 0;

  return envelope(
    {
      symbol: sym,
      price,
      prevClose,
      change,
      changePct,
      afterHoursChange,
      afterHoursChangePct,
      timestamp: latest.t ? normalizePolygonMs(latest.t) : Date.now(),
    },
    'polygon-delayed',
  );
}

/** GET quote/{symbol} — live snapshot with prev close and day change. */
export async function polygonQuote(symbol: string) {
  const sym = symbol.toUpperCase();
  type Snap = {
    ticker?: {
      day?: { c?: number; o?: number };
      prevDay?: { c?: number };
      lastTrade?: { p?: number; t?: number };
      min?: { c?: number; av?: number };
      updated?: number;
    };
  };

  try {
    const json = await polygonGet<Snap>(`/v2/snapshot/locale/us/markets/stocks/tickers/${sym}`);
    const t = json.ticker;
    const prevClose = t?.prevDay?.c ?? 0;
    const price = t?.lastTrade?.p ?? t?.min?.c ?? t?.day?.c ?? prevClose;
    const change = price - prevClose;
    const changePct = prevClose ? (change / prevClose) * 100 : 0;
    const dayClose = t?.day?.c ?? price;
    const afterHoursChange = price - dayClose;
    const afterHoursChangePct = dayClose ? (afterHoursChange / dayClose) * 100 : 0;

    return envelope(
      {
        symbol: sym,
        price,
        prevClose,
        change,
        changePct,
        afterHoursChange,
        afterHoursChangePct,
        timestamp: normalizePolygonMs(t?.lastTrade?.t ?? t?.updated),
      },
      'polygon',
    );
  } catch {
    return polygonQuoteFromDailyBars(sym);
  }
}

/** Route a GET path to a Polygon handler when supported. */
export async function tryPolygonDirect(path: string[], searchParams: URLSearchParams) {
  if (!canUsePolygonDirect() || path.length < 2) return null;

  const limit = Math.min(Number(searchParams.get('limit') ?? '200') || 200, 500);

  try {
    if (path[0] === 'quote' && path.length === 2) {
      return polygonQuote(path[1]);
    }
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
