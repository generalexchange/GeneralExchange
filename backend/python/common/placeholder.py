"""Runnable placeholder for services whose full logic lands in a later phase.

It joins the relevant consumer group and drains its input topics (so offsets
advance and the wiring is observable) while logging a heartbeat. Replace the
body with the real worker when its phase is implemented.
"""

from __future__ import annotations

import time

from common.config import load
from common.kafka import make_consumer
from common.logging import get_logger


def run(service: str, input_topics: list[str], phase: str) -> None:
    cfg = load()
    log = get_logger(service)
    log.info("placeholder running — full implementation pending", phase=phase, inputs=input_topics)
    consumer = make_consumer(cfg, service, input_topics) if input_topics else None
    seen = 0
    last_beat = time.monotonic()
    try:
        while True:
            if consumer is not None:
                msg = consumer.poll(1.0)
                if msg is not None and not msg.error():
                    seen += 1
                    consumer.commit(asynchronous=True)
            else:
                time.sleep(1.0)
            if time.monotonic() - last_beat >= 30:
                log.info("heartbeat", consumed=seen)
                last_beat = time.monotonic()
    finally:
        if consumer is not None:
            consumer.close()
