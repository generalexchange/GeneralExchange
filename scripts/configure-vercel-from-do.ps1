# Configure Vercel production env to point at DigitalOcean backend (Option A).
# Requires: doctl auth + Vercel CLI login (or VERCEL_TOKEN).

param(
  [string]$DoToken = $env:DIGITALOCEAN_ACCESS_TOKEN,
  [string]$AppName = "general-exchange-backend"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not $DoToken) { throw "Set DIGITALOCEAN_ACCESS_TOKEN" }
$env:DIGITALOCEAN_ACCESS_TOKEN = $DoToken

$appId = (doctl apps list --format ID,Spec.Name --no-header | Where-Object { $_ -match "\s$AppName$" } | ForEach-Object { ($_ -split '\s+')[0] } | Select-Object -First 1)
if (-not $appId) { throw "DO app '$AppName' not found. Run scripts/deploy-backend-do.ps1 first." }

Write-Host "App ID: $appId"
$specYaml = doctl apps spec get $appId -o yaml
# Default ingress is on the app; per-service URLs from deployment
$ingress = (doctl apps get $appId --format DefaultIngress --no-header).Trim()
Write-Host "App ingress: $ingress"

# DO multi-service apps expose component URLs in the dashboard; fetch via API
$json = doctl apps get $appId -o json | ConvertFrom-Json
$urls = @{}
foreach ($svc in $json.spec.services) {
  $name = $svc.name
  $live = $json.live_url
  if ($name -eq 'ws') { $urls.WS = "wss://$($live -replace '^https://','')/ws" }
}
# Fallback: use app-level ingress for MC until component URLs are wired
$mcUrl = $ingress
$goUrl = $ingress
$wsUrl = if ($urls.WS) { $urls.WS } else { "wss://$($ingress -replace '^https://','')/ws" }

Write-Host "Setting Vercel env..."
Write-Host "  GO_API_URL=$goUrl"
Write-Host "  MONTE_CARLO_API_URL=$mcUrl"
Write-Host "  NEXT_PUBLIC_WS_URL=$wsUrl"
Write-Host "  NEXT_PUBLIC_MONTE_CARLO_API_URL=/api/v1/monte-carlo"

foreach ($envName in @('production', 'preview')) {
  npx vercel@latest env add GO_API_URL $envName --value $goUrl --yes --force 2>$null
  npx vercel@latest env add MONTE_CARLO_API_URL $envName --value $mcUrl --yes --force 2>$null
  npx vercel@latest env add NEXT_PUBLIC_WS_URL $envName --value $wsUrl --yes --force 2>$null
  npx vercel@latest env add NEXT_PUBLIC_MONTE_CARLO_API_URL $envName --value "/api/v1/monte-carlo" --yes --force 2>$null
}

Write-Host "Redeploying Vercel production..."
npx vercel@latest --prod --yes
