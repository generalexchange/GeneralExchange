"""Historical bar retrieval and PostgreSQL persistence."""

from __future__ import annotations

from datetime import datetime, timezone

from ib_insync import Stock, util

from services.ibkr.client import get_ib
from services.ibkr.db.repository import fetch_bars, upsert_bars
from services.ibkr.schemas import HistoricalBar, HistoricalRequest


async def get_historical(req: HistoricalRequest) -> list[HistoricalBar]:
    ib = await get_ib()
    contract = Stock(req.symbol.upper(), req.exchange, req.currency)
    qualified = await ib.qualifyContractsAsync(contract)
    if not qualified:
        raise ValueError(f"Could not qualify {req.symbol}")
    contract = qualified[0]

    bars = await ib.reqHistoricalDataAsync(
        contract,
        endDateTime="",
        durationStr=req.duration,
        barSizeSetting=req.bar_size,
        whatToShow="TRADES",
        useRTH=req.use_rth,
        formatDate=1,
        keepUpToDate=False,
    )

    result: list[HistoricalBar] = []
    for b in bars:
        ts = b.date
        if isinstance(ts, datetime) and ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        elif not isinstance(ts, datetime):
            ts = util.parseIBDatetime(ts)
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
        result.append(
            HistoricalBar(
                symbol=req.symbol.upper(),
                bar_size=req.bar_size,
                timestamp=ts,
                open=float(b.open),
                high=float(b.high),
                low=float(b.low),
                close=float(b.close),
                volume=float(b.volume or 0),
                vwap=float(b.average) if b.average else None,
            )
        )

    if req.persist and result:
        upsert_bars(result)

    return result


async def get_historical_cached(req: HistoricalRequest) -> list[HistoricalBar]:
    cached = fetch_bars(req.symbol, req.bar_size, limit=500)
    if cached and not req.persist:
        return cached
    live = await get_historical(req)
    return live or cached
