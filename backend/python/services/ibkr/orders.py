"""Order placement, cancellation, and execution tracking."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from ib_insync import LimitOrder, MarketOrder, Option, Order, Stock, StopOrder

from services.ibkr.client import IBKRClient, get_ib
from services.ibkr.schemas import ExecutionResponse, OrderRequest, OrderResponse


def _build_contract(req: OrderRequest):
    if req.sec_type == "OPT":
        if not req.expiry or req.strike is None or not req.right:
            raise ValueError("Option orders require expiry, strike, and right")
        exp = req.expiry.replace("-", "")[:8]
        return Option(req.symbol.upper(), exp, float(req.strike), req.right.upper()[0], req.exchange, currency=req.currency)
    return Stock(req.symbol.upper(), req.exchange, req.currency)


def _build_order(req: OrderRequest) -> Order:
    action = req.action
    qty = req.quantity
    if req.order_type == "MKT":
        return MarketOrder(action, qty, tif=req.tif)
    if req.order_type == "LMT":
        if req.limit_price is None:
            raise ValueError("limit_price required for LMT orders")
        return LimitOrder(action, qty, req.limit_price, tif=req.tif)
    if req.order_type == "STP":
        if req.stop_price is None:
            raise ValueError("stop_price required for STP orders")
        return StopOrder(action, qty, req.stop_price, tif=req.tif)
    raise ValueError(f"Unsupported order_type {req.order_type}")


def _order_to_response(trade) -> OrderResponse:
    o = trade.order
    s = trade.orderStatus
    return OrderResponse(
        order_id=int(o.orderId or 0),
        perm_id=int(o.permId) if o.permId else None,
        status=s.status,
        symbol=trade.contract.symbol,
        action=o.action,
        quantity=float(o.totalQuantity),
        filled=float(s.filled),
        remaining=float(s.remaining),
        avg_fill_price=float(s.avgFillPrice) if s.avgFillPrice else None,
        order_type=o.orderType,
        limit_price=float(o.lmtPrice) if o.lmtPrice else None,
        message=s.whyHeld or None,
    )


async def list_orders() -> list[OrderResponse]:
    ib = await get_ib()
    return [_order_to_response(t) for t in ib.openTrades()]


async def place_order(req: OrderRequest) -> OrderResponse:
    client = await IBKRClient.get()
    ib = client.ib
    contract = _build_contract(req)
    qualified = await ib.qualifyContractsAsync(contract)
    if not qualified:
        raise ValueError(f"Could not qualify order contract for {req.symbol}")
    order = _build_order(req)
    trade = ib.placeOrder(qualified[0], order)
    await asyncio.sleep(0.8)
    return _order_to_response(trade)


async def cancel_order(order_id: int) -> OrderResponse:
    ib = await get_ib()
    for trade in ib.openTrades():
        if int(trade.order.orderId or 0) == order_id:
            ib.cancelOrder(trade.order)
            await asyncio.sleep(0.4)
            return _order_to_response(trade)
    raise ValueError(f"Open order {order_id} not found")


async def list_executions() -> list[ExecutionResponse]:
    ib = await get_ib()
    fills = ib.fills()
    out: list[ExecutionResponse] = []
    for f in fills:
        ex = f.execution
        out.append(
            ExecutionResponse(
                exec_id=ex.execId,
                order_id=int(ex.orderId),
                symbol=f.contract.symbol,
                side=ex.side,
                shares=float(ex.shares),
                price=float(ex.price),
                time=ex.time if isinstance(ex.time, datetime) else datetime.now(timezone.utc),
                exchange=ex.exchange,
            )
        )
    return out
