/**
 * Monte Carlo compute API — same @gx/analytics engine as the web app.
 * Deploy to DigitalOcean (Docker) for heavy simulation I/O.
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { evaluateTrade } from '../../packages/analytics/src/scoring/TradeEvaluationEngine.ts';
import {
  simulatePricePaths,
  simulateStrategyOutcome,
  simulateTradeQuality,
} from '../../packages/analytics/src/monte-carlo/simulations.ts';
import type { PricePathInput } from '../../packages/analytics/src/monte-carlo/types.ts';
import type { StrategySimulationInput } from '../../packages/analytics/src/monte-carlo/types.ts';
import type { TradeQualityInput } from '../../packages/analytics/src/monte-carlo/types.ts';
import type { TradeEvaluationInput } from '../../packages/analytics/src/types/dashboard.ts';

const PORT = Number(process.env.PORT || process.env.MC_PORT || 8092);
const API_KEY = process.env.MC_API_KEY?.trim() || process.env.GE_API_KEY?.trim() || '';

async function readJson<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) throw new Error('empty body');
  return JSON.parse(raw) as T;
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function unauthorized(res: ServerResponse) {
  send(res, 401, { error: 'unauthorized', detail: 'Invalid or missing X-API-Key' });
}

function checkAuth(req: IncomingMessage, res: ServerResponse): boolean {
  if (!API_KEY) return true;
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    unauthorized(res);
    return false;
  }
  return true;
}

const routes: Record<string, (body: unknown) => unknown> = {
  'price-path': (body) => simulatePricePaths(body as PricePathInput),
  strategy: (body) => simulateStrategyOutcome(body as StrategySimulationInput),
  'trade-quality': (body) => simulateTradeQuality(body as TradeQualityInput),
  evaluate: (body) => evaluateTrade(body as TradeEvaluationInput),
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
    if (req.method === 'GET' && (url.pathname === '/health' || url.pathname === '/healthz')) {
      send(res, 200, {
        ok: true,
        service: 'monte-carlo-api',
        engine: '@gx/analytics',
        routes: Object.keys(routes),
      });
      return;
    }

    if (req.method !== 'POST' || !url.pathname.startsWith('/v1/')) {
      send(res, 404, { error: 'not_found' });
      return;
    }

    if (!checkAuth(req, res)) return;

    const name = url.pathname.slice('/v1/'.length);
    const handler = routes[name];
    if (!handler) {
      send(res, 404, { error: 'unknown_route', path: name });
      return;
    }

    const body = await readJson<unknown>(req);
    const result = handler(body);
    send(res, 200, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'internal_error';
    send(res, 400, { error: message });
  }
}).listen(PORT, () => {
  console.log(`[monte-carlo-api] listening on :${PORT}`);
});
