//! Simulated fill engine — spread, slippage, latency (Whitepaper §4.2 simplified).

use gx_core::events::{EventBase, FillEvent, MarketDataEvent};
use rand::rngs::SmallRng;
use rand::{Rng, SeedableRng};
use rand_distr::{Distribution, LogNormal};
use std::time::Duration;
use tokio::sync::mpsc;
use tracing::debug;

#[derive(Debug, Clone)]
pub struct SimOrder {
    pub symbol: String,
    pub side: String,
    pub qty: f64,
    pub order_id: String,
    pub signal_seq: u64,
}

pub struct FillEngineConfig {
    pub base_slippage_bps: f64,
    pub avg_trade_size: f64,
    pub latency_mean_ms: f64,
    pub latency_sigma_ms: f64,
}

impl Default for FillEngineConfig {
    fn default() -> Self {
        Self {
            base_slippage_bps: 2.0,
            avg_trade_size: 100.0,
            latency_mean_ms: 50.0,
            latency_sigma_ms: 20.0,
        }
    }
}

pub fn fill_price(md: &MarketDataEvent, side: &str, slippage_bps: f64) -> f64 {
    let mid = md.price;
    let spread_half = if md.bid > 0.0 && md.ask > 0.0 {
        (md.ask - md.bid) / 2.0
    } else {
        mid * 0.0001
    };
    let slip = mid * slippage_bps / 10_000.0;
    match side {
        "buy" => md.ask.max(mid) + slip + spread_half,
        _ => md.bid.min(mid) - slip - spread_half,
    }
}

pub async fn run_fill_engine(
    mut order_rx: mpsc::Receiver<(SimOrder, MarketDataEvent)>,
    fill_tx: mpsc::Sender<FillEvent>,
    cfg: FillEngineConfig,
) {
    let latency = LogNormal::new(
        (cfg.latency_mean_ms / 1000.0_f64).ln(),
        (cfg.latency_sigma_ms / 1000.0_f64).max(0.01),
    )
    .unwrap();

    while let Some((order, md)) = order_rx.recv().await {
        let mut rng = SmallRng::from_entropy();
        let size_ratio = (order.qty / cfg.avg_trade_size).max(0.01);
        let slippage_bps = cfg.base_slippage_bps * size_ratio.sqrt();
        let price = fill_price(&md, &order.side, slippage_bps);
        let delay: f64 = latency.sample(&mut rng);
        tokio::time::sleep(Duration::from_secs_f64(delay.max(0.001))).await;

        let fill = FillEvent {
            base: EventBase {
                seq: md.base.seq,
                ts_exchange: md.base.ts_exchange,
                ts_ingest: chrono::Utc::now().timestamp_micros(),
                ts_emit: chrono::Utc::now().timestamp_micros(),
                source: "gx-engine/fill".into(),
                symbol: order.symbol.clone(),
                session_id: md.base.session_id.clone(),
            },
            kind: "fill".into(),
            order_id: order.order_id.clone(),
            fill_id: format!("sim-{}", order.order_id),
            side: order.side.clone(),
            fill_qty: order.qty,
            fill_price: price,
            commission: 0.65,
            liquidity: "taker".into(),
            is_simulated: true,
            slippage_bps,
            exec_algo: "sim_v1".into(),
        };
        debug!("fill {} {} @ {}", order.symbol, order.qty, price);
        let _ = fill_tx.send(fill).await;
    }
}
