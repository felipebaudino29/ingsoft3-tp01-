# ==========================================
# ETAPA 1 — Dependencias completas (dev + prod)
# ==========================================
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# ==========================================
# ETAPA 2 — Tests (Intermedia para CI)
# ==========================================
FROM deps AS test

ENTRYPOINT ["npm", "run", "test:coverage", "--", "--coverageDirectory=/out"]

# ==========================================
# ETAPA 3 — Ejecución (Producción limpia)
# ==========================================
FROM node:22-alpine AS final

WORKDIR /app

ENV NODE_ENV=production

# Copiamos solo dependencias de producción podadas
COPY package*.json ./
RUN npm ci --omit=dev

COPY index.js ./
COPY src/ ./src/

EXPOSE 3001

CMD ["node", "index.js"]