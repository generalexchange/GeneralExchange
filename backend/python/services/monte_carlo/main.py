"""
Monte Carlo compute API (Python) — optional local service on port 8092.

Compatible with existing Next.js proxy routes (/v1/price-path, etc.) plus
options-specific endpoints for contract probabilities and after-hours BSM.
"""

from __future__ import annotations

import os
from typing import Any

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse

from services.monte_carlo.engine import simulate_price_paths, simulate_strategy_outcome, simulate_trade_quality
from services.monte_carlo.options_mc import after_hours_bsm, simulate_option_contract, simulate_options_surface_mc
from services.monte_carlo import ibkr_client
from services.monte_carlo import opportunity as opportunity_engine

API_KEY = os.environ.get("MC_API_KEY", "").strip() or os.environ.get("GE_API_KEY", "").strip()
PORT = int(os.environ.get("MC_PORT") or os.environ.get("PORT") or 8092)

app = FastAPI(title="General Exchange Monte Carlo", version="2.0.0")


def _auth(x_api_key: str | None) -> None:
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key")


@app.get("/health")
@app.get("/healthz")
async def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "monte-carlo-api",
        "engine": "python",
        "language": "python",
        "ibkr_configured": ibkr_client.has_ibkr(),
        "routes": [
            "price-path",
            "strategy",
            "trade-quality",
            "options/contract-probability",
            "options/after-hours-price",
            "options/surface",
            "market/prev-close",
            "market/snapshot",
            "opportunity/discover",
            "opportunity/analyze",
            "opportunity/outcomes",
        ],
    }


async def _handle(route: str, body: dict[str, Any]) -> Any:
    if route == "price-path":
        return simulate_price_paths(body)
    if route == "strategy":
        return simulate_strategy_outcome(body)
    if route == "trade-quality":
        return simulate_trade_quality(body)
    if route == "options/contract-probability":
        body = await ibkr_client.enrich_spot(body)
        return simulate_option_contract(body)
    if route == "options/after-hours-price":
        body = await ibkr_client.enrich_spot(body)
        return after_hours_bsm(body)
    if route == "options/surface":
        body = await ibkr_client.enrich_spot(body)
        return simulate_options_surface_mc(body)
    if route == "evaluate":
        # Lightweight trade grade from trade-quality + option context when present
        tq = simulate_trade_quality(body)
        if body.get("strike") and body.get("spot"):
            opt = simulate_option_contract(body)
            tq["optionProbabilityITM"] = opt["probabilityITM"]
            tq["optionProbabilityProfitable"] = opt["probabilityProfitable"]
            tq["blackScholesPrice"] = opt["blackScholesPrice"]
        return tq
    if route == "opportunity/discover":
        return await opportunity_engine.discover(body)
    if route == "opportunity/analyze":
        return await opportunity_engine.analyze(body)
    if route == "opportunity/outcomes":
        return await opportunity_engine.outcomes(body)
    raise HTTPException(status_code=404, detail=f"unknown route: {route}")


@app.post("/v1/{route_path:path}")
async def v1_post(
    route_path: str,
    request: Request,
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
) -> JSONResponse:
    _auth(x_api_key)
    body = await request.json()
    if not body:
        raise HTTPException(status_code=400, detail="empty body")
    result = await _handle(route_path.rstrip("/"), body)
    return JSONResponse(result)


@app.get("/v1/market/prev-close/{symbol}")
async def market_prev_close(symbol: str, x_api_key: str | None = Header(default=None, alias="X-API-Key")):
    _auth(x_api_key)
    try:
        return await ibkr_client.prev_close(symbol)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.get("/v1/market/snapshot/{symbol}")
async def market_snapshot(symbol: str, x_api_key: str | None = Header(default=None, alias="X-API-Key")):
    _auth(x_api_key)
    try:
        return await ibkr_client.snapshot_equity(symbol)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
