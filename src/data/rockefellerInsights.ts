/**
 * Curated insights for Rockefeller — institutional wire (credit, rates, flow).
 */

import type { NewsArticle } from '../types';

export const rockefellerInsights: NewsArticle[] = [
  {
    id: 'roc-1',
    title: 'When the primary calendar stacks: pacing IG prints against liquidity windows',
    summary:
      'How desks sequence new issues with repo stress, dealer balance sheets, and the quiet days that still move spreads when everyone claims nothing happened.',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    source: 'Rockefeller',
    publishedAt: '2026-04-02T09:00:00Z',
    url: '#',
    category: 'Credit',
  },
  {
    id: 'roc-2',
    title: 'Rates vol and the convexity bill: who pays when curves twist twice in a week',
    summary:
      'A practitioner note on hedging drift, roll-down assumptions, and the meeting minutes that read calm while the desk is paying up for gamma.',
    imageUrl: 'https://images.unsplash.com/photo-1642543494126-44d812d90e3c?w=800&q=80',
    source: 'Rockefeller',
    publishedAt: '2026-04-01T14:30:00Z',
    url: '#',
    category: 'Rates',
  },
  {
    id: 'roc-3',
    title: 'Commodity finance and the covenant you stopped reading on page forty',
    summary:
      'Borrowing bases, redeterminations, and the clauses that matter when inventories draw faster than the model assumed—checklist for risk and legal together.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    source: 'Rockefeller',
    publishedAt: '2026-03-30T11:15:00Z',
    url: '#',
    category: 'Real assets',
  },
  {
    id: 'roc-4',
    title: 'Cross-border flow: documentation lag versus price discovery',
    summary:
      'Why the same headline prints at different speeds in New York, London, and Singapore—and how to keep one book narrative when settlement clocks disagree.',
    imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    source: 'Rockefeller',
    publishedAt: '2026-03-28T08:45:00Z',
    url: '#',
    category: 'Markets',
  },
  {
    id: 'roc-5',
    title: 'Rockefeller: from headline to book context without losing the footnotes',
    summary:
      'Design notes on provenance, category discipline, and how intelligence surfaces attach to General Exchange workflows when compliance still reads every link.',
    imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
    source: 'Rockefeller',
    publishedAt: '2026-03-26T16:00:00Z',
    url: '#',
    category: 'Editorial',
  },
];

export const rockefellerTape: { label: string; detail: string; tone: 'up' | 'down' | 'neutral' }[] = [
  { label: 'IG cash', detail: 'New issue concessions +2 bp vs 30d avg', tone: 'neutral' },
  { label: 'HY window', detail: 'Visible supply −18% vs last month', tone: 'up' },
  { label: 'Rates vol', detail: 'Swaption norm p75 vs 1y median', tone: 'down' },
  { label: 'Energy curve', detail: 'Prompt roll flattening into maintenance', tone: 'neutral' },
  { label: 'FX carry', detail: 'Funding stress isolated to one corridor', tone: 'up' },
];
