/**
 * Pricing — immersive showcase for the two-layer pricing structure:
 * workspace entitlements (subscription) + tokenized compute (usage).
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { SectionShell } from '@/components/homepage/SectionShell';
import { TokenCard } from '@/components/TokenCard';
import { COMPUTE_TOKENS } from '@/data/computeTokens';

const easeLux = [0.22, 1, 0.36, 1] as const;
const panel = 'rounded-lg border border-white/[0.08] bg-charcoal/65';
const btnPrimary =
  'inline-flex min-h-11 w-full items-center justify-center rounded-md bg-tan px-6 py-3 text-sm font-semibold tracking-wide text-charcoal shadow-[0_12px_40px_-12px_rgba(210,180,140,0.35)] transition-all duration-300 hover:bg-tan-muted active:scale-[0.99] sm:w-auto sm:min-w-[10.5rem] sm:px-8 sm:py-3.5';
const btnOutline =
  'inline-flex min-h-11 w-full items-center justify-center rounded-md border border-brass/50 bg-transparent px-6 py-3 text-sm font-semibold tracking-wide text-zinc-200 transition-colors hover:border-brass hover:bg-brass/5 hover:text-tan active:scale-[0.99] sm:w-auto sm:min-w-[10.5rem] sm:px-8 sm:py-3.5';

const PLANS = [
  {
    name: 'Starter',
    description: 'Individual researchers and systematic traders',
    monthlyPrice: 49,
    annualPrice: 470,
    features: [
      { name: 'Token wallet & usage ledger', included: true },
      { name: 'Backtesting sandbox (shared pool)', included: true },
      { name: 'Rockefeller digest', included: true },
      { name: 'Email support', included: true },
      { name: 'Dedicated premium GPU lanes', included: false },
      { name: 'Custom risk model templates', included: false },
      { name: 'API orchestration', included: false },
    ],
    popular: false,
  },
  {
    name: 'Professional',
    description: 'Desks running continuous simulation and training',
    monthlyPrice: 149,
    annualPrice: 1430,
    features: [
      { name: 'Everything in Starter', included: true },
      { name: 'Priority token allocation', included: true },
      { name: 'Monte Carlo grid quotas', included: true },
      { name: 'Strategy builder exports', included: true },
      { name: 'API access (standard)', included: true },
      { name: 'Dedicated account liaison', included: false },
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'Institutions with governance and SLA requirements',
    monthlyPrice: 499,
    annualPrice: 4790,
    features: [
      { name: 'Everything in Professional', included: true },
      { name: 'Private capacity envelopes', included: true },
      { name: 'Full API & webhook fabric', included: true },
      { name: 'Evidence & attestation exports', included: true },
      { name: '24/7 operations bridge', included: true },
      { name: 'Custom enterprise compute integration', included: true },
    ],
    popular: false,
  },
] as const;

function PricingStructureIllustration() {
  return (
    <div className={`${panel} overflow-hidden font-mono text-[12px]`}>
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.04] px-4 py-2.5">
        <span className="sc-serif text-[10px] text-zinc-400">Billing model · two layers</span>
        <span className="text-[9px] text-moss">● transparent</span>
      </div>
      <div className="grid gap-px bg-white/[0.06] sm:grid-cols-2">
        <div className="bg-charcoal/80 p-4">
          <p className="text-[9px] uppercase tracking-wider text-zinc-500">Layer 1 · Workspace</p>
          <p className="mt-2 text-neutral-100">Fixed monthly / annual entitlement</p>
          <p className="mt-2 text-zinc-400">Platform access, support tier, API limits, sandbox quotas</p>
        </div>
        <div className="bg-charcoal/80 p-4">
          <p className="text-[9px] uppercase tracking-wider text-zinc-500">Layer 2 · Compute tokens</p>
          <p className="mt-2 text-neutral-100">Usage-based GPU-hour consumption</p>
          <p className="mt-2 text-zinc-400">Backtests, Monte Carlo, training — billed per token tier</p>
        </div>
      </div>
      <p className="border-t border-white/[0.08] px-4 py-3 text-[11px] text-zinc-500">
        You subscribe to a workspace plan, then draw down compute tokens as workloads run. No hidden bundling.
      </p>
    </div>
  );
}

function PlanCard({
  plan,
  billingCycle,
}: {
  plan: (typeof PLANS)[number];
  billingCycle: 'monthly' | 'annual';
}) {
  const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  const savings =
    billingCycle === 'annual'
      ? Math.round(((plan.monthlyPrice * 12 - plan.annualPrice) / (plan.monthlyPrice * 12)) * 100)
      : 0;

  return (
    <div
      className={`relative flex h-full flex-col rounded-lg border p-6 sm:p-8 ${
        plan.popular ? 'border-tan/40 shadow-[0_0_40px_-12px_rgba(210,180,140,0.2)]' : 'border-white/[0.08]'
      } bg-dark-gray/60`}
    >
      {plan.popular ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-md bg-tan px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-charcoal">
          Recommended
        </span>
      ) : null}
      <h3 className="font-display text-2xl text-neutral-50">{plan.name}</h3>
      <p className="mt-2 text-sm text-zinc-500">{plan.description}</p>
      <div className="mt-6">
        <span className="font-display text-4xl tabular-nums text-neutral-50 sm:text-5xl">${price}</span>
        <span className="ml-2 text-zinc-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
        {billingCycle === 'annual' ? (
          <p className="mt-1 text-sm text-moss">Save {savings}% vs monthly</p>
        ) : null}
      </div>
      <Link
        href="/login"
        className={`mt-6 block w-full rounded-md py-3 text-center text-sm font-semibold transition-colors ${
          plan.popular
            ? 'bg-tan text-charcoal hover:bg-tan-muted'
            : 'border border-white/[0.1] bg-white/[0.04] text-neutral-200 hover:border-brass/40 hover:text-tan'
        }`}
      >
        Start trial
      </Link>
      <ul className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature.name} className="flex items-start gap-3">
            {feature.included ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" strokeWidth={1.75} />
            ) : (
              <X className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" strokeWidth={1.5} />
            )}
            <span className={`text-sm ${feature.included ? 'text-zinc-300' : 'text-zinc-600'}`}>{feature.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [networkSelection, setNetworkSelection] = useState<'solana' | 'polygon'>('solana');

  const networkFee =
    networkSelection === 'solana'
      ? '$0.0001 – $0.005 per transaction'
      : '$0.001 – $0.01 per transaction';

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
          <div className="relative z-10 mx-auto w-full max-w-content layout-gutter py-16 sm:py-20 lg:py-28">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeLux }}
            >
              <p className="sc-serif mb-3 text-[11px] font-medium text-zinc-400 sm:text-xs">
                <span className="font-display text-[14px] not-italic tracking-[0.2em] text-tan/90">Platform</span>
                <span className="mx-2 text-zinc-600 sm:mx-3">/</span>
                <span className="text-zinc-400">Pricing</span>
              </p>
              <h1 className="max-w-4xl text-pretty font-display text-[clamp(2rem,7vw,3.75rem)] font-normal leading-[1.05] tracking-[-0.02em] text-neutral-50">
                Two layers. One transparent structure.
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-base font-normal leading-[1.75] text-zinc-400 sm:text-lg">
                General Exchange pricing separates what you pay to access the platform from what you pay to run compute.
                Workspace plans cover entitlements — backtesting access, API limits, support, and governance. Compute
                tokens cover GPU-hour consumption for training, inference, Monte Carlo, and risk grids.
              </p>
              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
                <Link href="/login" className={btnPrimary}>
                  Start free trial
                </Link>
                <Link href="/request-access" className={btnOutline}>
                  Enterprise inquiry
                </Link>
              </div>
              <div className="mt-12">
                <PricingStructureIllustration />
              </div>
            </motion.div>
          </div>
        </section>

        {/* I — How it works */}
        <SectionShell
          tone="primary"
          eyebrowNum="I"
          eyebrowLabel="Structure"
          ariaLabelledBy="pricing-structure"
          title={<span id="pricing-structure">Workspace entitlement plus usage-based compute.</span>}
          lede="Every account starts with a workspace plan that defines platform access, support tier, and quota envelopes. On top of that, compute workloads draw from tokenized GPU capacity priced per hour. You always know what is fixed and what scales with usage."
        >
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {[
              ['Workspace plans', 'Monthly or annual subscriptions that unlock platform features, sandboxes, and API access.'],
              ['Compute tokens', 'GPU-hour units consumed when backtests, Monte Carlo grids, or training jobs run.'],
              ['Settlement', 'Token purchases settle on-chain with transparent network fees — no opaque markup layers.'],
            ].map(([title, body]) => (
              <div key={title} className="border-l-2 border-brass/40 pl-4">
                <h3 className="sc-serif text-[13px] text-neutral-50">{title}</h3>
                <p className="mt-1.5 text-[14px] leading-[1.7] text-zinc-400">{body}</p>
              </div>
            ))}
          </div>
        </SectionShell>

        {/* II — Workspace plans */}
        <SectionShell
          tone="secondary"
          eyebrowNum="II"
          eyebrowLabel="Workspace plans"
          ariaLabelledBy="pricing-plans"
          title={<span id="pricing-plans">Choose the entitlement tier that matches your desk.</span>}
          lede="All workspace plans include a 14-day trial. Annual billing saves roughly 20% compared to monthly. Upgrade paths are designed so individual researchers can grow into desk-scale and institutional deployments without changing platforms."
        >
          <div className="mb-8 inline-flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.08] bg-charcoal/60 p-1.5">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-tan text-charcoal'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-tan text-charcoal'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Annual
              <span className="ml-2 rounded border border-moss/30 bg-moss/10 px-1.5 py-0.5 text-[10px] text-moss">
                ~20% off
              </span>
            </button>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <PlanCard key={plan.name} plan={plan} billingCycle={billingCycle} />
            ))}
          </div>
        </SectionShell>

        {/* III — Compute tokens */}
        <SectionShell
          tone="primary"
          eyebrowNum="III"
          eyebrowLabel="Compute tokens"
          ariaLabelledBy="pricing-tokens"
          title={<span id="pricing-tokens">GPU capacity priced per hour, not per seat.</span>}
          lede="Compute tokens represent tokenized GPU capacity across three accelerator tiers. You purchase tokens into your wallet and draw them down as workloads execute. Pricing is listed per GPU-hour so backtest and simulation costs stay auditable."
        >
          <div className="grid gap-6 md:grid-cols-3">
            {COMPUTE_TOKENS.map((token, i) => (
              <TokenCard key={token.symbol} token={token} index={i} />
            ))}
          </div>
          <div className="mt-10 overflow-x-auto rounded-lg border border-white/[0.08]">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03]">
                  <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Token</th>
                  <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-zinc-500">GPU</th>
                  <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-zinc-500">HBM</th>
                  <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Workloads</th>
                  <th className="px-4 py-3 text-right text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Unit price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {COMPUTE_TOKENS.map((row) => (
                  <tr key={row.symbol}>
                    <td className="px-4 py-3.5 font-mono tabular text-neutral-100">{row.symbol}</td>
                    <td className="px-4 py-3.5 text-zinc-400">{row.gpu}</td>
                    <td className="px-4 py-3.5 text-zinc-400">{row.hbm}</td>
                    <td className="px-4 py-3.5 text-zinc-400">{row.workloads.join('; ')}</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-display text-lg tabular-nums text-tan">{row.pricePerUnit}</span>
                      <span className="block text-[11px] text-zinc-500">{row.unitLabel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionShell>

        {/* IV — Settlement */}
        <SectionShell
          tone="secondary"
          eyebrowNum="IV"
          eyebrowLabel="Settlement & usage"
          ariaLabelledBy="pricing-settlement"
          title={<span id="pricing-settlement">Token purchases settle on-chain with published fee bands.</span>}
          lede="Compute token purchases can settle over supported networks. Fee bands are published upfront so finance teams can model total cost of ownership. Usage is tracked in a wallet ledger tied to your workspace account."
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <div className="space-y-5">
              {[
                ['Usage ledger', 'Every GPU-hour drawdown is recorded against your token wallet with run-level attribution.'],
                ['Network choice', 'Select Solana or Polygon settlement depending on your treasury and ops preferences.'],
                ['No hidden markup', 'Network fees are pass-through; compute pricing is the listed token rate.'],
              ].map(([title, body]) => (
                <div key={title} className="border-l-2 border-brass/40 pl-4">
                  <h3 className="sc-serif text-[13px] text-neutral-50">{title}</h3>
                  <p className="mt-1.5 text-[14px] leading-[1.7] text-zinc-400">{body}</p>
                </div>
              ))}
            </div>
            <div className={panel}>
              <div className="border-b border-white/[0.08] bg-white/[0.04] px-4 py-2.5">
                <p className="sc-serif text-[10px] text-zinc-400">Settlement network · fee band</p>
              </div>
              <div className="p-4">
                <div className="mb-4 inline-flex rounded-lg border border-white/[0.08] p-1">
                  <button
                    type="button"
                    onClick={() => setNetworkSelection('solana')}
                    className={`rounded-md px-4 py-2 text-sm transition-colors ${
                      networkSelection === 'solana'
                        ? 'bg-moss/15 text-tan border border-moss/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Solana
                  </button>
                  <button
                    type="button"
                    onClick={() => setNetworkSelection('polygon')}
                    className={`rounded-md px-4 py-2 text-sm transition-colors ${
                      networkSelection === 'polygon'
                        ? 'bg-moss/15 text-tan border border-moss/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Polygon
                  </button>
                </div>
                <p className="font-mono text-[13px] text-zinc-300">{networkFee}</p>
                <p className="mt-3 text-[12px] leading-relaxed text-zinc-500">
                  Figures are representative bands. Final settlement routing follows your workspace configuration and
                  treasury policy.
                </p>
              </div>
            </div>
          </div>
        </SectionShell>

        {/* V — Enterprise */}
        <SectionShell
          tone="primary"
          verticalRhythm="lastOnPage"
          eyebrowNum="V"
          eyebrowLabel="Enterprise"
          ariaLabelledBy="pricing-enterprise"
          title={<span id="pricing-enterprise">Custom capacity envelopes for institutions.</span>}
          lede="Enterprise accounts receive private GPU pools, SLA-backed support, evidence exports for audit, and custom integration with existing risk and compliance systems. Pricing is scoped to workload profile and governance requirements."
        >
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <blockquote className="border-l-2 border-brass pl-5 text-pretty text-[15px] leading-[1.75] text-zinc-300 sm:text-base">
              Most desks start on Professional and move to Enterprise when they need dedicated capacity, attestation
              exports, or a 24/7 operations bridge. We scope enterprise pricing to your actual compute envelope — not
              a generic per-seat multiplier.
            </blockquote>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link href="/request-access" className={btnPrimary}>
                Request access
              </Link>
              <Link href="/help-center" className={btnOutline}>
                Contact support
              </Link>
            </div>
          </div>
        </SectionShell>
      </div>

      <InstitutionalFooter />
    </div>
  );
};
