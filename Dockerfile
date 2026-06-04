# Monte Carlo API — used by DigitalOcean when it auto-detects Docker at repo root.
# Same image as services/monte-carlo-api/Dockerfile (build context = repo root).
FROM node:22-alpine
WORKDIR /app

COPY packages/analytics ./packages/analytics
COPY services/monte-carlo-api/package.json ./services/monte-carlo-api/

WORKDIR /app/services/monte-carlo-api
RUN npm install --omit=dev

COPY services/monte-carlo-api/index.ts services/monte-carlo-api/tsconfig.json ./

ENV NODE_ENV=production
ENV MC_PORT=8092
EXPOSE 8092

CMD ["npx", "tsx", "index.ts"]
