DIGITALOCEAN OPTION A — Vercel UI + DO backend

Architecture
  Vercel     → Next.js (pages people see)
  DO ws      → Polygon live feed → dashboard WebSocket
  DO go-api  → REST /v1/* (market data; Polygon key on DO)
  DO monte-carlo → Python GBM + options probabilities + after-hours BSM

Deploy backend (all three services)
  1. GitHub secret: DIGITALOCEAN_ACCESS_TOKEN
  2. Push main OR run: .\scripts\deploy-backend-do.ps1
  3. App spec: .do/app.yaml (name: general-exchange-backend)

Secrets on DO (each component)
  POLYGON_API_KEY  — ws, go-api, monte-carlo
  MC_API_KEY       — monte-carlo (optional)

Wire Vercel after DO is live
  NEXT_PUBLIC_WS_URL=wss://<ws-component-url>/ws
  GO_API_URL=https://<go-api-component-url>
  MONTE_CARLO_API_URL=https://<monte-carlo-component-url>
  NEXT_PUBLIC_MONTE_CARLO_API_URL=/api/v1/monte-carlo
  POLYGON_API_KEY  — still on Vercel for /api/v1 fallback when Go unreachable

  Run: .\scripts\configure-vercel-from-do.ps1

Python Monte Carlo routes (POST /v1/...)
  price-path, strategy, trade-quality, evaluate
  options/contract-probability  — P(ITM), P(profit), P(underlying up/down)
  options/after-hours-price     — Black-Scholes with Polygon spot
  options/surface               — batch contracts

Fly.io is removed. Do not use services/ws-server/fly.toml.

Local dev
  docker compose --profile app up ws-server monte-carlo-api go-api-server
  npm run dev  (Next on :3003)
