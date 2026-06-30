/**
 * Unified WebSocket client — connects to /ws/market stream engine.
 * Ticks pass through micro-batch buffer before marketState (HFT cache layer).
 */
'use client';

import {
  applyCandleUpdate,
  applyMarketSnapshot,
  applyMarketStreamUpdate,
  applyMarketUpdate,
} from '@/store/marketState';
import {
  consumePendingStream,
  ingestMarketStreamUpdate,
  ingestMarketUpdate,
  onMicroBatchFlush,
} from '@/lib/marketTickBuffer';
import type { WsOutbound } from '@/lib/ws/types';

const BUILD_TIME_WS_URL = process.env.NEXT_PUBLIC_WS_URL?.trim() ?? '';
const DEFAULT_SYMBOLS = 'SPY,QQQ,NVDA,AAPL,TSLA,AMD,MSFT,AMZN,META';

let socket: WebSocket | null = null;
let resolvedWsUrl: string | null = BUILD_TIME_WS_URL || null;
let attempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let subscribers = 0;
let closed = false;
let connected = false;
const statusListeners = new Set<(open: boolean) => void>();
const symbolWatch = new Set<string>(DEFAULT_SYMBOLS.split(',').map((s) => s.trim()).filter(Boolean));
let batchBridgeInstalled = false;

function notifyStatus(open: boolean) {
  connected = open;
  for (const fn of statusListeners) fn(open);
}

function ensureBatchBridge() {
  if (batchBridgeInstalled) return;
  batchBridgeInstalled = true;
  onMicroBatchFlush((snapshots) => {
    for (const snap of snapshots) {
      const sym = snap.symbol;
      const stream = consumePendingStream(sym);

      if (stream) {
        applyMarketStreamUpdate({
          ...stream,
          price: snap.lastPrice,
          volume: snap.volumeDelta || stream.volume,
          timestamp: snap.timestamp,
          seq: snap.seq,
        });
      } else {
        applyMarketUpdate({
          symbol: sym,
          price: snap.lastPrice,
          volume: snap.volumeDelta,
          timestamp: snap.timestamp,
          source: 'ibkr',
        });
      }
    }
  });
}

function sendSubscribe() {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  const symbols = [...symbolWatch];
  if (!symbols.length) return;
  socket.send(JSON.stringify({ action: 'subscribe', symbols }));
}

export function setWsSymbolWatch(symbols: string[]) {
  for (const s of symbols) {
    if (s) symbolWatch.add(s.toUpperCase());
  }
  sendSubscribe();
}

function handleMessage(raw: string) {
  let msg: WsOutbound;
  try {
    msg = JSON.parse(raw) as WsOutbound;
  } catch {
    return;
  }
  ensureBatchBridge();
  if (msg.type === 'market') ingestMarketUpdate(msg.data);
  if (msg.type === 'stream') ingestMarketStreamUpdate(msg.data);
  if (msg.type === 'snapshot') applyMarketSnapshot(msg.data);
  if (msg.type === 'candle') applyCandleUpdate(msg.data, msg.replaceLast ?? true);
}

function marketWsUrl(base: string): string {
  const root = base.replace(/\/$/, '').replace('127.0.0.1', 'localhost');
  if (root.includes('/ws/market')) return root;
  if (root.includes('/ws/stocks')) {
    return root.replace(/\/ws\/stocks.*/i, '/ws/market');
  }
  return `${root.replace(/^https:/i, 'wss:').replace(/^http:/i, 'ws:')}/ws/market`;
}

async function resolveWsUrl(): Promise<string | null> {
  if (resolvedWsUrl) return marketWsUrl(resolvedWsUrl);
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/health', { cache: 'no-store' });
    const json = (await res.json()) as { ws_url?: string | null };
    const url = json.ws_url?.trim();
    if (url) resolvedWsUrl = marketWsUrl(url);
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
    sendSubscribe();
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
  ensureBatchBridge();
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    void openConnection();
  } else if (socket.readyState === WebSocket.OPEN) {
    sendSubscribe();
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
