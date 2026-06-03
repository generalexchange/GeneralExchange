-- Data-quality dashboard queries (ClickHouse / general_exchange).
-- Each block backs one panel; paste into Superset SQL Lab or use as the SQL of
-- a virtual dataset. The data-quality worker populates data_quality_checks.

-- ---------------------------------------------------------------------
-- Panel 1 — Current status per check (latest run of each check)
-- Big-number / table: one row per (dataset, check_name) with newest status.
-- ---------------------------------------------------------------------
SELECT
    dataset,
    check_name,
    check_type,
    argMax(status, checked_at)       AS status,
    argMax(observed, checked_at)     AS observed,
    argMax(threshold, checked_at)    AS threshold,
    argMax(rows_scanned, checked_at) AS rows_scanned,
    max(checked_at)                  AS last_checked
FROM general_exchange.data_quality_checks
GROUP BY dataset, check_name, check_type
ORDER BY status DESC, dataset, check_name;

-- ---------------------------------------------------------------------
-- Panel 2 — Health score over time (% of checks passing, hourly)
-- Time-series line chart.
-- ---------------------------------------------------------------------
SELECT
    toStartOfHour(checked_at)                              AS bucket,
    round(100 * countIf(status = 'PASS') / count(), 1)     AS pass_pct,
    countIf(status = 'WARN')                               AS warns,
    countIf(status = 'FAIL')                               AS fails
FROM general_exchange.data_quality_checks
WHERE checked_at > now() - INTERVAL 7 DAY
GROUP BY bucket
ORDER BY bucket;

-- ---------------------------------------------------------------------
-- Panel 3 — Currently failing / warning checks (action list)
-- ---------------------------------------------------------------------
SELECT dataset, check_name, status, observed, threshold, detail, last_checked
FROM (
    SELECT
        dataset, check_name,
        argMax(status, checked_at)   AS status,
        argMax(observed, checked_at) AS observed,
        argMax(threshold, checked_at) AS threshold,
        argMax(detail, checked_at)   AS detail,
        max(checked_at)              AS last_checked
    FROM general_exchange.data_quality_checks
    GROUP BY dataset, check_name
)
WHERE status != 'PASS'
ORDER BY status DESC, dataset;

-- ---------------------------------------------------------------------
-- Panel 4 — Freshness leaderboard (seconds since last data, latest)
-- ---------------------------------------------------------------------
SELECT dataset, argMax(observed, checked_at) AS freshness_seconds
FROM general_exchange.data_quality_checks
WHERE check_type = 'freshness'
GROUP BY dataset
ORDER BY freshness_seconds DESC;

-- ---------------------------------------------------------------------
-- Panel 5 — API usage + error rate by firm (last 24h) — billing/ops overlay
-- ---------------------------------------------------------------------
SELECT
    firm_id,
    count()                                            AS requests,
    sum(response_bytes)                                AS bytes,
    round(100 * countIf(status >= 400) / count(), 2)   AS error_pct
FROM general_exchange.api_usage
WHERE event_time > now() - INTERVAL 1 DAY
GROUP BY firm_id
ORDER BY requests DESC;
