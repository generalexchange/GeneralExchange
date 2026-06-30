//! Port of `backend/python/common/clickhouse.py`.

use anyhow::Result;
use clickhouse::Client;
use gx_core::config::Config;

pub fn make_client(cfg: &Config) -> Client {
    Client::default()
        .with_url(cfg.clickhouse_url())
        .with_database(&cfg.clickhouse_db)
}

pub async fn insert_rows<T: clickhouse::Row + serde::Serialize>(
    client: &Client,
    table: &str,
    rows: &[T],
) -> Result<()> {
    if rows.is_empty() {
        return Ok(());
    }
    let mut insert = client.insert(table)?;
    for row in rows {
        insert.write(row).await?;
    }
    insert.end().await?;
    Ok(())
}
