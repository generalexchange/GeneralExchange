/**
 * Restored homepage marketing blocks (pre–full-page redesign), used only inside homepage sections.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Layers } from 'lucide-react';
import { HOMEPAGE_PILLARS, EXECUTION_LOOP_STEPS, type PillarSection } from '@/data/homepageInstitutionalPillars';
import {
  IllustrationFrame,
  PillarMechanicsIllustration,
  PillarCardMechanicAccent,
  ExecutionLoopIllustration,
} from '@/components/homepage/HomepageMechanicsIllustrations';
const BAND = {
  bg00: '#ECE8E0',
  bg10: '#E3DDD2',
  wire: '#6b7c6e',
  border: 'rgba(46, 90, 58, 0.14)',
  text: '#1A1A1A',
  text60: '#4a4a48',
  text70: '#2f2f2d',
  plaque: '#F5F2EB',
} as const;

const fadeEase = [0.22, 1, 0.36, 1] as const;

function PillarCardTile({
  card,
  theme,
  index,
}: {
  card: PillarSection['cards'][0];
  theme: 'light' | 'dark';
  index: number;
}) {
  const isLight = theme === 'light';
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: fadeEase }}
      className={`flex h-full flex-col rounded-lg border p-5 transition-all duration-300 hover:border-institutional-green/35 sm:p-6 ${
        isLight
          ? 'shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
          : 'border-white/[0.08] bg-charcoal/60 text-neutral-100 shadow-none hover:bg-charcoal/80'
      }`}
      style={
        isLight
          ? {
              borderColor: BAND.border,
              backgroundColor: BAND.plaque,
              color: BAND.text,
            }
          : undefined
      }
    >
      <span
        className="mb-4 block h-px w-8 bg-institutional-green/60"
        style={isLight ? { backgroundColor: 'rgba(46, 90, 58, 0.45)' } : undefined}
        aria-hidden
      />
      <h3
        className={`mb-1 font-display text-lg font-normal tracking-tight sm:text-xl ${isLight ? '' : 'text-neutral-50'}`}
        style={isLight ? { color: BAND.text } : undefined}
      >
        {card.title}
      </h3>
      <PillarCardMechanicAccent index={index} theme={theme} />
      <p
        className={`mt-2 flex-1 text-sm font-normal leading-relaxed ${isLight ? '' : 'text-zinc-400'}`}
        style={isLight ? { color: BAND.text70 } : undefined}
      >
        {card.description}
      </p>
    </motion.article>
  );
}

export function getPillarById(id: string): PillarSection | undefined {
  return HOMEPAGE_PILLARS.find((p) => p.id === id);
}

/** Full pillar grid + mechanics illustration (renders as div for nesting inside section regions). */
export function PillarSectionEmbed({ pillar, index }: { pillar: PillarSection; index: number }) {
  const isLight = pillar.theme === 'light';
  const bgStyle = isLight ? { backgroundColor: index % 2 === 0 ? BAND.bg00 : BAND.bg10 } : { backgroundColor: undefined };

  return (
    <div
      id={pillar.id}
      className={`scroll-mt-[calc(3.75rem+1px)] rounded-xl border ${isLight ? 'border-white/[0.06]' : 'border-white/[0.08] bg-dark-gray/80 text-neutral-100'}`}
      style={isLight ? { ...bgStyle, color: BAND.text, borderColor: BAND.border } : undefined}
      aria-labelledby={`pillar-heading-${pillar.id}`}
    >
      <div className="mx-auto max-w-content layout-gutter py-10 sm:py-12">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,380px)] xl:grid-cols-[1fr_400px] xl:gap-12">
          <div className="min-w-0">
            <header className="mb-6 max-w-3xl sm:mb-8">
              <p
                className={`mb-2 text-xs font-semibold uppercase tracking-[0.16em] ${isLight ? '' : 'text-brass-deep'}`}
                style={isLight ? { color: BAND.text60 } : undefined}
              >
                {pillar.id === 'tokenized-compute' ? 'Tokenomics' : 'Capability pillar'}
              </p>
              <h2
                id={`pillar-heading-${pillar.id}`}
                className={`font-display text-xl font-normal leading-tight tracking-tight sm:text-2xl lg:text-[2rem] ${
                  isLight ? '' : 'text-neutral-50'
                }`}
                style={isLight ? { color: BAND.text } : undefined}
              >
                {pillar.title}
              </h2>
              {pillar.subtitle ? (
                <p
                  className={`mt-3 max-w-2xl text-sm font-normal leading-relaxed sm:text-base ${
                    isLight ? '' : 'text-zinc-400'
                  }`}
                  style={isLight ? { color: BAND.text70 } : undefined}
                >
                  {pillar.subtitle}
                </p>
              ) : null}
            </header>
            <div className="mb-6 lg:hidden">
              <IllustrationFrame
                theme={pillar.theme}
                title={`How ${pillar.title} works on the platform`}
                caption={pillar.mechanicsCaption}
              >
                <PillarMechanicsIllustration pillarId={pillar.id} theme={pillar.theme} />
              </IllustrationFrame>
            </div>
            <div
              className={`grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 ${
                pillar.cards.length >= 5 ? 'xl:grid-cols-3' : 'lg:grid-cols-2'
              } lg:gap-5`}
            >
              {pillar.cards.map((card, i) => (
                <PillarCardTile key={card.title} card={card} theme={pillar.theme} index={i} />
              ))}
            </div>
          </div>
          <aside className="hidden w-full self-start lg:block lg:sticky lg:top-[calc(3.75rem+1.25rem)]">
            <IllustrationFrame
              theme={pillar.theme}
              title={`How ${pillar.title} works on the platform`}
              caption={pillar.mechanicsCaption}
            >
              <PillarMechanicsIllustration pillarId={pillar.id} theme={pillar.theme} />
            </IllustrationFrame>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function HomepageExecutionLoopRestored() {
  return (
    <div
      id="deterministic-execution-loop"
      className="scroll-mt-[calc(3.75rem+1px)] rounded-xl border border-white/[0.08]"
      style={{ backgroundColor: BAND.bg10, color: BAND.text, borderColor: BAND.border }}
      aria-labelledby="execution-loop-heading"
    >
      <div className="mx-auto max-w-content layout-gutter py-10 sm:py-12">
        <header className="mb-8 max-w-3xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: BAND.text60 }}>
            Signature workflow
          </p>
          <h2
            id="execution-loop-heading"
            className="font-display text-xl font-medium leading-tight tracking-tight sm:text-2xl lg:text-[2.15rem]"
          >
            Deterministic Risk-First Execution Loop
          </h2>
          <p className="mt-3 text-sm font-light leading-relaxed sm:text-base" style={{ color: BAND.text70 }}>
            Every order is evaluated against live limits, scenario envelopes, and desk policies before release. Exposure is
            re-checked as fills update. Violations trigger automatic halts or approvals. The discipline mirrors internal systems
            used by BlackRock Aladdin and tier-one trading desks—adapted for tokenized compute and audit-ready evidence.
          </p>
        </header>
        <div
          className="mb-6 overflow-x-auto rounded-lg border p-4 sm:p-5"
          style={{ borderColor: BAND.border, backgroundColor: BAND.plaque }}
        >
          <ExecutionLoopIllustration />
        </div>
        <ol className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-5">
          {EXECUTION_LOOP_STEPS.map((step) => (
            <li
              key={step.step}
              className="flex flex-col rounded-lg border p-4 sm:p-5"
              style={{ borderColor: BAND.border, backgroundColor: BAND.plaque }}
            >
              <span
                className="mb-2 inline-block w-fit rounded-lg border px-2 py-1 font-mono text-xs tabular-nums tracking-widest"
                style={{ borderColor: BAND.wire, color: BAND.text60 }}
              >
                {step.step}
              </span>
              <h3 className="mb-1.5 font-display text-base font-medium sm:text-lg" style={{ color: BAND.text }}>
                {step.title}
              </h3>
              <p className="text-sm font-light leading-relaxed" style={{ color: BAND.text70 }}>
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function HomepageTrustCtaRestored() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto max-w-content layout-gutter py-10 sm:py-12">
        <div className="grid gap-8 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
              Bridge Observer · provenance
            </p>
            <h2 className="mt-2 font-display text-xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-2xl">
              Evidence-grade datasets from sentiment-scored news
            </h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-neutral-600 dark:text-neutral-400">
              Headlines and filings are scored for sentiment and structure, then materialized as versioned dataset modules—each
              with its own scope, lineage hash, and promotion path—so research, risk, and compliance can inspect or replay the
              same artifacts the desk trades on, not a one-off narrative dump.
            </p>
          </div>
          <div className="flex min-w-0 flex-col justify-between gap-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex gap-3">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-institutional-green" strokeWidth={1.5} aria-hidden />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-900 dark:text-neutral-100">
                    Policy-locked dataset promotion
                  </p>
                  <p className="mt-1.5 text-xs font-light leading-relaxed text-neutral-600 dark:text-neutral-400">
                    Sentiment-backed datasets only promote after the same checks as production alpha—no side-channel stack.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Layers className="mt-0.5 h-4 w-4 shrink-0 text-institutional-green" strokeWidth={1.5} aria-hidden />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-900 dark:text-neutral-100">
                    Modular dataset audit
                  </p>
                  <p className="mt-1.5 text-xs font-light leading-relaxed text-neutral-600 dark:text-neutral-400">
                    Each chunk carries its own ID tags and storage rules, so auditors and partners can verify what they need
                    without rebuilding the whole news history by hand.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <Link
                href="/bridge-observer"
                className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
              >
                Bridge Observer
              </Link>
              <Link
                href="/request-access"
                className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-transparent px-7 py-3.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-700/60"
              >
                Request access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Institutional pillars placed after the execution loop (History section). */
export function HomepageRemainingPillars() {
  const skip = new Set([
    'advanced-risk-scenario',
    'backtesting-research',
    'quant-research',
    'bridge-observer',
    'tokenized-compute',
    'execution-routing',
    'institutional-workflow',
    'governance-compliance',
    'premium-addons',
  ]);
  const rest = HOMEPAGE_PILLARS.filter((p) => !skip.has(p.id));
  return (
    <div className="mt-10 space-y-8">
      {rest.map((pillar, idx) => (
        <PillarSectionEmbed key={pillar.id} pillar={pillar} index={idx + 2} />
      ))}
    </div>
  );
}
