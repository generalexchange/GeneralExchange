# general.exchange — Backend

Production-grade options trading intelligence platform. This directory holds
everything behind the Next.js frontend: the data warehouse, the streaming
layer, the ingestion + analytics workers, the Go API/WebSocket servers, and the
Python backtesting engine.

> The backtesting engine is the crown jewel. Everything else exists to make its
> results faster and more trustworthy.

## Approved stack (and nothing else)

| Concern                  | Tool          | Why |
|--------------------------|---------------|-----|
| Data ingestion           | Polygon.io    | Ticks, options chains, aggregates, news, reference data |
| Event streaming          | Redpanda      | Kafka-compatible, single binary, replayable topics |
| Data warehouse           | ClickHouse    | Columnar time-series, fast analytical queries — system of record |
| Research / backtest core | DuckDB        | In-process columnar engine, no network round-trips in the inner loop |
| Orchestration            | Apache Airflow| EOD loads, snapshots, refreshes, regime batch jobs |
| Transform / modeling     | dbt + ClickHouse | Versioned, testable, auditable analytics models |
| Cache                    | Redis         | Greeks, chain snapshots, live signal state, WS fan-out |
| API / WS                 | Go            | Throughput + latency sensitive surfaces |
| Workers / ML / backtest  | Python        | Analytics, signals, NLP, backtesting |
| Object storage           | MinIO         | Parquet, backtest artifacts, strategy files (local stand-in for FloppyDisk) |
| Observability            | OpenObserve   | Logs, metrics, traces, trade + ingestion events |
| Internal BI              | Apache Superset | Dashboards, data-quality monitoring, ad-hoc SQL |
| Data catalog             | DataHub       | Lineage: raw ticks -> ClickHouse -> dbt -> signals -> backtests |

## Layout

```
backend/
  clickhouse/migrations/   ClickHouse DDL (system of record schema)
  go/                      Go API server (:8080) + WebSocket server (:8081)
  python/                  Ingestion + workers + backtesting engine
  airflow/dags/            Scheduled pipelines
  dbt/                     Analytics models on top of ClickHouse
```

## Quick start

```bash
cp .env.example .env            # add your POLYGON_API_KEY
docker compose up -d            # core data plane + app services
docker compose --profile bi up -d        # + Superset (BI)
docker compose --profile etl up -d       # + Airflow (ETL)
docker compose --profile catalog up -d   # + DataHub (lineage)
```

Endpoints once up:

| Service        | URL                     |
|----------------|-------------------------|
| Go REST API    | http://localhost:8080   |
| Go WebSocket   | ws://localhost:8081     |
| Backtesting API| http://localhost:8090   |
| ClickHouse     | http://localhost:8123   |
| Redpanda (kafka)| localhost:19092        |
| MinIO console  | http://localhost:9001   |
| OpenObserve    | http://localhost:5080   |
| Superset       | http://localhost:8088   |
| Airflow        | http://localhost:8085   |

## Streaming topics (Redpanda)

`ticks-raw` · `ticks-normalized` · `candles-{1m,5m,15m,1h,1d}` ·
`options-chain-snapshots` · `signals` · `paper-trade-events` ·
`news-raw` · `news-processed` · `regime-events`

All topics are partitioned by symbol, replayable from any offset, written with
idempotent producers, and consumed by idempotent consumer groups (offsets in
Redpanda, not Zookeeper).

## FloppyDisk integration

FloppyDisk (floppydisk.cc) is a **separate, external** strategy-storage and
marketplace service that is not yet live. The backtesting engine never talks to
a storage backend directly — it depends on the `FloppyDisk` interface in
`python/common/floppydisk.py`, which has two implementations:

- **`MinioFloppyDisk`** (default) — stores artifacts/strategies in local MinIO
  buckets (`backtest-artifacts`, `strategies`). Works today, no external deps.
- **`HttpFloppyDisk`** — targets the real floppydisk.cc REST API, selected
  automatically once `FLOPPYDISK_URL` is set.

Switching to the real service is a config change (`FLOPPYDISK_URL` +
`FLOPPYDISK_API_KEY`), not a code change.

## Backtesting endpoints (`:8090`, fronted by the Go API)

| Method | Path | Purpose |
| ------ | ---- | ------- |
| POST | `/v1/backtest/run` | Run a backtest; returns `run_id` + metrics + Monte Carlo + walk-forward summary |
| GET  | `/v1/backtest/results/{run_id}` | Full artifact (equity curve, trades, breakdowns) |
| GET  | `/v1/backtest/runs` | Recent run summaries |
| POST | `/v1/strategies/{id}/publish` | Publish a versioned strategy to FloppyDisk |
| GET  | `/v1/strategies` / `/v1/strategies/{id}` | List / fetch published strategies |

## Build plan status

- [x] **Phase 0 — foundation files**: ClickHouse schema, Docker Compose, topic + bucket bootstrap
- [x] **Phase 1**: Polygon ingestion (+ synthetic fallback) → Redpanda → tick normalizer → ClickHouse; candle aggregation; options snapshots (topic + ClickHouse + Redis); Go REST/WS API; Next.js proxy wiring
- [x] **Phase 2 (compute)**: real-time 1st/2nd-order Greeks (`common/greeks.py`), IV rank/percentile in the options-chain service; surface/GEX/skew surfaced in the API + UI
- [x] **Phase 3**: DuckDB backtesting engine (`services/backtesting/`) — bars loaded into DuckDB, bar-by-bar BSM option simulation, strategy JSON DSL, walk-forward folds + embargo, full metrics (Sharpe/Sortino/Calmar/Omega/CAGR/drawdown/expectancy/Kelly), Monte Carlo permutation + bootstrap significance, deterministic reproducible runs (`run_id` = hash(config+strategy+seed)), ClickHouse promotion (`backtest_runs`/`backtest_trades`), and FloppyDisk publishing. Go API forwards `/v1/backtest/*` and `/v1/strategies/*` to the engine on :8090.
- [x] **Phase 4**: intelligence layer (`common/analytics.py`, `common/nlp.py`) —
  - **regime-detection-worker**: Hurst exponent (lag-variance), 1-D k-means vol-regime clustering, vol-of-vol, lag-1 autocorrelation, skew/kurtosis → `regime_states` + `regime-events` (emits on transition or refresh interval).
  - **signal-computation-worker**: fuses candles (momentum/liquidity), options snapshots (dealer GEX, put/call skew, net delta tilt, flow, delta-squeeze pressure), regime context, and decaying news sentiment into composite signals → `signals` + `market_participant_flow`.
  - **news-nlp-worker**: lexicon sentiment, keyword impact scoring, symbol tagging, feature-hashing embeddings, risk-on/off regime impact → `news_events` + `news-processed` (Polygon news source with synthetic fallback).
- [x] **Phase 5**: commercialization + governance —
  - **API-key management** (`go/internal/keys`): firm-scoped issuance, SHA-256 hashing (raw key shown once), tiers (free/pro/enterprise) with per-tier rps + monthly quotas, create/list/revoke endpoints.
  - **Usage metering** (`go/internal/metering`): per-key request/byte tallies, monthly quota enforcement (429), tiered token-bucket rate limiting; events flushed to ClickHouse `api_usage` over the HTTP interface (+ `billing_usage_daily` rollup MV).
  - **Exports**: backtest trades/equity as CSV / Parquet / JSON (pyarrow) via `/v1/backtest/results/{id}/export`, proxied through the Go API.
  - **DataHub** (`backend/datahub`): ClickHouse ingestion recipe + lineage emitter declaring Polygon → Redpanda → ClickHouse → dbt → signals/backtests.
  - **Superset** (`backend/superset`): data-quality dashboard bundle + SQL, fed by the **data-quality-worker** (freshness/null/dup/volume/range checks → `data_quality_checks`).
