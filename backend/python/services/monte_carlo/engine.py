"""GBM and strategy Monte Carlo — mirrors packages/analytics TypeScript engine."""

from __future__ import annotations

import math
import random
from dataclasses import dataclass
from typing import Any

from services.monte_carlo.statistics import distribution, mean, percentile_bands, summarize

DEFAULT_STEPS = 252
DEFAULT_MAX_PATHS = 200

REGIME_FACTOR = {
    "trending": 1.1,
    "compressed_vol": 1.05,
    "mean_reverting": 0.95,
    "elevated_vol": 0.8,
    "unknown": 0.9,
}

WEIGHTS = {
    "signalStrength": 0.4,
    "marketStructureScore": 0.25,
    "liquidity": 0.2,
    "sentimentMagnitude": 0.15,
}


def clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


@dataclass
class SeededRandom:
    rng: random.Random

    @classmethod
    def from_seed(cls, seed: int | None) -> SeededRandom:
        return cls(random.Random(seed if seed is not None else random.randrange(2**31)))

    def next_normal(self) -> float:
        return self.rng.gauss(0.0, 1.0)


def gbm_step(prev: float, mu: float, sigma: float, dt: float, shock: float) -> float:
    return prev * math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * math.sqrt(dt) * shock)


def gbm_path(start: float, mu: float, sigma: float, dt: float, steps: int, rng: SeededRandom) -> list[float]:
    path = [start]
    for _ in range(steps):
        path.append(gbm_step(path[-1], mu, sigma, dt, rng.next_normal()))
    return path


def gbm_terminal(start: float, mu: float, sigma: float, horizon: float, shock: float) -> float:
    return start * math.exp((mu - 0.5 * sigma * sigma) * horizon + sigma * math.sqrt(horizon) * shock)


def simulate_price_paths(body: dict[str, Any]) -> dict[str, Any]:
    spot = float(body["currentPrice"])
    vol = float(body["volatility"])
    drift = float(body["drift"])
    horizon = float(body["timeHorizon"])
    n = int(body["simulationCount"])
    steps = int(body.get("steps") or DEFAULT_STEPS)
    max_paths = min(int(body.get("maxRecordedPaths") or DEFAULT_MAX_PATHS), n)
    dt = horizon / steps
    rng = SeededRandom.from_seed(body.get("seed"))

    paths: list[list[float]] = []
    terminals: list[float] = []
    for i in range(n):
        if i < max_paths:
            p = gbm_path(spot, drift, vol, dt, steps, rng)
            paths.append(p)
            terminals.append(p[-1])
        else:
            terminals.append(gbm_terminal(spot, drift, vol, horizon, rng.next_normal()))

    return {
        "paths": paths,
        "terminalPrices": terminals,
        "expectedPrice": mean(terminals),
        "percentileBands": percentile_bands(terminals),
        "distribution": distribution(terminals),
        "statistics": summarize(terminals),
        "dt": dt,
    }


def simulate_strategy_outcome(body: dict[str, Any]) -> dict[str, Any]:
    win_rate = clamp01(float(body["winRate"]))
    avg_win = float(body["averageWin"])
    avg_loss = float(body["averageLoss"])
    trades = int(body["tradeFrequency"])
    equity = float(body["accountSize"])
    pos = float(body["positionSize"])
    ruin = float(body.get("ruinThreshold") or 0.0)
    n = int(body["simulationCount"])
    rng = SeededRandom.from_seed(body.get("seed"))

    finals: list[float] = []
    ruined = 0
    profitable = 0
    drawdowns: list[float] = []

    for _ in range(n):
        bal = equity
        peak = equity
        max_dd = 0.0
        hit_ruin = False
        for _t in range(trades):
            risk = bal * pos
            if rng.rng.random() < win_rate:
                bal += risk * avg_win
            else:
                bal -= risk * avg_loss
            peak = max(peak, bal)
            max_dd = max(max_dd, (peak - bal) / peak if peak else 0.0)
            if bal <= equity * ruin:
                hit_ruin = True
                break
        finals.append(bal)
        drawdowns.append(max_dd)
        if hit_ruin:
            ruined += 1
        if bal > equity:
            profitable += 1

    return {
        "probabilityOfProfit": profitable / n if n else 0.0,
        "expectedReturn": mean([(f - equity) / equity for f in finals]) if equity else 0.0,
        "expectedDrawdown": mean(drawdowns),
        "riskOfRuin": ruined / n if n else 0.0,
        "finalEquities": finals,
        "percentileBands": percentile_bands(finals),
        "distribution": distribution(finals),
        "statistics": summarize(finals),
    }


def score_conviction(inp: dict[str, Any]) -> float:
    regime = str(inp.get("regime") or "unknown")
    base = (
        WEIGHTS["signalStrength"] * clamp01(float(inp["signalStrength"]))
        + WEIGHTS["marketStructureScore"] * clamp01(float(inp["marketStructureScore"]))
        + WEIGHTS["liquidity"] * clamp01(float(inp["liquidity"]))
        + WEIGHTS["sentimentMagnitude"] * clamp01(abs(float(inp["sentiment"])))
    )
    regime_adj = base * REGIME_FACTOR.get(regime, 0.9)
    vol_drag = 1.0 - 0.5 * clamp01(float(inp["volatility"]))
    return clamp01(regime_adj * vol_drag)


def estimate_risk(inp: dict[str, Any], conviction: float) -> float:
    liq_risk = 1.0 - clamp01(float(inp["liquidity"]))
    vol_risk = clamp01(float(inp["volatility"]))
    return clamp01(0.5 * vol_risk + 0.3 * liq_risk + 0.2 * (1.0 - conviction))


def rate_quality(conviction: float) -> str:
    if conviction >= 0.7:
        return "high"
    if conviction >= 0.45:
        return "medium"
    if conviction >= 0.25:
        return "low"
    return "noise"


def simulate_trade_quality(body: dict[str, Any]) -> dict[str, Any]:
    n = int(body["simulationCount"])
    rng = SeededRandom.from_seed(body.get("seed"))
    base = score_conviction(body)
    scores: list[float] = []
    noise = 0.08
    for _ in range(n):
        shock = rng.next_normal() * noise
        scores.append(clamp01(base + shock))

    conv = mean(scores)
    risk = estimate_risk(body, conv)
    sd = math.sqrt(sum((s - conv) ** 2 for s in scores) / max(1, len(scores) - 1)) if len(scores) > 1 else 0.0
    return {
        "convictionScore": conv,
        "confidenceInterval": {"low": clamp01(conv - 1.96 * sd), "high": clamp01(conv + 1.96 * sd)},
        "noiseScore": clamp01(1.0 - conv),
        "expectedRisk": risk,
        "qualityRating": rate_quality(conv),
        "statistics": summarize(scores),
    }
