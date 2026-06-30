/** In-memory TTL cache for desktop local API pulls — stale-while-revalidate. */

export type CacheStats = {
  hits: number;
  misses: number;
  entries: number;
  lastFetchAt: number | null;
  lastHitAt: number | null;
  recent: Array<{ key: string; at: number; hit: boolean }>;
};

type Entry = {
  body: string;
  fetchedAt: number;
  ttlMs: number;
};

const store = new Map<string, Entry>();
const listeners = new Set<() => void>();

let hits = 0;
let misses = 0;
let lastFetchAt: number | null = null;
let lastHitAt: number | null = null;
const recent: CacheStats['recent'] = [];

function notify() {
  listeners.forEach((fn) => fn());
}

function pushRecent(key: string, hit: boolean) {
  recent.unshift({ key, at: Date.now(), hit });
  if (recent.length > 12) recent.pop();
}

export function subscribeDesktopCache(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDesktopCacheStats(): CacheStats {
  return {
    hits,
    misses,
    entries: store.size,
    lastFetchAt,
    lastHitAt,
    recent: [...recent],
  };
}

export function readDesktopCache(key: string): { json: unknown; ageMs: number; stale: boolean } | null {
  const entry = store.get(key);
  if (!entry) return null;
  const ageMs = Date.now() - entry.fetchedAt;
  const stale = ageMs > entry.ttlMs;
  try {
    return { json: JSON.parse(entry.body), ageMs, stale };
  } catch {
    store.delete(key);
    return null;
  }
}

export function writeDesktopCache(key: string, json: unknown, ttlMs: number) {
  store.set(key, {
    body: JSON.stringify(json),
    fetchedAt: Date.now(),
    ttlMs,
  });
  lastFetchAt = Date.now();
  pushRecent(key, false);
  notify();
}

export function recordCacheHit(key: string) {
  hits += 1;
  lastHitAt = Date.now();
  pushRecent(key, true);
  notify();
}

export function recordCacheMiss() {
  misses += 1;
  notify();
}

import { DESKTOP_REST_CACHE_MS } from '@/config/marketFeedCache';

export const DESKTOP_CACHE_TTL = DESKTOP_REST_CACHE_MS;
