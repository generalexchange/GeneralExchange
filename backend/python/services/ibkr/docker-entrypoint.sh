#!/bin/bash
set -euo pipefail

export IB_HOST="${IB_HOST:-127.0.0.1}"
export IB_PORT="${IB_PORT:-4002}"

echo "Starting IB Gateway (paper=${TRADING_MODE:-paper})..."
if [ -x /root/scripts/run.sh ]; then
  /root/scripts/run.sh &
else
  echo "ERROR: /root/scripts/run.sh not found in gateway image"
  exit 1
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
