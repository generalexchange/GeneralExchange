# Deploy all DigitalOcean backend apps (Option A)
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
  ".do\ws-app.yaml",
  ".do\go-api-app.yaml",
  ".do\monte-carlo-app.yaml"
)

foreach ($spec in $specs) {
  Write-Host "`n=== Deploying $spec ===" -ForegroundColor Cyan
  doctl apps create --spec $spec --upsert --wait
}

Write-Host "`n=== DO apps ===" -ForegroundColor Green
doctl apps list --format Spec.Name,DefaultIngress
Write-Host "`nRun scripts/configure-vercel-from-do.ps1 to wire Vercel."
