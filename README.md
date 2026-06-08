# AeroSIG — Sistema de Gestión de Drones

Aplicación web para la administración y seguimiento de flotas de drones.

## ¿Qué hace?

* Registro y seguimiento de drones
* Gestión de usuarios con roles: administrador y piloto
* Autenticación segura con tokens JWT
* API REST con FastAPI (Python)
* Interfaz web con React + Vite

## Integrantes

* Jose Nikolas Niño Guerrero
* Catherine Brigith Calderon Cordova
* Eddy Santiago Paipilla Galindo
* Andrés Muñoz Roa

## Pipeline de Integración Continua — Jenkins

El proyecto incluye un pipeline CI/CD con Jenkins que automatiza
la construcción y despliegue de los contenedores Docker.

### Levantar Jenkins
    docker compose up jenkins
Jenkins disponible en: http://localhost:8080

### Etapas del Pipeline
| Etapa          | Descripción                                       |
|----------------|---------------------------------------------------|
| Checkout       | Clona el repositorio desde GitHub                 |
| Build Backend  | Construye la imagen Docker del backend (FastAPI)  |
| Build Frontend | Construye la imagen Docker del frontend (React)   |
| Deploy         | Levanta todos los contenedores con Docker Compose |


