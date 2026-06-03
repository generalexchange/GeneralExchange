"""Redis client (real-time cache + WS fan-out state)."""

from __future__ import annotations

import redis

from .config import Config


def get_redis(cfg: Config) -> "redis.Redis":
    return redis.from_url(cfg.redis_url, decode_responses=True)
