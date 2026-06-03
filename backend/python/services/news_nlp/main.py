"""News NLP worker (Phase 4).

Two halves in one process:

  * **Source** — with a Polygon key it polls the Polygon news REST endpoint;
    without one it synthesizes a deterministic-ish headline stream. Either way
    raw articles are published to `news-raw`.
  * **Processor** — consumes `news-raw`, scores sentiment + market impact, tags
    symbols, computes a hashing embedding and a risk-on/off regime impact, then
    writes `news_events` (ClickHouse) and publishes `news-processed` for the
    signal worker to overlay onto its composite signals.
"""

from __future__ import annotations

import random
import time
import uuid
from datetime import datetime, timezone

from common import nlp, topics
from common.clickhouse import get_client, insert_dicts
from common.config import load
from common.kafka import decode, make_consumer, make_producer, produce
from common.logging import get_logger

log = get_logger("news-nlp-worker")

SOURCE_INTERVAL_S = 20.0
FLUSH_SECONDS = 5.0
SOURCES = ["Bloomberg", "Reuters", "CNBC", "MarketWatch", "Benzinga", "Seeking Alpha"]

_HEADLINE_TEMPLATES = [
    ("{name} beats earnings estimates as revenue surges", 1),
    ("{name} misses guidance, shares plunge in after-hours", -1),
    ("Analysts upgrade {name} on strong demand outlook", 1),
    ("{name} downgraded amid slowdown warning", -1),
    ("{name} announces record buyback, stock rallies", 1),
    ("Regulators open probe into {name} accounting", -1),
    ("{name} unveils breakthrough product, bullish reaction", 1),
    ("{name} faces lawsuit over disclosures", -1),
    ("Fed signals rate path; {name} among most sensitive names", 0),
    ("{name} volume jumps on unusual options activity", 0),
]
_NAMES = {
    "SPY": "the S&P 500", "QQQ": "the Nasdaq 100", "NVDA": "Nvidia",
    "AAPL": "Apple", "TSLA": "Tesla", "AMD": "AMD",
}


def synth_articles(symbols: list[str], rng: random.Random) -> list[dict]:
    out = []
    for _ in range(rng.randint(1, 2)):
        sym = rng.choice(symbols)
        template, _bias = rng.choice(_HEADLINE_TEMPLATES)
        headline = template.format(name=_NAMES.get(sym, sym))
        out.append({
            "event_id": str(uuid.uuid4()),
            "published_at": datetime.now(timezone.utc).replace(tzinfo=None).isoformat(),
            "source": rng.choice(SOURCES),
            "headline": headline,
            "body": headline + ".",
        })
    return out


def polygon_articles(cfg) -> list[dict]:
    import httpx

    try:
        resp = httpx.get(
            "https://api.polygon.io/v2/reference/news",
            params={"apiKey": cfg.polygon_api_key, "limit": 20, "order": "desc"},
            timeout=10,
        )
        resp.raise_for_status()
        results = resp.json().get("results", [])
    except Exception as exc:  # noqa: BLE001
        log.warn("polygon news fetch failed", err=str(exc))
        return []
    out = []
    for r in results:
        out.append({
            "event_id": r.get("id", str(uuid.uuid4())),
            "published_at": (r.get("published_utc", "") or datetime.now(timezone.utc).isoformat()).replace("Z", ""),
            "source": (r.get("publisher", {}) or {}).get("name", "Polygon"),
            "headline": r.get("title", ""),
            "body": r.get("description", "") or r.get("title", ""),
        })
    return out


def _parse_dt(s: str) -> datetime:
    try:
        return datetime.fromisoformat(s.replace("Z", "")).replace(tzinfo=None)
    except (ValueError, AttributeError):
        return datetime.now(timezone.utc).replace(tzinfo=None)


def process(raw: dict, universe: list[str]) -> dict:
    text = f"{raw.get('headline', '')} {raw.get('body', '')}".strip()
    sent = nlp.sentiment(text)
    symbols = nlp.tag_symbols(text, universe)
    impact = nlp.impact(text, raw.get("source", ""), sent, len(symbols))
    return {
        "event_id": _as_uuid(raw.get("event_id")),
        "published_at": _parse_dt(raw.get("published_at", "")),
        "source": raw.get("source", "unknown"),
        "headline": raw.get("headline", ""),
        "body": raw.get("body", ""),
        "symbols": symbols,
        "sentiment_score": sent,
        "impact_score": impact,
        "regime_impact": nlp.regime_impact(sent, impact),
        "embedding": nlp.embed(text),
    }


def _as_uuid(val) -> str:
    try:
        return str(uuid.UUID(str(val)))
    except (ValueError, TypeError):
        return str(uuid.uuid5(uuid.NAMESPACE_URL, str(val)))


def main() -> None:
    cfg = load()
    consumer = make_consumer(cfg, "news-nlp-worker", [topics.NEWS_RAW])
    producer = make_producer(cfg)
    ch = get_client(cfg)
    rng = random.Random(7)

    pending: list[dict] = []
    last_flush = time.monotonic()
    last_source = 0.0
    log.info("started", polygon=cfg.has_polygon, source_interval_s=SOURCE_INTERVAL_S)

    def flush() -> None:
        nonlocal last_flush
        if pending:
            try:
                insert_dicts(ch, "news_events", pending)
                producer.flush(5)
                consumer.commit(asynchronous=False)
                log.info("flushed news", rows=len(pending))
            except Exception as exc:  # noqa: BLE001
                log.error("flush failed; retrying", err=str(exc))
                return
            pending.clear()
        last_flush = time.monotonic()

    def emit_source() -> None:
        articles = polygon_articles(cfg) if cfg.has_polygon else synth_articles(cfg.symbols, rng)
        for a in articles:
            produce(producer, topics.NEWS_RAW, a["event_id"], a)
        if articles:
            producer.flush(2)

    try:
        while True:
            now = time.monotonic()
            if now - last_source >= SOURCE_INTERVAL_S:
                emit_source()
                last_source = now

            msg = consumer.poll(0.5)
            if msg is None:
                if time.monotonic() - last_flush >= FLUSH_SECONDS:
                    flush()
                continue
            if msg.error():
                log.warn("consumer error", err=str(msg.error()))
                continue

            raw = decode(msg)
            if not raw.get("headline"):
                continue
            event = process(raw, cfg.symbols)
            pending.append(event)
            produce(producer, topics.NEWS_PROCESSED, ",".join(event["symbols"]) or "MKT", {
                **event, "published_at": event["published_at"].isoformat(),
            })
            if event["impact_score"] >= 0.5:
                log.info("high-impact news", headline=event["headline"][:80],
                         sentiment=event["sentiment_score"], impact=event["impact_score"], symbols=event["symbols"])

            if time.monotonic() - last_flush >= FLUSH_SECONDS:
                flush()
    finally:
        flush()
        consumer.close()
        producer.flush(5)


if __name__ == "__main__":
    main()
