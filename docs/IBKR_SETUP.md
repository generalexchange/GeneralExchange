# Interactive Brokers setup for General Exchange

This project uses **Interactive Brokers** for all market data, options chains, account info, positions, and order execution. The Python service wraps **ib_insync** and exposes REST + WebSocket endpoints.

Paper trading is the **default** (`IB_PAPER=true`, `IB_PORT=4002`).

---

## Prerequisites

1. **Interactive Brokers account** (paper or live)
2. **Market data subscriptions** for US equities and US options (purchase in IBKR Account Management → Market Data Subscriptions)
3. **IB Gateway** or **Trader Workstation (TWS)** installed on your machine

Download Gateway/TWS: [https://www.interactivebrokers.com/en/trading/ibgateway-stable.php](https://www.interactivebrokers.com/en/trading/ibgateway-stable.php)

---

## 1. Install and log in to IB Gateway (paper)

1. Open **IB Gateway** (not TWS unless you prefer the full UI).
2. Select **Paper Trading** at login.
3. Log in with your paper credentials.
4. When prompted, enable **API access**:
   - Configure → Settings → API → Settings
   - Enable **ActiveX and Socket Clients**
   - **Read-Only API**: off (required for orders)
   - **Socket port**: `4002` (paper Gateway default)
   - **Trusted IPs**: add `127.0.0.1` and, if using Docker, your Docker bridge IP or enable **Allow connections from localhost only** as appropriate
   - Uncheck **Allow connections from localhost only** if the IBKR service runs in Docker and connects via `host.docker.internal`

Keep Gateway **running** whenever the IBKR service is active.

### Port reference

| Mode | IB Gateway | TWS |
|------|------------|-----|
| Paper | 4002 | 7497 |
| Live | 4001 | 7496 |

---

## 2. Configure environment

Copy `.env.example` to `.env`:

```bash
IB_HOST=127.0.0.1
IB_PORT=4002
IB_CLIENT_ID=1
IB_PAPER=true

IBKR_API_URL=http://localhost:8093
IBKR_API_KEY=your-shared-secret

DATABASE_URL=postgresql+asyncpg://ibkr:ibkr@localhost:5432/ibkr
DATABASE_URL_SYNC=postgresql+psycopg2://ibkr:ibkr@localhost:5432/ibkr

NEXT_PUBLIC_WS_URL=ws://localhost:8093/ws/market
```

**`IB_CLIENT_ID`**: Each simultaneous API connection needs a unique client ID (1, 2, 3…). If you see "client id already in use", increment it.

---

## 3. Run with Docker

```bash
# Start PostgreSQL + IBKR API (+ optional Monte Carlo)
docker compose --profile app up -d postgres ibkr-api
```

The IBKR container connects to Gateway on your **host** via `host.docker.internal:4002`.

Verify:

```bash
curl http://localhost:8093/health
```

Expected when Gateway is connected:

```json
{
  "ok": true,
  "connected": true,
  "paper": true,
  "host": "host.docker.internal",
  "port": 4002,
  "client_id": 1,
  "account": "DU1234567"
}
```

---

## 4. Run locally (without Docker)

```bash
cd backend/python
pip install -r requirements.txt -r services/ibkr/requirements.txt

# PostgreSQL must be running (docker compose up -d postgres)

export IB_HOST=127.0.0.1
export IB_PORT=4002
export IB_CLIENT_ID=1
export DATABASE_URL_SYNC=postgresql+psycopg2://ibkr:ibkr@localhost:5432/ibkr

uvicorn services.ibkr.main:app --host 0.0.0.0 --port 8093 --reload
```

---

## 5. API endpoints

All REST routes except `/health` accept optional header `X-API-Key` when `IBKR_API_KEY` is set.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Connection status |
| GET | `/market-data?symbol=SPY` | Stock or option quote |
| GET | `/options-chain?symbol=SPY` | Option chain + greeks |
| GET | `/historical?symbol=SPY&bar_size=1 min&duration=1 D` | Historical bars (stored in PostgreSQL) |
| GET | `/account` | Account summary |
| GET | `/positions` | Open positions |
| GET | `/orders` | Open orders |
| POST | `/orders` | Place order (JSON body) |
| DELETE | `/orders/{id}` | Cancel order |
| GET | `/executions` | Fill history |
| GET | `/signals?symbols=SPY,QQQ` | Derived signals |

### WebSocket streams

| Path | Description |
|------|-------------|
| `/ws/market` | Live quotes, indicators, and candle stream (preferred) |
| `/ws/stocks?symbols=SPY,QQQ` | Legacy stock price stream |
| `/ws/options?symbol=SPY` | Options / greeks stream |
| `/ws/account` | Account summary updates |
| `/ws/positions` | Position updates |

---

## 6. Next.js frontend (local dev)

In `.env.local`:

```
IBKR_API_URL=http://127.0.0.1:8093
IBKR_API_KEY=gx_ibkr_dev_key
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8093/ws/market
```

The Legend dashboard calls `/api/v1/quote`, `/api/v1/candles`, and `/api/v1/options/chain`, which proxy to the local IBKR service.

### Desktop app

The Tauri installer bundles the UI as static files and calls `127.0.0.1:8093` directly (no Next.js server). See [LOCAL_DESKTOP.md](./LOCAL_DESKTOP.md).

---

## 7. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `connected: false` on `/health` | Gateway not running, wrong port, or API not enabled |
| `client id already in use` | Change `IB_CLIENT_ID` or close other API clients |
| `Not connected` / timeout | Check firewall; add trusted IP in Gateway settings |
| No market data / `-1` prices | Purchase IBKR market data bundles for US stocks/options |
| Docker can't reach Gateway | Use `IB_HOST=host.docker.internal`; disable localhost-only if needed |
| `10197` / no historical data | Request permissions for historical data in Account Management |

---

## 8. Security notes

- Never expose IB Gateway directly to the public internet.
- Run the IBKR API behind a VPN or private network; use `IBKR_API_KEY` on REST routes.
- Paper mode (`IB_PORT=4002`) is default — double-check before switching to live ports.

---

## 9. Cancel Polygon / Massive

This project no longer uses Polygon.io or Massive.com. Remove `POLYGON_API_KEY` from all environments and cancel those subscriptions in your vendor accounts.
