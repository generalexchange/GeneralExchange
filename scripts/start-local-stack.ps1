# Start IBKR Python service and verify IB Gateway (port 4002).
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$PythonRoot = Join-Path $Root "backend\python"

function Test-Port([int]$Port) {
  try {
    return (Test-NetConnection -ComputerName 127.0.0.1 -Port $Port -WarningAction SilentlyContinue).TcpTestSucceeded
  } catch {
    return $false
  }
}

function Get-IbkrHealth {
  try {
    return Invoke-RestMethod -Uri "http://127.0.0.1:8093/health" -TimeoutSec 4
  } catch {
    return $null
  }
}

Write-Host "`ngeneral.exchange - local IBKR stack`n" -ForegroundColor Cyan

$gwPort = if ($env:IB_PORT) { [int]$env:IB_PORT } else { 4002 }
$gwOk = Test-Port $gwPort

if (-not $gwOk) {
  Write-Host "IB Gateway is NOT listening on port $gwPort." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "  1. Open IB Gateway (paper) and log in" -ForegroundColor Gray
  Write-Host '  2. Configure - Settings - API - Settings:' -ForegroundColor Gray
  Write-Host "     - Enable ActiveX and Socket Clients" -ForegroundColor Gray
  Write-Host "     - Socket port: $gwPort" -ForegroundColor Gray
  Write-Host "     - Trusted IP: 127.0.0.1" -ForegroundColor Gray
  Write-Host "  3. Leave Gateway running, then re-run this script" -ForegroundColor Gray
  Write-Host ""

  $candidates = @(
    "$env:USERPROFILE\Jts\ibgateway\*\ibgateway.exe",
    "C:\Jts\ibgateway\*\ibgateway.exe"
  )
  foreach ($pattern in $candidates) {
    $exe = Get-Item $pattern -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($exe) {
      Write-Host "Launching IB Gateway: $($exe.FullName)" -ForegroundColor Green
      Start-Process -FilePath $exe.FullName
      break
    }
  }
} else {
  Write-Host "IB Gateway port $gwPort is open." -ForegroundColor Green
}

$health = Get-IbkrHealth
if ($health) {
  Write-Host "IBKR service on :8093 - running (connected=$($health.connected))" -ForegroundColor $(if ($health.connected) { "Green" } else { "Yellow" })
} else {
  Write-Host "Starting IBKR service on http://127.0.0.1:8093 ..." -ForegroundColor Yellow
  $env:IB_HOST = if ($env:IB_HOST) { $env:IB_HOST } else { "127.0.0.1" }
  $env:IB_PORT = "$gwPort"
  $env:IB_PAPER = if ($env:IB_PAPER) { $env:IB_PAPER } else { "true" }
  Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "cd '$PythonRoot'; `$env:IB_HOST='127.0.0.1'; `$env:IB_PORT='$gwPort'; `$env:IB_PAPER='true'; py -3.11 -m uvicorn services.ibkr.main:app --host 127.0.0.1 --port 8093"
  )
  Start-Sleep -Seconds 3
  $health = Get-IbkrHealth
}

if ($health -and $health.connected) {
  Write-Host "`nStack ready. Open Legend or run: npm run dev" -ForegroundColor Green

  $mcHealth = $null
  try {
    $mcHealth = Invoke-RestMethod -Uri "http://127.0.0.1:8092/health" -TimeoutSec 2
  } catch { }

  if (-not $mcHealth) {
    $rustMc = Join-Path $Root "backend\rust\target\release\monte-carlo.exe"
    if (-not (Test-Path $rustMc)) {
      Write-Host "Building Rust monte-carlo (release)..." -ForegroundColor Yellow
      Push-Location (Join-Path $Root "backend\rust")
      cargo build -p monte-carlo --release 2>&1 | Out-Null
      Pop-Location
    }
    if (Test-Path $rustMc) {
      Write-Host "Starting Rust monte-carlo on http://127.0.0.1:8092 ..." -ForegroundColor Yellow
      Start-Process powershell -ArgumentList @(
        "-NoExit", "-Command",
        "cd '$Root'; `$env:IBKR_API_URL='http://127.0.0.1:8093'; & '$rustMc'"
      )
    }
  } else {
    Write-Host "Monte Carlo service on :8092 - running ($($mcHealth.service))" -ForegroundColor Green
  }
} elseif ($health) {
  Write-Host "`nIBKR service is up but not connected to Gateway - finish Gateway login/API settings, then refresh Legend." -ForegroundColor Yellow
} else {
  Write-Host "`nCould not reach IBKR service on :8093. Check Python 3.11 and backend/python/requirements." -ForegroundColor Red
}

Write-Host ""
