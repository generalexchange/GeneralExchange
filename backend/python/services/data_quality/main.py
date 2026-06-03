"""Data-quality worker (Phase 5).

Runs a battery of automated checks against the core ClickHouse tables on a fixed
cadence — freshness, null/zero rates, duplicates, volume, and value-range
validation — and writes one row per check to `data_quality_checks`. Apache
Superset reads that table for the data-quality dashboard.

Each check returns an observed metric and a scanned-row count; the status
(PASS / WARN / FAIL) is decided by comparing the observed value to per-check
warn/fail thresholds in the configured direction.
"""

from __future__ import annotations

import time
from datetime import datetime, timezone

from common.clickhouse import get_client, insert_dicts
from common.config import load
from common.logging import get_logger

log = get_logger("data-quality-worker")

INTERVAL_SECONDS = 60

# Each check: observed metric + rows_scanned via SQL, compared to thresholds.
#   direction "high_bad": larger observed is worse (e.g. age, null-rate)
#   direction "low_bad":  smaller observed is worse (e.g. recent volume)
CHECKS = [
    {
        "dataset": "ticks", "check_name": "freshness_seconds", "check_type": "freshness",
        "sql": "SELECT toFloat64(dateDiff('second', max(timestamp), now())), count() FROM ticks",
        "warn": 300, "fail": 1800, "direction": "high_bad",
        "detail": "seconds since most recent tick",
    },
    {
        "dataset": "candles", "check_name": "freshness_seconds", "check_type": "freshness",
        "sql": "SELECT toFloat64(dateDiff('second', max(open_time), now())), count() FROM candles",
        "warn": 600, "fail": 3600, "direction": "high_bad",
        "detail": "seconds since most recent candle",
    },
    {
        "dataset": "options_chain", "check_name": "freshness_seconds", "check_type": "freshness",
        "sql": "SELECT toFloat64(dateDiff('second', max(snapshot_time), now())), count() FROM options_chain",
        "warn": 120, "fail": 600, "direction": "high_bad",
        "detail": "seconds since most recent options snapshot",
    },
    {
        "dataset": "options_chain", "check_name": "zero_iv_rate", "check_type": "nulls",
        "sql": ("SELECT countIf(implied_volatility <= 0) / count(), count() FROM options_chain "
                "WHERE snapshot_time > now() - INTERVAL 1 DAY"),
        "warn": 0.02, "fail": 0.1, "direction": "high_bad",
        "detail": "fraction of contracts with non-positive IV (last 24h)",
    },
    {
        "dataset": "options_chain", "check_name": "delta_out_of_range", "check_type": "range",
        "sql": ("SELECT countIf(abs(delta) > 1.0001), count() FROM options_chain "
                "WHERE snapshot_time > now() - INTERVAL 1 DAY"),
        "warn": 1, "fail": 50, "direction": "high_bad",
        "detail": "contracts with |delta| > 1 (last 24h)",
    },
    {
        "dataset": "ticks", "check_name": "duplicate_rate", "check_type": "duplicates",
        "sql": ("SELECT 1 - (uniqExact((symbol, timestamp)) / count()), count() FROM ticks "
                "WHERE timestamp > now() - INTERVAL 1 DAY"),
        "warn": 0.01, "fail": 0.05, "direction": "high_bad",
        "detail": "duplicate (symbol,timestamp) rate before merges (last 24h)",
    },
    {
        "dataset": "signals", "check_name": "hourly_volume", "check_type": "volume",
        "sql": "SELECT toFloat64(count()), count() FROM signals WHERE generated_at > now() - INTERVAL 1 HOUR",
        "warn": 5, "fail": 1, "direction": "low_bad",
        "detail": "signals generated in the last hour",
    },
    {
        "dataset": "news_events", "check_name": "freshness_seconds", "check_type": "freshness",
        "sql": "SELECT toFloat64(dateDiff('second', max(published_at), now())), count() FROM news_events",
        "warn": 1800, "fail": 7200, "direction": "high_bad",
        "detail": "seconds since most recent news event",
    },
    {
        "dataset": "regime_states", "check_name": "freshness_seconds", "check_type": "freshness",
        "sql": "SELECT toFloat64(dateDiff('second', max(detected_at), now())), count() FROM regime_states",
        "warn": 3600, "fail": 14400, "direction": "high_bad",
        "detail": "seconds since most recent regime classification",
    },
    {
        "dataset": "api_usage", "check_name": "error_rate", "check_type": "range",
        "sql": ("SELECT countIf(status >= 400) / count(), count() FROM api_usage "
                "WHERE event_time > now() - INTERVAL 1 HOUR"),
        "warn": 0.05, "fail": 0.2, "direction": "high_bad",
        "detail": "API 4xx/5xx error rate (last hour)",
    },
]


def _status(observed: float, warn: float, fail: float, direction: str) -> str:
    if direction == "high_bad":
        if observed >= fail:
            return "FAIL"
        if observed >= warn:
            return "WARN"
        return "PASS"
    # low_bad
    if observed <= fail:
        return "FAIL"
    if observed <= warn:
        return "WARN"
    return "PASS"


def run_checks(ch) -> list[dict]:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    rows: list[dict] = []
    for c in CHECKS:
        try:
            res = ch.query(c["sql"]).result_rows
            observed = float(res[0][0]) if res and res[0][0] is not None else 0.0
            scanned = int(res[0][1]) if res and len(res[0]) > 1 and res[0][1] is not None else 0
        except Exception as exc:  # noqa: BLE001 — table may not exist yet
            rows.append({
                "checked_at": now, "dataset": c["dataset"], "check_name": c["check_name"],
                "check_type": c["check_type"], "status": "WARN", "observed": 0.0,
                "threshold": float(c["fail"]), "rows_scanned": 0, "detail": f"query error: {exc}",
            })
            continue

        if scanned == 0:
            status, detail = "WARN", f"no data — {c['detail']}"
        else:
            status = _status(observed, c["warn"], c["fail"], c["direction"])
            detail = c["detail"]
        rows.append({
            "checked_at": now, "dataset": c["dataset"], "check_name": c["check_name"],
            "check_type": c["check_type"], "status": status, "observed": round(observed, 6),
            "threshold": float(c["fail"]), "rows_scanned": scanned, "detail": detail,
        })
    return rows


def main() -> None:
    cfg = load()
    ch = get_client(cfg)
    log.info("started", checks=len(CHECKS), interval_s=INTERVAL_SECONDS)
    while True:
        start = time.monotonic()
        results = run_checks(ch)
        try:
            insert_dicts(ch, "data_quality_checks", results)
        except Exception as exc:  # noqa: BLE001
            log.error("failed to write check results", err=str(exc))
        fails = sum(1 for r in results if r["status"] == "FAIL")
        warns = sum(1 for r in results if r["status"] == "WARN")
        log.info("checks complete", total=len(results), fail=fails, warn=warns)
        time.sleep(max(0, INTERVAL_SECONDS - (time.monotonic() - start)))


if __name__ == "__main__":
    main()
