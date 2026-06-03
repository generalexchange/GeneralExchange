"""Persistence: promote a completed run to ClickHouse (system of record).

Backtest artifacts (the full run JSON) live in FloppyDisk; the summary row and
per-trade rows are promoted into ClickHouse `backtest_runs` / `backtest_trades`
for querying, leaderboards, and reproducibility audits.
"""

from __future__ import annotations

import datetime as dt
import json
import uuid

from common.clickhouse import insert_dicts
from common.logging import get_logger

from .engine import NS

log = get_logger("backtest.store")


def _uuid(seed: str) -> str:
    return str(uuid.uuid5(NS, seed))


def _dt(iso: str) -> dt.datetime:
    return dt.datetime.fromisoformat(iso)


def promote(client, result: dict, user_id: str | None = None) -> dict:
    """Best-effort promotion of a run to ClickHouse. Returns the CH identifiers."""
    rid = result["run_id"]
    ch_run_id = _uuid(f"run:{rid}")
    cfg = result["config"]
    m = result["metrics"]

    run_row = {
        "run_id": ch_run_id,
        "user_id": user_id or _uuid("user:anonymous"),
        "strategy_id": _uuid(f"strategy:{cfg['strategy_id']}"),
        "strategy_version": result["strategy_version"],
        "symbol": cfg["symbol"],
        "start_date": dt.date.fromisoformat(cfg["start_date"]),
        "end_date": dt.date.fromisoformat(cfg["end_date"]),
        "total_trades": int(m["total_trades"]),
        "win_rate": float(m["win_rate"]),
        "profit_factor": float(m["profit_factor"]),
        "sharpe_ratio": float(m["sharpe_ratio"]),
        "max_drawdown": float(m["max_drawdown_pct"]),
        "cagr": float(m["cagr"]),
        "calmar_ratio": float(m["calmar_ratio"]),
        "sortino_ratio": float(m["sortino_ratio"]),
        "omega_ratio": float(m["omega_ratio"]),
        "avg_trade_duration_minutes": float(m["avg_trade_duration_minutes"]),
        "total_pnl": float(m["total_pnl"]),
        "created_at": _dt(result["created_at"]),
        "parameters": json.dumps({"config": cfg, "strategy": result["strategy"], "seed": cfg["seed"]}),
    }

    trade_rows = [
        {
            "run_id": ch_run_id,
            "trade_id": t["trade_id"],
            "entry_time": _dt(t["entry_time"]),
            "exit_time": _dt(t["exit_time"]),
            "symbol": t["symbol"],
            "option_type": t["type"],
            "strike": float(t["strike"]),
            "expiration": dt.date.fromisoformat(t["expiration"]),
            "entry_price": float(t["entry_price"]),
            "exit_price": float(t["exit_price"]),
            "pnl": float(t["pnl"]),
            "delta_at_entry": float(t["delta_at_entry"]),
            "iv_rank_at_entry": float(t["iv_rank_at_entry"]),
            "regime_at_entry": t["regime_at_entry"],
        }
        for t in result["trades"]
    ]

    try:
        insert_dicts(client, "backtest_runs", [run_row])
        insert_dicts(client, "backtest_trades", trade_rows)
        log.info("promoted run", run_id=rid, ch_run_id=ch_run_id, trades=len(trade_rows))
    except Exception as e:  # noqa: BLE001 — warehouse may be offline in local dev
        log.warn("clickhouse promotion skipped", run_id=rid, error=str(e))

    return {"ch_run_id": ch_run_id}
