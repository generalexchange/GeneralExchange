"""Unit tests for IBKR service (mocked — no live Gateway required)."""

from __future__ import annotations

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from services.ibkr.schemas import HistoricalBar, MarketDataRequest, OrderRequest
from services.ibkr.market_data import ticker_to_quote


def test_ticker_to_quote_uses_last():
    ticker = MagicMock()
    ticker.last = 100.5
    ticker.bid = 100.4
    ticker.ask = 100.6
    ticker.close = 99.0
    ticker.volume = 1000
    ticker.marketPrice = MagicMock(return_value=100.5)

    q = ticker_to_quote("SPY", "STK", ticker)
    assert q.symbol == "SPY"
    assert q.last == 100.5
    assert q.sec_type == "STK"


def test_historical_bar_schema():
    bar = HistoricalBar(
        symbol="SPY",
        bar_size="1 min",
        timestamp=datetime.now(timezone.utc),
        open=1,
        high=2,
        low=0.5,
        close=1.5,
        volume=100,
    )
    assert bar.symbol == "SPY"


def test_daily_bar_timestamp_and_nan_sanitization():
    from datetime import date
    import math

    from services.ibkr import historical as hist

    ts = hist._bar_timestamp(date(2026, 1, 2))
    assert ts.year == 2026 and ts.month == 1 and ts.day == 2
    assert ts.tzinfo is not None

    assert hist._finite_float(float("nan")) == 0.0
    assert hist._finite_float(42.5) == 42.5
    assert hist._optional_finite_float(float("nan")) is None
    assert math.isfinite(hist._finite_float(float("inf")))


@pytest.mark.asyncio
async def test_get_quote_qualifies_contract():
    from services.ibkr import market_data

    mock_ib = MagicMock()
    mock_contract = MagicMock()
    mock_contract.symbol = "SPY"
    mock_ib.qualifyContractsAsync = AsyncMock(return_value=[mock_contract])
    mock_ib.reqMktData = MagicMock(return_value=MagicMock(last=450.0, bid=449.9, ask=450.1, close=448.0, volume=100, marketPrice=MagicMock(return_value=450.0)))
    mock_ib.sleep = AsyncMock()
    mock_ib.cancelMktData = MagicMock()

    with patch("services.ibkr.market_data.get_ib", AsyncMock(return_value=mock_ib)):
        q = await market_data.get_quote(MarketDataRequest(symbol="SPY"))
        assert q.symbol == "SPY"
        assert q.last == 450.0


@pytest.mark.asyncio
async def test_ibkr_client_singleton():
    from services.ibkr.client import IBKRClient

    IBKRClient._instance = None
    client = IBKRClient()
    assert client is not None
    assert not client.is_connected()


def test_order_request_validation():
    req = OrderRequest(symbol="SPY", action="BUY", quantity=10, order_type="MKT")
    assert req.symbol == "SPY"
    assert req.action == "BUY"


def test_upsert_bars_empty():
    from services.ibkr.db.repository import upsert_bars

    assert upsert_bars([]) == 0
