/**
 * Curated insights copy for Bridge Observer (institutional wire style)
 */

import type { NewsArticle } from '../types';

export const bridgeObserverInsights: NewsArticle[] = [
  {
    id: 'bo-1',
    title: 'Tokenized compute and the desk-grade execution envelope',
    summary:
      'How allocators are mapping tokenized GPU hours to deterministic risk runs, and why settlement rails matter as much as FLOPs.',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    source: 'Bridge Observer',
    publishedAt: '2026-04-02T09:00:00Z',
    url: '#',
    category: 'Markets',
  },
  {
    id: 'bo-2',
    title: 'Monte Carlo at scale: when variance reduction meets capacity planning',
    summary:
      'A practitioner view on path counts, convergence criteria, and reserving tokenized hours for stress windows without queue risk.',
    imageUrl: 'https://images.unsplash.com/photo-1642543494126-44d812d90e3c?w=800&q=80',
    source: 'Bridge Observer',
    publishedAt: '2026-04-01T14:30:00Z',
    url: '#',
    category: 'Quant research',
  },
  {
    id: 'bo-3',
    title: 'Backtesting hygiene: leakage, embargo windows, and reproducible seeds',
    summary:
      'Checklist-style guidance for teams moving from laptop prototypes to institutional backtest grids on shared compute pools.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    source: 'Bridge Observer',
    publishedAt: '2026-03-30T11:15:00Z',
    url: '#',
    category: 'Risk & controls',
  },
  {
    id: 'bo-4',
    title: 'Inference economics: batching, SLOs, and tokenized GPU capacity',
    summary:
      'Balancing latency targets with cost per million tokens when production models share a pool with research and simulation workloads.',
    imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    source: 'Bridge Observer',
    publishedAt: '2026-03-28T08:45:00Z',
    url: '#',
    category: 'Infrastructure',
  },
  {
    id: 'bo-5',
    title: 'Bridge Observer: wiring market narrative to live book context',
    summary:
      'Design notes on category taxonomy, provenance tags, and how intelligence surfaces attach to General Exchange workflows.',
    imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
    source: 'Bridge Observer',
    publishedAt: '2026-03-26T16:00:00Z',
    url: '#',
    category: 'Product',
  },
];

export const trendingSignals: { label: string; detail: string; tone: 'up' | 'down' | 'neutral' }[] = [
  { label: 'HBM capacity', detail: 'GE-GPU-B pool utilization 78%', tone: 'neutral' },
  { label: 'Sim queue', detail: 'Monte Carlo jobs −12% vs 7d avg', tone: 'up' },
  { label: 'Backtest SLA', detail: 'p95 completion 14m 20s', tone: 'up' },
  { label: 'Token float', detail: 'Secondary depth +6% WoW', tone: 'up' },
  { label: 'Risk grid', detail: 'VaR batch window stable', tone: 'neutral' },
];
