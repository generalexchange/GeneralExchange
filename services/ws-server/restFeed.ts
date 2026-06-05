import type { BroadcastFn } from './polygonFeed';
import type { CandleUpdate, WsOutbound } from './types';

const POLYGON_BASE = 'https://api.polygon.io';
const POLL_MS = Number(process.env.REST_FEED_POLL_MS ?? 30_000);

export type RestFeedStats = {
  mode: 'rest';
  source: 'minute-aggs' | 'prev' | 'none';
  polls: number;
  ticksBroadcast: number;
  candlesBroadcast: number;
  lastEventAt: string | null;
  lastError: string | null;
  lastSymbol: string | null;
};

const stats: RestFeedStats = {
  mode: 'rest',
  source: 'minute-aggs',
  polls: 0,
  ticksBroadcast: 0,
  candlesBroadcast: 0,
  lastEventAt: null,
  lastError: null,
  lastSymbol: null,
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

function broadcastBar(
  broadcast: BroadcastFn,
  sym: string,
  bar: { t?: number; o?: number; h?: number; l?: number; c?: number; v?: number; vw?: number },
) {
  const close = bar.c ?? 0;
  if (close <= 0) return;
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

type AggBar = { t?: number; o?: number; h?: number; l?: number; c?: number; v?: number; vw?: number };

async function polygonGet<T>(path: string, apiKey: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${POLYGON_BASE}${path}`);
  url.searchParams.set('apiKey', apiKey);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(12_000) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${path} ${res.status}: ${text.slice(0, 160)}`);
  }
  return res.json() as Promise<T>;
}

/** One Polygon request per poll — rotates symbols to stay under rate limits. */
export function startRestFeed(symbols: string[], apiKey: string, broadcast: BroadcastFn): () => void {
  const lastMinTs = new Map<string, number>();
  let closed = false;
  let timer: ReturnType<typeof setInterval> | null = null;
  let symbolIdx = 0;
  let usePrevOnly = false;
  let cooldownUntil = 0;

  const pollMinuteAggs = async (sym: string) => {
    const day = todayUtc();
    const json = await polygonGet<{ results?: AggBar[] }>(
      `/v2/aggs/ticker/${sym}/range/1/minute/${day}/${day}`,
      apiKey,
      { adjusted: 'true', sort: 'desc', limit: '8' },
    );
    stats.source = 'minute-aggs';
    const bars = [...(json.results ?? [])].reverse();
    for (const bar of bars) {
      const ts = normalizeTs(bar.t);
      const prev = lastMinTs.get(sym) ?? 0;
      if (ts <= prev) continue;
      lastMinTs.set(sym, ts);
      broadcastBar(broadcast, sym, bar);
    }
    if (!bars.length) await pollPrev(sym);
  };

  const pollPrev = async (sym: string) => {
    const json = await polygonGet<{ results?: AggBar[] }>(`/v2/aggs/ticker/${sym}/prev`, apiKey, {});
    stats.source = 'prev';
    const bar = json.results?.[0];
    if (!bar?.c) return;
    const ts = normalizeTs(bar.t);
    const prev = lastMinTs.get(sym) ?? 0;
    if (ts !== prev) {
      lastMinTs.set(sym, ts);
      broadcastBar(broadcast, sym, bar);
    } else {
      broadcastTick(broadcast, sym, bar.c, bar.v ?? 0, Date.now());
    }
  };

  const poll = async () => {
    if (closed || !symbols.length) return;
    if (Date.now() < cooldownUntil) return;
    const sym = symbols[symbolIdx % symbols.length];
    symbolIdx += 1;
    stats.polls += 1;
    stats.lastSymbol = sym;
    try {
      if (usePrevOnly) {
        await pollPrev(sym);
      } else {
        await pollMinuteAggs(sym);
      }
      stats.lastError = null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'rest poll failed';
      stats.lastError = msg;
      if (msg.includes('429')) {
        cooldownUntil = Date.now() + 90_000;
        usePrevOnly = true;
        return;
      }
      if (msg.includes('403') || msg.includes('NOT_AUTHORIZED')) {
        usePrevOnly = true;
        try {
          await pollPrev(sym);
          stats.lastError = null;
        } catch (inner) {
          stats.lastError = inner instanceof Error ? inner.message : msg;
          stats.source = 'none';
        }
        return;
      }
      stats.source = 'none';
    }
  };

  console.log(`[ws-server] REST poll every ${POLL_MS}ms (one symbol per tick) — ${symbols.length} symbols`);
  void poll();
  timer = setInterval(() => void poll(), POLL_MS);

  return () => {
    closed = true;
    if (timer) clearInterval(timer);
  };
}
