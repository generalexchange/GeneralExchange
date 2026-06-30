use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    tracing::warn!("data-quality: scaffold only — Kafka worker port pending (docs/RUST_MIGRATION.md)");
    tokio::signal::ctrl_c().await?;
    Ok(())
}
