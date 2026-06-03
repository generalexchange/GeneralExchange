"""The backtesting engine — the crown jewel.

Loads historical bars into DuckDB, simulates an options strategy bar-by-bar with
Black-Scholes-Merton pricing, configurable slippage and commissions, walk-forward
validation with embargo, full performance metrics, and Monte Carlo robustness.

Every run is deterministically reproducible from its run_id: the run stores the
exact data range, strategy version, parameter set, and random seed. Re-running
the same config reproduces the same run_id and the same result.
"""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import uuid
from collections import defaultdict

from common.greeks import bsm

from . import metrics, montecarlo, walkforward
from .data import load_features
from .strategy import default_strategy, entry_triggered, exit_rules, signal_exit_triggered

INITIAL_EQUITY = 100_000.0
RISK_FREE = 0.045
WARMUP_BARS = 30
NS = uuid.UUID("0a51e000-0000-4000-8000-0000000000ff")  # namespace for deterministic ids


# --------------------------------------------------------------------------- #
# config + identity
# --------------------------------------------------------------------------- #
def canonical(config: dict) -> dict:
    return {
        "strategy_id": config.get("strategy_id", "st-custom"),
        "symbol": config.get("symbol", "QQQ").upper(),
        "start_date": config.get("start_date", "2019-01-01"),
        "end_date": config.get("end_date", "2026-06-01"),
        "sizing": config.get("sizing", "PERCENT_PORTFOLIO"),
        "sizing_value": float(config.get("sizing_value", 2.0)),
        "max_loss_per_trade": float(config.get("max_loss_per_trade", 1500)),
        "max_open_positions": int(config.get("max_open_positions", 5)),
        "commission_per_contract": float(config.get("commission_per_contract", 0.65)),
        "slippage": config.get("slippage", "SPREAD"),
        "slippage_bps": float(config.get("slippage_bps", 0)),
        "walk_forward": bool(config.get("walk_forward", True)),
        "seed": int(config.get("seed", 42)),
    }


def run_id_for(cfg: dict, strategy_version: str) -> str:
    blob = json.dumps({**cfg, "strategy_version": strategy_version}, sort_keys=True)
    return hashlib.sha256(blob.encode()).hexdigest()[:16]


def _det_uuid(*parts: str) -> str:
    return str(uuid.uuid5(NS, "|".join(parts)))


# --------------------------------------------------------------------------- #
# option helpers
# --------------------------------------------------------------------------- #
def _iv_estimate(realized_vol: float) -> float:
    return min(max(realized_vol if realized_vol > 0 else 0.2, 0.08), 1.5)


def _select_strike(spot: float, iv: float, dte_days: int, opt_type: str, target_delta: float) -> float:
    step = 5.0 if spot > 200 else (2.5 if spot > 50 else 1.0)
    atm = round(spot / step) * step
    best, best_err = atm, 1e9
    for i in range(-8, 9):
        k = atm + i * step
        if k <= 0:
            continue
        d = abs(bsm(spot, k, dte_days / 365.0, RISK_FREE, iv, opt_type).delta)
        err = abs(d - target_delta)
        if err < best_err:
            best, best_err = k, err
    return best


def _slip(price: float, cfg: dict, iv_spread: float, side: int) -> float:
    """Apply slippage to a fill price. side=+1 buy (pay up), -1 sell (receive less)."""
    model = cfg["slippage"]
    if model == "ZERO":
        return price
    if model == "CUSTOM_BPS":
        adj = price * (cfg["slippage_bps"] / 10_000)
    else:  # SPREAD — half the modeled bid/ask spread
        adj = max(0.01, price * 0.01)
    return max(0.01, price + side * adj)


# --------------------------------------------------------------------------- #
# simulation
# --------------------------------------------------------------------------- #
def run(config: dict, ch=None) -> dict:
    cfg = canonical(config)
    strategy = config.get("strategy") or default_strategy(cfg["symbol"])
    version = strategy.get("version", "v1")
    rid = run_id_for(cfg, version)

    rows, source = load_features(ch, cfg["symbol"], cfg["start_date"], cfg["end_date"], cfg["seed"])
    n = len(rows)
    folds = walkforward.make_folds(n) if cfg["walk_forward"] else []
    allowed = walkforward.oos_entry_allowed(folds) if folds else set(range(n))

    opt = strategy.get("option", {})
    opt_type = opt.get("type", "CALL")
    target_delta = float(opt.get("target_delta", 0.5))
    dte0 = int(opt.get("dte", 18))
    rules = exit_rules(strategy)
    max_open = cfg["max_open_positions"]
    comm = cfg["commission_per_contract"]

    # IV-rank proxy: percentile of realized vol across the series
    vols = sorted(r["realized_vol"] for r in rows)

    def iv_rank(v: float) -> float:
        if not vols:
            return 50.0
        below = sum(1 for x in vols if x < v)
        return round(below / len(vols) * 100, 0)

    def regime_label(r: dict) -> str:
        vr = "HIGH" if r["realized_vol"] > 0.35 else "ELEVATED" if r["realized_vol"] > 0.22 else "NORMAL"
        tr = "TRENDING" if r["trend"] == 1 else "MEAN_REVERTING"
        return f"{vr} · {tr}"

    cash = INITIAL_EQUITY
    positions: list[dict] = []
    trades: list[dict] = []
    equity_points: list[dict] = []
    peak = INITIAL_EQUITY

    def price_pos(p: dict, spot: float, iv: float, i: int) -> float:
        rem = max(dte0 - (i - p["entry_idx"]), 1)
        return bsm(spot, p["strike"], rem / 365.0, RISK_FREE, iv, p["type"]).price

    def close_position(p: dict, spot: float, iv: float, i: int, reason: str) -> None:
        nonlocal cash
        raw = price_pos(p, spot, iv, i)
        exit_price = _slip(raw, cfg, 0, side=-1)
        pnl = (exit_price - p["entry_price"]) * p["qty"] * 100 - comm * p["qty"] * 2
        cash += exit_price * p["qty"] * 100 - comm * p["qty"]
        trades.append({
            "run_id": rid,
            "trade_id": _det_uuid(rid, str(p["entry_idx"]), p["type"], str(p["strike"])),
            "n": len(trades) + 1,
            "symbol": cfg["symbol"],
            "type": p["type"],
            "strike": p["strike"],
            "expiration": (rows[min(i, n - 1)]["ts"] + dt.timedelta(days=dte0)).date().isoformat(),
            "entry_time": p["entry_ts"].isoformat(),
            "exit_time": rows[min(i, n - 1)]["ts"].isoformat(),
            "entry_price": round(p["entry_price"], 2),
            "exit_price": round(exit_price, 2),
            "pnl": round(pnl, 2),
            "delta_at_entry": round(p["delta"], 3),
            "iv_rank_at_entry": p["iv_rank"],
            "regime_at_entry": p["regime"],
            "duration_min": (i - p["entry_idx"]) * 390,  # ~1 trading day = 390 min
            "fold": walkforward.fold_of(folds, p["entry_idx"]) if folds else 0,
            "exit_reason": reason,
        })

    for i, r in enumerate(rows):
        spot = r["close"]
        iv = _iv_estimate(r["realized_vol"])

        # exits first
        still_open: list[dict] = []
        for p in positions:
            now = price_pos(p, spot, iv, i)
            pnl_pct = (now - p["entry_price"]) / p["entry_price"] * 100 if p["entry_price"] else 0
            held = i - p["entry_idx"]
            reason = None
            if rules["stop_loss_pct"] and pnl_pct <= -rules["stop_loss_pct"]:
                reason = "stop_loss"
            elif rules["take_profit_pct"] and pnl_pct >= rules["take_profit_pct"]:
                reason = "take_profit"
            elif rules["hold_bars"] and held >= rules["hold_bars"]:
                reason = "max_hold"
            elif dte0 - held <= 1:
                reason = "expiry_roll"
            elif signal_exit_triggered(strategy, r):
                reason = "signal"
            if reason:
                close_position(p, spot, iv, i, reason)
            else:
                still_open.append(p)
        positions = still_open

        # entries
        if (
            i >= WARMUP_BARS
            and len(positions) < max_open
            and i in allowed
            and entry_triggered(strategy, r)
        ):
            strike = _select_strike(spot, iv, dte0, opt_type, target_delta)
            g = bsm(spot, strike, dte0 / 365.0, RISK_FREE, iv, opt_type)
            entry_price = _slip(max(0.05, g.price), cfg, 0, side=1)
            equity_now = cash + sum(price_pos(p, spot, iv, i) * p["qty"] * 100 for p in positions)
            dollars = {
                "FIXED_DOLLAR": cfg["sizing_value"],
                "PERCENT_PORTFOLIO": equity_now * cfg["sizing_value"] / 100,
                "KELLY": equity_now * min(cfg["sizing_value"], 1.0),
            }.get(cfg["sizing"], equity_now * 0.02)
            qty = max(1, int(dollars // (entry_price * 100)))
            # risk cap: bound max loss per trade
            if rules["stop_loss_pct"]:
                max_qty = int(cfg["max_loss_per_trade"] // (entry_price * 100 * rules["stop_loss_pct"] / 100)) or 1
                qty = min(qty, max(1, max_qty))
            cost = entry_price * qty * 100 + comm * qty
            if cost <= cash:
                cash -= cost
                positions.append({
                    "strike": strike, "type": opt_type, "qty": qty, "entry_price": entry_price,
                    "entry_idx": i, "entry_ts": r["ts"], "delta": g.delta,
                    "iv_rank": iv_rank(r["realized_vol"]), "regime": regime_label(r),
                })

        mtm = cash + sum(price_pos(p, spot, iv, i) * p["qty"] * 100 for p in positions)
        peak = max(peak, mtm)
        equity_points.append({
            "t": r["ts"].isoformat(),
            "equity": round(mtm, 2),
            "drawdown": round((mtm - peak) / peak * 100, 2),
        })

    # close any open positions at the final bar
    if positions:
        last = rows[-1]
        iv = _iv_estimate(last["realized_vol"])
        for p in list(positions):
            close_position(p, last["close"], iv, n - 1, "end_of_test")

    equity = [pt["equity"] for pt in equity_points] or [INITIAL_EQUITY]
    years = max((rows[-1]["ts"] - rows[0]["ts"]).days / 365.0, 0.01) if n else 1.0
    m = metrics.compute(equity, trades, INITIAL_EQUITY, years)
    mc = montecarlo.run([t["pnl"] for t in trades], INITIAL_EQUITY, cfg["seed"])

    return {
        "run_id": rid,
        "status": "complete",
        "created_at": dt.datetime.utcnow().isoformat(),
        "config": cfg,
        "strategy": strategy,
        "strategy_version": version,
        "data_source": source,
        "bars": n,
        "metrics": m,
        "walk_forward": _fold_summary(folds, trades) if folds else None,
        "monte_carlo": mc,
        "monthly_returns": _monthly(equity_points),
        "regime_breakdown": _regime_breakdown(trades),
        "equity": equity_points,
        "trades": trades,
    }


# --------------------------------------------------------------------------- #
# breakdowns
# --------------------------------------------------------------------------- #
def _fold_summary(folds, trades) -> dict:
    by_fold: dict[int, list[dict]] = defaultdict(list)
    for t in trades:
        by_fold[t["fold"]].append(t)
    out = []
    for f in folds:
        ts = by_fold.get(f.index, [])
        pnl = sum(t["pnl"] for t in ts)
        wins = sum(1 for t in ts if t["pnl"] > 0)
        out.append({
            "fold": f.index, "trades": len(ts),
            "win_rate": round(wins / len(ts) * 100, 1) if ts else 0.0,
            "pnl": round(pnl, 0),
        })
    return {"folds": len(folds), "embargo_bars": 3, "per_fold": out}


def _monthly(points: list[dict]) -> list[dict]:
    if not points:
        return []
    buckets: dict[str, list[float]] = defaultdict(list)
    for p in points:
        buckets[p["t"][:7]].append(p["equity"])
    out = []
    for ym in sorted(buckets):
        eq = buckets[ym]
        ret = (eq[-1] / eq[0] - 1) * 100 if eq[0] else 0
        y, mo = ym.split("-")
        out.append({"year": int(y), "month": int(mo) - 1, "ret": round(ret, 1)})
    return out


def _regime_breakdown(trades: list[dict]) -> list[dict]:
    by: dict[str, list[dict]] = defaultdict(list)
    for t in trades:
        by[t["regime_at_entry"]].append(t)
    out = []
    for regime, ts in by.items():
        wins = sum(1 for t in ts if t["pnl"] > 0)
        gw = sum(t["pnl"] for t in ts if t["pnl"] > 0)
        gl = abs(sum(t["pnl"] for t in ts if t["pnl"] <= 0))
        out.append({
            "regime": regime, "trades": len(ts),
            "win_rate": round(wins / len(ts) * 100, 1) if ts else 0.0,
            "profit_factor": round(gw / gl, 2) if gl else round(gw, 2),
        })
    return out
