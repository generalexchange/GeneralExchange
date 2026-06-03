# Go data plane

Two binaries share `internal/`:

- **`cmd/api`** — REST data API on `:8080`
- **`cmd/ws`** — WebSocket streaming server on `:8081`

Dependency-light by design: Go 1.22 `net/http` routing (method + path patterns),
hand-rolled HMAC-SHA256 JWT verification (no JWT library), in-memory token-bucket
rate limiting. Only external dep is `gorilla/websocket`.

## Run locally

```bash
go run ./cmd/api      # :8080
go run ./cmd/ws       # :8081
```

## REST (`:8080`)

Public (require `X-API-Key`), rate-limited + metered by the key's tier:

```
GET /v1/ticks/{symbol}?limit=200
GET /v1/candles/{symbol}/{interval}?limit=78
GET /v1/options/chain/{symbol}
GET /v1/options/surface/{symbol}
GET /v1/signals/{symbol}
GET /v1/regime/{symbol}
GET /v1/news/{symbol}
```

Authenticated (require `Authorization: Bearer <jwt>`):

```
POST   /v1/backtest/run
GET    /v1/backtest/results/{run_id}
GET    /v1/backtest/results/{run_id}/export?format=csv|parquet|json
POST   /v1/strategies/{id}/publish
GET    /v1/strategies
GET    /v1/strategies/{id}
GET    /v1/portfolio
POST   /v1/trade/paper
POST   /v1/keys                 # issue an API key (raw key returned once)
GET    /v1/keys                 # list firm keys + available tiers
DELETE /v1/keys/{id}            # revoke a key
GET    /v1/usage                # current-month metering + quotas
```

### API keys, tiers, metering

`internal/keys` issues firm-scoped keys (`gx_live_…`), stored only as SHA-256
hashes. Tiers set sustained rps + monthly request quota:

| Tier | RPS | Monthly quota |
| ---- | --- | ------------- |
| free | 10 | 10,000 |
| pro | 100 | 1,000,000 |
| enterprise | 1000 | unlimited |

Public requests pass `RequireAPIKey → tiered rate limit → quota + metering`.
`internal/metering` tallies requests/bytes per key and flushes events to the
ClickHouse `api_usage` table over the HTTP interface. With `API_KEY_ENFORCE=false`
(dev) unknown keys are accepted as free tier; set it to `true` for production.

Every response is an envelope: `{ "data": ..., "as_of": <ts>, "source": "mock|redis|clickhouse" }`.

## WebSocket (`:8081`)

```
/v1/stream/ticks/{symbol}
/v1/stream/candles/{symbol}/{interval}
/v1/stream/options/{symbol}        (30s)
/v1/stream/signals/{symbol}
/v1/stream/regime/{symbol}
/v1/stream/portfolio?token=<jwt>   (auth)
```

## Wiring status

All handlers currently return deterministic data from `internal/mock` (Greeks
are computed with a real BSM engine in `internal/mock/greeks.go`). To go live,
replace each `internal/mock` call with: Redis read → ClickHouse fallback for
REST, and a Redpanda consumer → fan-out for WebSocket. The JSON shapes are the
contract and will not change.
