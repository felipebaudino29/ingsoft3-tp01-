# =========================
# ETAPA 1 — Build de React
# =========================
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# ===================================================
# ETAPA 2 — Tests (Intermedia: usa Node y dependencias)
# ===================================================
FROM build AS test

ENTRYPOINT ["npm", "run", "test:ci"]

# =========================
# ETAPA 3 — Servidor Nginx (Producción)
# =========================
FROM nginx:alpine AS final

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]