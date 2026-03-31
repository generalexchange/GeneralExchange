/**
 * Mock multi-interval series for paper portfolio chart (Robinhood-style tabs).
 */

import { PAPER_SESSION_OPEN_EQUITY } from './mockMlDashboardData';

export interface MarketDatum {
  time: string;
  price: number;
  volume: number;
}

export type PaperChartRange = 'live' | '1h' | '1d' | '1w' | '1m' | '3m' | '1y' | '5y';

export const PAPER_RANGE_TABS: { id: PaperChartRange; label: string }[] = [
  { id: 'live', label: 'Live' },
  { id: '1h', label: '1H' },
  { id: '1d', label: '1D' },
  { id: '1w', label: '1W' },
  { id: '1m', label: '1M' },
  { id: '3m', label: '3M' },
  { id: '1y', label: '1Y' },
  { id: '5y', label: '5Y' },
];

export const PAPER_RANGE_PERIOD_LABEL: Record<PaperChartRange, string> = {
  live: 'Session · mock tape',
  '1h': 'Last hour · mock',
  '1d': 'Today · mock',
  '1w': 'Past week · mock',
  '1m': 'Past month · mock',
  '3m': 'Past quarter · mock',
  '1y': 'Past year · mock',
  '5y': '5 years · mock',
};

function hash01(s: string, i: number): number {
  let h = i * 17;
  for (let k = 0; k < s.length; k++) h = (h * 31 + s.charCodeAt(k)) | 0;
  return (Math.abs(h) % 1000) / 1000;
}

export function getBenchmarkEndEquity(live: MarketDatum[]): number {
  const p0 = live[0]?.price ?? 1;
  const pN = live[live.length - 1]?.price ?? p0;
  return Math.round(PAPER_SESSION_OPEN_EQUITY * (pN / p0) * 100) / 100;
}

function buildSyntheticPath(
  range: PaperChartRange,
  startEquity: number,
  endEquity: number,
  labels: string[],
): MarketDatum[] {
  const n = labels.length;
  const out: MarketDatum[] = [];
  for (let i = 0; i < n; i++) {
    let eq: number;
    if (i === 0) eq = startEquity;
    else if (i === n - 1) eq = endEquity;
    else {
      const t = i / (n - 1);
      const wobble = (hash01(range, i) - 0.5) * (endEquity - startEquity) * 0.035;
      const ease = t * t * (3 - 2 * t);
      eq = Math.round((startEquity + (endEquity - startEquity) * ease + wobble) * 100) / 100;
    }
    const price = 100 * (eq / startEquity);
    const volBase = 800_000 + hash01(range + 'v', i) * 1_800_000;
    out.push({
      time: labels[i]!,
      price,
      volume: Math.round(volBase),
    });
  }
  return out;
}

function labelsFor(range: PaperChartRange): string[] {
  switch (range) {
    case '1h':
      return ['9:34', '9:40', '9:46', '9:52', '9:58', '10:04', '10:10', '10:16', '10:22', '10:28', '10:34', '10:40'];
    case '1d':
      return ['Pre', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '2:00', '3:00', 'Close'];
    case '1w':
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    case '1m':
      return Array.from({ length: 16 }, (_, i) => `${i + 1}`);
    case '3m':
      return ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'W13'];
    case '1y':
      return ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    case '5y':
      return ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'];
    default:
      return [];
  }
}

function pullbackFor(range: PaperChartRange): number {
  switch (range) {
    case '1h':
      return 0.004;
    case '1d':
      return 0.012;
    case '1w':
      return 0.028;
    case '1m':
      return 0.055;
    case '3m':
      return 0.09;
    case '1y':
      return 0.18;
    case '5y':
      return 0.42;
    default:
      return 0;
  }
}

export function buildPaperSeriesForRange(
  range: PaperChartRange,
  liveSeries: MarketDatum[],
): { series: MarketDatum[]; openEquity: number } {
  if (range === 'live') {
    return {
      series: liveSeries.map((r) => ({ ...r })),
      openEquity: PAPER_SESSION_OPEN_EQUITY,
    };
  }
  const endEq = getBenchmarkEndEquity(liveSeries);
  const pull = pullbackFor(range);
  const startEq = Math.round(endEq * (1 - pull) * 100) / 100;
  const labs = labelsFor(range);
  return {
    series: buildSyntheticPath(range, startEq, endEq, labs),
    openEquity: startEq,
  };
}
