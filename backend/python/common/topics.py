"""Redpanda topic names. Partitioned by symbol; replayable; idempotent."""

TICKS_RAW = "ticks-raw"
TICKS_NORMALIZED = "ticks-normalized"

CANDLES = {
    "1m": "candles-1m",
    "5m": "candles-5m",
    "15m": "candles-15m",
    "1h": "candles-1h",
    "1d": "candles-1d",
}

OPTIONS_CHAIN_SNAPSHOTS = "options-chain-snapshots"
SIGNALS = "signals"
PAPER_TRADE_EVENTS = "paper-trade-events"
NEWS_RAW = "news-raw"
NEWS_PROCESSED = "news-processed"
REGIME_EVENTS = "regime-events"
