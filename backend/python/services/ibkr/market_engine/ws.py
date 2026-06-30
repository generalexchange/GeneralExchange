"""WebSocket /ws/market — snapshot + batched delta stream."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect

from services.ibkr.market_engine.engine import get_market_engine
from services.ibkr.market_engine.ingestion import get_ingestion

logger = logging.getLogger(__name__)


def _json_default(obj: Any) -> Any:
    from datetime import datetime

    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError


async def stream_market(ws: WebSocket) -> None:
    await ws.accept()
    engine = get_market_engine()
    ingestion = get_ingestion()
    queue = engine.subscribe()

    async def reader() -> None:
        try:
            while True:
                raw = await ws.receive_text()
                try:
                    msg = json.loads(raw)
                except json.JSONDecodeError:
                    continue
                action = msg.get("action") or msg.get("type")
                if action in ("subscribe", "sub"):
                    symbols = msg.get("symbols") or msg.get("symbol") or []
                    if isinstance(symbols, str):
                        symbols = [symbols]
                    if symbols:
                        await ingestion.subscribe([str(s).upper() for s in symbols])
                        snaps = engine.get_snapshots([str(s).upper() for s in symbols])
                        for snap in snaps:
                            await ws.send_text(
                                json.dumps({"type": "snapshot", "data": snap}, default=_json_default)
                            )
                elif action == "ping":
                    await ws.send_text(json.dumps({"type": "pong"}))
        except WebSocketDisconnect:
            return
        except Exception as exc:
            logger.debug("ws market reader: %s", exc)

    async def writer() -> None:
        try:
            default_syms = engine.watchlist()
            for snap in engine.get_snapshots(default_syms):
                await ws.send_text(json.dumps({"type": "snapshot", "data": snap}, default=_json_default))
            while True:
                msg = await queue.get()
                await ws.send_text(json.dumps(msg, default=_json_default))
        except WebSocketDisconnect:
            return
        except asyncio.CancelledError:
            return
        except Exception as exc:
            logger.warning("ws market writer: %s", exc)

    reader_task = asyncio.create_task(reader())
    writer_task = asyncio.create_task(writer())
    try:
        done, pending = await asyncio.wait(
            {reader_task, writer_task},
            return_when=asyncio.FIRST_COMPLETED,
        )
        for t in pending:
            t.cancel()
        for t in done:
            try:
                await t
            except Exception:
                pass
    finally:
        engine.unsubscribe(queue)
        reader_task.cancel()
        writer_task.cancel()
