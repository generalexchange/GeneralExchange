DIGITALOCEAN — READ BEFORE DEPLOY

Monte Carlo (Node compute):
  Use file: .do/monte-carlo-app.yaml
  Component type: DOCKER (not Node buildpack)
  Dockerfile: services/monte-carlo-api/Dockerfile
  HTTP port: 8092
  Health: /health

WebSocket server:
  Use file: .do/app.yaml
  Source directory: services/ws-server
  Type: DOCKER

DO NOT deploy repo root (/) with Node buildpack.
That builds the full Next.js app and will fail npm ci.
Next.js stays on Vercel.
