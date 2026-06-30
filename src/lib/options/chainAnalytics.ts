import { blackScholes } from '@gx/analytics';
import type { OptionRow } from '@/components/dashboard/terminal/terminalData';
import { dte, mcContract, parseExpiration } from '@/lib/opportunity/rankCore';

export type ChainRowAnalytics = {
  bsmFair: number;
  edgePct: number;
  mcProbProfit: number;
  mcProbITM: number;
  /** MC P(profit) ≥ 52% and BSM not rich vs mid */
  positiveWinSignal: boolean;
};

export function analyzeChainRow(row: OptionRow, spot: number, seed: number): ChainRowAnalytics {
  const expiration = parseExpiration(row.id);
  const dteVal = expiration ? dte(expiration) : 30;
  const tYears = Math.max(dteVal, 1) / 365;
  const vol = Math.max(0.08, row.iv > 3 ? row.iv / 100 : row.iv || 0.25);
  const optType = row.type === 'CALL' ? 'call' : 'put';
  const bs = blackScholes({
    stockPrice: spot,
    strike: row.strike,
    timeToExpiration: tYears,
    volatility: vol,
    riskFreeRate: 0.043,
    optionType: optType,
  });
  const premium = row.mid > 0 ? row.mid : row.lastTraded;
  const mc = mcContract(spot, row, premium, dteVal, seed);
  const edgePct = premium > 0 ? (bs.theoreticalPrice / premium - 1) * 100 : 0;
  return {
    bsmFair: bs.theoreticalPrice,
    edgePct,
    mcProbProfit: mc.probabilityProfitable,
    mcProbITM: mc.probabilityITM,
    positiveWinSignal: mc.probabilityProfitable >= 0.52 && edgePct >= -8,
  };
}
