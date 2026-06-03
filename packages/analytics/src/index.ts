/**
 * @gx/analytics — quantitative analytics framework for General Exchange.
 *
 * A Monte Carlo probability/risk core surrounded by pricing, volatility,
 * sizing, valuation, information-theory, and order-flow models, unified by a
 * master TradeEvaluationEngine and dashboard data contracts. Pure TypeScript,
 * no UI, no live network calls — shared by web (Next.js) and desktop (Tauri).
 *
 * Modules:
 *   shared        seeded RNG + statistics + Gaussian helpers
 *   monte-carlo   engine + price-path / strategy / trade-quality simulations
 *   black-scholes option pricing + greeks
 *   garch         volatility forecasting (placeholder GARCH(1,1))
 *   bayesian      probability updating + signal fusion
 *   kelly         position sizing
 *   sharpe        Sharpe / Sortino ratios
 *   capm          expected/required return
 *   dcf           intrinsic valuation
 *   entropy       information-theory noise/clarity
 *   order-flow    pressure + imbalance (placeholder)
 *   risk-of-ruin  analytic ruin/survival
 *   scoring       TradeEvaluationEngine + grading
 *   types         dashboard DTOs + API adapter interfaces
 */

export * from './shared/index';
export * from './monte-carlo/index';
export * from './black-scholes/index';
export * from './garch/index';
export * from './bayesian/index';
export * from './kelly/index';
export * from './sharpe/index';
export * from './capm/index';
export * from './dcf/index';
export * from './entropy/index';
export * from './order-flow/index';
export * from './risk-of-ruin/index';
export * from './scoring/index';
export * from './types/index';
