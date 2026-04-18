'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookMarked, FileJson2, Layers3, LineChart } from 'lucide-react';

const easeLuxury = [0.22, 1, 0.36, 1] as const;

const sectionItem = {
  variants: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.48, ease: easeLuxury },
    },
  },
};

const ENTRIES = [
  {
    id: 'run-ledger',
    title: 'Run ledger · Q1 paper',
    meta: 'Manifest v0.4 · 12 sessions',
    icon: LineChart,
  },
  {
    id: 'model-bundle',
    title: 'Model bundle · ensemble edge',
    meta: 'XGBoost + light GBM · pinned',
    icon: Layers3,
  },
  {
    id: 'playbook',
    title: 'Playbook · open only',
    meta: 'Rules export · JSON',
    icon: FileJson2,
  },
] as const;

export function LibraryDashboardTab() {
  return (
    <div className="space-y-8 sm:space-y-10">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easeLuxury }}
        className="max-w-2xl"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Library</p>
        <h1 className="mt-2 font-display text-2xl font-medium tracking-tight text-white sm:text-3xl">
          Saved runs, bundles, and exports
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          Everything you pin from the desk shows up here—mock entries for now, same shell as the rest of the dashboard.
        </p>
      </motion.header>

      <motion.ul
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.06 },
          },
        }}
      >
        {ENTRIES.map((e) => {
          const Icon = e.icon;
          return (
            <motion.li
              key={e.id}
              variants={sectionItem.variants}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-tan/85">
                  <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-100">{e.title}</p>
                  <p className="mt-1 text-[11px] leading-snug text-zinc-500">{e.meta}</p>
                </div>
              </div>
            </motion.li>
          );
        })}
      </motion.ul>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeLuxury, delay: 0.2 }}
        className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] px-4 py-8 text-center sm:px-8"
        aria-labelledby="library-empty-hint"
      >
        <BookMarked className="mx-auto h-8 w-8 text-zinc-600" strokeWidth={1.25} aria-hidden />
        <h2 id="library-empty-hint" className="mt-4 text-sm font-medium text-zinc-400">
          Pin from the chart or analytics modals when those hooks land
        </h2>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-zinc-600">
          This grid is static mock data so the Library tab reads as part of the product shell, not a dead route.
        </p>
      </motion.section>
    </div>
  );
}
