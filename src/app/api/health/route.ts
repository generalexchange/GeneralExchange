import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function probe(url: string, path: string, ms = 5000): Promise<'reachable' | 'unavailable'> {
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}${path}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(ms),
    });
    return res.ok ? 'reachable' : 'unavailable';
  } catch {
    return 'unavailable';
  }
}

export async function GET() {
  const ibkrUrl = (process.env.IBKR_API_URL ?? 'http://localhost:8093').replace(/\/$/, '');
  const ibkrStatus = await probe(ibkrUrl, '/health', 5000);

  const mcUrl = (process.env.MONTE_CARLO_API_URL ?? '').replace(/\/$/, '');
  let mcStatus: 'reachable' | 'unavailable' | 'local' = mcUrl ? 'unavailable' : 'local';
  if (mcUrl) mcStatus = await probe(mcUrl, '/health', 5000);

  const wsPublic = process.env.NEXT_PUBLIC_WS_URL?.trim() || '';
  let wsStatus: 'reachable' | 'unavailable' | 'unset' = wsPublic ? 'unavailable' : 'unset';
  if (wsPublic) {
    const httpUrl = wsPublic.replace(/^wss:/i, 'https:').replace(/^ws:/i, 'http:').replace(/\/ws\/stocks.*/i, '');
    wsStatus = await probe(httpUrl, '/health', 5000);
  }

  return NextResponse.json({
    status: 'ok',
    ibkr_api: ibkrStatus,
    ibkr_api_url: ibkrUrl,
    ibkr_connected: ibkrStatus === 'reachable',
    ws_url: wsPublic || null,
    ws_api: wsStatus,
    monte_carlo_api: mcStatus,
    monte_carlo_api_url: mcUrl || null,
    monte_carlo_public: process.env.NEXT_PUBLIC_MONTE_CARLO_API_URL?.trim() || '/api/v1/monte-carlo',
    as_of: new Date().toISOString(),
  });
}
