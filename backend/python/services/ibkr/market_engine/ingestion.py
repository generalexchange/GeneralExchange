"""IBKR tick ingestion — event-driven, no polling."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any

from ib_insync import Stock, Ticker

from services.ibkr.client import IBKRClient
from services.ibkr.config import settings
from services.ibkr.market_engine.engine import get_market_engine
from services.ibkr.market_data import ticker_to_quote

logger = logging.getLogger(__name__)


class MarketIngestion:
    """Subscribe to IB live ticks and push into the market engine."""

    def __init__(self) -> None:
        self._tickers: dict[str, Ticker] = {}
        self._contracts: dict[str, Any] = {}
        self._handlers: dict[str, Any] = {}
        self._started = False
        self._engine = get_market_engine()

    async def start(self, symbols: list[str] | None = None) -> None:
        if self._started:
            return
        syms = symbols or [s.strip() for s in settings.default_symbols.split(",") if s.strip()]
        self._engine.add_watch(syms)
        await self._engine.start_broadcaster()
        await self._hydrate_history(syms)

        try:
            client = await IBKRClient.get()
        except Exception as exc:
            logger.warning("Market ingestion: IBKR not connected (%s) — engine idle until connect", exc)
            self._started = True
            return

        ib = client.ib
        ib.reqMarketDataType(3)

        for sym in syms:
            await self._subscribe_symbol(ib, sym.upper())

        self._started = True
        logger.info("Market ingestion started for %d symbols", len(syms))

    async def _hydrate_history(self, symbols: list[str]) -> None:
        try:
            from services.ibkr.db.repository import fetch_bars
        except Exception:
            return
        for sym in symbols:
            try:
                bars = fetch_bars(sym, "1 min", limit=200)
                if bars:
                    await self._engine.hydrate_from_bars(sym, bars)
            except Exception as exc:
                logger.debug("Hydrate %s skipped: %s", sym, exc)

    async def _subscribe_symbol(self, ib, symbol: str) -> None:
        if symbol in self._tickers:
            return
        contract = Stock(symbol, "SMART", "USD")
        qualified = await ib.qualifyContractsAsync(contract)
        if not qualified:
            logger.warning("Could not qualify %s for ingestion", symbol)
            return
        c = qualified[0]
        ticker = ib.reqMktData(c, "", False, False)

        def make_handler(sym: str):
            def on_update(t: Ticker) -> None:
                quote = ticker_to_quote(sym, "STK", t)
                price = quote.last or quote.bid or quote.ask
                if not price or price <= 0:
                    return
                ts = quote.timestamp or datetime.now(timezone.utc)
                ts_ms = int(ts.timestamp() * 1000)
                prev = quote.prev_close or quote.close
                asyncio.ensure_future(
                    self._engine.process_tick(
                        sym,
                        float(price),
                        float(quote.volume or 0),
                        ts_ms,
                        float(prev) if prev and prev > 0 else None,
                    )
                )

            return on_update

        handler = make_handler(symbol)
        ticker.updateEvent += handler
        self._tickers[symbol] = ticker
        self._contracts[symbol] = c
        self._handlers[symbol] = handler

    async def subscribe(self, symbols: list[str]) -> None:
        self._engine.add_watch(symbols)
        try:
            client = await IBKRClient.get()
            ib = client.ib
            for sym in symbols:
                await self._subscribe_symbol(ib, sym.upper())
        except Exception as exc:
            logger.warning("subscribe failed: %s", exc)

    async def stop(self) -> None:
        try:
            client = IBKRClient._instance
            if client and client.is_connected():
                ib = client.ib
                for sym, contract in self._contracts.items():
                    ticker = self._tickers.get(sym)
                    if ticker:
                        ticker.updateEvent -= self._handlers[sym]
                    ib.cancelMktData(contract)
        except Exception as exc:
            logger.debug("ingestion stop: %s", exc)
        self._tickers.clear()
        self._contracts.clear()
        self._handlers.clear()
        await self._engine.stop()
        self._started = False


_ingestion: MarketIngestion | None = None


def get_ingestion() -> MarketIngestion:
    global _ingestion
    if _ingestion is None:
        _ingestion = MarketIngestion()
    return _ingestion
