# Provision full IBKR stack on DigitalOcean (apps + gateway droplet)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Get-Command doctl -ErrorAction SilentlyContinue)) {
  winget install -e --id DigitalOcean.Doctl --accept-package-agreements --accept-source-agreements
}

Write-Host "=== Account ===" -ForegroundColor Cyan
doctl account get

Write-Host "`n=== Deploy IBKR API + PostgreSQL ===" -ForegroundColor Cyan
doctl apps create --spec .do\ibkr-app.yaml --upsert --wait

$ibkrUrl = $null
doctl apps list --format Spec.Name,DefaultIngress --no-header | ForEach-Object {
  if ($_ -match '^general-exchange-ibkr\s+(https://\S+)') { $script:ibkrUrl = $Matches[1] }
}
if (-not $ibkrUrl) { throw "IBKR app URL not found after deploy" }
Write-Host "IBKR API URL: $ibkrUrl" -ForegroundColor Green

# Patch monte-carlo spec with live IBKR URL
$mcSpec = Get-Content .do\monte-carlo-app.yaml -Raw
$mcSpec = $mcSpec -replace 'type: SECRET\r?\n', ''
$mcSpec = $mcSpec -replace '(key: IBKR_API_URL\r?\n)(\s+scope:)', "`$1        value: `"$ibkrUrl`"`n`$2"
if ($mcSpec -notmatch 'value:.*ibkr') {
  $mcSpec = $mcSpec -replace '(key: IBKR_API_URL\r?\n)', "`$1        value: `"$ibkrUrl`"`n"
}
$mcSpec = $mcSpec -replace '(key: IBKR_API_KEY\r?\n)(\s+scope:)', "`$1        value: `"gx_ibkr_dev_key`"`n`$2"
$mcSpec = $mcSpec -replace '(key: MC_API_KEY\r?\n)(\s+scope:)', "`$1        value: `"gx_live_dev_demo_key`"`n`$2"
$mcPath = ".do\monte-carlo-app.resolved.yaml"
Set-Content -Path $mcPath -Value $mcSpec -NoNewline

Write-Host "`n=== Deploy Monte Carlo ===" -ForegroundColor Cyan
doctl apps create --spec $mcPath --upsert --wait

Write-Host "`n=== Create IB Gateway droplet (if none) ===" -ForegroundColor Cyan
$existing = doctl compute droplet list --format Name --no-header | Select-String "general-exchange-ib-gateway"
if (-not $existing) {
  doctl compute droplet create general-exchange-ib-gateway `
    --region nyc `
    --size s-1vcpu-1gb `
    --image ubuntu-22-04-x64 `
    --user-data-file infra\digitalocean\droplet-init.sh `
    --wait
} else {
  Write-Host "Gateway droplet already exists" -ForegroundColor Yellow
}

$gwIp = (doctl compute droplet list --format Name,PublicIPv4 --no-header | Select-String "general-exchange-ib-gateway").ToString()
if ($gwIp -match '(\d+\.\d+\.\d+\.\d+)') {
  $gatewayIp = $Matches[1]
  Write-Host "Gateway droplet IP: $gatewayIp" -ForegroundColor Green

  $appId = (doctl apps list --format ID,Spec.Name --no-header | Select-String "general-exchange-ibkr").ToString().Split()[0]
  if ($appId) {
    Write-Host "Updating IB_HOST on ibkr-api to $gatewayIp ..."
    $specJson = doctl apps spec get $appId --format json | ConvertFrom-Json
    foreach ($svc in $specJson.services) {
      if ($svc.name -eq "ibkr-api") {
        foreach ($env in $svc.envs) {
          if ($env.key -eq "IB_HOST") { $env.value = $gatewayIp }
        }
      }
    }
    $tmp = Join-Path $env:TEMP "ibkr-spec-patch.json"
    $specJson | ConvertTo-Json -Depth 20 | Set-Content $tmp
    doctl apps update $appId --spec $tmp --wait
    Remove-Item $tmp -Force
  }
}

Write-Host "`n=== DigitalOcean resources ===" -ForegroundColor Green
doctl apps list --format Spec.Name,DefaultIngress
doctl compute droplet list --format Name,PublicIPv4,Status

$wsUrl = ($ibkrUrl -replace '^https://', 'wss://') + '/ws/stocks?symbols=SPY,QQQ,NVDA,AAPL,TSLA'
Write-Host "`nWire Vercel:" -ForegroundColor Cyan
Write-Host "  IBKR_API_URL=$ibkrUrl"
Write-Host "  NEXT_PUBLIC_WS_URL=$wsUrl"
Write-Host "  MONTE_CARLO_API_URL=<monte-carlo URL from list above>"
Write-Host "`nGateway: SSH to droplet, add IB credentials, run docker compose (see infra/digitalocean/gateway-compose.yml)"
