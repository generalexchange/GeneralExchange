-- =====================================================================
-- general.exchange — ClickHouse Data Warehouse
-- Migration 001: initial schema (system of record)
-- =====================================================================
-- Every table uses the MergeTree family and is partitioned by date.
-- This file is idempotent (IF NOT EXISTS) so it can be re-applied safely.
-- Apply with: clickhouse-client --multiquery < 001_init.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS general_exchange;

-- ---------------------------------------------------------------------
-- ticks — raw normalized trade prints. ReplacingMergeTree deduplicates
-- on the ordering key; the most recently inserted row wins.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS general_exchange.ticks
(
    symbol      String,
    timestamp   DateTime64(9),
    price       Float64,
    size        UInt32,
    exchange    String,
    conditions  Array(String),
    tape        FixedString(1),
    ingested_at DateTime64(3) DEFAULT now64(3)
)
ENGINE = ReplacingMergeTree(ingested_at)
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (symbol, timestamp)
TTL toDateTime(timestamp) + INTERVAL 90 DAY
SETTINGS index_granularity = 8192;

-- ---------------------------------------------------------------------
-- candles — OHLCV aggregates per interval.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS general_exchange.candles
(
    symbol       String,
    interval     String,
    open_time    DateTime64(3),
    open         Float64,
    high         Float64,
    low          Float64,
    close        Float64,
    volume       UInt64,
    vwap         Float64,
    transactions UInt32
)
ENGINE = ReplacingMergeTree
PARTITION BY toYYYYMM(open_time)
ORDER BY (symbol, interval, open_time)
SETTINGS index_granularity = 8192;

-- ---------------------------------------------------------------------
-- options_chain — full per-contract snapshot incl. 1st + 2nd order Greeks.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS general_exchange.options_chain
(
    symbol             String,
    snapshot_time      DateTime64(3),
    expiration_date    Date,
    strike             Float64,
    option_type        String,
    bid                Float64,
    ask                Float64,
    mid                Float64,
    last               Float64,
    volume             UInt32,
    open_interest      UInt32,
    implied_volatility Float64,
    delta              Float64,
    gamma              Float64,
    theta              Float64,
    vega               Float64,
    rho                Float64,
    lambda             Float64,
    epsilon            Float64,
    charm              Float64,
    vanna              Float64,
    volga              Float64,
    speed              Float64,
    zomma              Float64,
    color              Float64,
    underlying_price   Float64,
    underlying_iv      Float64,
    iv_rank            Float64,
    iv_percentile      Float64
)
ENGINE = ReplacingMergeTree
PARTITION BY toYYYYMM(snapshot_time)
ORDER BY (symbol, snapshot_time, expiration_date, strike, option_type)
SETTINGS index_granularity = 8192;

-- ---------------------------------------------------------------------
-- options_surface — full implied volatility surface per symbol/snapshot.
-- surface_points is a Nested column (parallel arrays).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS general_exchange.options_surface
(
    symbol        String,
    snapshot_time DateTime64(3),
    surface_points Nested
    (
        expiration_days UInt16,
        moneyness       Float64,
        iv              Float64
    )
)
ENGINE = ReplacingMergeTree
PARTITION BY toYYYYMM(snapshot_time)
ORDER BY (symbol, snapshot_time)
SETTINGS index_granularity = 8192;

-- ---------------------------------------------------------------------
-- trades_paper — personal paper-trade lifecycle + entry context.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS general_exchange.trades_paper
(
    trade_id          UUID,
    user_id           UUID,
    symbol            String,
    strategy_id       UUID,
    order_type        String,
    option_type       String,
    strike            Float64,
    expiration        Date,
    quantity          Int32,
    entry_price       Float64,
    exit_price        Float64,
    entry_time        DateTime64(3),
    exit_time         DateTime64(3),
    realized_pnl      Float64,
    unrealized_pnl    Float64,
    fees              Float64,
    slippage_modeled  Float64,
    status            String,
    regime_at_entry   String,
    iv_rank_at_entry  Float64,
    delta_at_entry    Float64,
    theta_at_entry    Float64
)
ENGINE = ReplacingMergeTree
PARTITION BY toYYYYMM(entry_time)
ORDER BY (user_id, entry_time)
SETTINGS index_granularity = 8192;

-- ---------------------------------------------------------------------
-- backtest_runs — one row per completed backtest, fully reproducible.
-- parameters holds the exact JSON config (incl. random seed, data range).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS general_exchange.backtest_runs
(
    run_id                    UUID,
    user_id                   UUID,
    strategy_id               UUID,
    strategy_version          String,
    symbol                    String,
    start_date                Date,
    end_date                  Date,
    total_trades              UInt32,
    win_rate                  Float64,
    profit_factor             Float64,
    sharpe_ratio              Float64,
    max_drawdown              Float64,
    cagr                      Float64,
    calmar_ratio              Float64,
    sortino_ratio             Float64,
    omega_ratio               Float64,
    avg_trade_duration_minutes Float64,
    total_pnl                 Float64,
    created_at                DateTime64(3),
    parameters                String
)
ENGINE = ReplacingMergeTree
PARTITION BY toYYYYMM(created_at)
ORDER BY (user_id, created_at)
SETTINGS index_granularity = 8192;

-- ---------------------------------------------------------------------
-- backtest_trades — individual simulated trades for a run.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS general_exchange.backtest_trades
(
    run_id           UUID,
    trade_id         UUID,
    entry_time       DateTime64(3),
    exit_time        DateTime64(3),
    symbol           String,
    option_type      String,
    strike           Float64,
    expiration       Date,
    entry_price      Float64,
    exit_price       Float64,
    pnl              Float64,
    delta_at_entry   Float64,
    iv_rank_at_entry Float64,
    regime_at_entry  String
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(entry_time)
ORDER BY (run_id, entry_time)
SETTINGS index_granularity = 8192;

-- ---------------------------------------------------------------------
-- signals — computed trade signals from the analytics workers.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS general_exchange.signals
(
    signal_id          UUID,
    strategy_id        UUID,
    symbol             String,
    generated_at       DateTime64(3),
    signal_type        String,
    direction          String,
    confidence         Float64,
    raw_score          Float64,
    regime             String,
    iv_regime          String,
    gamma_regime       String,
    delta_tilt         Float64,
    momentum_score     Float64,
    liquidity_score    Float64,
    sentiment_score    Float64,
    news_impact_score  Float64,
    options_flow_score Float64,
    dark_pool_score    Float64,
    expires_at         DateTime64(3)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(generated_at)
ORDER BY (symbol, generated_at)
SETTINGS index_granularity = 8192;

-- ---------------------------------------------------------------------
-- news_events — sentiment-scored, embedded, symbol-tagged news.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS general_exchange.news_events
(
    event_id        UUID,
    published_at    DateTime64(3),
    source          String,
    headline        String,
    body            String,
    symbols         Array(String),
    sentiment_score Float64,
    impact_score    Float64,
    regime_impact   String,
    embedding       Array(Float32)
)
ENGINE = ReplacingMergeTree
PARTITION BY toYYYYMM(published_at)
ORDER BY (published_at, event_id)
SETTINGS index_granularity = 8192;

-- ---------------------------------------------------------------------
-- regime_states — per-symbol regime classification snapshots.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS general_exchange.regime_states
(
    symbol               String,
    detected_at          DateTime64(3),
    regime_type          String,
    confidence           Float64,
    vol_regime           String,
    trend_strength       Float64,
    realized_vol         Float64,
    implied_vol          Float64,
    vol_of_vol           Float64,
    hurst_exponent       Float64,
    autocorrelation_lag1 Float64,
    skew                 Float64,
    kurtosis             Float64
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(detected_at)
ORDER BY (symbol, detected_at)
SETTINGS index_granularity = 8192;

-- ---------------------------------------------------------------------
-- market_participant_flow — dealer/dark-pool/flow microstructure.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS general_exchange.market_participant_flow
(
    symbol                   String,
    timestamp                DateTime64(3),
    dark_pool_prints         UInt32,
    dark_pool_volume         UInt64,
    options_sweep_calls      UInt32,
    options_sweep_puts       UInt32,
    block_trades             UInt32,
    unusual_activity_score   Float64,
    net_gamma_exposure       Float64,
    dealer_gamma_position    Float64,
    estimated_delta_pressure Float64
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(timestamp)
ORDER BY (symbol, timestamp)
SETTINGS index_granularity = 8192;

-- ---------------------------------------------------------------------
-- user_behavior_events — product analytics event stream.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS general_exchange.user_behavior_events
(
    event_id   UUID,
    user_id    UUID,
    event_type String,
    page       String,
    metadata   String,
    session_id UUID,
    created_at DateTime64(3)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(created_at)
ORDER BY (user_id, created_at)
SETTINGS index_granularity = 8192;
