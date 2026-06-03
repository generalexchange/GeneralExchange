# Quantitative Engine Architecture

`@gx/analytics` is the quantitative analytics framework for General Exchange. It
is a **pure-TypeScript, UI-free, network-free** package that both the web app
(Next.js / Vercel) and the desktop app (Tauri) import through the `@gx/analytics`
path alias. There is one implementation, shared everywhere.

The framework is organized around a **Monte Carlo probability/risk core**. Every
other model produces inputs that the Monte Carlo layer and the master
`TradeEvaluationEngine` consume to produce a single, normalized trade scorecard
and a dashboard-ready DTO.

> **MVP note:** several models (GARCH, order flow, the conviction scorer) ship as
> transparent placeholders with real, correct *contracts* but simplified math.
> They are designed so a fitted/feed-driven implementation can replace the body
> of a single function without changing any types, callers, or the dashboard
> layer.

---

## Folder structure

```text
packages/analytics/
  package.json            # @gx/analytics, subpath exports per module
  tsconfig.json
  src/
    index.ts              # top-level barrel
    shared/               # seeded RNG, statistics, Gaussian helpers, shared types
      random.ts
      statistics.ts
      types.ts
      index.ts
    monte-carlo/          # core engine + 3 simulation modes + providers
      engine.ts
      models.ts           # GBM + placeholder conviction model
      simulations.ts      # PricePath / StrategyOutcome / TradeQuality
      providers.ts        # data-source contracts + placeholders + adapters
      types.ts
      index.ts
    black-scholes/        # option pricing + greeks
    garch/                # volatility forecasting (placeholder GARCH(1,1))
    bayesian/             # probability updating + signal fusion
    kelly/                # position sizing
    sharpe/               # Sharpe / Sortino
    capm/                 # expected/required return
    dcf/                  # intrinsic valuation
    entropy/              # information-theory noise / clarity
    order-flow/           # buy/sell pressure, imbalance, liquidity (placeholder)
    risk-of-ruin/         # analytic ruin / survival / longevity
    scoring/              # TradeEvaluationEngine + grading
    types/                # dashboard DTOs + external API adapter interfaces
  tests/                  # vitest suites (deterministic, seeded)
```

---

## Model responsibilities

| Module | Function(s) | Responsibility |
| --- | --- | --- |
| `shared` | `SeededRandom`, `mean`/`variance`/`percentile`/`confidenceInterval`/`distribution`/`summarize`, `normalCdf`/`normalPdf` | Deterministic RNG and the single statistics layer used everywhere. |
| `monte-carlo` | `MonteCarloEngine`, `simulatePricePaths`, `simulateStrategyOutcome`, `simulateTradeQuality` | Probability/risk core. Price paths (GBM), account-equity replay, conviction-under-noise. |
| `black-scholes` | `blackScholes` | European option theoretical price + delta, gamma, theta, vega, rho (Merton dividend extension). |
| `garch` | `forecastVolatility` | Forward volatility, regime label, ±1σ band via GARCH(1,1) recursion (placeholder params). |
| `bayesian` | `updateProbability`, `combineSignals` | Exact Bayes update + log-odds signal fusion → posterior conviction. |
| `kelly` | `kellyCriterion` | Optimal/half/quarter Kelly fraction and a clamped recommended size. |
| `sharpe` | `sharpeRatios` | Sharpe and Sortino ratios with optional annualization. |
| `capm` | `capm` | Expected/required return; beta supplied or estimated from series. |
| `dcf` | `discountedCashFlow` | Intrinsic value (Gordon terminal), margin of safety, valuation gap. |
| `entropy` | `shannonEntropy` | Normalized Shannon entropy → noise score and signal clarity. |
| `order-flow` | `orderFlow` | Buy/sell pressure, imbalance, book liquidity pressure (placeholder). |
| `risk-of-ruin` | `riskOfRuin` | Analytic gambler's-ruin probability, survival, expected longevity. |
| `scoring` | `TradeEvaluationEngine`, `evaluateTrade`, `compositeScore`, `toGrade` | Aggregates all models into the scorecard + dashboard DTO + A–F grade. |

---

## Computational flow

```text
                         TradeEvaluationInput
                                 │
        ┌────────────────────────┼─────────────────────────┐
        ▼                        ▼                          ▼
  market data               signal data                trade setup
        │                        │                          │
        ▼                        ▼                          ▼
  PricePath MC            TradeQuality MC            StrategyOutcome MC
  (expected return)   (conviction / noise / risk)   (P(profit), drawdown, ruin)
        │                        │                          │
        │     CAPM ── Black-Scholes ── Entropy ── OrderFlow ── DCF ── Kelly
        │                        │                          │
        └────────────┬───────────┴────────────┬─────────────┘
                     ▼                         ▼
              composite score  ───────►  TradeEvaluationOutput
                     │                         │
                     ▼                         ▼
                 tradeGrade            DashboardAnalytics (DTO)
```

1. The engine runs the three Monte Carlo simulations with a shared seed.
2. CAPM blends with the Monte Carlo expected return; Black–Scholes contributes an
   option-risk proxy; entropy corroborates the noise channel; order flow feeds the
   liquidity score; DCF (optional) tilts the valuation score; Kelly sizes the position.
3. `compositeScore` blends the normalized signals (probability and conviction
   dominate; risk and noise penalize) and `toGrade` maps it to A–F.
4. `toDashboard` projects the full output to the compact `DashboardAnalytics` DTO.

---

## Determinism & performance

- All randomness flows through one `SeededRandom` per run. A fixed `seed` makes
  every output bit-for-bit reproducible — the basis for the unit tests and for
  auditable, defensible numbers.
- The trial loop in `MonteCarloEngine.run` is the natural shard boundary. It
  supports 1k / 10k / 100k trials today and is structured so future optimization
  (worker threads, WebAssembly, or Rust via Tauri) can parallelize trials without
  changing simulation code or contracts.

---

## Future API integration points

Interfaces live in `src/types/providers.ts` and `src/monte-carlo/providers.ts`.
No live connections exist yet — only contracts and deterministic placeholders.

| Interface | Future implementation |
| --- | --- |
| `PolygonAdapter` | Polygon.io trades/aggregates |
| `OptionsFeedProvider` | options chain + greeks feed |
| `SentimentFeedProvider` | news/flow sentiment service |
| `EconomicDataProvider` | rates / macro series (e.g. FRED) |
| `MarketDataProvider` / `SignalProvider` / `SentimentProvider` | warehouse-backed snapshots |

Adapters (`buildPricePathInput`, `buildTradeQualityInput`) translate provider
snapshots into simulation inputs, so wiring a real feed is an adapter change, not
an engine change.

---

## Dashboard integration points

- **`TradeEvaluationInput`** — grouped `market` / `signal` / `setup` / optional
  `valuation` blocks future feeds populate independently.
- **`TradeEvaluationOutput`** — full scorecard (expected return, P(profit),
  conviction, confidence, noise, drawdown, valuation, risk, liquidity, position
  size, grade).
- **`DashboardAnalytics`** — the compact DTO the dashboard renders. No engine
  types leak into the view layer; the UI consumes this contract only.

---

## Testing

`vitest` suites in `packages/analytics/tests/` cover the engine, all models, and
the aggregator with deterministic seeded runs:

- `monteCarlo.test.ts` — RNG determinism, GBM mean tracking, edge cases, strategy
  edge sign, trade-quality bounds.
- `blackScholes.test.ts` — analytic reference values, put–call parity, shared
  gamma/vega, expiry degeneracy.
- `models.test.ts` — GARCH, Bayesian, Kelly, Sharpe/Sortino, CAPM (incl. beta
  estimation), DCF, entropy, order flow, risk of ruin.
- `tradeEvaluation.test.ts` — determinism, output bounds, good-vs-poor grade
  ordering, dashboard projection.

Run with `npm test` from the repo root.
