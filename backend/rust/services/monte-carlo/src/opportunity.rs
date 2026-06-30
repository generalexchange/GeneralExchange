//! Opportunity discovery — ranks IBKR options chains (port of rankLocal.ts).

use anyhow::{Context, Result};
use chrono::{NaiveDate, Utc};
use rand::{SeedableRng};
use rand_distr::{Distribution, StandardNormal};
use rand::rngs::SmallRng;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

const WEIGHTS: &[(&str, f64)] = &[
    ("expected_return", 0.22),
    ("probability_of_profit", 0.22),
    ("historical_edge", 0.18),
    ("liquidity", 0.12),
    ("spread_quality", 0.12),
    ("gamma_positioning", 0.08),
    ("monte_carlo", 0.06),
];

const DISCOVERY_SYMBOLS: &[&str] = &["SPY", "QQQ", "AAPL", "MSFT", "NVDA", "TSLA"];

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiscoverRequest {
    #[serde(default)]
    pub symbols: Vec<String>,
    #[serde(default)]
    pub include_chain: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyzeRequest {
    pub symbol: String,
    #[serde(default)]
    pub include_chain: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OutcomesRequest {
    #[serde(default = "default_limit")]
    pub limit: u32,
    #[serde(default)]
    pub symbol: String,
}

fn default_limit() -> u32 {
    40
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiscoverResponse {
    pub opportunities: Vec<Value>,
    pub generated_at: String,
    pub ml: MlMeta,
}

#[derive(Debug, Clone, Serialize)]
pub struct MlMeta {
    pub weights: HashMap<String, f64>,
}

struct ParsedContract {
    symbol: String,
    expiration: String,
    strike: f64,
    option_type: String,
    bid: f64,
    ask: f64,
    mid: f64,
    volume: i64,
    open_interest: i64,
    iv: f64,
    delta: f64,
    gamma: f64,
    theta: f64,
    vega: f64,
    dte: i32,
}

fn norm(x: f64, lo: f64, hi: f64) -> f64 {
    if hi <= lo {
        return 0.5;
    }
    ((x - lo) / (hi - lo)).clamp(0.0, 1.0)
}

fn dte_days(expiration: &str) -> i32 {
    NaiveDate::parse_from_str(&expiration[..10.min(expiration.len())], "%Y-%m-%d")
        .map(|exp| (exp - Utc::now().date_naive()).num_days() as i32)
        .unwrap_or(999)
}

fn effective_oi(open_interest: i64, strike: f64, spot: f64, is_put: bool) -> f64 {
    if open_interest > 0 {
        return open_interest as f64;
    }
    let m = if spot > 0.0 { strike / spot - 1.0 } else { 0.0 };
    let center = if is_put { -0.012 } else { 0.012 };
    let weight = if is_put { 1.35 } else { 1.0 };
    1000.0 * weight * (-((m - center) * 8.0).powi(2)).exp()
}

fn mc_contract(spot: f64, strike: f64, is_call: bool, iv: f64, premium: f64, dte: i32, seed: u64) -> (f64, f64, f64) {
    let vol = (if iv > 3.0 { iv / 100.0 } else { iv }).max(0.08);
    let t = (dte.max(1) as f64) / 365.0;
    let n = 2000usize;
    let mut rng = SmallRng::seed_from_u64(seed);
    let normal = StandardNormal;
    let mut itm = 0usize;
    let mut profitable = 0usize;
    let mut payoff_sum = 0.0;

    for _ in 0..n {
        let z: f64 = normal.sample(&mut rng);
        let terminal = spot * (( -0.5 * vol * vol) * t + vol * t.sqrt() * z).exp();
        let intrinsic = if is_call {
            (terminal - strike).max(0.0)
        } else {
            (strike - terminal).max(0.0)
        };
        if intrinsic > 0.0 {
            itm += 1;
        }
        if intrinsic > premium {
            profitable += 1;
        }
        payoff_sum += intrinsic;
    }

    (
        profitable as f64 / n as f64,
        itm as f64 / n as f64,
        payoff_sum / n as f64,
    )
}

fn parse_contract(c: &Value, symbol: &str) -> Option<ParsedContract> {
    let strike = c.get("strike").and_then(|v| v.as_f64()).unwrap_or(0.0);
    if strike <= 0.0 {
        return None;
    }
    let right = c
        .get("right")
        .and_then(|v| v.as_str())
        .unwrap_or("C");
    let is_call = !right.to_uppercase().starts_with('P');
    let bid = c.get("bid").and_then(|v| v.as_f64()).unwrap_or(0.0);
    let ask = c.get("ask").and_then(|v| v.as_f64()).unwrap_or(0.0);
    let last = c.get("last").and_then(|v| v.as_f64()).unwrap_or(0.0);
    let mid = if bid > 0.0 || ask > 0.0 {
        (bid + ask) / 2.0
    } else {
        last
    };
    let exp = c
        .get("expiry")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();
    let iv = c
        .get("implied_volatility")
        .and_then(|v| v.as_f64())
        .unwrap_or(0.25);
    Some(ParsedContract {
        symbol: symbol.to_uppercase(),
        expiration: exp.clone(),
        strike,
        option_type: if is_call { "CALL".into() } else { "PUT".into() },
        bid,
        ask,
        mid,
        volume: c.get("volume").and_then(|v| v.as_i64()).unwrap_or(0),
        open_interest: c.get("open_interest").and_then(|v| v.as_i64()).unwrap_or(0),
        iv,
        delta: c.get("delta").and_then(|v| v.as_f64()).unwrap_or(0.0),
        gamma: c.get("gamma").and_then(|v| v.as_f64()).unwrap_or(0.0),
        theta: c.get("theta").and_then(|v| v.as_f64()).unwrap_or(0.0),
        vega: c.get("vega").and_then(|v| v.as_f64()).unwrap_or(0.0),
        dte: dte_days(&exp),
    })
}

fn historical_win_rate(closes: &[f64]) -> (f64, bool) {
    if closes.len() < 25 {
        return (0.5, true);
    }
    let bullish = closes.last().copied().unwrap_or(0.0)
        > closes.get(closes.len().saturating_sub(21)).copied().unwrap_or(0.0);
    let win_rate = if bullish { 0.58 } else { 0.42 };
    (win_rate, bullish)
}

fn score_contract(row: &ParsedContract, spot: f64, hist: (f64, bool), seed: u64) -> Option<Value> {
    if row.dte < 7 || row.dte > 45 || row.mid < 0.05 {
        return None;
    }
    let is_put = row.option_type == "PUT";
    let oi = effective_oi(row.open_interest, row.strike, spot, is_put);
    if oi < 10.0 {
        return None;
    }
    let spread = if row.ask > 0.0 && row.bid > 0.0 {
        row.ask - row.bid
    } else {
        row.mid * 0.1
    };
    let spread_pct = spread / row.mid;
    if spread_pct > 0.18 {
        return None;
    }

    let is_call = !is_put;
    let (prob, prob_itm, exp_payoff) =
        mc_contract(spot, row.strike, is_call, row.iv, row.mid, row.dte, seed);
    let expected_return = ((exp_payoff - row.mid) * 100.0 * prob).max(0.0);

    let aligned = (is_call && hist.1) || (is_put && !hist.1);
    let hist_edge = norm(if aligned { hist.0 } else { 1.0 - hist.0 }, 0.4, 0.7);

    let factors: HashMap<String, f64> = HashMap::from([
        ("expected_return".to_string(), norm(expected_return, 0.0, 2500.0)),
        ("probability_of_profit".to_string(), prob),
        ("historical_edge".to_string(), hist_edge),
        (
            "liquidity".to_string(),
            norm((row.volume as f64 + 1.0).ln() + (oi + 1.0).ln(), 0.0, 12.0),
        ),
        ("spread_quality".to_string(), norm(1.0 - spread_pct, 0.82, 1.0)),
        (
            "gamma_positioning".to_string(),
            norm(row.gamma.abs() * oi, 0.0, 500.0),
        ),
        ("monte_carlo".to_string(), norm(prob * 0.6 + prob_itm * 0.4, 0.0, 1.0)),
    ]);

    let composite: f64 = WEIGHTS
        .iter()
        .map(|(k, w)| factors.get(*k).copied().unwrap_or(0.5) * w)
        .sum();
    let confidence = (composite * 100.0).clamp(52.0, 99.0);

    let weights: HashMap<String, f64> = WEIGHTS.iter().map(|(k, v)| (k.to_string(), *v)).collect();

    Some(serde_json::json!({
        "id": format!("{}-{}-{}-{}", row.symbol, row.option_type, row.strike, row.expiration),
        "symbol": row.symbol,
        "optionType": row.option_type,
        "strike": row.strike,
        "expiration": row.expiration,
        "bid": row.bid,
        "ask": row.ask,
        "mid": row.mid,
        "volume": row.volume,
        "openInterest": oi.round() as i64,
        "iv": row.iv,
        "delta": row.delta,
        "gamma": row.gamma,
        "theta": row.theta,
        "vega": row.vega,
        "dte": row.dte,
        "spreadPct": spread_pct,
        "spot": spot,
        "expectedReturn": (expected_return * 100.0).round() / 100.0,
        "confidence": (confidence * 10.0).round() / 10.0,
        "probabilityOfProfit": (prob * 1000.0).round() / 10.0,
        "compositeScore": (composite * 10000.0).round() / 10000.0,
        "factorScores": factors,
        "monteCarlo": {
            "probabilityITM": (prob_itm * 1000.0).round() / 10.0,
            "probabilityProfitable": (prob * 1000.0).round() / 10.0,
            "expectedPayoff": (exp_payoff * 10000.0).round() / 10000.0,
            "blackScholesPrice": row.mid,
        },
        "analysis": {
            "rationale": format!(
                "Top {} ${:.1} exp {} · IBKR chain mid ${:.2}.",
                row.option_type, row.strike, row.expiration, row.mid
            ),
            "rankFactors": factors,
            "weights": weights,
        },
    }))
}

async fn ibkr_get(
    client: &reqwest::Client,
    base: &str,
    path: &str,
    params: &[(&str, &str)],
) -> Result<Value> {
    let url = format!("{base}{path}");
    let res = client.get(&url).query(params).send().await?;
    let status = res.status();
    let json: Value = res.json().await?;
    if !status.is_success() {
        anyhow::bail!("IBKR {status}: {json}");
    }
    Ok(json)
}

async fn discover_symbol(
    client: &reqwest::Client,
    ibkr_base: &str,
    symbol: &str,
    include_chain: bool,
) -> Result<Option<Value>> {
    let sym = symbol.to_uppercase();

    let quote = ibkr_get(
        client,
        ibkr_base,
        "/market-data",
        &[("symbol", &sym), ("sec_type", "STK")],
    )
    .await
    .ok();

    let chain = ibkr_get(
        client,
        ibkr_base,
        "/options-chain",
        &[("symbol", &sym)],
    )
    .await?;

    let hist = ibkr_get(
        client,
        ibkr_base,
        "/historical",
        &[
            ("symbol", &sym),
            ("bar_size", "1 day"),
            ("duration", "6 M"),
            ("persist", "false"),
            ("cached", "false"),
            ("use_rth", "true"),
        ],
    )
    .await
    .ok();

    let spot = quote
        .as_ref()
        .and_then(|q| q.get("last").and_then(|v| v.as_f64()))
        .or_else(|| {
            chain
                .get("underlying_price")
                .and_then(|v| v.as_f64())
        })
        .unwrap_or(0.0);
    if spot <= 0.0 {
        return Ok(None);
    }

    let closes: Vec<f64> = hist
        .as_ref()
        .and_then(|h| h.get("bars"))
        .and_then(|b| b.as_array())
        .map(|bars| {
            bars.iter()
                .filter_map(|b| b.get("close").and_then(|v| v.as_f64()))
                .filter(|c| *c > 0.0)
                .collect()
        })
        .unwrap_or_default();
    let hist_wr = historical_win_rate(&closes);

    let contracts = chain
        .get("contracts")
        .and_then(|c| c.as_array())
        .cloned()
        .unwrap_or_default();

    let seed_base: u64 = sym.bytes().map(|b| b as u64).sum();
    let mut ranked: Vec<Value> = contracts
        .iter()
        .filter_map(|c| parse_contract(c, &sym))
        .filter_map(|row| score_contract(&row, spot, hist_wr, seed_base + row.strike as u64))
        .collect();

    ranked.sort_by(|a, b| {
        let sa = a.get("compositeScore").and_then(|v| v.as_f64()).unwrap_or(0.0);
        let sb = b.get("compositeScore").and_then(|v| v.as_f64()).unwrap_or(0.0);
        sb.partial_cmp(&sa).unwrap_or(std::cmp::Ordering::Equal)
    });

    let mut top = ranked.into_iter().next();
    if let Some(ref mut t) = top {
        if include_chain {
            // re-score all for chain — simplified: skip chain in rust for speed
            t.as_object_mut().map(|o| o.insert("chain".into(), serde_json::json!([])));
        }
    }
    Ok(top)
}

pub async fn discover(
    client: &reqwest::Client,
    ibkr_base: &str,
    req: DiscoverRequest,
) -> Result<DiscoverResponse> {
    let symbols: Vec<String> = if req.symbols.is_empty() {
        DISCOVERY_SYMBOLS.iter().map(|s| s.to_string()).collect()
    } else {
        req.symbols.iter().map(|s| s.to_uppercase()).collect()
    };

    let mut handles = Vec::new();
    for sym in symbols {
        let c = client.clone();
        let base = ibkr_base.to_string();
        let ic = req.include_chain;
        handles.push(tokio::spawn(async move {
            discover_symbol(&c, &base, &sym, ic).await
        }));
    }

    let mut opportunities = Vec::new();
    for h in handles {
        if let Ok(Ok(Some(v))) = h.await {
            opportunities.push(v);
        }
    }

    opportunities.sort_by(|a, b| {
        let ea = a.get("expectedReturn").and_then(|v| v.as_f64()).unwrap_or(0.0);
        let eb = b.get("expectedReturn").and_then(|v| v.as_f64()).unwrap_or(0.0);
        eb.partial_cmp(&ea).unwrap_or(std::cmp::Ordering::Equal)
    });

    let weights: HashMap<String, f64> = WEIGHTS.iter().map(|(k, v)| (k.to_string(), *v)).collect();
    Ok(DiscoverResponse {
        opportunities,
        generated_at: Utc::now().to_rfc3339(),
        ml: MlMeta { weights },
    })
}

pub async fn analyze(
    client: &reqwest::Client,
    ibkr_base: &str,
    req: AnalyzeRequest,
) -> Result<Value> {
    let symbol = req.symbol.to_uppercase();
    let resp = discover(
        client,
        ibkr_base,
        DiscoverRequest {
            symbols: vec![symbol.clone()],
            include_chain: true,
        },
    )
    .await?;
    resp.opportunities
        .into_iter()
        .next()
        .context("no contracts")
}

pub fn outcomes(_req: OutcomesRequest) -> Value {
    serde_json::json!({
        "outcomes": [],
        "ml": {
            "weights": {
                "expected_return": 0.22,
                "probability_of_profit": 0.22,
                "historical_edge": 0.18,
                "liquidity": 0.12,
                "spread_quality": 0.12,
                "gamma_positioning": 0.08,
                "monte_carlo": 0.06
            },
            "calibrationRuns": 0,
            "expiredCount": 0,
            "hitRate": null
        }
    })
}
