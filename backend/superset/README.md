# Superset — internal BI + data-quality dashboard

Apache Superset is the internal BI surface. The bundled **Data Quality**
dashboard visualizes the results the `data-quality-worker` writes to
`general_exchange.data_quality_checks`, plus API usage/error overlays from
`api_usage`.

## Bring up Superset

```bash
docker compose --profile bi up -d
# Superset: http://localhost:8088
```

The ClickHouse connection requires the ClickHouse SQLAlchemy driver in the
Superset image:

```bash
pip install clickhouse-connect clickhouse-sqlalchemy
```

Connection string used by the bundled database asset:

```
clickhousedb+connect://default:@clickhouse:8123/general_exchange
```

## Import the dashboard bundle

The `assets/` tree is a Superset import bundle (database → dataset → charts →
dashboard, linked by UUID). Zip and import it:

```bash
cd backend/superset/assets
zip -r ../data_quality_bundle.zip .
# Settings → Import dashboards, upload data_quality_bundle.zip
# or:
superset import-dashboards -p backend/superset/data_quality_bundle.zip
```

The dashboard refreshes every 60s and contains:

- **Pass % over time** — warehouse health trend (hourly).
- **Status breakdown** — PASS / WARN / FAIL split for the latest hour.
- **Failing & warning checks** — the actionable list with observed vs threshold.

## Ad-hoc queries

`queries/data_quality.sql` holds the panel queries (current status per check,
freshness leaderboard, API usage/error rate by firm). They run directly in SQL
Lab against the ClickHouse connection and are handy for building further charts.

> If the UUID-linked import is rejected by your Superset version, create the
> ClickHouse database connection manually, add `data_quality_checks` as a
> dataset, and build the charts from `queries/data_quality.sql` — the dataset
> metrics (`pass_pct`, `failing`, `warning`) are defined in the dataset asset.
