"""Historical bar retrieval and PostgreSQL persistence."""

from __future__ import annotations

import logging
import math
from datetime import date, datetime, timezone

from ib_insync import Stock, util

from services.ibkr.client import get_ib
from services.ibkr.db.repository import fetch_bars, upsert_bars
from services.ibkr.schemas import HistoricalBar, HistoricalRequest

logger = logging.getLogger(__name__)


def _finite_float(value: object | None, default: float = 0.0) -> float:
    if value is None:
        return default
    try:
        num = float(value)
    except (TypeError, ValueError):
        return default
    return num if math.isfinite(num) else default


def _optional_finite_float(value: object | None) -> float | None:
    if value is None:
        return None
    try:
        num = float(value)
    except (TypeError, ValueError):
        return None
    return num if math.isfinite(num) else None


def _bar_timestamp(raw: object) -> datetime:
    if isinstance(raw, datetime):
        return raw if raw.tzinfo else raw.replace(tzinfo=timezone.utc)
    if isinstance(raw, date):
        return datetime(raw.year, raw.month, raw.day, tzinfo=timezone.utc)
    ts = util.parseIBDatetime(raw)
    return ts if ts.tzinfo else ts.replace(tzinfo=timezone.utc)


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
        ts = _bar_timestamp(b.date)
        result.append(
            HistoricalBar(
                symbol=req.symbol.upper(),
                bar_size=req.bar_size,
                timestamp=ts,
                open=_finite_float(b.open),
                high=_finite_float(b.high),
                low=_finite_float(b.low),
                close=_finite_float(b.close),
                volume=_finite_float(b.volume),
                vwap=_optional_finite_float(b.average),
            )
        )

    if req.persist and result:
        try:
            upsert_bars(result)
        except Exception as exc:
            logger.warning("PostgreSQL bar persist skipped: %s", exc)

    return result


async def get_historical_cached(req: HistoricalRequest) -> list[HistoricalBar]:
    cached: list[HistoricalBar] = []
    try:
        cached = fetch_bars(req.symbol, req.bar_size, limit=500)
        if cached and not req.persist:
            return cached
    except Exception as exc:
        logger.warning("PostgreSQL bar cache read skipped: %s", exc)
    live = await get_historical(req)
    return live or cached
