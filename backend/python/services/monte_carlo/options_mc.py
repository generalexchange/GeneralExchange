"""Options-specific Monte Carlo and after-hours Black-Scholes pricing."""

from __future__ import annotations

from typing import Any

from common.greeks import bsm
from services.monte_carlo.engine import SeededRandom, gbm_terminal
from services.monte_carlo.statistics import distribution, mean, percentile_bands, summarize


def _payoff(spot: float, strike: float, opt_type: str) -> float:
    is_call = opt_type.upper() == "CALL"
    return max(spot - strike, 0.0) if is_call else max(strike - spot, 0.0)


def after_hours_bsm(body: dict[str, Any]) -> dict[str, Any]:
    """Price an option off the after-hours / last-known underlying."""
    spot = float(body["spot"])
    strike = float(body["strike"])
    t_years = float(body.get("timeToExpiryYears") or body.get("dteDays", 30) / 365.0)
    rate = float(body.get("riskFreeRate") or 0.05)
    sigma = float(body.get("impliedVolatility") or body.get("iv") or 0.25)
    opt_type = str(body.get("optionType") or body.get("type") or "CALL")
    g = bsm(spot, strike, t_years, rate, sigma, opt_type)
    return {
        "spot": spot,
        "strike": strike,
        "timeToExpiryYears": t_years,
        "impliedVolatility": sigma,
        "optionType": opt_type.upper(),
        "afterHours": bool(body.get("afterHours", True)),
        "greeks": g.as_dict(),
        "estimatedMark": g.price,
    }


def simulate_option_contract(body: dict[str, Any]) -> dict[str, Any]:
    """
    Monte Carlo probability analysis for a single options contract.

    Returns P(ITM), P(profitable vs entry premium), P(underlying up/down),
    terminal distribution of option value, and expected value.
    """
    spot = float(body["spot"])
    strike = float(body["strike"])
    vol = float(body.get("impliedVolatility") or body.get("iv") or 0.25)
    drift = float(body.get("drift") or 0.0)
    horizon = float(body.get("timeToExpiryYears") or float(body.get("dteDays", 30)) / 365.0)
    rate = float(body.get("riskFreeRate") or 0.05)
    opt_type = str(body.get("optionType") or body.get("type") or "CALL")
    premium = float(body.get("entryPremium") or body.get("premium") or 0.0)
    n = int(body.get("simulationCount") or 10_000)
    rng = SeededRandom.from_seed(body.get("seed"))

    is_call = opt_type.upper() == "CALL"
    terminals: list[float] = []
    payoffs: list[float] = []
    itm = 0
    profitable = 0
    underlying_up = 0

    for _ in range(n):
        s_t = gbm_terminal(spot, drift, vol, horizon, rng.next_normal())
        terminals.append(s_t)
        if is_call and s_t > strike:
            itm += 1
        elif not is_call and s_t < strike:
            itm += 1
        if s_t > spot:
            underlying_up += 1
        payoff = _payoff(s_t, strike, opt_type)
        payoffs.append(payoff)
        if premium > 0 and payoff > premium:
            profitable += 1
        elif premium <= 0 and payoff > 0:
            profitable += 1

    # Risk-neutral expected payoff (discounted) for comparison
    bs = bsm(spot, strike, horizon, rate, vol, opt_type)

    return {
        "symbol": body.get("symbol"),
        "spot": spot,
        "strike": strike,
        "optionType": opt_type.upper(),
        "impliedVolatility": vol,
        "timeToExpiryYears": horizon,
        "simulationCount": n,
        "probabilityITM": itm / n if n else 0.0,
        "probabilityProfitable": profitable / n if n else 0.0,
        "probabilityUnderlyingUp": underlying_up / n if n else 0.0,
        "probabilityUnderlyingDown": 1.0 - (underlying_up / n if n else 0.0),
        "expectedPayoff": mean(payoffs),
        "expectedTerminalSpot": mean(terminals),
        "blackScholesPrice": bs.price,
        "blackScholesDelta": bs.delta,
        "entryPremium": premium,
        "terminalSpotDistribution": distribution(terminals),
        "payoffDistribution": distribution(payoffs),
        "percentileBandsSpot": percentile_bands(terminals),
        "statisticsSpot": summarize(terminals),
        "statisticsPayoff": summarize(payoffs),
    }


def simulate_options_surface_mc(body: dict[str, Any]) -> dict[str, Any]:
    """Batch contract probabilities for a list of strikes/types (surface slice)."""
    contracts = body.get("contracts") or []
    results = [simulate_option_contract({**body, **c, "simulationCount": body.get("simulationCount", 5000)}) for c in contracts]
    return {"contracts": results, "count": len(results)}
