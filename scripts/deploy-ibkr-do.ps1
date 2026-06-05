# Deploy IBKR + Monte Carlo apps to DigitalOcean App Platform
param([string]$DoToken = $env:DIGITALOCEAN_ACCESS_TOKEN)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Get-Command doctl -ErrorAction SilentlyContinue)) {
  winget install -e --id DigitalOcean.Doctl --accept-package-agreements --accept-source-agreements
}
if (-not $DoToken) { throw "Set DIGITALOCEAN_ACCESS_TOKEN" }
$env:DIGITALOCEAN_ACCESS_TOKEN = $DoToken
doctl auth init --access-token $DoToken

$specs = @(
  ".do\ibkr-app.yaml",
  ".do\monte-carlo-app.yaml"
)

foreach ($spec in $specs) {
  Write-Host "`n=== Deploying $spec ===" -ForegroundColor Cyan
  doctl apps create --spec $spec --upsert --wait
}

Write-Host "`n=== DO apps ===" -ForegroundColor Green
doctl apps list --format Spec.Name,DefaultIngress

$ibkr = (doctl apps list --format Spec.Name,DefaultIngress --no-header | Select-String "general-exchange-ibkr").ToString()
if ($ibkr -match '(https://\S+)') {
  $ibkrUrl = $Matches[1]
  Write-Host "`nSet App Platform secrets on general-exchange-ibkr:" -ForegroundColor Yellow
  Write-Host "  IB_HOST = <your Gateway droplet public IP>"
  Write-Host "  IBKR_API_KEY = <shared secret>"
  Write-Host "`nSet on general-exchange-monte-carlo:" -ForegroundColor Yellow
  Write-Host "  IBKR_API_URL = $ibkrUrl"
  Write-Host "  IBKR_API_KEY = <same secret>"
  Write-Host "  MC_API_KEY = <same as GE_API_KEY on Vercel>"
}

Write-Host "`nRun scripts/configure-vercel-from-do.ps1 to wire Vercel." -ForegroundColor Cyan
