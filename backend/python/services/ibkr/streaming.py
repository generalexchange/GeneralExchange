"""WebSocket streaming for stocks, options, account, and positions."""

from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect
from ib_insync import Stock

from services.ibkr.client import IBKRClient
from services.ibkr.market_data import ticker_to_quote

logger = logging.getLogger(__name__)


def _json_default(obj: Any) -> Any:
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError


async def _accept_loop(ws: WebSocket, producer):
    await ws.accept()
    try:
        async for payload in producer:
            await ws.send_text(json.dumps(payload, default=_json_default))
    except WebSocketDisconnect:
        return
    except Exception as exc:
        logger.warning("ws stream error: %s", exc)
        await ws.close(code=1011)


async def stream_stock_prices(ws: WebSocket, symbols: list[str]) -> None:
    await ws.accept()
    try:
        client = await IBKRClient.get()
    except Exception as exc:
        logger.warning("ws stocks: IBKR not connected: %s", exc)
        await ws.send_text(json.dumps({"type": "error", "message": "IBKR not connected"}))
        await ws.close(code=1011)
        return

    ib = client.ib
    tickers = []
    contracts = []
    for sym in symbols:
        c = Stock(sym.upper(), "SMART", "USD")
        q = await ib.qualifyContractsAsync(c)
        if not q:
            continue
        contract = q[0]
        contracts.append(contract)
        tickers.append(ib.reqMktData(contract, "", False, False))

    async def produce():
        while True:
            for contract, ticker in zip(contracts, tickers):
                quote = ticker_to_quote(contract.symbol, "STK", ticker)
                yield {
                    "type": "market",
                    "data": {
                        "symbol": quote.symbol,
                        "price": quote.last or quote.bid or 0,
                        "volume": quote.volume,
                        "timestamp": int(quote.timestamp.timestamp() * 1000) if quote.timestamp else 0,
                        "source": "ibkr",
                    },
                }
            await asyncio.sleep(0.5)

    await _accept_loop(ws, produce())


async def stream_options_prices(ws: WebSocket, symbol: str) -> None:
    # Client sends option specs as JSON after connect; fallback to underlying only
    await ws.accept()
    client = await IBKRClient.get()
    ib = client.ib
    try:
        raw = await asyncio.wait_for(ws.receive_text(), timeout=5.0)
        spec = json.loads(raw)
        symbols = spec.get("contracts") or [{"symbol": symbol}]
    except Exception:
        symbols = [{"symbol": symbol}]

    async def produce():
        while True:
            for item in symbols:
                sym = str(item.get("symbol", symbol)).upper()
                stk = Stock(sym, "SMART", "USD")
                q = await ib.qualifyContractsAsync(stk)
                if not q:
                    continue
                ticker = ib.reqMktData(q[0], "106", False, False)
                await ib.sleep(0.3)
                quote = ticker_to_quote(sym, "STK", ticker)
                greeks = ticker.modelGreeks
                payload = quote.model_dump()
                if greeks:
                    payload["greeks"] = {
                        "delta": greeks.delta,
                        "gamma": greeks.gamma,
                        "theta": greeks.theta,
                        "vega": greeks.vega,
                        "implied_volatility": greeks.impliedVol,
                    }
                yield {"type": "option", "data": payload}
                ib.cancelMktData(q[0])
            await asyncio.sleep(1.0)

    try:
        async for payload in produce():
            await ws.send_text(json.dumps(payload, default=_json_default))
    except WebSocketDisconnect:
        return


async def stream_account_updates(ws: WebSocket) -> None:
    from services.ibkr.account import get_account_summary

    async def produce():
        while True:
            summary = await get_account_summary()
            yield {"type": "account", "data": summary.model_dump()}
            await asyncio.sleep(2.0)

    await _accept_loop(ws, produce())


async def stream_position_updates(ws: WebSocket) -> None:
    from services.ibkr.positions import get_positions

    async def produce():
        while True:
            positions = await get_positions()
            yield {"type": "positions", "data": [p.model_dump() for p in positions]}
            await asyncio.sleep(2.0)

    await _accept_loop(ws, produce())
