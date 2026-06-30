use anyhow::Result;
use axum::{routing::get, Json, Router};
use gx_core::types::HealthResponse;
use std::net::SocketAddr;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    let app = Router::new()
        .route("/health", get(health))
        .route("/healthz", get(health));
    let addr = SocketAddr::from(([0, 0, 0, 0], 8094));
    tracing::warn!("quant-analytics: scaffold only — full port pending (docs/RUST_MIGRATION.md)");
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse::ok("quant-analytics"))
}
