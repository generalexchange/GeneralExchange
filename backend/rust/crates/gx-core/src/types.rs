//! Shared JSON types used across services.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthResponse {
    pub ok: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub service: Option<String>,
}

impl HealthResponse {
    pub fn ok(service: &str) -> Self {
        Self {
            ok: true,
            service: Some(service.to_string()),
        }
    }
}
