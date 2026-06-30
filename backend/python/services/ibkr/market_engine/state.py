"""Per-symbol in-memory state with ring buffers and live candles."""

from __future__ import annotations

import time
from collections import deque
from dataclasses import dataclass, field
from typing import Any

from services.ibkr.market_engine.indicators import (
    IncrementalRSI,
    RollingVolatility,
    SessionVWAP,
    momentum_score,
)

TICK_RING = 500
BAR_RING = 200
INTERVAL_MS = {"1m": 60_000, "5m": 300_000}


@dataclass
class LiveBar:
    interval: str
    open_time: int
    open: float
    high: float
    low: float
    close: float
    volume: float
    vwap: float

    def to_dict(self, symbol: str) -> dict[str, Any]:
        return {
            "symbol": symbol,
            "interval": self.interval,
            "open_time": self.open_time,
            "open": self.open,
            "high": self.high,
            "low": self.low,
            "close": self.close,
            "volume": self.volume,
            "vwap": self.vwap,
        }


@dataclass
class SymbolState:
    symbol: str
    seq: int = 0
    last_price: float = 0.0
    prev_close: float = 0.0
    volume: float = 0.0
    last_volume: float = 0.0
    timestamp: int = 0
    ticks: deque[tuple[int, float]] = field(default_factory=lambda: deque(maxlen=TICK_RING))
    bars_1m: deque[LiveBar] = field(default_factory=lambda: deque(maxlen=BAR_RING))
    bars_5m: deque[LiveBar] = field(default_factory=lambda: deque(maxlen=BAR_RING))
    current_1m: LiveBar | None = None
    current_5m: LiveBar | None = None
    rsi: IncrementalRSI = field(default_factory=IncrementalRSI)
    vwap: SessionVWAP = field(default_factory=SessionVWAP)
    volatility: RollingVolatility = field(default_factory=RollingVolatility)
    change_1m: float = 0.0
    change_5m: float = 0.0
    change_15m: float = 0.0
    momentum: float = 0.0
    dirty: bool = False
    last_candle_1m_key: str | None = None

    def price_at_offset_ms(self, offset_ms: int, now_ms: int) -> float | None:
        target = now_ms - offset_ms
        for ts, px in reversed(self.ticks):
            if ts <= target:
                return px
        return self.ticks[0][1] if self.ticks else None

    def _bucket(self, ts_ms: int, interval: str) -> int:
        step = INTERVAL_MS[interval]
        return (ts_ms // step) * step

    def _update_bar(self, interval: str, price: float, vol_delta: float, ts_ms: int) -> LiveBar | None:
        bucket = self._bucket(ts_ms, interval)
        current = self.current_1m if interval == "1m" else self.current_5m
        completed: LiveBar | None = None
        ring = self.bars_1m if interval == "1m" else self.bars_5m

        if current is None or current.open_time != bucket:
            if current is not None:
                ring.append(current)
                completed = current
            current = LiveBar(
                interval=interval,
                open_time=bucket,
                open=price,
                high=price,
                low=price,
                close=price,
                volume=max(vol_delta, 0.0),
                vwap=price,
            )
        else:
            current.high = max(current.high, price)
            current.low = min(current.low, price)
            current.close = price
            current.volume += max(vol_delta, 0.0)
            if current.volume > 0:
                current.vwap = (current.vwap * (current.volume - vol_delta) + price * vol_delta) / current.volume

        if interval == "1m":
            self.current_1m = current
        else:
            self.current_5m = current
        return completed

    def on_tick(self, price: float, total_volume: float, ts_ms: int | None = None) -> tuple[LiveBar | None, LiveBar | None]:
        now = ts_ms if ts_ms is not None else int(time.time() * 1000)
        vol_delta = max(total_volume - self.last_volume, 0.0) if total_volume >= self.last_volume else 0.0
        self.last_volume = total_volume
        self.last_price = price
        self.volume = total_volume
        self.timestamp = now
        self.ticks.append((now, price))
        self.seq += 1
        self.dirty = True

        if self.prev_close <= 0:
            self.prev_close = price

        ret = 0.0
        if len(self.ticks) >= 2:
            prev_px = self.ticks[-2][1]
            if prev_px > 0:
                ret = (price - prev_px) / prev_px

        self.rsi.update(price)
        self.vwap.update(price, vol_delta)
        self.volatility.update(ret)

        p1 = self.price_at_offset_ms(60_000, now)
        p5 = self.price_at_offset_ms(300_000, now)
        p15 = self.price_at_offset_ms(900_000, now)
        self.change_1m = ((price - p1) / p1 * 100) if p1 and p1 > 0 else 0.0
        self.change_5m = ((price - p5) / p5 * 100) if p5 and p5 > 0 else 0.0
        self.change_15m = ((price - p15) / p15 * 100) if p15 and p15 > 0 else 0.0

        avg_vol = sum(b.volume for b in list(self.bars_1m)[-10:]) / max(len(list(self.bars_1m)[-10:]), 1)
        vol_ratio = (vol_delta / avg_vol) if avg_vol > 0 else 1.0
        self.momentum = momentum_score(self.change_1m, vol_ratio)

        done_1m = self._update_bar("1m", price, vol_delta, now)
        done_5m = self._update_bar("5m", price, vol_delta, now)
        return done_1m, done_5m

    def stream_payload(self) -> dict[str, Any]:
        return {
            "symbol": self.symbol,
            "price": round(self.last_price, 4),
            "prev_close": round(self.prev_close, 4) if self.prev_close else None,
            "volume": self.volume,
            "change_1m": round(self.change_1m, 4),
            "change_5m": round(self.change_5m, 4),
            "change_15m": round(self.change_15m, 4),
            "rsi": round(self.rsi.value, 2),
            "vwap": round(self.vwap.value, 4),
            "volatility": round(self.volatility.value, 6),
            "momentum_score": round(self.momentum, 4),
            "timestamp": self.timestamp,
            "seq": self.seq,
            "source": "ibkr",
        }

    def snapshot(self) -> dict[str, Any]:
        candles_1m = [b.to_dict(self.symbol) for b in self.bars_1m]
        if self.current_1m:
            candles_1m.append(self.current_1m.to_dict(self.symbol))
        return {
            **self.stream_payload(),
            "candles_1m": candles_1m[-BAR_RING:],
        }

    def hydrate_bar(self, interval: str, bar: dict[str, Any]) -> None:
        live = LiveBar(
            interval=interval,
            open_time=int(bar["open_time"]) if isinstance(bar["open_time"], (int, float)) else int(bar.get("timestamp", 0)),
            open=float(bar["open"]),
            high=float(bar["high"]),
            low=float(bar["low"]),
            close=float(bar["close"]),
            volume=float(bar.get("volume", 0)),
            vwap=float(bar.get("vwap", bar["close"])),
        )
        ring = self.bars_1m if interval == "1m" else self.bars_5m
        ring.append(live)
        if live.close > 0:
            self.last_price = live.close
            self.rsi.update(live.close)
