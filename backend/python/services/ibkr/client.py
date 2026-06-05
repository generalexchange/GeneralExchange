"""Reusable IBKR client singleton using ib_insync."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from ib_insync import IB, util

from services.ibkr.config import settings

logger = logging.getLogger(__name__)

# Allow ib_insync to share FastAPI's asyncio loop (skip if already patched)
try:
    util.patchAsyncio()
except Exception:
    pass


class IBKRClient:
    """Thread-safe singleton wrapper around ib_insync.IB."""

    _instance: IBKRClient | None = None
    _lock = asyncio.Lock()

    def __init__(self) -> None:
        self._ib = IB()
        self._connected = False
        self._account: str | None = None

    @classmethod
    async def get(cls) -> IBKRClient:
        if cls._instance is None:
            async with cls._lock:
                if cls._instance is None:
                    cls._instance = IBKRClient()
        client = cls._instance
        if not client.is_connected():
            await client.connect()
        return client

    @property
    def ib(self) -> IB:
        return self._ib

    def is_connected(self) -> bool:
        return self._ib.isConnected()

    async def connect(self) -> None:
        if self._ib.isConnected():
            return
        logger.info(
            "Connecting IBKR host=%s port=%s clientId=%s paper=%s",
            settings.ib_host,
            settings.ib_port,
            settings.ib_client_id,
            settings.ib_paper,
        )
        try:
            await asyncio.wait_for(
                self._ib.connectAsync(
                    settings.ib_host,
                    settings.ib_port,
                    clientId=settings.ib_client_id,
                    readonly=False,
                ),
                timeout=10.0,
            )
        except TimeoutError:
            logger.warning("IBKR connect timed out host=%s port=%s", settings.ib_host, settings.ib_port)
            raise
        self._connected = True
        accounts = self._ib.managedAccounts()
        if settings.ib_account and settings.ib_account in accounts:
            self._account = settings.ib_account
        elif accounts:
            self._account = accounts[0]
        logger.info("IBKR connected account=%s", self._account)

    async def disconnect(self) -> None:
        if self._ib.isConnected():
            self._ib.disconnect()
        self._connected = False

    def account_id(self) -> str:
        if settings.ib_account:
            return settings.ib_account
        if self._account:
            return self._account
        accounts = self._ib.managedAccounts()
        return accounts[0] if accounts else ""

    async def ensure_connected(self) -> IB:
        if not self.is_connected():
            await self.connect()
        return self._ib


async def get_ib() -> IB:
    return (await IBKRClient.get()).ib
