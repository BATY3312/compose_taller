# 🐳 CRUD App con Docker + PostgreSQL

## 📋 Prerrequisitos

- Docker instalado ([Descargar aquí](https://www.docker.com/))
- Docker Compose instalado
- Cuenta en DockerHub ([Crear cuenta](https://hub.docker.com/))

## 🚀 Pasos para Ejecutar el Proyecto

### 1. Crear la estructura de archivos

Crea una carpeta y coloca todos los archivos:
```bash
mkdir mi-app-crud
cd mi-app-crud
```

Copia los siguientes archivos en la carpeta:
- `app.js`
- `package.json`
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`

### 2. Construir y levantar los contenedores

```bash
# Construir las imágenes y levantar los servicios
docker-compose up --build

# O para ejecutar en segundo plano
docker-compose up -d --build
```

### 3. Acceder a la aplicación

Abre tu navegador en: **http://localhost:3000**

### 4. Verificar que los contenedores están corriendo

```bash
docker ps
```

Deberías ver dos contenedores:
- `crud_app` (aplicación Node.js)
- `postgres_db` (base de datos PostgreSQL)

## 🔄 Comandos Útiles

```bash
# Ver logs de los contenedores
docker-compose logs -f

# Ver logs solo de la app
docker-compose logs -f app

# Ver logs solo de la base de datos
docker-compose logs -f db

# Detener los contenedores
docker-compose down

# Detener y eliminar volúmenes (borra los datos)
docker-compose down -v

# Reiniciar los servicios
docker-compose restart

# Ejecutar comandos dentro del contenedor de la app
docker exec -it crud_app sh

# Ejecutar comandos dentro del contenedor de PostgreSQL
docker exec -it postgres_db psql -U postgres -d tododb
```

## 📤 Subir la Imagen a DockerHub

### 1. Iniciar sesión en DockerHub

```bash
docker login
```

Ingresa tu usuario y contraseña de DockerHub.

### 2. Etiquetar la imagen

```bash
# Primero, construye la imagen localmente
docker build -t crud-app .

# Etiquetar la imagen con tu usuario de DockerHub
docker tag crud-app TU_USUARIO/crud-app:latest
docker tag crud-app TU_USUARIO/crud-app:1.0.0

# Ejemplo:
# docker tag crud-app juanperez/crud-app:latest
```

### 3. Subir la imagen a DockerHub

```bash
docker push TU_USUARIO/crud-app:latest
docker push TU_USUARIO/crud-app:1.0.0

# Ejemplo:
# docker push juanperez/crud-app:latest
```

### 4. Verificar en DockerHub

Ve a https://hub.docker.com y verifica que tu imagen aparezca en tus repositorios.

### 5. Usar la imagen desde DockerHub

Cualquier persona puede ahora descargar y usar tu imagen:

```bash
docker pull TU_USUARIO/crud-app:latest
```

Para usar tu imagen en docker-compose.yml, cambia:
```yaml
app:
  build: .
```

Por:
```yaml
app:
  image: TU_USUARIO/crud-app:latest
```

## 🧪 Probar la Aplicación

### Funcionalidades CRUD disponibles:

1. **CREATE**: Agregar nueva tarea con título y descripción
2. **READ**: Ver todas las tareas listadas
3. **UPDATE**: Marcar tareas como completadas/pendientes
4. **DELETE**: Eliminar tareas

### API Endpoints disponibles:

- `GET /` - Interfaz web
- `GET /api/tasks` - Obtener todas las tareas
- `GET /api/tasks/:id` - Obtener una tarea específica
- `POST /api/tasks` - Crear nueva tarea
- `PUT /api/tasks/:id` - Actualizar tarea completa
- `PUT /api/tasks/:id/toggle` - Cambiar estado completado
- `DELETE /api/tasks/:id` - Eliminar tarea

## 📊 Arquitectura

```
┌─────────────────┐
│   Navegador     │
│  localhost:3000 │
└────────┬────────┘
         │
         │ HTTP
         ▼
┌─────────────────┐
│   crud_app      │
│  (Node.js +     │
│   Express)      │
│   Puerto 3000   │
└────────┬────────┘
         │
         │ SQL
         ▼
┌─────────────────┐
│  postgres_db    │
│  (PostgreSQL)   │
│   Puerto 5432   │
└─────────────────┘
```

## 🛠️ Tecnologías Utilizadas

- **Node.js 18**: Runtime de JavaScript
- **Express**: Framework web para Node.js
- **PostgreSQL 15**: Base de datos relacional
- **Docker**: Contenedorización
- **Docker Compose**: Orquestación multi-contenedor

## 🔒 Seguridad (Producción)

Para producción, considera:

1. Usar secretos de Docker o variables de entorno externas
2. No hardcodear contraseñas en docker-compose.yml
3. Usar un archivo `.env`:

```env
POSTGRES_PASSWORD=mipassword_seguro_aqui
DB_PASSWORD=mipassword_seguro_aqui
```

Y modificar docker-compose.yml para usar:
```yaml
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

## 📝 Notas Adicionales

- Los datos de PostgreSQL persisten en un volumen Docker (`postgres_data`)
- El healthcheck asegura que la base de datos esté lista antes de iniciar la app
- La red `app-network` permite comunicación entre contenedores
- La app espera a que PostgreSQL esté saludable antes de arrancar (`depends_on`)

## 🎯 Objetivo del Taller Completado ✅

- ✅ Aplicación web CRUD funcional
- ✅ Dockerfile para construir imagen de la app
- ✅ Docker Compose orquestando app + base de datos
- ✅ Instrucciones para subir imagen a DockerHub
- ✅ Persistencia de datos con volúmenes
- ✅ Interfaz web intuitiva y responsive
