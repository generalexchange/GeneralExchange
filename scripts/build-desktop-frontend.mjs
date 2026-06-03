#!/usr/bin/env node
/**
 * Builds the full general.exchange UI as a static bundle for the desktop app.
 *
 * The desktop installer ships this `out/` directory inside the binary (no Node
 * server at runtime, exactly like Cursor). The bundled UI calls the live
 * general.exchange services over the network for data.
 *
 * Server-only Route Handlers under `src/app/api/**` cannot be part of a static
 * export (`output: 'export'`) — a dynamic-segment route handler such as
 * `[...path]` is rejected outright. For the duration of the export build we
 * remove those route files and always restore them afterward (even on
 * failure). Only file contents are touched (no directory renames), which is
 * safe on Windows/OneDrive. The regular web/Vercel build is never affected.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

/** Server-only route handlers to remove for the static export. */
const ROUTE_FILES = [
  join(repoRoot, 'src', 'app', 'api', 'v1', '[...path]', 'route.ts'),
  join(repoRoot, 'src', 'app', 'api', 'desktop-release', 'route.ts'),
];

const saved = [];
try {
  console.log('[desktop] Removing server-only API routes for static export…');
  for (const file of ROUTE_FILES) {
    if (!existsSync(file)) continue;
    saved.push({ file, content: readFileSync(file, 'utf8') });
    rmSync(file, { force: true });
  }

  console.log('[desktop] Building static UI bundle (next build → out/)…');
  execSync('npx next build', {
    cwd: repoRoot,
    stdio: 'inherit',
    env: { ...process.env, DESKTOP_BUILD: '1' },
  });

  console.log('[desktop] Static bundle ready at out/.');
} finally {
  for (const { file, content } of saved) {
    writeFileSync(file, content, 'utf8');
  }
  if (saved.length) console.log('[desktop] Restored original API routes.');
}
