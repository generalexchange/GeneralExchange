-- =====================================================================
-- 002_governance.sql — commercialization + data governance (Phase 5)
--   * api_usage          — per-request metering for billing + quotas
--   * billing_usage_daily — materialized daily rollup per firm/key
--   * data_quality_checks — results of automated DQ checks (Superset source)
-- =====================================================================

-- ---------------------------------------------------------------------
-- api_usage — one row per metered API request (written by the Go API over
-- the ClickHouse HTTP interface). Drives usage dashboards + invoicing.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS general_exchange.api_usage
(
    event_time     DateTime64(3),
    key_id         String,
    firm_id        String,
    endpoint       String,
    method         LowCardinality(String),
    status         UInt16,
    response_bytes UInt32
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_time)
ORDER BY (firm_id, key_id, event_time)
TTL toDateTime(event_time) + INTERVAL 400 DAY
SETTINGS index_granularity = 8192;

-- ---------------------------------------------------------------------
-- billing_usage_daily — daily request/byte rollup per firm + key + endpoint.
-- A materialized view keeps it current as api_usage is written.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS general_exchange.billing_usage_daily
(
    day        Date,
    firm_id    String,
    key_id     String,
    endpoint   String,
    requests   UInt64,
    bytes      UInt64,
    errors     UInt64
)
ENGINE = SummingMergeTree
PARTITION BY toYYYYMM(day)
ORDER BY (firm_id, key_id, endpoint, day)
SETTINGS index_granularity = 8192;

CREATE MATERIALIZED VIEW IF NOT EXISTS general_exchange.billing_usage_daily_mv
TO general_exchange.billing_usage_daily AS
SELECT
    toDate(event_time)                       AS day,
    firm_id,
    key_id,
    endpoint,
    count()                                  AS requests,
    sum(response_bytes)                      AS bytes,
    countIf(status >= 400)                   AS errors
FROM general_exchange.api_usage
GROUP BY day, firm_id, key_id, endpoint;

-- ---------------------------------------------------------------------
-- data_quality_checks — automated freshness / null / dup / volume checks.
-- The data-quality worker writes one row per check per run; Superset reads
-- this table for the data-quality dashboard.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS general_exchange.data_quality_checks
(
    checked_at    DateTime64(3),
    dataset       String,
    check_name    String,
    check_type    LowCardinality(String),   -- freshness | nulls | duplicates | volume | range
    status        LowCardinality(String),   -- PASS | WARN | FAIL
    observed      Float64,
    threshold     Float64,
    rows_scanned  UInt64,
    detail        String
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(checked_at)
ORDER BY (dataset, check_name, checked_at)
TTL toDateTime(checked_at) + INTERVAL 180 DAY
SETTINGS index_granularity = 8192;
