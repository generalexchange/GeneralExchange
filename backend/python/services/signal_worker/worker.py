"""
Pure signal worker — subscribes to market data, emits SignalEvents.

Whitepaper v1.0 Part Five §5.2
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Optional

import msgpack
import numpy as np
import zmq


@dataclass
class SymbolState:
    symbol: str
    prices: list = field(default_factory=list)
    volumes: list = field(default_factory=list)
    timestamps: list = field(default_factory=list)
    window: int = 100

    def update(self, price: float, volume: float, ts: int):
        self.prices.append(price)
        self.volumes.append(volume)
        self.timestamps.append(ts)
        if len(self.prices) > self.window:
            self.prices.pop(0)
            self.volumes.pop(0)
            self.timestamps.pop(0)

    def rsi(self, period: int = 14) -> Optional[float]:
        if len(self.prices) < period + 1:
            return None
        deltas = np.diff(self.prices[-period - 1 :])
        gains = np.where(deltas > 0, deltas, 0.0)
        losses = np.where(deltas < 0, -deltas, 0.0)
        avg_gain = gains.mean()
        avg_loss = losses.mean()
        if avg_loss == 0:
            return 100.0
        rs = avg_gain / avg_loss
        return 100.0 - (100.0 / (1.0 + rs))

    def atr(self, period: int = 14) -> Optional[float]:
        if len(self.prices) < period + 1:
            return None
        highs = np.array(self.prices[-period:])
        lows = np.array(self.prices[-period:])
        closes = np.array(self.prices[-period - 1 : -1])
        tr = np.maximum(
            highs - lows,
            np.maximum(np.abs(highs - closes), np.abs(lows - closes)),
        )
        return float(tr.mean())

    def ema(self, period: int) -> Optional[float]:
        if len(self.prices) < period:
            return None
        k = 2.0 / (period + 1)
        ema = self.prices[-period]
        for p in self.prices[-period + 1 :]:
            ema = p * k + ema * (1 - k)
        return ema

    def vwap(self) -> Optional[float]:
        if not self.prices or not self.volumes:
            return None
        pv = sum(p * v for p, v in zip(self.prices, self.volumes))
        tv = sum(self.volumes)
        return pv / tv if tv > 0 else None

    def compute_features(self) -> dict:
        return {
            "rsi_14": self.rsi(14),
            "atr_14": self.atr(14),
            "ema_9": self.ema(9),
            "ema_21": self.ema(21),
            "vwap": self.vwap(),
            "price": self.prices[-1] if self.prices else None,
            "volume_z": self._volume_z(),
        }

    def _volume_z(self) -> Optional[float]:
        if len(self.volumes) < 20:
            return None
        arr = np.array(self.volumes[-20:])
        mean, std = arr.mean(), arr.std()
        return (self.volumes[-1] - mean) / std if std > 0 else 0.0

    def generate_signal(self, strategy_id: str, strategy_version: str) -> dict:
        features = self.compute_features()
        rsi = features.get("rsi_14")
        ema_fast = features.get("ema_9")
        ema_slow = features.get("ema_21")

        direction = "flat"
        confidence = 0.0

        if rsi is not None and ema_fast is not None and ema_slow is not None:
            momentum_ok = ema_fast > ema_slow
            oversold = rsi < 35
            overbought = rsi > 65

            if momentum_ok and oversold:
                direction = "long"
                confidence = min(1.0, (35 - rsi) / 35 * 2)
            elif not momentum_ok and overbought:
                direction = "short"
                confidence = min(1.0, (rsi - 65) / 35 * 2)

        return {
            "kind": "signal",
            "symbol": self.symbol,
            "strategyId": strategy_id,
            "strategyVersion": strategy_version,
            "direction": direction,
            "confidence": confidence,
            "features": {k: v for k, v in features.items() if v is not None},
            "indicators": {
                "rsi": rsi,
                "atr": features.get("atr_14"),
                "emaFast": ema_fast,
                "emaSlow": ema_slow,
                "vwap": features.get("vwap"),
            },
            "metadata": {},
        }


class SignalWorker:
    def __init__(
        self,
        sub_addr: str = "tcp://127.0.0.1:5558",
        push_addr: str = "tcp://127.0.0.1:5559",
        strategy_id: str = "momentum_v1",
        strategy_version: str = "1.0.0",
    ):
        self.ctx = zmq.Context()
        self.sub = self.ctx.socket(zmq.SUB)
        self.sub.connect(sub_addr)
        self.sub.setsockopt(zmq.SUBSCRIBE, b"")
        self.push = self.ctx.socket(zmq.PUSH)
        self.push.connect(push_addr)
        self.states: dict[str, SymbolState] = {}
        self.strategy_id = strategy_id
        self.strategy_version = strategy_version

    def run(self):
        while True:
            raw = self.sub.recv()
            event = msgpack.unpackb(raw, raw=False)

            if event.get("kind") != "market_data":
                continue

            symbol = event["symbol"]
            if symbol not in self.states:
                self.states[symbol] = SymbolState(symbol=symbol)

            state = self.states[symbol]
            state.update(event["price"], event.get("lastSz", 0.0), event["tsExchange"])

            if len(state.prices) < 21:
                continue

            signal = state.generate_signal(self.strategy_id, self.strategy_version)
            signal["seq"] = event["seq"]
            signal["tsExchange"] = event["tsExchange"]
            signal["tsIngest"] = int(time.time() * 1_000_000)
            signal["tsEmit"] = signal["tsIngest"]
            signal["source"] = f"signal-worker/{self.strategy_id}"
            signal["sessionId"] = event.get("sessionId", "")

            if signal["direction"] != "flat" and signal["confidence"] > 0.3:
                packed = msgpack.packb(signal, use_bin_type=True)
                try:
                    self.push.send(packed, zmq.NOBLOCK)
                except zmq.Again:
                    pass


if __name__ == "__main__":
    SignalWorker().run()
