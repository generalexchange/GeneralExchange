//! Port of `backend/python/common/redis_client.py`.

use anyhow::Result;
use gx_core::config::Config;
use redis::aio::ConnectionManager;
use redis::AsyncCommands;

pub async fn make_connection(cfg: &Config) -> Result<ConnectionManager> {
    let client = redis::Client::open(cfg.redis_url.as_str())?;
    Ok(ConnectionManager::new(client).await?)
}

pub async fn set_json(
    conn: &mut ConnectionManager,
    key: &str,
    value: &impl serde::Serialize,
    ttl_secs: Option<u64>,
) -> Result<()> {
    let payload = serde_json::to_string(value)?;
    if let Some(ttl) = ttl_secs {
        conn.set_ex::<_, _, ()>(key, payload, ttl).await?;
    } else {
        conn.set::<_, _, ()>(key, payload).await?;
    }
    Ok(())
}

pub async fn get_json<T: for<'de> serde::Deserialize<'de>>(
    conn: &mut ConnectionManager,
    key: &str,
) -> Result<Option<T>> {
    let raw: Option<String> = conn.get(key).await?;
    match raw {
        Some(s) => Ok(Some(serde_json::from_str(&s)?)),
        None => Ok(None),
    }
}
