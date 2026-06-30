#!/usr/bin/env node
/**
 * Builds the full general.exchange UI as a static bundle for the desktop app.
 *
 * The desktop installer ships this `out/` directory inside the binary (no Node
 * server at runtime). The bundled UI talks to IBKR + Monte Carlo on 127.0.0.1.
 *
 * Server-only Route Handlers under `src/app/api/**` cannot be part of a static
 * export (`output: 'export'`) — a dynamic-segment route handler such as
 * `[...path]` is rejected outright. For the duration of the export build we
 * remove those route files and always restore them afterward (even on
 * failure). Only file contents are touched (no directory renames), which is
 * safe on Windows/OneDrive. The regular web/Vercel build is never affected.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

/** Recursively collect every `route.ts` under src/app/api (incompatible with static export). */
function collectApiRouteFiles(dir) {
  const routes = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, ent.name);
    if (ent.isDirectory()) routes.push(...collectApiRouteFiles(full));
    else if (ent.name === 'route.ts') routes.push(full);
  }
  return routes;
}

const apiRoot = join(repoRoot, 'src', 'app', 'api');
const ROUTE_FILES = existsSync(apiRoot) ? collectApiRouteFiles(apiRoot) : [];

const saved = [];
try {
  console.log('[desktop] Removing server-only API routes for static export…');
  for (const file of ROUTE_FILES) {
    if (!existsSync(file)) continue;
    saved.push({ file, content: readFileSync(file, 'utf8') });
    rmSync(file, { force: true });
  }

  console.log('[desktop] Building static UI bundle (next build → out/)…');
  const tauriConfPath = join(repoRoot, 'apps', 'desktop', 'src-tauri', 'tauri.conf.json');
  const tauriVersion = existsSync(tauriConfPath)
    ? JSON.parse(readFileSync(tauriConfPath, 'utf8')).version
    : '0.2.0';

  execSync('npx next build', {
    cwd: repoRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      DESKTOP_BUILD: '1',
      NEXT_PUBLIC_DESKTOP_LOCAL: '1',
      NEXT_PUBLIC_IBKR_API_URL: process.env.NEXT_PUBLIC_IBKR_API_URL ?? 'http://127.0.0.1:8093',
      NEXT_PUBLIC_IBKR_API_KEY: process.env.NEXT_PUBLIC_IBKR_API_KEY ?? process.env.IBKR_API_KEY ?? 'gx_ibkr_dev_key',
      NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL ?? 'ws://127.0.0.1:8093/ws/market',
      NEXT_PUBLIC_MONTE_CARLO_API_URL: process.env.NEXT_PUBLIC_MONTE_CARLO_API_URL ?? 'http://127.0.0.1:8092',
      NEXT_PUBLIC_DESKTOP_APP_VERSION: tauriVersion,
    },
  });

  console.log('[desktop] Static bundle ready at out/.');
} finally {
  for (const { file, content } of saved) {
    writeFileSync(file, content, 'utf8');
  }
  if (saved.length) console.log('[desktop] Restored original API routes.');
}
