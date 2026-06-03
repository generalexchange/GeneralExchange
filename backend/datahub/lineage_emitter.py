"""Emit end-to-end lineage into DataHub.

Declares the platform's data flow as lineage edges so the catalog shows exactly
how a number on the dashboard traces back to a raw Polygon tick:

    Polygon.io ─▶ Redpanda topics ─▶ ClickHouse raw tables ─▶ dbt models
               ─▶ ClickHouse marts ─▶ signals / backtests

Run after `datahub ingest -c recipe.yml` (which catalogs the ClickHouse tables):

    DATAHUB_GMS_URL=http://localhost:8087 python backend/datahub/lineage_emitter.py

Requires `acryl-datahub` (see requirements.txt). Pure-metadata; safe to re-run.
"""

from __future__ import annotations

import os

from datahub.emitter.mce_builder import make_dataset_urn
from datahub.emitter.mcp import MetadataChangeProposalWrapper
from datahub.emitter.rest_emitter import DatahubRestEmitter
from datahub.metadata.schema_classes import (
    DatasetLineageTypeClass,
    UpstreamClass,
    UpstreamLineageClass,
)

GMS = os.getenv("DATAHUB_GMS_URL", "http://localhost:8087")
ENV = "PROD"


def ch(table: str) -> str:
    return make_dataset_urn("clickhouse", f"general_exchange.{table}", ENV)


def topic(name: str) -> str:
    return make_dataset_urn("kafka", name, ENV)


def source(name: str) -> str:
    return make_dataset_urn("external", name, ENV)


# (downstream, [upstreams]) — the directed lineage graph of the platform.
EDGES: list[tuple[str, list[str]]] = [
    (topic("ticks-raw"), [source("polygon.trades")]),
    (topic("candles-1m"), [source("polygon.aggregates")]),
    (ch("ticks"), [topic("ticks-raw")]),
    (topic("ticks-normalized"), [ch("ticks")]),
    (ch("candles"), [topic("ticks-normalized"), topic("candles-1m")]),
    (ch("options_chain"), [source("polygon.options"), ch("candles")]),
    (ch("options_surface"), [ch("options_chain")]),
    (ch("regime_states"), [ch("candles"), ch("options_chain")]),
    (ch("news_events"), [topic("news-raw")]),
    (ch("signals"), [ch("candles"), ch("options_chain"), ch("regime_states"), ch("news_events")]),
    (ch("market_participant_flow"), [ch("options_chain")]),
    (ch("backtest_runs"), [ch("candles"), ch("options_chain"), ch("signals")]),
    (ch("backtest_trades"), [ch("backtest_runs")]),
    (ch("billing_usage_daily"), [ch("api_usage")]),
]


def main() -> None:
    emitter = DatahubRestEmitter(gms_server=GMS)
    for downstream, upstreams in EDGES:
        lineage = UpstreamLineageClass(
            upstreams=[
                UpstreamClass(dataset=u, type=DatasetLineageTypeClass.TRANSFORMED)
                for u in upstreams
            ]
        )
        emitter.emit(MetadataChangeProposalWrapper(entityUrn=downstream, aspect=lineage))
        print(f"emitted lineage: {len(upstreams)} -> {downstream}")
    print(f"done — {len(EDGES)} lineage edges emitted to {GMS}")


if __name__ == "__main__":
    main()
