"""Lightweight trading signals derived from IBKR account + market data."""

from __future__ import annotations

from datetime import datetime, timezone

from services.ibkr.account import get_account_summary
from services.ibkr.market_data import get_quote
from services.ibkr.positions import get_positions
from services.ibkr.schemas import MarketDataRequest, SignalResponse


async def generate_signals(symbols: list[str] | None = None) -> list[SignalResponse]:
    syms = symbols or ["SPY", "QQQ"]
    now = datetime.now(timezone.utc)
    out: list[SignalResponse] = []

    try:
        acct = await get_account_summary()
        if acct.buying_power is not None:
            out.append(
                SignalResponse(
                    symbol="ACCOUNT",
                    signal_type="buying_power",
                    value=acct.buying_power,
                    metadata={"account": acct.account, "net_liquidation": acct.net_liquidation},
                    as_of=now,
                )
            )
    except Exception:
        pass

    try:
        positions = await get_positions()
        for p in positions:
            out.append(
                SignalResponse(
                    symbol=p.symbol,
                    signal_type="position_size",
                    value=p.position,
                    metadata={"avg_cost": p.avg_cost, "sec_type": p.sec_type},
                    as_of=now,
                )
            )
    except Exception:
        pass

    for sym in syms:
        try:
            q = await get_quote(MarketDataRequest(symbol=sym))
            if q.last:
                out.append(
                    SignalResponse(
                        symbol=sym,
                        signal_type="last_price",
                        value=q.last,
                        metadata={"bid": q.bid, "ask": q.ask, "volume": q.volume},
                        as_of=now,
                    )
                )
        except Exception:
            continue

    return out
