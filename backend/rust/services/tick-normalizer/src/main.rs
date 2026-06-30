//! Port of `backend/python/services/tick_normalizer/main.py`.

use anyhow::Result;
use clickhouse::Row;
use gx_core::{config::Config, topics};
use gx_infra::{clickhouse_client, kafka_client};
use rdkafka::consumer::Consumer;
use rdkafka::Message;
use serde::Deserialize;
use serde_json::{json, Value};
use std::collections::{HashMap, VecDeque};
use std::hash::{Hash, Hasher};
use std::time::{Duration, Instant};
use time::OffsetDateTime;
use tracing::{error, info, warn};

const BATCH_SIZE: usize = 500;
const FLUSH_SECS: f64 = 1.0;
const DEDUP_CAPACITY: usize = 50_000;

#[derive(Debug, Deserialize)]
struct RawTick {
    symbol: String,
    timestamp_ns: i64,
    price: f64,
    #[serde(default)]
    size: u32,
    #[serde(default)]
    exchange: String,
    #[serde(default)]
    conditions: Vec<String>,
    #[serde(default)]
    tape: String,
}

#[derive(Row, serde::Serialize, Clone)]
struct TickRow {
    symbol: String,
    #[serde(with = "clickhouse::serde::time::datetime64::nanos")]
    timestamp: OffsetDateTime,
    price: f64,
    size: u32,
    exchange: String,
    conditions: Vec<String>,
    tape: String,
}

struct Dedup {
    order: VecDeque<u64>,
    seen: HashMap<u64, ()>,
    capacity: usize,
}

impl Dedup {
    fn new(capacity: usize) -> Self {
        Self {
            order: VecDeque::with_capacity(capacity),
            seen: HashMap::with_capacity(capacity),
            capacity,
        }
    }

    fn fingerprint(symbol: &str, timestamp_ns: i64, price: f64, size: u32) -> u64 {
        use std::collections::hash_map::DefaultHasher;
        let mut h = DefaultHasher::new();
        symbol.hash(&mut h);
        timestamp_ns.hash(&mut h);
        price.to_bits().hash(&mut h);
        size.hash(&mut h);
        h.finish()
    }

    fn is_dup(&mut self, fp: u64) -> bool {
        if self.seen.contains_key(&fp) {
            if let Some(pos) = self.order.iter().position(|&k| k == fp) {
                if let Some(key) = self.order.remove(pos) {
                    self.order.push_back(key);
                }
            }
            return true;
        }
        self.seen.insert(fp, ());
        self.order.push_back(fp);
        if self.order.len() > self.capacity {
            if let Some(old) = self.order.pop_front() {
                self.seen.remove(&old);
            }
        }
        false
    }
}

fn normalize(raw: &RawTick) -> Option<TickRow> {
    if raw.price <= 0.0 {
        return None;
    }
    let secs = raw.timestamp_ns as i64 / 1_000_000_000;
    let nanos = (raw.timestamp_ns % 1_000_000_000) as i32;
    let timestamp = OffsetDateTime::from_unix_timestamp(secs)
        .ok()?
        .replace_nanosecond(nanos as u32)
        .ok()?;
    let tape = raw.tape.chars().next().unwrap_or('C').to_string();
    Some(TickRow {
        symbol: raw.symbol.clone(),
        timestamp,
        price: raw.price,
        size: raw.size,
        exchange: raw.exchange.clone(),
        conditions: raw.conditions.clone(),
        tape,
    })
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    let cfg = Config::load();
    let consumer = kafka_client::make_consumer(&cfg, "tick-normalizer-rs", &[topics::TICKS_RAW])?;
    let producer = kafka_client::make_producer(&cfg)?;
    let ch = clickhouse_client::make_client(&cfg);
    let mut dedup = Dedup::new(DEDUP_CAPACITY);
    let mut batch: Vec<TickRow> = Vec::with_capacity(BATCH_SIZE);
    let mut last_flush = Instant::now();
    info!(brokers = %cfg.redpanda_brokers, "tick-normalizer started");

    loop {
        let poll = tokio::time::timeout(Duration::from_millis(500), consumer.recv()).await;

        match poll {
            Ok(Ok(msg)) => {
                let raw: RawTick = match kafka_client::decode_json(&msg) {
                    Ok(v) => v,
                    Err(e) => {
                        warn!("decode error: {e}");
                        continue;
                    }
                };
                let Some(row) = normalize(&raw) else {
                    continue;
                };
                let fp = Dedup::fingerprint(&row.symbol, raw.timestamp_ns, row.price, row.size);
                if dedup.is_dup(fp) {
                    continue;
                }

                let mut out: Value = serde_json::to_value(&raw)?;
                if let Value::Object(ref mut map) = out {
                    map.insert("normalized".into(), json!(true));
                }
                if let Err(e) = kafka_client::produce_json(
                    &producer,
                    topics::TICKS_NORMALIZED,
                    &row.symbol,
                    &out,
                )
                .await
                {
                    warn!("produce error: {e}");
                }
                batch.push(row);

                if batch.len() >= BATCH_SIZE || last_flush.elapsed().as_secs_f64() >= FLUSH_SECS {
                    if flush_batch(&ch, &consumer, &mut batch).await {
                        last_flush = Instant::now();
                    }
                }
            }
            Ok(Err(e)) => error!("kafka recv: {e}"),
            Err(_) => {
                if last_flush.elapsed().as_secs_f64() >= FLUSH_SECS {
                    if flush_batch(&ch, &consumer, &mut batch).await {
                        last_flush = Instant::now();
                    }
                }
            }
        }
    }
}

async fn flush_batch(
    ch: &clickhouse::Client,
    consumer: &rdkafka::consumer::StreamConsumer,
    batch: &mut Vec<TickRow>,
) -> bool {
    if batch.is_empty() {
        return true;
    }
    match clickhouse_client::insert_rows(ch, "ticks", batch).await {
        Ok(()) => {
            info!(rows = batch.len(), "flushed batch to ClickHouse");
            batch.clear();
            if let Err(e) = kafka_client::commit_sync(consumer) {
                error!("offset commit failed: {e}");
                return false;
            }
            true
        }
        Err(e) => {
            error!("ClickHouse insert failed; will retry batch: {e}");
            false
        }
    }
}
