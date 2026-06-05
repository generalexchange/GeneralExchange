#!/bin/bash
# Cloud-init for IB Gateway droplet — installs Docker for gateway-compose.yml
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
mkdir -p /opt/ibkr-gateway/secrets
cat > /opt/ibkr-gateway/gateway-compose.yml <<'COMPOSE'
services:
  ib-gateway:
    image: ghcr.io/gnzsnz/ib-gateway:stable
    restart: unless-stopped
    env_file: .env
    ports:
      - "4002:4002"
      - "5900:5900"
    volumes:
      - jts-data:/home/ibgateway/Jts
      - ./secrets/tws_password:/run/secrets/tws_password:ro
    ulimits:
      nofile:
        soft: 10000
        hard: 10000

volumes:
  jts-data:
COMPOSE
cat > /opt/ibkr-gateway/README.txt <<'EOF'
IB Gateway droplet ready.

1. Copy infra/digitalocean/.env.example to /opt/ibkr-gateway/.env and fill in credentials.
2. Store the password in /opt/ibkr-gateway/secrets/tws_password (chmod 644).
3. Run: cd /opt/ibkr-gateway && docker compose -f gateway-compose.yml up -d
4. Point IBKR_API_URL / NEXT_PUBLIC_WS_URL at the co-located API (see scripts/configure-vercel-ibkr.ps1).

API port: 4002 (paper). VNC: 5900. noVNC may be available on :6080 if configured on the host.
EOF
