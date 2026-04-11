# Bedrock Express API only (no Vite frontend). Use with App Runner, ECS, Fly.io, etc.
FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY server ./server

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "run", "start:api"]
