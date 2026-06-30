export type OpportunityFactorScores = {
  expected_return: number;
  probability_of_profit: number;
  historical_edge?: number;
  liquidity: number;
  spread_quality: number;
  gamma_positioning: number;
  monte_carlo: number;
};

export type OpportunityMonteCarlo = {
  probabilityITM: number;
  probabilityProfitable: number;
  expectedPayoff: number;
  blackScholesPrice: number;
};

export type RankedContract = {
  id: string;
  symbol: string;
  optionType: 'CALL' | 'PUT';
  strike: number;
  expiration: string;
  bid: number;
  ask: number;
  mid: number;
  volume: number;
  openInterest: number;
  iv: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  dte: number;
  spreadPct?: number;
  spot?: number;
  expectedReturn: number;
  confidence: number;
  probabilityOfProfit: number;
  compositeScore: number;
  factorScores: OpportunityFactorScores;
  monteCarlo: OpportunityMonteCarlo;
  analysis: {
    rationale: string;
    rankFactors: OpportunityFactorScores;
    weights: Record<string, number>;
  };
  chain?: RankedContract[];
  error?: string;
};

export type DiscoverResponse = {
  opportunities: RankedContract[];
  generatedAt: string;
  ml?: { weights: Record<string, number> };
};

export type ExpiredOutcome = {
  id: string;
  symbol: string;
  optionType: string;
  strike: number;
  expiration: string;
  expectedReturn: number;
  confidence: number;
  probabilityOfProfit: number;
  actualReturn: number | null;
  actualProfitable: boolean | null;
  settledAt: string | null;
  createdAt: string;
};

export type OutcomesResponse = {
  outcomes: ExpiredOutcome[];
  ml: {
    weights: Record<string, number>;
    calibrationRuns: number;
    expiredCount: number;
    hitRate: number | null;
  };
};
