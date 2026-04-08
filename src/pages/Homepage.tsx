/**
 * Homepage — General.Exchange institutional capability overview
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { SEO } from '../components/SEO';
import { Hero } from '../components/Hero';
import { InstitutionalFooter } from '../components/InstitutionalFooter';
import {
  HOMEPAGE_TAGLINE,
  HOMEPAGE_PILLARS,
  EXECUTION_LOOP_STEPS,
  type PillarSection,
} from '../data/homepageInstitutionalPillars';

const BRIDGE_OBSERVER_ORIGIN = 'https://bridgeobserver.com';

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
      className={`rounded-sm border p-5 sm:p-6 h-full flex flex-col transition-all duration-300 hover:border-institutional-green/35 ${
        isLight ? 'shadow-[0_2px_12px_rgba(0,0,0,0.06)]' : 'bg-charcoal/80 border-white/[0.08] hover:bg-charcoal'
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
        className="block w-8 h-px mb-4 bg-institutional-green/60"
        style={isLight ? { backgroundColor: 'rgba(46, 90, 58, 0.45)' } : undefined}
        aria-hidden
      />
      <h3
        className={`font-display text-lg sm:text-xl tracking-tight mb-2 ${isLight ? '' : 'text-neutral-50'}`}
        style={isLight ? { color: BAND.text } : undefined}
      >
        {card.title}
      </h3>
      <p
        className={`text-sm leading-relaxed flex-1 font-light ${isLight ? '' : 'text-neutral-400'}`}
        style={isLight ? { color: BAND.text70 } : undefined}
      >
        {card.description}
      </p>
    </motion.article>
  );
}

function PillarSectionBlock({ pillar, index }: { pillar: PillarSection; index: number }) {
  const isLight = pillar.theme === 'light';
  const bgStyle = isLight ? { backgroundColor: index % 2 === 0 ? BAND.bg00 : BAND.bg10 } : { backgroundColor: undefined };

  return (
    <section
      id={pillar.id}
      className={`scroll-mt-[calc(3.75rem+1px)] border-b ${isLight ? '' : 'bg-dark-gray border-white/[0.06]'}`}
      style={isLight ? { ...bgStyle, color: BAND.text, borderColor: BAND.border } : undefined}
      aria-labelledby={`pillar-heading-${pillar.id}`}
    >
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-16 lg:py-20">
        <header className="max-w-3xl mb-10 sm:mb-12">
          <p
            className={`text-xs font-semibold tracking-[0.16em] uppercase mb-3 ${isLight ? '' : 'text-tan'}`}
            style={isLight ? { color: BAND.text60 } : undefined}
          >
            Capability pillar
          </p>
          <h2
            id={`pillar-heading-${pillar.id}`}
            className={`font-display text-2xl sm:text-3xl lg:text-[2.35rem] leading-[1.1] font-medium tracking-tight ${
              isLight ? '' : 'text-neutral-50'
            }`}
            style={isLight ? { color: BAND.text } : undefined}
          >
            {pillar.title}
          </h2>
          {pillar.subtitle ? (
            <p
              className={`mt-4 text-sm sm:text-base leading-relaxed max-w-2xl font-light ${
                isLight ? '' : 'text-neutral-400'
              }`}
              style={isLight ? { color: BAND.text70 } : undefined}
            >
              {pillar.subtitle}
            </p>
          ) : null}
        </header>
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${pillar.cards.length >= 5 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4 sm:gap-5 lg:gap-6`}
        >
          {pillar.cards.map((card, i) => (
            <PillarCardTile key={card.title} card={card} theme={pillar.theme} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <SEO
        title="General.Exchange — Institutional Risk, Research, and Execution"
        description="Institutional-grade risk, research, and execution on tokenized compute. Lubbock.Cloud integration, AMD-optimized GPU workloads, deterministic risk-first execution."
        keywords="institutional trading, tokenized compute, Lubbock.Cloud, risk engine, backtesting, Bridge Observer, General.Exchange"
        canonical="https://generalexchange.com/"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'General.Exchange',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        }}
      />
      <Navbar showSearch={false} />

      <div className="pt-14 sm:pt-[3.75rem]">
        <Hero />

        {/* Positioning strip */}
        <section
          className="border-b py-6 sm:py-8"
          style={{ backgroundColor: BAND.bg00, borderColor: BAND.border, color: BAND.text }}
        >
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10 text-center sm:text-left">
            <p className="font-display text-lg sm:text-xl md:text-2xl font-medium leading-snug tracking-tight">{HOMEPAGE_TAGLINE}</p>
            <p className="mt-3 text-sm max-w-3xl mx-auto sm:mx-0 leading-relaxed font-light" style={{ color: BAND.text70 }}>
              Integrates deeply with Lubbock.Cloud tokenized compute, AMD-optimized GPU workloads for risk and research,
              and a deterministic, regulator-safe, risk-first execution loop.
            </p>
          </div>
        </section>

        {HOMEPAGE_PILLARS.map((pillar, idx) => (
          <PillarSectionBlock key={pillar.id} pillar={pillar} index={idx} />
        ))}

        {/* Deterministic risk-first execution loop */}
        <section
          id="deterministic-execution-loop"
          className="border-b scroll-mt-[calc(3.75rem+1px)]"
          style={{ backgroundColor: BAND.bg10, color: BAND.text, borderColor: BAND.border }}
          aria-labelledby="execution-loop-heading"
        >
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20">
            <header className="max-w-3xl mb-10">
              <p className="text-xs font-semibold tracking-[0.16em] uppercase mb-3" style={{ color: BAND.text60 }}>
                Signature workflow
              </p>
              <h2
                id="execution-loop-heading"
                className="font-display text-2xl sm:text-3xl lg:text-[2.35rem] font-medium tracking-tight leading-tight"
              >
                Deterministic Risk-First Execution Loop
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed font-light" style={{ color: BAND.text70 }}>
                Every order is evaluated against live limits, scenario envelopes, and desk policies before release.
                Exposure is re-checked as fills update. Violations trigger automatic halts or approvals. The discipline
                mirrors internal systems used by BlackRock Aladdin and tier-one trading desks—adapted for tokenized
                compute and audit-ready evidence.
              </p>
            </header>
            <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 list-none p-0 m-0">
              {EXECUTION_LOOP_STEPS.map((step) => (
                <li
                  key={step.step}
                  className="rounded-sm border p-5 flex flex-col"
                  style={{ borderColor: BAND.border, backgroundColor: BAND.plaque }}
                >
                  <span
                    className="font-mono text-xs tabular-nums tracking-widest mb-3 px-2 py-1 rounded-sm border inline-block w-fit"
                    style={{ borderColor: BAND.wire, color: BAND.text60 }}
                  >
                    {step.step}
                  </span>
                  <h3 className="font-display text-lg font-medium mb-2" style={{ color: BAND.text }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed font-light" style={{ color: BAND.text70 }}>
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Bridge Observer CTA */}
        <section className="bg-dark-gray border-b border-white/[0.06] py-12 sm:py-16">
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="font-display text-xl sm:text-2xl text-neutral-50 tracking-tight">Bridge Observer</h2>
              <p className="text-sm text-neutral-400 mt-2 max-w-xl leading-relaxed">
                From news sentiment to event alerts and headline-to-trade pipelines—wired into the same risk and execution
                fabric.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/bridge-observer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-sm bg-tan text-charcoal text-sm font-semibold hover:bg-tan-muted transition-colors"
              >
                Open intelligence feed
              </Link>
              <a
                href={BRIDGE_OBSERVER_ORIGIN}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-sm border border-white/[0.12] text-sm font-semibold text-neutral-200 hover:bg-white/[0.05] transition-colors"
              >
                bridgeobserver.com
              </a>
            </div>
          </div>
        </section>

        {/* Trust + CTA */}
        <section className="border-b" style={{ backgroundColor: BAND.bg00, color: BAND.text, borderColor: BAND.border }}>
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20">
            <div
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 p-8 sm:p-10 rounded-sm border shadow-[0_8px_40px_-20px_rgba(46,90,58,0.12)]"
              style={{ borderColor: BAND.border, backgroundColor: BAND.plaque }}
            >
              <div className="flex flex-wrap items-center gap-x-10 gap-y-4" style={{ color: BAND.text70 }}>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0 text-institutional-green" strokeWidth={1.5} aria-hidden />
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase">Regulated-environment ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-institutional-green" strokeWidth={1.5} aria-hidden />
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase">Attestation & lineage by default</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold rounded-sm transition-colors border border-institutional-green text-institutional-green bg-transparent hover:bg-institutional-green/10"
                >
                  Access platform
                </Link>
                <Link
                  to="/request-access"
                  className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold rounded-sm transition-colors bg-institutional-green text-white hover:bg-institutional-green-muted"
                >
                  Speak with us
                </Link>
              </div>
            </div>
          </div>
        </section>

        <InstitutionalFooter />
      </div>
    </div>
  );
};
