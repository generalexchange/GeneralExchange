# DigitalOcean deployment (IBKR stack)

## One-time setup

1. **GitHub secret** (enables auto-deploy on push to `main`):
   ```powershell
   gh secret set DIGITALOCEAN_ACCESS_TOKEN
   ```

2. **Deploy apps** (first time):
   ```powershell
   $env:DIGITALOCEAN_ACCESS_TOKEN = "dop_v1_..."
   .\scripts\deploy-ibkr-do.ps1
   ```

3. **IB Gateway droplet** (required for live quotes):
   - Create Ubuntu 22.04 droplet ($6/mo)
   - Copy `infra/digitalocean/gateway-compose.yml` and `.env` with `TWS_USERID` / `TWS_PASSWORD`
   - `docker compose up -d`
   - In DO App Platform → `general-exchange-ibkr` → Settings → App-Level Secrets:
     - `IB_HOST` = droplet public IP
     - `IBKR_API_KEY` = shared API key

4. **Monte Carlo app secrets**:
   - `IBKR_API_URL` = `https://general-exchange-ibkr-xxxxx.ondigitalocean.app`
   - `IBKR_API_KEY` = same as above
   - `MC_API_KEY` = same as Vercel `GE_API_KEY`

5. **Wire Vercel**:
   ```powershell
   .\scripts\configure-vercel-from-do.ps1
   ```

## Apps

| App | Spec | Port |
|-----|------|------|
| `general-exchange-ibkr` | `.do/ibkr-app.yaml` | 8093 |
| `general-exchange-monte-carlo` | `.do/monte-carlo-app.yaml` | 8092 |

## CI

Push to `main` runs `.github/workflows/do-ibkr-deploy.yml` when `DIGITALOCEAN_ACCESS_TOKEN` is set.

## Tear down old Polygon apps

Delete from DO dashboard if still running:
- `general-exchange-ws`
- `general-exchange-go-api`
