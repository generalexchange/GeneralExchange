/**
 * Tabbed institutional tool surfaces — extends dashboard without replacing core layers.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import type { InstitutionalDashboardTabId } from '../../data/dashboardInstitutionalTabs';

function PanelCard({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-4 sm:p-5 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-white tracking-tight mb-3">{title}</h3>
      <div className="text-xs text-zinc-500 space-y-2 flex-1 leading-relaxed">{children}</div>
      {footer ? <div className="mt-4 pt-3 border-t border-white/[0.06]">{footer}</div> : null}
    </div>
  );
}

function PlaceholderAction({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="text-[11px] font-semibold uppercase tracking-[0.14em] text-tan hover:text-tan-muted transition-colors"
    >
      {label}
    </button>
  );
}

export function InstitutionalDashboardPanels({ tab }: { tab: InstitutionalDashboardTabId }) {
  if (tab === 'overview') return null;

  const grid = 'grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5';

  if (tab === 'risk') {
    return (
      <section className="mb-10 sm:mb-12" aria-labelledby="dash-tab-risk">
        <h2 id="dash-tab-risk" className="text-lg font-semibold text-white mb-1">
          Risk &amp; Scenarios
        </h2>
        <p className="text-sm text-zinc-500 mb-5">Stress, factors, tail risk, and synthetic replay—mock controls for front-end only.</p>
        <div className={grid}>
          <PanelCard
            title="Path-Dependent Stress Testing"
            footer={<PlaceholderAction label="Open template library" />}
          >
            <p>
              <span className="text-zinc-400">Inputs:</span> portfolio, horizon, stress templates.
            </p>
            <p>
              <span className="text-zinc-400">Outputs:</span> drawdown paths, margin call timelines, liquidity metrics.
            </p>
          </PanelCard>
          <PanelCard title="Factor Decomposition Engine" footer={<PlaceholderAction label="View factor report" />}>
            <p>Exposures: momentum, carry, vol, macro, sentiment. Contribution to marginal risk shown as stacked bars (UI pending).</p>
          </PanelCard>
          <PanelCard title="Tail-Risk Heatmaps" footer={<PlaceholderAction label="Open heatmap" />}>
            <p>VaR/ES by asset, sector, factor cluster. GPU batch job status: queued / running / complete.</p>
          </PanelCard>
          <PanelCard title="Synthetic Market Replay" footer={<PlaceholderAction label="Configure replay" />}>
            <p>Date range, instruments, strategy binding. Tick replay with book depth and queue model.</p>
          </PanelCard>
        </div>
      </section>
    );
  }

  if (tab === 'backtest') {
    return (
      <section className="mb-10 sm:mb-12" aria-labelledby="dash-tab-backtest">
        <h2 id="dash-tab-backtest" className="text-lg font-semibold text-white mb-1">
          Backtesting &amp; RL
        </h2>
        <p className="text-sm text-zinc-500 mb-5">Grids, optimizers, and RL tied to Lubbock.Cloud credits.</p>
        <div className={grid}>
          <PanelCard title="Parallel Backtesting Grid" footer={<PlaceholderAction label="New sweep" />}>
            <p>Parameter grid, max concurrent jobs, credit ceiling. Queue position and ETA.</p>
          </PanelCard>
          <PanelCard title="Genetic Algorithm Optimizer" footer={<PlaceholderAction label="Edit fitness" />}>
            <p>Population size, crossover rate, constraints on turnover and leverage.</p>
          </PanelCard>
          <PanelCard title="Reinforcement Learning Lab" footer={<PlaceholderAction label="Launch trainer" />}>
            <p>Environment: synthetic / historical OB. Algorithms: PPO, DQN, SAC. Reward DSL hook.</p>
          </PanelCard>
          <PanelCard title="Latency-Aware Backtests" footer={<PlaceholderAction label="Venue model" />}>
            <p>Toggle latency surfaces, router delays, partial fills.</p>
          </PanelCard>
          <PanelCard title="Cross-Asset Correlation Explorer" footer={<PlaceholderAction label="Open matrix" />}>
            <p>PCA, hierarchical clusters, anomaly flags on correlation breaks.</p>
          </PanelCard>
        </div>
      </section>
    );
  }

  if (tab === 'news') {
    return (
      <section className="mb-10 sm:mb-12" aria-labelledby="dash-tab-news">
        <h2 id="dash-tab-news" className="text-lg font-semibold text-white mb-1">
          News &amp; Signals
        </h2>
        <p className="text-sm text-zinc-500 mb-5">Bridge Observer integration surface.</p>
        <div className={grid}>
          <PanelCard title="News Sentiment Feed" footer={<Link to="/bridge-observer" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-tan hover:text-tan-muted">Open feed</Link>}>
            <p>Time series snapshot: cross-asset sentiment z-scores. Refresh cadence: 1m.</p>
          </PanelCard>
          <PanelCard title="Event-Driven Alerts">
            <p>Recent: earnings beat · filing 8-K · macro CPI. Linked instruments and severity.</p>
          </PanelCard>
          <PanelCard title="Narrative Regime Detection">
            <p>Dominant: inflation hedge · AI capex · rates vol. Strength index 0–100.</p>
          </PanelCard>
          <PanelCard title="Headline-to-Trade Pipeline" footer={<PlaceholderAction label="Route to backtest" />}>
            <p>Signals staged → validated → paper / live route. Current pipeline depth: 4.</p>
          </PanelCard>
        </div>
      </section>
    );
  }

  if (tab === 'execution') {
    return (
      <section className="mb-10 sm:mb-12" aria-labelledby="dash-tab-exec">
        <h2 id="dash-tab-exec" className="text-lg font-semibold text-white mb-1">
          Execution &amp; Routing
        </h2>
        <p className="text-sm text-zinc-500 mb-5">SOR status, slippage forensics, cost planner, exposure.</p>
        <div className={grid}>
          <PanelCard title="Smart Order Router (SOR)" footer={<PlaceholderAction label="Venue config" />}>
            <p>Active venues: 6. Routing policy: liquidity-first · cost cap 3 bps.</p>
          </PanelCard>
          <PanelCard title="Slippage Attribution Engine">
            <p>Last 20 fills: impact vs. timing vs. routing. Export CSV.</p>
          </PanelCard>
          <PanelCard title="Cost-Aware Execution Planner">
            <p>Planned slice: 12% ADV · est. slippage 1.8 bps · compute + data + fees rollup.</p>
          </PanelCard>
          <PanelCard title="Real-Time Exposure Dashboard" footer={<PlaceholderAction label="Breach log" />}>
            <p>Net 42% · gross 118% · top-5 concentration 31%. No active breaches.</p>
          </PanelCard>
        </div>
      </section>
    );
  }

  if (tab === 'governance') {
    return (
      <section className="mb-10 sm:mb-12" aria-labelledby="dash-tab-gov">
        <h2 id="dash-tab-gov" className="text-lg font-semibold text-white mb-1">
          Governance &amp; Evidence
        </h2>
        <p className="text-sm text-zinc-500 mb-5">Policies, attestations, and exports.</p>
        <div className={grid}>
          <PanelCard title="Attestation & Limits Engine">
            <p>Status: enforcing v2.4. Limits: 12 desk rules active · 0 soft warnings.</p>
          </PanelCard>
          <PanelCard title="Recent policy events">
            <p>None in last 24h. Escalation path: risk → CRO sign-off.</p>
          </PanelCard>
          <PanelCard title="Audit-Ready Evidence Bundles" footer={<PlaceholderAction label="Export bundle" />}>
            <p>Packages: signal ledger, approvals, model versions, compute job IDs.</p>
          </PanelCard>
          <PanelCard title="Role-Bound Permissions">
            <p>Research: 6 · Execution: 4 · Approvers: 3 · Compute admin: 2.</p>
          </PanelCard>
          <PanelCard title="Policy-Locked Deployments">
            <p>Production models: 8 · all bound to approved policy SHA.</p>
          </PanelCard>
        </div>
      </section>
    );
  }

  if (tab === 'premium') {
    return (
      <section className="mb-10 sm:mb-12" aria-labelledby="dash-tab-premium">
        <h2 id="dash-tab-premium" className="text-lg font-semibold text-white mb-1">
          Premium &amp; Marketplace
        </h2>
        <p className="text-sm text-zinc-500 mb-5">Compute wallet, yield, queue, and institutional add-ons.</p>
        <div className={grid}>
          <PanelCard title="Compute Credit Wallet" footer={<Link to="/pricing" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-tan hover:text-tan-muted">Manage credits</Link>}>
            <p>Balance: 14,280 LUB units · burn rate 7d: 2,100 · reservation: 800.</p>
          </PanelCard>
          <PanelCard title="Compute Yield Accounts">
            <p>30d annualized yield: 4.1% · lent capacity: 18% of wallet.</p>
          </PanelCard>
          <PanelCard title="Priority Compute Queue">
            <p>Tier: Professional. Next window: 09:14 UTC · SLA: 99.2% met.</p>
          </PanelCard>
          <PanelCard title="Tokenized Server Units">
            <p>Hetzner fractional slices: 3 active · chain attestation: OK.</p>
          </PanelCard>
          <PanelCard title="Institutional add-ons" footer={<PlaceholderAction label="View catalog" />}>
            <ul className="list-disc pl-4 space-y-1 text-zinc-500">
              <li>Compute-backed risk subscriptions</li>
              <li>White-label risk engine</li>
              <li>Portfolio Doctor</li>
              <li>AI Strategy Auditor</li>
            </ul>
          </PanelCard>
        </div>
      </section>
    );
  }

  return null;
}
