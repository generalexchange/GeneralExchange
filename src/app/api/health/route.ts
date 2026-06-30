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

async function probeIbkrConnected(url: string, ms = 5000): Promise<boolean> {
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(ms),
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { connected?: boolean };
    return json.connected === true;
  } catch {
    return false;
  }
}

export async function GET() {
  const ibkrUrl = (process.env.IBKR_API_URL ?? 'http://localhost:8093').replace(/\/$/, '');
  const ibkrStatus = await probe(ibkrUrl, '/health', 5000);
  const ibkrGatewayConnected = ibkrStatus === 'reachable' ? await probeIbkrConnected(ibkrUrl, 5000) : false;

  const mcUrl = (process.env.MONTE_CARLO_API_URL ?? '').replace(/\/$/, '');
  let mcStatus: 'reachable' | 'unavailable' | 'local' = mcUrl ? 'unavailable' : 'local';
  if (mcUrl) mcStatus = await probe(mcUrl, '/health', 5000);

  const wsPublic =
    process.env.NEXT_PUBLIC_WS_URL?.trim() ||
    (ibkrUrl.startsWith('http')
      ? `${ibkrUrl.replace(/^https:/i, 'wss:').replace(/^http:/i, 'ws:')}/ws/market`
      : '');
  let wsStatus: 'reachable' | 'unavailable' | 'unset' = wsPublic ? 'unavailable' : 'unset';
  if (wsPublic) {
    const httpUrl = wsPublic
      .replace(/^wss:/i, 'https:')
      .replace(/^ws:/i, 'http:')
      .replace(/\/ws\/market.*/i, '')
      .replace(/\/ws\/stocks.*/i, '');
    wsStatus = await probe(httpUrl, '/health', 5000);
  }

  return NextResponse.json({
    status: 'ok',
    ibkr_api: ibkrStatus,
    ibkr_api_url: ibkrUrl,
    ibkr_connected: ibkrGatewayConnected,
    ibkr_api_reachable: ibkrStatus === 'reachable',
    ws_url: wsPublic || null,
    ws_api: wsStatus,
    monte_carlo_api: mcStatus,
    monte_carlo_api_url: mcUrl || null,
    monte_carlo_public: process.env.NEXT_PUBLIC_MONTE_CARLO_API_URL?.trim() || '/api/v1/monte-carlo',
    as_of: new Date().toISOString(),
  });
}
