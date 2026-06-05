/**
 * Unified WebSocket client — resolves URL at runtime from /api/health when needed.
 */
'use client';

import { applyCandleUpdate, applyMarketUpdate } from '@/store/marketState';
import type { WsOutbound } from '@/lib/ws/types';

const BUILD_TIME_WS_URL = process.env.NEXT_PUBLIC_WS_URL?.trim() ?? '';

let socket: WebSocket | null = null;
let resolvedWsUrl: string | null = BUILD_TIME_WS_URL || null;
let attempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let subscribers = 0;
let closed = false;
let connected = false;
const statusListeners = new Set<(open: boolean) => void>();

function notifyStatus(open: boolean) {
  connected = open;
  for (const fn of statusListeners) fn(open);
}

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

async function resolveWsUrl(): Promise<string | null> {
  if (resolvedWsUrl) return resolvedWsUrl;
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/health', { cache: 'no-store' });
    const json = (await res.json()) as { ws_url?: string | null };
    const url = json.ws_url?.trim();
    if (url) resolvedWsUrl = url;
  } catch {
    /* health probe failed */
  }
  return resolvedWsUrl;
}

function scheduleReconnect() {
  if (closed || subscribers === 0) return;
  attempt = Math.min(attempt + 1, 8);
  const delay = Math.min(1000 * 2 ** attempt, 30_000);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void openConnection();
  }, delay);
}

async function openConnection() {
  if (closed || subscribers === 0) return;
  const url = await resolveWsUrl();
  if (!url) return;

  socket = new WebSocket(url);

  socket.onopen = () => {
    attempt = 0;
    notifyStatus(true);
  };

  socket.onmessage = (ev) => handleMessage(String(ev.data));

  socket.onclose = () => {
    socket = null;
    notifyStatus(false);
    scheduleReconnect();
  };

  socket.onerror = () => socket?.close();
}

function disconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = null;
  socket?.close();
  socket = null;
  notifyStatus(false);
}

/** Start the shared connection. Returns unsubscribe. Safe to call from multiple hooks. */
export function subscribeMarketWs(): () => void {
  if (typeof window === 'undefined') return () => {};

  subscribers += 1;
  closed = false;
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    void openConnection();
  }

  return () => {
    subscribers = Math.max(0, subscribers - 1);
    if (subscribers === 0) {
      closed = true;
      disconnect();
    }
  };
}

export function subscribeWsStatus(fn: (open: boolean) => void): () => void {
  statusListeners.add(fn);
  fn(connected);
  return () => statusListeners.delete(fn);
}

export function isWsConnected(): boolean {
  return connected && socket?.readyState === WebSocket.OPEN;
}

/** True when a WS URL is configured (build-time or discoverable via /api/health). */
export function isMarketWsConfigured(): boolean {
  return Boolean(BUILD_TIME_WS_URL) || typeof window !== 'undefined';
}

export function getResolvedWsUrl(): string | null {
  return resolvedWsUrl;
}
