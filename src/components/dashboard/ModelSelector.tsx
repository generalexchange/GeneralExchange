import React from 'react';
import type { ModelId, ModelMeta } from './mockMlDashboardData';

interface ModelSelectorProps {
  models: ModelMeta[];
  selectedId: ModelId;
  onSelect: (id: ModelId) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ models, selectedId, onSelect }) => {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5 sm:p-6 transition-all duration-300 hover:border-white/10">
      <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-500 mb-4">Model selection</p>
      <div className="space-y-3">
        {models.map((m) => {
          const selected = m.id === selectedId;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              className={`w-full text-left rounded-xl border px-4 py-3 transition-all duration-500 ease-out hover:scale-[1.01] active:scale-[0.99] ${
                selected
                  ? 'border-white/25 bg-white/[0.06] ring-1 ring-white/20 ring-offset-2 ring-offset-[#080808]'
                  : 'border-white/[0.06] bg-black/30 hover:border-white/10 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white leading-snug">{m.name}</p>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{m.shortDescription}</p>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                    m.status === 'active'
                      ? 'bg-white/10 text-zinc-200 border border-white/15'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-700/50'
                  }`}
                >
                  {m.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${selected ? 'bg-zinc-300' : 'bg-zinc-700'}`}
                  aria-hidden
                />
                <span className="text-[11px] text-zinc-600">
                  {selected ? 'Selected for charts & metrics' : 'Tap to load mock view'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
