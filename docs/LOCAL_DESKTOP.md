# Local desktop setup (no cloud server)

The desktop app ships the full UI as a static bundle inside the Tauri installer. At runtime it talks to services on **your machine** — no remote API server required.

## Stack on your PC

```
IB Gateway (127.0.0.1:4002)
    ↓
IBKR Python service (127.0.0.1:8093)  ← quotes, candles, /ws/market stream
    ↓
Desktop app (Tauri) or browser dev (localhost:3003)
```

Optional: Monte Carlo API on `127.0.0.1:8092`, PostgreSQL on `5432` for bar cache.

## 1. IB Gateway

Install and log in to **IB Gateway** (paper port **4002**). See [IBKR_SETUP.md](./IBKR_SETUP.md).

Or run Gateway in Docker:

```powershell
cd infra/local
copy .env.example .env
# edit .env with your IB credentials
docker compose up -d
```

## 2. IBKR market engine

```powershell
cd backend/python
$env:PYTHONPATH = (Get-Location).Path
$env:IB_HOST = "127.0.0.1"
$env:IB_PORT = "4002"
$env:IB_PAPER = "true"
$env:IBKR_API_KEY = "gx_ibkr_dev_key"
py -3.11 -m uvicorn services.ibkr.main:app --host 127.0.0.1 --port 8093
```

Verify: `curl http://127.0.0.1:8093/health`

## 3. Web dev (optional)

```powershell
# .env
IBKR_API_URL=http://127.0.0.1:8093
IBKR_API_KEY=gx_ibkr_dev_key
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8093/ws/market

npm run dev
```

Open http://legend.localhost:3003

## 4. Desktop app build

The desktop static export is built with local defaults baked in:

- `NEXT_PUBLIC_IBKR_API_URL=http://127.0.0.1:8093`
- `NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8093/ws/market`

```powershell
cd apps/desktop
npm run tauri:dev    # dev — uses localhost Next.js + local IBKR
npm run tauri:build  # installer — bundled UI calls 127.0.0.1:8093
```

**Before opening the desktop app:** start IB Gateway and the IBKR service on port 8093.

## Data flow

- Live quotes, indicators, and 1m candles: **WebSocket** `ws://127.0.0.1:8093/ws/market` (no REST polling)
- Options chain / historical bootstrap: REST to `127.0.0.1:8093` directly from the bundled UI
- No `/api/v1` Next.js proxy in the desktop bundle — the app calls IBKR locally
