/**
 * Short-lived server-side cache for read-only /api/v1 GET responses.
 * Reduces Polygon/Massive API calls and improves Vercel response times.
 */

type CacheEntry = { body: string; expiresAt: number; ttl: number };

const store = new Map<string, CacheEntry>();

/** TTL in seconds per route prefix (first path segment(s)). */
const TTL_SECONDS: Record<string, number> = {
  quote: 5,
  ticks: 15,
  candles: 60,
  'options/chain': 30,
  'options/surface': 30,
  news: 120,
  signals: 30,
  regime: 30,
};

function ttlForPath(path: string[]): number {
  const joined = path.join('/');
  for (const [prefix, ttl] of Object.entries(TTL_SECONDS)) {
    if (joined.startsWith(prefix)) return ttl;
  }
  return 30;
}

function cacheKey(path: string[], search: string): string {
  return `${path.join('/')}${search}`;
}

export function getCachedApiResponse(
  path: string[],
  search: string,
): { body: string; ttl: number } | null {
  const key = cacheKey(path, search);
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    store.delete(key);
    return null;
  }
  return { body: hit.body, ttl: hit.ttl };
}

export function setCachedApiResponse(path: string[], search: string, body: string): number {
  const ttl = ttlForPath(path);
  store.set(cacheKey(path, search), {
    body,
    expiresAt: Date.now() + ttl * 1000,
    ttl,
  });
  return ttl;
}

export function cacheControlHeader(ttlSeconds: number): string {
  const swr = Math.min(ttlSeconds * 2, 300);
  return `public, s-maxage=${ttlSeconds}, stale-while-revalidate=${swr}`;
}

/** Clear cache (tests). */
export function clearApiCache(): void {
  store.clear();
}
