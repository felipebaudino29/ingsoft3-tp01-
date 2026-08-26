# =========================
# ETAPA 1 — Dependencias
# =========================

FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev


# =========================
# ETAPA 2 — Ejecución
# =========================

FROM node:22-alpine AS final

WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules

COPY package.json package-lock.json ./

COPY index.js ./

EXPOSE 3001

CMD ["node", "index.js"]