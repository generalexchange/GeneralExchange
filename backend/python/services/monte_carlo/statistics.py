"""Summary stats compatible with @gx/analytics Monte Carlo outputs."""

from __future__ import annotations

import math
from typing import Any


def mean(xs: list[float]) -> float:
    return sum(xs) / len(xs) if xs else 0.0


def std(xs: list[float]) -> float:
    if len(xs) < 2:
        return 0.0
    m = mean(xs)
    var = sum((x - m) ** 2 for x in xs) / (len(xs) - 1)
    return math.sqrt(var)


def percentile(xs: list[float], p: float) -> float:
    if not xs:
        return 0.0
    s = sorted(xs)
    idx = (len(s) - 1) * p
    lo = int(math.floor(idx))
    hi = int(math.ceil(idx))
    if lo == hi:
        return s[lo]
    w = idx - lo
    return s[lo] * (1 - w) + s[hi] * w


def summarize(xs: list[float]) -> dict[str, float]:
    return {
        "mean": mean(xs),
        "stdDev": std(xs),
        "min": min(xs) if xs else 0.0,
        "max": max(xs) if xs else 0.0,
        "median": percentile(xs, 0.5),
    }


def percentile_bands(xs: list[float]) -> list[dict[str, float]]:
    levels = [0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95]
    return [{"percentile": p, "value": percentile(xs, p)} for p in levels]


def distribution(xs: list[float], bins: int = 20) -> list[dict[str, float]]:
    if not xs:
        return []
    lo, hi = min(xs), max(xs)
    if hi <= lo:
        return [{"binStart": lo, "binEnd": hi, "count": len(xs), "density": 1.0}]
    width = (hi - lo) / bins
    counts = [0] * bins
    for x in xs:
        i = min(bins - 1, int((x - lo) / width))
        counts[i] += 1
    n = len(xs)
    return [
        {
            "binStart": lo + i * width,
            "binEnd": lo + (i + 1) * width,
            "count": counts[i],
            "density": counts[i] / (n * width) if width else 0.0,
        }
        for i in range(bins)
    ]
