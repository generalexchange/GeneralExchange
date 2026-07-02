//! gx-engine — unified event-driven trade engine (Whitepaper v1.0).

mod candles;
mod fill_engine;
mod ingest;
mod log;
mod monte_carlo;
mod replay;
mod ws_server;

use anyhow::Result;
use gx_core::events::{CandleEvent, FillEvent, MarketDataEvent};
use gx_core::portfolio::PortfolioState;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{broadcast, mpsc};
use tracing::{info, Level};
use tracing_subscriber::EnvFilter;
use uuid::Uuid;

use crate::fill_engine::{run_fill_engine, FillEngineConfig};
use crate::log::EventLog;
use crate::replay::ReplayEngine;
use crate::ws_server::{WsState, candle_envelope, portfolio_envelope};

struct EngineConfig {
    ipc_path: Option<String>,
    ws_port: u16,
    zmq_pull: String,
    zmq_pub: String,
    log_dir: String,
    thread_count: usize,
    initial_cash: f64,
}

fn parse_args() -> Result<EngineConfig> {
    let args: Vec<String> = std::env::args().collect();
    let mut cfg = EngineConfig {
        ipc_path: None,
        ws_port: 8765,
        zmq_pull: "tcp://127.0.0.1:5557".into(),
        zmq_pub: "tcp://127.0.0.1:5558".into(),
        log_dir: "./data/event-logs".into(),
        thread_count: 4,
        initial_cash: 100_000.0,
    };

    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "--ipc-path" => {
                i += 1;
                cfg.ipc_path = args.get(i).cloned();
            }
            "--ws-port" => {
                i += 1;
                cfg.ws_port = args.get(i).and_then(|s| s.parse().ok()).unwrap_or(8765);
            }
            "--zmq-pull" => {
                i += 1;
                if let Some(v) = args.get(i) {
                    cfg.zmq_pull = v.clone();
                }
            }
            "--zmq-pub" => {
                i += 1;
                if let Some(v) = args.get(i) {
                    cfg.zmq_pub = v.clone();
                }
            }
            "--log-dir" => {
                i += 1;
                if let Some(v) = args.get(i) {
                    cfg.log_dir = v.clone();
                }
            }
            "--thread-count" => {
                i += 1;
                cfg.thread_count = args.get(i).and_then(|s| s.parse().ok()).unwrap_or(4);
            }
            "--replay" => {
                i += 1;
                let path = args.get(i).ok_or_else(|| anyhow::anyhow!("--replay requires path"))?;
                let mut engine = ReplayEngine::new(100_000.0, "replay");
                let summary = engine.replay_file(path)?;
                println!("{}", serde_json::to_string_pretty(&summary)?);
                std::process::exit(0);
            }
            "--help" | "-h" => {
                println!(
                    "gx-engine [--ws-port PORT] [--zmq-pull ADDR] [--zmq-pub ADDR] \
                     [--log-dir DIR] [--thread-count N] [--ipc-path PATH] [--replay FILE]"
                );
                std::process::exit(0);
            }
            _ => {}
        }
        i += 1;
    }
    Ok(cfg)
}

async fn async_main(cfg: EngineConfig) -> Result<()> {
    let session_id = Arc::new(Uuid::new_v4().to_string());
    let log = Arc::new(EventLog::open(&cfg.log_dir, &session_id)?);
    info!(session = %session_id, log = ?log.path(), "event log opened");

    let header = serde_json::json!({
        "kind": "session_header",
        "sessionId": *session_id,
        "startTs": chrono::Utc::now().timestamp_micros(),
        "engineVersion": "1.0.0",
        "symbols": [],
        "initialCash": cfg.initial_cash,
    });
    log.append_raw(&header)?;

    let (md_tx, _) = broadcast::channel::<MarketDataEvent>(8192);
    let (candle_tx, mut candle_rx) = broadcast::channel::<CandleEvent>(2048);
    let (fill_tx, mut fill_rx) = mpsc::channel::<FillEvent>(256);
    let (_order_tx, order_rx) = mpsc::channel::<(fill_engine::SimOrder, MarketDataEvent)>(256);

    let md_tx_ingest = md_tx.clone();
    let log_ingest = log.clone();
    let zmq_pull = cfg.zmq_pull.clone();
    std::thread::spawn(move || ingest::run_ingest_relay(&zmq_pull, md_tx_ingest, log_ingest));

    let md_rx_candles = md_tx.subscribe();
    let session_candles = session_id.clone();
    tokio::spawn(candles::run_candle_aggregator(
        md_rx_candles,
        candle_tx,
        session_candles,
    ));

    tokio::spawn(run_fill_engine(
        order_rx,
        fill_tx,
        FillEngineConfig::default(),
    ));

    let ws_state = WsState::new();
    let ws_state_md = ws_state.clone();
    let mut md_rx_ws = md_tx.subscribe();
    tokio::spawn(async move {
        loop {
            match md_rx_ws.recv().await {
                Ok(md) => {
                    let env = ws_server::envelope_from_md(&md).await;
                    ws_state_md
                        .push(&env.ch, env.seq, env.data)
                        .await;
                }
                Err(broadcast::error::RecvError::Lagged(n)) => {
                    tracing::warn!("ws md fanout lagged {n}");
                }
                Err(broadcast::error::RecvError::Closed) => break,
            }
        }
    });

    let ws_state_candle = ws_state.clone();
    tokio::spawn(async move {
        while let Ok(c) = candle_rx.recv().await {
            let env = candle_envelope(&c);
            ws_state_candle.push(&env.ch, env.seq, env.data).await;
        }
    });

    let ws_state_pf = ws_state.clone();
    let session_pf = session_id.clone();
    tokio::spawn(async move {
        let mut portfolio = PortfolioState::new(cfg.initial_cash, session_pf.as_str());
        let mut last_md: HashMap<String, MarketDataEvent> = HashMap::new();

        let mut md_rx_pf = md_tx.subscribe();
        loop {
            tokio::select! {
                Ok(md) = md_rx_pf.recv() => {
                    last_md.insert(md.base.symbol.clone(), md.clone());
                    if let Some(pe) = portfolio.apply_market_data(&md) {
                        let env = portfolio_envelope(&pe);
                        ws_state_pf.push(&env.ch, env.seq, env.data).await;
                    }
                }
                Some(fill) = fill_rx.recv() => {
                    let mp = last_md
                        .get(&fill.base.symbol)
                        .map(|m| m.price)
                        .unwrap_or(fill.fill_price);
                    let pe = portfolio.apply_fill(&fill, mp, fill.base.seq);
                    let env = portfolio_envelope(&pe);
                    ws_state_pf.push(&env.ch, env.seq, env.data).await;
                }
                else => break,
            }
        }
    });

    let _order_tx = _order_tx;

    let port = cfg.ws_port;
    if let Some(ipc) = &cfg.ipc_path {
        info!("IPC path configured (stub): {ipc}");
    }
    info!(port, zmq_pub = %cfg.zmq_pub, threads = cfg.thread_count, "gx-engine running");
    ws_server::run_ws_server(port, ws_state).await?;
    Ok(())
}

fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env().add_directive(Level::INFO.into()))
        .init();

    let cfg = parse_args()?;
    let rt = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(cfg.thread_count)
        .enable_all()
        .build()?;
    rt.block_on(async_main(cfg))
}
