/**
 * Warehouse — immersive systems documentation page.
 *
 * Describes the platform's market-data intelligence + game-theory reasoning
 * layer as a deterministic pipeline: ingestion → standardization →
 * interpretation → analytical outputs, framed by a system-philosophy section.
 *
 * Institutional infrastructure tone. No marketing language. Layout reuses the
 * site design system (charcoal / brass / moss, tabular mono for figures).
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { legendHref } from '@/lib/legendUrl';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { SectionShell } from '@/components/homepage/SectionShell';

const easeLux = [0.22, 1, 0.36, 1] as const;

const panel =
  'rounded-lg border border-white/[0.08] bg-charcoal/60 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.55)]';
const panelHead =
  'flex items-center justify-between border-b border-white/[0.08] bg-white/[0.04] px-4 py-2.5';
const eyebrow = 'sc-serif text-[10px] text-zinc-400';

const btnPrimary =
  'inline-flex min-h-11 w-full items-center justify-center rounded-md bg-tan px-6 py-3 text-sm font-semibold tracking-wide text-charcoal shadow-[0_12px_40px_-12px_rgba(210,180,140,0.35)] transition-all duration-300 hover:bg-tan-muted active:scale-[0.99] sm:w-auto sm:min-w-[10.5rem] sm:px-8 sm:py-3.5';
const btnOutline =
  'inline-flex min-h-11 w-full items-center justify-center rounded-md border border-brass/50 bg-transparent px-6 py-3 text-sm font-semibold tracking-wide text-zinc-200 transition-colors hover:border-brass hover:bg-brass/5 hover:text-tan active:scale-[0.99] sm:w-auto sm:min-w-[10.5rem] sm:px-8 sm:py-3.5';

/* ------------------------------------------------------------------ */
/* Pipeline strip — ingest → standardize → interpret → outputs        */
/* ------------------------------------------------------------------ */

const PIPELINE = [
  { id: '01', label: 'Ingestion', detail: 'raw feeds in' },
  { id: '02', label: 'Standardization', detail: 'canonical schema' },
  { id: '03', label: 'Interpretation', detail: 'structured reasoning' },
  { id: '04', label: 'Outputs', detail: 'derived datasets' },
];

function PipelineStrip() {
  return (
    <div className={`${panel} overflow-hidden`}>
      <div className={panelHead}>
        <span className={eyebrow}>Warehouse pipeline · deterministic stages</span>
        <span className="font-mono text-[9px] text-zinc-500 tabular">reproducible</span>
      </div>
      <div className="grid gap-px bg-white/[0.06] sm:grid-cols-4">
        {PIPELINE.map((stage) => (
          <div key={stage.id} className="bg-charcoal/80 px-4 py-5">
            <p className="font-mono text-[10px] tabular text-tan">{stage.id}</p>
            <p className="mt-1 text-[13px] text-neutral-100">{stage.label}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-500">{stage.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section illustrations                                              */
/* ------------------------------------------------------------------ */

function IngestionIllustration() {
  return (
    <div className={`${panel} p-5 font-mono text-[12px]`}>
      <div className={`${panelHead} -mx-5 -mt-5 mb-4`}>
        <span className={eyebrow}>Ingestion · stream processing</span>
        <span className="text-[9px] text-moss">● live</span>
      </div>
      <div className="space-y-2.5">
        {[
          ['equities.taq', 'received', '1,284,002 msg/s'],
          ['options.opra', 'received', '742,118 msg/s'],
          ['flow.consolidated', 'normalizing', '— dedup 0.02%'],
          ['reference.symbology', 'reconciled', '— canonical map'],
        ].map(([feed, state, rate]) => (
          <div key={feed} className="flex items-center justify-between gap-3 border-b border-white/[0.05] pb-2 last:border-0 last:pb-0">
            <span className="text-zinc-300">{feed}</span>
            <span className="text-zinc-500">{state}</span>
            <span className="tabular text-moss">{rate}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-white/[0.06] pt-3 text-[11px] text-zinc-500">
        Inbound feeds are validated, deduplicated, and converted to internal formats on arrival.
      </p>
    </div>
  );
}

function StandardizationIllustration() {
  return (
    <div className={`${panel} overflow-hidden`}>
      <div className={panelHead}>
        <span className={eyebrow}>Canonical schema · instrument record</span>
        <span className="font-mono text-[9px] text-zinc-500 tabular">v · pinned</span>
      </div>
      <table className="w-full table-fixed text-left text-xs">
        <thead>
          <tr className="bg-white/[0.03] text-[9px] uppercase tracking-wider text-zinc-500">
            <th className="px-3 py-2 font-medium">Field</th>
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Rule</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.05]">
          {[
            ['instrument_id', 'canonical', 'stable across vendors'],
            ['event_time', 'utc_nanos', 'monotonic per stream'],
            ['symbol', 'normalized', 'corporate-action aware'],
            ['source_rev', 'lineage', 'point-in-time pinned'],
          ].map(([f, t, r]) => (
            <tr key={f}>
              <td className="px-3 py-2.5 font-mono tabular text-neutral-100">{f}</td>
              <td className="px-3 py-2.5 font-mono tabular text-zinc-400">{t}</td>
              <td className="px-3 py-2.5 text-zinc-400">{r}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InterpretationIllustration() {
  return (
    <div className={`${panel} overflow-hidden`}>
      <div className={panelHead}>
        <span className={eyebrow}>Interpretation · market structure state</span>
        <span className="rounded-full border border-moss/40 bg-moss/10 px-2 py-0.5 text-[9px] font-medium text-moss">
          INFERRED
        </span>
      </div>
      <div className="grid gap-px bg-white/[0.06] sm:grid-cols-2">
        <div className="bg-charcoal/80 p-4">
          <p className="mb-3 text-[9px] uppercase tracking-wider text-zinc-500">Flow interpretation</p>
          <div className="space-y-2.5 text-[12px]">
            {[
              ['Order-flow imbalance', '+0.34'],
              ['Liquidity depth', 'thinning'],
              ['Participant bias', 'accumulating'],
              ['Sweep pressure', 'building'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3">
                <span className="text-zinc-500">{k}</span>
                <span className="font-mono tabular text-zinc-300">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-charcoal/80 p-4">
          <p className="mb-3 text-[9px] uppercase tracking-wider text-zinc-500">Regime detection</p>
          <div className="space-y-2">
            {[
              ['Trend', 64],
              ['Volatility expansion', 41],
              ['Mean reversion', 28],
            ].map(([label, p]) => (
              <div key={label as string} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-[10px] text-zinc-400">{label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <div className="h-full rounded-full bg-brass" style={{ width: `${p}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right font-mono text-[10px] tabular text-zinc-300">{p as number}%</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-zinc-500">Probabilistic state, not a directional call.</p>
        </div>
      </div>
    </div>
  );
}

function OutputsIllustration() {
  return (
    <div className={`${panel} p-5 font-mono text-[12px]`}>
      <div className={`${panelHead} -mx-5 -mt-5 mb-4`}>
        <span className={eyebrow}>Analytical output · structured record</span>
        <span className="text-[9px] text-moss">● non-execution</span>
      </div>
      <pre className="overflow-x-auto leading-relaxed text-zinc-400">
        <span className="text-zinc-600">{'{'}</span>
        {'\n'}  <span className="text-zinc-300">{'"symbol"'}</span>: <span className="text-moss">{'"SPY"'}</span>,
        {'\n'}  <span className="text-zinc-300">{'"as_of"'}</span>: <span className="text-moss">{'"2026-06-03T13:45:11Z"'}</span>,
        {'\n'}  <span className="text-zinc-300">{'"regime"'}</span>: <span className="text-moss">{'"compressed_vol"'}</span>,
        {'\n'}  <span className="text-zinc-300">{'"flow_imbalance"'}</span>: <span className="text-tan">0.34</span>,
        {'\n'}  <span className="text-zinc-300">{'"classification"'}</span>: <span className="text-moss">{'"accumulation"'}</span>,
        {'\n'}  <span className="text-zinc-300">{'"source_rev"'}</span>: <span className="text-moss">{'"a3f9c1"'}</span>
        {'\n'}
        <span className="text-zinc-600">{'}'}</span>
      </pre>
      <p className="mt-4 border-t border-white/[0.06] pt-3 text-[11px] text-zinc-500">
        Derived signals and condition classifications for downstream evaluation — not order routing.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export const Warehouse: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/[0.06] bg-dark-gray">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_-15%,rgba(46,90,58,0.12),transparent_58%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_85%_85%,rgba(210,180,140,0.07),transparent_55%)]"
            aria-hidden
          />
          <div className="relative z-10 mx-auto w-full max-w-content layout-gutter py-16 sm:py-20 lg:py-28">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeLux }}
            >
              <p className="sc-serif mb-3 text-[11px] font-medium text-zinc-400 sm:text-xs">
                <span className="font-display text-[14px] not-italic tracking-[0.2em] text-tan/90">Systems</span>
                <span className="mx-2 text-zinc-600 sm:mx-3">/</span>
                <span className="text-zinc-400">Warehouse</span>
              </p>
              <h1 className="max-w-4xl text-pretty font-display text-[clamp(2rem,7vw,3.75rem)] font-normal leading-[1.05] tracking-[-0.02em] text-neutral-50">
                The structured market intelligence layer.
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-base font-normal leading-[1.75] text-zinc-400 sm:text-lg">
                The Warehouse is not a dashboard or a database overview. It is the system that turns raw market data into
                normalized, reproducible intelligence — and then reasons over that structure to describe how the market is
                actually behaving.
              </p>
              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
                <Link href={legendHref()} className={btnPrimary}>
                  Open the platform
                </Link>
                <Link href="/tradeengine" className={btnOutline}>
                  Trade Engine
                </Link>
              </div>
              <div className="mt-12">
                <PipelineStrip />
              </div>
            </motion.div>
          </div>
        </section>

        {/* I — Purpose */}
        <SectionShell
          tone="primary"
          eyebrowNum="I"
          eyebrowLabel="Purpose"
          ariaLabelledBy="wh-purpose"
          title={<span id="wh-purpose">A foundation for every downstream analysis.</span>}
          lede="The Warehouse is the platform's structured market intelligence layer. It transforms raw financial data into usable, normalized information and serves as the single foundation that every downstream analysis, classification, and interpretation is built on."
        >
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <div className="space-y-5">
              {[
                ['Single source', 'One governed record that downstream systems read from, instead of many divergent copies.'],
                ['Normalized by default', 'Raw observations are converted into consistent internal representations before use.'],
                ['Reproducible', 'A dataset defined today resolves to the same record when queried later.'],
              ].map(([h, b]) => (
                <div key={h} className="border-l-2 border-brass/40 pl-4">
                  <h3 className="sc-serif text-[13px] text-neutral-50">{h}</h3>
                  <p className="mt-1.5 text-[14px] leading-[1.7] text-zinc-400">{b}</p>
                </div>
              ))}
            </div>
            <PipelineStrip />
          </div>
        </SectionShell>

        {/* II — Ingestion */}
        <SectionShell
          tone="secondary"
          eyebrowNum="II"
          eyebrowLabel="Ingestion layer"
          ariaLabelledBy="wh-ingest"
          title={<span id="wh-ingest">Real-time ingestion, cleaned at the door.</span>}
          lede="External market data feeds are ingested in real time, standardized on arrival, and put through cleaning, deduplication, and normalization before anything else reads them. The result is a consistent internal format regardless of vendor-side differences."
        >
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <IngestionIllustration />
            <div className="space-y-5">
              {[
                ['Real-time feeds', 'Continuous capture of external market data as it is published.'],
                ['Cleaning & dedup', 'Malformed and duplicate records are removed before they can propagate.'],
                ['Format conversion', 'Every stream is mapped to consistent internal representations on arrival.'],
              ].map(([h, b]) => (
                <div key={h} className="border-l-2 border-brass/40 pl-4">
                  <h3 className="sc-serif text-[13px] text-neutral-50">{h}</h3>
                  <p className="mt-1.5 text-[14px] leading-[1.7] text-zinc-400">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionShell>

        {/* III — Standardization */}
        <SectionShell
          tone="primary"
          eyebrowNum="III"
          eyebrowLabel="Standardization layer"
          ariaLabelledBy="wh-standard"
          title={<span id="wh-standard">A canonical schema that holds over time.</span>}
          lede="Standardized data is mapped to a canonical schema for financial instruments, with explicit time-series consistency rules and symbol/asset normalization. The objective is reproducibility: the same dataset definition resolves to the same record, independent of vendor format drift."
        >
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="space-y-5">
              {[
                ['Canonical instruments', 'A stable instrument identity that survives vendor and symbol changes.'],
                ['Time-series consistency', 'Ordering and timestamp rules that keep history aligned across sources.'],
                ['Reproducible datasets', 'Point-in-time pinning so historical queries never silently change.'],
              ].map(([h, b]) => (
                <div key={h} className="border-l-2 border-brass/40 pl-4">
                  <h3 className="sc-serif text-[13px] text-neutral-50">{h}</h3>
                  <p className="mt-1.5 text-[14px] leading-[1.7] text-zinc-400">{b}</p>
                </div>
              ))}
            </div>
            <StandardizationIllustration />
          </div>
        </SectionShell>

        {/* IV — Game-theory interpretation (core) */}
        <SectionShell
          tone="secondary"
          eyebrowNum="IV"
          eyebrowLabel="Interpretation layer"
          ariaLabelledBy="wh-interpret"
          title={<span id="wh-interpret">Structured reasoning over market behavior.</span>}
          lede="This is the core of the Warehouse. Over the normalized record, the system models liquidity behavior, order-flow imbalance, and participant response, then detects regime — trend, volatility expansion, mean reversion — as a probabilistic read of market structure. It is a structured reasoning system, not storage."
        >
          <div className="mt-10">
            <InterpretationIllustration />
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {[
              ['Liquidity & flow', 'How depth forms and thins, and how order-flow imbalance shifts around levels.'],
              ['Participant behavior', 'Inference of accumulation, distribution, and forced versus chosen activity.'],
              ['Regime detection', 'Probabilistic classification of trend, volatility expansion, and mean reversion.'],
            ].map(([h, b]) => (
              <div key={h} className="border-l-2 border-brass/40 pl-4">
                <h3 className="sc-serif text-[13px] text-neutral-50">{h}</h3>
                <p className="mt-1.5 text-[14px] leading-[1.7] text-zinc-400">{b}</p>
              </div>
            ))}
          </div>
        </SectionShell>

        {/* V — Analytical outputs */}
        <SectionShell
          tone="primary"
          eyebrowNum="V"
          eyebrowLabel="Analytical outputs"
          ariaLabelledBy="wh-outputs"
          title={<span id="wh-outputs">Derived signals, ready for downstream reasoning.</span>}
          lede="The interpretation layer emits structured outputs: derived signals, computed features, and market-condition classifications. These feed trade-decision evaluation — explicitly non-execution — and the structured datasets that downstream reasoning depends on."
        >
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <OutputsIllustration />
            <div className="space-y-5">
              {[
                ['Derived signals & features', 'Computed measures produced from the normalized record.'],
                ['Condition classifications', 'Market states labeled for consistent downstream consumption.'],
                ['Decision evaluation', 'Inputs for evaluating trade decisions — without executing them.'],
              ].map(([h, b]) => (
                <div key={h} className="border-l-2 border-brass/40 pl-4">
                  <h3 className="sc-serif text-[13px] text-neutral-50">{h}</h3>
                  <p className="mt-1.5 text-[14px] leading-[1.7] text-zinc-400">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionShell>

        {/* VI — System philosophy */}
        <SectionShell
          tone="secondary"
          verticalRhythm="lastOnPage"
          eyebrowNum="VI"
          eyebrowLabel="System philosophy"
          ariaLabelledBy="wh-philosophy"
          title={<span id="wh-philosophy">Deterministic processing, separated cleanly from interpretation.</span>}
          lede="The Warehouse is built on deterministic processing and reproducibility. Raw data is preserved as raw data; interpreted layers are versioned separately; and every conclusion traces back along a defined transformation path. Structured reasoning is kept distinct from raw observation."
        >
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-center">
            <div className="space-y-5">
              {[
                ['Deterministic', 'The same inputs and definitions yield the same outputs, every time.'],
                ['Raw vs interpreted', 'Observation and inference are stored and versioned as distinct layers.'],
                ['Traceable', 'Every interpreted value resolves back to the source revision behind it.'],
              ].map(([h, b]) => (
                <div key={h} className="border-l-2 border-brass/40 pl-4">
                  <h3 className="sc-serif text-[13px] text-neutral-50">{h}</h3>
                  <p className="mt-1.5 text-[14px] leading-[1.7] text-zinc-400">{b}</p>
                </div>
              ))}
            </div>
            <div>
              <blockquote className="border-l-2 border-brass pl-5 text-pretty text-[15px] leading-[1.75] text-zinc-300 sm:text-base">
                Raw observation and structured interpretation are different things, and the Warehouse never lets them blur.
                Observation is preserved exactly as received; interpretation is a separate, versioned layer built on top of
                it. That separation is what makes a conclusion defensible — you can always walk it back to the data that
                produced it.
              </blockquote>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/request-access" className={btnPrimary}>
                  Request access
                </Link>
                <Link href="/our-story" className={btnOutline}>
                  Our story
                </Link>
              </div>
            </div>
          </div>
        </SectionShell>
      </div>

      <InstitutionalFooter />
    </div>
  );
};
