//! Per-symbol candle aggregation from market data broadcast.

use gx_core::events::{interval_secs, CandleAccumulator, CandleEvent, MarketDataEvent};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::broadcast;
use tracing::info;

use crate::ingest::next_seq;

const INTERVALS: &[&str] = &["1s", "5s", "15s", "1m", "5m", "15m", "1h", "1d"];

pub async fn run_candle_aggregator(
    mut md_rx: broadcast::Receiver<MarketDataEvent>,
    candle_tx: broadcast::Sender<CandleEvent>,
    session_id: Arc<String>,
) {
    let mut by_symbol: HashMap<String, HashMap<u32, CandleAccumulator>> = HashMap::new();
    info!("candle aggregator started");

    loop {
        match md_rx.recv().await {
            Ok(md) => {
                let sym = md.base.symbol.clone();
                let ts = md.base.ts_exchange;
                let price = md.price;
                let size = if md.last_sz > 0.0 { md.last_sz } else { 1.0 };

                let symbol_map = by_symbol.entry(sym).or_default();
                for label in INTERVALS {
                    let secs = interval_secs(label);
                    use std::collections::hash_map::Entry;
                    match symbol_map.entry(secs) {
                        Entry::Vacant(e) => {
                            e.insert(CandleAccumulator::new(
                                &md.base.symbol,
                                secs,
                                ts,
                                price,
                                size,
                            ));
                        }
                        Entry::Occupied(mut e) => {
                            if let Some(closed) =
                                e.get_mut().update(price, size, ts, next_seq(), &session_id)
                            {
                                let _ = candle_tx.send(closed);
                            }
                        }
                    }
                }
            }
            Err(broadcast::error::RecvError::Lagged(n)) => {
                tracing::warn!("candle aggregator lagged {n} events");
            }
            Err(broadcast::error::RecvError::Closed) => break,
        }
    }
}
