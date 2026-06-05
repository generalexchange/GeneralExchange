import type { BroadcastFn } from './polygonFeed';
import type { CandleUpdate, WsOutbound } from './types';

const POLYGON_BASE = 'https://api.polygon.io';
const POLL_MS = Number(process.env.REST_FEED_POLL_MS ?? 20_000);

export type RestFeedStats = {
  mode: 'rest';
  source: 'trades' | 'snapshot' | 'none';
  polls: number;
  ticksBroadcast: number;
  candlesBroadcast: number;
  lastEventAt: string | null;
  lastError: string | null;
};

const stats: RestFeedStats = {
  mode: 'rest',
  source: 'snapshot',
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

function broadcastTick(broadcast: BroadcastFn, sym: string, price: number, volume: number, ts: number) {
  if (!price || price <= 0) return;
  stats.ticksBroadcast += 1;
  stats.lastEventAt = new Date().toISOString();
  broadcast({
    type: 'market',
    data: { symbol: sym, price, volume, timestamp: ts, source: 'polygon' },
  });
}

function broadcastBar(broadcast: BroadcastFn, sym: string, bar: { t?: number; o?: number; h?: number; l?: number; c?: number; v?: number; vw?: number }) {
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

type SnapshotTicker = {
  ticker?: string;
  min?: { t?: number; o?: number; h?: number; l?: number; c?: number; v?: number; vw?: number };
  day?: { c?: number; v?: number; t?: number };
  prevDay?: { c?: number; v?: number; t?: number };
  lastTrade?: { p?: number; s?: number; t?: number };
};

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

/** Poll Polygon REST when WebSocket is not on the API plan (one snapshot request per cycle). */
export function startRestFeed(symbols: string[], apiKey: string, broadcast: BroadcastFn): () => void {
  const lastMinTs = new Map<string, number>();
  const seenTrades = new Set<string>();
  let closed = false;
  let timer: ReturnType<typeof setInterval> | null = null;

  const pollSnapshot = async () => {
    const tickers = symbols.join(',');
    const json = await polygonGet<{ tickers?: SnapshotTicker[] }>(
      '/v2/snapshot/locale/us/markets/stocks/tickers',
      apiKey,
      { tickers },
    );
    stats.source = 'snapshot';
    for (const row of json.tickers ?? []) {
      const sym = row.ticker?.toUpperCase();
      if (!sym) continue;

      if (row.lastTrade?.p) {
        const ts = normalizeTs(row.lastTrade.t);
        const key = `${sym}-${ts}-${row.lastTrade.p}-${row.lastTrade.s ?? 0}`;
        if (!seenTrades.has(key)) {
          seenTrades.add(key);
          broadcastTick(broadcast, sym, row.lastTrade.p, row.lastTrade.s ?? 0, ts);
        }
        continue;
      }

      if (row.min?.c) {
        const ts = normalizeTs(row.min.t);
        const prev = lastMinTs.get(sym) ?? 0;
        if (ts > prev) {
          lastMinTs.set(sym, ts);
          broadcastBar(broadcast, sym, row.min);
        } else if (prev === 0) {
          // First poll: seed waterfall with current minute bar.
          lastMinTs.set(sym, ts);
          broadcastBar(broadcast, sym, row.min);
        }
        continue;
      }

      const day = row.day ?? row.prevDay;
      if (day?.c) {
        broadcastTick(broadcast, sym, day.c, day.v ?? 0, normalizeTs(day.t));
      }
    }
  };

  const poll = async () => {
    if (closed) return;
    stats.polls += 1;
    try {
      await pollSnapshot();
      stats.lastError = null;
    } catch (err) {
      stats.lastError = err instanceof Error ? err.message : 'rest poll failed';
      stats.source = 'none';
    }
  };

  console.log(`[ws-server] REST snapshot poll every ${POLL_MS}ms for ${symbols.length} symbols`);
  void poll();
  timer = setInterval(() => void poll(), POLL_MS);

  return () => {
    closed = true;
    if (timer) clearInterval(timer);
  };
}
