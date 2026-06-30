/**
 * Market API fetch — Next.js proxy on web, direct IBKR on desktop bundle.
 */
import { envelope } from './envelope';

const IBKR_BASE = (process.env.NEXT_PUBLIC_IBKR_API_URL ?? 'http://127.0.0.1:8093').replace(/\/$/, '');
const IBKR_KEY = process.env.NEXT_PUBLIC_IBKR_API_KEY ?? '';
const MC_BASE = (process.env.NEXT_PUBLIC_MONTE_CARLO_API_URL ?? 'http://127.0.0.1:8092').replace(/\/$/, '');
const MC_KEY = process.env.NEXT_PUBLIC_MC_API_KEY ?? '';

export function isLocalDesktopClient(): boolean {
  if (process.env.NEXT_PUBLIC_DESKTOP_LOCAL === '1') return true;
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

function ibkrHeaders(): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/json' };
  if (IBKR_KEY) h['X-API-Key'] = IBKR_KEY;
  return h;
}

async function ibkrGet(path: string, params: Record<string, string> = {}): Promise<Response> {
  const url = new URL(`${IBKR_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { cache: 'no-store', headers: ibkrHeaders() });
  if (!res.ok) {
    throw new Error(`IBKR ${res.status}`);
  }
  return res;
}

async function fetchLocalV1(pathWithQuery: string): Promise<Response> {
  const [pathPart, query = ''] = pathWithQuery.split('?');
  const params = new URLSearchParams(query);
  const segments = pathPart.split('/').filter(Boolean);

  if (segments[0] === 'quote' && segments[1]) {
    const sym = segments[1].toUpperCase();
    const raw = await ibkrGet('/market-data', { symbol: sym, sec_type: 'STK' });
    const q = (await raw.json()) as {
      last: number | null;
      bid: number | null;
      ask: number | null;
      prev_close: number | null;
      close: number | null;
      open: number | null;
      timestamp?: string;
    };
    const price = q.last ?? q.bid ?? q.ask ?? 0;
    const prevClose = q.prev_close ?? q.close ?? price;
    const body = envelope(
      {
        symbol: sym,
        price,
        prevClose,
        sessionOpen: q.open && q.open > 0 ? q.open : undefined,
        change: price - prevClose,
        changePct: prevClose ? ((price - prevClose) / prevClose) * 100 : 0,
        timestamp: q.timestamp ? Date.parse(q.timestamp) : Date.now(),
      },
      'ibkr',
    );
    return Response.json(body);
  }

  if (segments[0] === 'candles' && segments.length >= 3) {
    const sym = segments[1].toUpperCase();
    const interval = segments[2];
    const limit = Number(params.get('limit') ?? 0);
    const barMap: Record<string, { bar_size: string; duration: string; use_rth: string }> = {
      '1m': { bar_size: '1 min', duration: '1 D', use_rth: 'false' },
      '5m': { bar_size: '5 mins', duration: '5 D', use_rth: 'true' },
      '15m': { bar_size: '15 mins', duration: '10 D', use_rth: 'true' },
      '1h': { bar_size: '1 hour', duration: '1 M', use_rth: 'true' },
      '1d': { bar_size: '1 day', duration: '6 M', use_rth: 'true' },
    };
    const spec = barMap[interval] ?? barMap['1d'];
    const raw = await ibkrGet('/historical', {
      symbol: sym,
      bar_size: spec.bar_size,
      duration: spec.duration,
      persist: 'false',
      cached: 'false',
      use_rth: spec.use_rth,
    });
    const json = (await raw.json()) as {
      bars: Array<{
        timestamp: string;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
        vwap?: number;
      }>;
    };
    const cap = limit > 0 ? limit : interval === '1m' ? 960 : 200;
    const bars = (json.bars ?? []).slice(-cap).map((b) => ({
      symbol: sym,
      interval,
      open_time: b.timestamp,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
      volume: b.volume,
      vwap: b.vwap ?? b.close,
    }));
    return Response.json(envelope(bars, 'ibkr'));
  }

  if (segments[0] === 'options' && segments[1] === 'chain' && segments[2]) {
    const sym = segments[2].toUpperCase();
    const raw = await ibkrGet('/options-chain', { symbol: sym });
    const json = (await raw.json()) as {
      symbol: string;
      underlying_price: number | null;
      contracts: Array<Record<string, unknown>>;
    };
    const data = (json.contracts ?? []).map((c) => {
      const bid = Number(c.bid ?? 0);
      const ask = Number(c.ask ?? 0);
      return {
        symbol: json.symbol,
        expiration_date: c.expiry,
        strike: c.strike,
        option_type: c.right === 'P' ? 'PUT' : 'CALL',
        bid,
        ask,
        mid: bid || ask ? (bid + ask) / 2 : Number(c.last ?? 0),
        last: c.last ?? 0,
        volume: c.volume ?? 0,
        open_interest: c.open_interest ?? 0,
        implied_volatility: c.implied_volatility ?? 0,
        delta: c.delta ?? 0,
        gamma: c.gamma ?? 0,
        theta: c.theta ?? 0,
        vega: c.vega ?? 0,
        underlying_price: json.underlying_price ?? 0,
      };
    });
    return Response.json(envelope(data, 'ibkr'));
  }

  if (segments[0] === 'news') {
    return Response.json(envelope([], 'ibkr-unavailable'));
  }

  throw new Error(`unsupported local path: ${pathPart}`);
}

/** Fetch /api/v1/* — proxied on web, direct to local IBKR in desktop bundle. */
export async function fetchV1(path: string, init?: RequestInit): Promise<Response> {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (isLocalDesktopClient()) {
    return fetchLocalV1(normalized.replace(/^\/api\/v1/, '').replace(/^\//, ''));
  }
  return fetch(`/api/v1${normalized}`, init);
}

/** POST /api/v1/opportunity/* — Next.js route on web, local Monte Carlo on desktop. */
export async function fetchV1Post(path: string, body: unknown): Promise<Response> {
  const route = path.replace(/^\/api\/v1\//, '').replace(/^\//, '');
  if (isLocalDesktopClient()) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (MC_KEY) headers['X-API-Key'] = MC_KEY;
    return fetch(`${MC_BASE}/v1/${route}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    });
  }
  return fetch(`/api/v1/${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
}
