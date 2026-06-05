"""Pydantic schemas for IBKR API."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    ok: bool
    connected: bool
    paper: bool
    host: str
    port: int
    client_id: int
    account: str | None = None


class QuoteResponse(BaseModel):
    symbol: str
    sec_type: str
    bid: float | None = None
    ask: float | None = None
    last: float | None = None
    close: float | None = None
    volume: float | None = None
    timestamp: datetime | None = None
    source: Literal["ibkr"] = "ibkr"


class MarketDataRequest(BaseModel):
    symbol: str
    sec_type: Literal["STK", "OPT", "FUT", "IND"] = "STK"
    exchange: str = "SMART"
    currency: str = "USD"
    right: str | None = None
    strike: float | None = None
    expiry: str | None = None


class HistoricalBar(BaseModel):
    symbol: str
    bar_size: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float
    vwap: float | None = None


class HistoricalRequest(BaseModel):
    symbol: str
    bar_size: str = "1 min"
    duration: str = "1 D"
    sec_type: str = "STK"
    exchange: str = "SMART"
    currency: str = "USD"
    use_rth: bool = True
    persist: bool = True


class OptionContractQuote(BaseModel):
    symbol: str
    expiry: str
    strike: float
    right: Literal["C", "P"]
    bid: float | None = None
    ask: float | None = None
    last: float | None = None
    volume: float | None = None
    open_interest: float | None = None
    implied_volatility: float | None = None
    delta: float | None = None
    gamma: float | None = None
    theta: float | None = None
    vega: float | None = None


class OptionsChainResponse(BaseModel):
    symbol: str
    underlying_price: float | None = None
    expirations: list[str]
    strikes: list[float]
    contracts: list[OptionContractQuote]
    as_of: datetime


class AccountSummary(BaseModel):
    account: str
    net_liquidation: float | None = None
    total_cash: float | None = None
    buying_power: float | None = None
    gross_position_value: float | None = None
    unrealized_pnl: float | None = None
    realized_pnl: float | None = None
    currency: str = "USD"


class PositionResponse(BaseModel):
    account: str
    symbol: str
    sec_type: str
    position: float
    avg_cost: float
    market_price: float | None = None
    market_value: float | None = None
    unrealized_pnl: float | None = None
    currency: str = "USD"


class OrderRequest(BaseModel):
    symbol: str
    sec_type: Literal["STK", "OPT"] = "STK"
    action: Literal["BUY", "SELL"]
    quantity: float
    order_type: Literal["MKT", "LMT", "STP", "STP LMT"] = "MKT"
    limit_price: float | None = None
    stop_price: float | None = None
    tif: Literal["DAY", "GTC", "IOC", "OPG"] = "DAY"
    exchange: str = "SMART"
    currency: str = "USD"
    right: str | None = None
    strike: float | None = None
    expiry: str | None = None


class OrderResponse(BaseModel):
    order_id: int
    perm_id: int | None = None
    status: str
    symbol: str
    action: str
    quantity: float
    filled: float
    remaining: float
    avg_fill_price: float | None = None
    order_type: str
    limit_price: float | None = None
    message: str | None = None


class ExecutionResponse(BaseModel):
    exec_id: str
    order_id: int
    symbol: str
    side: str
    shares: float
    price: float
    time: datetime | None = None
    exchange: str | None = None


class SignalResponse(BaseModel):
    symbol: str
    signal_type: str
    value: float
    metadata: dict[str, Any] = Field(default_factory=dict)
    as_of: datetime
