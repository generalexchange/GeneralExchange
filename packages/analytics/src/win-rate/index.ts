export interface WinRateInput {
  pnls: number[];
  priorA?: number;
  priorB?: number;
}

export interface WilsonInterval {
  low: number;
  high: number;
  point: number;
}

export interface WinRateOutput {
  n: number;
  wins: number;
  losses: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number | null;
  payoffRatio: number | null;
  expectancy: number;
  wilson95: WilsonInterval;
  bayesian: { posteriorMean: number; credLow: number; credHigh: number };
  maxWinStreak: number;
  maxLossStreak: number;
  kellyFraction: number | null;
}

function wilsonInterval(wins: number, n: number, z = 1.96): WilsonInterval {
  if (n === 0) return { low: 0, high: 0, point: 0 };
  const p = wins / n;
  const denom = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return { low: center - half, high: center + half, point: p };
}

function betaQuantile(a: number, b: number, p: number): number {
  // Normal approximation for Beta posterior credible interval
  const mean = a / (a + b);
  const var_ = (a * b) / ((a + b) ** 2 * (a + b + 1));
  const z = p < 0.5 ? -1.96 : 1.96;
  return Math.max(0, Math.min(1, mean + z * Math.sqrt(var_)));
}

/** Empirical win rate + Wilson CI + Beta-Binomial posterior. */
export function analyzeWinRate(input: WinRateInput): WinRateOutput {
  const priorA = input.priorA ?? 1;
  const priorB = input.priorB ?? 1;
  const pnls = input.pnls;
  const n = pnls.length;
  const wins = pnls.filter((x) => x > 0);
  const losses = pnls.filter((x) => x < 0);
  const winN = wins.length;
  const lossN = losses.length;
  const winRate = n > 0 ? winN / n : 0;
  const avgWin = winN > 0 ? wins.reduce((s, v) => s + v, 0) / winN : 0;
  const avgLoss = lossN > 0 ? losses.reduce((s, v) => s + v, 0) / lossN : 0;
  const grossWin = wins.reduce((s, v) => s + v, 0);
  const grossLoss = -losses.reduce((s, v) => s + v, 0);
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : null;
  const payoffRatio = avgLoss < 0 ? avgWin / Math.abs(avgLoss) : null;
  const expectancy = n > 0 ? pnls.reduce((s, v) => s + v, 0) / n : 0;

  let maxWin = 0;
  let maxLoss = 0;
  let curW = 0;
  let curL = 0;
  for (const x of pnls) {
    if (x > 0) {
      curW += 1;
      curL = 0;
      maxWin = Math.max(maxWin, curW);
    } else if (x < 0) {
      curL += 1;
      curW = 0;
      maxLoss = Math.max(maxLoss, curL);
    }
  }

  const a = priorA + winN;
  const b = priorB + (n - winN);
  const posteriorMean = a / (a + b);

  let kellyFraction: number | null = null;
  if (payoffRatio && payoffRatio > 0) {
    const f = winRate - (1 - winRate) / payoffRatio;
    kellyFraction = Math.max(0, f);
  }

  return {
    n,
    wins: winN,
    losses: lossN,
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    payoffRatio,
    expectancy,
    wilson95: wilsonInterval(winN, n),
    bayesian: {
      posteriorMean,
      credLow: betaQuantile(a, b, 0.025),
      credHigh: betaQuantile(a, b, 0.975),
    },
    maxWinStreak: maxWin,
    maxLossStreak: maxLoss,
    kellyFraction,
  };
}
