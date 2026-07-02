// Prevents an extra console window on Windows in release.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod engine;

use engine::start_gx_engine;

use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, WindowEvent,
};

/// Argon2 password-hashing function used by the stronghold plugin to derive the
/// vault key. The salt is fixed for the application; the user password (or a
/// device-derived secret) supplies the entropy.
fn stronghold_hash(password: &str) -> Vec<u8> {
    use argon2::{hash_raw, Config, Variant, Version};
    let config = Config {
        lanes: 2,
        mem_cost: 10_000,
        time_cost: 2,
        variant: Variant::Argon2id,
        version: Version::Version13,
        ..Default::default()
    };
    let salt = b"general-exchange-terminal";
    hash_raw(password.as_bytes(), salt, &config).expect("argon2 hashing failed")
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_stronghold::Builder::new(stronghold_hash).build())
        .invoke_handler(tauri::generate_handler![
            commands::get_auth_token,
            commands::set_auth_token,
            commands::clear_auth_token,
            commands::get_app_version,
            commands::check_for_update,
        ])
        .setup(|app| {
            if let Ok(dir) = app.path().app_local_data_dir() {
                let log_dir = dir.join("event-logs");
                start_gx_engine(&log_dir);
            }

            let show = MenuItemBuilder::with_id("show", "Show Terminal").build(app)?;
            let status = MenuItemBuilder::with_id("status", "Connection: starting…")
                .enabled(false)
                .build(app)?;
            let updates = MenuItemBuilder::with_id("updates", "Check for Updates").build(app)?;
            let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
            let separator = PredefinedMenuItem::separator(app)?;

            let menu = MenuBuilder::new(app)
                .items(&[&show, &status, &separator, &updates, &quit])
                .build()?;

            TrayIconBuilder::with_id("main")
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("general.exchange")
                .on_menu_event(move |app, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.unminimize();
                            let _ = window.set_focus();
                        }
                    }
                    "updates" => {
                        let _ = app.emit("tray://check-for-updates", ());
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { .. } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.unminimize();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            // Reveal the main window and dismiss the branded splash once the
            // bundled UI has had a moment to boot. The splash window shows
            // immediately on launch; the main window starts hidden.
            let handle = app.handle().clone();
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_millis(1600));
                if let Some(main) = handle.get_webview_window("main") {
                    let _ = main.show();
                    let _ = main.set_focus();
                }
                if let Some(splash) = handle.get_webview_window("splashscreen") {
                    let _ = splash.close();
                }
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            // Closing the main window minimizes to the tray rather than quitting.
            if let WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    let _ = window.hide();
                    api.prevent_close();
                }
            }
        })
        .build(tauri::generate_context!())
        .expect("error while running General Exchange Terminal")
        .run(|app, event| {
            if let tauri::RunEvent::Exit = event {
                engine::stop_gx_engine();
            }
            let _ = app;
        });
}
