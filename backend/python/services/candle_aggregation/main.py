"""Candle aggregation service.

Consumes ticks-normalized and rolls them into OHLCV candles at multiple
intervals. Completed candles are published to candles-{1m,5m,15m,1h,1d} (for
the dashboard fan-out + signal worker) and written to the ClickHouse `candles`
table.
"""

from __future__ import annotations

import time
from datetime import datetime, timezone

from common import topics
from common.clickhouse import get_client, insert_dicts
from common.config import load
from common.kafka import decode, make_consumer, make_producer, produce
from common.logging import get_logger

log = get_logger("candle-aggregation")

INTERVAL_MS = {"1m": 60_000, "5m": 300_000, "15m": 900_000, "1h": 3_600_000, "1d": 86_400_000}
FLUSH_SECONDS = 2.0


class Bar:
    __slots__ = ("bucket", "o", "h", "l", "c", "vol", "pv", "n")

    def __init__(self, bucket: int, price: float, size: int) -> None:
        self.bucket = bucket
        self.o = self.h = self.l = self.c = price
        self.vol = size
        self.pv = price * size  # for vwap
        self.n = 1

    def update(self, price: float, size: int) -> None:
        self.h = max(self.h, price)
        self.l = min(self.l, price)
        self.c = price
        self.vol += size
        self.pv += price * size
        self.n += 1

    def to_row(self, symbol: str, interval: str) -> dict:
        open_ms = self.bucket * INTERVAL_MS[interval]
        return {
            "symbol": symbol,
            "interval": interval,
            "open_time": datetime.fromtimestamp(open_ms / 1000, tz=timezone.utc).replace(tzinfo=None),
            "open": round(self.o, 4),
            "high": round(self.h, 4),
            "low": round(self.l, 4),
            "close": round(self.c, 4),
            "volume": int(self.vol),
            "vwap": round(self.pv / self.vol, 4) if self.vol else round(self.c, 4),
            "transactions": int(self.n),
        }


def main() -> None:
    cfg = load()
    consumer = make_consumer(cfg, "candle-aggregation", [topics.TICKS_NORMALIZED])
    producer = make_producer(cfg)
    ch = get_client(cfg)

    # state[interval][symbol] = Bar
    state: dict[str, dict[str, Bar]] = {iv: {} for iv in INTERVAL_MS}
    pending: list[dict] = []
    last_flush = time.monotonic()
    log.info("started", intervals=list(INTERVAL_MS))

    def emit(symbol: str, interval: str, bar: Bar) -> None:
        row = bar.to_row(symbol, interval)
        pending.append(row)
        produce(producer, topics.CANDLES[interval], symbol, {
            **row, "open_time": row["open_time"].isoformat()
        })

    def flush() -> None:
        nonlocal pending, last_flush
        if pending:
            try:
                insert_dicts(ch, "candles", pending)
                producer.flush(5)
                consumer.commit(asynchronous=False)
                log.info("flushed candles", rows=len(pending))
            except Exception as exc:  # noqa: BLE001
                log.error("flush failed; retrying", err=str(exc))
                return
            pending = []
        last_flush = time.monotonic()

    try:
        while True:
            msg = consumer.poll(0.5)
            if msg is None:
                if time.monotonic() - last_flush >= FLUSH_SECONDS:
                    flush()
                continue
            if msg.error():
                log.warn("consumer error", err=str(msg.error()))
                continue

            ev = decode(msg)
            try:
                symbol = ev["symbol"]
                price = float(ev["price"])
                size = int(ev.get("size", 0))
                ts_ms = int(ev["timestamp_ns"]) // 1_000_000
            except (KeyError, ValueError, TypeError):
                continue

            for interval, ms in INTERVAL_MS.items():
                bucket = ts_ms // ms
                bar = state[interval].get(symbol)
                if bar is None:
                    state[interval][symbol] = Bar(bucket, price, size)
                elif bucket != bar.bucket:
                    emit(symbol, interval, bar)  # previous bar complete
                    state[interval][symbol] = Bar(bucket, price, size)
                else:
                    bar.update(price, size)

            if time.monotonic() - last_flush >= FLUSH_SECONDS:
                flush()
    finally:
        flush()
        consumer.close()
        producer.flush(5)


if __name__ == "__main__":
    main()
