import React, { useEffect, useId, useState } from 'react';
import { X, Cpu, Database, Layers, SlidersHorizontal } from 'lucide-react';

export interface TradeEngineModalProps {
  open: boolean;
  onClose: () => void;
}

type ModuleId = 'ingest' | 'normalize' | 'signal' | 'risk' | 'route';

interface AlgoModule {
  id: ModuleId;
  label: string;
  description: string;
  enabled: boolean;
}

interface DatasetSlice {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const DEFAULT_MODULES: AlgoModule[] = [
  {
    id: 'ingest',
    label: 'Tape ingest',
    description: 'Top-of-book and trade prints → microstructure features.',
    enabled: true,
  },
  {
    id: 'normalize',
    label: 'Cross-venue normalize',
    description: 'Clock sync, currency, and session-aware scaling.',
    enabled: true,
  },
  {
    id: 'signal',
    label: 'Short-horizon signal',
    description: 'Ensemble drift + liquidity stress hooks (paper profile).',
    enabled: true,
  },
  {
    id: 'risk',
    label: 'Pre-trade risk mesh',
    description: 'Notional, concentration, and volatility gates.',
    enabled: true,
  },
  {
    id: 'route',
    label: 'Smart route stub',
    description: 'Venue selection preview — no live connectivity yet.',
    enabled: false,
  },
];

const DEFAULT_DATASETS: DatasetSlice[] = [
  { id: 'us-equity-liquid', label: 'US equity · liquid tier', description: 'Mock Tier-1 symbols', enabled: true },
  { id: 'us-options-ref', label: 'Options reference', description: 'Chain shape + greeks placeholders', enabled: true },
  { id: 'corp-actions', label: 'Corporate actions feed', description: 'Splits/dividends (simulated)', enabled: false },
  { id: 'alt-crypto-bridge', label: 'Cross-asset bridge', description: 'Disabled in paper desk', enabled: false },
];

export const TradeEngineModal: React.FC<TradeEngineModalProps> = ({ open, onClose }) => {
  const titleId = useId();
  const [modules, setModules] = useState<AlgoModule[]>(DEFAULT_MODULES);
  const [datasets, setDatasets] = useState<DatasetSlice[]>(DEFAULT_DATASETS);
  const [horizonMin, setHorizonMin] = useState(15);
  const [maxParticipation, setMaxParticipation] = useState(12);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const toggleModule = (id: ModuleId) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  };

  const toggleDataset = (id: string) => {
    setDatasets((prev) => prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d)));
  };

  const handleSave = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[min(92vh,860px)] w-full max-w-2xl flex-col rounded-t-2xl border border-white/[0.08] bg-[#0a0a0a] shadow-2xl shadow-black/50 sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.05]">
              <Layers className="h-5 w-5 text-zinc-300" aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-semibold text-white tracking-tight">
                Market trade engine
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Edit algorithm modules and datasets in a modular stack (front-end draft — no backend).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 space-y-6">
          <section aria-labelledby="te-params">
            <div className="mb-3 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-zinc-500" aria-hidden />
              <h3 id="te-params" className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Engine parameters
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <span className="text-[11px] font-medium text-zinc-500">Signal horizon (min)</span>
                <input
                  type="number"
                  min={1}
                  max={240}
                  value={horizonMin}
                  onChange={(e) => setHorizonMin(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/25"
                />
              </label>
              <label className="block rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <span className="text-[11px] font-medium text-zinc-500">Max participation (% ADV mock)</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={maxParticipation}
                  onChange={(e) => setMaxParticipation(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/25"
                />
              </label>
            </div>
          </section>

          <section aria-labelledby="te-algo">
            <div className="mb-3 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-zinc-500" aria-hidden />
              <h3 id="te-algo" className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Algorithm modules
              </h3>
            </div>
            <ul className="space-y-2">
              {modules.map((m, i) => (
                <li
                  key={m.id}
                  className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/15"
                >
                  <span className="font-mono text-[10px] text-zinc-500 tabular-nums pt-0.5 w-6">{String(i + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{m.label}</p>
                    <p className="mt-0.5 text-xs text-zinc-500 leading-relaxed">{m.description}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={m.enabled}
                    onClick={() => toggleModule(m.id)}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                      m.enabled ? 'bg-zinc-500' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        m.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                    <span className="sr-only">{m.enabled ? 'Disable' : 'Enable'} {m.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="te-data">
            <div className="mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-zinc-500" aria-hidden />
              <h3 id="te-data" className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Datasets
              </h3>
            </div>
            <ul className="space-y-2">
              {datasets.map((d) => (
                <li key={d.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={d.enabled}
                      onChange={() => toggleDataset(d.id)}
                      className="mt-1 rounded border-white/20 bg-black/40 text-zinc-200 accent-white focus:ring-white/30"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-white">{d.label}</span>
                      <span className="mt-0.5 block text-xs text-zinc-500">{d.description}</span>
                      <span className="mt-1 block font-mono text-[10px] text-zinc-600">{d.id}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-center text-[11px] text-zinc-600 pb-2">
            Changes apply to this session preview only until the engine API is connected.
          </p>
        </div>

        <div className="flex flex-shrink-0 flex-col-reverse gap-2 border-t border-white/10 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-black/30 hover:bg-zinc-200"
          >
            Save draft
          </button>
        </div>
      </div>
    </div>
  );
};
