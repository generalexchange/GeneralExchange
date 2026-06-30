"""Benjamin Graham valuation."""
from __future__ import annotations

import math
from dataclasses import dataclass


@dataclass
class GrahamInputs:
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


def analyze(g: GrahamInputs) -> dict:
    gnum = math.sqrt(22.5 * g.eps * g.bvps) if g.eps > 0 and g.bvps > 0 else None
    intrinsic = (
        g.eps * (8.5 + 2 * g.growth_rate) * 4.4 / g.aaa_bond_yield
        if g.eps > 0 and g.aaa_bond_yield > 0
        else None
    )
    ncav = (
        (g.current_assets - g.total_liabilities) / g.shares_outstanding
        if g.shares_outstanding > 0
        else None
    )
    mos = (intrinsic - g.price) / intrinsic if intrinsic and g.price > 0 else None
    checks = {
        "adequate_current_ratio": g.current_ratio >= 2.0,
        "earnings_stability_10y": g.years_positive_earnings >= 10,
        "dividend_record": g.pays_dividend,
        "moderate_pe": 0 < g.pe <= 15,
        "moderate_pb": 0 < g.pb <= 1.5,
        "pe_pb_product": g.pe > 0 and g.pb > 0 and g.pe * g.pb <= 22.5,
    }
    passed = sum(1 for v in checks.values() if v)
    return {
        "graham_number": round(gnum, 2) if gnum else None,
        "intrinsic_value": round(intrinsic, 2) if intrinsic else None,
        "ncav_per_share": round(ncav, 2) if ncav else None,
        "margin_of_safety": round(mos, 4) if mos is not None else None,
        "defensive": {"checks": checks, "passed": passed, "total": len(checks)},
    }
