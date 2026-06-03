#!/usr/bin/env node
/**
 * Push production env vars to Vercel using the REST API.
 *
 * Usage:
 *   1. Create a token at https://vercel.com/account/tokens
 *   2. $env:VERCEL_TOKEN = "..."   (PowerShell)  or  export VERCEL_TOKEN=...
 *   3. node scripts/push-vercel-env.mjs
 *
 * Reads values from the repo-root .env file (never committed).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envPath = resolve(root, '.env');

const VERCEL_KEYS = [
  'GO_API_URL',
  'GE_API_KEY',
  'JWT_SIGNING_SECRET',
  'SITE_URL',
  'NEXT_PUBLIC_ROOT_DOMAIN',
  'NEXT_PUBLIC_WS_URL',
  'WS_PORT',
  'GOOGLE_SITE_VERIFICATION',
  'POLYGON_API_KEY',
];

function parseEnv(text) {
  const out = {};
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

async function vercelFetch(path, opts = {}) {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error('VERCEL_TOKEN is not set');
  const res = await fetch(`https://api.vercel.com${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Vercel API ${res.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function main() {
  if (!existsSync(envPath)) {
    console.error('Missing .env — run scripts/setup-local-stack.ps1 first.');
    process.exit(1);
  }

  const local = parseEnv(readFileSync(envPath, 'utf8'));
  const teamId = process.env.VERCEL_TEAM_ID;
  const teamQ = teamId ? `?teamId=${teamId}` : '';

  const projects = await vercelFetch(`/v9/projects${teamQ}`);
  const project =
    projects.projects?.find((p) =>
      ['general-exchange', 'generalexchange', 'general-exchange-4'].includes(p.name?.toLowerCase()),
    ) ?? projects.projects?.[0];

  if (!project) {
    throw new Error('No Vercel project found for this account');
  }

  console.log(`Project: ${project.name} (${project.id})`);

  const existing = await vercelFetch(`/v9/projects/${project.id}/env${teamQ}`);
  const byKey = new Map((existing.envs ?? []).map((e) => [e.key, e]));

  for (const key of VERCEL_KEYS) {
    const value = local[key];
    if (!value) {
      console.log(`  skip ${key} (empty in .env)`);
      continue;
    }

    const prev = byKey.get(key);
    if (prev) {
      await vercelFetch(`/v9/projects/${project.id}/env/${prev.id}${teamQ}`, {
        method: 'DELETE',
      });
    }

    await vercelFetch(`/v10/projects/${project.id}/env${teamQ}`, {
      method: 'POST',
      body: JSON.stringify({
        key,
        value,
        type: 'encrypted',
        target: ['production', 'preview'],
      }),
    });
    console.log(`  set ${key}`);
  }

  console.log('\nDone. Redeploy from Vercel dashboard or: npx vercel --prod');
}

main().catch((err) => {
  console.error(err.message ?? err);
  console.error('\nOne-time setup: create https://vercel.com/account/tokens then:');
  console.error('  $env:VERCEL_TOKEN = "your-token"');
  console.error('  node scripts/push-vercel-env.mjs');
  process.exit(1);
});
