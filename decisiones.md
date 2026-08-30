# Decisiones y Reflexiones - TP1

## 1. Análisis del conflicto de merge
* **Por qué Git no pudo resolverlo solo:** Ambas ramas modificaron exactamente la misma línea del archivo `README.md` partiendo del mismo commit base, por lo que Git no puede determinar cuál versión debe prevalecer.


* **Cómo evitarlo en un equipo:** Mantener ramas cortas de integración frecuente (GitHub Flow), constante comunicación en el equipo y ejecutar `git pull` o integrar `main` con frecuencia.


## 2. Problemas encontrados y soluciones
* Durante el desarrollo fue necesario revisar la configuración de las reglas de protección de rama para asegurar que el push directo fuera rechazado correctamente sin bloquear la capacidad de mergear el propio PR (configurando 0 aprobaciones obligatorias por ser trabajo individual y desactivando el bypass para administradores).

## 3. Declaración de uso de IA
* Se utilizó IA como soporte a lo largo del seguimiento de la guia para llevar a cabo precisamente los pasos descriptos en el documento. Fue siempre a fin de soporte cuando surgieron dudas especificas en caunto a ciertos puntos de la guia y para corroborar todo fui compartiendo capturas de los comandos, procedimientos y resultados obtenidos.



---

# TP2 - Contenedores

## 1. Aplicacion elegida para el semestre

Para el TP2 se eligio desarrollar y utilizar una aplicacion propia denominada **Gestor de Materias**.

La aplicacion esta compuesta por:

- Frontend desarrollado con React y Vite.
- Backend desarrollado con Node.js y Express.
- Base de datos PostgreSQL.
- Gestion CRUD de materias.
- Gestion CRUD de actividades asociadas a cada materia.

La aplicacion permite crear, consultar, modificar y eliminar materias, y administrar actividades relacionadas con cada una de ellas.

Se eligio esta aplicacion porque cumple con la estructura requerida para los trabajos practicos del semestre: frontend, backend y base de datos.

Tambien se considero conveniente utilizar una aplicacion propia porque permite conocer completamente su arquitectura, modificarla cuando sea necesario y utilizarla como base para los siguientes trabajos practicos del semestre.

---

## 2. Arquitectura elegida

La aplicacion se organizo en tres componentes principales:

```text
Frontend
React + Vite
    |
    v
Backend
Node.js + Express
    |
    v
PostgreSQL
```

Cada componente cumple una responsabilidad diferente:

- El frontend contiene la interfaz utilizada por el usuario.
- El backend contiene la API y la logica de acceso a los datos.
- PostgreSQL almacena las materias y actividades.

Para la contenerizacion se decidio ejecutar cada componente en un contenedor separado.

La arquitectura contenerizada quedo de la siguiente manera:

```text
Docker Compose
    |
    +-- frontend
    |
    +-- backend
    |
    +-- db
```

Esta separacion permite que cada componente tenga su propio entorno y pueda ser reemplazado o actualizado independientemente.

---

## 3. Dockerfile del backend

Para el backend se eligio utilizar:

```text
node:22-alpine
```

como imagen base.

Se eligio la variante Alpine por ser una imagen reducida y adecuada para ejecutar aplicaciones Node.js sin incluir herramientas innecesarias.

El Dockerfile se implemento utilizando una estructura multi-stage.

La primera etapa instala las dependencias necesarias:

```text
deps
```

La segunda etapa contiene solamente lo necesario para ejecutar la aplicacion:

```text
final
```

La separacion permite evitar incluir elementos innecesarios en la imagen final.

Tambien se utiliza:

```text
npm ci --omit=dev
```

para instalar solamente las dependencias necesarias para produccion.

---

## 4. Dockerfile del frontend

Para construir el frontend tambien se utilizo una estrategia multi-stage.

La primera etapa utiliza:

```text
node:22-alpine
```

para instalar las dependencias y generar el build de React mediante Vite.

El resultado de esta etapa es la carpeta:

```text
dist
```

La segunda etapa utiliza:

```text
nginx:alpine
```

para servir solamente los archivos estaticos generados.

De esta forma, Node.js se utiliza durante la construccion del frontend pero no es necesario dentro del contenedor final.

Esto permite separar claramente el proceso de construccion del proceso de ejecucion.

---

## 5. Uso de Nginx

Se decidio utilizar Nginx para servir el frontend compilado.

Ademas de servir los archivos estaticos, Nginx funciona como reverse proxy.

Las peticiones realizadas por el frontend a:

```text
/api
```

son redirigidas hacia:

```text
backend:3001
```

Esto permite que el navegador se comunique con un unico punto de entrada y que la comunicacion entre frontend y backend se resuelva dentro de la red de Docker Compose.

---

## 6. Docker Compose

Se utilizo Docker Compose para definir y ejecutar el sistema completo.

El archivo:

```text
docker-compose.yml
```

declara los tres servicios:

- `frontend`
- `backend`
- `db`

Docker Compose tambien se encarga de crear automaticamente una red interna para el proyecto.

Gracias a esta red, los contenedores pueden comunicarse utilizando los nombres de los servicios.

Por ejemplo, el backend utiliza:

```text
DB_HOST=db
```

en lugar de utilizar una direccion IP fija.

Esto evita depender de direcciones que pueden cambiar entre ejecuciones.

---

## 7. Persistencia de la base de datos

Se decidio utilizar un volumen nombrado de Docker para almacenar los datos de PostgreSQL.

El volumen utilizado es:

```text
db_data
```

PostgreSQL almacena sus datos dentro del contenedor en:

```text
/var/lib/postgresql/data
```

Docker conecta esa ubicacion con el volumen `db_data`.

Esta decision permite separar el ciclo de vida de los datos del ciclo de vida del contenedor.

Como resultado:

```text
docker compose down
```

puede eliminar los contenedores sin eliminar los datos.

En cambio:

```text
docker compose down -v
```

elimina tambien el volumen y, por lo tanto, los datos persistidos.

Se comprobo este comportamiento durante las pruebas del TP2.

---

## 8. Inicializacion de PostgreSQL

Se creo el archivo:

```text
backend/init.sql
```

para crear automaticamente las tablas necesarias cuando PostgreSQL inicia utilizando un volumen nuevo.

El script crea las tablas:

- `materias`
- `actividades`

Tambien define la relacion entre ambas tablas y utiliza `ON DELETE CASCADE` para eliminar las actividades relacionadas cuando se elimina una materia.

Esta decision permite que una persona pueda clonar el repositorio y crear una base de datos funcional sin ejecutar manualmente comandos SQL.

---

## 9. Healthcheck de PostgreSQL

Durante el desarrollo se considero que no era suficiente iniciar primero el contenedor de PostgreSQL.

Un contenedor puede estar iniciado pero la base de datos todavia puede no estar preparada para recibir conexiones.

Por este motivo se agrego un healthcheck utilizando:

```text
pg_isready
```

El backend utiliza:

```yaml
depends_on:
  db:
    condition: service_healthy
```

De esta manera, el backend espera a que PostgreSQL se encuentre realmente disponible antes de iniciar su dependencia sobre la base de datos.

---

## 10. Variables de entorno y secretos

Las credenciales y datos de configuracion de PostgreSQL no se escribieron directamente en el codigo fuente.

Se utilizaron variables de entorno:

```text
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB
```

El archivo:

```text
.env
```

contiene los valores utilizados localmente y se encuentra ignorado por Git.

En el repositorio se incluye:

```text
.env.example
```

para indicar que variables necesita configurar una persona que clone el proyecto.

Esta decision evita versionar directamente valores de configuracion sensibles.

---

## 11. Publicacion de imagenes

Se eligio GitHub Container Registry, GHCR, para publicar las imagenes Docker.

Se publicaron:

```text
ghcr.io/felipebaudino29/gestor-materias-backend:v0.1.0
ghcr.io/felipebaudino29/gestor-materias-frontend:v0.1.0
```

Se eligio GHCR porque el codigo del proyecto tambien se encuentra alojado en GitHub y permite mantener codigo e imagenes dentro del mismo ecosistema.

Las imagenes fueron configuradas con visibilidad publica para permitir que puedan descargarse sin utilizar las credenciales personales del desarrollador.

---

## 12. Comparacion de tamanos de imagenes

Se realizo una comparacion entre las imagenes base utilizadas durante la construccion y las imagenes finales del proyecto.

Se ejecutaron los siguientes comandos:

```powershell
docker images node:22-alpine
docker images nginx:alpine
docker images ingsoft3-tp01--backend
docker images ingsoft3-tp01--frontend
```

Los tamanos obtenidos fueron:

```text
REPOSITORY                  TAG         SIZE
node                        22-alpine   232MB
nginx                       alpine      93.3MB
ingsoft3-tp01--backend      latest      239MB
ingsoft3-tp01--frontend     latest      93.7MB
```

### Backend

La imagen base utilizada por el backend es:

```text
node:22-alpine -> 232MB
```

La imagen final del backend tiene un tamano de:

```text
ingsoft3-tp01--backend -> 239MB
```

La diferencia corresponde principalmente a las dependencias de produccion y al codigo de la aplicacion.

El Dockerfile utiliza una etapa separada para instalar dependencias y posteriormente copia a la imagen final unicamente los elementos necesarios para ejecutar la API.

### Frontend

Durante la etapa de construccion del frontend se utiliza:

```text
node:22-alpine -> 232MB
```

Sin embargo, la imagen final utiliza:

```text
nginx:alpine -> 93.3MB
```

La imagen final del frontend tiene un tamano de:

```text
ingsoft3-tp01--frontend -> 93.7MB
```

Esto demuestra el beneficio del enfoque multi-stage.

Node.js y las herramientas utilizadas para compilar React solamente existen durante la etapa de build y no forman parte de la imagen final.

La imagen final contiene Nginx y los archivos estaticos generados por Vite, por lo que su tamano queda practicamente igual al de la imagen base de Nginx.

### Conclusion

La comparacion permite observar que el uso de Dockerfiles multi-stage evita conservar herramientas de construccion innecesarias dentro de las imagenes finales.

Esto es especialmente visible en el frontend, donde se utiliza Node.js para construir la aplicacion, pero la ejecucion final queda a cargo de Nginx.

---

## 13. Problemas encontrados y soluciones

### Puerto 5432 ocupado

Durante la configuracion inicial se detecto que el puerto local `5432` ya estaba siendo utilizado por otro proceso.

Para evitar el conflicto se ejecuto inicialmente PostgreSQL en Docker utilizando:

```text
5433:5432
```

De esta manera, el puerto `5433` del host apuntaba al puerto `5432` del contenedor.

Posteriormente, al utilizar Docker Compose, PostgreSQL dejo de necesitar un puerto publicado al host porque el backend se comunica directamente con el servicio `db` dentro de la red de Compose.

### Uso de localhost entre contenedores

Durante las primeras pruebas el backend utilizaba una configuracion pensada para ejecutarse directamente en la computadora.

Se aprendio que dentro de un contenedor:

```text
localhost
```

hace referencia al propio contenedor y no a la computadora ni a otro contenedor.

Para las pruebas iniciales se utilizo:

```text
host.docker.internal
```

Posteriormente, con Docker Compose, la solucion definitiva fue utilizar el nombre del servicio:

```text
db
```

### Comunicacion del frontend con el backend

Inicialmente el frontend realizaba las peticiones directamente hacia:

```text
http://localhost:3001
```

Para mejorar la configuracion contenerizada se modifico el frontend para utilizar:

```text
/api
```

y se configuro Nginx como reverse proxy hacia:

```text
backend:3001
```

Esto permite mantener la comunicacion dentro de la red de Docker Compose.

### Persistencia de PostgreSQL

Inicialmente PostgreSQL se ejecutaba en un contenedor sin que la persistencia fuera administrada como parte del proyecto.

Se incorporo un volumen nombrado:

```text
db_data
```

y se verifico experimentalmente que `docker compose down` conserva los datos y que `docker compose down -v` los elimina.

### Variables de entorno despues de migrar el proyecto

Al mover la aplicacion al repositorio oficial del semestre, el archivo `.env` no se copio porque se encuentra correctamente ignorado por Git.

Al ejecutar Docker Compose aparecieron avisos indicando que las variables:

```text
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB
```

no estaban definidas.

La solucion fue crear nuevamente el `.env` local a partir de:

```powershell
Copy-Item .env.example .env
```

Esto tambien permitio comprobar por que `.env.example` debe estar versionado y `.env` no.

### Docker Desktop detenido

En una de las pruebas Docker respondio con un error indicando que no podia conectarse con:

```text
dockerDesktopLinuxEngine
```

El problema no correspondia a los archivos del proyecto, sino a que Docker Desktop no estaba ejecutandose.

Se inicio Docker Desktop y posteriormente los comandos funcionaron correctamente.

### Migracion al repositorio del semestre

La aplicacion fue desarrollada inicialmente en un repositorio separado para poder construir y probar el MVP.

Al revisar la guia del TP2 se confirmo que la aplicacion utilizada durante el semestre debia incorporarse al mismo repositorio utilizado en el TP1.

Por este motivo se migro la aplicacion al repositorio oficial manteniendo:

- `decisiones.md`
- `evidencias.md`
- configuracion de protecciones de rama
- historial del TP1

La incorporacion del TP2 se realizo mediante la rama:

```text
feature/tp2-docker
```

para posteriormente integrarla mediante Pull Request, respetando el flujo configurado durante el TP1.

---

## 14. Resultado de las decisiones tomadas

Las decisiones implementadas permitieron obtener una aplicacion donde:

- Cada componente se ejecuta en un contenedor independiente.
- Frontend, backend y base de datos se comunican mediante una red de Docker Compose.
- Los datos de PostgreSQL permanecen independientes de los contenedores.
- Las credenciales locales no se versionan.
- El sistema puede construirse desde el codigo fuente.
- El sistema puede ejecutarse utilizando imagenes previamente publicadas.
- Una instalacion nueva puede crear automaticamente la estructura de la base de datos.
- La arquitectura queda preparada para continuar utilizandose en los siguientes trabajos practicos del semestre.


---

# TP3 - Planificacion y trazabilidad

## 1. Duracion del sprint

Se definio una duracion de 3 dias para el Sprint 1.

La duracion se eligio teniendo en cuenta el plazo disponible hasta la entrega del TP3 y el alcance reducido del sprint, compuesto por una historia de usuario y dos tareas tecnicas.

Este periodo permite implementar los cambios, verificar su funcionamiento y revisar el resultado antes de la entrega, manteniendo una iteracion corta y facil de controlar.

---

## 2. Limite de trabajo en progreso

Se configuro un limite de trabajo en progreso de 2 elementos en la columna In Progress.

El proyecto se desarrolla de forma individual, por lo que se utilizo como referencia la cantidad de personas mas uno.

El limite permite trabajar sobre una tarea principal y, si esta queda temporalmente bloqueada por una revision o dependencia, comenzar una segunda tarea sin acumular una cantidad excesiva de trabajo sin terminar.

Un limite mayor podria reducir su utilidad, ya que permitiria comenzar demasiadas tareas simultaneamente y dificultaria priorizar la finalizacion del trabajo iniciado.

---

## 3. Diagnostico de una historia mal escrita

La historia:

`Como desarrollador quiero crear la tabla usuarios para guardar los datos.`

esta mal escrita como historia de usuario porque describe directamente una solucion tecnica y no expresa valor o una necesidad observable para un usuario.

En realidad, crear una tabla es una tarea tecnica.

Una posible reescritura seria:

`Como usuario quiero que mis datos queden almacenados para poder recuperarlos cuando vuelva a utilizar la aplicacion.`

A partir de esta historia podria surgir como tarea tecnica la creacion de la tabla de usuarios.

---

## 4. Problemas encontrados y soluciones

### Incorporacion automatica de issues al Project

Durante la creacion de los issues se verifico que GitHub Projects incorporaba automaticamente la epica, la historia y las tareas mediante el workflow Auto-add to project.

En el caso del bug inicialmente se verifico manualmente su pertenencia al proyecto, comprobando luego que tambien habia sido agregado automaticamente y que su estado inicial era Todo.

### Configuracion del sprint

Se creo un campo personalizado denominado Sprint de tipo Iteration.

Inicialmente GitHub proponia una duracion de dos semanas, pero se decidio modificarla a 3 dias para alinearla con el plazo real disponible hasta la entrega del TP3.

### Trazabilidad entre tarea y Pull Request

Para implementar la tarea #12 se creo una rama independiente:

`ci/workflow-de-build-y-tests`

En ella se agrego el archivo:

`.github/workflows/ci.yml`

Luego se creo el Pull Request #15 hacia main y se incluyo en su descripcion:

`Closes #12`

GitHub reconocio automaticamente la relacion entre el Pull Request y la tarea.

Al realizar el merge, la tarea #12 se cerro automaticamente y el workflow del Project `Item closed -> Status: Done` la movio a la columna Done.

Como consecuencia, la historia #11 paso de 0/2 tareas completadas a 1/2, mostrando un avance del 50%.

### Workflow de CI

El workflow creado en este TP es un esqueleto inicial.

Se configuro para ejecutarse ante Pull Requests mediante:

`on: [pull_request]`

y utiliza:

`actions/checkout@v4`

para obtener el contenido del repositorio dentro del runner de GitHub Actions.

Al crear el Pull Request se comprobo que el workflow se ejecuto correctamente y el check finalizo exitosamente.

La implementacion completa de build y tests se continuara en el TP4.

---

## 5. Declaracion de uso de IA

Se utilizo IA como herramienta de apoyo durante el desarrollo del TP3 para interpretar la guia, organizar los pasos de trabajo, comprender conceptos como epica, historia de usuario, criterios de aceptacion, tareas, sprint, limite de trabajo en progreso y trazabilidad, y para revisar las configuraciones realizadas.

Las acciones fueron ejecutadas y verificadas manualmente sobre GitHub y el repositorio.

La validacion se realizo comprobando el resultado de cada paso mediante el Project, los issues, la jerarquia de sub-issues, el Board, el Sprint, el Pull Request, la ejecucion de GitHub Actions y los comandos de Git.

En particular, se verifico que el Pull Request #15 ejecutara correctamente el workflow, cerrara automaticamente la tarea #12 mediante `Closes #12` y que dicha tarea fuera movida automaticamente a Done por el workflow del Project.