# Start the local General Exchange data stack (core + app services).
# Run from repo root:  .\scripts\setup-local-stack.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Test-Path ".env")) {
  Write-Host "Creating .env from .env.example ..."
  Copy-Item ".env.example" ".env"

  $jwt = -join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
  $content = Get-Content ".env" -Raw
  $content = $content -replace 'JWT_SIGNING_SECRET=change-me-in-prod', "JWT_SIGNING_SECRET=$jwt"
  Set-Content ".env" $content -NoNewline

  Write-Host ""
  Write-Host "IMPORTANT: Edit .env and set POLYGON_API_KEY to your Massive/Polygon key."
  Write-Host "           Regenerate the key if you shared it in a screenshot."
  Write-Host ""
}

Write-Host "Starting docker compose (core + app profile). First run builds images — may take several minutes."
docker compose --profile app up -d --build

Write-Host ""
Write-Host "Waiting for Go API health ..."
$ok = $false
for ($i = 0; $i -lt 60; $i++) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:8080/healthz" -UseBasicParsing -TimeoutSec 3
    if ($r.StatusCode -eq 200) { $ok = $true; break }
  } catch {}
  Start-Sleep -Seconds 5
}

if ($ok) {
  Write-Host "Go API is up at http://localhost:8080"
} else {
  Write-Host "Go API not ready yet — check: docker compose --profile app logs go-api-server"
}

Write-Host ""
Write-Host "Endpoints:"
Write-Host "  Go REST API     http://localhost:8080"
Write-Host "  Go WebSocket    ws://localhost:8081"
Write-Host "  ClickHouse      http://localhost:8123"
Write-Host "  MinIO console   http://localhost:9001"
Write-Host ""
Write-Host "For Vercel production env vars:"
Write-Host "  1. Create token at https://vercel.com/account/tokens"
Write-Host "  2. `$env:VERCEL_TOKEN = '...'"
Write-Host "  3. node scripts/push-vercel-env.mjs"
