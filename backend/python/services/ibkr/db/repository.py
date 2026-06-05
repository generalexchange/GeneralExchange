"""Database session and repository."""

from __future__ import annotations

import os
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Iterator

from sqlalchemy import create_engine, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session, sessionmaker

from services.ibkr.config import settings
from services.ibkr.db.models import Base, HistoricalBarRow
from services.ibkr.schemas import HistoricalBar


def _sync_db_url() -> str:
    raw = os.getenv("DATABASE_URL_SYNC") or os.getenv("DATABASE_URL") or settings.database_url_sync
    if raw.startswith("postgres://"):
        raw = "postgresql+psycopg2://" + raw[len("postgres://") :]
    elif raw.startswith("postgresql://") and "+" not in raw.split("://", 1)[0]:
        raw = raw.replace("postgresql://", "postgresql+psycopg2://", 1)
    return raw


def _sync_engine():
    url = _sync_db_url()
    connect_args: dict = {"connect_timeout": 5}
    if "sslmode=require" in url:
        connect_args["sslmode"] = "require"
    return create_engine(url, pool_pre_ping=True, connect_args=connect_args)


_engine = None
_SessionLocal = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = _sync_engine()
    return _engine


def _session_factory():
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(bind=get_engine(), autoflush=False, autocommit=False)
    return _SessionLocal


def init_db() -> None:
    Base.metadata.create_all(bind=get_engine())


@contextmanager
def get_session() -> Iterator[Session]:
    session = _session_factory()()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def upsert_bars(bars: list[HistoricalBar]) -> int:
    if not bars:
        return 0
    rows = [
        {
            "symbol": b.symbol.upper(),
            "bar_size": b.bar_size,
            "timestamp": b.timestamp if b.timestamp.tzinfo else b.timestamp.replace(tzinfo=timezone.utc),
            "open": b.open,
            "high": b.high,
            "low": b.low,
            "close": b.close,
            "volume": b.volume,
            "vwap": b.vwap,
            "source": "ibkr",
        }
        for b in bars
    ]
    stmt = insert(HistoricalBarRow).values(rows)
    stmt = stmt.on_conflict_do_nothing(constraint="uq_bar")
    with get_session() as session:
        result = session.execute(stmt)
        return result.rowcount or 0


def fetch_bars(symbol: str, bar_size: str, limit: int = 500) -> list[HistoricalBar]:
    with get_session() as session:
        q = (
            select(HistoricalBarRow)
            .where(HistoricalBarRow.symbol == symbol.upper(), HistoricalBarRow.bar_size == bar_size)
            .order_by(HistoricalBarRow.timestamp.desc())
            .limit(limit)
        )
        rows = session.scalars(q).all()
        rows.reverse()
        return [
            HistoricalBar(
                symbol=r.symbol,
                bar_size=r.bar_size,
                timestamp=r.timestamp,
                open=r.open,
                high=r.high,
                low=r.low,
                close=r.close,
                volume=r.volume,
                vwap=r.vwap,
            )
            for r in rows
        ]
