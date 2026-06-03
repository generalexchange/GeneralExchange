"""Statistical analytics shared by the intelligence workers.

Pure-numpy implementations (no sklearn/scipy) so the workers stay light and
deterministic: Hurst exponent, 1-D k-means for regime clustering, autocorrelation,
skewness/kurtosis, and realized volatility.
"""

from __future__ import annotations

import numpy as np

TRADING_DAYS = 252


def log_returns(prices) -> np.ndarray:
    p = np.asarray(prices, dtype=float)
    if p.size < 2:
        return np.array([0.0])
    p = np.clip(p, 1e-9, None)
    return np.diff(np.log(p))


def realized_vol(returns, periods_per_year: int = TRADING_DAYS) -> float:
    r = np.asarray(returns, dtype=float)
    if r.size < 2:
        return 0.0
    return float(r.std(ddof=1) * np.sqrt(periods_per_year))


def hurst_exponent(prices) -> float:
    """Estimate the Hurst exponent via the variance-of-differences (lag) method.

    H > 0.5 → trending/persistent, H < 0.5 → mean-reverting, H ≈ 0.5 → random walk.
    Returns 0.5 when the series is too short or degenerate.
    """
    p = np.asarray(prices, dtype=float)
    n = p.size
    if n < 20:
        return 0.5
    max_lag = min(20, n // 2)
    lags = np.arange(2, max_lag)
    tau = []
    valid = []
    for lag in lags:
        diff = p[lag:] - p[:-lag]
        s = diff.std()
        if s > 1e-12:
            tau.append(s)
            valid.append(lag)
    if len(valid) < 3:
        return 0.5
    slope = np.polyfit(np.log(valid), np.log(tau), 1)[0]
    return float(np.clip(slope, 0.0, 1.0))


def autocorr_lag1(series) -> float:
    x = np.asarray(series, dtype=float)
    if x.size < 3:
        return 0.0
    x = x - x.mean()
    denom = float((x * x).sum())
    if denom < 1e-12:
        return 0.0
    return float((x[:-1] * x[1:]).sum() / denom)


def skewness(series) -> float:
    x = np.asarray(series, dtype=float)
    if x.size < 3:
        return 0.0
    sd = x.std()
    if sd < 1e-12:
        return 0.0
    return float(((x - x.mean()) ** 3).mean() / sd**3)


def kurtosis(series) -> float:
    """Excess kurtosis (normal = 0)."""
    x = np.asarray(series, dtype=float)
    if x.size < 4:
        return 0.0
    sd = x.std()
    if sd < 1e-12:
        return 0.0
    return float(((x - x.mean()) ** 4).mean() / sd**4 - 3.0)


def kmeans_1d(values, k: int = 3, iters: int = 50) -> tuple[np.ndarray, np.ndarray]:
    """Deterministic 1-D k-means (quantile-seeded). Returns (centroids, labels).

    Centroids are returned sorted ascending so label order is stable (e.g. low →
    high volatility regimes).
    """
    v = np.asarray(values, dtype=float)
    if v.size == 0:
        return np.zeros(k), np.array([], dtype=int)
    k = min(k, v.size)
    centroids = np.quantile(v, np.linspace(0.15, 0.85, k))
    labels = np.zeros(v.size, dtype=int)
    for _ in range(iters):
        d = np.abs(v[:, None] - centroids[None, :])
        labels = d.argmin(axis=1)
        new = np.array([v[labels == j].mean() if np.any(labels == j) else centroids[j] for j in range(k)])
        if np.allclose(new, centroids):
            break
        centroids = new
    order = np.argsort(centroids)
    remap = {old: new for new, old in enumerate(order)}
    labels = np.array([remap[int(l)] for l in labels])
    return centroids[order], labels


def label_for(value: float, centroids: np.ndarray, names: list[str]) -> str:
    """Nearest-centroid label for a single value."""
    if centroids.size == 0:
        return names[len(names) // 2]
    idx = int(np.argmin(np.abs(centroids - value)))
    return names[min(idx, len(names) - 1)]
