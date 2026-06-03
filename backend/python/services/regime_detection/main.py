"""Regime detection worker (Phase 4).

Consumes the 1h candle stream and maintains a rolling window per symbol to
classify the prevailing market regime:

  * **Trend regime** from the Hurst exponent (persistent / mean-reverting /
    random-walk) plus the sign of the trend.
  * **Volatility regime** from 1-D k-means clustering of the realized-vol history
    (low / normal / high / extreme), with vol-of-vol as the dispersion measure.
  * Distributional shape: lag-1 autocorrelation, skew, excess kurtosis.
  * Implied vol pulled from the cached options chain (Redis) when available, so
    the realized-vs-implied gap is observable downstream.

A new regime_states row is written and a regime-events message published only
when the regime changes or a per-symbol refresh interval elapses (so the signal
worker and dashboard get transitions without spam).
"""

from __future__ import annotations

import json
import time
from collections import defaultdict, deque
from datetime import datetime, timezone

import numpy as np

from common import analytics, topics
from common.clickhouse import get_client, insert_dicts
from common.config import load
from common.kafka import decode, make_consumer, make_producer, produce
from common.logging import get_logger
from common.redis_client import get_redis

log = get_logger("regime-detection-worker")

WINDOW = 120          # 1h bars retained per symbol (~3 weeks of RTH)
MIN_BARS = 40         # minimum history before classifying
VOL_HISTORY = 252     # realized-vol samples for clustering
PERIODS_PER_YEAR = 252 * 7  # ~7 RTH hourly bars/day
REFRESH_SECONDS = 300  # force a refresh per symbol at least this often
FLUSH_SECONDS = 5.0

VOL_LABELS = ["LOW", "NORMAL", "HIGH", "EXTREME"]


def _implied_vol(rds, symbol: str) -> float:
    try:
        raw = rds.get(f"chain:{symbol}")
        if not raw:
            return 0.0
        contracts = json.loads(raw)
        return float(contracts[0].get("underlying_iv", 0.0)) / 100.0 if contracts else 0.0
    except Exception:  # noqa: BLE001
        return 0.0


def classify(closes: deque, vol_hist: deque, implied_vol: float) -> dict:
    prices = np.array(closes, dtype=float)
    rets = analytics.log_returns(prices)
    rvol = analytics.realized_vol(rets, PERIODS_PER_YEAR)
    vol_hist.append(rvol)

    hurst = analytics.hurst_exponent(prices)
    ac1 = analytics.autocorr_lag1(rets)
    skew = analytics.skewness(rets)
    kurt = analytics.kurtosis(rets)

    # trend direction + strength from a normalized linear fit over the window
    x = np.arange(prices.size)
    slope = np.polyfit(x, prices, 1)[0]
    trend_strength = float(slope * prices.size / prices.mean()) if prices.mean() else 0.0

    # The lag-variance estimator reads slightly low on finite windows, so the
    # random-walk band is widened on the downside to avoid false mean-reversion.
    if hurst > 0.55:
        regime = "TRENDING_UP" if trend_strength > 0 else "TRENDING_DOWN"
    elif hurst < 0.38:
        regime = "MEAN_REVERTING"
    else:
        regime = "RANDOM_WALK"
    confidence = float(np.clip(abs(hurst - 0.5) * 2 + min(prices.size / WINDOW, 1) * 0.3, 0, 1))

    # volatility regime via k-means over the realized-vol history
    centroids, _ = analytics.kmeans_1d(list(vol_hist), k=min(4, len(VOL_LABELS)))
    vol_regime = analytics.label_for(rvol, centroids, VOL_LABELS)
    vol_of_vol = float(np.std(list(vol_hist), ddof=1)) if len(vol_hist) > 2 else 0.0

    return {
        "regime_type": regime,
        "confidence": round(confidence, 3),
        "vol_regime": vol_regime,
        "trend_strength": round(trend_strength, 4),
        "realized_vol": round(rvol, 4),
        "implied_vol": round(implied_vol, 4),
        "vol_of_vol": round(vol_of_vol, 4),
        "hurst_exponent": round(hurst, 4),
        "autocorrelation_lag1": round(ac1, 4),
        "skew": round(skew, 4),
        "kurtosis": round(kurt, 4),
    }


def main() -> None:
    cfg = load()
    consumer = make_consumer(cfg, "regime-detection-worker", [topics.CANDLES["1h"]])
    producer = make_producer(cfg)
    ch = get_client(cfg)
    rds = get_redis(cfg)

    closes: dict[str, deque] = defaultdict(lambda: deque(maxlen=WINDOW))
    vol_hist: dict[str, deque] = defaultdict(lambda: deque(maxlen=VOL_HISTORY))
    last_regime: dict[str, str] = {}
    last_emit: dict[str, float] = defaultdict(float)
    pending: list[dict] = []
    last_flush = time.monotonic()
    log.info("started", window=WINDOW, min_bars=MIN_BARS)

    def flush() -> None:
        nonlocal pending, last_flush
        if pending:
            try:
                insert_dicts(ch, "regime_states", pending)
                producer.flush(5)
                consumer.commit(asynchronous=False)
                log.info("flushed regime states", rows=len(pending))
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
            symbol = ev.get("symbol")
            close = ev.get("close")
            if symbol is None or close is None:
                continue
            closes[symbol].append(float(close))
            if len(closes[symbol]) < MIN_BARS:
                continue

            now = time.monotonic()
            state = classify(closes[symbol], vol_hist[symbol], _implied_vol(rds, symbol))
            changed = last_regime.get(symbol) != state["regime_type"]
            if not changed and now - last_emit[symbol] < REFRESH_SECONDS:
                continue

            last_regime[symbol] = state["regime_type"]
            last_emit[symbol] = now
            detected_at = datetime.now(timezone.utc).replace(tzinfo=None)
            pending.append({"symbol": symbol, "detected_at": detected_at, **state})
            produce(producer, topics.REGIME_EVENTS, symbol, {
                "symbol": symbol, "detected_at": detected_at.isoformat(), "changed": changed, **state,
            })
            try:
                rds.set(f"regime:{symbol}", json.dumps(state), ex=3600)
            except Exception:  # noqa: BLE001
                pass
            if changed:
                log.info("regime change", symbol=symbol, regime=state["regime_type"], vol=state["vol_regime"])

            if time.monotonic() - last_flush >= FLUSH_SECONDS:
                flush()
    finally:
        flush()
        consumer.close()
        producer.flush(5)


if __name__ == "__main__":
    main()
