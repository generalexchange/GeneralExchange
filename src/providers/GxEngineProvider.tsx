'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { GxSocketClient } from '@/lib/ws/GxSocketClient';
import { syncGxCandle, syncGxMarketData } from '@/lib/gx/syncGxToMarketState';
import { useGxStore } from '@/stores/gxStore';
import type { WsChannel } from '@gx/event-schema';

const DEFAULT_WS =
  process.env.NEXT_PUBLIC_GX_ENGINE_WS ?? 'ws://127.0.0.1:8765/ws';

type GxEngineContextValue = {
  client: GxSocketClient | null;
};

const GxEngineContext = createContext<GxEngineContextValue>({ client: null });

export function useGxEngine() {
  return useContext(GxEngineContext);
}

type Props = {
  children: React.ReactNode;
  url?: string;
  symbols?: readonly string[];
  channels?: readonly WsChannel[];
  enabled?: boolean;
};

export function GxEngineProvider({
  children,
  url = DEFAULT_WS,
  symbols = ['SPY', 'TSLA', 'META'],
  channels = ['md', 'candle', 'signal', 'portfolio', 'system'],
  enabled = true,
}: Props) {
  const clientRef = useRef<GxSocketClient | null>(null);
  const applyMarketData = useGxStore((s) => s.applyMarketData);
  const applyCandle = useGxStore((s) => s.applyCandle);
  const applyPortfolio = useGxStore((s) => s.applyPortfolio);
  const applySignal = useGxStore((s) => s.applySignal);
  const setConnectionStatus = useGxStore((s) => s.setConnectionStatus);

  const client = useMemo(() => {
    if (!enabled) return null;
    return new GxSocketClient({ url, symbols, channels });
  }, [enabled, url, symbols, channels]);

  useEffect(() => {
    if (!client) return;
    clientRef.current = client;

    const onConnected = () => setConnectionStatus('connected');
    const onDisconnected = () => setConnectionStatus('reconnecting');
    const onMd = (e: Parameters<typeof applyMarketData>[0]) => {
      applyMarketData(e);
      syncGxMarketData(e);
    };
    const onCandle = (e: Parameters<typeof applyCandle>[0]) => {
      applyCandle(e);
      syncGxCandle(e);
    };
    const onPortfolio = (e: Parameters<typeof applyPortfolio>[0]) => applyPortfolio(e);
    const onSignal = (e: Parameters<typeof applySignal>[0]) => applySignal(e);

    client.on('connected', onConnected);
    client.on('disconnected', onDisconnected);
    client.on('md', onMd);
    client.on('candle', onCandle);
    client.on('portfolio', onPortfolio);
    client.on('signal', onSignal);
    client.connect();

    return () => {
      client.off('connected', onConnected);
      client.off('disconnected', onDisconnected);
      client.off('md', onMd);
      client.off('candle', onCandle);
      client.off('portfolio', onPortfolio);
      client.off('signal', onSignal);
      client.disconnect();
      setConnectionStatus('disconnected');
    };
  }, [
    client,
    applyMarketData,
    applyCandle,
    applyPortfolio,
    applySignal,
    setConnectionStatus,
  ]);

  return (
    <GxEngineContext.Provider value={{ client: clientRef.current }}>
      {children}
    </GxEngineContext.Provider>
  );
}
