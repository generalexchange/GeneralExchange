'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  isMarketWsConfigured,
  setWsSymbolWatch,
  subscribeMarketWs,
  subscribeWsStatus,
  isWsConnected,
} from '@/services/wsClient';
import { getMarketState, seedCandlesFromRest, seedQuoteFromRest, useSymbolQuote, useSymbolCandles } from '@/store/marketState';
import {
  chainExpirations,
  computeGexFromChain,
  mapCandleRows,
  mapPolygonChain,
  mapPolygonNews,
  type CandleRow,
} from '@/lib/api/mapLiveData';
import { readJsonResponse } from '@/lib/api/readJsonResponse';
import { fetchV1, isLocalDesktopClient } from '@/lib/api/v1Fetch';
import { getMarketSession, quoteCardTheme, type MarketSession } from '@/lib/marketSession';
import { filterExtendedDayCandles, sessionOpenFromCandles } from '@/lib/extendedHoursChart';
import { OPTIONS_CHAIN_POLL_MS } from '@/config/marketFeedCache';
import type { Candle } from '@/components/dashboard/terminal/terminalData';
import type { NewsRow, OptionRow } from '@/components/dashboard/terminal/terminalData';

export type ChartRange = '1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y' | '5Y' | 'MAX';

const RANGE_FETCH: Record<ChartRange, { interval: string; limit: number }> = {
  '1D': { interval: '1m', limit: 1200 },
  '1W': { interval: '15m', limit: 67 },
  '1M': { interval: '1h', limit: 120 },
  '3M': { interval: '1d', limit: 65 },
  YTD: { interval: '1d', limit: 180 },
  '1Y': { interval: '1d', limit: 252 },
  '5Y': { interval: '1d', limit: 400 },
  MAX: { interval: '1d', limit: 500 },
};

const WS_WAIT_MS = 4_000;
const QUOTE_POLL_MS = 30_000;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchIbkrLocalHint(): Promise<string> {
  try {
    const base = process.env.NEXT_PUBLIC_IBKR_API_URL ?? 'http://127.0.0.1:8093';
    const res = await fetch(`${base.replace(/\/$/, '')}/health`, { cache: 'no-store' });
    if (res.ok) {
      const json = (await res.json()) as { connected?: boolean; port?: number };
      if (json.connected) return 'Waiting for first IBKR quote…';
      return `IBKR service is running but IB Gateway (port ${json.port ?? 4002}) is not connected — log in to Gateway and enable API socket clients.`;
    }
  } catch {
    /* service down */
  }
  return 'Start IB Gateway (port 4002), then run scripts/start-local-stack.ps1 or: cd backend/python && py -3.11 -m uvicorn services.ibkr.main:app --host 127.0.0.1 --port 8093';
}

function wsQuotePrice(sym: string): number {
  return getMarketState().quotes[sym]?.price ?? 0;
}

/** Pin the chart to the latest REST/WS quote when bar data is delayed. */
function mergeLiveQuote(candles: Candle[], quote: { price: number; prevClose?: number; timestamp?: number | string } | null): Candle[] {
  if (!quote?.price) return candles;
  const price = quote.price;
  const qt = quote.timestamp ? Number(quote.timestamp) : Date.now();

  if (!candles.length) return [];
  const last = candles[candles.length - 1];
  if (qt - last.t < 120_000) {
    return [
      ...candles.slice(0, -1),
      {
        ...last,
        c: price,
        h: Math.max(last.h, price),
        l: Math.min(last.l, price),
        vwap: price,
      },
    ];
  }
  return [...candles, { t: qt, o: price, h: price, l: price, c: price, v: 0, vwap: price }];
}

type QuotePayload = {
  symbol: string;
  price: number;
  prevClose: number;
  sessionOpen?: number;
  change: number;
  changePct: number;
  afterHoursChange?: number;
  afterHoursChangePct?: number;
  timestamp?: number | string;
};

export type LiveDashboardOptions = {
  /** Skip options chain + news (e.g. SPY sidebar tape only). */
  lite?: boolean;
};

/** WebSocket-first live dashboard — REST enriches prevClose / history. */
export function useLiveDashboard(
  symbol: string,
  chartRange: ChartRange = '1D',
  options: LiveDashboardOptions = {},
) {
  const lite = options.lite ?? false;
  const quote = useSymbolQuote(symbol);
  const wsInterval = RANGE_FETCH[chartRange].interval;
  const wsCandles = useSymbolCandles(symbol, wsInterval);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [chain, setChain] = useState<OptionRow[]>([]);
  const [news, setNews] = useState<NewsRow[]>([]);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsOpen, setWsOpen] = useState(false);
  const [session, setSession] = useState<MarketSession>(() => getMarketSession());
  const hasQuoteRef = useRef(false);

  useEffect(() => subscribeMarketWs(), []);
  useEffect(() => subscribeWsStatus(setWsOpen), []);
  useEffect(() => {
    setWsSymbolWatch([symbol]);
  }, [symbol]);

  useEffect(() => {
    const id = window.setInterval(() => setSession(getMarketSession()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    hasQuoteRef.current = false;
    setLoading(true);
    setError(null);
  }, [symbol]);

  useEffect(() => {
    if (quote?.price && quote.price > 0) {
      hasQuoteRef.current = true;
      setError(null);
      setLoading(false);
    }
  }, [quote?.price]);

  const fetchQuoteRest = useCallback(async () => {
    const res = await fetchV1(`/quote/${symbol}`, { cache: 'no-store' });
    const json = await readJsonResponse<{ data?: QuotePayload; source?: string; error?: string }>(res);
    if (!res.ok || json.error) {
      throw new Error(json.error ?? 'quote unavailable');
    }
    const q = json.data;
    if (!q?.price || q.price <= 0) {
      throw new Error('quote unavailable');
    }
    setSource(json.source ?? null);
    seedQuoteFromRest(symbol, {
      price: q.price,
      prevClose: q.prevClose,
      sessionOpen: q.sessionOpen,
      change: q.change,
      changePct: q.changePct,
      afterHoursChange: q.afterHoursChange,
      afterHoursChangePct: q.afterHoursChangePct,
      timestamp: q.timestamp ? Number(q.timestamp) : Date.now(),
    });
    hasQuoteRef.current = true;
    setLoading(false);
    setError(null);
    return q;
  }, [symbol]);

  useEffect(() => {
    let cancelled = false;
    const refreshQuote = async () => {
      if (quote?.streamSeq && quote.price > 0) return;
      try {
        await fetchQuoteRest();
      } catch {
        /* stream may still have a price */
      }
    };
    void refreshQuote();
    const id = window.setInterval(() => {
      if (!cancelled) void refreshQuote();
    }, QUOTE_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [fetchQuoteRest, quote?.streamSeq, quote?.price]);

  const fetchCandles = useCallback(async () => {
    const spec = RANGE_FETCH[chartRange];
    const res = await fetchV1(`/candles/${symbol}/${spec.interval}?limit=${spec.limit}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    try {
      const json = await readJsonResponse<{ data: CandleRow[]; source?: string }>(res);
      const mapped = mapCandleRows(json.data ?? []);
      setCandles(mapped);
      if (mapped.length) seedCandlesFromRest(symbol, spec.interval, mapped);
      if (json.source) setSource(json.source);
      return mapped;
    } catch {
      return [];
    }
  }, [symbol, chartRange]);

  const fetchChain = useCallback(async (spot: number) => {
    const res = await fetchV1(`/options/chain/${symbol}`, { cache: 'no-store' });
    if (!res.ok) return [];
    try {
      const json = await readJsonResponse<{ data: Parameters<typeof mapPolygonChain>[0] }>(res);
      const rows = mapPolygonChain(json.data ?? [], spot);
      setChain(rows);
      return rows;
    } catch {
      return [];
    }
  }, [symbol]);

  const fetchNews = useCallback(async () => {
    const res = await fetchV1(`/news/${symbol}`, { cache: 'no-store' });
    if (!res.ok) return [];
    try {
      const json = await readJsonResponse<{ data: Parameters<typeof mapPolygonNews>[0] }>(res);
      const rows = mapPolygonNews(json.data ?? []);
      setNews(rows);
      return rows;
    } catch {
      return [];
    }
  }, [symbol]);

  // Initial bootstrap — only toggles loading when we have no quote yet.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!hasQuoteRef.current) setLoading(true);

      if (isMarketWsConfigured() && !isLocalDesktopClient()) {
        const deadline = Date.now() + WS_WAIT_MS;
        while (!cancelled && Date.now() < deadline && wsQuotePrice(symbol) <= 0) {
          await sleep(250);
        }
      }

      let spot = wsQuotePrice(symbol) || quote?.price || 0;

      try {
        const q = await fetchQuoteRest();
        spot = q.price;
      } catch (e) {
        if (!cancelled && !hasQuoteRef.current) {
          const wsPrice = wsQuotePrice(symbol);
          if (wsPrice > 0) {
            spot = wsPrice;
            setError(null);
          } else if (isMarketWsConfigured() && !isLocalDesktopClient()) {
            setError(isWsConnected() ? 'Waiting for first tick…' : 'Connecting to WebSocket…');
          } else if (isLocalDesktopClient()) {
            const hint = await fetchIbkrLocalHint();
            setError(hint);
          } else {
            setError(e instanceof Error ? e.message : 'quote unavailable');
          }
        }
      }

      if (cancelled) return;

      const tasks: Promise<unknown>[] = [fetchCandles()];
      if (!lite && spot > 0) {
        tasks.push(fetchChain(spot), fetchNews());
      }
      await Promise.allSettled(tasks);

      if (!cancelled) {
        const hasPrice = spot > 0 || wsQuotePrice(symbol) > 0 || (quote?.price ?? 0) > 0;
        if (hasPrice) {
          hasQuoteRef.current = true;
          setLoading(false);
          setError(null);
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap on symbol/range change only
  }, [symbol, chartRange, lite, fetchQuoteRest, fetchCandles, fetchChain, fetchNews]);

  // Background refresh — never clears UI or sets loading.
  useEffect(() => {
    const pollMs =
      chartRange === '1D' ? 90_000 : chartRange === '1W' ? 120_000 : 180_000;
    const id = window.setInterval(() => {
      void fetchQuoteRest().catch(() => {});
      void fetchCandles();
      const spot = quote?.price ?? wsQuotePrice(symbol);
      if (!lite && spot > 0) void fetchChain(spot);
    }, pollMs);
    return () => window.clearInterval(id);
  }, [symbol, chartRange, lite, fetchQuoteRest, fetchCandles, fetchChain, quote?.price]);

  useEffect(() => {
    if (lite) return;
    const spot = quote?.price ?? wsQuotePrice(symbol);
    if (!spot) return;
    const id = window.setInterval(() => {
      void fetchChain(spot);
    }, OPTIONS_CHAIN_POLL_MS);
    return () => window.clearInterval(id);
  }, [lite, symbol, quote?.price, fetchChain]);

  const displayCandles = useMemo(() => {
    const mapWs = (rows: typeof wsCandles) =>
      rows.map((c) => ({
        t: typeof c.open_time === 'number' ? c.open_time : Date.parse(String(c.open_time)),
        o: c.open,
        h: c.high,
        l: c.low,
        c: c.close,
        v: c.volume,
        vwap: c.vwap ?? (c.open + c.close) / 2,
      }));

    if (chartRange === '1D') {
      const sourceBars = wsCandles.length ? mapWs(wsCandles) : candles;
      const filtered = filterExtendedDayCandles(sourceBars);
      return mergeLiveQuote(filtered.length ? filtered : sourceBars, quote);
    }
    return candles;
  }, [chartRange, wsCandles, candles, quote]);

  const spot = quote?.price ?? 0;
  const sessionOpen =
    quote?.sessionOpen ?? sessionOpenFromCandles(displayCandles) ?? undefined;
  const gex = useMemo(() => (chain.length ? computeGexFromChain(chain, spot) : []), [chain, spot]);
  const expirations = useMemo(() => chainExpirations(chain), [chain]);

  const wsLive = quote?.source === 'ibkr';

  return {
    quote,
    sessionOpen,
    candles: displayCandles,
    chain,
    gex,
    news,
    expirations,
    session,
    cardTheme: quoteCardTheme(session),
    loading: loading && !(quote?.price && quote.price > 0),
    error,
    wsConnected: wsOpen,
    source: quote?.source ?? source,
    live: Boolean(
      quote?.price &&
        (quote.streamSeq != null ||
          wsLive ||
          isWsConnected() ||
          quote.source?.includes('ibkr') ||
          source?.includes('ibkr')),
    ),
  };
}

export { RANGE_FETCH };
