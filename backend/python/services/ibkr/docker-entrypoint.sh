#!/bin/bash
set -euo pipefail

export IB_HOST="${IB_HOST:-127.0.0.1}"
export IB_PORT="${IB_PORT:-4002}"

start_gateway() {
  local candidates=(
    "/root/scripts/run.sh"
    "/home/ibgateway/scripts/run.sh"
    "/scripts/run.sh"
    "/usr/local/bin/run.sh"
  )
  for script in "${candidates[@]}"; do
    if [ -f "$script" ]; then
      echo "Starting IB Gateway via $script"
      chmod +x "$script" 2>/dev/null || true
      bash "$script" &
      return 0
    fi
  done
  local found
  found="$(find /home /root /opt /scripts -name run.sh -type f 2>/dev/null | head -1 || true)"
  if [ -n "$found" ]; then
    echo "Starting IB Gateway via discovered $found"
    chmod +x "$found" 2>/dev/null || true
    bash "$found" &
    return 0
  fi
  return 1
}

echo "Starting IB Gateway (paper=${TRADING_MODE:-paper})..."
if ! start_gateway; then
  echo "WARNING: IB Gateway startup script not found; listing likely paths:"
  find /home /root /opt /scripts -maxdepth 4 -type f -name '*.sh' 2>/dev/null | head -20 || true
fi

echo "Waiting for IB Gateway on ${IB_HOST}:${IB_PORT}..."
ready=0
for _ in $(seq 1 90); do
  if (echo > "/dev/tcp/${IB_HOST}/${IB_PORT}") 2>/dev/null; then
    ready=1
    echo "IB Gateway port open"
    break
  fi
  sleep 2
done

if [ "$ready" -ne 1 ]; then
  echo "WARNING: IB Gateway did not open within timeout; API will start anyway"
fi

exec uvicorn services.ibkr.main:app --host 0.0.0.0 --port "${IBKR_PORT:-8093}"
