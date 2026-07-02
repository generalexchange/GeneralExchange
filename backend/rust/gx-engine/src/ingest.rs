//! ZMQ ingest relay — assigns authoritative seq, writes log, fans out.

use gx_core::events::MarketDataEvent;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use tokio::sync::broadcast;
use tracing::{error, info};

use crate::log::EventLog;

static GLOBAL_SEQ: AtomicU64 = AtomicU64::new(1);

pub fn next_seq() -> u64 {
    GLOBAL_SEQ.fetch_add(1, Ordering::SeqCst)
}

pub fn run_ingest_relay(
    zmq_pull_addr: &str,
    event_tx: broadcast::Sender<MarketDataEvent>,
    log: Arc<EventLog>,
) {
    let ctx = zmq::Context::new();
    let sock = ctx.socket(zmq::PULL).expect("zmq PULL");
    sock.bind(zmq_pull_addr).unwrap_or_else(|e| {
        panic!("ingest: bind {zmq_pull_addr}: {e}");
    });
    info!("ingest relay listening on {zmq_pull_addr}");

    loop {
        match sock.recv_bytes(0) {
            Ok(bytes) => {
                let mut event: MarketDataEvent = match rmp_serde::from_slice(&bytes) {
                    Ok(e) => e,
                    Err(e) => {
                        error!("ingest: deser error: {e}");
                        continue;
                    }
                };

                let seq = next_seq();
                event.base.seq = seq;
                event.base.ts_ingest = chrono::Utc::now().timestamp_micros();
                event.base.ts_emit = event.base.ts_ingest;

                if let Err(e) = log.append_market(&event) {
                    error!("ingest: log write: {e}");
                }
                let _ = event_tx.send(event);
            }
            Err(e) => {
                error!("ingest: recv error: {e}");
                std::thread::sleep(std::time::Duration::from_millis(1));
            }
        }
    }
}
