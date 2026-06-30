"""Central market state machine — ticks in, deltas out."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from services.ibkr.market_engine.state import SymbolState

logger = logging.getLogger(__name__)

_engine: "MarketEngine | None" = None


class MarketEngine:
    """Singleton in-memory market state with subscriber fan-out."""

    def __init__(self, batch_ms: int = 150) -> None:
        self.batch_ms = batch_ms
        self._symbols: dict[str, SymbolState] = {}
        self._subscribers: set[asyncio.Queue[dict[str, Any]]] = set()
        self._watchlist: set[str] = set()
        self._batch_task: asyncio.Task | None = None
        self._lock = asyncio.Lock()

    def watchlist(self) -> list[str]:
        return sorted(self._watchlist)

    def ensure_symbol(self, symbol: str) -> SymbolState:
        sym = symbol.upper()
        if sym not in self._symbols:
            self._symbols[sym] = SymbolState(symbol=sym)
        return self._symbols[sym]

    def add_watch(self, symbols: list[str]) -> None:
        for s in symbols:
            self._watchlist.add(s.upper())
            self.ensure_symbol(s)

    def get_snapshot(self, symbol: str) -> dict[str, Any] | None:
        st = self._symbols.get(symbol.upper())
        return st.snapshot() if st else None

    def get_snapshots(self, symbols: list[str] | None = None) -> list[dict[str, Any]]:
        syms = [s.upper() for s in (symbols or self.watchlist())]
        out: list[dict[str, Any]] = []
        for sym in syms:
            st = self._symbols.get(sym)
            if st and st.last_price > 0:
                out.append(st.snapshot())
        return out

    async def process_tick(
        self,
        symbol: str,
        price: float,
        volume: float = 0.0,
        ts_ms: int | None = None,
        prev_close: float | None = None,
    ) -> None:
        if price <= 0:
            return
        async with self._lock:
            st = self.ensure_symbol(symbol)
            if prev_close and prev_close > 0:
                st.prev_close = prev_close
            done_1m, _done_5m = st.on_tick(price, volume, ts_ms)
            current_1m = st.current_1m

        sym = symbol.upper()
        if done_1m:
            await self._broadcast(
                {
                    "type": "candle",
                    "data": done_1m.to_dict(sym),
                    "replaceLast": False,
                }
            )
        if current_1m:
            await self._broadcast(
                {
                    "type": "candle",
                    "data": current_1m.to_dict(sym),
                    "replaceLast": True,
                }
            )

    async def _broadcast(self, msg: dict[str, Any]) -> None:
        for q in list(self._subscribers):
            try:
                q.put_nowait(msg)
            except asyncio.QueueFull:
                pass

    def subscribe(self) -> asyncio.Queue[dict[str, Any]]:
        q: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=512)
        self._subscribers.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue[dict[str, Any]]) -> None:
        self._subscribers.discard(q)

    async def start_broadcaster(self) -> None:
        if self._batch_task and not self._batch_task.done():
            return

        async def loop() -> None:
            while True:
                await asyncio.sleep(self.batch_ms / 1000.0)
                dirty: list[dict[str, Any]] = []
                async with self._lock:
                    for st in self._symbols.values():
                        if st.dirty and st.last_price > 0:
                            st.dirty = False
                            dirty.append({"type": "stream", "data": st.stream_payload()})
                for msg in dirty:
                    await self._broadcast(msg)

        self._batch_task = asyncio.create_task(loop())

    async def stop(self) -> None:
        if self._batch_task:
            self._batch_task.cancel()
            try:
                await self._batch_task
            except asyncio.CancelledError:
                pass
            self._batch_task = None

    async def hydrate_from_bars(self, symbol: str, bars: list[Any]) -> None:
        """Load historical 1m bars from DB on startup."""
        st = self.ensure_symbol(symbol)
        for b in bars:
            ts = b.timestamp
            ts_ms = int(ts.timestamp() * 1000) if hasattr(ts, "timestamp") else int(ts)
            st.hydrate_bar(
                "1m",
                {
                    "open_time": ts_ms,
                    "open": b.open,
                    "high": b.high,
                    "low": b.low,
                    "close": b.close,
                    "volume": b.volume,
                    "vwap": b.vwap or b.close,
                },
            )
        if bars:
            st.prev_close = float(bars[-2].close) if len(bars) > 1 else float(bars[-1].close)
            logger.info("Hydrated %s with %d bars", symbol, len(bars))


def get_market_engine() -> MarketEngine:
    global _engine
    if _engine is None:
        from services.ibkr.config import settings

        _engine = MarketEngine(batch_ms=settings.ws_batch_ms)
    return _engine
