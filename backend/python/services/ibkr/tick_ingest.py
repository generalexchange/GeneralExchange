"""
IBKR tick-by-tick ingest — pushes MarketDataEvents to gx-engine via ZeroMQ.

Whitepaper v1.0 Part Three §3.1
"""

from __future__ import annotations

import asyncio
import time
from typing import Callable

import msgpack
import zmq
import zmq.asyncio
from ib_insync import IB, Contract, TickByTickAllLast, TickByTickBidAsk


class TickIngester:
    def __init__(self, zmq_push_addr: str = "tcp://127.0.0.1:5557"):
        self.ib = IB()
        self.ctx = zmq.asyncio.Context()
        self.push_sock = self.ctx.socket(zmq.PUSH)
        self.push_sock.connect(zmq_push_addr)
        self._subscriptions: dict[str, list] = {}
        self._seq = 0

    def _next_seq(self) -> int:
        self._seq += 1
        return self._seq

    async def connect(self, host: str = "127.0.0.1", port: int = 7497, client_id: int = 1):
        await self.ib.connectAsync(host, port, clientId=client_id)
        self.ib.disconnectedEvent += self._on_disconnect

    async def _on_disconnect(self):
        await asyncio.sleep(2.0)
        await self.connect()

    async def subscribe(
        self,
        symbol: str,
        sec_type: str = "STK",
        exchange: str = "SMART",
        currency: str = "USD",
    ):
        contract = Contract(
            symbol=symbol, secType=sec_type, exchange=exchange, currency=currency
        )
        await self.ib.qualifyContractsAsync(contract)

        def on_trade_tick(ticker, tick: TickByTickAllLast):
            self._emit_market_data(
                {
                    "seq": self._next_seq(),
                    "tsExchange": int(tick.time.timestamp() * 1_000_000),
                    "tsIngest": time.time_ns() // 1000,
                    "tsEmit": 0,
                    "source": "ibkr-tick-ingest/1.0",
                    "symbol": symbol,
                    "sessionId": "",
                    "kind": "market_data",
                    "price": tick.price,
                    "bid": 0.0,
                    "ask": 0.0,
                    "bidSz": 0.0,
                    "askSz": 0.0,
                    "lastSz": float(tick.size),
                    "volume": 0.0,
                    "vwap": 0.0,
                    "tickType": "trade",
                    "conditions": list(tick.tickAttribLast.__dict__.values())
                    if tick.tickAttribLast
                    else [],
                }
            )

        def on_bidask_tick(ticker, tick: TickByTickBidAsk):
            self._emit_market_data(
                {
                    "seq": self._next_seq(),
                    "tsExchange": int(tick.time.timestamp() * 1_000_000),
                    "tsIngest": time.time_ns() // 1000,
                    "tsEmit": 0,
                    "source": "ibkr-tick-ingest/1.0",
                    "symbol": symbol,
                    "sessionId": "",
                    "kind": "market_data",
                    "price": (tick.bidPrice + tick.askPrice) / 2.0,
                    "bid": tick.bidPrice,
                    "ask": tick.askPrice,
                    "bidSz": float(tick.bidSize),
                    "askSz": float(tick.askSize),
                    "lastSz": 0.0,
                    "volume": 0.0,
                    "vwap": 0.0,
                    "tickType": "bid_ask",
                    "conditions": [],
                }
            )

        trade_ticker = self.ib.reqTickByTickData(contract, "AllLast")
        trade_ticker.updateEvent += on_trade_tick

        bidask_ticker = self.ib.reqTickByTickData(contract, "BidAsk")
        bidask_ticker.updateEvent += on_bidask_tick

        self._subscriptions[symbol] = [trade_ticker, bidask_ticker]

    def _emit_market_data(self, event: dict):
        packed = msgpack.packb(event, use_bin_type=True)
        try:
            self.push_sock.send(packed, zmq.NOBLOCK)
        except zmq.Again:
            pass

    async def run(self):
        await self.ib.runAsync()


async def _main():
    ingester = TickIngester()
    await ingester.connect()
    for sym in ("TSLA", "META"):
        await ingester.subscribe(sym)
    await ingester.run()


if __name__ == "__main__":
    asyncio.run(_main())
