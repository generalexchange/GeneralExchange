DIGITALOCEAN — FIX "Node.js build detected"

That message means DO is trying to build the whole Next.js app from package.json.
You want DOCKER for Monte Carlo only. Next.js stays on Vercel.

OPTION A — Import app spec (best)
  1. Apps → Create App → GitHub → your repo
  2. Choose "Import an existing App Spec" (not autodetect)
  3. Select file: .do/app.yaml
  4. Confirm component shows Dockerfile / Docker, port 8092, health /health
  5. Add secret MC_API_KEY → Create Resources

OPTION B — Autodetect with root Dockerfile
  1. Pull latest main (includes Dockerfile at repo root)
  2. Create App → GitHub → DO should show Docker (not Node)
  3. HTTP port: 8092, health check path: /health
  4. MC_API_KEY secret

If you still see Node.js:
  1. Edit the component → Resource settings
  2. Change Type to: Dockerfile (or Docker)
  3. Dockerfile path: Dockerfile  (root) OR services/monte-carlo-api/Dockerfile
  4. Source directory: / (repo root)
  5. Remove any "Build command" / "Run command" (npm run build, npm start)
  6. Delete extra components that autodetected as Node

Monte Carlo spec files:
  .do/app.yaml              ← default import (Monte Carlo Docker)
  .do/monte-carlo-app.yaml  ← same, alternate path in Dockerfile field
  .do/ws-app.yaml           ← WebSocket only (you use Fly.io instead)

After deploy:
  Vercel MONTE_CARLO_API_URL=https://YOUR-APP.ondigitalocean.app
  Vercel MC_API_KEY=<same as DO>
  Test: https://YOUR-APP.ondigitalocean.app/health
