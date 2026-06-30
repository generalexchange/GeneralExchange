/**
 * Legend terminal subdomain — trade engine at legend.general.exchange.
 * Desktop bundle serves the same UI at /legend/ on the local origin.
 */

import { isTauriApp, DESKTOP_LEGEND_PATH } from '@/lib/desktopNav';

/** Canonical legend terminal origin — override via NEXT_PUBLIC_LEGEND_URL in Vercel. */
export const LEGEND_ORIGIN = (
  process.env.NEXT_PUBLIC_LEGEND_URL ?? 'https://legend.general.exchange'
)
  .trim()
  .replace(/\/$/, '');

const LEGEND_HOST = new URL(LEGEND_ORIGIN).hostname.toLowerCase();

/** Origin only, e.g. https://legend.general.exchange */
export function getLegendOrigin(): string {
  if (typeof window !== 'undefined' && isTauriApp()) {
    return window.location.origin;
  }

  if (typeof window !== 'undefined') {
    const { hostname, port, protocol } = window.location;

    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')) {
      const p = port || '3003';
      return `${protocol}//legend.localhost:${p}`;
    }

    if (isLegendHost(hostname)) {
      return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    }

    return LEGEND_ORIGIN;
  }

  if (process.env.NODE_ENV === 'development') {
    return `http://legend.localhost:${process.env.PORT ?? '3003'}`;
  }

  return LEGEND_ORIGIN;
}

/** Full URL for Legend (subdomain root on web, /legend/ in desktop). */
export function legendDashboardUrl(path = '/'): string {
  if (typeof window !== 'undefined' && isTauriApp()) {
    if (!path || path === '/') return DESKTOP_LEGEND_PATH;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (normalized.startsWith('/legend')) {
      return normalized.endsWith('/') ? normalized : `${normalized}/`;
    }
    if (normalized.startsWith('/dashboard')) {
      return DESKTOP_LEGEND_PATH;
    }
    return `${DESKTOP_LEGEND_PATH.replace(/\/$/, '')}${normalized}`;
  }

  const origin = getLegendOrigin();
  if (!path || path === '/') return `${origin}/`;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.startsWith('/legend') || normalized.startsWith('/dashboard')) {
    const stripped = normalized.replace(/^\/(legend|dashboard)\/?/, '/') || '/';
    return stripped === '/' ? `${origin}/` : `${origin}${stripped}`;
  }
  return `${origin}${normalized}`;
}

/** Marketing-site links → Legend terminal. */
export function legendHref(path = '/'): string {
  return legendDashboardUrl(path);
}

export function isLegendHost(host: string): boolean {
  const h = host.split(':')[0]?.toLowerCase() ?? '';
  return h === 'legend.localhost' || h.startsWith('legend.');
}

export function isNonCanonicalLegendHost(host: string): boolean {
  const h = host.split(':')[0]?.toLowerCase() ?? '';
  if (!isLegendHost(h) || h === 'legend.localhost') return false;
  return h !== LEGEND_HOST;
}

export { LEGEND_HOST };
