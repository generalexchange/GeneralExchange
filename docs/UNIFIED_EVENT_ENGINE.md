# Unified Event-Driven Trade Engine

Implementation reference for **System Integration Whitepaper v1.0**.

## Architecture

```
IBKR (reqTickByTickData)
  → Python tick_ingest.py (msgpack / ZMQ PUSH :5557)
  → Rust gx-engine ingest relay (authoritative seq, NDJSON log)
  → broadcast bus
      ├─ candle aggregator (1s–1d)
      ├─ portfolio reducer
      ├─ fill engine (paper)
      └─ WebSocket fanout (:8765/ws, 16ms batching)
  → Next.js GxSocketClient → gxStore (read-only projection)
```

Python `signal_worker/worker.py` subscribes to `:5558` and pushes signals to `:5559` (wired in a future prompt).

## Quick start (local)

```powershell
# Terminal 1 — Rust engine
cd backend/rust
cargo run -p gx-engine -- --ws-port 8765 --log-dir ./data/event-logs

# Terminal 2 — IBKR tick ingest (requires Gateway on 7497/4002)
cd backend/python
py -3.11 -m services.ibkr.tick_ingest

# Terminal 3 — Legend UI
npm run dev
```

Set `NEXT_PUBLIC_GX_ENGINE_WS=ws://127.0.0.1:8765/ws` and wrap Legend with `GxEngineProvider`.

Or use `scripts/start-local-stack.ps1` which starts IBKR REST, monte-carlo, and gx-engine when built.

## Key paths

| Component | Path |
|-----------|------|
| TS event schema | `packages/event-schema/` |
| Rust core types | `backend/rust/crates/gx-core/` |
| Engine binary | `backend/rust/gx-engine/` |
| Tick ingest | `backend/python/services/ibkr/tick_ingest.py` |
| Signal worker | `backend/python/services/signal_worker/worker.py` |
| WS client | `src/lib/ws/GxSocketClient.ts` |
| Store | `src/stores/gxStore.ts` |
| Provider | `src/providers/GxEngineProvider.tsx` |

## Replay

```powershell
cargo run -p gx-engine -- --replay path/to/session.ndjson
```

## Desktop (Tauri)

The downloadable app uses Tauri (`apps/desktop/src-tauri/`). Spawn `gx-engine` from the Tauri main process with `--ipc-path` and `--ws-port 8765` (Electron spec in whitepaper §8.1 maps to Tauri child-process spawn).
