# DataHub catalog + lineage

DataHub is the data catalog. It answers "where did this number come from?" by
cataloging every ClickHouse table and recording the end-to-end lineage from raw
Polygon ticks through to signals and backtests.

## Prerequisites

Bring up the catalog faces (GMS + frontend):

```bash
docker compose --profile catalog up -d
# DataHub UI:  http://localhost:9003
# DataHub GMS: http://localhost:8087
```

> A full DataHub deploy also needs Kafka + Elasticsearch + a metadata DB. For a
> complete local stack use the upstream `datahub docker quickstart`; the compose
> services here expose the GMS + frontend for wiring.

Install the CLI tooling (workstation / CI, not a runtime service):

```bash
pip install -r backend/datahub/requirements.txt
```

## 1. Catalog the warehouse

```bash
datahub ingest -c backend/datahub/recipe.yml
```

This crawls `general_exchange.*`, importing schemas, table-level stats, and
column profiles.

## 2. Emit cross-system lineage

```bash
DATAHUB_GMS_URL=http://localhost:8087 python backend/datahub/lineage_emitter.py
```

This declares the directed lineage graph:

```
Polygon.io ─▶ Redpanda topics ─▶ ClickHouse raw ─▶ dbt models
           ─▶ ClickHouse marts ─▶ signals / backtests ─▶ billing rollups
```

Both steps are idempotent and safe to re-run (e.g. on a schedule via Airflow).
