//! Direct port of `backend/python/common/analytics.py`.

pub const TRADING_DAYS: usize = 252;

pub fn log_returns(prices: &[f64]) -> Vec<f64> {
    if prices.len() < 2 {
        return vec![0.0];
    }
    prices
        .windows(2)
        .map(|w| (w[1].max(1e-9) / w[0].max(1e-9)).ln())
        .collect()
}

pub fn realized_vol(returns: &[f64], periods_per_year: usize) -> f64 {
    if returns.len() < 2 {
        return 0.0;
    }
    let mean = returns.iter().sum::<f64>() / returns.len() as f64;
    let var = returns
        .iter()
        .map(|x| (x - mean).powi(2))
        .sum::<f64>()
        / (returns.len() - 1) as f64;
    var.sqrt() * (periods_per_year as f64).sqrt()
}

pub fn hurst_exponent(prices: &[f64]) -> f64 {
    let n = prices.len();
    if n < 20 {
        return 0.5;
    }
    let max_lag = 20.min(n / 2);
    let mut lags: Vec<f64> = Vec::new();
    let mut taus: Vec<f64> = Vec::new();
    for lag in 2..max_lag {
        let diffs: Vec<f64> = prices[lag..]
            .iter()
            .zip(&prices[..n - lag])
            .map(|(a, b)| a - b)
            .collect();
        let mean = diffs.iter().sum::<f64>() / diffs.len() as f64;
        let var = diffs.iter().map(|x| (x - mean).powi(2)).sum::<f64>() / diffs.len() as f64;
        let s = var.sqrt();
        if s > 1e-12 {
            lags.push((lag as f64).ln());
            taus.push(s.ln());
        }
    }
    if lags.len() < 3 {
        return 0.5;
    }
    linear_slope(&lags, &taus).clamp(0.0, 1.0)
}

pub fn autocorr_lag1(series: &[f64]) -> f64 {
    if series.len() < 3 {
        return 0.0;
    }
    let mean = series.iter().sum::<f64>() / series.len() as f64;
    let centered: Vec<f64> = series.iter().map(|x| x - mean).collect();
    let denom: f64 = centered.iter().map(|x| x * x).sum();
    if denom < 1e-12 {
        return 0.0;
    }
    let numer: f64 = centered[..centered.len() - 1]
        .iter()
        .zip(&centered[1..])
        .map(|(a, b)| a * b)
        .sum();
    numer / denom
}

pub fn skewness(series: &[f64]) -> f64 {
    if series.len() < 3 {
        return 0.0;
    }
    let mean = series.iter().sum::<f64>() / series.len() as f64;
    let sd = {
        let v = series.iter().map(|x| (x - mean).powi(2)).sum::<f64>() / series.len() as f64;
        v.sqrt()
    };
    if sd < 1e-12 {
        return 0.0;
    }
    series
        .iter()
        .map(|x| ((x - mean) / sd).powi(3))
        .sum::<f64>()
        / series.len() as f64
}

pub fn kurtosis(series: &[f64]) -> f64 {
    if series.len() < 4 {
        return 0.0;
    }
    let mean = series.iter().sum::<f64>() / series.len() as f64;
    let sd = {
        let v = series.iter().map(|x| (x - mean).powi(2)).sum::<f64>() / series.len() as f64;
        v.sqrt()
    };
    if sd < 1e-12 {
        return 0.0;
    }
    series
        .iter()
        .map(|x| ((x - mean) / sd).powi(4))
        .sum::<f64>()
        / series.len() as f64
        - 3.0
}

fn quantile(sorted: &[f64], q: f64) -> f64 {
    if sorted.is_empty() {
        return 0.0;
    }
    if sorted.len() == 1 {
        return sorted[0];
    }
    let pos = q * (sorted.len() - 1) as f64;
    let lo = pos.floor() as usize;
    let hi = pos.ceil() as usize;
    if lo == hi {
        sorted[lo]
    } else {
        let w = pos - lo as f64;
        sorted[lo] * (1.0 - w) + sorted[hi] * w
    }
}

/// Quantile-seeded 1-D k-means; centroids sorted ascending.
pub fn kmeans_1d(values: &[f64], k: usize, iters: usize) -> (Vec<f64>, Vec<usize>) {
    if values.is_empty() {
        return (vec![0.0; k], vec![]);
    }
    let k = k.min(values.len());
    let mut sorted = values.to_vec();
    sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let mut centroids: Vec<f64> = (0..k)
        .map(|i| {
            let q = if k == 1 {
                0.5
            } else {
                0.15 + (0.85 - 0.15) * i as f64 / (k - 1) as f64
            };
            quantile(&sorted, q)
        })
        .collect();
    let mut labels = vec![0usize; values.len()];
    for _ in 0..iters {
        for (i, &v) in values.iter().enumerate() {
            labels[i] = centroids
                .iter()
                .enumerate()
                .min_by(|(_, a), (_, b)| {
                    (v - *a)
                        .abs()
                        .partial_cmp(&(v - *b).abs())
                        .unwrap()
                })
                .map(|(i, _)| i)
                .unwrap_or(0);
        }
        let new: Vec<f64> = (0..k)
            .map(|j| {
                let members: Vec<f64> = values
                    .iter()
                    .zip(&labels)
                    .filter(|(_, &l)| l == j)
                    .map(|(v, _)| *v)
                    .collect();
                if members.is_empty() {
                    centroids[j]
                } else {
                    members.iter().sum::<f64>() / members.len() as f64
                }
            })
            .collect();
        if new
            .iter()
            .zip(&centroids)
            .all(|(a, b)| (a - b).abs() < 1e-9)
        {
            break;
        }
        centroids = new;
    }
    let mut order: Vec<usize> = (0..k).collect();
    order.sort_by(|&a, &b| centroids[a].partial_cmp(&centroids[b]).unwrap());
    let mut remap = vec![0usize; k];
    for (new, &old) in order.iter().enumerate() {
        remap[old] = new;
    }
    let sorted_centroids: Vec<f64> = order.iter().map(|&i| centroids[i]).collect();
    let remapped_labels: Vec<usize> = labels.iter().map(|&l| remap[l]).collect();
    (sorted_centroids, remapped_labels)
}

pub fn label_for(value: f64, centroids: &[f64], names: &[&str]) -> String {
    if centroids.is_empty() {
        return names[names.len() / 2].to_string();
    }
    let idx = centroids
        .iter()
        .enumerate()
        .min_by(|(_, a), (_, b)| {
            (value - *a)
                .abs()
                .partial_cmp(&(value - *b).abs())
                .unwrap()
        })
        .map(|(i, _)| i)
        .unwrap_or(0);
    names[idx.min(names.len() - 1)].to_string()
}

fn linear_slope(x: &[f64], y: &[f64]) -> f64 {
    let n = x.len() as f64;
    let sx: f64 = x.iter().sum();
    let sy: f64 = y.iter().sum();
    let sxx: f64 = x.iter().map(|v| v * v).sum();
    let sxy: f64 = x.iter().zip(y).map(|(a, b)| a * b).sum();
    (n * sxy - sx * sy) / (n * sxx - sx * sx)
}

/// Normalized trend strength from a price window (matches regime_detection classify).
pub fn trend_strength(prices: &[f64]) -> f64 {
    if prices.is_empty() {
        return 0.0;
    }
    let n = prices.len();
    let x: Vec<f64> = (0..n).map(|i| i as f64).collect();
    let slope = linear_slope(&x, prices);
    let mean = prices.iter().sum::<f64>() / n as f64;
    if mean.abs() < 1e-12 {
        0.0
    } else {
        slope * n as f64 / mean
    }
}

pub fn std_ddof1(values: &[f64]) -> f64 {
    if values.len() < 3 {
        return 0.0;
    }
    let mean = values.iter().sum::<f64>() / values.len() as f64;
    let var = values
        .iter()
        .map(|x| (x - mean).powi(2))
        .sum::<f64>()
        / (values.len() - 1) as f64;
    var.sqrt()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hurst_short_series_returns_half() {
        assert_eq!(hurst_exponent(&[100.0; 10]), 0.5);
    }

    #[test]
    fn hurst_bounded() {
        let prices: Vec<f64> = (0..100).map(|i| 100.0 + (i as f64).sin()).collect();
        let h = hurst_exponent(&prices);
        assert!((0.0..=1.0).contains(&h), "hurst {h} out of range");
    }
}
