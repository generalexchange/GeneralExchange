/**
 * Dashboard institutional tool tabs (shared with panels)
 */

export type InstitutionalDashboardTabId =
  | 'overview'
  | 'risk'
  | 'backtest'
  | 'news'
  | 'execution'
  | 'governance'
  | 'premium';

export const INSTITUTIONAL_DASHBOARD_TABS: { id: InstitutionalDashboardTabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'risk', label: 'Risk & Scenarios' },
  { id: 'backtest', label: 'Backtesting & RL' },
  { id: 'news', label: 'News & Signals' },
  { id: 'execution', label: 'Execution & Routing' },
  { id: 'governance', label: 'Governance & Evidence' },
  { id: 'premium', label: 'Premium & Marketplace' },
];
