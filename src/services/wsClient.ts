/**
 * Unified WebSocket client — same code in dev and production.
 * URL comes from NEXT_PUBLIC_WS_URL only; no environment branching.
 */
'use client';

import { applyCandleUpdate, applyMarketUpdate } from '@/store/marketState';
import type { WsOutbound } from '@/lib/ws/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

let socket: WebSocket | null = null;
let attempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let subscribers = 0;
let closed = false;

function handleMessage(raw: string) {
  let msg: WsOutbound;
  try {
    msg = JSON.parse(raw) as WsOutbound;
  } catch {
    return;
  }
  if (msg.type === 'market') applyMarketUpdate(msg.data);
  if (msg.type === 'candle') applyCandleUpdate(msg.data, msg.replaceLast ?? true);
}

function connect() {
  if (!WS_URL || closed || subscribers === 0) return;

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    attempt = 0;
  };

  socket.onmessage = (ev) => handleMessage(String(ev.data));

  socket.onclose = () => {
    socket = null;
    if (closed || subscribers === 0) return;
    attempt = Math.min(attempt + 1, 8);
    const delay = Math.min(1000 * 2 ** attempt, 30_000);
    reconnectTimer = setTimeout(connect, delay);
  };

  socket.onerror = () => socket?.close();
}

function disconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = null;
  socket?.close();
  socket = null;
}

/** Start the shared connection. Returns unsubscribe. Safe to call from multiple hooks. */
export function subscribeMarketWs(): () => void {
  if (!WS_URL || typeof window === 'undefined') return () => {};

  subscribers += 1;
  closed = false;
  if (!socket || socket.readyState === WebSocket.CLOSED) connect();

  return () => {
    subscribers = Math.max(0, subscribers - 1);
    if (subscribers === 0) {
      closed = true;
      disconnect();
    }
  };
}

export function isMarketWsConfigured(): boolean {
  return Boolean(WS_URL);
}
