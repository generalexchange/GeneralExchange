mod opportunity;

use anyhow::Result;
use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    routing::{get, post},
    Json, Router,
};
use gx_core::types::HealthResponse;
use opportunity::{AnalyzeRequest, DiscoverRequest, OutcomesRequest};
use serde_json::Value;
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

#[derive(Clone)]
struct AppState {
    ibkr_base: String,
    api_key: String,
    http: reqwest::Client,
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    let ibkr_base = std::env::var("IBKR_API_URL")
        .unwrap_or_else(|_| "http://127.0.0.1:8093".into())
        .trim_end_matches('/')
        .to_string();
    let api_key = std::env::var("MC_API_KEY")
        .or_else(|_| std::env::var("GE_API_KEY"))
        .unwrap_or_default();
    let port: u16 = std::env::var("MC_PORT")
        .or_else(|_| std::env::var("PORT"))
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8092);

    let state = Arc::new(AppState {
        ibkr_base,
        api_key,
        http: reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(90))
            .build()?,
    });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(health))
        .route("/healthz", get(health))
        .route("/v1/{*route}", post(v1_post))
        .layer(cors)
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("monte-carlo (rust) listening on {addr}");
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse::ok("monte-carlo"))
}

fn check_auth(state: &AppState, headers: &HeaderMap) -> Result<(), StatusCode> {
    if state.api_key.is_empty() {
        return Ok(());
    }
    let key = headers
        .get("x-api-key")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");
    if key == state.api_key {
        Ok(())
    } else {
        Err(StatusCode::UNAUTHORIZED)
    }
}

async fn v1_post(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Path(route): Path<String>,
    Json(body): Json<Value>,
) -> Result<Json<Value>, StatusCode> {
    check_auth(&state, &headers)?;

    let route = route.trim_end_matches('/');
    match route {
        "opportunity/discover" => {
            let req: DiscoverRequest = serde_json::from_value(body).unwrap_or(DiscoverRequest {
                symbols: vec![],
                include_chain: false,
            });
            let resp = opportunity::discover(&state.http, &state.ibkr_base, req)
                .await
                .map_err(|e| {
                    tracing::warn!("discover failed: {e}");
                    StatusCode::BAD_GATEWAY
                })?;
            Ok(Json(serde_json::to_value(resp).unwrap()))
        }
        "opportunity/analyze" => {
            let req: AnalyzeRequest = serde_json::from_value(body).map_err(|_| StatusCode::BAD_REQUEST)?;
            let top = opportunity::analyze(&state.http, &state.ibkr_base, req)
                .await
                .map_err(|_| StatusCode::NOT_FOUND)?;
            Ok(Json(top))
        }
        "opportunity/outcomes" => {
            let req: OutcomesRequest = serde_json::from_value(body).unwrap_or(OutcomesRequest {
                limit: 40,
                symbol: "SPY".into(),
            });
            Ok(Json(opportunity::outcomes(req)))
        }
        _ => Err(StatusCode::NOT_FOUND),
    }
}
