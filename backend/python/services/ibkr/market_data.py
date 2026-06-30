"""Stock and option quote helpers."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from ib_insync import Contract, Option, Stock, Ticker

from services.ibkr.client import IBKRClient, get_ib
from services.ibkr.schemas import MarketDataRequest, QuoteResponse


def _stock_contract(req: MarketDataRequest) -> Contract:
    return Stock(req.symbol.upper(), req.exchange, req.currency)


def _option_contract(req: MarketDataRequest) -> Option:
    if not req.expiry or req.strike is None or not req.right:
        raise ValueError("option quotes require expiry, strike, and right")
    return Option(
        req.symbol.upper(),
        req.expiry.replace("-", "")[:8],
        float(req.strike),
        req.right.upper()[0],
        req.exchange,
        currency=req.currency,
    )


def contract_from_request(req: MarketDataRequest) -> Contract:
    if req.sec_type == "OPT":
        return _option_contract(req)
    return _stock_contract(req)


def _safe(v: float | None) -> float | None:
    if v is None or v != v or v <= 0:
        return None
    return float(v)


def ticker_to_quote(symbol: str, sec_type: str, ticker: Ticker) -> QuoteResponse:
    m = ticker.marketPrice()
    last = _safe(ticker.last) or _safe(m) or _safe(ticker.bid) or _safe(ticker.ask)
    prev = _safe(ticker.close)
    return QuoteResponse(
        symbol=symbol.upper(),
        sec_type=sec_type,
        bid=_safe(ticker.bid),
        ask=_safe(ticker.ask),
        last=last,
        close=prev,
        prev_close=prev,
        open=_safe(ticker.open),
        volume=_safe(ticker.volume),
        timestamp=datetime.now(timezone.utc),
    )


async def get_quote(req: MarketDataRequest) -> QuoteResponse:
    ib = await get_ib()
    ib.reqMarketDataType(3)
    contract = contract_from_request(req)
    qualified = await ib.qualifyContractsAsync(contract)
    if not qualified:
        raise ValueError(f"Could not qualify contract for {req.symbol}")
    contract = qualified[0]
    ticker = ib.reqMktData(contract, "", True, False)
    await asyncio.sleep(1.5)
    quote = ticker_to_quote(req.symbol, req.sec_type, ticker)
    ib.cancelMktData(contract)
    return quote


async def stream_contracts(symbols: list[str]) -> list[tuple[Contract, Ticker]]:
    ib = await get_ib()
    out: list[tuple[Contract, Ticker]] = []
    for sym in symbols:
        c = Stock(sym.upper(), "SMART", "USD")
        qualified = await ib.qualifyContractsAsync(c)
        if not qualified:
            continue
        contract = qualified[0]
        ticker = ib.reqMktData(contract, "", False, False)
        out.append((contract, ticker))
    await asyncio.sleep(1.0)
    return out
