/**
 * Proxy GET /v1/* to the Go API gateway (Redis / ClickHouse backed).
 */
import { canUseGateway } from './marketRouting';

const GE_BASE = (process.env.GE_API_URL ?? '').replace(/\/$/, '');
const GE_KEY = process.env.GE_API_KEY ?? process.env.DEV_API_KEY ?? '';

function headers(): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/json' };
  if (GE_KEY) h['X-API-Key'] = GE_KEY;
  return h;
}

export async function tryGatewayProxy(
  path: string[],
  search: string,
): Promise<{ body: string; status: number } | null> {
  if (!canUseGateway() || path.length < 2) return null;

  const url = `${GE_BASE}/v1/${path.join('/')}${search}`;
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: headers(),
      signal: AbortSignal.timeout(20_000),
    });
    const body = await res.text();
    if (!res.ok) return null;
    return { body, status: res.status };
  } catch (err) {
    console.error('[gatewayProxy]', path.join('/'), err);
    return null;
  }
}
