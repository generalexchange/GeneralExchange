//! Monte Carlo risk paths — Whitepaper §10.2.

use rand::rngs::SmallRng;
use rand::{Rng, SeedableRng};
use rand_distr::{Distribution, Normal};
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RiskStats {
    pub drawdown_p5: f64,
    pub drawdown_p50: f64,
    pub drawdown_p95: f64,
    pub var_95: f64,
    pub cvar_95: f64,
}

pub struct MonteCarlo {
    pub n_paths: usize,
    pub n_steps: usize,
    pub dt: f64,
    pub mu: f64,
    pub sigma: f64,
    pub initial_price: f64,
}

impl MonteCarlo {
    pub fn run(&self) -> Vec<Vec<f64>> {
        let normal = Normal::new(0.0f64, 1.0).unwrap();
        let mut rng = SmallRng::from_entropy();

        (0..self.n_paths)
            .map(|_| {
                let mut path = Vec::with_capacity(self.n_steps + 1);
                let mut price = self.initial_price;
                path.push(price);

                for _ in 0..self.n_steps {
                    let z: f64 = normal.sample(&mut rng);
                    price *= ((self.mu - 0.5 * self.sigma * self.sigma) * self.dt
                        + self.sigma * self.dt.sqrt() * z)
                        .exp();
                    path.push(price);
                }
                path
            })
            .collect()
    }

    pub fn compute_stats(paths: &[Vec<f64>]) -> RiskStats {
        let mut drawdowns: Vec<f64> = Vec::with_capacity(paths.len());
        let mut final_returns: Vec<f64> = Vec::with_capacity(paths.len());

        for path in paths {
            let initial = path[0];
            let final_price = *path.last().unwrap_or(&initial);
            final_returns.push((final_price - initial) / initial);

            let mut peak = initial;
            let mut max_dd = 0.0f64;
            for &p in path {
                if p > peak {
                    peak = p;
                }
                let dd = if peak > 0.0 { (peak - p) / peak } else { 0.0 };
                if dd > max_dd {
                    max_dd = dd;
                }
            }
            drawdowns.push(max_dd);
        }

        drawdowns.sort_by(|a, b| a.partial_cmp(b).unwrap());
        final_returns.sort_by(|a, b| a.partial_cmp(b).unwrap());

        let n = drawdowns.len().max(1) as f64;
        let p5_idx = ((n * 0.05) as usize).min(drawdowns.len().saturating_sub(1));
        let p50_idx = ((n * 0.50) as usize).min(drawdowns.len().saturating_sub(1));
        let p95_idx = ((n * 0.95) as usize).min(drawdowns.len().saturating_sub(1));
        let var_95_idx = ((n * 0.05) as usize).min(final_returns.len().saturating_sub(1));

        let cvar_95: f64 = if var_95_idx > 0 {
            final_returns[..var_95_idx].iter().sum::<f64>() / var_95_idx as f64
        } else {
            final_returns.first().copied().unwrap_or(0.0)
        };

        RiskStats {
            drawdown_p5: drawdowns.get(p5_idx).copied().unwrap_or(0.0),
            drawdown_p50: drawdowns.get(p50_idx).copied().unwrap_or(0.0),
            drawdown_p95: drawdowns.get(p95_idx).copied().unwrap_or(0.0),
            var_95: final_returns.get(var_95_idx).copied().unwrap_or(0.0),
            cvar_95,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn monte_carlo_runs_paths() {
        let mc = MonteCarlo {
            n_paths: 10,
            n_steps: 5,
            dt: 1.0 / 252.0,
            mu: 0.08,
            sigma: 0.2,
            initial_price: 100.0,
        };
        let paths = mc.run();
        assert_eq!(paths.len(), 10);
        assert_eq!(paths[0].len(), 6);
    }
}
