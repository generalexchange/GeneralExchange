# Set Vercel env from DigitalOcean app URLs (Option A)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not $env:DIGITALOCEAN_ACCESS_TOKEN) { throw "Set DIGITALOCEAN_ACCESS_TOKEN" }

$rows = doctl apps list --format Spec.Name,DefaultIngress --no-header
$map = @{}
foreach ($row in $rows) {
  if ($row -match '^\S+\s+(\S+)\s+(.+)$') { } 
  $parts = $row -split '\s+', 3
  if ($parts.Count -ge 2) {
    $name = $parts[0]
    $url = ($parts[1..($parts.Count-1)] -join ' ').Trim()
    if ($url -and $url -ne '<nil>') { $map[$name] = $url }
  }
}

# Parse doctl table properly
$map = @{}
doctl apps list --format Spec.Name,DefaultIngress --no-header | ForEach-Object {
  $line = $_.Trim()
  if ($line -match '^(general-exchange-\S+)\s+(https://\S+)') {
    $map[$Matches[1]] = $Matches[2]
  }
}

$ws = $map['general-exchange-ws']
$go = $map['general-exchange-go-api']
$mc = $map['general-exchange-monte-carlo']
if (-not $ws) { Write-Warning "general-exchange-ws not deployed yet" }
if (-not $go) { Write-Warning "general-exchange-go-api not deployed yet" }
if (-not $mc) { Write-Warning "general-exchange-monte-carlo not deployed yet" }

$wsUrl = if ($ws) { ($ws -replace '^https://', 'wss://') + '/ws' } else { '' }
Write-Host "WS:  $wsUrl"
Write-Host "Go:  $go"
Write-Host "MC:  $mc"

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

Set-VercelEnv "NEXT_PUBLIC_WS_URL" $wsUrl
Set-VercelEnv "GO_API_URL" $go
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
