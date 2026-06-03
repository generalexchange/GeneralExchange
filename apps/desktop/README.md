# general.exchange — Desktop App

A cross-platform native desktop build of general.exchange, packaged with
**Tauri 2** (Rust shell) + **React 18** + **TypeScript** + **Vite**. It preserves
the existing UI, routing, and business logic and runs as a native Windows / macOS
/ Linux application — no browser required.

- **Product name:** `general.exchange`
- **Window title:** `general.exchange`
- **Bundle identifier:** `exchange.general.terminal`

## Stack

- **Shell:** Tauri 2 (Rust) — window, system tray, splash screen, secure token
  storage (stronghold), auto-update (updater), window-state persistence.
- **Frontend:** React 18 SPA + Vite + TypeScript.
- **State:** Zustand. **Charts:** ECharts. **Grids:** AG Grid. **Onboarding:** Shepherd.js.
- **Styling:** Tailwind CSS.

## Prerequisites

- Node.js 20+
- Rust (stable) + platform build tools:
  - **Windows:** Visual Studio Build Tools (Desktop C++), WebView2 runtime.
  - **macOS:** Xcode command line tools.
  - **Linux:** `libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`.

---

## Development builds

```bash
cd apps/desktop
npm install
npm run typecheck     # frontend type safety (no Rust needed)
npm run tauri:dev     # launches the native window with Vite HMR
```

`tauri:dev` runs an unoptimized debug build with hot reload and devtools — use it
while iterating.

---

## Production builds

```bash
cd apps/desktop

# Build for the machine you're on:
npm run tauri build          # alias: npm run tauri:build

# Or target a specific platform (must run on that OS):
npm run build:windows        # tauri build --target x86_64-pc-windows-msvc
npm run build:macos          # tauri build --target universal-apple-darwin (Intel + Apple Silicon)
npm run build:linux          # tauri build --target x86_64-unknown-linux-gnu

# Debug-symbol production build (for troubleshooting):
npm run tauri:build:debug
```

> Tauri builds the installer for the **host OS only**. Windows installers must be
> built on Windows, macOS installers on macOS. Cross-OS builds are handled by CI
> (see below).

### Where the installers are generated

All artifacts land under `apps/desktop/src-tauri/target/<target>/release/bundle/`.
For a host-platform build the path is `.../target/release/bundle/`.

| Platform | Installer | Location |
| --- | --- | --- |
| **Windows** | `.exe` (NSIS) | `…/release/bundle/nsis/general.exchange_<version>_x64-setup.exe` |
| **Windows** | `.msi` (WiX)  | `…/release/bundle/msi/general.exchange_<version>_x64_en-US.msi` |
| **macOS**   | `.dmg`        | `…/release/bundle/dmg/general.exchange_<version>_universal.dmg` |
| **macOS**   | `.app` bundle | `…/release/bundle/macos/general.exchange.app` |
| **Linux**   | `.AppImage`   | `…/release/bundle/appimage/general.exchange_<version>_amd64.AppImage` |
| **Linux**   | `.deb`/`.rpm` | `…/release/bundle/deb/` and `…/release/bundle/rpm/` |

---

## Versioning

The app version is defined in two places (keep them in sync):

- `apps/desktop/src-tauri/tauri.conf.json` → `version`
- `apps/desktop/package.json` → `version`

To cut a release, bump both, commit, then push a matching `v*` git tag:

```bash
git commit -am "Desktop v0.1.3"
git tag v0.1.3
git push origin main --tags
```

---

## CI/CD (GitHub Actions)

Workflow: `.github/workflows/desktop-release.yml`

**Triggers**
- Git tags `v*` → build all platforms + create a **draft GitHub Release**.
- Published GitHub Releases → build + attach assets.
- Manual **workflow_dispatch** → build + upload artifacts only.
- Pushes to `main` touching `apps/desktop/**` → build + artifacts (CI check).

**Outputs**
- **GitHub Actions artifacts:** every run uploads the installers under the
  artifact names `windows-installers`, `macos-installers`, `linux-installers`
  (Actions run → Artifacts).
- **GitHub Release assets:** on a tag/release, installers are attached to a draft
  release with stable names (`General-Exchange_x64-setup.exe`,
  `General-Exchange_universal.dmg`, etc.).

### Cutting a release

1. Bump the version in both files (above) and push a `v*` tag.
2. Wait for the three build jobs to go green (~15–20 min first run; cached after).
3. Open **GitHub → Releases**, find the draft `general.exchange vX.Y.Z`, and click
   **Publish release**.
4. The website download page (`/download`) points at
   `releases/latest/download/...`, so it automatically serves the newest published
   release — no code change needed per version.

---

## Code signing (prepared, not yet enabled)

Builds currently ship **unsigned** (macOS uses an ad-hoc identity `"-"`). Users
can still install: Windows → "More info → Run anyway"; macOS → right-click → Open.
Everything below is wired so signing can be switched on later with **zero code
changes** — only certificates + secrets.

### Windows Authenticode

1. Obtain a code-signing certificate (standard or EV).
2. Configure signing in `src-tauri/tauri.conf.json` under `bundle.windows`:
   ```jsonc
   "windows": {
     "certificateThumbprint": "<THUMBPRINT>",
     "digestAlgorithm": "sha256",
     "timestampUrl": "http://timestamp.digicert.com"
   }
   ```
   (or set a custom `signCommand` to sign via an HSM / cloud signer).
3. For CI, store the cert/secret and reference it in the workflow `env` block
   (the placeholders are already documented there).

### macOS signing + notarization

1. Join the Apple Developer Program ($99/yr).
2. In `src-tauri/tauri.conf.json`, replace `bundle.macOS.signingIdentity` (`"-"`)
   with your Developer ID, e.g. `"Developer ID Application: Your Co (TEAMID)"`.
3. Add these repository secrets (Settings → Secrets and variables → Actions) and
   uncomment the matching lines in the workflow `env` block:
   - `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`
   - `APPLE_SIGNING_IDENTITY`
   - `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID` (enables notarization)

### Auto-update signing (optional)

Replace `plugins.updater.pubkey` in `tauri.conf.json` with a real key
(`npm run tauri signer generate`) and provide `TAURI_SIGNING_PRIVATE_KEY` +
`TAURI_SIGNING_PRIVATE_KEY_PASSWORD` as secrets.

**Exact locations for certificates/secrets**
- Signing config: `apps/desktop/src-tauri/tauri.conf.json` → `bundle.windows` / `bundle.macOS`.
- CI secrets: GitHub repo → Settings → Secrets and variables → Actions.
- CI wiring: the `env:` block of the "Build & release with Tauri" step in
  `.github/workflows/desktop-release.yml` (placeholders already present).

---

## Configuration

- `src-tauri/tauri.conf.json` — product name, window, splash screen, CSP (only
  `api.general.exchange` / `ws.general.exchange` are reachable), bundle targets,
  and updater config.
- `src/lib/constants.ts` — API/WS endpoints and defaults.
- `public/splash.html` + `public/splash.png` — the launch splash screen.
