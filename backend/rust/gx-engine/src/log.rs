//! Append-only NDJSON event log.

use anyhow::Result;
use gx_core::events::MarketDataEvent;
use std::fs::{File, OpenOptions};
use std::io::{BufWriter, Write};
use std::path::PathBuf;
use std::sync::Mutex;

pub struct EventLog {
    writer: Mutex<BufWriter<File>>,
    path: PathBuf,
}

impl EventLog {
    pub fn open(log_dir: &str, session_id: &str) -> Result<Self> {
        std::fs::create_dir_all(log_dir)?;
        let path = PathBuf::from(log_dir).join(format!("{session_id}.ndjson"));
        let file = OpenOptions::new().create(true).append(true).open(&path)?;
        Ok(Self {
            writer: Mutex::new(BufWriter::new(file)),
            path,
        })
    }

    pub fn path(&self) -> &PathBuf {
        &self.path
    }

    pub fn append_market(&self, event: &MarketDataEvent) -> Result<()> {
        let line = serde_json::to_string(event)?;
        let mut w = self.writer.lock().map_err(|e| anyhow::anyhow!("{e}"))?;
        writeln!(w, "{line}")?;
        w.flush()?;
        Ok(())
    }

    pub fn append_raw(&self, value: &serde_json::Value) -> Result<()> {
        let line = serde_json::to_string(value)?;
        let mut w = self.writer.lock().map_err(|e| anyhow::anyhow!("{e}"))?;
        writeln!(w, "{line}")?;
        w.flush()?;
        Ok(())
    }
}
