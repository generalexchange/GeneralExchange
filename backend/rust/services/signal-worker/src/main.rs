//! Port of `backend/python/services/signal_worker/main.py`.

use anyhow::Result;
use clickhouse::Row;
use gx_core::{
    config::Config,
    topics::{self, candles_topic},
};
use gx_infra::{clickhouse_client, kafka_client};
use rdkafka::consumer::Consumer;
use rdkafka::Message;
use serde::Deserialize;
use std::collections::{HashMap, VecDeque};
use std::time::{Duration, Instant};
use time::OffsetDateTime;
use tracing::{error, info, warn};
use uuid::{uuid, Uuid};

const CANDLE_WINDOW: usize = 60;
const NEWS_HALF_LIFE_S: f64 = 1800.0;
const FLUSH_SECS: f64 = 5.0;
const STRATEGY_NS: Uuid = uuid!("0a51e000-0000-4000-8000-0000000000aa");

#[derive(Debug, Deserialize)]
struct CandleEvent {
    symbol: String,
    close: Option<f64>,
    volume: Option<u64>,
}

#[derive(Debug, Deserialize)]
struct RegimeEvent {
    symbol: String,
    regime_type: Option<String>,
    vol_regime: Option<String>,
}

#[derive(Debug, Deserialize)]
struct NewsEvent {
    symbol: String,
    sentiment_score: Option<f64>,
    impact_score: Option<f64>,
}

#[derive(Debug, Deserialize)]
struct OptionsSnapshot {
    symbol: String,
    contracts: Vec<ChainContract>,
}

#[derive(Debug, Deserialize)]
struct ChainContract {
    strike: Option<f64>,
    option_type: Option<String>,
    open_interest: Option<u32>,
    volume: Option<u32>,
    gamma: Option<f64>,
    delta: Option<f64>,
    underlying_price: Option<f64>,
    iv_rank: Option<f64>,
}

struct SymbolState {
    closes: VecDeque<f64>,
    vols: VecDeque<f64>,
    regime: String,
    vol_regime: String,
    news_score: f64,
    news_impact: f64,
    news_ts: f64,
}

impl SymbolState {
    fn new() -> Self {
        Self {
            closes: VecDeque::with_capacity(CANDLE_WINDOW),
            vols: VecDeque::with_capacity(CANDLE_WINDOW),
            regime: "RANDOM_WALK".into(),
            vol_regime: "NORMAL".into(),
            news_score: 0.0,
            news_impact: 0.0,
            news_ts: 0.0,
        }
    }

    fn momentum(&self) -> f64 {
        if self.closes.len() < 10 {
            return 0.0;
        }
        let p0 = self.closes[self.closes.len() - 10];
        let p1 = self.closes[self.closes.len() - 1];
        let roc = if p0.abs() > 1e-12 { (p1 - p0) / p0 } else { 0.0 };
        (roc * 12.0).tanh()
    }

    fn liquidity(&self) -> f64 {
        if self.vols.len() < 10 {
            return 0.0;
        }
        let vals: Vec<f64> = self.vols.iter().copied().collect();
        let mean = vals.iter().sum::<f64>() / vals.len() as f64;
        let var = vals.iter().map(|x| (x - mean).powi(2)).sum::<f64>() / (vals.len() - 1) as f64;
        let sd = var.sqrt();
        if sd < 1e-9 {
            return 0.0;
        }
        ((vals[vals.len() - 1] - mean) / sd).clamp(-3.0, 3.0) / 3.0
    }

    fn decayed_sentiment(&self, now: f64) -> (f64, f64) {
        if self.news_ts == 0.0 {
            return (0.0, 0.0);
        }
        let decay = 0.5_f64.powf((now - self.news_ts) / NEWS_HALF_LIFE_S);
        (self.news_score * decay, self.news_impact * decay)
    }
}

struct OptionsMetrics {
    spot: f64,
    net_gamma_exposure: f64,
    dealer_gamma_position: f64,
    estimated_delta_pressure: f64,
    put_call_ratio: f64,
    delta_tilt: f64,
    flow_score: f64,
    unusual_activity: f64,
    gamma_regime: String,
    sweep_calls: u32,
    sweep_puts: u32,
    iv_rank: f64,
}

fn oi_proxy(contract: &ChainContract, spot: f64) -> f64 {
    let oi = contract.open_interest.unwrap_or(0) as f64;
    if oi > 0.0 {
        return oi;
    }
    let strike = contract.strike.unwrap_or(spot);
    let m = if spot.abs() > 1e-12 {
        strike / spot - 1.0
    } else {
        0.0
    };
    let is_put = contract.option_type.as_deref() == Some("PUT");
    let center = if is_put { -0.012 } else { 0.012 };
    let weight = if is_put { 1.35 } else { 1.0 };
    1000.0 * weight * (-(((m - center) * 8.0).powi(2))).exp()
}

fn options_metrics(contracts: &[ChainContract]) -> Option<OptionsMetrics> {
    if contracts.is_empty() {
        return None;
    }
    let spot = contracts[0].underlying_price.unwrap_or(0.0).max(1.0);
    let mut call_oi = 0.0;
    let mut put_oi = 0.0;
    let mut call_vol = 0.0;
    let mut put_vol = 0.0;
    let mut net_gex = 0.0;
    let mut net_delta = 0.0;
    let mut sweep_calls = 0u32;
    let mut sweep_puts = 0u32;

    for c in contracts {
        let is_call = c.option_type.as_deref() == Some("CALL");
        let oi = oi_proxy(c, spot);
        let vol = c.volume.unwrap_or(0) as f64;
        let gamma = c.gamma.unwrap_or(0.0);
        let delta = c.delta.unwrap_or(0.0);
        let sign = if is_call { 1.0 } else { -1.0 };
        net_gex += gamma * oi * 100.0 * spot * spot * 0.01 * sign;
        net_delta += delta * oi * 100.0;
        if is_call {
            call_oi += oi;
            call_vol += vol;
            if vol > 0.0 && vol > oi {
                sweep_calls += 1;
            }
        } else {
            put_oi += oi;
            put_vol += vol;
            if vol > 0.0 && vol > oi {
                sweep_puts += 1;
            }
        }
    }

    let total_oi = call_oi + put_oi;
    let total_vol = call_vol + put_vol;
    let put_call = if call_oi > 0.0 { put_oi / call_oi } else { 1.0 };
    let delta_tilt = if total_oi > 0.0 {
        net_delta / (total_oi * 100.0)
    } else {
        0.0
    };
    let flow_score = if total_vol > 0.0 {
        (call_vol - put_vol) / total_vol
    } else {
        delta_tilt.tanh()
    };
    let unusual = if total_oi > 0.0 {
        (total_vol / total_oi).clamp(0.0, 1.0)
    } else {
        0.0
    };
    let gamma_regime = if net_gex >= 0.0 {
        "POSITIVE"
    } else {
        "NEGATIVE"
    };

    Some(OptionsMetrics {
        spot,
        net_gamma_exposure: net_gex,
        dealer_gamma_position: net_gex / 1e6,
        estimated_delta_pressure: -net_gex * 0.01,
        put_call_ratio: put_call,
        delta_tilt,
        flow_score,
        unusual_activity: unusual,
        gamma_regime: gamma_regime.to_string(),
        sweep_calls,
        sweep_puts,
        iv_rank: contracts[0].iv_rank.unwrap_or(0.0),
    })
}

struct ComposedSignal {
    signal_type: String,
    direction: String,
    confidence: f64,
    raw_score: f64,
    momentum_score: f64,
    liquidity_score: f64,
    sentiment_score: f64,
    news_impact_score: f64,
    options_flow_score: f64,
    dark_pool_score: f64,
    delta_tilt: f64,
    gamma_regime: String,
}

fn compose_signal(st: &SymbolState, om: &OptionsMetrics, now: f64) -> ComposedSignal {
    let momentum = st.momentum();
    let liquidity = st.liquidity();
    let (sentiment, news_impact) = st.decayed_sentiment(now);
    let flow = om.flow_score;
    let delta_tilt = om.delta_tilt;

    let regime_bias = match st.regime.as_str() {
        "TRENDING_UP" => 0.4,
        "TRENDING_DOWN" => -0.4,
        _ => 0.0,
    };
    let gamma_amp = if om.gamma_regime == "NEGATIVE" {
        1.25
    } else {
        0.85
    };

    let mut raw = (0.35 * momentum + 0.2 * flow + 0.15 * delta_tilt + 0.15 * sentiment + 0.15 * regime_bias)
        * gamma_amp;
    raw = raw.clamp(-1.0, 1.0);

    let direction = if raw > 0.15 {
        "LONG"
    } else if raw < -0.15 {
        "SHORT"
    } else {
        "NEUTRAL"
    };

    let conf_scale = 0.6 + 0.4 * (st.closes.len() as f64 / CANDLE_WINDOW as f64).min(1.0);
    let confidence = (raw.abs() * conf_scale).clamp(0.0, 1.0);

    let signal_type = if direction != "NEUTRAL"
        && om.gamma_regime == "NEGATIVE"
        && delta_tilt.abs() > 0.2
    {
        "DELTA_SQUEEZE"
    } else if st.regime == "TRENDING_UP" || st.regime == "TRENDING_DOWN" {
        "MOMENTUM"
    } else if st.regime == "MEAN_REVERTING" {
        "MEAN_REVERSION"
    } else {
        "FLOW"
    };

    ComposedSignal {
        signal_type: signal_type.to_string(),
        direction: direction.to_string(),
        confidence: (confidence * 1000.0).round() / 1000.0,
        raw_score: (raw * 10000.0).round() / 10000.0,
        momentum_score: (momentum * 10000.0).round() / 10000.0,
        liquidity_score: (liquidity * 10000.0).round() / 10000.0,
        sentiment_score: (sentiment * 10000.0).round() / 10000.0,
        news_impact_score: (news_impact * 10000.0).round() / 10000.0,
        options_flow_score: (flow * 10000.0).round() / 10000.0,
        dark_pool_score: (om.unusual_activity * 10000.0).round() / 10000.0,
        delta_tilt: (delta_tilt * 10000.0).round() / 10000.0,
        gamma_regime: om.gamma_regime.clone(),
    }
}

#[derive(Row, serde::Serialize, Clone)]
struct SignalRow {
    signal_id: Uuid,
    strategy_id: Uuid,
    symbol: String,
    #[serde(with = "clickhouse::serde::time::datetime64::millis")]
    generated_at: OffsetDateTime,
    signal_type: String,
    direction: String,
    confidence: f64,
    raw_score: f64,
    regime: String,
    iv_regime: String,
    gamma_regime: String,
    delta_tilt: f64,
    momentum_score: f64,
    liquidity_score: f64,
    sentiment_score: f64,
    news_impact_score: f64,
    options_flow_score: f64,
    dark_pool_score: f64,
    #[serde(with = "clickhouse::serde::time::datetime64::millis")]
    expires_at: OffsetDateTime,
}

#[derive(Row, serde::Serialize, Clone)]
struct FlowRow {
    symbol: String,
    #[serde(with = "clickhouse::serde::time::datetime64::millis")]
    timestamp: OffsetDateTime,
    dark_pool_prints: u32,
    dark_pool_volume: u64,
    options_sweep_calls: u32,
    options_sweep_puts: u32,
    block_trades: u32,
    unusual_activity_score: f64,
    net_gamma_exposure: f64,
    dealer_gamma_position: f64,
    estimated_delta_pressure: f64,
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    let cfg = Config::load();
    let topics_list = [
        candles_topic("1m"),
        topics::OPTIONS_CHAIN_SNAPSHOTS,
        topics::REGIME_EVENTS,
        topics::NEWS_PROCESSED,
    ];
    let topic_refs: Vec<&str> = topics_list.iter().map(|s| s.as_str()).collect();
    let consumer = kafka_client::make_consumer(&cfg, "signal-worker-rs", &topic_refs)?;
    let producer = kafka_client::make_producer(&cfg)?;
    let ch = clickhouse_client::make_client(&cfg);

    let mut state: HashMap<String, SymbolState> = HashMap::new();
    let mut pending_signals: Vec<SignalRow> = Vec::new();
    let mut pending_flow: Vec<FlowRow> = Vec::new();
    let mut last_flush = Instant::now();

    info!("signal-worker started");

    let started = Instant::now();

    loop {
        let poll = tokio::time::timeout(Duration::from_millis(500), consumer.recv()).await;

        match poll {
            Ok(Ok(msg)) => {
                let topic = msg.topic().to_string();
                let now = started.elapsed().as_secs_f64();

                if topic == candles_topic("1m") {
                    let ev: CandleEvent = match kafka_client::decode_json(&msg) {
                        Ok(v) => v,
                        Err(e) => {
                            warn!("decode candle: {e}");
                            continue;
                        }
                    };
                    let st = state.entry(ev.symbol).or_insert_with(SymbolState::new);
                    st.closes.push_back(ev.close.unwrap_or(0.0));
                    while st.closes.len() > CANDLE_WINDOW {
                        st.closes.pop_front();
                    }
                    st.vols.push_back(ev.volume.unwrap_or(0) as f64);
                    while st.vols.len() > CANDLE_WINDOW {
                        st.vols.pop_front();
                    }
                } else if topic == topics::REGIME_EVENTS {
                    let ev: RegimeEvent = match kafka_client::decode_json(&msg) {
                        Ok(v) => v,
                        Err(e) => {
                            warn!("decode regime: {e}");
                            continue;
                        }
                    };
                    let st = state.entry(ev.symbol).or_insert_with(SymbolState::new);
                    if let Some(r) = ev.regime_type {
                        st.regime = r;
                    }
                    if let Some(v) = ev.vol_regime {
                        st.vol_regime = v;
                    }
                } else if topic == topics::NEWS_PROCESSED {
                    let ev: NewsEvent = match kafka_client::decode_json(&msg) {
                        Ok(v) => v,
                        Err(e) => {
                            warn!("decode news: {e}");
                            continue;
                        }
                    };
                    let st = state.entry(ev.symbol).or_insert_with(SymbolState::new);
                    st.news_score = ev.sentiment_score.unwrap_or(0.0);
                    st.news_impact = ev.impact_score.unwrap_or(0.0);
                    st.news_ts = now;
                } else if topic == topics::OPTIONS_CHAIN_SNAPSHOTS {
                    let ev: OptionsSnapshot = match kafka_client::decode_json(&msg) {
                        Ok(v) => v,
                        Err(e) => {
                            warn!("decode options: {e}");
                            continue;
                        }
                    };
                    let Some(om) = options_metrics(&ev.contracts) else {
                        continue;
                    };
                    let st = state.entry(ev.symbol.clone()).or_insert_with(SymbolState::new);
                    let generated_at = OffsetDateTime::now_utc();
                    let expires_at = generated_at + time::Duration::hours(1);

                    pending_flow.push(FlowRow {
                        symbol: ev.symbol.clone(),
                        timestamp: generated_at,
                        dark_pool_prints: 0,
                        dark_pool_volume: 0,
                        options_sweep_calls: om.sweep_calls,
                        options_sweep_puts: om.sweep_puts,
                        block_trades: 0,
                        unusual_activity_score: (om.unusual_activity * 10000.0).round() / 10000.0,
                        net_gamma_exposure: (om.net_gamma_exposure * 100.0).round() / 100.0,
                        dealer_gamma_position: (om.dealer_gamma_position * 10000.0).round() / 10000.0,
                        estimated_delta_pressure: (om.estimated_delta_pressure * 100.0).round() / 100.0,
                    });

                    let sig = compose_signal(st, &om, now);
                    let iv_regime = if om.iv_rank > 66.0 {
                        "HIGH"
                    } else if om.iv_rank < 33.0 {
                        "LOW"
                    } else {
                        "MID"
                    };

                    let signal_id = Uuid::new_v4();
                    let strategy_id = Uuid::new_v5(&STRATEGY_NS, sig.signal_type.as_bytes());

                    let row = SignalRow {
                        signal_id,
                        strategy_id,
                        symbol: ev.symbol.clone(),
                        generated_at,
                        signal_type: sig.signal_type.clone(),
                        direction: sig.direction.clone(),
                        confidence: sig.confidence,
                        raw_score: sig.raw_score,
                        regime: st.regime.clone(),
                        iv_regime: iv_regime.to_string(),
                        gamma_regime: sig.gamma_regime.clone(),
                        delta_tilt: sig.delta_tilt,
                        momentum_score: sig.momentum_score,
                        liquidity_score: sig.liquidity_score,
                        sentiment_score: sig.sentiment_score,
                        news_impact_score: sig.news_impact_score,
                        options_flow_score: sig.options_flow_score,
                        dark_pool_score: sig.dark_pool_score,
                        expires_at,
                    };

                    pending_signals.push(row.clone());

                    let kafka_row = serde_json::json!({
                        "signal_id": row.signal_id.to_string(),
                        "strategy_id": row.strategy_id.to_string(),
                        "symbol": row.symbol,
                        "generated_at": generated_at.format(&time::format_description::well_known::Rfc3339).unwrap_or_default(),
                        "signal_type": row.signal_type,
                        "direction": row.direction,
                        "confidence": row.confidence,
                        "raw_score": row.raw_score,
                        "regime": row.regime,
                        "iv_regime": row.iv_regime,
                        "gamma_regime": row.gamma_regime,
                        "delta_tilt": row.delta_tilt,
                        "momentum_score": row.momentum_score,
                        "liquidity_score": row.liquidity_score,
                        "sentiment_score": row.sentiment_score,
                        "news_impact_score": row.news_impact_score,
                        "options_flow_score": row.options_flow_score,
                        "dark_pool_score": row.dark_pool_score,
                        "expires_at": expires_at.format(&time::format_description::well_known::Rfc3339).unwrap_or_default(),
                    });
                    let _ = kafka_client::produce_json(&producer, topics::SIGNALS, &ev.symbol, &kafka_row).await;
                }

                if last_flush.elapsed().as_secs_f64() >= FLUSH_SECS {
                    flush_all(&ch, &consumer, &mut pending_signals, &mut pending_flow, &mut last_flush).await;
                }
            }
            Ok(Err(e)) => error!("kafka recv: {e}"),
            Err(_) => {
                if last_flush.elapsed().as_secs_f64() >= FLUSH_SECS {
                    flush_all(&ch, &consumer, &mut pending_signals, &mut pending_flow, &mut last_flush).await;
                }
            }
        }
    }
}

async fn flush_all(
    ch: &clickhouse::Client,
    consumer: &rdkafka::consumer::StreamConsumer,
    pending_signals: &mut Vec<SignalRow>,
    pending_flow: &mut Vec<FlowRow>,
    last_flush: &mut Instant,
) {
    if pending_signals.is_empty() && pending_flow.is_empty() {
        *last_flush = Instant::now();
        return;
    }
    let sig_n = pending_signals.len();
    let flow_n = pending_flow.len();
    let result = async {
        if !pending_signals.is_empty() {
            clickhouse_client::insert_rows(ch, "signals", pending_signals).await?;
        }
        if !pending_flow.is_empty() {
            clickhouse_client::insert_rows(ch, "market_participant_flow", pending_flow).await?;
        }
        Ok::<(), anyhow::Error>(())
    }
    .await;

    match result {
        Ok(()) => {
            info!(signals = sig_n, flow = flow_n, "flushed");
            pending_signals.clear();
            pending_flow.clear();
            if let Err(e) = kafka_client::commit_sync(consumer) {
                error!("commit failed: {e}");
                return;
            }
        }
        Err(e) => error!("flush failed; retrying: {e}"),
    }
    *last_flush = Instant::now();
}
