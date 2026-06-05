"""IBKR HTTP client for Monte Carlo and opportunity services."""

from __future__ import annotations

import os
from typing import Any

import httpx

IBKR_BASE = os.environ.get("IBKR_API_URL", "http://localhost:8093").rstrip("/")
IBKR_KEY = os.environ.get("IBKR_API_KEY", os.environ.get("GE_API_KEY", ""))


async def _get(path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
    headers = {"X-API-Key": IBKR_KEY} if IBKR_KEY else {}
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.get(f"{IBKR_BASE}{path}", params=params or {}, headers=headers)
        r.raise_for_status()
        return r.json()


async def prev_close(symbol: str) -> dict[str, Any]:
    q = await _get("/market-data", {"symbol": symbol.upper(), "sec_type": "STK"})
    price = q.get("last") or q.get("close") or q.get("bid") or 0
    return {
        "symbol": symbol.upper(),
        "close": float(price),
        "open": float(price),
        "high": float(price),
        "low": float(price),
        "volume": float(q.get("volume") or 0),
        "timestamp": q.get("timestamp"),
        "source": "ibkr",
    }


async def snapshot_equity(symbol: str) -> dict[str, Any]:
    q = await _get("/market-data", {"symbol": symbol.upper(), "sec_type": "STK"})
    price = float(q.get("last") or q.get("close") or q.get("bid") or 0)
    prev = float(q.get("close") or price)
    return {
        "symbol": symbol.upper(),
        "price": price,
        "dayClose": price,
        "prevClose": prev,
        "afterHours": False,
        "source": "ibkr",
    }


async def options_chain_snapshot(symbol: str, limit: int = 250) -> list[dict[str, Any]]:
    data = await options_chain_snapshot_raw(symbol)
    return list(data.get("contracts") or [])[:limit]


async def options_chain_snapshot_raw(symbol: str) -> dict[str, Any]:
    return await _get("/options-chain", {"symbol": symbol.upper()})


async def enrich_spot(body: dict[str, Any]) -> dict[str, Any]:
    out = dict(body)
    symbol = str(out.get("symbol") or "").strip().upper()
    if not symbol or out.get("spot") or out.get("currentPrice"):
        return out
    snap = await snapshot_equity(symbol)
    out["spot"] = snap["price"] or snap["prevClose"]
    out["afterHours"] = snap.get("afterHours", False)
    return out


def has_ibkr() -> bool:
    return bool(IBKR_BASE)
