# Wire Vercel env for IBKR stack (no DO token required)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$ibkr = "https://general-exchange-ibkr-7ed3d.ondigitalocean.app"
$mc = "https://general-exchange-monte-carlo-jgltm.ondigitalocean.app"
$wsUrl = ($ibkr -replace '^https://', 'wss://') + '/ws/stocks?symbols=SPY,QQQ,NVDA,AAPL,TSLA,AMD,MSFT,AMZN,META'

Write-Host "IBKR: $ibkr"
Write-Host "WS:   $wsUrl"
Write-Host "MC:   $mc"

$authPath = "$env:APPDATA\xdg.data\com.vercel.cli\auth.json"
if (-not (Test-Path $authPath)) { throw "Vercel CLI not logged in. Run: npx vercel login" }
$token = (Get-Content $authPath | ConvertFrom-Json).token
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
Set-VercelEnv "IBKR_API_KEY" "gx_ibkr_dev_key"
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
Write-Host "Vercel deploy: https://$($dep.url)"
