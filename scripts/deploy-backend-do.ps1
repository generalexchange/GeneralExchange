# Deploy full DigitalOcean backend: ws-server + go-api + Python monte-carlo
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
doctl apps create --spec .do/app.yaml --upsert --wait
Write-Host "Done. Run scripts/configure-vercel-from-do.ps1 to wire Vercel."
