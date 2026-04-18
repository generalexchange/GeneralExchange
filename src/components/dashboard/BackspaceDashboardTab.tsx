'use client';

import React, { useId, useState } from 'react';
import { motion } from 'framer-motion';
import { Eraser, Sparkles } from 'lucide-react';

const easeLuxury = [0.22, 1, 0.36, 1] as const;

export function BackspaceDashboardTab() {
  const scratchId = useId();
  const [draft, setDraft] = useState('');

  return (
    <div className="space-y-8 sm:space-y-10">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easeLuxury }}
        className="max-w-2xl"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">BackSpace</p>
        <h1 className="mt-2 font-display text-2xl font-medium tracking-tight text-white sm:text-3xl">
          Scratch tape for hypotheses
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          Ephemeral notes and rough numbers—nothing here is persisted (browser session only). Same charcoal workspace as
          Dashboard and Library.
        </p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeLuxury, delay: 0.05 }}
        className="rounded-2xl border border-white/[0.08] bg-[#080808] p-4 sm:p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={scratchId} className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            <Sparkles className="h-3.5 w-3.5 text-tan/70" aria-hidden />
            Live scratch
          </label>
          <button
            type="button"
            onClick={() => setDraft('')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-200"
          >
            <Eraser className="h-3.5 w-3.5" aria-hidden />
            Clear
          </button>
        </div>
        <textarea
          id={scratchId}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={12}
          placeholder="Drop a symbol thesis, size ladder, or reminder…"
          className="w-full resize-y rounded-xl border border-white/[0.06] bg-black/40 px-3 py-3 font-mono text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-700 outline-none ring-institutional-green/15 focus:border-white/[0.12] focus:ring-2"
        />
        <p className="mt-3 text-[11px] text-zinc-600">
          Refreshing the page clears this buffer—BackSpace is intentionally lightweight.
        </p>
      </motion.div>
    </div>
  );
}
