# Gestor de Materias - Ingenieria de Software 3

[![CI](https://github.com/felipebaudino29/ingsoft3-tp01-/actions/workflows/ci.yml/badge.svg)](https://github.com/felipebaudino29/ingsoft3-tp01-/actions/workflows/ci.yml)

Aplicacion full-stack desarrollada para ser utilizada durante los trabajos practicos de Ingenieria de Software 3.

El sistema permite administrar materias y actividades asociadas a cada materia.

La aplicacion esta contenerizada utilizando Docker y Docker Compose.

---

# Tecnologias utilizadas

## Frontend

- React
- Vite
- Nginx

## Backend

- Node.js
- Express

## Base de datos

- PostgreSQL 16

## Contenedores

- Docker
- Docker Compose
- GitHub Container Registry (GHCR)

---

# Funcionalidades

## Materias

- Crear materias.
- Listar materias.
- Editar materias.
- Eliminar materias.
- Definir estado de la materia.

## Actividades

- Crear actividades asociadas a una materia.
- Listar actividades.
- Editar actividades.
- Marcar actividades como completadas.
- Eliminar actividades.

---

# Arquitectura

La aplicacion esta compuesta por tres servicios:

```text
                         Docker Compose
                               |
             +-----------------+-----------------+
             |                 |                 |
             v                 v                 v
         frontend           backend             db
       React + Nginx    Node.js + Express    PostgreSQL
             |                 |                 |
     localhost:8080       puerto 3001       puerto 5432
             |             interno            interno
             |                 |                 |
             +---- /api ------>+---------------->+
                                                 |
                                                 v
                                              db_data
                                        volumen persistente
```

Docker Compose crea una red interna que permite que los servicios se comuniquen utilizando sus nombres.

El backend se conecta a PostgreSQL utilizando:

```text
DB_HOST=db
```

El frontend utiliza Nginx como reverse proxy para enviar las solicitudes:

```text
/api
```

hacia:

```text
backend:3001
```

---

# Requisitos

Para ejecutar el proyecto se necesita:

- Git
- Docker Desktop
- Docker Compose

No es necesario instalar Node.js ni PostgreSQL localmente para ejecutar la aplicacion mediante Docker.

Docker Desktop debe estar iniciado antes de ejecutar los comandos.

Para verificar que Docker funciona:

```powershell
docker ps
```

---

# Levantar el proyecto desde cero

## 1. Clonar el repositorio

```powershell
git clone https://github.com/felipebaudino29/ingsoft3-tp01-.git
```

Entrar al proyecto:

```powershell
cd ingsoft3-tp01-
```

---

## 2. Crear el archivo de variables de entorno

El archivo `.env` no se encuentra versionado.

El repositorio incluye:

```text
.env.example
```

En Windows PowerShell ejecutar:

```powershell
Copy-Item .env.example .env
```

En Linux o macOS:

```bash
cp .env.example .env
```

El archivo generado contiene la configuracion necesaria para PostgreSQL.

---

## 3. Construir y levantar la aplicacion

Ejecutar:

```powershell
docker compose up --build -d
```

Docker Compose:

1. Construye la imagen del backend.
2. Construye la imagen del frontend.
3. Crea la red interna.
4. Crea el volumen de PostgreSQL.
5. Inicia la base de datos.
6. Espera a que PostgreSQL se encuentre saludable.
7. Inicia el backend.
8. Inicia el frontend.

---

## 4. Verificar los servicios

Ejecutar:

```powershell
docker compose ps
```

Se espera un resultado donde los tres servicios se encuentren activos:

```text
backend    Up
db         Up (healthy)
frontend   Up
```

---

## 5. Abrir la aplicacion

Ingresar desde el navegador a:

```text
http://localhost:8080
```

---

# Base de datos

PostgreSQL utiliza un volumen nombrado:

```text
db_data
```

Este volumen permite conservar los datos aunque los contenedores sean eliminados.

El archivo:

```text
backend/init.sql
```

crea automaticamente las tablas necesarias cuando PostgreSQL inicia utilizando un volumen nuevo.

Las tablas principales son:

- `materias`
- `actividades`

---

# Persistencia

Para detener y eliminar los contenedores sin borrar los datos:

```powershell
docker compose down
```

Al volver a ejecutar:

```powershell
docker compose up -d
```

los datos almacenados anteriormente siguen disponibles.

Para eliminar tambien el volumen y los datos:

```powershell
docker compose down -v
```

Advertencia: este comando elimina los datos almacenados en PostgreSQL.

---

# Logs

Para consultar los logs del backend:

```powershell
docker compose logs backend
```

Para consultar los logs del frontend:

```powershell
docker compose logs frontend
```

Para consultar los logs de PostgreSQL:

```powershell
docker compose logs db
```

Para ver los logs de todos los servicios:

```powershell
docker compose logs
```

---

# Detener la aplicacion

Para detener y eliminar los contenedores:

```powershell
docker compose down
```

Los datos permanecen almacenados en el volumen.

---

# Imagenes publicadas

Las imagenes de frontend y backend se encuentran publicadas en GitHub Container Registry.

## Backend

```text
ghcr.io/felipebaudino29/gestor-materias-backend:v0.1.0
```

## Frontend

```text
ghcr.io/felipebaudino29/gestor-materias-frontend:v0.1.0
```

Ambas imagenes son publicas.

---

# Ejecutar utilizando las imagenes publicadas

Tambien se puede levantar el sistema sin construir localmente las imagenes del frontend y backend.

Primero crear el `.env`:

```powershell
Copy-Item .env.example .env
```

Luego ejecutar:

```powershell
docker compose -f docker-compose.registry.yml up -d
```

Verificar:

```powershell
docker compose -f docker-compose.registry.yml ps
```

Abrir:

```text
http://localhost:8080
```

En esta modalidad Docker utiliza directamente las imagenes publicadas en GHCR.

---

# Dockerfiles

El proyecto posee dos Dockerfiles independientes.

## Backend

```text
backend/Dockerfile
```

Utiliza una construccion multi-stage basada en:

```text
node:22-alpine
```

La imagen final contiene las dependencias de produccion y el codigo necesario para ejecutar la API.

## Frontend

```text
frontend/Dockerfile
```

La primera etapa utiliza:

```text
node:22-alpine
```

para generar el build de React.

La segunda etapa utiliza:

```text
nginx:alpine
```

para servir los archivos estaticos.

Node.js no forma parte de la imagen final del frontend.

---

# Variables de entorno

Las variables utilizadas son:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=gestor_materias
```

El archivo `.env` real se encuentra ignorado por Git.

El archivo `.env.example` si se encuentra versionado para documentar las variables necesarias.

---

# Estructura principal

```text
ingsoft3-tp01-/
|
|-- backend/
|   |-- Dockerfile
|   |-- .dockerignore
|   |-- index.js
|   |-- init.sql
|   |-- package.json
|   `-- package-lock.json
|
|-- frontend/
|   |-- Dockerfile
|   |-- .dockerignore
|   |-- nginx.conf
|   |-- package.json
|   `-- src/
|
|-- docker-compose.yml
|-- docker-compose.registry.yml
|-- .env.example
|-- decisiones.md
|-- evidencias.md
`-- README.md
```

---

# TP1

En el TP1 se configuro el repositorio del semestre y el flujo de trabajo mediante Git y GitHub.

Se trabajo con:

- Proteccion de la rama `main`.
- Pull Requests.
- Resolucion de conflictos.
- Tags.
- Releases.

El TP1 se encuentra identificado mediante:

```text
v1.0.0
```

---

# TP2

En el TP2 se contenerizo el Gestor de Materias.

Se implementaron:

- Dockerfile multi-stage para backend.
- Dockerfile multi-stage para frontend.
- `.dockerignore` para ambos componentes.
- Nginx para servir el frontend.
- Reverse proxy hacia el backend.
- Docker Compose.
- PostgreSQL contenerizado.
- Volumen persistente.
- Healthcheck.
- Variables de entorno.
- Inicializacion automatica de la base de datos.
- Publicacion de imagenes en GitHub Container Registry.
- `docker-compose.registry.yml`.
- Pruebas de persistencia.
- Pruebas end-to-end.

Las decisiones tecnicas se encuentran documentadas en:

```text
decisiones.md
```

Las pruebas y resultados se encuentran documentados en:

```text
evidencias.md
```