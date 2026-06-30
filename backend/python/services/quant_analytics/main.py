"""GX Quant Analytics FastAPI service."""
from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel

from services.quant_analytics import correlation, graham, win_rate

app = FastAPI(title="GX Quant Analytics")


class CorrelationReq(BaseModel):
    prices_by_symbol: dict[str, list[float]]
    benchmark: str | None = None


class WinRateReq(BaseModel):
    pnls: list[float]
    prior_a: float = 1.0
    prior_b: float = 1.0


class GrahamReq(BaseModel):
    price: float
    eps: float
    bvps: float
    growth_rate: float
    aaa_bond_yield: float
    current_assets: float = 0.0
    total_liabilities: float = 0.0
    shares_outstanding: float = 0.0
    current_ratio: float = 0.0
    years_positive_earnings: int = 0
    pe: float = 0.0
    pb: float = 0.0
    pays_dividend: bool = False


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "quant_analytics"}


@app.post("/v1/quant/correlation")
def post_correlation(req: CorrelationReq) -> dict:
    return correlation.analyze(req.prices_by_symbol, req.benchmark)


@app.post("/v1/quant/win-rate")
def post_win_rate(req: WinRateReq) -> dict:
    return win_rate.analyze(req.pnls, req.prior_a, req.prior_b)


@app.post("/v1/quant/graham")
def post_graham(req: GrahamReq) -> dict:
    return graham.analyze(graham.GrahamInputs(**req.model_dump()))
