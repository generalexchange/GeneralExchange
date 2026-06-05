/**
 * Legend terminal subdomain — authenticated dashboard lives at legend.{ROOT_DOMAIN}.
 * Post-login must land on the subdomain root (/), not /dashboard on the apex host.
 */

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'general.exchange').toLowerCase();

/** Origin only, e.g. https://legend.general.exchange */
export function getLegendOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_LEGEND_URL?.trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined') {
    const { hostname, port, protocol } = window.location;

    if (hostname === 'legend.localhost' || hostname.startsWith('legend.')) {
      return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    }

    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')) {
      const p = port || '3003';
      return `${protocol}//legend.localhost:${p}`;
    }

    // Apex, www, Vercel preview, etc. — always send to legend subdomain
    return `https://legend.${ROOT_DOMAIN}`;
  }

  if (process.env.NODE_ENV === 'development') {
    return `http://legend.localhost:${process.env.PORT ?? '3003'}`;
  }

  return `https://legend.${ROOT_DOMAIN}`;
}

/** Full URL for the legend terminal (default path is subdomain root). */
export function legendDashboardUrl(path = '/'): string {
  const origin = getLegendOrigin();
  if (!path || path === '/') return `${origin}/`;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalized}`;
}

export function isLegendHost(host: string): boolean {
  const h = host.split(':')[0]?.toLowerCase() ?? '';
  return h === 'legend.localhost' || h.startsWith('legend.');
}

export { ROOT_DOMAIN };
