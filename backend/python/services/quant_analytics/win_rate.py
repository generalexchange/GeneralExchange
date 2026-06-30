"""Win-rate engine — empirical + Wilson CI + Beta-Binomial posterior."""
from __future__ import annotations

import numpy as np
from scipy import stats


def wilson_interval(wins: int, n: int, z: float = 1.96) -> dict:
    if n == 0:
        return {"low": 0.0, "high": 0.0, "point": 0.0}
    p = wins / n
    denom = 1 + z * z / n
    center = (p + z * z / (2 * n)) / denom
    half = (z * np.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / denom
    return {"low": round(center - half, 4), "high": round(center + half, 4), "point": round(p, 4)}


def analyze(pnls: list[float], prior_a: float = 1.0, prior_b: float = 1.0) -> dict:
    a = np.asarray(pnls, dtype=float)
    n = len(a)
    wins = a[a > 0]
    losses = a[a < 0]
    w = len(wins)
    win_rate = w / n if n else 0.0
    avg_win = float(wins.mean()) if len(wins) else 0.0
    avg_loss = float(losses.mean()) if len(losses) else 0.0
    gross_win = float(wins.sum())
    gross_loss = float(-losses.sum())
    profit_factor = gross_win / gross_loss if gross_loss > 0 else None
    payoff = (avg_win / abs(avg_loss)) if avg_loss < 0 else None
    alpha = prior_a + w
    beta = prior_b + (n - w)
    lo, hi = stats.beta.ppf([0.025, 0.975], alpha, beta)
    return {
        "n": n,
        "wins": w,
        "win_rate": round(win_rate, 4),
        "wilson_95": wilson_interval(w, n),
        "bayesian": {
            "posterior_mean": round(float(alpha / (alpha + beta)), 4),
            "cred_low": round(float(lo), 4),
            "cred_high": round(float(hi), 4),
        },
        "profit_factor": round(profit_factor, 4) if profit_factor else None,
        "payoff_ratio": round(payoff, 4) if payoff else None,
    }
