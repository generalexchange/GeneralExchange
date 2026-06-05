FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY index.ts polygonFeed.ts restFeed.ts types.ts ./

ENV NODE_ENV=production
ENV WS_PORT=3001
EXPOSE 3001

CMD ["npx", "tsx", "index.ts"]
