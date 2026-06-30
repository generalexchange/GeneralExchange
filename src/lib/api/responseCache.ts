/**
 * Short-lived server-side cache for read-only /api/v1 GET responses.
 * Tuned for near-live quotes with stale-while-revalidate on slower routes.
 */

import { API_RESPONSE_CACHE_SEC, API_SWR_CAP_SEC, API_STALE_MAX_AGE_MS } from '@/config/marketFeedCache';

type CacheEntry = { body: string; expiresAt: number; ttl: number };

const store = new Map<string, CacheEntry>();

function ttlForPath(path: string[]): number {
  const joined = path.join('/');
  for (const [prefix, ttl] of Object.entries(API_RESPONSE_CACHE_SEC)) {
    if (prefix === 'default') continue;
    if (joined.startsWith(prefix)) return ttl;
  }
  return API_RESPONSE_CACHE_SEC.default;
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
  if (Date.now() > hit.expiresAt) return null;
  return { body: hit.body, ttl: hit.ttl };
}

export function getStaleCachedApiResponse(
  path: string[],
  search: string,
  maxAgeMs = API_STALE_MAX_AGE_MS,
): { body: string; ttl: number } | null {
  const key = cacheKey(path, search);
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() - hit.expiresAt > maxAgeMs) return null;
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
  const swr = Math.min(ttlSeconds * 3, API_SWR_CAP_SEC);
  return `public, s-maxage=${ttlSeconds}, stale-while-revalidate=${swr}`;
}

export function clearApiCache(): void {
  store.clear();
}
