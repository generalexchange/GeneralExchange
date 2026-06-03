FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev
RUN npm install ws tsx typescript @types/ws @types/node
COPY services/ws-server ./services/ws-server
ENV NODE_ENV=production
ENV WS_PORT=3001
EXPOSE 3001
CMD ["npx", "tsx", "services/ws-server/index.ts"]
