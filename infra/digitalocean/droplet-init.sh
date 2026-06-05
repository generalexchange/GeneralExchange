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
mkdir -p /opt/ibkr-gateway
cat > /opt/ibkr-gateway/README.txt <<'EOF'
IB Gateway droplet ready.

1. SSH in and create /opt/ibkr-gateway/.env:
   TWS_USERID=your_ibkr_username
   TWS_PASSWORD=your_ibkr_password
   VNC_PASSWORD=choose_a_vnc_password

2. Copy gateway-compose.yml from the repo infra/digitalocean/ folder to /opt/ibkr-gateway/

3. Run:
   cd /opt/ibkr-gateway
   docker compose -f gateway-compose.yml up -d

4. Set IB_HOST on DO App Platform (general-exchange-ibkr) to this droplet's public IP.

API port: 4002 (paper). VNC: 5900 for 2FA if needed.
EOF
