# IB Gateway + FastAPI on one container (App Platform)
FROM ghcr.io/gnzsnz/ib-gateway:stable

USER root
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    IB_HOST=127.0.0.1 \
    IB_PORT=4002 \
    IBKR_PORT=8093 \
    TRADING_MODE=paper \
    READ_ONLY_API=no \
    TWS_ACCEPT_INCOMING=accept \
    EXISTING_SESSION_DETECTED_ACTION=primary \
    TWOFA_TIMEOUT_ACTION=restart \
    RELOGIN_AFTER_TWOFA_TIMEOUT=yes

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY services/ibkr/requirements.txt /app/requirements.txt
RUN pip3 install --no-cache-dir --break-system-packages -r /app/requirements.txt

COPY services/ibkr /app/services/ibkr
RUN chmod +x /app/services/ibkr/docker-entrypoint.sh

EXPOSE 8093 4002

CMD ["/app/services/ibkr/docker-entrypoint.sh"]
