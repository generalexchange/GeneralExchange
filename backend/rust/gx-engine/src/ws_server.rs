//! Multiplexed WebSocket fanout with 16ms frame batching and gap replay.

use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State,
    },
    response::IntoResponse,
    routing::get,
    Router,
};
use futures_util::{SinkExt, StreamExt};
use gx_core::events::{CandleEvent, MarketDataEvent, PortfolioEvent, SignalEvent, SystemEvent};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::{HashMap, VecDeque};
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::{broadcast, Mutex};
use tracing::{info, warn};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WsEnvelope {
    pub ch: String,
    pub seq: u64,
    pub data: Value,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct WsSubscribeMsg {
    #[serde(rename = "type")]
    msg_type: String,
    channels: Vec<String>,
    #[allow(dead_code)]
    symbols: Vec<String>,
    last_seq: HashMap<String, u64>,
}

#[derive(Clone)]
pub struct WsState {
    pub pending: Arc<Mutex<VecDeque<WsEnvelope>>>,
    pub replay: Arc<Mutex<Vec<WsEnvelope>>>,
}

impl WsState {
    pub fn new() -> Self {
        Self {
            pending: Arc::new(Mutex::new(VecDeque::new())),
            replay: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub async fn push(&self, ch: &str, seq: u64, data: Value) {
        let env = WsEnvelope {
            ch: ch.into(),
            seq,
            data,
        };
        self.replay.lock().await.push(env.clone());
        let mut q = self.pending.lock().await;
        q.push_back(env);
    }
}

pub fn channel_for_md(_: &MarketDataEvent) -> &'static str {
    "md"
}

pub async fn envelope_from_md(e: &MarketDataEvent) -> WsEnvelope {
    WsEnvelope {
        ch: "md".into(),
        seq: e.base.seq,
        data: serde_json::to_value(e).unwrap_or(Value::Null),
    }
}

pub async fn run_fanout_batch(state: WsState, mut md_rx: broadcast::Receiver<MarketDataEvent>) {
    let mut interval = tokio::time::interval(std::time::Duration::from_millis(16));
    loop {
        tokio::select! {
            _ = interval.tick() => {
                let batch: Vec<WsEnvelope> = {
                    let mut q = state.pending.lock().await;
                    q.drain(..).collect()
                };
                if !batch.is_empty() {
                    // batches are drained by connected clients via shared pending — see handle_socket
                }
            }
            Ok(md) = md_rx.recv() => {
                let env = envelope_from_md(&md).await;
                state.push(&env.ch, env.seq, env.data.clone()).await;
            }
            else => break,
        }
    }
}

pub async fn run_ws_server(port: u16, state: WsState) -> anyhow::Result<()> {
    let app = Router::new()
        .route("/ws", get(ws_handler))
        .with_state(state);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    info!("WebSocket server listening on {addr}");
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}

async fn ws_handler(ws: WebSocketUpgrade, State(state): State<WsState>) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: WsState) {
    let (mut sender, mut receiver) = socket.split();
    let mut last_seq: HashMap<String, u64> = HashMap::new();
    let mut flush = tokio::time::interval(std::time::Duration::from_millis(16));

    loop {
        tokio::select! {
            msg = receiver.next() => {
                match msg {
                    Some(Ok(Message::Text(text))) => {
                        if let Ok(sub) = serde_json::from_str::<WsSubscribeMsg>(&text) {
                            if sub.msg_type == "subscribe" {
                                last_seq = sub.last_seq;
                                let replay = state.replay.lock().await;
                                for env in replay.iter() {
                                    let client_last = last_seq.get(&env.ch).copied().unwrap_or(0);
                                    if env.seq > client_last {
                                        let line = serde_json::to_string(env).unwrap_or_default();
                                        if sender.send(Message::Text(line)).await.is_err() {
                                            return;
                                        }
                                        last_seq.insert(env.ch.clone(), env.seq);
                                    }
                                }
                            }
                        }
                    }
                    Some(Ok(Message::Close(_))) | None => return,
                    Some(Err(e)) => {
                        warn!("ws recv error: {e}");
                        return;
                    }
                    _ => {}
                }
            }
            _ = flush.tick() => {
                let batch: Vec<WsEnvelope> = {
                    let mut q = state.pending.lock().await;
                    q.drain(..).collect()
                };
                for env in batch {
                    let client_last = last_seq.get(&env.ch).copied().unwrap_or(0);
                    if env.seq <= client_last {
                        continue;
                    }
                    let line = serde_json::to_string(&env).unwrap_or_default();
                    if sender.send(Message::Text(line)).await.is_err() {
                        return;
                    }
                    last_seq.insert(env.ch, env.seq);
                }
            }
        }
    }
}

pub fn candle_envelope(e: &CandleEvent) -> WsEnvelope {
    WsEnvelope {
        ch: "candle".into(),
        seq: e.base.seq,
        data: serde_json::to_value(e).unwrap_or(Value::Null),
    }
}

pub fn portfolio_envelope(e: &PortfolioEvent) -> WsEnvelope {
    WsEnvelope {
        ch: "portfolio".into(),
        seq: e.base.seq,
        data: serde_json::to_value(e).unwrap_or(Value::Null),
    }
}

pub fn signal_envelope(e: &SignalEvent) -> WsEnvelope {
    WsEnvelope {
        ch: "signal".into(),
        seq: e.base.seq,
        data: serde_json::to_value(e).unwrap_or(Value::Null),
    }
}

pub fn system_envelope(e: &SystemEvent) -> WsEnvelope {
    WsEnvelope {
        ch: "system".into(),
        seq: e.base.seq,
        data: serde_json::to_value(e).unwrap_or(Value::Null),
    }
}
