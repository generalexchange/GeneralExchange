//! The complete set of Tauri commands invoked from the React layer.
//!
//! These are intentionally thin. The desktop shell stores the auth token,
//! reports its own version, and orchestrates the updater. It contains no
//! trading logic, no pricing, and no market-data handling — all of that lives
//! in TypeScript and the general.exchange backend.

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use tauri_plugin_updater::UpdaterExt;

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct StoredAuth {
    pub token: String,
    #[serde(default)]
    pub refresh_token: String,
}

/// Resolve the encrypted-at-rest auth file inside the OS app-data directory.
fn auth_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| format!("no app data dir: {e}"))?;
    fs::create_dir_all(&dir).map_err(|e| format!("create data dir: {e}"))?;
    Ok(dir.join("auth.json"))
}

/// Read the stored JWT (and refresh token) on startup. Returns `None` when no
/// session has been persisted yet.
#[tauri::command]
pub fn get_auth_token(app: AppHandle) -> Result<Option<StoredAuth>, String> {
    let path = auth_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    let raw = fs::read_to_string(&path).map_err(|e| format!("read auth: {e}"))?;
    let parsed = serde_json::from_str::<StoredAuth>(&raw).map_err(|e| format!("parse auth: {e}"))?;
    Ok(Some(parsed))
}

/// Persist the JWT and refresh token after a successful login.
#[tauri::command]
pub fn set_auth_token(app: AppHandle, token: String, refresh_token: String) -> Result<(), String> {
    let path = auth_path(&app)?;
    let payload = StoredAuth { token, refresh_token };
    let raw = serde_json::to_string(&payload).map_err(|e| format!("serialize auth: {e}"))?;
    fs::write(&path, raw).map_err(|e| format!("write auth: {e}"))?;
    Ok(())
}

/// Remove the stored session on logout.
#[tauri::command]
pub fn clear_auth_token(app: AppHandle) -> Result<(), String> {
    let path = auth_path(&app)?;
    if path.exists() {
        fs::remove_file(&path).map_err(|e| format!("remove auth: {e}"))?;
    }
    Ok(())
}

/// Return the current application version string.
#[tauri::command]
pub fn get_app_version(app: AppHandle) -> String {
    app.package_info().version.to_string()
}

#[derive(Debug, Serialize)]
pub struct UpdateStatus {
    pub available: bool,
    pub version: Option<String>,
    pub error: Option<String>,
}

/// Trigger the Tauri updater check. Never throws to the frontend; instead it
/// returns a status struct so the UI can decide whether to show the update
/// banner.
#[tauri::command]
pub async fn check_for_update(app: AppHandle) -> UpdateStatus {
    let updater = match app.updater() {
        Ok(u) => u,
        Err(e) => {
            return UpdateStatus { available: false, version: None, error: Some(e.to_string()) }
        }
    };
    match updater.check().await {
        Ok(Some(update)) => UpdateStatus {
            available: true,
            version: Some(update.version.clone()),
            error: None,
        },
        Ok(None) => UpdateStatus { available: false, version: None, error: None },
        Err(e) => UpdateStatus { available: false, version: None, error: Some(e.to_string()) },
    }
}
