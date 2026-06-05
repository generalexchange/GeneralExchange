# Push .env values to Vercel (uses logged-in CLI token from auth.json)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$authPath = "$env:APPDATA\xdg.data\com.vercel.cli\auth.json"
if (-not (Test-Path $authPath)) { throw "Vercel CLI not logged in. Run: npx vercel login" }
$token = (Get-Content $authPath | ConvertFrom-Json).token
$h = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

$projectId = "prj_L2zhHk96gykMj9AU9O4W1WCa14ln"

$envFile = Join-Path $Root ".env"
if (-not (Test-Path $envFile)) { throw "Missing .env" }

$local = @{}
Get-Content $envFile | ForEach-Object {
  $t = $_.Trim()
  if (-not $t -or $t.StartsWith("#")) { return }
  $i = $t.IndexOf("=")
  if ($i -lt 1) { return }
  $local[$t.Substring(0, $i).Trim()] = $t.Substring($i + 1).Trim()
}

# Ensure derived keys
if (-not $local["NEXT_PUBLIC_LEGEND_URL"]) { $local["NEXT_PUBLIC_LEGEND_URL"] = "https://legend.general.exchange" }
if (-not $local["MC_API_KEY"]) { $local["MC_API_KEY"] = $local["GE_API_KEY"] }

$keys = @(
  "IBKR_API_URL",
  "IBKR_API_KEY",
  "NEXT_PUBLIC_LEGEND_URL",
  "NEXT_PUBLIC_ROOT_DOMAIN",
  "NEXT_PUBLIC_WS_URL",
  "NEXT_PUBLIC_MONTE_CARLO_API_URL",
  "MONTE_CARLO_API_URL",
  "MC_API_KEY",
  "GE_API_KEY",
  "JWT_SIGNING_SECRET",
  "SITE_URL"
)

$existing = Invoke-RestMethod "https://api.vercel.com/v9/projects/$projectId/env" -Headers $h
$byKey = @{}
foreach ($e in $existing.envs) { $byKey[$e.key] = $e }

function Set-VercelEnv($key, $value) {
  if (-not $value) { Write-Host "  skip $key (empty)"; return }
  $prev = $byKey[$key]
  if ($prev) {
    Invoke-RestMethod -Method DELETE "https://api.vercel.com/v9/projects/$projectId/env/$($prev.id)" -Headers $h | Out-Null
  }
  $body = @{
    key      = $key
    value    = $value
    type     = "encrypted"
    target   = @("production", "preview")
  } | ConvertTo-Json
  Invoke-RestMethod -Method POST "https://api.vercel.com/v10/projects/$projectId/env" -Headers $h -Body $body | Out-Null
  Write-Host "  set $key"
}

Write-Host "Pushing env to generalexchange ($projectId)..."
foreach ($key in $keys) { Set-VercelEnv $key $local[$key] }

Write-Host "`nTriggering production redeploy..."
$deployBody = @{
  name    = "generalexchange"
  project = $projectId
  target  = "production"
  gitSource = @{
    type = "github"
    org  = "generalexchange"
    repo = "GeneralExchange"
    ref  = "main"
  }
} | ConvertTo-Json -Depth 5
$dep = Invoke-RestMethod -Method POST "https://api.vercel.com/v13/deployments" -Headers $h -Body $deployBody
Write-Host "Deploy: https://$($dep.url)"
