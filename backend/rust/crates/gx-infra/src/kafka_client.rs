//! Port of `backend/python/common/kafka.py`.

use anyhow::Result;
use gx_core::config::Config;
use rdkafka::consumer::{CommitMode, Consumer, StreamConsumer};
use rdkafka::message::Message;
use rdkafka::producer::{FutureProducer, FutureRecord};
use rdkafka::ClientConfig;
use std::time::Duration;

pub fn make_producer(cfg: &Config) -> Result<FutureProducer> {
    Ok(ClientConfig::new()
        .set("bootstrap.servers", &cfg.redpanda_brokers)
        .set("enable.idempotence", "true")
        .set("acks", "all")
        .set("compression.type", "lz4")
        .set("linger.ms", "20")
        .set("max.in.flight.requests.per.connection", "5")
        .set("retries", "10")
        .create()?)
}

pub fn make_consumer(cfg: &Config, group_id: &str, topics: &[&str]) -> Result<StreamConsumer> {
    let c: StreamConsumer = ClientConfig::new()
        .set("bootstrap.servers", &cfg.redpanda_brokers)
        .set("group.id", group_id)
        .set("auto.offset.reset", "earliest")
        .set("enable.auto.commit", "false")
        .set("partition.assignment.strategy", "cooperative-sticky")
        .create()?;
    c.subscribe(topics)?;
    Ok(c)
}

pub async fn produce_json(
    producer: &FutureProducer,
    topic: &str,
    key: &str,
    value: &impl serde::Serialize,
) -> Result<()> {
    let payload = serde_json::to_vec(value)?;
    producer
        .send(
            FutureRecord::to(topic).key(key).payload(&payload),
            Duration::from_secs(5),
        )
        .await
        .map_err(|(e, _)| anyhow::anyhow!("produce error: {e}"))?;
    Ok(())
}

pub fn decode_json<T: for<'de> serde::Deserialize<'de>>(
    msg: &rdkafka::message::BorrowedMessage<'_>,
) -> Result<T> {
    let bytes = msg
        .payload()
        .ok_or_else(|| anyhow::anyhow!("empty payload"))?;
    Ok(serde_json::from_slice(bytes)?)
}

pub fn commit_sync(consumer: &StreamConsumer) -> Result<()> {
    consumer.commit_consumer_state(CommitMode::Sync)?;
    Ok(())
}
