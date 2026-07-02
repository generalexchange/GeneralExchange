//! Spawn the bundled gx-engine child process for the desktop shell.

use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;

static ENGINE_CHILD: Mutex<Option<Child>> = Mutex::new(None);

fn gx_engine_candidates() -> Vec<PathBuf> {
    let mut out = Vec::new();
    let name = if cfg!(windows) { "gx-engine.exe" } else { "gx-engine" };

    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            out.push(dir.join("bin").join(name));
            out.push(dir.join(name));
        }
    }

    if let Ok(cwd) = std::env::current_dir() {
        out.push(cwd.join("bin").join(name));
        out.push(cwd.join("../../../backend/rust/target/release").join(name));
        out.push(cwd.join("../../../backend/rust/target/debug").join(name));
        out.push(cwd.join("../../backend/rust/target/release").join(name));
        out.push(cwd.join("../../backend/rust/target/debug").join(name));
    }

    out
}

fn find_gx_engine() -> Option<PathBuf> {
    gx_engine_candidates()
        .into_iter()
        .find(|p| p.is_file())
}

pub fn start_gx_engine(log_dir: &Path) -> bool {
    let Some(exe) = find_gx_engine() else {
        eprintln!("[gx-engine] binary not found — build with: cargo build -p gx-engine --release");
        return false;
    };

    let _ = std::fs::create_dir_all(log_dir);

    let mut cmd = Command::new(&exe);
    cmd.args([
        "--ws-port",
        "8765",
        "--zmq-pull",
        "tcp://127.0.0.1:5557",
        "--log-dir",
        log_dir.to_str().unwrap_or("./event-logs"),
        "--thread-count",
        "4",
    ])
    .stdin(Stdio::null())
    .stdout(Stdio::piped())
    .stderr(Stdio::piped());

    match cmd.spawn() {
        Ok(child) => {
            eprintln!("[gx-engine] started {}", exe.display());
            if let Ok(mut guard) = ENGINE_CHILD.lock() {
                *guard = Some(child);
            }
            true
        }
        Err(e) => {
            eprintln!("[gx-engine] spawn failed: {e}");
            false
        }
    }
}

pub fn stop_gx_engine() {
    if let Ok(mut guard) = ENGINE_CHILD.lock() {
        if let Some(mut child) = guard.take() {
            let _ = child.kill();
        }
    }
}
