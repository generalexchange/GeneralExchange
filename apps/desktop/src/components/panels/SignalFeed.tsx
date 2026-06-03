import React from 'react';
import { useSignalStore } from '@/stores/signalStore';
import { formatTimeShort } from '@/lib/format';

const DIR_COLOR: Record<string, string> = {
  bullish: 'text-emerald-400 border-emerald-500/40',
  bearish: 'text-red-400 border-red-500/40',
  neutral: 'text-zinc-300 border-white/10',
};

export const SignalFeed: React.FC = () => {
  const signals = useSignalStore((s) => s.signals);

  if (signals.length === 0) {
    return <div className="flex h-full items-center justify-center text-xs text-zinc-600">No signals yet.</div>;
  }

  return (
    <div className="h-full overflow-y-auto px-3 py-2">
      {signals.map((s) => (
        <div key={s.id} className="flex items-start gap-3 border-b border-white/[0.04] py-2 last:border-0">
          <span className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${DIR_COLOR[s.direction]}`}>
            {s.direction}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[13px] text-neutral-100">{s.name}</p>
              <span className="tabular text-[11px] text-zinc-500">{Math.round(s.confidence * 100)}%</span>
            </div>
            <p className="mt-0.5 text-[12px] leading-snug text-zinc-400">{s.description}</p>
            <p className="mt-0.5 text-[10px] text-zinc-600">
              {s.strength} · {formatTimeShort(s.at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
