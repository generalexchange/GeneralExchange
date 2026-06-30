'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { getMarketSession, quoteCardTheme, type MarketSession } from '@/lib/marketSession';
import { filterExtendedDayCandles, sessionOpenFromCandles } from '@/lib/extendedHoursChart';
import type { Candle } from '@/components/dashboard/terminal/terminalData';
import type { NewsRow, OptionRow } from '@/components/dashboard/terminal/terminalData';

export type ChartRange = '1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y' | '5Y' | 'MAX';

const RANGE_FETCH: Record<ChartRange, { interval: string; limit: number }> = {
  '1D': { interval: '1m', limit: 960 },
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

function wsQuotePrice(sym: string): number {
  return getMarketState().quotes[sym]?.price ?? 0;
}

/** Pin the chart to the latest REST/WS quote when bar data is delayed. */
function mergeLiveQuote(candles: Candle[], quote: { price: number; prevClose?: number; timestamp?: number | string } | null): Candle[] {
  if (!quote?.price) return candles;
  const price = quote.price;
  const qt = quote.timestamp ? Number(quote.timestamp) : Date.now();
  const prev = quote.prevClose && quote.prevClose > 0 ? quote.prevClose : price;

  if (!candles.length) {
    // Robinhood-style line needs at least two points — open → now.
    const openMs = qt - 6.5 * 3_600_000;
    return [
      { t: openMs, o: prev, h: Math.max(prev, price), l: Math.min(prev, price), c: prev, v: 0, vwap: prev },
      { t: qt, o: prev, h: Math.max(prev, price), l: Math.min(prev, price), c: price, v: 0, vwap: price },
    ];
  }
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
    if (quote?.price && quote.price > 0) {
      setError(null);
      setLoading(false);
    }
  }, [quote?.price]);

  const fetchQuoteRest = useCallback(async () => {
    const res = await fetch(`/api/v1/quote/${symbol}`, { cache: 'no-store' });
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
    return q;
  }, [symbol]);

  // REST quote fallback only when stream has not delivered a price yet.
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
    const res = await fetch(`/api/v1/candles/${symbol}/${spec.interval}?limit=${spec.limit}`, {
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
    const res = await fetch(`/api/v1/options/chain/${symbol}`, { cache: 'no-store' });
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
    const res = await fetch(`/api/v1/news/${symbol}`, { cache: 'no-store' });
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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!quote?.price) setLoading(true);

      if (isMarketWsConfigured()) {
        const deadline = Date.now() + WS_WAIT_MS;
        while (!cancelled && Date.now() < deadline && wsQuotePrice(symbol) <= 0) {
          await sleep(250);
        }
      }

      let spot = wsQuotePrice(symbol) || quote?.price || 0;

      try {
        const q = await fetchQuoteRest();
        spot = q.price;
        if (!cancelled) setError(null);
      } catch (e) {
        if (!cancelled) {
          const wsPrice = wsQuotePrice(symbol);
          if (wsPrice > 0) {
            spot = wsPrice;
            setError(null);
          } else if (isMarketWsConfigured()) {
            setError(isWsConnected() ? 'Waiting for first tick…' : 'Connecting to WebSocket…');
          } else {
            setError(e instanceof Error ? e.message : 'quote unavailable');
          }
        }
      }

      if (cancelled) return;
      const tasks: Promise<unknown>[] = [];
      if (chartRange !== '1D' || wsCandles.length === 0) {
        tasks.push(fetchCandles());
      } else if (candles.length === 0) {
        tasks.push(fetchCandles());
      }
      if (!lite) {
        tasks.push(fetchChain(spot), fetchNews());
      }
      await Promise.allSettled(tasks);

      if (!cancelled) {
        const hasPrice = wsQuotePrice(symbol) > 0 || (quote?.price ?? 0) > 0;
        setLoading(!hasPrice);
        if (hasPrice) setError(null);
      }
    }

    load();
    const pollMs = chartRange === '1D' && wsCandles.length > 0 ? 120_000 : chartRange === '1D' ? 30_000 : 60_000;
    const id = window.setInterval(load, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [symbol, chartRange, lite, fetchQuoteRest, fetchCandles, fetchChain, fetchNews, quote?.price, wsCandles.length]);

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
    loading,
    error,
    wsConnected: wsOpen,
    source: quote?.source ?? source,
    live: Boolean(
      quote?.price &&
        (quote.streamSeq != null ||
          wsLive ||
          isWsConnected() ||
          quote.source?.includes('ibkr') ||
          source?.includes('ibkr') ||
          source === 'redis'),
    ),
  };
}

export { RANGE_FETCH };
