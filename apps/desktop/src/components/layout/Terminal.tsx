import React, { useCallback, useEffect, useState } from 'react';
import { Header } from './Header';
import { TerminalLayout } from './TerminalLayout';
import { UpdateBanner } from '@/components/shared/UpdateBanner';
import { Toaster } from '@/components/shared/Toaster';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useMarketStore } from '@/stores/marketStore';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useRegimeStore } from '@/stores/regimeStore';
import { useToast } from '@/hooks/useToast';
import { usePriceStream } from '@/hooks/usePriceStream';
import { wsManager } from '@/services/websocket';
import { marketApi } from '@/api/market';
import { portfolioApi } from '@/api/portfolio';
import { tradingApi } from '@/api/trading';
import { authApi } from '@/api/auth';
import { Topics, WATCHLIST_DEFAULT } from '@/lib/constants';
import { clearStoredAuth, isTourCompleted } from '@/lib/tauri';
import type { WatchRow } from '@/components/grids/WatchlistGrid';
import type { TradeRecord, TradeLifecycleEvent } from '@/types/trading';

interface Props {
  version: string;
}

function seedWatchlist(): WatchRow[] {
  return WATCHLIST_DEFAULT.map((symbol) => ({ symbol, last: 0, changePct: 0, spark: [] }));
}

export const Terminal: React.FC<Props> = ({ version }) => {
  const symbol = useUiStore((s) => s.activeSymbol);
  const interval = useUiStore((s) => s.activeInterval);
  const setSymbol = useUiStore((s) => s.setActiveSymbol);
  const userEmail = useAuthStore((s) => s.user?.email ?? null);
  const clearSession = useAuthStore((s) => s.clearSession);
  const { toast } = useToast();

  const [watchlist] = useState<WatchRow[]>(seedWatchlist);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [helpToken, setHelpToken] = useState(0);
  const [autoRunTour] = useState(() => !isTourCompleted());

  // Drive the active symbol's live streams.
  usePriceStream(symbol, interval);

  // Connect once; subscribe the account-level topics; toast on trade events.
  useEffect(() => {
    wsManager.connect();
    const unsubPortfolio = wsManager.subscribe(Topics.portfolio, () => {});
    const unsubTrades = wsManager.subscribe(Topics.trades, (payload) => {
      const evt = payload as TradeLifecycleEvent;
      toast({ kind: evt.kind === 'rejected' ? 'error' : 'success', title: `Trade ${evt.kind}`, message: evt.message });
      portfolioApi.state().then((p) => usePortfolioStore.getState().setPortfolio(p)).catch(() => {});
      tradingApi.history().then(setTrades).catch(() => {});
    });
    return () => {
      unsubPortfolio();
      unsubTrades();
    };
  }, [toast]);

  // Initial account-level fetch (fired once on mount).
  useEffect(() => {
    portfolioApi.state().then((p) => usePortfolioStore.getState().setPortfolio(p)).catch(() => {});
    tradingApi.history().then(setTrades).catch(() => {});
  }, []);

  // Parallel symbol data load on symbol/interval change (Promise.all per spec).
  useEffect(() => {
    const ctrl = new AbortController();
    const { signal } = ctrl;
    Promise.all([
      marketApi.candles(symbol, interval, signal).then((c) => useMarketStore.getState().setCandles(c)).catch(() => {}),
      marketApi.chain(symbol, signal).then((c) => useMarketStore.getState().applyChainSnapshot(c)).catch(() => {}),
      marketApi.gex(symbol, signal).then((g) => useMarketStore.getState().setGex(g)).catch(() => {}),
      marketApi.regime(symbol, signal).then((r) => useRegimeStore.getState().setRegime(r)).catch(() => {}),
    ]).catch(() => {});
    return () => ctrl.abort();
  }, [symbol, interval]);

  const onLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    await clearStoredAuth();
    wsManager.disconnect();
    clearSession();
  }, [clearSession]);

  const onHelp = useCallback(() => setHelpToken((t) => t + 1), []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Header version={version} userEmail={userEmail} onHelp={onHelp} onLogout={onLogout} />
      <UpdateBanner />
      <TerminalLayout watchlist={watchlist} trades={trades} activeSymbol={symbol} onSelectSymbol={setSymbol} />
      <OnboardingTour runToken={helpToken} autoRun={autoRunTour} />
      <Toaster />
    </div>
  );
};
