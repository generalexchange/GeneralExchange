import React from 'react';
import { useUiStore } from '@/stores/uiStore';

const LABEL: Record<string, string> = {
  connected: 'Live',
  connecting: 'Connecting',
  disconnecting: 'Disconnecting',
  disconnected: 'Offline',
};

export const ConnectionIndicator: React.FC = () => {
  const state = useUiStore((s) => s.connectionState);

  const dot =
    state === 'connected'
      ? 'bg-emerald-400'
      : state === 'disconnected'
        ? 'bg-red-500'
        : 'bg-amber-400 animate-pulse-dot';

  return (
    <div className="flex items-center gap-1.5" title={`Connection: ${LABEL[state]}`}>
      <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
      <span className="text-[11px] uppercase tracking-wider text-zinc-400">{LABEL[state]}</span>
    </div>
  );
};
