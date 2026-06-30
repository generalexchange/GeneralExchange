"""Incremental indicator updates — O(1) per tick, no full recompute."""

from __future__ import annotations

import math
from dataclasses import dataclass, field


@dataclass
class IncrementalRSI:
    period: int = 14
    avg_gain: float = 0.0
    avg_loss: float = 0.0
    prev_price: float | None = None
    warmup: int = 0
    value: float = 50.0

    def update(self, price: float) -> float:
        if self.prev_price is None:
            self.prev_price = price
            return self.value
        delta = price - self.prev_price
        self.prev_price = price
        gain = max(delta, 0.0)
        loss = max(-delta, 0.0)
        if self.warmup < self.period:
            self.avg_gain += gain
            self.avg_loss += loss
            self.warmup += 1
            if self.warmup == self.period:
                self.avg_gain /= self.period
                self.avg_loss /= self.period
            return self.value
        self.avg_gain = (self.avg_gain * (self.period - 1) + gain) / self.period
        self.avg_loss = (self.avg_loss * (self.period - 1) + loss) / self.period
        if self.avg_loss <= 0:
            self.value = 100.0
        else:
            rs = self.avg_gain / self.avg_loss
            self.value = 100.0 - (100.0 / (1.0 + rs))
        return self.value


@dataclass
class SessionVWAP:
    cum_pv: float = 0.0
    cum_vol: float = 0.0
    value: float = 0.0

    def update(self, price: float, volume_delta: float) -> float:
        vol = max(volume_delta, 0.0)
        if vol <= 0:
            if self.cum_vol > 0:
                self.value = self.cum_pv / self.cum_vol
            else:
                self.value = price
            return self.value
        self.cum_pv += price * vol
        self.cum_vol += vol
        self.value = self.cum_pv / self.cum_vol if self.cum_vol > 0 else price
        return self.value


@dataclass
class RollingVolatility:
    window: int = 20
    returns: list[float] = field(default_factory=list)
    value: float = 0.0

    def update(self, ret: float) -> float:
        self.returns.append(ret)
        if len(self.returns) > self.window:
            self.returns.pop(0)
        n = len(self.returns)
        if n < 2:
            self.value = 0.0
            return self.value
        mean = sum(self.returns) / n
        var = sum((r - mean) ** 2 for r in self.returns) / (n - 1)
        self.value = math.sqrt(max(var, 0.0))
        return self.value


def momentum_score(change_1m_pct: float, vol_ratio: float) -> float:
    """Combine short-term ROC and volume spike into [0, 1]."""
    roc = max(-5.0, min(5.0, change_1m_pct)) / 5.0
    vol = max(0.0, min(3.0, vol_ratio)) / 3.0
    raw = 0.6 * ((roc + 1.0) / 2.0) + 0.4 * vol
    return max(0.0, min(1.0, raw))
