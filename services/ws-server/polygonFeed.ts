import WebSocket from 'ws';
import type { CandleUpdate, MarketUpdate, WsOutbound } from './types';

const ENDPOINTS: Record<string, string[]> = {
  realtime: ['wss://socket.polygon.io/stocks', 'wss://socket.massive.com/stocks'],
  delayed: ['wss://delayed.polygon.io/stocks', 'wss://delayed.massive.com/stocks'],
  starter: ['wss://starterfeed.polygon.io/stocks'],
};

export type FeedStats = {
  mode: 'ws' | 'rest' | 'off';
  upstreamConnected: boolean;
  upstreamEndpoint: string | null;
  authOk: boolean;
  ticksBroadcast: number;
  candlesBroadcast: number;
  lastEventAt: string | null;
  lastError: string | null;
  planBlocked: boolean;
};

const stats: FeedStats = {
  mode: 'ws',
  upstreamConnected: false,
  upstreamEndpoint: null,
  authOk: false,
  ticksBroadcast: 0,
  candlesBroadcast: 0,
  lastEventAt: null,
  lastError: null,
  planBlocked: false,
};

export function getFeedStats(): FeedStats {
  return { ...stats };
}

export function setFeedMode(mode: FeedStats['mode']) {
  stats.mode = mode;
}

function feedMode(): string {
  return (process.env.MASSIVE_WS_FEED ?? 'realtime').toLowerCase();
}

function endpointList(): string[] {
  const mode = feedMode();
  if (mode === 'delayed' || mode === 'delay') return ENDPOINTS.delayed;
  if (mode === 'starter') return ENDPOINTS.starter;
  return [...ENDPOINTS.realtime, ...ENDPOINTS.delayed];
}

function normalizeTs(t: unknown): number {
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) return Date.now();
  if (n > 1e15) return Math.floor(n / 1e6);
  if (n < 1e12) return Math.floor(n * 1000);
  return Math.floor(n);
}

export type BroadcastFn = (msg: WsOutbound) => void;

export type PolygonFeedOptions = {
  /** Called when every WS endpoint rejects auth (plan lacks websocket). */
  onPlanBlocked?: (reason: string) => void;
};

function isPlanBlockedMessage(msg: string): boolean {
  const m = msg.toLowerCase();
  return m.includes("doesn't include websocket") || m.includes('does not include websocket');
}

/** Connect to Massive/Polygon stocks WS — auth first, then subscribe (required by protocol). */
export function startPolygonFeed(
  symbols: string[],
  apiKey: string,
  broadcast: BroadcastFn,
  options: PolygonFeedOptions = {},
): () => void {
  let ws: WebSocket | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;
  let endpointIdx = 0;
  let subscribed = false;
  let planBlockedHits = 0;
  const endpoints = endpointList();
  const subs = symbols.flatMap((s) => [`T.${s}`, `A.${s}`, `AM.${s}`]).join(',');

  const connect = () => {
    if (closed) return;
    subscribed = false;
    stats.authOk = false;
    stats.upstreamConnected = false;

    const endpoint = endpoints[endpointIdx % endpoints.length];
    stats.upstreamEndpoint = endpoint;
    console.log(`[ws-server] connecting ${endpoint} mode=${feedMode()}`);

    ws = new WebSocket(endpoint);

    ws.on('open', () => {
      stats.upstreamConnected = true;
      ws!.send(JSON.stringify({ action: 'auth', params: apiKey }));
    });

    ws.on('message', (raw) => {
      let events: unknown[];
      try {
        events = JSON.parse(String(raw));
        if (!Array.isArray(events)) events = [events];
      } catch {
        return;
      }

      for (const ev of events) {
        const row = ev as Record<string, unknown>;

        if (row.ev === 'status') {
          const status = String(row.status ?? '');
          if (status === 'auth_success') {
            stats.authOk = true;
            stats.lastError = null;
            if (!subscribed) {
              subscribed = true;
              ws!.send(JSON.stringify({ action: 'subscribe', params: subs }));
              console.log(`[ws-server] subscribed ${subs}`);
            }
          } else if (status === 'auth_failed') {
            stats.authOk = false;
            stats.lastError = String(row.message ?? 'auth_failed');
            console.error('[ws-server] auth_failed', stats.lastError);
            if (isPlanBlockedMessage(stats.lastError)) {
              planBlockedHits += 1;
              stats.planBlocked = true;
              if (planBlockedHits >= endpoints.length) {
                closed = true;
                if (timer) clearTimeout(timer);
                options.onPlanBlocked?.(stats.lastError);
                ws?.close();
                return;
              }
            }
            ws?.close();
          }
          continue;
        }

        const msgs = normalizeEvent(row);
        for (const msg of msgs) {
          if (msg.type === 'market') stats.ticksBroadcast += 1;
          if (msg.type === 'candle') stats.candlesBroadcast += 1;
          stats.lastEventAt = new Date().toISOString();
          broadcast(msg);
        }
      }
    });

    ws.on('close', () => {
      stats.upstreamConnected = false;
      stats.authOk = false;
      subscribed = false;
      scheduleReconnect(true);
    });

    ws.on('error', (err) => {
      stats.lastError = err instanceof Error ? err.message : 'ws error';
      ws?.close();
    });
  };

  const scheduleReconnect = (rotateEndpoint: boolean) => {
    if (closed) return;
    if (rotateEndpoint) endpointIdx += 1;
    console.warn(`[ws-server] reconnect in 3s (endpoint idx ${endpointIdx})`);
    timer = setTimeout(connect, 3000);
  };

  connect();

  return () => {
    closed = true;
    if (timer) clearTimeout(timer);
    ws?.close();
  };
}

function normalizeEvent(ev: Record<string, unknown>): WsOutbound[] {
  const kind = ev.ev;
  const sym = typeof ev.sym === 'string' ? ev.sym : '';

  if (kind === 'T' && sym && typeof ev.p === 'number') {
    const update: MarketUpdate = {
      symbol: sym,
      price: ev.p,
      volume: typeof ev.s === 'number' ? ev.s : undefined,
      timestamp: normalizeTs(ev.t),
      source: 'massive',
    };
    return [{ type: 'market', data: update }];
  }

  if ((kind === 'A' || kind === 'AM') && sym) {
    const interval = kind === 'A' ? '1s' : '1m';
    const close = Number(ev.c) || 0;
    const candle: CandleUpdate = {
      symbol: sym,
      interval,
      open_time: normalizeTs(ev.s ?? ev.e),
      open: Number(ev.o) || close,
      high: Number(ev.h) || close,
      low: Number(ev.l) || close,
      close,
      volume: Number(ev.v) || 0,
      vwap: Number(ev.vw) || close,
    };
    const out: WsOutbound[] = [{ type: 'candle', data: candle, replaceLast: true }];
    if (close > 0) {
      out.push({
        type: 'market',
        data: {
          symbol: sym,
          price: close,
          volume: Number(ev.v) || undefined,
          timestamp: normalizeTs(ev.e ?? ev.s),
          source: 'massive',
        },
      });
    }
    return out;
  }

  return [];
}
