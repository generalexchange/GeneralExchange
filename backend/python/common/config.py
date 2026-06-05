"""Environment-driven configuration shared by all services."""

from __future__ import annotations

import os
from dataclasses import dataclass, field


def _symbols() -> list[str]:
    raw = os.getenv("SYMBOLS", "SPY,QQQ,NVDA,AAPL,TSLA,AMD")
    return [s.strip().upper() for s in raw.split(",") if s.strip()]


@dataclass
class Config:
    redpanda_brokers: str = os.getenv("REDPANDA_BROKERS", "localhost:19092")
    clickhouse_host: str = os.getenv("CLICKHOUSE_HOST", "localhost")
    clickhouse_http_port: int = int(os.getenv("CLICKHOUSE_HTTP_PORT", "8123"))
    clickhouse_db: str = os.getenv("CLICKHOUSE_DB", "general_exchange")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    minio_endpoint: str = os.getenv("MINIO_ENDPOINT", "localhost:9002")
    minio_access_key: str = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    minio_secret_key: str = os.getenv("MINIO_SECRET_KEY", "minioadmin")
    ibkr_api_url: str = os.getenv("IBKR_API_URL", "http://localhost:8093")
    ibkr_api_key: str = os.getenv("IBKR_API_KEY", "")
    openobserve_url: str = os.getenv("OPENOBSERVE_URL", "")
    # FloppyDisk (floppydisk.cc) is a separate, external strategy-storage
    # service. Until it ships, the MinIO-backed client is used. When the
    # FLOPPYDISK_URL is set, the HTTP client targets the real service instead.
    floppydisk_url: str = os.getenv("FLOPPYDISK_URL", "")
    floppydisk_api_key: str = os.getenv("FLOPPYDISK_API_KEY", "")
    symbols: list[str] = field(default_factory=_symbols)

    @property
    def has_ibkr(self) -> bool:
        return bool(self.ibkr_api_url)

    @property
    def has_floppydisk(self) -> bool:
        return bool(self.floppydisk_url)


def load() -> Config:
    return Config()
