# Evidencias - TP1

## 1. Push directo a main rechazado

![Push rechazado](img/push-rechazado.png)

GitHub rechaza el push directo porque la regla de proteccion sobre `main` esta activa e incluye al dueno del repositorio.

## 2. Aviso de conflicto en el Pull Request

![Aviso de conflicto](img/aviso-conflicto.png)

GitHub alerta que el PR de la rama B no se puede mergear automaticamente por tocar las mismas lineas que la rama A.

## 3. Marcadores de conflicto

![Marcadores de conflicto](img/marcadores-conflicto.png)

Vista de los marcadores `<<<<<<<`, `=======` y `>>>>>>>` en el editor web durante la resolucion manual.

## 4. Release v1.0.0 publicada

![Release publicada](img/release-v1.0.0.png)

Publicacion de la version en la seccion de Releases sobre el tag `v1.0.0`.

---

# Evidencias - TP2: Contenedores

## 1. Aplicacion seleccionada

Para el TP2 se utilizo una aplicacion propia denominada **Gestor de Materias**.

La aplicacion esta compuesta por:

- Frontend desarrollado con React + Vite.
- Backend desarrollado con Node.js + Express.
- Base de datos PostgreSQL.
- CRUD de materias.
- CRUD de actividades asociadas a cada materia.
- Persistencia de datos en PostgreSQL.

El objetivo del TP2 fue contenerizar los tres componentes y permitir levantar el sistema completo mediante Docker Compose.

---

## 2. Construccion de las imagenes

Se crearon Dockerfiles separados para backend y frontend.

### Backend

El backend utiliza un Dockerfile multi-stage basado en Node.js 22 Alpine.

La primera etapa instala las dependencias de produccion y la segunda genera la imagen final utilizada para ejecutar la API.

Archivos relacionados:

- `backend/Dockerfile`
- `backend/.dockerignore`

### Frontend

El frontend utiliza un Dockerfile multi-stage.

La primera etapa utiliza Node.js para instalar las dependencias y generar el build de produccion de React.

La segunda etapa utiliza Nginx para servir los archivos estaticos generados.

Archivos relacionados:

- `frontend/Dockerfile`
- `frontend/.dockerignore`
- `frontend/nginx.conf`

Nginx tambien funciona como reverse proxy, enviando las solicitudes realizadas a `/api` hacia el servicio `backend`.

---

## 3. Levantamiento del sistema completo con Docker Compose

Se creo el archivo:

`docker-compose.yml`

El sistema esta compuesto por tres servicios:

- `frontend`
- `backend`
- `db`

Para construir y levantar el sistema completo se ejecuto:

```powershell
docker compose up --build -d
```

El proceso construyo correctamente las imagenes del frontend y backend, creo la red de Docker Compose, creo el volumen de PostgreSQL y levanto los tres servicios.

Se verifico posteriormente el estado mediante:

```powershell
docker compose ps
```

Se obtuvo un resultado equivalente a:

```text
NAME                        SERVICE    STATUS
ingsoft3-tp01--backend-1    backend    Up
ingsoft3-tp01--db-1         db         Up (healthy)
ingsoft3-tp01--frontend-1   frontend   Up
```

La base de datos aparece como `healthy`, confirmando que el healthcheck configurado funciona correctamente.

El frontend quedo disponible desde:

`http://localhost:8080`

---

## 4. Comunicacion entre servicios

Los contenedores se comunican utilizando la red creada automaticamente por Docker Compose.

La arquitectura utilizada es:

```text
Navegador
    |
    v
Frontend
React + Nginx
    |
    | /api
    v
Backend
Node.js + Express
    |
    v
PostgreSQL
```

No se utilizan direcciones IP fijas para comunicar los contenedores.

El backend utiliza `db` como hostname para conectarse a PostgreSQL, aprovechando la resolucion de nombres interna de Docker Compose.

El frontend utiliza Nginx como reverse proxy para enviar las solicitudes `/api` al servicio `backend` por el puerto interno `3001`.

---

## 5. Prueba funcional end-to-end

Se verifico el funcionamiento de la aplicacion completa desde:

`http://localhost:8080`

Se probaron exitosamente las principales operaciones del sistema.

### Materias

- Crear una materia.
- Listar materias.
- Editar una materia.
- Eliminar una materia.

### Actividades

- Crear una actividad asociada a una materia.
- Listar actividades.
- Editar una actividad.
- Marcar una actividad como completada.
- Eliminar una actividad.

Tambien se verifico la comunicacion con la API mediante PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/materias" -Method GET
```

Durante una de las pruebas se obtuvo:

```text
id nombre  profesor     estado
-- ------  --------     ------
1  redes 2 Julio Gaitan Cursando
```

Esto permitio comprobar el recorrido completo:

```text
Cliente -> Nginx -> Backend -> PostgreSQL
```

---

## 6. Persistencia de datos con `docker compose down`

Para verificar que los datos de PostgreSQL no dependieran del ciclo de vida de los contenedores, se realizo una prueba de persistencia.

Antes de destruir los contenedores existia la siguiente materia:

```text
id nombre  profesor     estado
-- ------  --------     ------
1  redes 2 Julio Gaitan Cursando
```

Se ejecuto:

```powershell
docker compose down
```

Docker elimino los tres contenedores y la red.

Luego se volvio a levantar el sistema:

```powershell
docker compose up -d
```

Se verifico el estado:

```powershell
docker compose ps
```

PostgreSQL volvio a aparecer como:

```text
Up (healthy)
```

Finalmente se consultaron nuevamente las materias:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/materias" -Method GET
```

Resultado:

```text
id nombre  profesor     estado
-- ------  --------     ------
1  redes 2 Julio Gaitan Cursando
```

### Resultado

La materia continuo existiendo despues de eliminar y recrear los contenedores.

Esto demuestra que los datos de PostgreSQL se almacenan en un volumen persistente y no dentro del filesystem efimero del contenedor.

---

## 7. Eliminacion del volumen con `docker compose down -v`

Se realizo una segunda prueba para comprobar que ocurre cuando tambien se elimina el volumen.

Se ejecuto:

```powershell
docker compose down -v
```

Docker informo la eliminacion de los contenedores, la red y el volumen:

```text
Container ingsoft3-tp01--frontend-1  Removed
Container ingsoft3-tp01--backend-1   Removed
Container ingsoft3-tp01--db-1        Removed
Network ingsoft3-tp01-_default       Removed
Volume ingsoft3-tp01-_db_data        Removed
```

Posteriormente se levanto nuevamente el sistema:

```powershell
docker compose up -d
```

Docker creo un volumen nuevo:

```text
Volume "ingsoft3-tp01-_db_data" Created
Container ingsoft3-tp01--db-1 Healthy
Container ingsoft3-tp01--backend-1 Started
Container ingsoft3-tp01--frontend-1 Started
```

Luego se consultaron nuevamente las materias:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/materias" -Method GET
```

La consulta no devolvio registros.

### Resultado

Se comprobo la diferencia entre:

```text
docker compose down
-> elimina los contenedores pero conserva los datos.

docker compose down -v
-> elimina los contenedores y tambien el volumen con los datos.
```

Ademas, `backend/init.sql` permitio recrear automaticamente la estructura necesaria de la base de datos al iniciar PostgreSQL con un volumen nuevo.

---

## 8. Variables de entorno

La configuracion sensible de PostgreSQL se maneja mediante variables de entorno.

El proyecto utiliza las siguientes variables:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=gestor_materias
```

El archivo `.env` real no se versiona porque se encuentra excluido mediante `.gitignore`.

En el repositorio se incluye unicamente:

`.env.example`

Para crear la configuracion local a partir del ejemplo puede utilizarse:

```powershell
Copy-Item .env.example .env
```

Esto permite mantener la configuracion necesaria para ejecutar el proyecto sin versionar directamente el archivo `.env`.

---

## 9. Healthcheck y orden de inicio

El servicio PostgreSQL cuenta con un healthcheck que permite determinar cuando la base de datos esta realmente disponible.

Durante las pruebas se verifico el estado:

```text
db   Up (healthy)
```

El backend utiliza la condicion:

```yaml
depends_on:
  db:
    condition: service_healthy
```

De esta manera, el backend espera a que PostgreSQL este saludable antes de iniciar su dependencia sobre la base de datos.

Esto evita depender unicamente del orden de creacion de los contenedores.

---

## 10. Publicacion de imagenes en GitHub Container Registry

Se eligio **GitHub Container Registry (GHCR)** como registry para publicar las imagenes del proyecto.

Docker se autentico correctamente contra GHCR mediante:

```powershell
gh auth token | docker login ghcr.io -u felipebaudino29 --password-stdin
```

Resultado:

```text
Login Succeeded
```

### Backend

La imagen del backend se etiqueto mediante:

```powershell
docker tag ingsoft3-tp01--backend:latest ghcr.io/felipebaudino29/gestor-materias-backend:v0.1.0
```

Luego se publico:

```powershell
docker push ghcr.io/felipebaudino29/gestor-materias-backend:v0.1.0
```

Resultado:

```text
v0.1.0: digest: sha256:250c96d53318c350b7e2d45eba0abb65bec5452117f1274f3eff697f3a4775ad
```

### Frontend

La imagen del frontend se etiqueto mediante:

```powershell
docker tag ingsoft3-tp01--frontend:latest ghcr.io/felipebaudino29/gestor-materias-frontend:v0.1.0
```

Luego se publico:

```powershell
docker push ghcr.io/felipebaudino29/gestor-materias-frontend:v0.1.0
```

Resultado:

```text
v0.1.0: digest: sha256:645aeb79c080c8c8caa937b8346c3f0f5666c240b05cb5929f2a03d6f346144d
```

Las imagenes publicadas son:

```text
ghcr.io/felipebaudino29/gestor-materias-backend:v0.1.0
ghcr.io/felipebaudino29/gestor-materias-frontend:v0.1.0
```

Ambos packages fueron configurados con visibilidad publica.

---

## 11. Ejecucion utilizando las imagenes del registry

Se creo una segunda configuracion:

`docker-compose.registry.yml`

A diferencia de `docker-compose.yml`, esta configuracion no construye localmente las imagenes de frontend y backend.

Utiliza directamente las imagenes publicadas en GHCR:

```yaml
image: ghcr.io/felipebaudino29/gestor-materias-backend:v0.1.0
```

y:

```yaml
image: ghcr.io/felipebaudino29/gestor-materias-frontend:v0.1.0
```

Se levanto el sistema mediante:

```powershell
docker compose -f docker-compose.registry.yml up -d
```

Posteriormente se verifico mediante:

```powershell
docker compose -f docker-compose.registry.yml ps
```

Los servicios se ejecutaron utilizando las imagenes publicadas:

```text
backend    ghcr.io/felipebaudino29/gestor-materias-backend:v0.1.0
db         postgres:16-alpine
frontend   ghcr.io/felipebaudino29/gestor-materias-frontend:v0.1.0
```

PostgreSQL quedo nuevamente en estado:

```text
Up (healthy)
```

La aplicacion se probo desde:

`http://localhost:8080`

Las pruebas funcionales sobre materias y actividades fueron exitosas.

### Resultado

Se comprobo que el sistema puede ejecutarse utilizando las imagenes publicadas en GHCR sin reconstruir localmente las imagenes de frontend y backend.

---

## 12. Imagenes Docker generadas

Se verificaron las imagenes existentes mediante:

```powershell
docker images
```

Las imagenes finales del proyecto mostraron:

```text
REPOSITORY                  TAG        SIZE
ingsoft3-tp01--backend      latest     239MB
ingsoft3-tp01--frontend     latest     93.7MB
postgres                    16-alpine  419MB
```

El frontend final se ejecuta mediante Nginx y no necesita ejecutar el servidor de desarrollo de Vite.

El backend final contiene el runtime y las dependencias necesarias para ejecutar la API.

> La comparacion especifica entre las imagenes finales y las imagenes utilizadas durante las etapas de build se documentara luego de realizar la medicion correspondiente.

---

## 13. Arquitectura final contenerizada

La arquitectura obtenida es:

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
             |             (interno)          (interno)
             |                 |                 |
             +---- /api ------>+---------------->+
                                                 |
                                                 v
                                              db_data
                                        volumen persistente
```

El unico servicio que necesita exponerse al host para utilizar normalmente la aplicacion es el frontend mediante el puerto `8080`.

Backend y PostgreSQL se comunican internamente mediante la red de Docker Compose.

---

## 14. Resultado general del TP2

Durante las pruebas se verifico:

- Construccion de imagenes Docker.
- Dockerfiles multi-stage para frontend y backend.
- Uso de `.dockerignore`.
- Ejecucion del frontend mediante Nginx.
- Orquestacion del sistema mediante Docker Compose.
- Comunicacion entre servicios utilizando nombres DNS internos.
- Healthcheck de PostgreSQL.
- Dependencia del backend respecto del estado saludable de la base de datos.
- Persistencia mediante volumen nombrado.
- Conservacion de datos despues de `docker compose down`.
- Eliminacion de datos despues de `docker compose down -v`.
- Inicializacion automatica de una base de datos nueva.
- Configuracion mediante variables de entorno.
- Uso de `.env.example`.
- Publicacion del backend en GitHub Container Registry.
- Publicacion del frontend en GitHub Container Registry.
- Versionado de las imagenes con el tag `v0.1.0`.
- Ejecucion del sistema utilizando las imagenes publicadas.
- Pruebas funcionales end-to-end del Gestor de Materias.