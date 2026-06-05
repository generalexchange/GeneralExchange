"""Options chain retrieval and greeks."""

from __future__ import annotations

from datetime import datetime, timezone

from ib_insync import Option, Stock

from services.ibkr.client import get_ib
from services.ibkr.market_data import ticker_to_quote
from services.ibkr.schemas import OptionContractQuote, OptionsChainResponse


async def get_underlying_price(symbol: str) -> float | None:
    ib = await get_ib()
    stk = Stock(symbol.upper(), "SMART", "USD")
    qualified = await ib.qualifyContractsAsync(stk)
    if not qualified:
        return None
    ticker = ib.reqMktData(qualified[0], "", False, False)
    await ib.sleep(1.0)
    q = ticker_to_quote(symbol, "STK", ticker)
    ib.cancelMktData(qualified[0])
    return q.last


async def get_options_chain(symbol: str, max_expirations: int = 4, strike_window: int = 12) -> OptionsChainResponse:
    ib = await get_ib()
    sym = symbol.upper()
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

    contracts: list[OptionContractQuote] = []
    for exp in expirations:
        for strike in strikes:
            for right in ("C", "P"):
                opt = Option(sym, exp, strike, right, "SMART", currency="USD")
                try:
                    q = await ib.qualifyContractsAsync(opt)
                    if not q:
                        continue
                    opt = q[0]
                except Exception:
                    continue
                ticker = ib.reqMktData(opt, "106", False, False)
                await ib.sleep(0.15)
                greeks = ticker.modelGreeks
                contracts.append(
                    OptionContractQuote(
                        symbol=sym,
                        expiry=f"{exp[:4]}-{exp[4:6]}-{exp[6:8]}",
                        strike=strike,
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
                )
                ib.cancelMktData(opt)

    return OptionsChainResponse(
        symbol=sym,
        underlying_price=spot,
        expirations=[f"{e[:4]}-{e[4:6]}-{e[6:8]}" for e in expirations],
        strikes=strikes,
        contracts=contracts,
        as_of=datetime.now(timezone.utc),
    )
