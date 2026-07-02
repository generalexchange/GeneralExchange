//! Unified event types — mirrors `@gx/event-schema` (Whitepaper v1.0 Part Two).

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EventBase {
    pub seq: u64,
    pub ts_exchange: i64,
    pub ts_ingest: i64,
    pub ts_emit: i64,
    pub source: String,
    pub symbol: String,
    pub session_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MarketDataEvent {
    #[serde(flatten)]
    pub base: EventBase,
    pub kind: String,
    pub price: f64,
    pub bid: f64,
    pub ask: f64,
    pub bid_sz: f64,
    pub ask_sz: f64,
    pub last_sz: f64,
    pub volume: f64,
    pub vwap: f64,
    pub tick_type: String,
    pub conditions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SignalEvent {
    #[serde(flatten)]
    pub base: EventBase,
    pub kind: String,
    pub strategy_id: String,
    pub strategy_version: String,
    pub direction: String,
    pub confidence: f64,
    pub features: HashMap<String, f64>,
    pub indicators: HashMap<String, serde_json::Value>,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FillEvent {
    #[serde(flatten)]
    pub base: EventBase,
    pub kind: String,
    pub order_id: String,
    pub fill_id: String,
    pub side: String,
    pub fill_qty: f64,
    pub fill_price: f64,
    pub commission: f64,
    pub liquidity: String,
    pub is_simulated: bool,
    pub slippage_bps: f64,
    pub exec_algo: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Position {
    pub symbol: String,
    pub qty: f64,
    pub avg_cost: f64,
    pub market_value: f64,
    pub unrealized_pnl: f64,
    pub realized_pnl: f64,
    pub day_pnl: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PortfolioEvent {
    #[serde(flatten)]
    pub base: EventBase,
    pub kind: String,
    pub trigger_seq: u64,
    pub positions: HashMap<String, Position>,
    pub cash: f64,
    pub nav: f64,
    pub gross_exposure: f64,
    pub net_exposure: f64,
    pub leverage: f64,
    pub drawdown: f64,
    pub peak_nav: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CandleEvent {
    #[serde(flatten)]
    pub base: EventBase,
    pub kind: String,
    pub interval: String,
    pub open: f64,
    pub high: f64,
    pub low: f64,
    pub close: f64,
    pub volume: f64,
    pub vwap: f64,
    pub tick_count: u64,
    pub is_final: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemEvent {
    #[serde(flatten)]
    pub base: EventBase,
    pub kind: String,
    pub level: String,
    pub component: String,
    pub code: String,
    pub message: String,
    pub payload: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone)]
pub struct CandleAccumulator {
    pub symbol: String,
    pub interval_secs: u32,
    pub open: f64,
    pub high: f64,
    pub low: f64,
    pub close: f64,
    pub volume: f64,
    pub vwap_numerator: f64,
    pub tick_count: u64,
    pub window_start: i64,
}

impl CandleAccumulator {
    pub fn new(symbol: &str, interval_secs: u32, ts: i64, price: f64, size: f64) -> Self {
        let window_us = interval_secs as i64 * 1_000_000;
        Self {
            symbol: symbol.to_string(),
            interval_secs,
            open: price,
            high: price,
            low: price,
            close: price,
            volume: size,
            vwap_numerator: price * size,
            tick_count: 1,
            window_start: ts - (ts % window_us),
        }
    }

    pub fn update(&mut self, price: f64, size: f64, ts: i64, seq: u64, session_id: &str) -> Option<CandleEvent> {
        let window_us = self.interval_secs as i64 * 1_000_000;
        let window_end = self.window_start + window_us;
        if ts >= window_end {
            let closed = self.to_candle_event(true, seq, session_id);
            *self = CandleAccumulator::new(&self.symbol, self.interval_secs, ts, price, size);
            return Some(closed);
        }
        self.high = self.high.max(price);
        self.low = self.low.min(price);
        self.close = price;
        self.volume += size;
        self.vwap_numerator += price * size;
        self.tick_count += 1;
        None
    }

    pub fn to_candle_event(&self, is_final: bool, seq: u64, session_id: &str) -> CandleEvent {
        let interval = interval_label(self.interval_secs);
        CandleEvent {
            base: EventBase {
                seq,
                ts_exchange: self.window_start,
                ts_ingest: chrono::Utc::now().timestamp_micros(),
                ts_emit: chrono::Utc::now().timestamp_micros(),
                source: "gx-engine/candles".into(),
                symbol: self.symbol.clone(),
                session_id: session_id.to_string(),
            },
            kind: "candle".into(),
            interval,
            open: self.open,
            high: self.high,
            low: self.low,
            close: self.close,
            volume: self.volume,
            vwap: if self.volume > 0.0 {
                self.vwap_numerator / self.volume
            } else {
                self.close
            },
            tick_count: self.tick_count,
            is_final,
        }
    }
}

pub fn interval_label(secs: u32) -> String {
    match secs {
        1 => "1s".into(),
        5 => "5s".into(),
        15 => "15s".into(),
        60 => "1m".into(),
        300 => "5m".into(),
        900 => "15m".into(),
        3600 => "1h".into(),
        86400 => "1d".into(),
        n => format!("{n}s"),
    }
}

pub fn interval_secs(label: &str) -> u32 {
    match label {
        "1s" => 1,
        "5s" => 5,
        "15s" => 15,
        "1m" => 60,
        "5m" => 300,
        "15m" => 900,
        "1h" => 3600,
        "1d" => 86400,
        _ => 60,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn candle_accumulator_rolls_window() {
        let mut acc = CandleAccumulator::new("SPY", 1, 0, 100.0, 10.0);
        let closed = acc.update(101.0, 5.0, 2_000_000, 2, "sess");
        assert!(closed.is_some());
        assert_eq!(acc.open, 101.0);
    }
}
