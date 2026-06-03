# General Exchange — Desktop Terminal

A downloadable trading terminal for general.exchange, built with Tauri + React +
TypeScript. It is a pure frontend client: every number it shows and every order
it submits is computed/executed by the general.exchange backend.

## Stack

- **Shell:** Tauri 2 (Rust) — window, system tray, secure token storage
  (stronghold), auto-update (updater), window-state persistence.
- **Frontend:** React 18 SPA + Vite + TypeScript.
- **State:** Zustand (auth, ui, market, portfolio, signal, regime).
- **Charts:** Apache ECharts (`echarts-for-react`) — same theme as the web app.
- **Grids:** AG Grid Community (`ag-grid-react`) — same theme/renderers.
- **Onboarding:** Shepherd.js (5-step tour).
- **Styling:** Tailwind CSS (shared design tokens).

## Prerequisites

- Node.js 20+
- Rust (stable) + platform build tools:
  - **Windows:** Visual Studio Build Tools (Desktop C++), WebView2 runtime.
  - **macOS:** Xcode command line tools.
  - **Linux:** `libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`.

## Develop

```bash
cd apps/desktop
npm install
npm run typecheck     # frontend type safety (no Rust needed)
npm run tauri:dev     # launches the Tauri window with Vite HMR
```

## Build installers

```bash
npm run tauri:build               # current platform
npm run tauri:build -- --target universal-apple-darwin   # macOS universal DMG
```

Outputs land in `src-tauri/target/release/bundle/`.

## Configuration

- `src-tauri/tauri.conf.json` — window, CSP (only `api.general.exchange` and
  `ws.general.exchange` are reachable), bundle, and updater config.
- Replace `plugins.updater.pubkey` with your real Tauri updater public key
  (`npm run tauri signer generate`).
- `src/lib/constants.ts` — API/WS endpoints and defaults.

## Release / CI

`.github/workflows/desktop-release.yml` builds macOS (universal DMG), Windows
(NSIS + MSI), and Linux (AppImage + .deb) in parallel and publishes a draft
GitHub Release on tagged pushes (`v*`). Code-signing and updater-signing keys
are supplied via repository secrets (see the workflow `env` block).
