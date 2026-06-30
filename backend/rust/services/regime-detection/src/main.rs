//! Port of `backend/python/services/regime_detection/main.py`.

use anyhow::Result;
use clickhouse::Row;
use gx_core::{
    analytics,
    config::Config,
    topics::{self, candles_topic},
};
use gx_infra::{clickhouse_client, kafka_client, redis_client};
use rdkafka::consumer::Consumer;
use rdkafka::Message;
use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};
use std::time::{Duration, Instant};
use time::OffsetDateTime;
use tracing::{error, info, warn};

const WINDOW: usize = 120;
const MIN_BARS: usize = 40;
const VOL_HISTORY: usize = 252;
const PERIODS_PER_YEAR: usize = 252 * 7;
const REFRESH_SECS: f64 = 300.0;
const FLUSH_SECS: f64 = 5.0;

const VOL_LABELS: &[&str] = &["LOW", "NORMAL", "HIGH", "EXTREME"];

#[derive(Debug, Deserialize)]
struct CandleEvent {
    symbol: String,
    close: f64,
}

#[derive(Debug, Clone, Serialize)]
struct RegimeState {
    regime_type: String,
    confidence: f64,
    vol_regime: String,
    trend_strength: f64,
    realized_vol: f64,
    implied_vol: f64,
    vol_of_vol: f64,
    hurst_exponent: f64,
    autocorrelation_lag1: f64,
    skew: f64,
    kurtosis: f64,
}

#[derive(Row, Serialize, Clone)]
struct RegimeRow {
    symbol: String,
    #[serde(with = "clickhouse::serde::time::datetime64::millis")]
    detected_at: OffsetDateTime,
    regime_type: String,
    confidence: f64,
    vol_regime: String,
    trend_strength: f64,
    realized_vol: f64,
    implied_vol: f64,
    vol_of_vol: f64,
    hurst_exponent: f64,
    autocorrelation_lag1: f64,
    skew: f64,
    kurtosis: f64,
}

fn classify(closes: &VecDeque<f64>, vol_hist: &mut VecDeque<f64>, implied_vol: f64) -> RegimeState {
    let prices: Vec<f64> = closes.iter().copied().collect();
    let rets = analytics::log_returns(&prices);
    let rvol = analytics::realized_vol(&rets, PERIODS_PER_YEAR);
    vol_hist.push_back(rvol);
    while vol_hist.len() > VOL_HISTORY {
        vol_hist.pop_front();
    }

    let hurst = analytics::hurst_exponent(&prices);
    let ac1 = analytics::autocorr_lag1(&rets);
    let skew = analytics::skewness(&rets);
    let kurt = analytics::kurtosis(&rets);
    let trend_strength = analytics::trend_strength(&prices);

    let regime = if hurst > 0.55 {
        if trend_strength > 0.0 {
            "TRENDING_UP"
        } else {
            "TRENDING_DOWN"
        }
    } else if hurst < 0.38 {
        "MEAN_REVERTING"
    } else {
        "RANDOM_WALK"
    };

    let confidence = (hurst - 0.5).abs() * 2.0
        + (prices.len() as f64 / WINDOW as f64).min(1.0) * 0.3;
    let confidence = confidence.clamp(0.0, 1.0);

    let vol_slice: Vec<f64> = vol_hist.iter().copied().collect();
    let k = VOL_LABELS.len().min(vol_slice.len().max(1));
    let (centroids, _) = analytics::kmeans_1d(&vol_slice, k, 50);
    let vol_regime = analytics::label_for(rvol, &centroids, VOL_LABELS);
    let vol_of_vol = analytics::std_ddof1(&vol_slice);

    RegimeState {
        regime_type: regime.to_string(),
        confidence: (confidence * 1000.0).round() / 1000.0,
        vol_regime,
        trend_strength: (trend_strength * 10000.0).round() / 10000.0,
        realized_vol: (rvol * 10000.0).round() / 10000.0,
        implied_vol: (implied_vol * 10000.0).round() / 10000.0,
        vol_of_vol: (vol_of_vol * 10000.0).round() / 10000.0,
        hurst_exponent: (hurst * 10000.0).round() / 10000.0,
        autocorrelation_lag1: (ac1 * 10000.0).round() / 10000.0,
        skew: (skew * 10000.0).round() / 10000.0,
        kurtosis: (kurt * 10000.0).round() / 10000.0,
    }
}

async fn implied_vol(redis: &mut redis::aio::ConnectionManager, symbol: &str) -> f64 {
    let key = format!("chain:{symbol}");
    let raw: Option<String> = redis.get(&key).await.unwrap_or(None);
    let Some(raw) = raw else {
        return 0.0;
    };
    let contracts: Vec<serde_json::Value> = serde_json::from_str(&raw).unwrap_or_default();
    contracts
        .first()
        .and_then(|c| c.get("underlying_iv"))
        .and_then(|v| v.as_f64())
        .map(|iv| iv / 100.0)
        .unwrap_or(0.0)
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    let cfg = Config::load();
    let topic = candles_topic("1h");
    let consumer = kafka_client::make_consumer(&cfg, "regime-detection-rs", &[topic])?;
    let producer = kafka_client::make_producer(&cfg)?;
    let ch = clickhouse_client::make_client(&cfg);
    let mut redis = redis_client::make_connection(&cfg).await?;

    let mut closes: HashMap<String, VecDeque<f64>> = HashMap::new();
    let mut vol_hist: HashMap<String, VecDeque<f64>> = HashMap::new();
    let mut last_regime: HashMap<String, String> = HashMap::new();
    let mut last_emit: HashMap<String, f64> = HashMap::new();
    let mut pending: Vec<RegimeRow> = Vec::new();
    let mut last_flush = Instant::now();

    info!(window = WINDOW, min_bars = MIN_BARS, "regime-detection started");

    let started = Instant::now();

    loop {
        let poll = tokio::time::timeout(Duration::from_millis(500), consumer.recv()).await;

        match poll {
            Ok(Ok(msg)) => {
                let ev: CandleEvent = match kafka_client::decode_json(&msg) {
                    Ok(v) => v,
                    Err(e) => {
                        warn!("decode: {e}");
                        continue;
                    }
                };

                let q = closes.entry(ev.symbol.clone()).or_insert_with(|| VecDeque::with_capacity(WINDOW));
                q.push_back(ev.close);
                while q.len() > WINDOW {
                    q.pop_front();
                }

                if q.len() < MIN_BARS {
                    continue;
                }

                let now_secs = started.elapsed().as_secs_f64();
                let vh = vol_hist
                    .entry(ev.symbol.clone())
                    .or_insert_with(|| VecDeque::with_capacity(VOL_HISTORY));
                let iv = implied_vol(&mut redis, &ev.symbol).await;
                let state = classify(q, vh, iv);

                let changed = last_regime.get(&ev.symbol).map(|s| s.as_str()) != Some(state.regime_type.as_str());
                let last = last_emit.get(&ev.symbol).copied().unwrap_or(0.0);
                if !changed && now_secs - last < REFRESH_SECS {
                    continue;
                }

                last_regime.insert(ev.symbol.clone(), state.regime_type.clone());
                last_emit.insert(ev.symbol.clone(), now_secs);

                let detected_at = OffsetDateTime::now_utc();
                pending.push(RegimeRow {
                    symbol: ev.symbol.clone(),
                    detected_at,
                    regime_type: state.regime_type.clone(),
                    confidence: state.confidence,
                    vol_regime: state.vol_regime.clone(),
                    trend_strength: state.trend_strength,
                    realized_vol: state.realized_vol,
                    implied_vol: state.implied_vol,
                    vol_of_vol: state.vol_of_vol,
                    hurst_exponent: state.hurst_exponent,
                    autocorrelation_lag1: state.autocorrelation_lag1,
                    skew: state.skew,
                    kurtosis: state.kurtosis,
                });

                let event = serde_json::json!({
                    "symbol": ev.symbol,
                    "detected_at": detected_at.format(&time::format_description::well_known::Rfc3339).unwrap_or_default(),
                    "changed": changed,
                    "regime_type": state.regime_type,
                    "confidence": state.confidence,
                    "vol_regime": state.vol_regime,
                    "trend_strength": state.trend_strength,
                    "realized_vol": state.realized_vol,
                    "implied_vol": state.implied_vol,
                    "vol_of_vol": state.vol_of_vol,
                    "hurst_exponent": state.hurst_exponent,
                    "autocorrelation_lag1": state.autocorrelation_lag1,
                    "skew": state.skew,
                    "kurtosis": state.kurtosis,
                });
                let _ = kafka_client::produce_json(&producer, topics::REGIME_EVENTS, &ev.symbol, &event).await;

                if let Ok(json) = serde_json::to_string(&state) {
                    let _ = redis
                        .set_ex::<_, _, ()>(format!("regime:{}", ev.symbol), json, 3600)
                        .await;
                }

                if changed {
                    info!(symbol = %ev.symbol, regime = %state.regime_type, vol = %state.vol_regime, "regime change");
                }

                if last_flush.elapsed().as_secs_f64() >= FLUSH_SECS {
                    flush(&ch, &consumer, &mut pending, &mut last_flush).await;
                }
            }
            Ok(Err(e)) => error!("kafka recv: {e}"),
            Err(_) => {
                if last_flush.elapsed().as_secs_f64() >= FLUSH_SECS {
                    flush(&ch, &consumer, &mut pending, &mut last_flush).await;
                }
            }
        }
    }
}

async fn flush(
    ch: &clickhouse::Client,
    consumer: &rdkafka::consumer::StreamConsumer,
    pending: &mut Vec<RegimeRow>,
    last_flush: &mut Instant,
) {
    if pending.is_empty() {
        *last_flush = Instant::now();
        return;
    }
    match clickhouse_client::insert_rows(ch, "regime_states", pending).await {
        Ok(()) => {
            info!(rows = pending.len(), "flushed regime states");
            pending.clear();
            if let Err(e) = kafka_client::commit_sync(consumer) {
                error!("commit failed: {e}");
                return;
            }
        }
        Err(e) => error!("flush failed; retrying: {e}"),
    }
    *last_flush = Instant::now();
}
