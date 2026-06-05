# Wire Vercel env from DigitalOcean IBKR + Monte Carlo URLs
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not $env:DIGITALOCEAN_ACCESS_TOKEN) { throw "Set DIGITALOCEAN_ACCESS_TOKEN" }

$map = @{}
doctl apps list --format Spec.Name,DefaultIngress --no-header | ForEach-Object {
  $line = $_.Trim()
  if ($line -match '^(general-exchange-\S+)\s+(https://\S+)') {
    $map[$Matches[1]] = $Matches[2]
  }
}

$ibkr = $map['general-exchange-ibkr']
$mc = $map['general-exchange-monte-carlo']
if (-not $ibkr) { Write-Warning "general-exchange-ibkr not deployed yet" }
if (-not $mc) { Write-Warning "general-exchange-monte-carlo not deployed yet" }

$wsUrl = if ($ibkr) {
  ($ibkr -replace '^https://', 'wss://') + '/ws/stocks?symbols=SPY,QQQ,NVDA,AAPL,TSLA'
} else { '' }

Write-Host "IBKR: $ibkr"
Write-Host "WS:   $wsUrl"
Write-Host "MC:   $mc"

$token = (Get-Content "$env:APPDATA\xdg.data\com.vercel.cli\auth.json" | ConvertFrom-Json).token
$projectId = "prj_L2zhHk96gykMj9AU9O4W1WCa14ln"
$h = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

function Set-VercelEnv($key, $value) {
  if (-not $value) { Write-Host "skip $key"; return }
  $existing = Invoke-RestMethod "https://api.vercel.com/v9/projects/$projectId/env" -Headers $h
  $prev = $existing.envs | Where-Object { $_.key -eq $key } | Select-Object -First 1
  if ($prev) {
    Invoke-RestMethod -Method DELETE "https://api.vercel.com/v9/projects/$projectId/env/$($prev.id)" -Headers $h | Out-Null
  }
  $body = @{ key = $key; value = $value; type = "encrypted"; target = @("production", "preview") } | ConvertTo-Json
  Invoke-RestMethod -Method POST "https://api.vercel.com/v10/projects/$projectId/env" -Headers $h -Body $body | Out-Null
  Write-Host "set $key"
}

Set-VercelEnv "IBKR_API_URL" $ibkr
Set-VercelEnv "NEXT_PUBLIC_WS_URL" $wsUrl
Set-VercelEnv "MONTE_CARLO_API_URL" $mc
Set-VercelEnv "NEXT_PUBLIC_MONTE_CARLO_API_URL" "/api/v1/monte-carlo"

$deployBody = @{
  name = "generalexchange"
  project = $projectId
  target = "production"
  gitSource = @{ type = "github"; org = "generalexchange"; repo = "GeneralExchange"; ref = "main" }
} | ConvertTo-Json -Depth 5
$dep = Invoke-RestMethod -Method POST "https://api.vercel.com/v13/deployments" -Headers $h -Body $deployBody
Write-Host "Vercel deploy: $($dep.url)"
