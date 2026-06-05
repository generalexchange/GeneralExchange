"""IBKR FastAPI service — market data, options, account, orders, streaming."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import Depends, FastAPI, Header, HTTPException, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from services.ibkr.account import get_account_summary
from services.ibkr.client import IBKRClient
from services.ibkr.config import settings
from services.ibkr.db.repository import init_db
from services.ibkr.historical import get_historical, get_historical_cached
from services.ibkr.market_data import get_quote
from services.ibkr.options import get_options_chain
from services.ibkr.orders import cancel_order, list_executions, list_orders, place_order
from services.ibkr.positions import get_positions
from services.ibkr.schemas import (
    HealthResponse,
    HistoricalRequest,
    MarketDataRequest,
    OrderRequest,
)
from services.ibkr.signals import generate_signals
from services.ibkr.streaming import (
    stream_account_updates,
    stream_options_prices,
    stream_position_updates,
    stream_stock_prices,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def verify_api_key(x_api_key: str | None = Header(default=None, alias="X-API-Key")) -> None:
    if settings.ibkr_api_key and x_api_key != settings.ibkr_api_key:
        raise HTTPException(status_code=401, detail="invalid api key")


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    try:
        init_db()
    except Exception as exc:
        logger.warning("PostgreSQL init skipped or failed: %s", exc)
    yield
    client = IBKRClient._instance
    if client:
        await client.disconnect()


app = FastAPI(title="General Exchange IBKR Service", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    client = IBKRClient._instance
    connected = bool(client and client.is_connected())
    account = client.account_id() if connected and client else None
    return HealthResponse(
        ok=True,
        connected=connected,
        paper=settings.ib_paper,
        host=settings.ib_host,
        port=settings.ib_port,
        client_id=settings.ib_client_id,
        account=account,
    )


@app.get("/market-data", dependencies=[Depends(verify_api_key)])
async def market_data(
    symbol: str = Query(...),
    sec_type: str = Query("STK"),
    exchange: str = Query("SMART"),
    currency: str = Query("USD"),
    right: str | None = Query(None),
    strike: float | None = Query(None),
    expiry: str | None = Query(None),
):
    req = MarketDataRequest(
        symbol=symbol,
        sec_type=sec_type,  # type: ignore[arg-type]
        exchange=exchange,
        currency=currency,
        right=right,
        strike=strike,
        expiry=expiry,
    )
    return await get_quote(req)


@app.get("/options-chain", dependencies=[Depends(verify_api_key)])
async def options_chain(symbol: str = Query(...)):
    return await get_options_chain(symbol)


@app.get("/historical", dependencies=[Depends(verify_api_key)])
async def historical(
    symbol: str = Query(...),
    bar_size: str = Query("1 min"),
    duration: str = Query("1 D"),
    use_rth: bool = Query(True),
    persist: bool = Query(True),
    cached: bool = Query(False),
):
    req = HistoricalRequest(
        symbol=symbol,
        bar_size=bar_size,
        duration=duration,
        use_rth=use_rth,
        persist=persist,
    )
    bars = await get_historical_cached(req) if cached else await get_historical(req)
    return {"symbol": symbol.upper(), "bar_size": bar_size, "bars": bars, "count": len(bars)}


@app.get("/account", dependencies=[Depends(verify_api_key)])
async def account():
    return await get_account_summary()


@app.get("/positions", dependencies=[Depends(verify_api_key)])
async def positions():
    return await get_positions()


@app.get("/orders", dependencies=[Depends(verify_api_key)])
async def orders():
    return await list_orders()


@app.post("/orders", dependencies=[Depends(verify_api_key)])
async def create_order(body: OrderRequest):
    if settings.ib_paper:
        logger.info("Paper order: %s", body.model_dump())
    return await place_order(body)


@app.delete("/orders/{order_id}", dependencies=[Depends(verify_api_key)])
async def delete_order(order_id: int):
    return await cancel_order(order_id)


@app.get("/executions", dependencies=[Depends(verify_api_key)])
async def executions():
    return await list_executions()


@app.get("/signals", dependencies=[Depends(verify_api_key)])
async def signals(symbols: str = Query("SPY,QQQ")):
    syms = [s.strip() for s in symbols.split(",") if s.strip()]
    return await generate_signals(syms)


@app.websocket("/ws/stocks")
async def ws_stocks(ws: WebSocket, symbols: str = Query("SPY,QQQ")):
    syms = [s.strip() for s in symbols.split(",") if s.strip()]
    await stream_stock_prices(ws, syms)


@app.websocket("/ws/options")
async def ws_options(ws: WebSocket, symbol: str = Query("SPY")):
    await stream_options_prices(ws, symbol)


@app.websocket("/ws/account")
async def ws_account(ws: WebSocket):
    await stream_account_updates(ws)


@app.websocket("/ws/positions")
async def ws_positions(ws: WebSocket):
    await stream_position_updates(ws)
