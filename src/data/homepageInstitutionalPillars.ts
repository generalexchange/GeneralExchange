/**
 * Homepage capability pillars — institutional copy (General.Exchange)
 */

export type PillarTheme = 'light' | 'dark';

export interface PillarCard {
  title: string;
  description: string;
}

export interface PillarSection {
  id: string;
  title: string;
  subtitle?: string;
  /** Short caption under the mechanics diagram for this pillar */
  mechanicsCaption?: string;
  cards: PillarCard[];
  theme: PillarTheme;
}

export const HOMEPAGE_TAGLINE =
  'General.Exchange — Institutional Risk, Research, and Execution on Tokenized Compute.';

export const HOMEPAGE_PILLARS: PillarSection[] = [
  {
    id: 'advanced-risk-scenario',
    title: 'Advanced Risk & Scenario Engines',
    subtitle: 'GPU-accelerated stress paths, factors, and tail metrics—deterministic where desks require proof.',
    mechanicsCaption:
      'Correlated paths, tail heatmaps, and VaR/ES ladders share one seed chain so risk and audit see the same scenario geometry.',
    theme: 'dark',
    cards: [
      {
        title: 'Path-Dependent Stress Testing',
        description:
          'Simulate multi-day liquidity crunches, cascading margin calls, correlated drawdowns, and path-dependent scenarios on GPUs.',
      },
      {
        title: 'Factor Decomposition Engine',
        description:
          'Decompose portfolio risk into momentum, carry, volatility, macro, and sentiment factors with visual reports.',
      },
      {
        title: 'Tail-Risk Heatmaps',
        description:
          'GPU-accelerated VaR/ES across thousands of correlated assets, with heatmaps and clustered risk groups.',
      },
      {
        title: 'Synthetic Market Replay',
        description:
          'Replay historical market microstructure tick-by-tick, including order book depth, queue position, and slippage.',
      },
    ],
  },
  {
    id: 'backtesting-research',
    title: 'Compute-Driven Backtesting & Model Research',
    subtitle: 'Tokenized GPU pools for sweeps, evolution, and RL—with spend controls and reproducible manifests.',
    mechanicsCaption:
      'Parameter grids burn compute tokens deliberately; manifests bind code, data slices, and kernels so results replay bit-for-bit.',
    theme: 'light',
    cards: [
      {
        title: 'Massively Parallel Backtesting Grid',
        description:
          'Run thousands of parameter sweeps using tokenized GPU units with configurable compute spend.',
      },
      {
        title: 'Genetic Algorithm Strategy Optimizer',
        description:
          'Evolve strategies via mutation, crossover, and multi-objective fitness using compute credits.',
      },
      {
        title: 'Reinforcement Learning Lab',
        description:
          'Train RL agents (PPO, DQN, SAC) on synthetic or historical order books with custom reward functions.',
      },
      {
        title: 'Latency-Aware Backtests',
        description:
          'Model realistic microstructure: slippage, queue position, routing delays, and venue-specific latency.',
      },
      {
        title: 'Cross-Asset Correlation Explorer',
        description:
          'GPU-accelerated correlation matrices, PCA, clustering, and anomaly detection with interactive exploration.',
      },
    ],
  },
  {
    id: 'bridge-observer',
    title: 'Bridge Observer: From News to Signals to Execution',
    subtitle: 'Narrative and events folded into time series, alerts, and route-ready signals.',
    mechanicsCaption:
      'Headlines become dense vectors, then regime-aware signals that meet the same pre-trade gates as any internal alpha.',
    theme: 'dark',
    cards: [
      {
        title: 'News Sentiment Feed',
        description:
          'Real-time NLP sentiment across equities, crypto, FX, and macro, exposed as time series and signals.',
      },
      {
        title: 'Event-Driven Alerts',
        description:
          'Signals from earnings, guidance changes, regulatory filings, insider trades, and macro releases.',
      },
      {
        title: 'Narrative Regime Detection',
        description:
          'Track shifts in dominant narratives like inflation, AI, and geopolitics with narrative-strength indicators.',
      },
      {
        title: 'Headline-to-Trade Pipeline',
        description:
          'Convert sentiment spikes and events into backtestable signals and route them into live execution.',
      },
    ],
  },
  {
    id: 'institutional-workflow',
    title: 'Institutional Workflow & Evidence',
    subtitle: 'Pre-trade gates, immutable ledgers, and policy-bound releases.',
    mechanicsCaption:
      'Each hop hashes intent, child orders, and fills—building an evidence pack second line and regulators can traverse.',
    theme: 'light',
    cards: [
      {
        title: 'Pre-Trade Risk Gatekeeping',
        description:
          'Validate constraints, liquidity, leverage, and exposure before orders are released.',
      },
      {
        title: 'Post-Trade Evidence Ledger',
        description:
          'Immutable chain from signal → intent → order → fill → settlement → PnL attribution.',
      },
      {
        title: 'Desk Policy Enforcement',
        description:
          'Maker-checker workflows, approvals, and parameter governance with role-based controls.',
      },
      {
        title: 'Model Lineage Tracking',
        description:
          'Version control for models, datasets, compute environments, and deployments.',
      },
    ],
  },
  {
    id: 'tokenized-compute',
    title: 'Tokenized Compute, Natively Integrated',
    subtitle: 'Wallet, yield, and queue priority tied to platform-issued compute tokens.',
    mechanicsCaption:
      'Wallet balances, scheduler fairness, and yield leases share one ledger so spend, priority, and cost stay visible to finance.',
    theme: 'dark',
    cards: [
      {
        title: 'Compute Credit Wallet',
        description: 'Buy, stake, or lease GPU units for research and backtesting.',
      },
      {
        title: 'Compute Yield Accounts',
        description: 'Earn yield by renting idle compute tokens to other traders.',
      },
      {
        title: 'Priority Compute Queues',
        description: 'Guaranteed GPU time for high-tier users and urgent workloads.',
      },
      {
        title: 'Tokenized Server Units',
        description: 'Fractionalized Hetzner server capacity as on-chain compute assets.',
      },
    ],
  },
  {
    id: 'execution-routing',
    title: 'Execution & Routing Intelligence',
    subtitle: 'SOR, slippage forensics, and live exposure in one loop.',
    mechanicsCaption:
      'The router minimizes a cost surface: fees, impact, and latency—not just top-of-book snapshots.',
    theme: 'light',
    cards: [
      {
        title: 'Smart Order Router (SOR)',
        description: 'Venue selection optimized for liquidity, latency, and cost.',
      },
      {
        title: 'Slippage Attribution Engine',
        description: 'Break down slippage into market impact, timing, routing, and volatility.',
      },
      {
        title: 'Cost-Aware Execution Planner',
        description: 'Plan execution across compute cost, data cost, venue fees, and expected slippage.',
      },
      {
        title: 'Real-Time Exposure Dashboard',
        description:
          'Live net/gross exposure, concentration, liquidity buckets, and breach escalation.',
      },
    ],
  },
  {
    id: 'quant-research',
    title: 'Quant Research Environment',
    subtitle: 'Notebooks, data plane, and sandboxes bound to compute tokens.',
    mechanicsCaption:
      'Kernels, lakes, and marketplace artifacts inherit entitlements—no shadow downloads outside policy.',
    theme: 'dark',
    cards: [
      {
        title: 'On-Platform Jupyter-Style Notebook',
        description:
          'GPU-accelerated notebooks tied to compute tokens, supporting Python, Rust, and TypeScript kernels.',
      },
      {
        title: 'Data Lake Access',
        description:
          'Unified APIs for historical tick data, fundamentals, alt-data, sentiment, and macro series.',
      },
      {
        title: 'Strategy Library Marketplace',
        description:
          'Publish, license, and monetize strategies with revenue-sharing and compute-usage tracking.',
      },
      {
        title: 'Model Sandbox',
        description: 'Deterministic, reproducible environments for safe model experimentation.',
      },
    ],
  },
  {
    id: 'governance-compliance',
    title: 'Governance, Compliance & Controls',
    subtitle: 'Attestations, exports, and policy-locked runtime.',
    mechanicsCaption:
      'Controls are not PDFs—they are runtime gates that refuse to boot models or routes when limits drift.',
    theme: 'light',
    cards: [
      {
        title: 'Attestation & Limits Engine',
        description: 'Automatically enforce desk-level risk and compute-usage policies.',
      },
      {
        title: 'Audit-Ready Evidence Bundles',
        description: 'Exportable compliance packets for regulators, LPs, and internal audit.',
      },
      {
        title: 'Role-Bound Permissions',
        description:
          'Segregation of duties for research, execution, approvals, and compute allocation.',
      },
      {
        title: 'Policy-Locked Deployments',
        description: 'Models can only run when bound to approved policy versions.',
      },
    ],
  },
  {
    id: 'premium-addons',
    title: 'Premium Institutional Add-Ons',
    subtitle: 'Subscriptions, embeddable engines, and automated diagnostics.',
    mechanicsCaption:
      'Embed the same engines clients see on-platform; metering and audit trails travel with the integration.',
    theme: 'dark',
    cards: [
      {
        title: 'Compute-Backed Risk Subscriptions',
        description: 'GPU-powered risk analytics offered as a subscription service.',
      },
      {
        title: 'White-Label Risk Engine',
        description: 'Embed the General.Exchange risk stack inside institutional systems.',
      },
      {
        title: 'Portfolio Doctor',
        description:
          'Automated diagnostics with suggested hedges, rebalancing, and exposure adjustments.',
      },
      {
        title: 'AI Strategy Auditor',
        description:
          'Check for overfitting, data leakage, unrealistic assumptions, and survivorship bias.',
      },
    ],
  },
];

export const EXECUTION_LOOP_STEPS = [
  {
    step: '01',
    title: 'Pre-release evaluation',
    body: 'Every order is evaluated against live limits, scenario envelopes, and desk policies before release.',
  },
  {
    step: '02',
    title: 'Continuous exposure checks',
    body: 'Exposure is re-checked as fills update; state stays consistent with risk envelopes.',
  },
  {
    step: '03',
    title: 'Violations & halts',
    body: 'Violations trigger automatic halts or approvals—no silent overrides.',
  },
  {
    step: '04',
    title: 'Desk-grade discipline',
    body: 'Mirrors internal systems used by BlackRock Aladdin and tier-one trading desks.',
  },
] as const;
