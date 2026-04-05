/**
 * Compute tokens & workspace plans — General Exchange / Lubbock.cloud
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { SEO } from '../components/SEO';
import { TokenCard } from '../components/TokenCard';
import { COMPUTE_TOKENS } from '../data/computeTokens';
import { Check, X } from 'lucide-react';

export const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [networkSelection, setNetworkSelection] = useState<'solana' | 'polygon'>('solana');

  const plans = [
    {
      name: 'Starter',
      description: 'Individual researchers and systematic traders',
      monthlyPrice: 49,
      annualPrice: 470,
      features: [
        { name: 'Token wallet & usage ledger', included: true },
        { name: 'Backtesting sandbox (shared pool)', included: true },
        { name: 'Bridge Observer digest', included: true },
        { name: 'Email support', included: true },
        { name: 'Dedicated MI-class lanes', included: false },
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
        { name: 'Custom Lubbock.cloud integration', included: true },
      ],
      popular: false,
    },
  ];

  const getPrice = (plan: (typeof plans)[0]) => (billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice);

  const getSavings = (plan: (typeof plans)[0]) => {
    const monthlyTotal = plan.monthlyPrice * 12;
    const savings = monthlyTotal - plan.annualPrice;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    return { amount: savings, percentage };
  };

  const selectedNetworkFee =
    networkSelection === 'solana'
      ? '$0.0001 - $0.005 per transaction'
      : '$0.001 - $0.01 per transaction';

  return (
    <div className="min-h-screen bg-charcoal text-neutral-100">
      <SEO
        title="Compute Tokens — General Exchange"
        description="LUB-MI300X, LUB-MI325X, and LUB-MI355X tokenized AMD compute for training, inference, and Monte Carlo—priced per GPU-hour."
        keywords="compute tokens, AMD MI300X, tokenized GPU, Lubbock.cloud, trading compute, General Exchange"
        canonical="https://generalexchange.com/pricing"
      />
      <Navbar showSearch={false} />

      <div className="pt-14 sm:pt-16">
        <section className="relative overflow-hidden border-b border-white/[0.06] py-20 sm:py-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(46,90,58,0.15),transparent_55%)]" />
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10 relative">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-tan mb-4">Lubbock.cloud</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-neutral-50 mb-6">
              Compute tokens
            </h1>
            <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl leading-relaxed font-light">
              AMD-only tokenized GPU capacity for training, inference, Monte Carlo, and risk grids—priced transparently per
              compute unit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-7 py-3.5 bg-tan text-charcoal text-sm font-semibold rounded-sm hover:bg-tan-muted transition-colors"
              >
                Launch Platform
              </Link>
              <Link
                to="/features"
                className="inline-flex items-center justify-center px-7 py-3.5 border border-institutional-green/45 text-sm font-semibold rounded-sm text-neutral-200 hover:bg-institutional-green/15 transition-colors"
              >
                Trading tools
              </Link>
            </div>
          </div>
        </section>

        {/* Token cards */}
        <section className="py-16 sm:py-20 border-b border-white/[0.06] bg-dark-gray/50">
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10">
            <h2 className="font-display text-2xl sm:text-3xl text-neutral-50 mb-10">AMD token catalogue</h2>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {COMPUTE_TOKENS.map((token, i) => (
                <TokenCard key={token.symbol} token={token} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Spec table */}
        <section className="py-16 sm:py-20 border-b border-white/[0.06]">
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10">
            <h2 className="font-display text-2xl sm:text-3xl text-neutral-50 mb-4">Specification matrix</h2>
            <p className="text-neutral-400 text-sm max-w-2xl mb-10 leading-relaxed">
              Institutional table layout—alternating rows for scanability. Figures are representative; final SKUs follow
              Lubbock.cloud issuance.
            </p>
            <div className="overflow-x-auto rounded-sm border border-white/[0.08]">
              <table className="w-full text-left text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-charcoal border-b border-white/[0.08]">
                    <th className="px-4 py-3.5 font-semibold text-tan uppercase tracking-wider text-[11px]">Token</th>
                    <th className="px-4 py-3.5 font-semibold text-tan uppercase tracking-wider text-[11px]">GPU</th>
                    <th className="px-4 py-3.5 font-semibold text-tan uppercase tracking-wider text-[11px]">HBM</th>
                    <th className="px-4 py-3.5 font-semibold text-tan uppercase tracking-wider text-[11px]">Workloads</th>
                    <th className="px-4 py-3.5 font-semibold text-tan uppercase tracking-wider text-[11px] text-right">
                      Unit price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPUTE_TOKENS.map((row, i) => (
                    <tr
                      key={row.symbol}
                      className={i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-dark-gray/80'}
                    >
                      <td className="px-4 py-4 font-mono text-neutral-200 font-medium">{row.symbol}</td>
                      <td className="px-4 py-4 text-neutral-400 max-w-[200px]">{row.gpu}</td>
                      <td className="px-4 py-4 text-neutral-400">{row.hbm}</td>
                      <td className="px-4 py-4 text-neutral-400">{row.workloads.join('; ')}</td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-display text-lg text-tan tabular-nums">{row.pricePerUnit}</span>
                        <span className="block text-[11px] text-neutral-500">{row.unitLabel}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Workspace subscription */}
        <section className="py-20 bg-charcoal">
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl text-neutral-50 mb-4">Workspace plans</h2>
              <p className="text-neutral-400 max-w-2xl mx-auto">
                Platform entitlements on top of tokenized compute. All plans include a 14-day trial where noted.
              </p>
              <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-2 mt-8 bg-dark-gray rounded-sm border border-white/10">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 sm:px-6 py-2 rounded-sm text-sm font-semibold transition-colors ${
                    billingCycle === 'monthly'
                      ? 'bg-institutional-green text-white'
                      : 'text-neutral-400 hover:text-neutral-100'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 sm:px-6 py-2 rounded-sm text-sm font-semibold transition-colors ${
                    billingCycle === 'annual'
                      ? 'bg-institutional-green text-white'
                      : 'text-neutral-400 hover:text-neutral-100'
                  }`}
                >
                  Annual
                  <span className="ml-2 px-2 py-0.5 bg-tan/20 text-tan text-xs rounded-sm border border-tan/30">
                    Save ~20%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {plans.map((plan) => {
                const savings = getSavings(plan);
                return (
                  <div
                    key={plan.name}
                    className={`relative rounded-sm border p-8 ${
                      plan.popular ? 'border-tan/40 shadow-[0_0_40px_-12px_rgba(210,180,140,0.2)]' : 'border-white/10'
                    } bg-dark-gray/60`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-1 bg-tan text-charcoal text-xs font-semibold uppercase tracking-wider rounded-sm">
                          Recommended
                        </span>
                      </div>
                    )}
                    <div className="text-center mb-8">
                      <h3 className="font-display text-2xl text-neutral-50 mb-2">{plan.name}</h3>
                      <p className="text-neutral-500 text-sm mb-6">{plan.description}</p>
                      <div className="mb-4">
                        <span className="font-display text-5xl text-neutral-50 tabular-nums">${getPrice(plan)}</span>
                        <span className="text-neutral-500 ml-2">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </div>
                      {billingCycle === 'annual' && (
                        <p className="text-institutional-green/90 text-sm">
                          Save ${savings.amount}/yr ({savings.percentage}%)
                        </p>
                      )}
                    </div>
                    <Link
                      to="/login"
                      className={`block w-full py-3 rounded-sm font-semibold text-center transition-colors mb-8 ${
                        plan.popular
                          ? 'bg-tan text-charcoal hover:bg-tan-muted'
                          : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                      }`}
                    >
                      Start trial
                    </Link>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature.name} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-institutional-green shrink-0 mt-0.5" strokeWidth={1.75} />
                          ) : (
                            <X className="w-5 h-5 text-neutral-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                          )}
                          <span className={`text-sm ${feature.included ? 'text-neutral-300' : 'text-neutral-600'}`}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="mt-16 rounded-sm border border-white/10 bg-dark-gray/80 p-6 sm:p-8">
              <h3 className="font-display text-xl text-neutral-50 mb-4">Settlement networks</h3>
              <div className="mb-4 inline-flex rounded-sm border border-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setNetworkSelection('solana')}
                  className={`px-4 py-2 text-sm rounded-sm transition-colors ${
                    networkSelection === 'solana'
                      ? 'bg-institutional-green/25 text-tan border border-institutional-green/40'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Solana
                </button>
                <button
                  type="button"
                  onClick={() => setNetworkSelection('polygon')}
                  className={`px-4 py-2 text-sm rounded-sm transition-colors ${
                    networkSelection === 'polygon'
                      ? 'bg-institutional-green/25 text-tan border border-institutional-green/40'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Polygon
                </button>
              </div>
              <p className="text-sm text-neutral-400">
                Typical fee band: <span className="text-neutral-200 font-medium">{selectedNetworkFee}</span>
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-white/[0.06]">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="font-display text-2xl text-neutral-50 mb-4">Questions?</h2>
            <Link
              to="/help-center"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-tan/40 text-tan font-semibold rounded-sm hover:bg-tan/10 transition-colors"
            >
              Contact support
            </Link>
          </div>
        </section>

        <footer className="border-t border-white/[0.06] bg-charcoal py-10">
          <div className="max-w-content mx-auto px-4 text-center">
            <p className="text-neutral-600 text-xs">© {new Date().getFullYear()} General Exchange. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};
