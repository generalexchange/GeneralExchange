import type { BroadcastFn } from './polygonFeed';
import type { CandleUpdate, WsOutbound } from './types';

const POLYGON_BASE = 'https://api.polygon.io';
const POLL_MS = Number(process.env.REST_FEED_POLL_MS ?? 5000);
const AGG_LIMIT = 120;

export type RestFeedStats = {
  mode: 'rest';
  source: 'trades' | 'aggs' | 'none';
  polls: number;
  ticksBroadcast: number;
  candlesBroadcast: number;
  lastEventAt: string | null;
  lastError: string | null;
};

const stats: RestFeedStats = {
  mode: 'rest',
  source: 'trades',
  polls: 0,
  ticksBroadcast: 0,
  candlesBroadcast: 0,
  lastEventAt: null,
  lastError: null,
};

export function getRestFeedStats(): RestFeedStats {
  return { ...stats };
}

function normalizeTs(t: unknown): number {
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) return Date.now();
  if (n > 1e15) return Math.floor(n / 1e6);
  if (n < 1e12) return Math.floor(n * 1000);
  return Math.floor(n);
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function broadcastTick(broadcast: BroadcastFn, sym: string, price: number, volume: number, ts: number) {
  if (!price || price <= 0) return;
  stats.ticksBroadcast += 1;
  stats.lastEventAt = new Date().toISOString();
  broadcast({
    type: 'market',
    data: { symbol: sym, price, volume, timestamp: ts, source: 'polygon' },
  });
}

function broadcastCandle(broadcast: BroadcastFn, sym: string, bar: AggBar) {
  const close = bar.c ?? 0;
  const ts = normalizeTs(bar.t);
  const candle: CandleUpdate = {
    symbol: sym,
    interval: '1m',
    open_time: ts,
    open: bar.o ?? close,
    high: bar.h ?? close,
    low: bar.l ?? close,
    close,
    volume: bar.v ?? 0,
    vwap: bar.vw ?? close,
  };
  stats.candlesBroadcast += 1;
  stats.lastEventAt = new Date().toISOString();
  broadcast({ type: 'candle', data: candle, replaceLast: true });
  broadcastTick(broadcast, sym, close, bar.v ?? 0, ts);
}

type TradeRow = {
  sip_timestamp?: number;
  participant_timestamp?: number;
  price: number;
  size: number;
};

type AggBar = {
  t?: number;
  o?: number;
  h?: number;
  l?: number;
  c?: number;
  v?: number;
  vw?: number;
};

async function polygonGet<T>(path: string, apiKey: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${POLYGON_BASE}${path}`);
  url.searchParams.set('apiKey', apiKey);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${path} ${res.status}: ${text.slice(0, 160)}`);
  }
  return res.json() as Promise<T>;
}

/** Poll Polygon REST when WebSocket is not on the API plan. */
export function startRestFeed(symbols: string[], apiKey: string, broadcast: BroadcastFn): () => void {
  const seenTrades = new Set<string>();
  const seenBars = new Map<string, number>();
  let closed = false;
  let timer: ReturnType<typeof setInterval> | null = null;
  let useAggs = false;
  let seeded = false;

  const pollTrades = async (sym: string) => {
    const json = await polygonGet<{ results?: TradeRow[] }>(
      `/v3/trades/${sym}`,
      apiKey,
      { limit: '30', order: 'desc' },
    );
    for (const t of [...(json.results ?? [])].reverse()) {
      if (!t.price || t.price <= 0) continue;
      const ts = normalizeTs(t.sip_timestamp ?? t.participant_timestamp);
      const key = `${sym}-${ts}-${t.price}-${t.size}`;
      if (seenTrades.has(key)) continue;
      seenTrades.add(key);
      broadcastTick(broadcast, sym, t.price, t.size, ts);
    }
    if (seenTrades.size > 20_000) {
      for (const k of [...seenTrades].slice(0, 10_000)) seenTrades.delete(k);
    }
  };

  const pollAggs = async (sym: string) => {
    const day = todayUtc();
    const json = await polygonGet<{ results?: AggBar[] }>(
      `/v2/aggs/ticker/${sym}/range/1/minute/${day}/${day}`,
      apiKey,
      { adjusted: 'true', sort: 'asc', limit: String(AGG_LIMIT) },
    );
    const bars = json.results ?? [];
    if (!bars.length) {
      const prev = await polygonGet<{ results?: AggBar[] }>(`/v2/aggs/ticker/${sym}/prev`, apiKey, {});
      const bar = prev.results?.[0];
      if (bar?.c) broadcastTick(broadcast, sym, bar.c, bar.v ?? 0, normalizeTs(bar.t));
      return;
    }

    const startIdx = seeded ? 0 : Math.max(0, bars.length - 25);
    for (let i = startIdx; i < bars.length; i += 1) {
      const bar = bars[i];
      const ts = normalizeTs(bar.t);
      const last = seenBars.get(sym) ?? 0;
      if (ts <= last) continue;
      seenBars.set(sym, ts);
      broadcastCandle(broadcast, sym, bar);
      // Waterfall feel: emit OHLC as separate prints on first seed only.
      if (!seeded && bar.o && bar.h && bar.l && bar.c) {
        const stagger = 200;
        broadcastTick(broadcast, sym, bar.o, (bar.v ?? 0) * 0.25, ts);
        broadcastTick(broadcast, sym, bar.h, (bar.v ?? 0) * 0.25, ts + stagger);
        broadcastTick(broadcast, sym, bar.l, (bar.v ?? 0) * 0.25, ts + stagger * 2);
      }
    }
  };

  const pollSymbol = async (sym: string) => {
    if (useAggs) {
      await pollAggs(sym);
      return;
    }
    try {
      await pollTrades(sym);
      stats.source = 'trades';
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'trades failed';
      if (msg.includes('403') || msg.includes('NOT_AUTHORIZED') || msg.includes('not entitled')) {
        useAggs = true;
        stats.source = 'aggs';
        console.warn(`[ws-server] trade tape blocked for ${sym}, using minute aggregates`);
        await pollAggs(sym);
      } else {
        throw err;
      }
    }
  };

  const poll = async () => {
    if (closed) return;
    stats.polls += 1;
    try {
      for (const sym of symbols) await pollSymbol(sym);
      stats.lastError = null;
      seeded = true;
    } catch (err) {
      stats.lastError = err instanceof Error ? err.message : 'rest poll failed';
      stats.source = 'none';
    }
  };

  console.log(`[ws-server] REST poll every ${POLL_MS}ms for ${symbols.join(',')}`);
  void poll();
  timer = setInterval(() => void poll(), POLL_MS);

  return () => {
    closed = true;
    if (timer) clearInterval(timer);
  };
}
