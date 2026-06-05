import type { BroadcastFn } from './polygonFeed';
import type { WsOutbound } from './types';

const POLYGON_BASE = 'https://api.polygon.io';
const POLL_MS = Number(process.env.REST_FEED_POLL_MS ?? 1500);
const TRADES_LIMIT = 30;

export type RestFeedStats = {
  mode: 'rest';
  polls: number;
  ticksBroadcast: number;
  lastEventAt: string | null;
  lastError: string | null;
};

const stats: RestFeedStats = {
  mode: 'rest',
  polls: 0,
  ticksBroadcast: 0,
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

type TradeRow = {
  sip_timestamp?: number;
  participant_timestamp?: number;
  price: number;
  size: number;
};

/** Poll Polygon REST trade tape when WebSocket is not on the API plan. */
export function startRestFeed(symbols: string[], apiKey: string, broadcast: BroadcastFn): () => void {
  const seen = new Set<string>();
  let closed = false;
  let timer: ReturnType<typeof setInterval> | null = null;

  const pollSymbol = async (sym: string) => {
    const url = new URL(`${POLYGON_BASE}/v3/trades/${sym}`);
    url.searchParams.set('limit', String(TRADES_LIMIT));
    url.searchParams.set('order', 'desc');
    url.searchParams.set('apiKey', apiKey);

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`trades ${sym} ${res.status}: ${text.slice(0, 120)}`);
    }

    const json = (await res.json()) as { results?: TradeRow[] };
    const rows = json.results ?? [];
    for (const t of [...rows].reverse()) {
      if (!t.price || t.price <= 0) continue;
      const ts = normalizeTs(t.sip_timestamp ?? t.participant_timestamp);
      const key = `${sym}-${ts}-${t.price}-${t.size}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const msg: WsOutbound = {
        type: 'market',
        data: {
          symbol: sym,
          price: t.price,
          volume: t.size,
          timestamp: ts,
          source: 'polygon',
        },
      };
      stats.ticksBroadcast += 1;
      stats.lastEventAt = new Date().toISOString();
      broadcast(msg);
    }
    if (seen.size > 20_000) {
      for (const k of [...seen].slice(0, 10_000)) seen.delete(k);
    }
  };

  const poll = async () => {
    if (closed) return;
    stats.polls += 1;
    try {
      await Promise.all(symbols.map((s) => pollSymbol(s)));
      stats.lastError = null;
    } catch (err) {
      stats.lastError = err instanceof Error ? err.message : 'rest poll failed';
    }
  };

  console.log(`[ws-server] REST trade poll every ${POLL_MS}ms for ${symbols.join(',')}`);
  void poll();
  timer = setInterval(() => void poll(), POLL_MS);

  return () => {
    closed = true;
    if (timer) clearInterval(timer);
  };
}
