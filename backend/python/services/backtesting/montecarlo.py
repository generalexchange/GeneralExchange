"""Monte Carlo robustness testing.

Two complementary procedures over the realized per-trade P&L:

  * **Path permutation** — shuffle the order of trades many times and record the
    distribution of max drawdown and final equity. Total P&L is invariant under
    permutation, but path-dependent risk is not, so this characterizes how
    lucky/unlucky the realized ordering was.
  * **Bootstrap significance** — resample trades with replacement to estimate the
    probability the strategy's mean P&L is not above zero (a hypothesis test that
    the edge is real rather than noise).

All randomness is driven by the run's seed, so results are reproducible.
"""

from __future__ import annotations

import numpy as np


def run(pnls: list[float], initial: float, seed: int, n: int = 2000) -> dict:
    arr = np.asarray(pnls, dtype=float)
    if arr.size < 5:
        return {
            "permutations": n,
            "drawdown_p5": 0.0, "drawdown_p50": 0.0, "drawdown_p95": 0.0,
            "final_equity_p5": initial, "final_equity_p95": initial,
            "prob_profit": 0.0, "hypothesis_p_value": 1.0, "above_random": False,
        }
    rng = np.random.default_rng(seed)

    # --- path permutation: distribution of max drawdown ---
    drawdowns = np.empty(n)
    finals = np.empty(n)
    for i in range(n):
        perm = rng.permutation(arr)
        eq = initial + np.cumsum(perm)
        peak = np.maximum.accumulate(eq)
        drawdowns[i] = float(((eq - peak) / peak).min() * 100)
        finals[i] = float(eq[-1])

    # --- bootstrap significance of positive mean ---
    boot_means = np.empty(n)
    for i in range(n):
        sample = rng.choice(arr, size=arr.size, replace=True)
        boot_means[i] = sample.mean()
    p_value = float((boot_means <= 0).mean())

    return {
        "permutations": n,
        "drawdown_p5": round(float(np.percentile(drawdowns, 5)), 1),
        "drawdown_p50": round(float(np.percentile(drawdowns, 50)), 1),
        "drawdown_p95": round(float(np.percentile(drawdowns, 95)), 1),
        "final_equity_p5": round(float(np.percentile(finals, 5)), 0),
        "final_equity_p95": round(float(np.percentile(finals, 95)), 0),
        "prob_profit": round(float((finals > initial).mean()), 3),
        "hypothesis_p_value": round(p_value, 4),
        "above_random": p_value < 0.05,
    }
