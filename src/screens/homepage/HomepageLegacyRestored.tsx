/**
 * Restored homepage marketing blocks (pre–full-page redesign), used only inside homepage sections.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import {
  HOMEPAGE_TAGLINE,
  HOMEPAGE_PILLARS,
  EXECUTION_LOOP_STEPS,
  type PillarSection,
} from '@/data/homepageInstitutionalPillars';
import {
  IllustrationFrame,
  PillarMechanicsIllustration,
  PillarCardMechanicAccent,
  PositioningIntegrationDiagram,
  ExecutionLoopIllustration,
  BridgeObserverCtaIllustration,
  TrustLineageIllustration,
} from '@/components/homepage/HomepageMechanicsIllustrations';

export const BRIDGE_OBSERVER_ORIGIN = 'https://bridgeobserver.com';

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
        isLight ? 'shadow-[0_2px_12px_rgba(0,0,0,0.06)]' : 'border-white/[0.08] bg-charcoal/80 hover:bg-charcoal'
      }`}
      style={
        isLight
          ? {
              borderColor: BAND.border,
              backgroundColor: BAND.plaque,
              color: BAND.text,
            }
          : { borderColor: 'rgba(255,255,255,0.08)' }
      }
    >
      <span
        className="mb-4 block h-px w-8 bg-institutional-green/60"
        style={isLight ? { backgroundColor: 'rgba(46, 90, 58, 0.45)' } : undefined}
        aria-hidden
      />
      <h3
        className={`mb-1 font-display text-lg tracking-tight sm:text-xl ${isLight ? '' : 'text-neutral-50'}`}
        style={isLight ? { color: BAND.text } : undefined}
      >
        {card.title}
      </h3>
      <PillarCardMechanicAccent index={index} theme={theme} />
      <p
        className={`mt-2 flex-1 text-sm font-light leading-relaxed ${isLight ? '' : 'text-neutral-400'}`}
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
      className={`scroll-mt-[calc(3.75rem+1px)] rounded-xl border border-white/[0.06] ${isLight ? '' : 'bg-dark-gray/50'}`}
      style={isLight ? { ...bgStyle, color: BAND.text, borderColor: BAND.border } : undefined}
      aria-labelledby={`pillar-heading-${pillar.id}`}
    >
      <div className="mx-auto max-w-content px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,380px)] xl:grid-cols-[1fr_400px] xl:gap-12">
          <div className="min-w-0">
            <header className="mb-6 max-w-3xl sm:mb-8">
              <p
                className={`mb-2 text-xs font-semibold uppercase tracking-[0.16em] ${isLight ? '' : 'text-tan'}`}
                style={isLight ? { color: BAND.text60 } : undefined}
              >
                Capability pillar
              </p>
              <h2
                id={`pillar-heading-${pillar.id}`}
                className={`font-display text-xl font-medium leading-tight tracking-tight sm:text-2xl lg:text-[2rem] ${
                  isLight ? '' : 'text-neutral-50'
                }`}
                style={isLight ? { color: BAND.text } : undefined}
              >
                {pillar.title}
              </h2>
              {pillar.subtitle ? (
                <p
                  className={`mt-3 max-w-2xl text-sm font-light leading-relaxed sm:text-base ${
                    isLight ? '' : 'text-neutral-400'
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

export function HomepagePositioningStrip() {
  return (
    <div
      className="border-y py-8 sm:py-10 lg:py-12"
      style={{ backgroundColor: BAND.bg00, borderColor: BAND.border, color: BAND.text }}
    >
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_minmax(280px,1fr)] lg:gap-12">
          <div className="text-center sm:text-left">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: BAND.text60 }}>
              {HOMEPAGE_TAGLINE.split(' — ')[0]}
            </p>
            <p className="mt-2 font-display text-lg font-medium leading-snug tracking-tight sm:text-xl md:text-2xl">
              {HOMEPAGE_TAGLINE.includes(' — ') ? HOMEPAGE_TAGLINE.split(' — ').slice(1).join(' — ') : HOMEPAGE_TAGLINE}
            </p>
            <p className="mx-auto mt-3 max-w-3xl text-sm font-light leading-relaxed sm:mx-0" style={{ color: BAND.text70 }}>
              Tokenized accelerator capacity on dedicated GPU paths feeds one deterministic, risk-first loop—from research
              through execution and audit.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: BAND.text60 }}>
              Integration plane
            </p>
          </div>
          <div className="rounded-lg border p-4 sm:p-5" style={{ borderColor: BAND.border, backgroundColor: BAND.plaque }}>
            <PositioningIntegrationDiagram theme="light" />
          </div>
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
      <div className="mx-auto max-w-content px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
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

export function HomepageBridgeObserverRestored() {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-dark-gray py-10 sm:py-12">
      <div className="mx-auto flex max-w-content flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-center">
          <BridgeObserverCtaIllustration />
          <div>
            <h2 className="font-display text-xl tracking-tight text-neutral-50 sm:text-2xl">Bridge Observer</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-400">
              From news sentiment to event alerts and headline-to-trade pipelines—wired into the same risk and execution fabric.
            </p>
            <p className="mt-3 font-mono text-xs text-neutral-500">NLP → event bus → shared risk / SOR adapters</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Link
            href="/bridge-observer"
            className="inline-flex items-center justify-center rounded-lg bg-tan px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-tan-muted"
          >
            Open intelligence feed
          </Link>
          <a
            href={BRIDGE_OBSERVER_ORIGIN}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-white/[0.12] px-6 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/[0.05]"
          >
            bridgeobserver.com
          </a>
        </div>
      </div>
    </div>
  );
}

export function HomepageTrustCtaRestored() {
  return (
    <div className="rounded-xl border border-white/[0.08]" style={{ backgroundColor: BAND.bg00, color: BAND.text, borderColor: BAND.border }}>
      <div className="mx-auto max-w-content px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
        <div
          className="flex flex-col gap-8 rounded-lg border p-6 shadow-[0_8px_40px_-20px_rgba(46,90,58,0.12)] sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10"
          style={{ borderColor: BAND.border, backgroundColor: BAND.plaque }}
        >
          <div className="w-full shrink-0 lg:max-w-[320px]">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: BAND.text60 }}>
              Lineage &amp; duties
            </p>
            <TrustLineageIllustration />
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3" style={{ color: BAND.text70 }}>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 shrink-0 text-institutional-green" strokeWidth={1.5} aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-[0.15em]">Regulated-environment ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-institutional-green" strokeWidth={1.5} aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-[0.15em]">Attestation &amp; lineage by default</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-institutional-green bg-transparent px-7 py-3.5 text-sm font-semibold text-institutional-green transition-colors hover:bg-institutional-green/10"
            >
              Access platform
            </Link>
            <Link
              href="/request-access"
              className="inline-flex items-center justify-center rounded-lg bg-institutional-green px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-institutional-green-muted"
            >
              Speak with us
            </Link>
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
    'execution-routing',
    'institutional-workflow',
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
