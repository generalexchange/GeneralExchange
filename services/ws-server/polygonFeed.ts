import WebSocket from 'ws';
import type { CandleUpdate, MarketUpdate, WsOutbound } from './types';

/** Massive/Polygon stocks WebSocket — delayed feed works on starter plans. */
function wsEndpoint(): string {
  const feed = (process.env.MASSIVE_WS_FEED ?? 'delayed').toLowerCase();
  if (feed === 'realtime' || feed === 'real-time' || feed === 'live') {
    return 'wss://socket.polygon.io/stocks';
  }
  return 'wss://delayed.polygon.io/stocks';
}

export type BroadcastFn = (msg: WsOutbound) => void;

/** Connect to Massive stocks WS and broadcast normalized updates. */
export function startPolygonFeed(symbols: string[], apiKey: string, broadcast: BroadcastFn): () => void {
  let ws: WebSocket | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;
  const endpoint = wsEndpoint();

  const connect = () => {
    if (closed) return;
    ws = new WebSocket(endpoint);

    ws.on('open', () => {
      ws!.send(JSON.stringify({ action: 'auth', params: apiKey }));
      const subs = symbols.flatMap((s) => [`T.${s}`, `AM.${s}`]).join(',');
      ws!.send(JSON.stringify({ action: 'subscribe', params: subs }));
      console.log(`[ws-server] massive ws connected endpoint=${endpoint} symbols=${symbols.join(',')}`);
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
        const msg = normalizeEvent(ev as Record<string, unknown>);
        if (msg) broadcast(msg);
      }
    });

    ws.on('close', () => scheduleReconnect());
    ws.on('error', () => ws?.close());
  };

  const scheduleReconnect = () => {
    if (closed) return;
    console.warn('[ws-server] massive ws disconnected; reconnecting in 3s');
    timer = setTimeout(connect, 3000);
  };

  connect();

  return () => {
    closed = true;
    if (timer) clearTimeout(timer);
    ws?.close();
  };
}

function normalizeEvent(ev: Record<string, unknown>): WsOutbound | null {
  const kind = ev.ev;
  if (kind === 'T' && typeof ev.sym === 'string' && typeof ev.p === 'number') {
    const update: MarketUpdate = {
      symbol: ev.sym,
      price: ev.p,
      volume: typeof ev.s === 'number' ? ev.s : undefined,
      timestamp: typeof ev.t === 'number' ? ev.t : Date.now(),
      source: 'massive',
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
