"""Redpanda (Kafka API) helpers: idempotent producer + manual-commit consumer.

Consumers track offsets in Redpanda itself (consumer groups, not Zookeeper)
and process with at-least-once semantics by committing only after a batch is
durably written downstream.
"""

from __future__ import annotations

import json
from typing import Iterable

from confluent_kafka import Consumer, Producer

from .config import Config


def make_producer(cfg: Config) -> Producer:
    return Producer(
        {
            "bootstrap.servers": cfg.redpanda_brokers,
            "enable.idempotence": True,
            "acks": "all",
            "compression.type": "lz4",
            "linger.ms": 20,
            "max.in.flight.requests.per.connection": 5,
            "retries": 10,
        }
    )


def make_consumer(cfg: Config, group_id: str, topics: Iterable[str]) -> Consumer:
    c = Consumer(
        {
            "bootstrap.servers": cfg.redpanda_brokers,
            "group.id": group_id,
            "auto.offset.reset": "earliest",
            "enable.auto.commit": False,  # at-least-once: commit after processing
            "partition.assignment.strategy": "cooperative-sticky",
        }
    )
    c.subscribe(list(topics))
    return c


def produce(producer: Producer, topic: str, key: str, value: dict) -> None:
    producer.produce(topic=topic, key=key.encode(), value=json.dumps(value).encode())
    producer.poll(0)


def decode(msg) -> dict:
    return json.loads(msg.value())
