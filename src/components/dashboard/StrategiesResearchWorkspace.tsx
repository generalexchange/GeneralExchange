'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  FileJson,
  FileSpreadsheet,
  MessageSquare,
  Plus,
  Upload,
} from 'lucide-react';
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
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(320);
  const dragRef = useRef<{ startX: number; startW: number } | null>(null);
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

  const onResizeMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current) return;
    const dx = dragRef.current.startX - e.clientX;
    const next = Math.min(480, Math.max(260, dragRef.current.startW + dx));
    setChatWidth(next);
  }, []);

  const onResizeUp = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener('mousemove', onResizeMove);
    window.removeEventListener('mouseup', onResizeUp);
  }, [onResizeMove]);

  const onResizeDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startW: chatWidth };
    window.addEventListener('mousemove', onResizeMove);
    window.addEventListener('mouseup', onResizeUp);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', onResizeMove);
      window.removeEventListener('mouseup', onResizeUp);
    };
  }, [onResizeMove, onResizeUp]);

  const sectionItem = {
    variants: {
      hidden: { opacity: 0, y: 16 },
      show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeLuxury } },
    },
  };

  return (
    <div className="relative">
      <section className="mb-6 border-b border-white/[0.06] pb-5" aria-labelledby="research-workspace-title">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-institutional-green/90 mb-1.5">
          Research
        </p>
        <h1 id="research-workspace-title" className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
          Strategies
        </h1>
        <p className="text-sm text-zinc-500 mt-1.5 max-w-3xl leading-relaxed">
          Datasets first, then the full mock research stack. Chat is optional — open when you want assistant context.
        </p>
      </section>

      <div className="flex flex-col xl:flex-row xl:items-stretch xl:gap-0">
        <div className="min-w-0 flex-1 xl:pr-0">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Dataset library</p>
              <button
                type="button"
                onClick={newDataset}
                className="shrink-0 rounded-sm border border-institutional-green/45 bg-institutional-green/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-tan hover:bg-institutional-green/30 transition-colors"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
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
              className="w-full border-b border-dashed border-white/[0.12] bg-white/[0.02] px-4 py-8 sm:px-6 sm:py-10 text-center transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-institutional-green/30 focus-visible:ring-inset"
            >
              <Upload className="mx-auto h-8 w-8 text-zinc-500 mb-3" strokeWidth={1.25} aria-hidden />
              <p className="text-sm font-medium text-zinc-200">Drop a dataset or click to browse</p>
              <p className="text-xs text-zinc-500 mt-1.5">
                Supports .csv, .json, .parquet — or connect QuantConnect payload
              </p>
            </button>

            <ul className="divide-y divide-white/[0.06]" role="list">
              {library.map((row) => {
                const selected = row.id === activeDatasetId;
                return (
                  <li key={row.id}>
                    <div
                      className={`flex items-center gap-3 px-4 py-3 sm:px-5 transition-colors ${
                        selected ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveDatasetId(row.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <FileIcon kind={row.kind} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-zinc-200 truncate">{row.name}</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5 tabular-nums">
                            Loaded {row.loadedAt} · {formatRows(row.rows)} rows
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => runDataset(row.id)}
                        className="shrink-0 rounded-sm border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-300 hover:border-institutional-green/40 hover:bg-institutional-green/15 hover:text-tan transition-colors"
                      >
                        Run
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <AnimatePresence initial={false}>
            {active ? (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: easeLuxury }}
                className="mt-6 overflow-hidden"
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

        {/* Desktop: resizable chat aside */}
        <AnimatePresence>
          {chatOpen ? (
            <motion.aside
              key="chat-aside"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.28, ease: easeLuxury }}
              style={{ width: chatWidth }}
              className="relative hidden shrink-0 xl:flex xl:flex-col min-h-[520px] max-h-[calc(100vh-6rem)] sticky top-20 self-start border border-white/[0.08] rounded-2xl overflow-hidden ml-5 mt-0"
            >
              <button
                type="button"
                aria-label="Resize chat panel"
                onMouseDown={onResizeDown}
                className="absolute left-0 top-0 bottom-0 z-10 w-1.5 cursor-col-resize rounded-l hover:bg-institutional-green/25"
              />
              <div className="flex h-full min-h-0 min-w-0 flex-1 pl-1.5">
                <StrategyAssistantChat inset />
              </div>
            </motion.aside>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Mobile / tablet: slide-over chat */}
      <AnimatePresence>
        {chatOpen ? (
          <motion.div
            key="chat-overlay"
            className="fixed inset-0 z-[95] xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close chat" onClick={() => setChatOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm border-l border-white/[0.1] shadow-2xl"
            >
              <StrategyAssistantChat onClose={() => setChatOpen(false)} embedded />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Toggle chat — does not cover metrics by default */}
      <button
        type="button"
        onClick={() => setChatOpen((o) => !o)}
        className={`fixed bottom-6 right-6 z-[90] flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition-all ${
          chatOpen
            ? 'border-white/20 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            : 'border-institutional-green/45 bg-institutional-green/20 text-tan hover:bg-institutional-green/30'
        }`}
        aria-expanded={chatOpen}
        aria-label={chatOpen ? 'Close strategy assistant' : 'Open strategy assistant'}
      >
        <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
      </button>
    </div>
  );
}
