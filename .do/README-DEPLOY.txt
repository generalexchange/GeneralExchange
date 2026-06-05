DIGITALOCEAN — IBKR stack

Apps (deploy: .\scripts\deploy-ibkr-do.ps1  OR  GitHub Actions do-ibkr-deploy.yml)
  general-exchange-ibkr         FastAPI + PostgreSQL (historical bars)
  general-exchange-monte-carlo  Monte Carlo + opportunity engine

IB Gateway (required for live data)
  Run on a DO Droplet: infra/digitalocean/gateway-compose.yml
  Set IB_HOST on ibkr-api to the droplet public IP (App Platform → Settings → Secrets)

Secrets (DO App Platform)
  ibkr-api:      IB_HOST, IB_ACCOUNT (optional), IBKR_API_KEY
  monte-carlo:   IBKR_API_URL (https URL of ibkr app), IBKR_API_KEY, MC_API_KEY

Vercel (Next.js UI only)
  IBKR_API_URL, NEXT_PUBLIC_WS_URL, MONTE_CARLO_API_URL
  Run: .\scripts\configure-vercel-from-do.ps1

Full guide: docs/IBKR_SETUP.md
