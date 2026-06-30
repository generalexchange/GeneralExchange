//! Port of `backend/python/services/candle_aggregation/main.py`.

use anyhow::Result;
use clickhouse::Row;
use gx_core::{config::Config, topics};
use gx_infra::{clickhouse_client, kafka_client};
use rdkafka::consumer::Consumer;
use rdkafka::Message;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{Duration, Instant};
use time::OffsetDateTime;
use tracing::{error, info, warn};

const FLUSH_SECS: f64 = 2.0;

const INTERVAL_MS: &[(&str, i64)] = &[
    ("1m", 60_000),
    ("5m", 300_000),
    ("15m", 900_000),
    ("1h", 3_600_000),
    ("1d", 86_400_000),
];

#[derive(Debug, Deserialize)]
struct NormalizedTick {
    symbol: String,
    timestamp_ns: i64,
    price: f64,
    #[serde(default)]
    size: u32,
}

#[derive(Row, Serialize, Clone)]
struct CandleRow {
    symbol: String,
    interval: String,
    #[serde(with = "clickhouse::serde::time::datetime64::millis")]
    open_time: OffsetDateTime,
    open: f64,
    high: f64,
    low: f64,
    close: f64,
    volume: u64,
    vwap: f64,
    transactions: u32,
}

#[derive(Serialize)]
struct CandleEvent {
    symbol: String,
    interval: String,
    open_time: String,
    open: f64,
    high: f64,
    low: f64,
    close: f64,
    volume: u64,
    vwap: f64,
    transactions: u32,
}

#[derive(Clone)]
struct Bar {
    bucket: i64,
    o: f64,
    h: f64,
    l: f64,
    c: f64,
    vol: u64,
    pv: f64,
    n: u32,
}

impl Bar {
    fn new(bucket: i64, price: f64, size: u32) -> Self {
        Self {
            bucket,
            o: price,
            h: price,
            l: price,
            c: price,
            vol: size as u64,
            pv: price * size as f64,
            n: 1,
        }
    }

    fn update(&mut self, price: f64, size: u32) {
        self.h = self.h.max(price);
        self.l = self.l.min(price);
        self.c = price;
        self.vol += size as u64;
        self.pv += price * size as f64;
        self.n += 1;
    }

    fn to_row(&self, symbol: &str, interval: &str, ms: i64) -> CandleRow {
        let open_ms = self.bucket * ms;
        let open_time = OffsetDateTime::from_unix_timestamp(open_ms / 1000)
            .unwrap_or(OffsetDateTime::UNIX_EPOCH)
            + time::Duration::milliseconds(open_ms % 1000);
        CandleRow {
            symbol: symbol.to_string(),
            interval: interval.to_string(),
            open_time,
            open: (self.o * 10000.0).round() / 10000.0,
            high: (self.h * 10000.0).round() / 10000.0,
            low: (self.l * 10000.0).round() / 10000.0,
            close: (self.c * 10000.0).round() / 10000.0,
            volume: self.vol,
            vwap: if self.vol > 0 {
                ((self.pv / self.vol as f64) * 10000.0).round() / 10000.0
            } else {
                (self.c * 10000.0).round() / 10000.0
            },
            transactions: self.n,
        }
    }
}

type BarState = HashMap<String, HashMap<String, Bar>>;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    let cfg = Config::load();
    let consumer =
        kafka_client::make_consumer(&cfg, "candle-aggregation-rs", &[topics::TICKS_NORMALIZED])?;
    let producer = kafka_client::make_producer(&cfg)?;
    let ch = clickhouse_client::make_client(&cfg);

    let mut state: BarState = INTERVAL_MS
        .iter()
        .map(|(iv, _)| (iv.to_string(), HashMap::new()))
        .collect();
    let mut pending: Vec<CandleRow> = Vec::new();
    let mut last_flush = Instant::now();
    info!("candle-aggregation started");

    loop {
        let poll = tokio::time::timeout(Duration::from_millis(500), consumer.recv()).await;

        match poll {
            Ok(Ok(msg)) => {
                let tick: NormalizedTick = match kafka_client::decode_json(&msg) {
                    Ok(v) => v,
                    Err(e) => {
                        warn!("decode: {e}");
                        continue;
                    }
                };
                let ts_ms = tick.timestamp_ns / 1_000_000;

                for &(interval, ms) in INTERVAL_MS {
                    let bucket = ts_ms / ms;
                    let bars = state.get_mut(interval).expect("interval state");
                    let action = match bars.get(&tick.symbol) {
                        None => "new",
                        Some(bar) if bar.bucket != bucket => "roll",
                        Some(_) => "update",
                    };
                    match action {
                        "new" => {
                            bars.insert(
                                tick.symbol.clone(),
                                Bar::new(bucket, tick.price, tick.size),
                            );
                        }
                        "roll" => {
                            let completed = bars.get(&tick.symbol).unwrap().clone();
                            let row = completed.to_row(&tick.symbol, interval, ms);
                            emit(&producer, &tick.symbol, interval, &row).await;
                            pending.push(row);
                            bars.insert(
                                tick.symbol.clone(),
                                Bar::new(bucket, tick.price, tick.size),
                            );
                        }
                        _ => {
                            bars.get_mut(&tick.symbol)
                                .unwrap()
                                .update(tick.price, tick.size);
                        }
                    }
                }

                if last_flush.elapsed().as_secs_f64() >= FLUSH_SECS {
                    if flush_pending(&ch, &consumer, &mut pending).await {
                        last_flush = Instant::now();
                    }
                }
            }
            Ok(Err(e)) => error!("kafka recv: {e}"),
            Err(_) => {
                if last_flush.elapsed().as_secs_f64() >= FLUSH_SECS {
                    if flush_pending(&ch, &consumer, &mut pending).await {
                        last_flush = Instant::now();
                    }
                }
            }
        }
    }
}

async fn emit(
    producer: &rdkafka::producer::FutureProducer,
    symbol: &str,
    interval: &str,
    row: &CandleRow,
) {
    let event = CandleEvent {
        symbol: row.symbol.clone(),
        interval: row.interval.clone(),
        open_time: row.open_time.format(&time::format_description::well_known::Rfc3339).unwrap_or_default(),
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        volume: row.volume,
        vwap: row.vwap,
        transactions: row.transactions,
    };
    let topic = topics::candles_topic(interval);
    if let Err(e) = kafka_client::produce_json(producer, topic, symbol, &event).await {
        warn!("produce candle: {e}");
    }
}

async fn flush_pending(
    ch: &clickhouse::Client,
    consumer: &rdkafka::consumer::StreamConsumer,
    pending: &mut Vec<CandleRow>,
) -> bool {
    if pending.is_empty() {
        return true;
    }
    match clickhouse_client::insert_rows(ch, "candles", pending).await {
        Ok(()) => {
            info!(rows = pending.len(), "flushed candles");
            pending.clear();
            if let Err(e) = kafka_client::commit_sync(consumer) {
                error!("offset commit: {e}");
                return false;
            }
            true
        }
        Err(e) => {
            error!("candle CH insert failed; retrying: {e}");
            false
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bar_assembly_roundtrip() {
        let mut bar = Bar::new(100, 10.0, 5);
        bar.update(11.0, 3);
        bar.update(9.5, 2);
        let row = bar.to_row("SPY", "1m", 60_000);
        assert_eq!(row.open, 10.0);
        assert_eq!(row.high, 11.0);
        assert_eq!(row.low, 9.5);
        assert_eq!(row.close, 9.5);
        assert_eq!(row.volume, 10);
        assert_eq!(row.transactions, 3);
    }
}
