/**
 * AMD compute token catalog for Lubbock.cloud / General Exchange
 */

export interface ComputeTokenSpec {
  symbol: string;
  gpu: string;
  hbm: string;
  workloads: readonly string[];
  pricePerUnit: string;
  unitLabel: string;
}

export const COMPUTE_TOKENS: ComputeTokenSpec[] = [
  {
    symbol: 'LUB-MI300X',
    gpu: 'AMD Instinct MI300X · 304 XCDNA 3 CUs',
    hbm: '192 GB HBM3 · 5.3 TB/s',
    workloads: ['Large-model training', 'Monte Carlo (high path count)', 'Batch inference'],
    pricePerUnit: '$0.94',
    unitLabel: 'per GPU-hour',
  },
  {
    symbol: 'LUB-MI325X',
    gpu: 'AMD Instinct MI325X · expanded matrix engines',
    hbm: '256 GB HBM3e · higher effective bandwidth',
    workloads: ['Multi-epoch training', 'Scenario risk grids', 'Low-latency inference'],
    pricePerUnit: '$1.18',
    unitLabel: 'per GPU-hour',
  },
  {
    symbol: 'LUB-MI355X',
    gpu: 'AMD Instinct MI355X · next-gen CDNA architecture',
    hbm: 'Planned 288+ GB HBM class (roadmap)',
    workloads: ['Frontier backtests', 'VaR / ES simulation', 'Strategy research at scale'],
    pricePerUnit: '$1.42',
    unitLabel: 'per GPU-hour',
  },
];
