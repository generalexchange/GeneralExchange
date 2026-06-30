import type { SymbolSentimentSnapshot } from '@/lib/sentiment/fetchNewsFeed';

export type GameTheoryRegime = {
  label: string;
  marketRegime: 'trending' | 'mean_reverting' | 'compressed_vol' | 'elevated_vol';
  /** Nash-style equilibrium tilt: bullish / bearish / neutral institutional positioning. */
  equilibrium: 'bullish' | 'bearish' | 'neutral';
  /** Probability institutional buyers dominate (0–1). */
  institutionalBuyProb: number;
  /** Sentiment-adjusted drift multiplier for MC. */
  driftMultiplier: number;
  /** Win-rate adjustment from regime + sentiment alignment. */
  winRateAdj: number;
};

type RegimeInputs = {
  realizedVol: number;
  drift: number;
  beta: number;
  correlationVsSpy: number;
  historicalWinRate: number;
  rsi?: number;
  sentiment: SymbolSentimentSnapshot | null;
};

function rsiFromCloses(closes: number[], period = 14): number | undefined {
  if (closes.length < period + 1) return undefined;
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i += 1) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export { rsiFromCloses };

/**
 * Game-theoretic regime: combines vol/drift/β/ρ technicals with news sentiment
 * to estimate institutional buyer dominance and MC parameter adjustments.
 */
export function computeGameTheoryRegime(input: RegimeInputs): GameTheoryRegime {
  const { realizedVol, drift, beta, correlationVsSpy, historicalWinRate, sentiment } = input;
  const rsi = input.rsi;

  let marketRegime: GameTheoryRegime['marketRegime'] = 'trending';
  let label = 'Trending';

  if (realizedVol > 0.35) {
    marketRegime = 'elevated_vol';
    label = 'Elevated vol · event risk';
  } else if (realizedVol < 0.18) {
    marketRegime = 'compressed_vol';
    label = 'Compressed vol · breakout setup';
  } else if (Math.abs(drift) < 0.02) {
    marketRegime = 'mean_reverting';
    label = 'Mean-reverting · range-bound';
  } else if (drift > 0.04 && correlationVsSpy > 0.5) {
    marketRegime = 'trending';
    label = 'Trending · SPY-linked momentum';
  }

  const sent = sentiment?.sentiment ?? 0;
  const impact = sentiment?.impact ?? 0;
  const instBias = sentiment?.institutionalBias ?? 0.5;
  const newsRegime = sentiment?.regime ?? 'NEUTRAL';

  const technicalBull =
    (rsi != null && rsi > 55 ? 0.15 : 0) +
    (drift > 0 ? 0.2 : drift < 0 ? -0.2 : 0) +
    (historicalWinRate > 0.52 ? 0.1 : historicalWinRate < 0.48 ? -0.1 : 0);

  const sentimentBull = sent * 0.35 + (newsRegime === 'RISK_ON' ? 0.15 : newsRegime === 'RISK_OFF' ? -0.15 : 0);
  const betaCrowding = beta > 1.2 ? correlationVsSpy * 0.1 : -correlationVsSpy * 0.05;

  const payoffBull = technicalBull + sentimentBull + betaCrowding + (instBias - 0.5) * 0.4;

  let equilibrium: GameTheoryRegime['equilibrium'] = 'neutral';
  if (payoffBull > 0.12) equilibrium = 'bullish';
  else if (payoffBull < -0.12) equilibrium = 'bearish';

  const institutionalBuyProb = Math.min(
    0.95,
    Math.max(0.05, 0.5 + payoffBull + impact * 0.2),
  );

  const driftMultiplier = 1 + sent * 0.15 + (equilibrium === 'bullish' ? 0.08 : equilibrium === 'bearish' ? -0.08 : 0);
  const winRateAdj = Math.min(0.12, Math.max(-0.12, sent * 0.08 + (historicalWinRate - 0.5) * 0.1));

  if (newsRegime === 'RISK_ON' && equilibrium === 'bullish') {
    label = `${label} · RISK-ON sentiment`;
  } else if (newsRegime === 'RISK_OFF' && equilibrium === 'bearish') {
    label = `${label} · RISK-OFF sentiment`;
  } else if (impact > 0.5) {
    label = `${label} · high-impact news flow`;
  }

  return {
    label,
    marketRegime,
    equilibrium,
    institutionalBuyProb: Math.round(institutionalBuyProb * 1000) / 1000,
    driftMultiplier: Math.round(driftMultiplier * 1000) / 1000,
    winRateAdj: Math.round(winRateAdj * 10000) / 10000,
  };
}
