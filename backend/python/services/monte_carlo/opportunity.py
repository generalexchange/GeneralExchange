"""Opportunity discovery — rank full options chains, one top contract per symbol."""

from __future__ import annotations

import math
from datetime import date, datetime
from typing import Any

from services.monte_carlo.options_mc import simulate_option_contract
from services.monte_carlo import ibkr_client
from services.monte_carlo.signal_learning import get_weights, register_signal, settle_expired

DISCOVERY_SYMBOLS = ["SPY", "QQQ", "AAPL", "MSFT", "NVDA", "TSLA"]
MIN_DTE = 7
MAX_DTE = 45
MIN_OI = 10
MAX_SPREAD_PCT = 0.18


def _dte(expiration: str) -> int:
    try:
        exp = date.fromisoformat(str(expiration)[:10])
        return (exp - date.today()).days
    except ValueError:
        return 999


def _parse_chain_row(r: dict[str, Any], symbol: str) -> dict[str, Any] | None:
    # IBKR contract shape
    if "expiry" in r or "right" in r:
        strike = float(r.get("strike") or 0)
        if strike <= 0:
            return None
        bid = float(r.get("bid") or 0)
        ask = float(r.get("ask") or 0)
        mid = (bid + ask) / 2 if bid or ask else float(r.get("last") or 0)
        exp = str(r.get("expiry") or "")
        opt = "CALL" if str(r.get("right") or "C").upper().startswith("C") else "PUT"
        iv = float(r.get("implied_volatility") or 0.25)
        if iv < 3:
            iv *= 100
        return {
            "symbol": symbol.upper(),
            "expiration": exp,
            "strike": strike,
            "optionType": opt,
            "bid": bid,
            "ask": ask,
            "mid": round(mid, 4),
            "volume": int(r.get("volume") or 0),
            "openInterest": int(r.get("open_interest") or 0),
            "iv": iv,
            "delta": float(r.get("delta") or 0),
            "gamma": float(r.get("gamma") or 0),
            "theta": float(r.get("theta") or 0),
            "vega": float(r.get("vega") or 0),
            "dte": _dte(exp),
        }

    det = r.get("details") or {}
    quote = r.get("last_quote") or {}
    day = r.get("day") or {}
    greeks = r.get("greeks") or {}
    strike = float(det.get("strike_price") or 0)
    if strike <= 0:
        return None
    bid = float(quote.get("bid") or 0)
    ask = float(quote.get("ask") or 0)
    mid = (bid + ask) / 2 if bid or ask else float(day.get("close") or 0)
    exp = str(det.get("expiration_date") or "")
    opt = "CALL" if str(det.get("contract_type") or "").lower() == "call" else "PUT"
    return {
        "symbol": symbol.upper(),
        "expiration": exp,
        "strike": strike,
        "optionType": opt,
        "bid": bid,
        "ask": ask,
        "mid": round(mid, 4),
        "volume": int(day.get("volume") or 0),
        "openInterest": int(r.get("open_interest") or 0),
        "iv": float(r.get("implied_volatility") or 0.25),
        "delta": float(greeks.get("delta") or 0),
        "gamma": float(greeks.get("gamma") or 0),
        "theta": float(greeks.get("theta") or 0),
        "vega": float(greeks.get("vega") or 0),
        "dte": _dte(exp),
    }


def _filter_contracts(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for row in rows:
        if row["dte"] < MIN_DTE or row["dte"] > MAX_DTE:
            continue
        if row["openInterest"] < MIN_OI:
            continue
        if row["mid"] < 0.05:
            continue
        spread = row["ask"] - row["bid"] if row["ask"] and row["bid"] else row["mid"] * 0.1
        spread_pct = spread / row["mid"] if row["mid"] > 0 else 1.0
        if spread_pct > MAX_SPREAD_PCT:
            continue
        row["spreadPct"] = round(spread_pct, 4)
        out.append(row)
    return out


def _norm(x: float, lo: float, hi: float) -> float:
    if hi <= lo:
        return 0.5
    return max(0.0, min(1.0, (x - lo) / (hi - lo)))


def _score_contract(row: dict[str, Any], spot: float, weights: dict[str, float]) -> dict[str, Any]:
    dte_years = max(row["dte"], 1) / 365.0
    mc = simulate_option_contract(
        {
            "symbol": row["symbol"],
            "spot": spot,
            "strike": row["strike"],
            "optionType": row["optionType"],
            "impliedVolatility": row["iv"] or 0.25,
            "timeToExpiryYears": dte_years,
            "entryPremium": row["mid"],
            "simulationCount": 4000,
        }
    )
    prob = float(mc.get("probabilityProfitable") or 0)
    exp_payoff = float(mc.get("expectedPayoff") or 0)
    expected_return = max(0.0, (exp_payoff - row["mid"]) * 100 * prob)

    liquidity = _norm(math.log1p(row["volume"]) + math.log1p(row["openInterest"]), 0, 12)
    spread_quality = _norm(1.0 - float(row.get("spreadPct") or 0.1), 0.82, 1.0)
    gamma_positioning = _norm(abs(row["gamma"]) * row["openInterest"], 0, 500)
    mc_score = _norm(prob * 0.6 + float(mc.get("probabilityITM") or 0) * 0.4, 0, 1)

    factor_scores = {
        "expected_return": _norm(expected_return, 0, 2500),
        "probability_of_profit": prob,
        "liquidity": liquidity,
        "spread_quality": spread_quality,
        "gamma_positioning": gamma_positioning,
        "monte_carlo": mc_score,
    }

    composite = sum(factor_scores[k] * weights.get(k, 0.1) for k in factor_scores)
    confidence = round(min(99, max(52, composite * 100)), 1)

    return {
        **row,
        "expectedReturn": round(expected_return, 2),
        "confidence": confidence,
        "probabilityOfProfit": round(prob * 100, 1),
        "compositeScore": round(composite, 4),
        "factorScores": {k: round(v, 4) for k, v in factor_scores.items()},
        "monteCarlo": {
            "probabilityITM": round(float(mc.get("probabilityITM") or 0) * 100, 1),
            "probabilityProfitable": round(prob * 100, 1),
            "expectedPayoff": round(exp_payoff, 4),
            "blackScholesPrice": round(float(mc.get("blackScholesPrice") or 0), 4),
        },
        "analysis": {
            "rationale": _rationale(row, factor_scores, prob),
            "rankFactors": factor_scores,
            "weights": weights,
        },
    }


def _rationale(row: dict[str, Any], factors: dict[str, float], prob: float) -> str:
    bits = []
    if factors["liquidity"] > 0.65:
        bits.append("strong liquidity")
    if factors["spread_quality"] > 0.7:
        bits.append("tight spread")
    if factors["gamma_positioning"] > 0.6:
        bits.append("favorable gamma positioning")
    if prob > 0.55:
        bits.append(f"{prob * 100:.0f}% modeled profit probability")
    if not bits:
        bits.append("balanced factor profile")
    return f"Top {row['optionType']} ${row['strike']:.1f} — " + ", ".join(bits) + "."


async def discover(body: dict[str, Any]) -> dict[str, Any]:
    symbols = [str(s).upper() for s in (body.get("symbols") or DISCOVERY_SYMBOLS)]
    include_chain = bool(body.get("includeChain"))
    weights = get_weights()
    opportunities: list[dict[str, Any]] = []

    for symbol in symbols:
        try:
            snap = await ibkr_client.snapshot_equity(symbol)
            spot = float(snap.get("price") or snap.get("prevClose") or 0)
            if spot <= 0:
                continue
            settle_expired(spot)
            raw = await ibkr_client.options_chain_snapshot_raw(symbol)
            parsed = [_parse_chain_row(r, symbol) for r in (raw.get("contracts") or [])]
            contracts = _filter_contracts([p for p in parsed if p])
            if not contracts:
                continue
            ranked = [_score_contract(c, spot, weights) for c in contracts]
            ranked.sort(key=lambda x: x["compositeScore"], reverse=True)
            top = ranked[0]
            top["id"] = f"{symbol}-{top['optionType']}-{top['strike']}-{top['expiration']}"
            top["spot"] = spot
            register_signal(top)
            if include_chain:
                top["chain"] = ranked[:25]
            opportunities.append(top)
        except Exception as exc:
            opportunities.append({"symbol": symbol, "error": str(exc)})

    opportunities.sort(key=lambda o: o.get("compositeScore", 0), reverse=True)
    return {
        "opportunities": opportunities,
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "ml": {"weights": weights},
    }


async def analyze(body: dict[str, Any]) -> dict[str, Any]:
    symbol = str(body.get("symbol") or "").upper()
    if not symbol:
        raise ValueError("symbol required")
    result = await discover({**body, "symbols": [symbol], "includeChain": True})
    opps = result.get("opportunities") or []
    if not opps or opps[0].get("error"):
        raise ValueError(opps[0].get("error") if opps else "no contracts")
    return opps[0]


async def outcomes(body: dict[str, Any]) -> dict[str, Any]:
    from services.monte_carlo.signal_learning import calibration_meta, list_outcomes

    symbol = str(body.get("symbol") or "SPY").upper()
    try:
        snap = await ibkr_client.snapshot_equity(symbol)
        spot = float(snap.get("price") or snap.get("prevClose") or 0)
        if spot > 0:
            settle_expired(spot)
    except Exception:
        pass
    return {
        "outcomes": list_outcomes(int(body.get("limit") or 40)),
        "ml": calibration_meta(),
    }
