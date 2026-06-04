# Deploy Monte Carlo to DigitalOcean App Platform from .do/app.yaml
# Requires: doctl (https://docs.digitalocean.com/reference/doctl/how-to/install/)
#   $env:DIGITALOCEAN_ACCESS_TOKEN = "dop_v1_..."
# Optional: $env:MC_API_KEY = "your-secret" (set in DO app if not passed here)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $RepoRoot

if (-not (Get-Command doctl -ErrorAction SilentlyContinue)) {
    Write-Host "Installing doctl via winget..."
    winget install -e --id DigitalOcean.Doctl --accept-package-agreements --accept-source-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
        [System.Environment]::GetEnvironmentVariable("Path", "User")
}

if (-not $env:DIGITALOCEAN_ACCESS_TOKEN) {
    Write-Error "Set DIGITALOCEAN_ACCESS_TOKEN (DO Control Panel -> API -> Tokens)"
}

doctl auth init --access-token $env:DIGITALOCEAN_ACCESS_TOKEN

$spec = Join-Path $RepoRoot ".do\app.yaml"
Write-Host "Creating/updating app from $spec ..."
doctl apps create --spec $spec --upsert

Write-Host ""
Write-Host "Done. List apps: doctl apps list"
Write-Host "Logs: doctl apps logs <APP_ID> --type build"
Write-Host "After deploy, set Vercel MONTE_CARLO_API_URL to the app URL + MC_API_KEY."
