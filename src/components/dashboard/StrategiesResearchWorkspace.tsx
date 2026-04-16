'use client';

import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, FileJson, FileSpreadsheet, Plus, Upload } from 'lucide-react';
import { IntelligenceStatusBar } from './IntelligenceStatusBar';
import { MlExecutionStack, type MlExecutionStackProps } from './MlExecutionStack';
import { StrategyAssistantChat } from './StrategyAssistantChat';
import type { IntelligenceRibbonProps } from './mockMlDashboardData';

const easeLuxury = [0.22, 1, 0.36, 1] as const;

type MockDataset = {
  id: string;
  name: string;
  loadedAt: string;
  rows: number;
  kind: 'csv' | 'json' | 'parquet';
};

const INITIAL_LIBRARY: MockDataset[] = [
  { id: 'ds-1', name: 'spy_intraday_2024_q1.csv', loadedAt: '2026-04-02', rows: 58_432, kind: 'csv' },
  { id: 'ds-2', name: 'qc_backtest_payload.json', loadedAt: '2026-04-08', rows: 12_904, kind: 'json' },
  { id: 'ds-3', name: 'options_chain_apr.parquet', loadedAt: '2026-04-11', rows: 204_800, kind: 'parquet' },
  { id: 'ds-4', name: 'macro_factors_daily.csv', loadedAt: '2026-04-12', rows: 8_760, kind: 'csv' },
];

function formatRows(n: number): string {
  return n.toLocaleString();
}

function FileIcon({ kind }: { kind: MockDataset['kind'] }) {
  const cls = 'h-4 w-4 text-zinc-500 shrink-0';
  if (kind === 'json') return <FileJson className={cls} strokeWidth={1.5} aria-hidden />;
  return <FileSpreadsheet className={cls} strokeWidth={1.5} aria-hidden />;
}

export type StrategiesResearchWorkspaceProps = MlExecutionStackProps & {
  intelligenceRibbon: IntelligenceRibbonProps;
};

export function StrategiesResearchWorkspace({
  intelligenceRibbon,
  ...ml
}: StrategiesResearchWorkspaceProps) {
  const [library, setLibrary] = useState<MockDataset[]>(INITIAL_LIBRARY);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const active = library.find((d) => d.id === activeDatasetId) ?? null;

  const onDropZoneClick = () => fileInputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const id = `ds-${Date.now()}`;
    const ext = f.name.split('.').pop()?.toLowerCase();
    const kind: MockDataset['kind'] =
      ext === 'json' ? 'json' : ext === 'parquet' ? 'parquet' : 'csv';
    setLibrary((prev) => [
      {
        id,
        name: f.name,
        loadedAt: new Date().toISOString().slice(0, 10),
        rows: Math.floor(5000 + Math.random() * 90000),
        kind,
      },
      ...prev,
    ]);
    setActiveDatasetId(id);
    setWorkspaceOpen(true);
    e.target.value = '';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    const ext = f.name.split('.').pop()?.toLowerCase();
    const kind: MockDataset['kind'] =
      ext === 'json' ? 'json' : ext === 'parquet' ? 'parquet' : 'csv';
    const id = `ds-${Date.now()}`;
    setLibrary((prev) => [
      {
        id,
        name: f.name,
        loadedAt: new Date().toISOString().slice(0, 10),
        rows: Math.floor(5000 + Math.random() * 90000),
        kind,
      },
      ...prev,
    ]);
    setActiveDatasetId(id);
    setWorkspaceOpen(true);
  };

  const newDataset = () => {
    onDropZoneClick();
  };

  const runDataset = (id: string) => {
    setActiveDatasetId(id);
    setWorkspaceOpen(true);
  };

  const sectionItem = {
    variants: {
      hidden: { opacity: 0, y: 16 },
      show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeLuxury } },
    },
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Side-by-side on large screens so library + assistant fit without long vertical scroll */}
      <div className="grid min-h-0 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 lg:items-stretch lg:gap-4 lg:h-[min(58dvh,620px)] lg:min-h-[300px]">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] lg:h-full">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2 sm:px-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:text-xs sm:tracking-[0.18em]">
              Dataset library
            </p>
            <button
              type="button"
              onClick={newDataset}
              className="shrink-0 rounded-lg border border-institutional-green/45 bg-institutional-green/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-tan hover:bg-institutional-green/30 transition-colors sm:px-2.5 sm:py-1.5 sm:text-[11px]"
            >
              <span className="inline-flex items-center gap-1">
                <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2} aria-hidden />
                New Dataset
              </span>
            </button>
          </div>

          <input ref={fileInputRef} type="file" accept=".csv,.json,.parquet" className="hidden" onChange={onFileChange} />

          <button
            type="button"
            onClick={onDropZoneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            className="w-full shrink-0 border-b border-dashed border-white/[0.12] bg-white/[0.02] px-3 py-4 text-center transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-institutional-green/30 focus-visible:ring-inset sm:px-4 sm:py-5"
          >
            <Upload className="mx-auto mb-1.5 h-5 w-5 text-zinc-500 sm:mb-2 sm:h-6 sm:w-6" strokeWidth={1.25} aria-hidden />
            <p className="text-xs font-medium text-zinc-200 sm:text-sm">Drop a dataset or click to browse</p>
            <p className="mt-0.5 text-[10px] leading-snug text-zinc-500 sm:text-xs sm:mt-1">
              .csv, .json, .parquet — or QuantConnect payload
            </p>
          </button>

          <ul
            className="min-h-0 max-h-[min(36vh,220px)] flex-1 divide-y divide-white/[0.06] overflow-y-auto overscroll-contain lg:max-h-none"
            role="list"
          >
            {library.map((row) => {
              const selected = row.id === activeDatasetId;
              return (
                <li key={row.id}>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 transition-colors sm:gap-3 sm:px-4 ${
                      selected ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveDatasetId(row.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left sm:gap-2.5"
                    >
                      <FileIcon kind={row.kind} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-zinc-200 sm:text-sm">{row.name}</p>
                        <p className="mt-0.5 text-[10px] tabular-nums text-zinc-500 sm:text-[11px]">
                          {row.loadedAt} · {formatRows(row.rows)} rows
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => runDataset(row.id)}
                      className="shrink-0 rounded-lg border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-300 hover:border-institutional-green/40 hover:bg-institutional-green/15 hover:text-tan transition-colors sm:px-2.5 sm:py-1.5 sm:text-[11px]"
                    >
                      Run
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a]/90 lg:h-full">
          <StrategyAssistantChat stacked />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {active ? (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: easeLuxury }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-white/[0.08] bg-[#090909]/80 overflow-hidden">
              <button
                type="button"
                onClick={() => setWorkspaceOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-5 text-left hover:bg-white/[0.03] transition-colors"
                aria-expanded={workspaceOpen}
              >
                <div className="flex min-w-0 items-center gap-2">
                  {workspaceOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                  )}
                  <span className="text-sm font-semibold text-white truncate">{active.name}</span>
                  <span className="text-[11px] text-zinc-500 shrink-0 tabular-nums">· {formatRows(active.rows)} rows</span>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 shrink-0">
                  Metrics workspace
                </span>
              </button>
              <AnimatePresence initial={false}>
                {workspaceOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: easeLuxury }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/[0.06] px-3 py-4 sm:px-4 sm:py-5 space-y-8">
                      <motion.div {...sectionItem}>
                        <IntelligenceStatusBar key={ml.selectedModel} {...intelligenceRibbon} />
                      </motion.div>
                      <MlExecutionStack {...ml} />
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
