# Deploy the unified WebSocket server to Fly.io and wire production env.
# Run from repo root:
#   .\scripts\deploy-production-ws.ps1 -FlyToken "FlyV1 ..."
#
# Or set $env:FLY_API_TOKEN first, then run without -FlyToken.

param(
  [string]$FlyToken = $env:FLY_API_TOKEN,
  [string]$Repo = "generalexchange/GeneralExchange",
  [switch]$UseSameDomainProxy
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$FlyWsUrl = "wss://general-exchange-ws.fly.dev/ws"
$SameDomainWsUrl = "wss://general.exchange/ws"

if (-not $FlyToken) {
  Write-Host ""
  Write-Host "Fly.io API token required (one-time)."
  Write-Host "  1. Open https://fly.io/user/personal_access_tokens"
  Write-Host "  2. Create token named 'general-exchange-ws'"
  Write-Host "  3. Re-run: .\scripts\deploy-production-ws.ps1 -FlyToken 'FlyV1 ...'"
  Write-Host ""
  Start-Process "https://fly.io/user/personal_access_tokens"
  exit 1
}

Write-Host ""
Write-Host "Deploy WS server (NOT the Next.js app — that stays on Vercel):"
Write-Host "  cd services/ws-server"
Write-Host "  flyctl deploy --app general-exchange-ws"
Write-Host ""
Write-Host "Setting FLY_API_TOKEN on $Repo ..."
$FlyToken | gh secret set FLY_API_TOKEN --repo $Repo

Write-Host "Triggering GitHub Actions deploy ..."
gh workflow run ws-server-deploy.yml --repo $Repo

Write-Host "Waiting for workflow to start ..."
Start-Sleep -Seconds 8
$run = gh run list --repo $Repo --workflow ws-server-deploy.yml --limit 1 --json databaseId,status,conclusion | ConvertFrom-Json
$runId = $run[0].databaseId
Write-Host "Run: https://github.com/$Repo/actions/runs/$runId"

Write-Host "Polling Fly health (up to 8 min) ..."
$healthy = $false
for ($i = 0; $i -lt 48; $i++) {
  try {
    $r = Invoke-WebRequest -Uri "https://general-exchange-ws.fly.dev/health" -UseBasicParsing -TimeoutSec 10
    if ($r.StatusCode -eq 200) {
      Write-Host "Fly WS server: $($r.Content)"
      $healthy = $true
      break
    }
  } catch {}
  Start-Sleep -Seconds 10
}

if (-not $healthy) {
  Write-Host "Fly health not ready yet — check workflow logs:"
  Write-Host "  gh run watch $runId --repo $Repo"
  exit 1
}

$wsUrl = if ($UseSameDomainProxy) { $SameDomainWsUrl } else { $FlyWsUrl }
Write-Host ""
Write-Host "Updating Vercel NEXT_PUBLIC_WS_URL -> $wsUrl"

if (Get-Command vercel -ErrorAction SilentlyContinue) {
  echo $wsUrl | vercel env rm NEXT_PUBLIC_WS_URL production --yes 2>$null
  echo $wsUrl | vercel env add NEXT_PUBLIC_WS_URL production
  Write-Host "Redeploying Vercel production ..."
  vercel --prod --yes 2>&1 | Out-Host
} else {
  Write-Host "Vercel CLI not found — set manually in dashboard:"
  Write-Host "  NEXT_PUBLIC_WS_URL = $wsUrl"
}

Write-Host ""
Write-Host "Production WebSocket endpoint: $wsUrl"
if ($UseSameDomainProxy) {
  Write-Host "Cloudflare worker still required for $SameDomainWsUrl — see infra/cloudflare/"
} else {
  Write-Host "Direct Fly URL — no Cloudflare worker needed."
}
Write-Host "Verify: open https://general.exchange and check Dashboard live badge."
