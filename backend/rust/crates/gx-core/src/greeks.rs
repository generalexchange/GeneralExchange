//! Direct port of `backend/python/common/greeks.py`.
//! Conventions: vega per 1% vol; theta/charm/color per calendar day.

use statrs::distribution::{Continuous, ContinuousCDF, Normal};

const YEAR: f64 = 365.0;

fn norm() -> Normal {
    Normal::new(0.0, 1.0).unwrap()
}

fn ncdf(x: f64) -> f64 {
    norm().cdf(x)
}

fn npdf(x: f64) -> f64 {
    norm().pdf(x)
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Greeks {
    pub price: f64,
    pub delta: f64,
    pub gamma: f64,
    pub theta: f64,
    pub vega: f64,
    pub rho: f64,
    #[serde(rename = "lambda")]
    pub lambda_: f64,
    pub epsilon: f64,
    pub charm: f64,
    pub vanna: f64,
    pub volga: f64,
    pub speed: f64,
    pub zomma: f64,
    pub color: f64,
}

/// Compute BSM Greeks. `opt_type`: `"CALL"` or `"PUT"` (case-insensitive).
pub fn bsm(
    spot: f64,
    strike: f64,
    t_years: f64,
    rate: f64,
    sigma: f64,
    opt_type: &str,
) -> Greeks {
    let is_call = opt_type.to_uppercase() == "CALL";

    if t_years <= 0.0 || sigma <= 0.0 {
        let intrinsic = if is_call {
            (spot - strike).max(0.0)
        } else {
            (strike - spot).max(0.0)
        };
        let delta = if is_call && spot > strike {
            1.0
        } else {
            0.0
        };
        return Greeks {
            price: intrinsic,
            delta,
            gamma: 0.0,
            theta: 0.0,
            vega: 0.0,
            rho: 0.0,
            lambda_: 0.0,
            epsilon: 0.0,
            charm: 0.0,
            vanna: 0.0,
            volga: 0.0,
            speed: 0.0,
            zomma: 0.0,
            color: 0.0,
        };
    }

    let sqrt_t = t_years.sqrt();
    let d1 =
        ((spot / strike).ln() + (rate + 0.5 * sigma * sigma) * t_years) / (sigma * sqrt_t);
    let d2 = d1 - sigma * sqrt_t;
    let disc = (-rate * t_years).exp();
    let phi = npdf(d1);

    let (price, delta, theta_yr, rho, epsilon) = if is_call {
        let nd1 = ncdf(d1);
        let nd2 = ncdf(d2);
        let p = spot * nd1 - strike * disc * nd2;
        let th = -(spot * phi * sigma) / (2.0 * sqrt_t) - rate * strike * disc * nd2;
        let r = strike * t_years * disc * nd2 / 100.0;
        let e = -spot * t_years * nd1;
        (p, nd1, th, r, e)
    } else {
        let delta = ncdf(d1) - 1.0;
        let nnd1 = ncdf(-d1);
        let nnd2 = ncdf(-d2);
        let p = strike * disc * nnd2 - spot * nnd1;
        let th = -(spot * phi * sigma) / (2.0 * sqrt_t) + rate * strike * disc * nnd2;
        let r = -strike * t_years * disc * nnd2 / 100.0;
        let e = spot * t_years * nnd1;
        (p, delta, th, r, e)
    };

    let gamma = phi / (spot * sigma * sqrt_t);
    let vega = spot * phi * sqrt_t / 100.0;
    let lambda_ = if price.abs() > 1e-12 {
        delta * (spot / price)
    } else {
        0.0
    };
    let charm_yr = -phi * ((2.0 * rate * t_years - d2 * sigma * sqrt_t)
        / (2.0 * t_years * sigma * sqrt_t));
    let color_yr = -(phi / (2.0 * spot * t_years * sigma * sqrt_t))
        * (2.0 * rate * t_years
            + 1.0
            + (d1 * (2.0 * rate * t_years - d2 * sigma * sqrt_t)) / (sigma * sqrt_t));

    Greeks {
        price,
        delta,
        gamma,
        theta: theta_yr / YEAR,
        vega,
        rho,
        lambda_,
        epsilon,
        charm: charm_yr / YEAR,
        vanna: -phi * (d2 / sigma),
        volga: vega * (d1 * d2 / sigma),
        speed: -(gamma / spot) * (d1 / (sigma * sqrt_t) + 1.0),
        zomma: gamma * ((d1 * d2 - 1.0) / sigma),
        color: color_yr / YEAR,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn atm_call_sanity() {
        let g = bsm(100.0, 100.0, 0.25, 0.05, 0.2, "CALL");
        assert!(
            (g.price - 5.1).abs() < 0.5,
            "ATM call price out of range: {}",
            g.price
        );
        assert!((g.delta - 0.5).abs() < 0.1, "ATM delta: {}", g.delta);
        assert!(g.gamma > 0.0 && g.vega > 0.0);
    }

    #[test]
    fn put_call_parity() {
        let c = bsm(100.0, 100.0, 1.0, 0.05, 0.3, "CALL");
        let p = bsm(100.0, 100.0, 1.0, 0.05, 0.3, "PUT");
        let lhs = c.price - p.price;
        let rhs = 100.0 - 100.0 * (-0.05_f64).exp();
        assert!(
            (lhs - rhs).abs() < 1e-4,
            "put-call parity violated: {lhs} vs {rhs}"
        );
    }
}
