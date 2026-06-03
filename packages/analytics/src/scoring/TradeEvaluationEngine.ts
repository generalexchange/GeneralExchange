import { blackScholes } from '../black-scholes';
import { capm } from '../capm';
import { discountedCashFlow } from '../dcf';
import { shannonEntropy } from '../entropy';
import { kellyCriterion } from '../kelly';
import { simulatePricePaths, simulateStrategyOutcome, simulateTradeQuality } from '../monte-carlo';
import { orderFlow } from '../order-flow';
import { clamp01 } from '../shared/statistics';
import type {
  DashboardAnalytics,
  TradeEvaluationInput,
  TradeEvaluationOutput,
} from '../types/dashboard';
import { compositeScore, toGrade } from './grade';

const DEFAULT_SIM_COUNT = 10_000;

/**
 * Master evaluation engine.
 *
 * Orchestrates every model around the Monte Carlo probability/risk core and
 * collapses their outputs into a single normalized scorecard plus a UI-ready
 * dashboard DTO. Each sub-model is independent and individually testable; this
 * class only wires inputs and blends outputs. Swapping any placeholder model
 * for a real one requires no change here as long as the contract holds.
 */
export class TradeEvaluationEngine {
  evaluate(input: TradeEvaluationInput): TradeEvaluationOutput {
    const simulationCount = input.simulationCount ?? DEFAULT_SIM_COUNT;
    const { market, signal, setup } = input;

    /* --- Monte Carlo: price path → expected return over the horizon --- */
    const pricePath = simulatePricePaths({
      currentPrice: market.currentPrice,
      volatility: market.volatility,
      drift: market.drift,
      timeHorizon: setup.timeHorizon,
      simulationCount,
      seed: input.seed,
      maxRecordedPaths: 0,
    });
    const mcExpectedReturn = pricePath.expectedPrice / market.currentPrice - 1;

    /* --- Monte Carlo: strategy outcome → P(profit), drawdown, ruin --- */
    const strategy = simulateStrategyOutcome({
      winRate: setup.winRate,
      averageWin: setup.averageWin,
      averageLoss: setup.averageLoss,
      tradeFrequency: setup.tradeFrequency,
      accountSize: setup.accountSize,
      positionSize: setup.positionSize,
      simulationCount,
      seed: input.seed,
      ruinThreshold: 0.5,
    });

    /* --- Monte Carlo: trade quality → conviction / noise --- */
    const quality = simulateTradeQuality({
      signalStrength: signal.signalStrength,
      volatility: Math.min(1, market.volatility),
      liquidity: signal.liquidity,
      regime: signal.regime,
      sentiment: signal.sentiment,
      marketStructureScore: signal.marketStructureScore,
      simulationCount: Math.min(simulationCount, 4000),
      seed: input.seed,
    });

    /* --- CAPM: required/expected return baseline --- */
    const capmResult = capm({
      riskFreeRate: market.riskFreeRate,
      marketReturn: market.marketReturn,
      beta: market.beta,
    });

    /* --- Black–Scholes: option risk via greeks (if a strike is provided) --- */
    let riskFromGreeks = 0;
    if (setup.strike !== undefined) {
      const bs = blackScholes({
        stockPrice: market.currentPrice,
        strike: setup.strike,
        timeToExpiration: setup.timeHorizon,
        volatility: market.volatility,
        riskFreeRate: market.riskFreeRate,
      });
      // Normalize vega exposure relative to price as a crude option-risk proxy.
      riskFromGreeks = clamp01((bs.vega / market.currentPrice) * 0.5 + Math.abs(bs.delta) * 0.2);
    }

    /* --- Order flow → liquidity score --- */
    const flow = orderFlow({
      buyVolume: signal.buyVolume ?? 0,
      sellVolume: signal.sellVolume ?? 0,
    });
    const liquidityScore = clamp01(0.6 * signal.liquidity + 0.4 * (1 - Math.abs(flow.imbalance)));

    /* --- Entropy → noise corroboration from the strategy distribution --- */
    const entropy = shannonEntropy({
      distribution: strategy.distribution.map((b) => b.count),
    });
    const noiseScore = clamp01(0.6 * quality.noiseScore + 0.4 * entropy.noiseScore);

    /* --- DCF: optional valuation overlay --- */
    let valuationScore = 0.5;
    if (input.valuation) {
      const dcf = discountedCashFlow({
        cashFlows: input.valuation.cashFlows,
        discountRate: input.valuation.discountRate,
        terminalGrowth: input.valuation.terminalGrowth,
        sharesOutstanding: input.valuation.sharesOutstanding,
        currentPrice: market.currentPrice,
      });
      // Map margin of safety (−∞..1) into a 0-1 score around 0.5.
      valuationScore = clamp01(0.5 + dcf.marginOfSafety);
    }

    /* --- Kelly: position sizing recommendation --- */
    const kelly = kellyCriterion({
      winProbability: strategy.probabilityOfProfit,
      averageWin: setup.averageWin,
      averageLoss: setup.averageLoss,
      accountSize: setup.accountSize,
    });

    /* --- Blend --- */
    const expectedReturn = 0.6 * mcExpectedReturn + 0.4 * capmResult.expectedReturn;
    const confidenceScore = clamp01(
      1 - (quality.confidenceInterval.upper - quality.confidenceInterval.lower),
    );
    const riskScore = clamp01(
      0.4 * clamp01(market.volatility) + 0.3 * strategy.expectedDrawdown + 0.3 * riskFromGreeks,
    );

    const grade = toGrade(
      compositeScore({
        probabilityOfProfit: strategy.probabilityOfProfit,
        convictionScore: quality.convictionScore,
        confidenceScore,
        noiseScore,
        riskScore,
        valuationScore,
      }),
    );

    return {
      expectedReturn,
      probabilityOfProfit: strategy.probabilityOfProfit,
      convictionScore: quality.convictionScore,
      confidenceScore,
      noiseScore,
      expectedDrawdown: strategy.expectedDrawdown,
      valuationScore,
      riskScore,
      liquidityScore,
      positionSizingRecommendation: kelly.recommendedSize,
      tradeGrade: grade,
    };
  }

  /** Convenience: evaluate and project straight to the dashboard DTO. */
  toDashboard(input: TradeEvaluationInput): DashboardAnalytics {
    const out = this.evaluate(input);
    return {
      symbol: input.symbol,
      expectedReturn: out.expectedReturn,
      conviction: out.convictionScore,
      confidence: out.confidenceScore,
      risk: out.riskScore,
      noise: out.noiseScore,
      valuation: out.valuationScore,
      volatility: input.market.volatility,
      positionSize: out.positionSizingRecommendation,
      probabilityOfProfit: out.probabilityOfProfit,
      grade: out.tradeGrade,
    };
  }
}

export function evaluateTrade(input: TradeEvaluationInput): TradeEvaluationOutput {
  return new TradeEvaluationEngine().evaluate(input);
}
