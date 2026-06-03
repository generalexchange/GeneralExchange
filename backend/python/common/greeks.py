"""Black-Scholes-Merton first- and second-order Greeks (dividend-free, q = 0).

Conventions mirror src/services/greeksService.ts: vega per 1% vol; theta,
charm, color per calendar day. Used by the options-chain service and the
backtesting engine so client and server agree to the last digit.
"""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass

_YEAR = 365.0


def _norm_cdf(x: float) -> float:
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def _norm_pdf(x: float) -> float:
    return math.exp(-0.5 * x * x) / math.sqrt(2.0 * math.pi)


@dataclass
class Greeks:
    price: float
    delta: float
    gamma: float
    theta: float
    vega: float
    rho: float
    lambda_: float
    epsilon: float
    charm: float
    vanna: float
    volga: float
    speed: float
    zomma: float
    color: float

    def as_dict(self) -> dict:
        d = asdict(self)
        d["lambda"] = d.pop("lambda_")  # reserved word in client schema
        return d


def bsm(spot: float, strike: float, t_years: float, rate: float, sigma: float, opt_type: str) -> Greeks:
    is_call = opt_type.upper() == "CALL"
    if t_years <= 0 or sigma <= 0:
        intrinsic = max(spot - strike, 0.0) if is_call else max(strike - spot, 0.0)
        return Greeks(intrinsic, 1.0 if (is_call and spot > strike) else 0.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)

    sqrt_t = math.sqrt(t_years)
    d1 = (math.log(spot / strike) + (rate + 0.5 * sigma * sigma) * t_years) / (sigma * sqrt_t)
    d2 = d1 - sigma * sqrt_t
    disc = math.exp(-rate * t_years)
    phi = _norm_pdf(d1)

    if is_call:
        delta = _norm_cdf(d1)
        price = spot * _norm_cdf(d1) - strike * disc * _norm_cdf(d2)
        theta_yr = -(spot * phi * sigma) / (2 * sqrt_t) - rate * strike * disc * _norm_cdf(d2)
        rho = strike * t_years * disc * _norm_cdf(d2) / 100.0
        epsilon = -spot * t_years * _norm_cdf(d1)
    else:
        delta = _norm_cdf(d1) - 1.0
        price = strike * disc * _norm_cdf(-d2) - spot * _norm_cdf(-d1)
        theta_yr = -(spot * phi * sigma) / (2 * sqrt_t) + rate * strike * disc * _norm_cdf(-d2)
        rho = -strike * t_years * disc * _norm_cdf(-d2) / 100.0
        epsilon = spot * t_years * _norm_cdf(-d1)

    gamma = phi / (spot * sigma * sqrt_t)
    vega = spot * phi * sqrt_t / 100.0
    lambda_ = delta * (spot / price) if price else 0.0
    charm_yr = -phi * ((2 * rate * t_years - d2 * sigma * sqrt_t) / (2 * t_years * sigma * sqrt_t))
    color_yr = (
        -phi
        / (2 * spot * t_years * sigma * sqrt_t)
        * (2 * rate * t_years + 1 + (d1 * (2 * rate * t_years - d2 * sigma * sqrt_t)) / (sigma * sqrt_t))
    )

    return Greeks(
        price=price,
        delta=delta,
        gamma=gamma,
        theta=theta_yr / _YEAR,
        vega=vega,
        rho=rho,
        lambda_=lambda_,
        epsilon=epsilon,
        charm=charm_yr / _YEAR,
        vanna=-phi * (d2 / sigma),
        volga=vega * (d1 * d2 / sigma),
        speed=-(gamma / spot) * (d1 / (sigma * sqrt_t) + 1),
        zomma=gamma * ((d1 * d2 - 1) / sigma),
        color=color_yr / _YEAR,
    )
