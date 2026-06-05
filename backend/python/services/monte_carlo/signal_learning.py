"""Historical signal store + online weight calibration from expired outcomes."""

from __future__ import annotations

import json
import math
import os
import uuid
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

DEFAULT_WEIGHTS: dict[str, float] = {
    "expected_return": 0.25,
    "probability_of_profit": 0.25,
    "liquidity": 0.15,
    "spread_quality": 0.15,
    "gamma_positioning": 0.10,
    "monte_carlo": 0.10,
}

STORE_PATH = Path(os.environ.get("SIGNAL_STORE_PATH", "/data/opportunity_signals.json"))


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _load() -> dict[str, Any]:
    if not STORE_PATH.exists():
        return {"weights": dict(DEFAULT_WEIGHTS), "signals": [], "calibration_runs": 0}
    try:
        data = json.loads(STORE_PATH.read_text(encoding="utf-8"))
        data.setdefault("weights", dict(DEFAULT_WEIGHTS))
        data.setdefault("signals", [])
        data.setdefault("calibration_runs", 0)
        return data
    except (json.JSONDecodeError, OSError):
        return {"weights": dict(DEFAULT_WEIGHTS), "signals": [], "calibration_runs": 0}


def _save(data: dict[str, Any]) -> None:
    STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STORE_PATH.write_text(json.dumps(data, indent=2), encoding="utf-8")


def get_weights() -> dict[str, float]:
    return dict(_load().get("weights") or DEFAULT_WEIGHTS)


def register_signal(payload: dict[str, Any]) -> dict[str, Any]:
    data = _load()
    sig = {
        "id": payload.get("id") or str(uuid.uuid4()),
        "symbol": payload["symbol"],
        "optionType": payload["optionType"],
        "strike": float(payload["strike"]),
        "expiration": payload["expiration"],
        "entryPremium": float(payload.get("entryPremium") or payload.get("mid") or 0),
        "spotAtEntry": float(payload.get("spot") or 0),
        "expectedReturn": float(payload.get("expectedReturn") or 0),
        "confidence": float(payload.get("confidence") or 0),
        "probabilityOfProfit": float(payload.get("probabilityOfProfit") or 0),
        "factorScores": payload.get("factorScores") or {},
        "createdAt": payload.get("createdAt") or _now_iso(),
        "status": "active",
        "actualReturn": None,
        "actualProfitable": None,
        "settledAt": None,
    }
    data["signals"] = [s for s in data["signals"] if not (s["symbol"] == sig["symbol"] and s["status"] == "active")]
    data["signals"].insert(0, sig)
    data["signals"] = data["signals"][:500]
    _save(data)
    return sig


def _intrinsic(spot: float, strike: float, opt_type: str) -> float:
    is_call = opt_type.upper() == "CALL"
    return max(spot - strike, 0.0) if is_call else max(strike - spot, 0.0)


def settle_expired(spot: float) -> int:
    """Mark expired active signals and return count settled."""
    data = _load()
    today = date.today()
    settled = 0
    for sig in data["signals"]:
        if sig.get("status") != "active":
            continue
        exp_raw = sig.get("expiration") or ""
        try:
            exp = date.fromisoformat(str(exp_raw)[:10])
        except ValueError:
            continue
        if exp >= today:
            continue
        premium = float(sig.get("entryPremium") or 0)
        intrinsic = _intrinsic(spot, float(sig["strike"]), str(sig["optionType"]))
        pnl = intrinsic - premium
        sig["actualReturn"] = round(pnl * 100, 2)
        sig["actualProfitable"] = pnl > 0
        sig["status"] = "expired"
        sig["settledAt"] = _now_iso()
        sig["settlementSpot"] = spot
        settled += 1
    if settled:
        data["calibration_runs"] = int(data.get("calibration_runs") or 0) + 1
        data["weights"] = _calibrate_weights(data["signals"], data["weights"])
        _save(data)
    return settled


def _calibrate_weights(signals: list[dict[str, Any]], weights: dict[str, float]) -> dict[str, float]:
    expired = [s for s in signals if s.get("status") == "expired" and s.get("actualProfitable") is not None]
    if len(expired) < 5:
        return dict(weights)

    factors = list(DEFAULT_WEIGHTS.keys())
    wins = [s for s in expired if s.get("actualProfitable")]
    losses = [s for s in expired if not s.get("actualProfitable")]
    if not wins or not losses:
        return dict(weights)

    def avg_factor(group: list[dict[str, Any]], key: str) -> float:
        vals = [float((s.get("factorScores") or {}).get(key, 0.5)) for s in group]
        return sum(vals) / len(vals) if vals else 0.5

    lr = 0.08
    next_w = dict(weights)
    for f in factors:
        win_avg = avg_factor(wins, f)
        loss_avg = avg_factor(losses, f)
        delta = (win_avg - loss_avg) * lr
        next_w[f] = max(0.05, min(0.45, next_w.get(f, DEFAULT_WEIGHTS[f]) + delta))

    total = sum(next_w.values()) or 1.0
    return {k: round(v / total, 4) for k, v in next_w.items()}


def list_outcomes(limit: int = 40) -> list[dict[str, Any]]:
    data = _load()
    expired = [s for s in data["signals"] if s.get("status") == "expired"]
    expired.sort(key=lambda s: s.get("settledAt") or "", reverse=True)
    return expired[:limit]


def calibration_meta() -> dict[str, Any]:
    data = _load()
    expired = [s for s in data["signals"] if s.get("status") == "expired"]
    hits = sum(1 for s in expired if s.get("actualProfitable"))
    return {
        "weights": data.get("weights") or DEFAULT_WEIGHTS,
        "calibrationRuns": int(data.get("calibration_runs") or 0),
        "expiredCount": len(expired),
        "hitRate": round(hits / len(expired), 4) if expired else None,
        "storePath": str(STORE_PATH),
    }
