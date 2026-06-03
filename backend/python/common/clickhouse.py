"""ClickHouse client + batch insert helpers (the system of record)."""

from __future__ import annotations

from typing import Any

import clickhouse_connect

from .config import Config


def get_client(cfg: Config):
    return clickhouse_connect.get_client(
        host=cfg.clickhouse_host,
        port=cfg.clickhouse_http_port,
        database=cfg.clickhouse_db,
    )


def insert_dicts(client, table: str, rows: list[dict[str, Any]]) -> int:
    """Insert a batch of uniformly-keyed dicts into `table`.

    Column order is taken from the first row; every row must share that shape.
    """
    if not rows:
        return 0
    columns = list(rows[0].keys())
    data = [[row[c] for c in columns] for row in rows]
    client.insert(table, data, column_names=columns)
    return len(rows)
