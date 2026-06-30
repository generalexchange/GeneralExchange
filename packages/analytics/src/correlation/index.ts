import { covariance, variance } from '../shared/statistics';

export interface CorrelationInput {
  /** Symbol → aligned price series (oldest first). */
  pricesBySymbol: Record<string, number[]>;
  benchmark?: string;
}

export interface CorrelationOutput {
  symbols: string[];
  pearson: Record<string, Record<string, number>>;
  diversificationScore: number;
  rollingBeta?: Record<string, number>;
}

function logReturns(prices: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < prices.length; i += 1) {
    const a = prices[i - 1];
    const b = prices[i];
    if (a > 0 && b > 0) out.push(Math.log(b / a));
  }
  return out;
}

function pearsonCoeff(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const sliceA = a.slice(-n);
  const sliceB = b.slice(-n);
  const va = variance(sliceA);
  const vb = variance(sliceB);
  if (va <= 0 || vb <= 0) return 0;
  return covariance(sliceA, sliceB) / Math.sqrt(va * vb);
}

function diversificationScore(matrix: Record<string, Record<string, number>>, symbols: string[]): number {
  if (symbols.length < 2) return 1;
  let sum = 0;
  let count = 0;
  for (let i = 0; i < symbols.length; i += 1) {
    for (let j = i + 1; j < symbols.length; j += 1) {
      sum += Math.abs(matrix[symbols[i]]?.[symbols[j]] ?? 0);
      count += 1;
    }
  }
  return count > 0 ? 1 - sum / count : 1;
}

/** Pearson correlation matrix from price series + diversification score. */
export function analyzeCorrelation(input: CorrelationInput): CorrelationOutput {
  const symbols = Object.keys(input.pricesBySymbol).filter((s) => input.pricesBySymbol[s].length > 2);
  const returns: Record<string, number[]> = {};
  for (const s of symbols) {
    returns[s] = logReturns(input.pricesBySymbol[s]);
  }

  const pearson: Record<string, Record<string, number>> = {};
  for (const a of symbols) {
    pearson[a] = {};
    for (const b of symbols) {
      pearson[a][b] = a === b ? 1 : Number(pearsonCoeff(returns[a], returns[b]).toFixed(4));
    }
  }

  const rollingBeta: Record<string, number> = {};
  const bench = input.benchmark;
  if (bench && returns[bench]?.length) {
    const varBench = variance(returns[bench]);
    for (const s of symbols) {
      if (s === bench || varBench <= 0) continue;
      rollingBeta[s] = Number((covariance(returns[s], returns[bench]) / varBench).toFixed(4));
    }
  }

  return {
    symbols,
    pearson,
    diversificationScore: Number(diversificationScore(pearson, symbols).toFixed(4)),
    rollingBeta: Object.keys(rollingBeta).length ? rollingBeta : undefined,
  };
}
