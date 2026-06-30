//! Synthetic chain generation — port of options_chain/main.py synth helpers.

use gx_core::greeks::{self, Greeks};
use serde::Serialize;
use std::collections::{HashMap, VecDeque};
use time::{Date, OffsetDateTime, Time};

pub const RISK_FREE: f64 = 0.045;
pub const SNAPSHOT_STRIKES: i32 = 6; // range(-6, 7)

pub static BASE_PRICES: &[(&str, f64)] = &[
    ("SPY", 512.4),
    ("QQQ", 438.9),
    ("NVDA", 121.3),
    ("AAPL", 224.8),
    ("TSLA", 248.5),
    ("AMD", 158.2),
];

pub static BASE_VOL: &[(&str, f64)] = &[
    ("SPY", 0.14),
    ("QQQ", 0.18),
    ("NVDA", 0.46),
    ("AAPL", 0.22),
    ("TSLA", 0.52),
    ("AMD", 0.44),
];

pub type IvHistory = VecDeque<f64>;

#[derive(Debug, Clone, Serialize)]
pub struct ChainContract {
    pub symbol: String,
    #[serde(with = "snapshot_time_fmt")]
    pub snapshot_time: OffsetDateTime,
    #[serde(with = "date_fmt")]
    pub expiration_date: Date,
    pub strike: f64,
    pub option_type: String,
    pub bid: f64,
    pub ask: f64,
    pub mid: f64,
    pub last: f64,
    pub volume: u32,
    pub open_interest: u32,
    pub implied_volatility: f64,
    pub delta: f64,
    pub gamma: f64,
    pub theta: f64,
    pub vega: f64,
    pub rho: f64,
    #[serde(rename = "lambda")]
    pub lambda: f64,
    pub epsilon: f64,
    pub charm: f64,
    pub vanna: f64,
    pub volga: f64,
    pub speed: f64,
    pub zomma: f64,
    pub color: f64,
    pub underlying_price: f64,
    pub underlying_iv: f64,
    pub iv_rank: f64,
    pub iv_percentile: f64,
}

impl ChainContract {
    pub fn to_json(&self) -> serde_json::Value {
        serde_json::to_value(self).unwrap_or_default()
    }
}

mod snapshot_time_fmt {
    use serde::Serializer;
    use time::OffsetDateTime;

    pub fn serialize<S: Serializer>(dt: &OffsetDateTime, s: S) -> Result<S::Ok, S::Error> {
        s.serialize_str(&dt.format(&time::format_description::well_known::Rfc3339).unwrap_or_default())
    }
}

mod date_fmt {
    use serde::Serializer;
    use time::Date;

    pub fn serialize<S: Serializer>(d: &Date, s: S) -> Result<S::Ok, S::Error> {
        s.serialize_str(&format!("{d}"))
    }
}

pub fn next_expiry() -> Date {
    (OffsetDateTime::now_utc() + time::Duration::days(18)).date()
}

pub fn parse_expiry(s: Option<&str>) -> Date {
    match s {
        Some(raw) => Date::parse(raw, &time::format_description::well_known::Iso8601::DATE)
            .unwrap_or_else(|_| next_expiry()),
        None => next_expiry(),
    }
}

pub fn iv_rank_percentile(history: &mut HashMap<String, IvHistory>, symbol: &str, atm_iv: f64) -> (f64, f64) {
    let hist = history.entry(symbol.to_string()).or_insert_with(|| VecDeque::with_capacity(252));
    hist.push_back(atm_iv);
    while hist.len() > 252 {
        hist.pop_front();
    }
    if hist.len() < 2 {
        return (50.0, 50.0);
    }
    let lo = hist.iter().copied().fold(f64::INFINITY, f64::min);
    let hi = hist.iter().copied().fold(f64::NEG_INFINITY, f64::max);
    let rank = if (hi - lo).abs() < 1e-12 {
        0.0
    } else {
        (atm_iv - lo) / (hi - lo) * 100.0
    };
    let below = hist.iter().filter(|&&v| v < atm_iv).count();
    let pct = below as f64 / hist.len() as f64 * 100.0;
    ((rank * 10.0).round() / 10.0, (pct * 10.0).round() / 10.0)
}

fn greeks_to_contract_fields(g: &Greeks) -> (f64, f64, f64, f64, f64, f64, f64, f64, f64, f64, f64, f64, f64) {
    (
        (g.delta * 100000.0).round() / 100000.0,
        (g.gamma * 1000000.0).round() / 1000000.0,
        (g.theta * 100000.0).round() / 100000.0,
        (g.vega * 100000.0).round() / 100000.0,
        (g.rho * 100000.0).round() / 100000.0,
        (g.lambda_ * 10000.0).round() / 10000.0,
        (g.epsilon * 10000.0).round() / 10000.0,
        (g.charm * 1000000.0).round() / 1000000.0,
        (g.vanna * 100000.0).round() / 100000.0,
        (g.volga * 100000.0).round() / 100000.0,
        (g.speed * 10000000.0).round() / 10000000.0,
        (g.zomma * 1000000.0).round() / 1000000.0,
        (g.color * 10000000.0).round() / 10000000.0,
    )
}

pub fn synth_chain(symbol: &str, iv_history: &mut HashMap<String, IvHistory>) -> Vec<ChainContract> {
    let spot = BASE_PRICES
        .iter()
        .find(|(s, _)| *s == symbol)
        .map(|(_, p)| *p)
        .unwrap_or(100.0);
    let vol = BASE_VOL
        .iter()
        .find(|(s, _)| *s == symbol)
        .map(|(_, v)| *v)
        .unwrap_or(0.3);
    let step = if spot > 200.0 { 5.0 } else { 2.5 };
    let atm = (spot / step).round() * step;
    let expiry = next_expiry();
    let now = OffsetDateTime::now_utc();
    let expiry_dt = expiry.with_time(Time::MIDNIGHT).assume_utc();
    let days = (expiry_dt - now).whole_days().max(1) as f64;
    let t_years = days / 365.0;
    let snapshot_time = now;

    let atm_iv = vol * 100.0;
    let (iv_rank, iv_pct) = iv_rank_percentile(iv_history, symbol, atm_iv);

    let mut rows = Vec::new();
    for i in -SNAPSHOT_STRIKES..=SNAPSHOT_STRIKES {
        let strike = atm + i as f64 * step;
        let m = strike / spot;
        for opt in ["CALL", "PUT"] {
            let iv = (vol * (1.0 + (m - 1.0).abs() * 1.6
                + if opt == "PUT" { (1.0 - m) * 0.4 } else { 0.0 }))
            .max(0.05);
            let g = greeks::bsm(spot, strike, t_years, RISK_FREE, iv, opt);
            let mid = g.price.max(0.02);
            let spread = (mid * 0.02).max(0.02);
            let (delta, gamma, theta, vega, rho, lambda, epsilon, charm, vanna, volga, speed, zomma, color) =
                greeks_to_contract_fields(&g);
            rows.push(ChainContract {
                symbol: symbol.to_string(),
                snapshot_time,
                expiration_date: expiry,
                strike,
                option_type: opt.to_string(),
                bid: ((mid - spread / 2.0) * 100.0).round() / 100.0,
                ask: ((mid + spread / 2.0) * 100.0).round() / 100.0,
                mid: (mid * 100.0).round() / 100.0,
                last: (mid * 100.0).round() / 100.0,
                volume: 0,
                open_interest: 0,
                implied_volatility: (iv * 100.0 * 100.0).round() / 100.0,
                delta,
                gamma,
                theta,
                vega,
                rho,
                lambda,
                epsilon,
                charm,
                vanna,
                volga,
                speed,
                zomma,
                color,
                underlying_price: (spot * 100.0).round() / 100.0,
                underlying_iv: (atm_iv * 100.0).round() / 100.0,
                iv_rank,
                iv_percentile: iv_pct,
            });
        }
    }
    rows
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn synth_chain_produces_calls_and_puts() {
        let mut hist = HashMap::new();
        let rows = synth_chain("SPY", &mut hist);
        assert_eq!(rows.len(), 26); // 13 strikes * 2
        assert!(rows.iter().any(|r| r.option_type == "CALL"));
        assert!(rows.iter().any(|r| r.option_type == "PUT"));
        assert!(rows[0].gamma.abs() > 0.0);
    }
}
