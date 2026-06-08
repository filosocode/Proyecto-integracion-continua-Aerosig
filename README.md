# AeroSIG — Sistema de Gestión de Drones

Aplicación web para la administración y seguimiento de flotas de drones, desarrollada como proyecto del módulo de Integración Continua — Politécnico Grancolombiano.

---

## Integrantes del equipo

| Nombre | Rol en el pipeline |
|---|---|
| Jose Nikolas Niño Guerrero | Documentación del pipeline CI/CD |
| Catherine Brigith Calderon Cordova | Etapas Build Frontend y Deploy |
| Eddy Santiago Paipilla Galindo | Etapas Checkout y Build Backend |
| Andrés Muñoz Roa | Integración y perfil DevOps |

---

## ¿Qué hace el sistema?

- Registro y seguimiento de drones (nombre, modelo, estado)
- Gestión de usuarios con roles: administrador y piloto
- Autenticación segura con tokens JWT
- API REST construida con FastAPI (Python 3.11)
- Interfaz web construida con React + Vite (Node 20)

---

## Arquitectura de contenedores

El proyecto usa tres contenedores Docker conectados en una red interna llamada `aerosig-network`:

```
┌─────────────────────────────────────────┐
│           aerosig-network               │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │   frontend   │  │    backend      │  │
│  │  React+Vite  │→ │  FastAPI Python │  │
│  │  Puerto 5173 │  │  Puerto 8000    │  │
│  └──────────────┘  └─────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │           Jenkins                │   │
│  │   Gestor de integración continua │   │
│  │   Puerto 8080 (UI)               │   │
│  │   Puerto 50000 (agentes)         │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Requisitos previos

Para ejecutar este proyecto es necesario tener instalado:

| Herramienta | Versión mínima | Propósito |
|---|---|---|
| Docker Desktop | 24.x | Construcción y ejecución de contenedores |
| Docker Compose | 2.x | Orquestación de múltiples contenedores |
| Git | 2.x | Control de versiones y clonación del repositorio |

> No se requiere instalar Python, Node.js ni Jenkins de forma local. Todo se ejecuta dentro de los contenedores Docker.

---

## Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/filosocode/Proyecto-integracion-continua-Aerosig.git
cd Proyecto-integracion-continua-Aerosig
```

---

## Paso 2 — Levantar los contenedores del proyecto

Este comando construye las imágenes y levanta backend, frontend y Jenkins en segundo plano:

```bash
docker compose up -d --build
```

Verificar que los tres contenedores están corriendo:

```bash
docker ps
```

Se deben ver los contenedores `aerosig-backend`, `aerosig-frontend` y `aerosig-jenkins` con estado `Up`.

---

## Paso 3 — Configurar Jenkins (primera vez)

### 3.1 Acceder a Jenkins

Abrir en el navegador: `http://localhost:8080`

### 3.2 Obtener la contraseña inicial

Jenkins genera una contraseña de administrador en el primer arranque. Obtenerla con:

```bash
docker exec aerosig-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Copiar esa contraseña y pegarla en la pantalla de desbloqueo de Jenkins.

### 3.3 Instalar plugins sugeridos

En la pantalla de configuración inicial seleccionar **"Install suggested plugins"**. Esto instala automáticamente los plugins más comunes, incluyendo:

- Pipeline
- Git
- GitHub Integration
- Docker Pipeline

Esperar a que finalice la instalación (puede tomar varios minutos).

### 3.4 Crear el usuario administrador

Completar el formulario con usuario, contraseña y correo. Hacer clic en **"Save and Continue"**.

### 3.5 Configurar la URL de Jenkins

Dejar la URL por defecto `http://localhost:8080/` y hacer clic en **"Save and Finish"**.

---

## Paso 4 — Crear el pipeline en Jenkins

### 4.1 Nuevo item

Desde el panel principal de Jenkins:

1. Hacer clic en **"New Item"** (parte superior izquierda)
2. Escribir el nombre: `AeroSIG-Pipeline`
3. Seleccionar **"Pipeline"**
4. Hacer clic en **"OK"**

### 4.2 Configurar el pipeline

En la sección **Pipeline**, seleccionar:

- **Definition:** `Pipeline script from SCM`
- **SCM:** `Git`
- **Repository URL:** URL del repositorio en GitHub
- **Branch:** `*/develop`
- **Script Path:** `Jenkinsfile`

Hacer clic en **"Save"**.

### 4.3 Ejecutar el pipeline

Hacer clic en **"Build Now"** para ejecutar el pipeline por primera vez. El resultado se verá en **"Stage View"** con cada etapa pintada en verde si fue exitosa.

---

## Pipeline de Integración Continua — Jenkinsfile

El archivo `Jenkinsfile` en la raíz del repositorio define el pipeline completo con cuatro etapas:

```groovy
pipeline {
    agent any

    stages {
        stage('Checkout') { ... }
        stage('Build Backend') { ... }
        stage('Build Frontend') { ... }
        stage('Deploy') { ... }
    }
}
```

### Descripción de cada etapa

| Etapa | Comando ejecutado | Descripción |
|---|---|---|
| **Checkout** | `checkout scm` | Clona el repositorio desde GitHub a la máquina donde corre Jenkins |
| **Build Backend** | `docker build -t aerosig-backend ./backend` | Construye la imagen Docker del backend con FastAPI usando el `Dockerfile` de `/backend` |
| **Build Frontend** | `docker build -t aerosig-frontend ./frontend` | Construye la imagen Docker del frontend con React+Vite usando el `Dockerfile` de `/frontend` |
| **Deploy** | `docker compose up -d --build` | Levanta los tres contenedores en red, aplicando todos los cambios del build |

### Flujo visual del pipeline

```
[Checkout] → [Build Backend] → [Build Frontend] → [Deploy]
     ↓               ↓                ↓               ↓
 Clona repo    Imagen Python     Imagen Node     Contenedores
  de GitHub    FastAPI lista     React lista     corriendo
```

---

## Gestión del código — Flujo de ramas

El equipo sigue el modelo GitFlow definido en el Escenario 5 del módulo, con cinco tipos de ramas:

```
main (trunk / producción)
  └── develop (integración)
        ├── feature/nikolas  → documentación pipeline
        ├── feature/eddy     → Checkout y Build Backend
        └── feature/katherine → Build Frontend y Deploy
```

### Reglas del flujo

1. **Nadie hace cambios directamente en `main`** — es la rama de producción (trunk).
2. Cada integrante trabaja en su rama `feature/nombre`.
3. Al terminar, hace merge de su feature hacia `develop`.
4. Una vez que `develop` está estable y probado, se integra a `main`.

### Historial de integraciones realizadas

```
feature/nikolas  ──── merge ──┐
feature/eddy     ──── merge ──┤──→ develop ──→ (pendiente) main
feature/katherine ─── merge ──┘
```

---

## Estructura del proyecto

```
Proyecto-integracion-continua-Aerosig/
├── Jenkinsfile              # Pipeline de CI/CD
├── docker-compose.yml       # Orquestación de contenedores
├── README.md                # Este documento
├── backend/
│   ├── Dockerfile           # Imagen Python 3.11-slim
│   ├── main.py              # API FastAPI
│   ├── models.py            # Modelos de base de datos
│   ├── auth.py              # Autenticación JWT
│   └── requirements.txt     # Dependencias Python
└── frontend/
    ├── Dockerfile           # Imagen Node 20-alpine
    ├── src/
    │   ├── App.jsx
    │   └── components/      # Dashboard, Drones, Usuarios, Login
    └── package.json
```

---

## Verificar el sistema corriendo

| Servicio | URL | Credenciales por defecto |
|---|---|---|
| Frontend (React) | http://localhost:5173 | admin / admin123 |
| Backend API | http://localhost:8000/docs | — (Swagger UI) |
| Jenkins | http://localhost:8080 | Usuario creado en la configuración |

---

## Detener el sistema

```bash
docker compose down
```

Para eliminar también los volúmenes (datos de Jenkins):

```bash
docker compose down -v
```
