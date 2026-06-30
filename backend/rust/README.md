# Rust backend workspace

Migration from Python/Go services to `backend/rust/`.

## Status

| Crate | Status |
|-------|--------|
| `gx-core` | Done — config, topics, greeks, analytics |
| `gx-infra` | Done — kafka, clickhouse, redis clients |
| `tick-normalizer` | Done (shadow group: `tick-normalizer-rs`) |
| `candle-aggregation` | Done (shadow group: `candle-aggregation-rs`) |
| `options-chain` | Done — synth BSM + Polygon + Redis cache |
| `regime-detection` | Done — 1h candle regime classifier |
| `signal-worker` | Done — multi-topic signal composer |
| `monte-carlo` | Done — opportunity discover/analyze/outcomes on `:8092` (IBKR-backed) |
| `news-nlp`, `data-quality`, `backtesting`, `quant-analytics`, `api-gateway` | Scaffold |

## IBKR exception

`backend/python/services/ibkr/` stays Python (ib-insync / TWS binary protocol). The Rust API gateway will proxy `/v1/ibkr/*` to `IBKR_API_URL`.

## Build

```bash
cd backend/rust
cargo test -p gx-core
cargo build --release -p options-chain
cargo build --release -p monte-carlo   # POST /v1/opportunity/* on :8092
```

`gx-core` tests run without cmake. Kafka worker binaries require **cmake** + VS build tools on Windows.

See `docs/RUST_MIGRATION.md` for shadow validation and cutover order.
