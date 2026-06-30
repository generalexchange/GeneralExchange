"""Options chain retrieval and greeks."""

from __future__ import annotations

import asyncio
import time
from datetime import datetime, timezone

from ib_insync import Option, Stock

from services.ibkr.client import get_ib
from services.ibkr.market_data import ticker_to_quote
from services.ibkr.schemas import OptionContractQuote, OptionsChainResponse

_CHAIN_CACHE: dict[str, tuple[float, OptionsChainResponse]] = {}
_CHAIN_TTL_SEC = 90.0
_QUALIFY_CHUNK = 40


def _contract_quote(sym: str, opt: Option, ticker) -> OptionContractQuote:
    exp = opt.lastTradeDateOrContractMonth
    greeks = ticker.modelGreeks
    right = opt.right or "C"
    return OptionContractQuote(
        symbol=sym,
        expiry=f"{exp[:4]}-{exp[4:6]}-{exp[6:8]}",
        strike=float(opt.strike),
        right=right,  # type: ignore[arg-type]
        bid=ticker.bid if ticker.bid == ticker.bid else None,
        ask=ticker.ask if ticker.ask == ticker.ask else None,
        last=ticker.last if ticker.last == ticker.last else None,
        volume=ticker.volume if ticker.volume == ticker.volume else None,
        open_interest=getattr(ticker, "openInterest", None),
        implied_volatility=greeks.impliedVol if greeks else None,
        delta=greeks.delta if greeks else None,
        gamma=greeks.gamma if greeks else None,
        theta=greeks.theta if greeks else None,
        vega=greeks.vega if greeks else None,
    )


async def get_underlying_price(symbol: str) -> float | None:
    ib = await get_ib()
    ib.reqMarketDataType(3)
    stk = Stock(symbol.upper(), "SMART", "USD")
    qualified = await ib.qualifyContractsAsync(stk)
    if not qualified:
        return None
    ticker = ib.reqMktData(qualified[0], "", False, False)
    await asyncio.sleep(0.8)
    q = ticker_to_quote(symbol, "STK", ticker)
    ib.cancelMktData(qualified[0])
    return q.last


async def get_options_chain(
    symbol: str,
    max_expirations: int = 2,
    strike_window: int = 8,
) -> OptionsChainResponse:
    sym = symbol.upper()
    cache_key = f"{sym}:{max_expirations}:{strike_window}"
    cached = _CHAIN_CACHE.get(cache_key)
    if cached and time.monotonic() - cached[0] < _CHAIN_TTL_SEC:
        return cached[1]

    ib = await get_ib()
    ib.reqMarketDataType(3)
    stk = Stock(sym, "SMART", "USD")
    qualified = await ib.qualifyContractsAsync(stk)
    if not qualified:
        raise ValueError(f"Could not qualify stock {sym}")
    stk = qualified[0]

    chains = await ib.reqSecDefOptParamsAsync(stk.symbol, "", stk.secType, stk.conId)
    if not chains:
        raise ValueError(f"No option chain metadata for {sym}")

    chain = next((c for c in chains if c.exchange in ("SMART", "CBOE", "BOX")), chains[0])
    expirations = sorted(chain.expirations)[:max_expirations]
    strikes = sorted(float(s) for s in chain.strikes)
    spot = await get_underlying_price(sym)

    if spot and strikes:
        strikes = sorted(strikes, key=lambda s: abs(s - spot))[: strike_window * 2]
    else:
        mid = len(strikes) // 2
        strikes = strikes[max(0, mid - strike_window) : mid + strike_window]

    raw_opts: list[Option] = []
    for exp in expirations:
        for strike in strikes:
            for right in ("C", "P"):
                raw_opts.append(Option(sym, exp, strike, right, "SMART", currency="USD"))

    qualified_opts: list[Option] = []
    for i in range(0, len(raw_opts), _QUALIFY_CHUNK):
        chunk = raw_opts[i : i + _QUALIFY_CHUNK]
        try:
            q = await ib.qualifyContractsAsync(*chunk)
            qualified_opts.extend(q)
        except Exception:
            for opt in chunk:
                try:
                    q = await ib.qualifyContractsAsync(opt)
                    if q:
                        qualified_opts.extend(q)
                except Exception:
                    continue

    subs: list[tuple[Option, object]] = []
    for opt in qualified_opts:
        subs.append((opt, ib.reqMktData(opt, "106", False, False)))

    # One wait for the whole batch instead of per-contract sleeps.
    await asyncio.sleep(1.2 if len(subs) <= 48 else 1.8)

    contracts: list[OptionContractQuote] = []
    for opt, ticker in subs:
        contracts.append(_contract_quote(sym, opt, ticker))
        ib.cancelMktData(opt)

    resp = OptionsChainResponse(
        symbol=sym,
        underlying_price=spot,
        expirations=[f"{e[:4]}-{e[4:6]}-{e[6:8]}" for e in expirations],
        strikes=strikes,
        contracts=contracts,
        as_of=datetime.now(timezone.utc),
    )
    _CHAIN_CACHE[cache_key] = (time.monotonic(), resp)
    return resp
