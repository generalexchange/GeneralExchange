"""Walk-forward validation windowing with embargo.

Splits the bar series into sequential folds. In-sample (IS) windows would be
used to fit/select parameters; out-of-sample (OOS) windows are where trades are
counted. An embargo gap of N bars after each IS window is excluded from
entry-eligibility to prevent look-ahead leakage across the boundary.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Fold:
    index: int
    is_start: int
    is_end: int
    oos_start: int
    oos_end: int


def make_folds(n_bars: int, folds: int = 4, is_frac: float = 0.6, embargo: int = 3) -> list[Fold]:
    if n_bars < folds * 10:
        # too short to split — single OOS window over the whole series
        return [Fold(0, 0, 0, 0, n_bars)]
    seg = n_bars // folds
    out: list[Fold] = []
    for k in range(folds):
        seg_start = k * seg
        seg_end = n_bars if k == folds - 1 else (k + 1) * seg
        is_len = int((seg_end - seg_start) * is_frac)
        is_start = seg_start
        is_end = seg_start + is_len
        oos_start = min(seg_end, is_end + embargo)
        out.append(Fold(k, is_start, is_end, oos_start, seg_end))
    return out


def oos_entry_allowed(folds: list[Fold]) -> set[int]:
    """Set of bar indices where opening a new position is permitted (OOS only)."""
    allowed: set[int] = set()
    for f in folds:
        allowed.update(range(f.oos_start, f.oos_end))
    return allowed


def fold_of(folds: list[Fold], idx: int) -> int:
    for f in folds:
        if f.oos_start <= idx < f.oos_end:
            return f.index
    return -1
