"""Performance metrics computed from the equity curve and trade list."""

from __future__ import annotations

import numpy as np

TRADING_DAYS = 252


def _max_drawdown(equity: np.ndarray) -> tuple[float, float]:
    peak = np.maximum.accumulate(equity)
    dd = (equity - peak) / peak
    i = int(np.argmin(dd))
    return float(dd[i] * 100), float(equity[i] - peak[i])  # pct, dollars


def compute(equity: list[float], trades: list[dict], initial: float, years: float) -> dict:
    eq = np.asarray(equity, dtype=float)
    pnls = np.asarray([t["pnl"] for t in trades], dtype=float) if trades else np.array([])

    wins = pnls[pnls > 0]
    losses = pnls[pnls <= 0]
    gross_win = float(wins.sum()) if wins.size else 0.0
    gross_loss = float(-losses.sum()) if losses.size else 0.0
    total_pnl = float(pnls.sum()) if pnls.size else 0.0

    # daily returns from equity curve for ratio metrics
    rets = np.diff(eq) / eq[:-1] if eq.size > 1 else np.array([0.0])
    ann = np.sqrt(TRADING_DAYS)
    sharpe = float(rets.mean() / rets.std() * ann) if rets.std() > 1e-9 else 0.0
    downside = rets[rets < 0]
    sortino = float(rets.mean() / downside.std() * ann) if downside.size and downside.std() > 1e-9 else 0.0
    omega = float(rets[rets > 0].sum() / -rets[rets < 0].sum()) if rets[rets < 0].sum() < 0 else 0.0

    dd_pct, dd_dollar = _max_drawdown(eq) if eq.size else (0.0, 0.0)
    cagr = float((eq[-1] / eq[0]) ** (1 / years) - 1) * 100 if years > 0 and eq.size else 0.0
    calmar = float(cagr / abs(dd_pct)) if dd_pct != 0 else 0.0

    # streaks
    max_w = max_l = cw = cl = 0
    for p in pnls:
        if p > 0:
            cw += 1; cl = 0; max_w = max(max_w, cw)
        else:
            cl += 1; cw = 0; max_l = max(max_l, cl)

    win_rate = float(wins.size / pnls.size) if pnls.size else 0.0
    avg_win = float(wins.mean()) if wins.size else 0.0
    avg_loss = float(losses.mean()) if losses.size else 0.0
    payoff = abs(avg_win / avg_loss) if avg_loss != 0 else 1.0
    kelly = (win_rate - (1 - win_rate) / payoff) if payoff > 0 else 0.0
    durations = [t.get("duration_min", 0) for t in trades]

    return {
        "total_trades": int(pnls.size),
        "total_pnl": round(total_pnl, 0),
        "win_rate": round(win_rate * 100, 1),
        "profit_factor": round(gross_win / gross_loss, 2) if gross_loss else round(gross_win, 2),
        "sharpe_ratio": round(sharpe, 2),
        "sortino_ratio": round(sortino, 2),
        "calmar_ratio": round(calmar, 2),
        "omega_ratio": round(omega, 2),
        "cagr": round(cagr, 1),
        "max_drawdown_pct": round(dd_pct, 1),
        "max_drawdown_dollar": round(dd_dollar, 0),
        "avg_trade_duration_minutes": round(float(np.mean(durations)) if durations else 0.0, 0),
        "avg_winner": round(avg_win, 0),
        "avg_loser": round(avg_loss, 0),
        "largest_winner": round(float(pnls.max()), 0) if pnls.size else 0.0,
        "largest_loser": round(float(pnls.min()), 0) if pnls.size else 0.0,
        "max_win_streak": max_w,
        "max_loss_streak": max_l,
        "expectancy": round(total_pnl / pnls.size, 0) if pnls.size else 0.0,
        "kelly": round(kelly * 100, 1),
    }
