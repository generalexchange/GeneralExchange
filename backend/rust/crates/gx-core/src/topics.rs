//! Direct port of `backend/python/common/topics.py`.

pub const TICKS_RAW: &str = "ticks-raw";
pub const TICKS_NORMALIZED: &str = "ticks-normalized";
pub const OPTIONS_CHAIN_SNAPSHOTS: &str = "options-chain-snapshots";
pub const SIGNALS: &str = "signals";
pub const PAPER_TRADE_EVENTS: &str = "paper-trade-events";
pub const NEWS_RAW: &str = "news-raw";
pub const NEWS_PROCESSED: &str = "news-processed";
pub const REGIME_EVENTS: &str = "regime-events";

pub const CANDLE_INTERVALS: &[&str] = &["1m", "5m", "15m", "1h", "1d"];

pub fn candles(interval: &str) -> String {
    format!("candles-{interval}")
}

pub fn candles_topic(interval: &str) -> &'static str {
    match interval {
        "1m" => "candles-1m",
        "5m" => "candles-5m",
        "15m" => "candles-15m",
        "1h" => "candles-1h",
        "1d" => "candles-1d",
        _ => "candles-1m",
    }
}
