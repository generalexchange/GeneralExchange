# Rust backend migration

Full migration spec: replace `backend/python/` services (except IBKR) and `backend/go/` with `backend/rust/`.

## Constraint: IBKR stays Python

`backend/python/services/ibkr/` uses **ib-insync** (TWS proprietary binary TCP). The Rust `ibapi` crate (~60% protocol coverage) is not production-ready. The Rust API gateway proxies `/v1/ibkr/*` to `IBKR_API_URL`.

## Crate layout

| Crate | Role |
|-------|------|
| `gx-core` | Pure math/config/topics (no native deps) — `greeks`, `analytics`, `config`, `topics` |
| `gx-infra` | Kafka, ClickHouse, Redis clients (requires **cmake** for `rdkafka`) |
| `services/*` | One binary per Python/Go service |

## Implementation status

| Service | Status |
|---------|--------|
| `gx-core` | Done — BSM Greeks, analytics, config, topics |
| `gx-infra` | Done — kafka/clickhouse/redis clients |
| `tick-normalizer` | Done |
| `candle-aggregation` | Done |
| `options-chain` | Done — synth/Polygon snapshots, Redis `chain:{symbol}` |
| `regime-detection` | Done — Hurst + vol k-means, `regime-events` |
| `signal-worker` | Done — GEX/sentiment/regime fusion → `signals` |
| `news-nlp`, `data-quality`, `monte-carlo`, `backtesting`, `quant-analytics`, `api-gateway` | Scaffold |

## Shadow validation (before cutover)

1. Run Rust worker with consumer group `*-rs` alongside Python.
2. Compare outputs: prices ±0.01, Greeks ±0.0001, regime labels identical.
3. Point gateway at Rust URL; remove Python container.

## Priority order

tick-normalizer → candle-aggregation → options-chain → regime-detection → signal-worker → monte-carlo → backtesting → quant-analytics → news-nlp → data-quality → api-gateway

## Local build

```bash
cd backend/rust
cargo test -p gx-core          # no cmake required
cargo build -p tick-normalizer # requires cmake + Visual Studio build tools (Windows)
```

Docker/Linux CI uses multi-stage builds with cmake (see migration prompt Section 7).

## Preserved contracts

Do not change Kafka topic names, ClickHouse schemas, Redis key patterns, or REST URL paths. See `backend/python/common/topics.py` and `backend/go/internal/api/router.go`.
