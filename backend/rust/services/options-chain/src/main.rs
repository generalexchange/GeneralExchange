//! Port of `backend/python/services/options_chain/main.py`.

mod synth;

use anyhow::Result;
use clickhouse::Row;
use gx_core::{config::Config, topics};
use gx_infra::{clickhouse_client, kafka_client, redis_client};
use redis::AsyncCommands;
use serde_json::json;
use std::collections::HashMap;
use std::time::{Duration, Instant};
use synth::{synth_chain, ChainContract, IvHistory};
use time::{Date, OffsetDateTime};
use tracing::{error, info, warn};

const SNAPSHOT_SECONDS: u64 = 30;

#[derive(Row, serde::Serialize, Clone)]
struct OptionChainRow {
    symbol: String,
    #[serde(with = "clickhouse::serde::time::datetime64::millis")]
    snapshot_time: OffsetDateTime,
    #[serde(with = "clickhouse::serde::time::date")]
    expiration_date: Date,
    strike: f64,
    option_type: String,
    bid: f64,
    ask: f64,
    mid: f64,
    last: f64,
    volume: u32,
    open_interest: u32,
    implied_volatility: f64,
    delta: f64,
    gamma: f64,
    theta: f64,
    vega: f64,
    rho: f64,
    lambda: f64,
    epsilon: f64,
    charm: f64,
    vanna: f64,
    volga: f64,
    speed: f64,
    zomma: f64,
    color: f64,
    underlying_price: f64,
    underlying_iv: f64,
    iv_rank: f64,
    iv_percentile: f64,
}

impl From<&ChainContract> for OptionChainRow {
    fn from(c: &ChainContract) -> Self {
        Self {
            symbol: c.symbol.clone(),
            snapshot_time: c.snapshot_time,
            expiration_date: c.expiration_date,
            strike: c.strike,
            option_type: c.option_type.clone(),
            bid: c.bid,
            ask: c.ask,
            mid: c.mid,
            last: c.last,
            volume: c.volume,
            open_interest: c.open_interest,
            implied_volatility: c.implied_volatility,
            delta: c.delta,
            gamma: c.gamma,
            theta: c.theta,
            vega: c.vega,
            rho: c.rho,
            lambda: c.lambda,
            epsilon: c.epsilon,
            charm: c.charm,
            vanna: c.vanna,
            volga: c.volga,
            speed: c.speed,
            zomma: c.zomma,
            color: c.color,
            underlying_price: c.underlying_price,
            underlying_iv: c.underlying_iv,
            iv_rank: c.iv_rank,
            iv_percentile: c.iv_percentile,
        }
    }
}

#[derive(Debug, serde::Deserialize)]
struct PolygonResponse {
    results: Option<Vec<PolygonResult>>,
}

#[derive(Debug, serde::Deserialize, Default)]
struct PolygonResult {
    #[serde(default)]
    details: PolygonDetails,
    #[serde(default)]
    greeks: PolygonGreeks,
    #[serde(default)]
    day: PolygonDay,
    #[serde(default)]
    last_quote: PolygonQuote,
    #[serde(default)]
    underlying_asset: PolygonUnderlying,
    implied_volatility: Option<f64>,
    open_interest: Option<u64>,
}

#[derive(Debug, serde::Deserialize, Default)]
struct PolygonDetails {
    expiration_date: Option<String>,
    strike_price: Option<f64>,
    contract_type: Option<String>,
}

#[derive(Debug, serde::Deserialize, Default)]
struct PolygonGreeks {
    delta: Option<f64>,
    gamma: Option<f64>,
    theta: Option<f64>,
    vega: Option<f64>,
}

#[derive(Debug, serde::Deserialize, Default)]
struct PolygonDay {
    close: Option<f64>,
    volume: Option<u64>,
}

#[derive(Debug, serde::Deserialize, Default)]
struct PolygonQuote {
    bid: Option<f64>,
    ask: Option<f64>,
}

#[derive(Debug, serde::Deserialize, Default)]
struct PolygonUnderlying {
    price: Option<f64>,
}

async fn polygon_chain(
    cfg: &Config,
    symbol: &str,
    iv_history: &mut HashMap<String, IvHistory>,
) -> Result<Option<Vec<ChainContract>>> {
    let url = format!("https://api.polygon.io/v3/snapshot/options/{symbol}");
    let client = reqwest::Client::new();
    let http = client
        .get(&url)
        .query(&[("apiKey", cfg.polygon_api_key.as_str()), ("limit", "250")])
        .timeout(Duration::from_secs(10))
        .send()
        .await?;
    if !http.status().is_success() {
        anyhow::bail!("polygon status {}", http.status());
    }
    let body: PolygonResponse = http.json().await?;
    let results = match body.results {
        Some(r) if !r.is_empty() => r,
        _ => return Ok(None),
    };

    let snapshot_time = OffsetDateTime::now_utc();
    let mut spot = 0.0_f64;
    let mut ivs = Vec::new();
    let mut rows = Vec::new();

    for r in results {
        if let Some(p) = r.underlying_asset.price {
            if p > 0.0 {
                spot = p;
            }
        }
        let iv = r.implied_volatility.unwrap_or(0.0);
        ivs.push(iv);
        let bid = r.last_quote.bid.unwrap_or(0.0);
        let ask = r.last_quote.ask.unwrap_or(0.0);
        let mid = if bid > 0.0 || ask > 0.0 {
            ((bid + ask) / 2.0 * 100.0).round() / 100.0
        } else {
            0.0
        };
        rows.push(ChainContract {
            symbol: symbol.to_string(),
            snapshot_time,
            expiration_date: synth::parse_expiry(r.details.expiration_date.as_deref()),
            strike: r.details.strike_price.unwrap_or(0.0),
            option_type: if r.details.contract_type.as_deref() == Some("call") {
                "CALL".into()
            } else {
                "PUT".into()
            },
            bid,
            ask,
            mid,
            last: r.day.close.unwrap_or(0.0),
            volume: r.day.volume.unwrap_or(0) as u32,
            open_interest: r.open_interest.unwrap_or(0) as u32,
            implied_volatility: (iv * 100.0 * 100.0).round() / 100.0,
            delta: r.greeks.delta.unwrap_or(0.0),
            gamma: r.greeks.gamma.unwrap_or(0.0),
            theta: r.greeks.theta.unwrap_or(0.0),
            vega: r.greeks.vega.unwrap_or(0.0),
            rho: 0.0,
            lambda: 0.0,
            epsilon: 0.0,
            charm: 0.0,
            vanna: 0.0,
            volga: 0.0,
            speed: 0.0,
            zomma: 0.0,
            color: 0.0,
            underlying_price: spot,
            underlying_iv: 0.0,
            iv_rank: 0.0,
            iv_percentile: 0.0,
        });
    }

    let atm_iv = if ivs.is_empty() {
        0.0
    } else {
        ivs.iter().sum::<f64>() / ivs.len() as f64 * 100.0
    };
    let (rank, pct) = synth::iv_rank_percentile(iv_history, symbol, atm_iv);
    for row in &mut rows {
        row.underlying_iv = (atm_iv * 100.0).round() / 100.0;
        row.iv_rank = rank;
        row.iv_percentile = pct;
    }
    Ok(Some(rows))
}

async fn snapshot_symbol(
    cfg: &Config,
    symbol: &str,
    iv_history: &mut HashMap<String, IvHistory>,
    producer: &rdkafka::producer::FutureProducer,
    ch: &clickhouse::Client,
    redis: &mut redis::aio::ConnectionManager,
) {
    let rows = if cfg.has_polygon() {
        match polygon_chain(cfg, symbol, iv_history).await {
            Ok(Some(r)) => r,
            Err(e) => {
                warn!(symbol, err = %e, "polygon fetch failed; synthesizing");
                synth_chain(symbol, iv_history)
            }
            Ok(None) => synth_chain(symbol, iv_history),
        }
    } else {
        synth_chain(symbol, iv_history)
    };

    let ch_rows: Vec<OptionChainRow> = rows.iter().map(OptionChainRow::from).collect();
    if let Err(e) = clickhouse_client::insert_rows(ch, "options_chain", &ch_rows).await {
        error!(symbol, err = %e, "clickhouse insert failed");
    }

    let safe: Vec<serde_json::Value> = rows.iter().map(|r| r.to_json()).collect();
    let payload = json!({ "symbol": symbol, "contracts": safe });
    if let Err(e) = kafka_client::produce_json(
        producer,
        topics::OPTIONS_CHAIN_SNAPSHOTS,
        symbol,
        &payload,
    )
    .await
    {
        warn!(symbol, err = %e, "kafka produce failed");
    }

    if let Ok(cache) = serde_json::to_string(&safe) {
        if let Err(e) = redis
            .set_ex::<_, _, ()>(format!("chain:{symbol}"), cache, 60)
            .await
        {
            warn!(symbol, err = %e, "redis cache failed");
        }
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    let cfg = Config::load();
    let producer = kafka_client::make_producer(&cfg)?;
    let ch = clickhouse_client::make_client(&cfg);
    let mut redis = redis_client::make_connection(&cfg).await?;
    let mut iv_history: HashMap<String, IvHistory> = HashMap::new();

    info!(
        symbols = ?cfg.symbols,
        polygon = cfg.has_polygon(),
        cadence_s = SNAPSHOT_SECONDS,
        "options-chain started"
    );

    loop {
        let cycle_start = Instant::now();
        for symbol in cfg.symbols.clone() {
            snapshot_symbol(
                &cfg,
                &symbol,
                &mut iv_history,
                &producer,
                &ch,
                &mut redis,
            )
            .await;
        }
        let elapsed = cycle_start.elapsed();
        info!(elapsed_s = elapsed.as_secs_f64(), "snapshot cycle complete");
        let sleep = SNAPSHOT_SECONDS.saturating_sub(elapsed.as_secs());
        if sleep > 0 {
            tokio::time::sleep(Duration::from_secs(sleep)).await;
        }
    }
}
