//! Event log replay — validates sequence ordering and recomputes portfolio.

use gx_core::events::{FillEvent, MarketDataEvent};
use gx_core::portfolio::PortfolioState;
use serde::Serialize;
use std::fs::File;
use std::io::{BufRead, BufReader};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReplaySummary {
    pub event_count: u64,
    pub fill_count: u64,
    pub final_nav: f64,
    pub max_drawdown: f64,
    pub pnl_curve: Vec<f64>,
}

pub struct ReplayEngine {
    pub portfolio: PortfolioState,
    pub event_count: u64,
}

impl ReplayEngine {
    pub fn new(initial_cash: f64, session_id: &str) -> Self {
        Self {
            portfolio: PortfolioState::new(initial_cash, session_id),
            event_count: 0,
        }
    }

    pub fn replay_file(&mut self, path: &str) -> anyhow::Result<ReplaySummary> {
        let file = File::open(path)?;
        let reader = BufReader::new(file);

        let mut last_seq = 0u64;
        let mut fill_count = 0u64;
        let mut pnl_snapshots: Vec<f64> = Vec::new();

        for line in reader.lines() {
            let line = line?;
            if line.is_empty() {
                continue;
            }

            let value: serde_json::Value = serde_json::from_str(&line)?;
            let kind = value["kind"].as_str().unwrap_or("");

            match kind {
                "session_header" => {}
                "market_data" => {
                    let event: MarketDataEvent = serde_json::from_value(value)?;
                    assert!(
                        event.base.seq > last_seq,
                        "Sequence violation at seq {}",
                        event.base.seq
                    );
                    last_seq = event.base.seq;
                    self.portfolio.apply_market_data(&event);
                    self.event_count += 1;
                }
                "fill" => {
                    let event: FillEvent = serde_json::from_value(value)?;
                    let market_price = self
                        .portfolio
                        .positions
                        .get(&event.base.symbol)
                        .map(|p| {
                            if p.qty.abs() > f64::EPSILON {
                                p.market_value / p.qty
                            } else {
                                event.fill_price
                            }
                        })
                        .unwrap_or(event.fill_price);
                    self.portfolio
                        .apply_fill(&event, market_price, event.base.seq);
                    fill_count += 1;
                    pnl_snapshots.push(self.portfolio.nav);
                    self.event_count += 1;
                }
                _ => {
                    self.event_count += 1;
                }
            }
        }

        Ok(ReplaySummary {
            event_count: self.event_count,
            fill_count,
            final_nav: self.portfolio.nav,
            max_drawdown: self.portfolio.drawdown,
            pnl_curve: pnl_snapshots,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_log_replays() {
        let dir = std::env::temp_dir().join("gx-replay-test");
        let _ = std::fs::create_dir_all(&dir);
        let path = dir.join("empty.ndjson");
        std::fs::write(&path, "").unwrap();
        let mut engine = ReplayEngine::new(100_000.0, "test");
        let summary = engine.replay_file(path.to_str().unwrap()).unwrap();
        assert_eq!(summary.event_count, 0);
        assert_eq!(summary.final_nav, 100_000.0);
    }
}
