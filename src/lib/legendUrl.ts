/**
 * Legend terminal subdomain — authenticated dashboard lives at legend.general.exchange.
 * In the Tauri desktop bundle, Legend is served at /dashboard/ on the same origin.
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

    return LEGEND_ORIGIN;
  }

  if (process.env.NODE_ENV === 'development') {
    return `http://legend.localhost:${process.env.PORT ?? '3003'}`;
  }

  return LEGEND_ORIGIN;
}

/** Full URL for the legend terminal (default path is subdomain root). */
export function legendDashboardUrl(path = '/'): string {
  if (typeof window !== 'undefined' && isTauriApp()) {
    if (!path || path === '/') return DESKTOP_LEGEND_PATH;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (normalized.startsWith('/dashboard')) return normalized.endsWith('/') ? normalized : `${normalized}/`;
    return `${DESKTOP_LEGEND_PATH.replace(/\/$/, '')}${normalized}`;
  }

  const origin = getLegendOrigin();
  if (!path || path === '/') return `${origin}/`;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalized}`;
}

export function isLegendHost(host: string): boolean {
  const h = host.split(':')[0]?.toLowerCase() ?? '';
  return h === 'legend.localhost' || h.startsWith('legend.');
}

/** True when host is a legacy/wrong legend hostname that should 308 to LEGEND_ORIGIN. */
export function isNonCanonicalLegendHost(host: string): boolean {
  const h = host.split(':')[0]?.toLowerCase() ?? '';
  if (!isLegendHost(h) || h === 'legend.localhost') return false;
  return h !== LEGEND_HOST;
}

export { LEGEND_HOST };
