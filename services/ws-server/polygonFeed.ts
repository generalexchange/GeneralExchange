import WebSocket from 'ws';
import type { CandleUpdate, MarketUpdate, WsOutbound } from './types';

const POLYGON_WS = 'wss://socket.polygon.io/stocks';
const BASE_PRICES: Record<string, number> = {
  SPY: 512.4,
  QQQ: 438.9,
  NVDA: 121.3,
  AAPL: 224.8,
  TSLA: 248.5,
  AMD: 158.2,
};

export type BroadcastFn = (msg: WsOutbound) => void;

/** Connect to Polygon stocks WS and broadcast normalized updates. */
export function startPolygonFeed(symbols: string[], apiKey: string, broadcast: BroadcastFn): () => void {
  let ws: WebSocket | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  const connect = () => {
    if (closed) return;
    ws = new WebSocket(POLYGON_WS);

    ws.on('open', () => {
      ws!.send(JSON.stringify({ action: 'auth', params: apiKey }));
      const subs = symbols.flatMap((s) => [`T.${s}`, `AM.${s}`]).join(',');
      ws!.send(JSON.stringify({ action: 'subscribe', params: subs }));
      console.log(`[ws-server] polygon connected (${symbols.join(', ')})`);
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
        const msg = normalizePolygonEvent(ev as Record<string, unknown>);
        if (msg) broadcast(msg);
      }
    });

    ws.on('close', () => scheduleReconnect());
    ws.on('error', () => ws?.close());
  };

  const scheduleReconnect = () => {
    if (closed) return;
    console.warn('[ws-server] polygon disconnected; reconnecting in 3s');
    timer = setTimeout(connect, 3000);
  };

  connect();

  return () => {
    closed = true;
    if (timer) clearTimeout(timer);
    ws?.close();
  };
}

function normalizePolygonEvent(ev: Record<string, unknown>): WsOutbound | null {
  const kind = ev.ev;
  if (kind === 'T' && typeof ev.sym === 'string' && typeof ev.p === 'number') {
    const update: MarketUpdate = {
      symbol: ev.sym,
      price: ev.p,
      volume: typeof ev.s === 'number' ? ev.s : undefined,
      timestamp: typeof ev.t === 'number' ? ev.t : Date.now(),
      source: 'polygon',
    };
    return { type: 'market', data: update };
  }
  if (kind === 'AM' && typeof ev.sym === 'string') {
    const candle: CandleUpdate = {
      symbol: ev.sym,
      interval: '1m',
      open_time: Number(ev.s) || Date.now(),
      open: Number(ev.o) || 0,
      high: Number(ev.h) || 0,
      low: Number(ev.l) || 0,
      close: Number(ev.c) || 0,
      volume: Number(ev.v) || 0,
      vwap: Number(ev.vw) || Number(ev.c) || 0,
    };
    return { type: 'candle', data: candle, replaceLast: true };
  }
  return null;
}

/** Deterministic synthetic ticks when no Polygon key (local dev). */
export function startSyntheticFeed(symbols: string[], broadcast: BroadcastFn): () => void {
  console.log('[ws-server] no POLYGON_API_KEY — synthetic feed');
  const prices = Object.fromEntries(symbols.map((s) => [s, BASE_PRICES[s] ?? 100]));
  let seed = 7;

  const tick = () => {
    for (const sym of symbols) {
      seed = (seed + 0x6d2b79f5) | 0;
      const r = ((seed >>> 0) % 1000) / 1000;
      prices[sym] = Math.max(1, prices[sym] + (r - 0.5) * prices[sym] * 0.0006);
      const update: MarketUpdate = {
        symbol: sym,
        price: Math.round(prices[sym] * 100) / 100,
        volume: 100 + (seed % 900),
        timestamp: Date.now(),
        source: 'synthetic',
      };
      broadcast({ type: 'market', data: update });
    }
  };

  const id = setInterval(tick, 900);
  tick();
  return () => clearInterval(id);
}
