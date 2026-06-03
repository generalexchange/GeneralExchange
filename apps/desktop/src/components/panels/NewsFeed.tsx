import React from 'react';
import { useSignalStore } from '@/stores/signalStore';
import { formatTimeShort } from '@/lib/format';

const DOT: Record<string, string> = {
  positive: 'bg-emerald-400',
  neutral: 'bg-zinc-500',
  negative: 'bg-red-400',
};

export const NewsFeed: React.FC = () => {
  const news = useSignalStore((s) => s.news);

  return (
    <div className="flex min-h-0 flex-1 flex-col border-b border-white/[0.06]">
      <p className="px-3 pt-2.5 pb-1 text-[10px] uppercase tracking-wider text-zinc-500">News</p>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
        {news.length === 0 ? (
          <p className="text-[11px] text-zinc-600">No headlines.</p>
        ) : (
          news.map((n) => (
            <div key={n.id} className="border-b border-white/[0.04] py-1.5 last:border-0">
              <div className="flex items-start gap-1.5">
                <span className={`mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${DOT[n.sentiment]}`} />
                <div className="min-w-0">
                  <p className="text-[12px] leading-snug text-zinc-200">{n.headline}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-500">
                    {n.source} · {formatTimeShort(n.at)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
