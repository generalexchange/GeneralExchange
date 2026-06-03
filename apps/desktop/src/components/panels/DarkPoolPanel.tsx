import React from 'react';
import { useSignalStore } from '@/stores/signalStore';
import { abbreviate, formatPrice, formatTimeShort } from '@/lib/format';

export const DarkPoolPanel: React.FC = () => {
  const prints = useSignalStore((s) => s.darkpool);

  return (
    <div className="flex max-h-44 min-h-0 flex-col">
      <p className="px-3 pt-2.5 pb-1 text-[10px] uppercase tracking-wider text-zinc-500">Dark pool prints</p>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
        {prints.length === 0 ? (
          <p className="text-[11px] text-zinc-600">No prints.</p>
        ) : (
          prints.map((p) => (
            <div key={p.id} className="flex items-center justify-between border-b border-white/[0.04] py-1 last:border-0">
              <span className="tabular text-[12px] text-zinc-200">{abbreviate(p.size)}</span>
              <span className="tabular text-[12px] text-zinc-400">{formatPrice(p.price)}</span>
              <div className="h-1.5 w-14 overflow-hidden rounded-sm bg-red-500/30">
                <div className="h-full bg-emerald-400/70" style={{ width: `${Math.round(p.buyRatio * 100)}%` }} />
              </div>
              <span className="tabular text-[10px] text-zinc-500">{formatTimeShort(p.at)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
