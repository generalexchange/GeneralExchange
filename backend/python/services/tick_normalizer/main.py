"""Tick normalizer consumer.

Consumes ticks-raw, deduplicates and cleans prints, writes them to the
ClickHouse `ticks` table in batches, and republishes the normalized event to
ticks-normalized for the Greeks / regime / candle consumers.

At-least-once: offsets are committed only after a batch is durably inserted.
The ClickHouse `ticks` table is a ReplacingMergeTree, so any at-least-once
duplicates collapse on merge.
"""

from __future__ import annotations

import time
from collections import OrderedDict
from datetime import datetime, timezone

from common import topics
from common.clickhouse import get_client, insert_dicts
from common.config import load
from common.kafka import decode, make_consumer, make_producer, produce
from common.logging import get_logger

log = get_logger("tick-normalizer")

BATCH_SIZE = 500
FLUSH_SECONDS = 1.0
DEDUP_CAPACITY = 50_000


class Dedup:
    """Bounded LRU set of recently-seen tick fingerprints."""

    def __init__(self, capacity: int) -> None:
        self._seen: OrderedDict[int, None] = OrderedDict()
        self._cap = capacity

    def seen(self, key: int) -> bool:
        if key in self._seen:
            self._seen.move_to_end(key)
            return True
        self._seen[key] = None
        if len(self._seen) > self._cap:
            self._seen.popitem(last=False)
        return False


def normalize(raw: dict) -> dict | None:
    try:
        ts_ns = int(raw["timestamp_ns"])
        price = float(raw["price"])
        if price <= 0:
            return None
        # DateTime64(9): clickhouse-connect accepts a datetime (us precision).
        dt = datetime.fromtimestamp(ts_ns / 1e9, tz=timezone.utc).replace(tzinfo=None)
        tape = (raw.get("tape") or "C")[:1] or "C"
        return {
            "symbol": raw["symbol"],
            "timestamp": dt,
            "price": price,
            "size": int(raw.get("size", 0)),
            "exchange": str(raw.get("exchange", "")),
            "conditions": [str(c) for c in raw.get("conditions", [])],
            "tape": tape,
        }
    except (KeyError, ValueError, TypeError):
        return None


def main() -> None:
    cfg = load()
    consumer = make_consumer(cfg, "tick-normalizer", [topics.TICKS_RAW])
    producer = make_producer(cfg)
    ch = get_client(cfg)
    dedup = Dedup(DEDUP_CAPACITY)

    batch: list[dict] = []
    last_flush = time.monotonic()
    log.info("started", brokers=cfg.redpanda_brokers)

    def flush() -> None:
        nonlocal batch, last_flush
        if batch:
            try:
                inserted = insert_dicts(ch, "ticks", batch)
                producer.flush(5)
                consumer.commit(asynchronous=False)
                log.info("flushed batch", rows=inserted)
            except Exception as exc:  # noqa: BLE001
                log.error("flush failed; will retry batch", err=str(exc))
                return  # keep batch, do not commit
            batch = []
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

            raw = decode(msg)
            row = normalize(raw)
            if row is None:
                continue
            fp = hash((row["symbol"], raw["timestamp_ns"], row["price"], row["size"]))
            if dedup.seen(fp):
                continue

            batch.append(row)
            produce(producer, topics.TICKS_NORMALIZED, row["symbol"], {**raw, "normalized": True})

            if len(batch) >= BATCH_SIZE or time.monotonic() - last_flush >= FLUSH_SECONDS:
                flush()
    finally:
        flush()
        consumer.close()
        producer.flush(5)


if __name__ == "__main__":
    main()
