import React from 'react';
import type { ModelId, ModelMeta } from './mockMlDashboardData';

interface ModelSelectorProps {
  models: ModelMeta[];
  selectedId: ModelId;
  onSelect: (id: ModelId) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ models, selectedId, onSelect }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_8px_40px_-20px_rgba(0,0,0,0.5)] p-5 sm:p-6">
      <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-400/90 mb-4">Model selection</p>
      <div className="space-y-3">
        {models.map((m) => {
          const selected = m.id === selectedId;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              className={`w-full text-left rounded-xl border px-4 py-3 transition-all duration-200 ${
                selected
                  ? 'border-violet-400/50 bg-violet-500/10 shadow-[0_0_24px_-8px_rgba(139,92,246,0.4)]'
                  : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white leading-snug">{m.name}</p>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{m.shortDescription}</p>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                    m.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/35'
                  }`}
                >
                  {m.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${selected ? 'bg-violet-400' : 'bg-zinc-600'}`}
                  aria-hidden
                />
                <span className="text-[11px] text-zinc-500">{selected ? 'Selected for charts & metrics' : 'Tap to load mock view'}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
