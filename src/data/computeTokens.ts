/**
 * Compute token catalog for General Exchange (representative GPU tiers)
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
    symbol: 'GE-GPU-A',
    gpu: 'Accelerator tier A · high-throughput matrix units',
    hbm: '192 GB HBM-class · 5.3 TB/s effective',
    workloads: ['Large-model training', 'Monte Carlo (high path count)', 'Batch inference'],
    pricePerUnit: '$0.94',
    unitLabel: 'per GPU-hour',
  },
  {
    symbol: 'GE-GPU-B',
    gpu: 'Accelerator tier B · expanded memory bandwidth',
    hbm: '256 GB HBM-class · higher effective bandwidth',
    workloads: ['Multi-epoch training', 'Scenario risk grids', 'Low-latency inference'],
    pricePerUnit: '$1.18',
    unitLabel: 'per GPU-hour',
  },
  {
    symbol: 'GE-GPU-C',
    gpu: 'Accelerator tier C · frontier-scale pools',
    hbm: '288+ GB HBM-class (roadmap)',
    workloads: ['Frontier backtests', 'VaR / ES simulation', 'Strategy research at scale'],
    pricePerUnit: '$1.42',
    unitLabel: 'per GPU-hour',
  },
];
