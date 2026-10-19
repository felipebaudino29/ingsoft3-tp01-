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

# En lugar de copiar un nginx.conf estático, copiamos la plantilla .template[cite: 2]
# Nginx automáticamente procesará las variables de entorno BACKEND_URL y DNS_RESOLVER
COPY default.conf.template /etc/nginx/templates/default.conf.template

COPY --from=build /app/dist /usr/share/nginx/html

# Valores por defecto para entornos locales o de desarrollo
ENV BACKEND_URL=http://backend:8080 \
    DNS_RESOLVER=127.0.0.11

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]