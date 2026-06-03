"""Historical data loading + DuckDB feature computation.

Per the architecture, historical bars are loaded into DuckDB — an in-process
columnar engine — so the tight inner loop of a walk-forward backtest avoids the
network round-trip of querying ClickHouse on every bar. Bars come from
ClickHouse `candles` when available; otherwise a deterministic synthetic series
is generated (seeded), so a backtest is reproducible with or without a live
warehouse.
"""

from __future__ import annotations

import datetime as dt
import hashlib

import duckdb
import numpy as np


def _seed_from(symbol: str, start: str, end: str, seed: int) -> int:
    h = hashlib.sha256(f"{symbol}|{start}|{end}|{seed}".encode()).hexdigest()
    return int(h[:8], 16)


def _synth_daily(symbol: str, start: str, end: str, seed: int) -> list[dict]:
    rng = np.random.default_rng(_seed_from(symbol, start, end, seed))
    base = {"SPY": 300, "QQQ": 200, "NVDA": 15, "AAPL": 120, "TSLA": 60, "AMD": 30}.get(symbol, 100)
    d0 = dt.date.fromisoformat(start)
    d1 = dt.date.fromisoformat(end)
    days = max(60, (d1 - d0).days)
    price = float(base)
    drift, vol = 0.0004, 0.018
    bars: list[dict] = []
    cur = d0
    for _ in range(days):
        if cur.weekday() < 5:  # trading days only
            shock = rng.normal(drift, vol)
            o = price
            c = max(1.0, o * (1 + shock))
            hi = max(o, c) * (1 + abs(rng.normal(0, 0.004)))
            lo = min(o, c) * (1 - abs(rng.normal(0, 0.004)))
            bars.append({
                "ts": dt.datetime.combine(cur, dt.time()),
                "open": round(o, 2), "high": round(hi, 2), "low": round(lo, 2),
                "close": round(c, 2), "volume": int(rng.integers(1_000_000, 60_000_000)),
            })
            price = c
        cur += dt.timedelta(days=1)
    return bars


def _from_clickhouse(ch, symbol: str, start: str, end: str) -> list[dict]:
    try:
        rows = ch.query(
            """
            SELECT open_time, open, high, low, close, volume
            FROM candles
            WHERE symbol = {s:String} AND interval = '1d'
              AND open_time >= {a:DateTime} AND open_time <= {b:DateTime}
            ORDER BY open_time
            """,
            parameters={"s": symbol, "a": f"{start} 00:00:00", "b": f"{end} 23:59:59"},
        ).result_rows
    except Exception:  # noqa: BLE001 — warehouse empty / unreachable
        return []
    return [
        {"ts": r[0], "open": float(r[1]), "high": float(r[2]), "low": float(r[3]), "close": float(r[4]), "volume": int(r[5])}
        for r in rows
    ]


def load_features(ch, symbol: str, start: str, end: str, seed: int) -> tuple[list[dict], str]:
    """Load bars and compute the feature library in DuckDB. Returns (rows, source)
    where rows are ordered by time, each a dict of price + computed signals."""
    bars = _from_clickhouse(ch, symbol, start, end) if ch is not None else []
    source = "clickhouse"
    if len(bars) < 60:
        bars = _synth_daily(symbol, start, end, seed)
        source = "synthetic"

    con = duckdb.connect(":memory:")
    con.execute(
        "CREATE TABLE bars (ts TIMESTAMP, open DOUBLE, high DOUBLE, low DOUBLE, close DOUBLE, volume BIGINT)"
    )
    con.executemany(
        "INSERT INTO bars VALUES (?,?,?,?,?,?)",
        [(b["ts"], b["open"], b["high"], b["low"], b["close"], b["volume"]) for b in bars],
    )

    # All windowed analytics run inside DuckDB (the in-process inner loop).
    rows = con.execute(
        """
        WITH d AS (
            SELECT *, close - lag(close) OVER w AS chg
            FROM bars WINDOW w AS (ORDER BY ts)
        ),
        g AS (
            SELECT *,
                CASE WHEN chg > 0 THEN chg ELSE 0 END AS up,
                CASE WHEN chg < 0 THEN -chg ELSE 0 END AS dn
            FROM d
        ),
        f AS (
            SELECT *,
                avg(up) OVER w14 AS au,
                avg(dn) OVER w14 AS ad,
                avg(close) OVER w10 AS sma_fast,
                avg(close) OVER w30 AS sma_slow,
                stddev_samp(chg / close) OVER w20 AS dvol,
                close / lag(close, 10) OVER w_all - 1 AS momentum
            FROM g
            WINDOW
                w14 AS (ORDER BY ts ROWS BETWEEN 13 PRECEDING AND CURRENT ROW),
                w10 AS (ORDER BY ts ROWS BETWEEN 9 PRECEDING AND CURRENT ROW),
                w30 AS (ORDER BY ts ROWS BETWEEN 29 PRECEDING AND CURRENT ROW),
                w20 AS (ORDER BY ts ROWS BETWEEN 19 PRECEDING AND CURRENT ROW),
                w_all AS (ORDER BY ts)
        )
        SELECT ts, open, high, low, close, volume,
               100 - 100 / (1 + au / nullif(ad, 0)) AS rsi,
               sma_fast, sma_slow,
               CASE WHEN sma_fast > sma_slow THEN 1 ELSE 0 END AS trend,
               coalesce(dvol, 0) * sqrt(252) AS realized_vol,
               coalesce(momentum, 0) AS momentum
        FROM f
        ORDER BY ts
        """
    ).fetchall()
    con.close()

    cols = ["ts", "open", "high", "low", "close", "volume", "rsi", "sma_fast", "sma_slow", "trend", "realized_vol", "momentum"]
    out = []
    for r in rows:
        row = dict(zip(cols, r))
        row["rsi"] = float(row["rsi"]) if row["rsi"] is not None else 50.0
        out.append(row)
    return out, source
