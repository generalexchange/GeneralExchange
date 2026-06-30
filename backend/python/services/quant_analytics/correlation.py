"""Correlation engine — Pearson matrix + diversification score + rolling beta."""
from __future__ import annotations

import numpy as np
import pandas as pd


def _returns(prices: pd.DataFrame) -> pd.DataFrame:
    return np.log(prices / prices.shift(1)).dropna(how="all")


def analyze(prices_by_symbol: dict[str, list[float]], benchmark: str | None = None) -> dict:
    df = pd.DataFrame(prices_by_symbol).dropna()
    rets = _returns(df)
    pear = rets.corr(method="pearson")
    m = pear.values.copy()
    np.fill_diagonal(m, np.nan)
    div = float(1.0 - np.nanmean(np.abs(m)))
    out = {
        "symbols": list(df.columns),
        "pearson": pear.round(4).to_dict(),
        "diversification_score": round(div, 4),
    }
    if benchmark and benchmark in rets.columns:
        var = rets[benchmark].var()
        if var > 0:
            out["rolling_beta"] = {
                s: round(float(rets[s].cov(rets[benchmark]) / var), 4)
                for s in rets.columns
                if s != benchmark
            }
    return out
