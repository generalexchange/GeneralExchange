"""Polygon / Massive REST helpers for Monte Carlo inputs (spot, IV, prev close)."""

from __future__ import annotations

import os
from typing import Any

import httpx

POLYGON_BASE = "https://api.polygon.io"
API_KEY = os.environ.get("POLYGON_API_KEY", "").strip()


async def _get(path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
    if not API_KEY:
        raise RuntimeError("POLYGON_API_KEY not configured")
    q = dict(params or {})
    q["apiKey"] = API_KEY
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(f"{POLYGON_BASE}{path}", params=q)
        r.raise_for_status()
        return r.json()


async def prev_close(symbol: str) -> dict[str, Any]:
    data = await _get(f"/v2/aggs/ticker/{symbol.upper()}/prev")
    results = data.get("results") or []
    if not results:
        raise RuntimeError(f"no prev close for {symbol}")
    bar = results[0]
    return {
        "symbol": symbol.upper(),
        "close": float(bar.get("c") or bar.get("close") or 0),
        "open": float(bar.get("o") or 0),
        "high": float(bar.get("h") or 0),
        "low": float(bar.get("l") or 0),
        "volume": float(bar.get("v") or 0),
        "timestamp": bar.get("t"),
        "source": "polygon",
    }


async def snapshot_equity(symbol: str) -> dict[str, Any]:
    data = await _get(f"/v2/snapshot/locale/us/markets/stocks/tickers/{symbol.upper()}")
    tick = data.get("ticker") or {}
    day = tick.get("day") or {}
    prev = tick.get("prevDay") or {}
    last = tick.get("lastTrade") or tick.get("min") or {}
    price = float(last.get("p") or day.get("c") or prev.get("c") or 0)
    return {
        "symbol": symbol.upper(),
        "price": price,
        "dayClose": float(day.get("c") or 0),
        "prevClose": float(prev.get("c") or 0),
        "afterHours": bool(tick.get("afterHours")),
        "source": "polygon",
    }


async def enrich_spot(body: dict[str, Any]) -> dict[str, Any]:
    """Fill spot from Polygon when symbol given and spot missing."""
    out = dict(body)
    symbol = str(out.get("symbol") or "").strip().upper()
    if not symbol or out.get("spot") or out.get("currentPrice"):
        return out
    snap = await snapshot_equity(symbol)
    out["spot"] = snap["price"] or snap["prevClose"]
    out["afterHours"] = snap.get("afterHours", False)
    return out
