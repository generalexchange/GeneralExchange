"""Polygon ingestion service.

Connects to Polygon's real-time WebSocket for trades and minute aggregates and
publishes them to Redpanda:

  trade prints      -> ticks-raw          (key = symbol)
  minute aggregates -> candles-1m         (key = symbol)

If no POLYGON_API_KEY is configured, a deterministic synthetic generator drives
the same topics so the rest of the pipeline runs end-to-end in local dev.
"""

from __future__ import annotations

import asyncio
import json
import random
import time

from common import topics
from common.config import load
from common.kafka import make_producer, produce
from common.logging import get_logger

log = get_logger("polygon-ingestion")

POLYGON_WS = "wss://socket.polygon.io/stocks"
BASE_PRICES = {"SPY": 512.4, "QQQ": 438.9, "NVDA": 121.3, "AAPL": 224.8, "TSLA": 248.5, "AMD": 158.2}


def now_ns() -> int:
    return time.time_ns()


# --------------------------------------------------------------------------- #
# Real Polygon stream
# --------------------------------------------------------------------------- #
async def run_polygon(cfg, producer) -> None:
    import websockets  # imported lazily so dev (synthetic) needs no network

    subs = ",".join([f"T.{s}" for s in cfg.symbols] + [f"AM.{s}" for s in cfg.symbols])
    while True:
        try:
            async with websockets.connect(POLYGON_WS, ping_interval=15) as ws:
                await ws.send(json.dumps({"action": "auth", "params": cfg.polygon_api_key}))
                await ws.send(json.dumps({"action": "subscribe", "params": subs}))
                log.info("polygon connected", symbols=cfg.symbols)
                async for raw in ws:
                    for ev in json.loads(raw):
                        _handle_polygon_event(producer, ev)
        except Exception as exc:  # noqa: BLE001 — reconnect on any failure
            log.error("polygon stream error; reconnecting", err=str(exc))
            await asyncio.sleep(3)


def _handle_polygon_event(producer, ev: dict) -> None:
    kind = ev.get("ev")
    if kind == "T":  # trade
        sym = ev["sym"]
        produce(producer, topics.TICKS_RAW, sym, {
            "symbol": sym,
            "timestamp_ns": int(ev["t"]) * 1_000_000,
            "price": ev["p"],
            "size": ev.get("s", 0),
            "exchange": str(ev.get("x", "")),
            "conditions": [str(c) for c in ev.get("c", [])],
            "tape": str(ev.get("z", "")),
        })
    elif kind == "AM":  # minute aggregate
        sym = ev["sym"]
        produce(producer, topics.CANDLES["1m"], sym, {
            "symbol": sym, "interval": "1m", "open_time_ms": int(ev["s"]),
            "open": ev["o"], "high": ev["h"], "low": ev["l"], "close": ev["c"],
            "volume": int(ev["v"]), "vwap": ev.get("vw", (ev["h"] + ev["l"] + ev["c"]) / 3),
            "transactions": int(ev.get("n", 0)),
        })


# --------------------------------------------------------------------------- #
# Synthetic stream (no API key)
# --------------------------------------------------------------------------- #
async def run_synthetic(cfg, producer) -> None:
    log.info("no polygon key — running synthetic tick generator", symbols=cfg.symbols)
    rng = random.Random(7)
    prices = {s: BASE_PRICES.get(s, 100.0) for s in cfg.symbols}
    minute_acc: dict[str, dict] = {}

    while True:
        for sym in cfg.symbols:
            p = prices[sym]
            p = max(1.0, p + (rng.random() - 0.5) * p * 0.0006)
            prices[sym] = p
            ts = now_ns()
            size = rng.randint(100, 1000)
            produce(producer, topics.TICKS_RAW, sym, {
                "symbol": sym, "timestamp_ns": ts, "price": round(p, 2), "size": size,
                "exchange": "SYN", "conditions": ["@"], "tape": "C",
            })
            # accumulate into a synthetic minute candle
            acc = minute_acc.setdefault(sym, {"o": p, "h": p, "l": p, "c": p, "v": 0, "bucket": ts // 60_000_000_000})
            bucket = ts // 60_000_000_000
            if bucket != acc["bucket"]:
                produce(producer, topics.CANDLES["1m"], sym, {
                    "symbol": sym, "interval": "1m", "open_time_ms": acc["bucket"] * 60_000,
                    "open": round(acc["o"], 2), "high": round(acc["h"], 2), "low": round(acc["l"], 2),
                    "close": round(acc["c"], 2), "volume": acc["v"],
                    "vwap": round((acc["h"] + acc["l"] + acc["c"]) / 3, 2), "transactions": 1,
                })
                minute_acc[sym] = {"o": p, "h": p, "l": p, "c": p, "v": size, "bucket": bucket}
            else:
                acc["h"] = max(acc["h"], p)
                acc["l"] = min(acc["l"], p)
                acc["c"] = p
                acc["v"] += size
        producer.poll(0)
        await asyncio.sleep(0.5)


async def main() -> None:
    cfg = load()
    producer = make_producer(cfg)
    try:
        if cfg.has_polygon:
            await run_polygon(cfg, producer)
        else:
            await run_synthetic(cfg, producer)
    finally:
        producer.flush(5)


if __name__ == "__main__":
    asyncio.run(main())
