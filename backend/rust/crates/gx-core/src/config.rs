//! Direct port of `backend/python/common/config.py`.

use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub redpanda_brokers: String,
    pub clickhouse_host: String,
    pub clickhouse_http_port: u16,
    pub clickhouse_db: String,
    pub redis_url: String,
    pub minio_endpoint: String,
    pub minio_access_key: String,
    pub minio_secret_key: String,
    pub ibkr_api_url: String,
    pub ibkr_api_key: String,
    pub floppydisk_url: String,
    pub floppydisk_api_key: String,
    pub openobserve_url: String,
    pub polygon_api_key: String,
    pub symbols: Vec<String>,
}

impl Config {
    pub fn load() -> Self {
        let _ = dotenvy::dotenv();
        Config {
            redpanda_brokers: env_str("REDPANDA_BROKERS", "localhost:19092"),
            clickhouse_host: env_str("CLICKHOUSE_HOST", "localhost"),
            clickhouse_http_port: env_u16("CLICKHOUSE_HTTP_PORT", 8123),
            clickhouse_db: env_str("CLICKHOUSE_DB", "general_exchange"),
            redis_url: env_str("REDIS_URL", "redis://localhost:6379/0"),
            minio_endpoint: env_str("MINIO_ENDPOINT", "localhost:9002"),
            minio_access_key: env_str("MINIO_ACCESS_KEY", "minioadmin"),
            minio_secret_key: env_str("MINIO_SECRET_KEY", "minioadmin"),
            ibkr_api_url: env_str("IBKR_API_URL", "http://localhost:8093"),
            ibkr_api_key: env_str("IBKR_API_KEY", ""),
            floppydisk_url: env_str("FLOPPYDISK_URL", ""),
            floppydisk_api_key: env_str("FLOPPYDISK_API_KEY", ""),
            openobserve_url: env_str("OPENOBSERVE_URL", ""),
            polygon_api_key: env_str("POLYGON_API_KEY", ""),
            symbols: env_symbols(),
        }
    }

    pub fn has_ibkr(&self) -> bool {
        !self.ibkr_api_url.is_empty()
    }

    pub fn has_floppydisk(&self) -> bool {
        !self.floppydisk_url.is_empty()
    }

    pub fn has_polygon(&self) -> bool {
        !self.polygon_api_key.is_empty()
    }

    pub fn clickhouse_url(&self) -> String {
        format!("http://{}:{}", self.clickhouse_host, self.clickhouse_http_port)
    }
}

fn env_str(key: &str, default: &str) -> String {
    env::var(key).unwrap_or_else(|_| default.to_string())
}

fn env_u16(key: &str, default: u16) -> u16 {
    env::var(key)
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(default)
}

fn env_symbols() -> Vec<String> {
    env_str("SYMBOLS", "SPY,QQQ,NVDA,AAPL,TSLA,AMD")
        .split(',')
        .map(|s| s.trim().to_uppercase())
        .filter(|s| !s.is_empty())
        .collect()
}
