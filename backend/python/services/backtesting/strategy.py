"""Strategy definition format + condition evaluation.

A strategy is a JSON document:

{
  "name": "Momentum Breakout",
  "version": "v1",
  "symbol": "QQQ",
  "entry": {"all": [
      {"signal": "rsi", "op": "<", "value": 35},
      {"signal": "trend", "op": "==", "value": 1}
  ]},
  "exit": {
      "any": [{"signal": "rsi", "op": ">", "value": 60}],
      "hold_bars": 20,
      "stop_loss_pct": 30,
      "take_profit_pct": 50
  },
  "sizing": {"method": "percent_portfolio", "value": 2.0},
  "risk": {"max_loss_per_trade": 1500, "max_open_positions": 5},
  "option": {"structure": "single_leg", "type": "CALL", "target_delta": 0.5, "dte": 18}
}

Entry/exit signal groups are composable logical expressions over the feature
library computed in DuckDB (rsi, trend, sma_fast, sma_slow, momentum, vol, ret).
"""

from __future__ import annotations

from typing import Any

_OPS = {
    "<": lambda a, b: a < b,
    ">": lambda a, b: a > b,
    "<=": lambda a, b: a <= b,
    ">=": lambda a, b: a >= b,
    "==": lambda a, b: a == b,
    "!=": lambda a, b: a != b,
}


def default_strategy(symbol: str) -> dict:
    return {
        "name": "Momentum Breakout",
        "version": "v1",
        "symbol": symbol,
        "entry": {"all": [{"signal": "trend", "op": "==", "value": 1}, {"signal": "rsi", "op": "<", "value": 45}]},
        "exit": {"any": [{"signal": "rsi", "op": ">", "value": 62}], "hold_bars": 25, "stop_loss_pct": 35, "take_profit_pct": 60},
        "sizing": {"method": "percent_portfolio", "value": 2.0},
        "risk": {"max_loss_per_trade": 1500, "max_open_positions": 5},
        "option": {"structure": "single_leg", "type": "CALL", "target_delta": 0.5, "dte": 18},
    }


def _eval_condition(cond: dict, feats: dict[str, float]) -> bool:
    sig = cond.get("signal")
    op = _OPS.get(cond.get("op", "=="))
    if sig is None or op is None or sig not in feats:
        return False
    val = feats[sig]
    if val is None:
        return False
    return bool(op(val, cond["value"]))


def _eval_group(group: dict | None, feats: dict[str, float]) -> bool:
    if not group:
        return False
    if "all" in group:
        return all(_eval_condition(c, feats) for c in group["all"])
    if "any" in group:
        return any(_eval_condition(c, feats) for c in group["any"])
    return False


def entry_triggered(strategy: dict, feats: dict[str, float]) -> bool:
    return _eval_group(strategy.get("entry"), feats)


def signal_exit_triggered(strategy: dict, feats: dict[str, float]) -> bool:
    exit_def = strategy.get("exit", {})
    sub = {k: v for k, v in exit_def.items() if k in ("all", "any")}
    return _eval_group(sub or None, feats)


def exit_rules(strategy: dict) -> dict[str, Any]:
    e = strategy.get("exit", {})
    return {
        "hold_bars": e.get("hold_bars"),
        "stop_loss_pct": e.get("stop_loss_pct"),
        "take_profit_pct": e.get("take_profit_pct"),
    }
