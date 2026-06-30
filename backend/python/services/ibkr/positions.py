"""Open positions."""

from __future__ import annotations

import asyncio
from services.ibkr.client import IBKRClient, get_ib
from services.ibkr.schemas import PositionResponse


async def get_positions() -> list[PositionResponse]:
    client = await IBKRClient.get()
    ib = client.ib
    account = client.account_id()
    ib.reqPositions()
    await asyncio.sleep(0.8)
    out: list[PositionResponse] = []
    for p in ib.positions(account):
        c = p.contract
        out.append(
            PositionResponse(
                account=p.account,
                symbol=c.localSymbol or c.symbol,
                sec_type=c.secType,
                position=float(p.position),
                avg_cost=float(p.avgCost),
                market_price=None,
                market_value=None,
                unrealized_pnl=None,
                currency=c.currency or "USD",
            )
        )
    return out
