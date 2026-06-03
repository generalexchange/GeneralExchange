/**
 * Unified market WebSocket server — same code in dev and production.
 *
 *   Dev:  ws://localhost:3001/ws
 *   Prod: wss://general.exchange/ws  (reverse-proxy to this process)
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { URL } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { startPolygonFeed, startSyntheticFeed } from './polygonFeed';
import type { WsOutbound } from './types';

/** Load repo-root .env when running via `npm run dev:ws` (Node does not auto-load it). */
function loadDotEnv() {
  const path = resolve(process.cwd(), '.env');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    if (process.env[key] != null) continue;
    process.env[key] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
}
loadDotEnv();

const PORT = Number(process.env.WS_PORT || 3001);
const IS_PROD = process.env.NODE_ENV === 'production';
const POLYGON_KEY = process.env.POLYGON_API_KEY?.trim() ?? '';
const SYMBOLS = (process.env.WS_SYMBOLS ?? 'SPY,QQQ,NVDA,AAPL,TSLA,AMD')
  .split(',')
  .map((s) => s.trim().toUpperCase())
  .filter(Boolean);

const clients = new Set<WebSocket>();

function broadcast(msg: WsOutbound) {
  const raw = JSON.stringify(msg);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) client.send(raw);
  }
}

const httpServer = createServer((req, res) => {
  if (req.url === '/health' || req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        ok: true,
        clients: clients.size,
        symbols: SYMBOLS,
        polygon: Boolean(POLYGON_KEY),
        env: IS_PROD ? 'production' : 'development',
      }),
    );
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ noServer: true });

httpServer.on('upgrade', (req, socket, head) => {
  const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
  if (pathname === '/ws' || pathname === '/') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
    return;
  }
  socket.destroy();
});

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
  ws.on('error', () => ws.close());
});

httpServer.listen(PORT, () => {
  console.log(`[ws-server] listening on :${PORT}  path=/ws  prod=${IS_PROD}`);
});

const stopFeed = POLYGON_KEY
  ? startPolygonFeed(SYMBOLS, POLYGON_KEY, broadcast)
  : startSyntheticFeed(SYMBOLS, broadcast);

function shutdown() {
  stopFeed();
  for (const c of clients) c.close();
  httpServer.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
