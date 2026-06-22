# Plan de Trabajo — Entrega 3 (Semanas 7 y 8)
## AeroSIG · Énfasis Profesional I – Integración Continua
### Politécnico Grancolombiano · Docente: John Alirio Olarte Ramos

---

## Objetivo de la entrega

Integrar Travis CI y Codeship al proyecto AeroSIG, que ya cuenta con Docker (Entrega 1) y Jenkins (Entrega 2). El documento final debe consolidar el historial de cambios, sugerencias para solución de problemas, responsabilidades y opiniones de cada integrante.

---

## Actividades técnicas

### 1. Flujo Git de la entrega (todos)

- Crear ramas feature desde `develop`:
  - `feature/travis` → Katherine
  - `feature/codeship` → Eddy
  - `feature/nikolas-e3` → Nikolas
- Cada integrante hace sus cambios en su rama y hace push a origin.
- Andrés integra los merges hacia `develop` y luego `develop → main`.

---

### 2. Configurar Travis CI

**Responsable: Katherine**

**Pasos:**
1. Ir a [https://travis-ci.com](https://travis-ci.com) e iniciar sesión con la cuenta de GitHub de filosocode.
2. Activar el repositorio `Proyecto-integracion-continua-Aerosig`.
3. En la rama `feature/travis`, crear el archivo `.travis.yml` en la raíz del repositorio:

```yaml
language: minimal

services:
  - docker

script:
  - docker build -t aerosig-backend ./backend
  - docker build -t aerosig-frontend ./frontend
```

4. Hacer commit y push. Travis CI ejecutará el pipeline automáticamente.
5. **Capturas requeridas:**
   - Dashboard de Travis CI mostrando el repositorio conectado.
   - Build en ejecución (estado "running").
   - Build completado en verde (passed).
   - Log de consola mostrando la construcción de ambas imágenes Docker.

---

### 3. Configurar Codeship

**Responsable: Eddy**

**Pasos:**
1. Ir a [https://codeship.com](https://codeship.com) y crear una cuenta (plan gratuito).
2. Crear un nuevo proyecto → seleccionar GitHub → conectar el repositorio `Proyecto-integracion-continua-Aerosig`.
3. En la configuración del proyecto (interfaz web), ingresar los siguientes comandos:

**Setup Commands:**
```bash
docker build -t aerosig-backend ./backend
docker build -t aerosig-frontend ./frontend
```

**Test Commands:**
```bash
echo "Verificando imagen backend..."
docker images aerosig-backend
echo "Verificando imagen frontend..."
docker images aerosig-frontend
```

4. Guardar y ejecutar el primer build manualmente o haciendo un push en `feature/codeship`.
5. **Capturas requeridas:**
   - Pantalla de creación/conexión del repositorio en Codeship.
   - Configuración de Setup Commands y Test Commands.
   - Dashboard mostrando el build completado (verde).
   - Log de consola del build exitoso.

---

### 4. Actualizar README y documentar el flujo Git

**Responsable: Nikolas**

**Tareas:**
- En la rama `feature/nikolas-e3`, actualizar el `README.md` agregando una sección **"Integración Continua – Entrega 3"** que incluya:
  - Badge de estado de Travis CI (se obtiene del dashboard de Travis).
  - Tabla con las tres herramientas CI/CD configuradas: Jenkins, Travis CI, Codeship.
  - Instrucciones para reproducir la configuración de cada herramienta.
- Documentar el historial de cambios de la entrega: ramas creadas, merges realizados, conflictos encontrados y cómo se resolvieron.
- Redactar la sección **"Responsabilidades y opiniones"** del documento (recopilar opinión de cada integrante sobre el proceso).

---

### 5. Integración, revisión y documento final

**Responsable: Andrés**

**Tareas:**
- Integrar los merges `feature/* → develop → main` una vez que cada integrante haga push de sus ramas.
- Resolver conflictos si los hay (principalmente en `README.md`).
- Redactar la **Introducción** y las **Conclusiones** del documento (mínimo 4 conclusiones).
- Revisar que todas las referencias estén en formato APA 7ma edición.
- Ensamblar el documento final en Word con todas las secciones y capturas.

---

## Distribución de actividades por integrante

| Integrante | Rama Git | Tarea técnica | Tarea documental |
|---|---|---|---|
| **Andrés Eduardo Muñoz Roa** | `develop / main` | Merges de integración, revisión de conflictos | Introducción, Conclusiones, revisión APA general |
| **Catherine Brigith Calderón Córdova** | `feature/travis` | Configurar Travis CI, archivo `.travis.yml`, capturas | Sección Travis CI: explicación línea a línea del YAML y evidencias |
| **Eddy Santiago Paipilla Galindo** | `feature/codeship` | Configurar Codeship, setup/test commands, capturas | Sección Codeship: explicación de la configuración y evidencias |
| **Jose Nikolas Niño Guerrero** | `feature/nikolas-e3` | Actualizar README.md con badges y tabla CI/CD | Historial de cambios, solución de problemas y sección de responsabilidades/opiniones |

---

## Estructura del documento Word (Entrega 3)

```
1. Portada
2. Tabla de contenido
3. Tabla de ilustraciones
4. Introducción                          ← Andrés
5. Descripción del proyecto
6. Flujo de trabajo Git (Entrega 3)      ← Nikolas
   6.1 Creación de ramas feature
   6.2 Aportes por integrante
   6.3 Merges hacia develop
   6.4 Integración final develop → main
7. Integración con Travis CI             ← Katherine
   7.1 Conexión del repositorio
   7.2 Archivo .travis.yml (línea a línea)
   7.3 Evidencia de ejecución
8. Integración con Codeship              ← Eddy
   8.1 Configuración del proyecto
   8.2 Setup Commands y Test Commands
   8.3 Evidencia de ejecución
9. Historial de cambios y solución       ← Nikolas
   de problemas
10. Responsabilidades y opiniones        ← Nikolas (recopila)
11. Conclusiones                         ← Andrés
12. Referencias APA 7ma edición
```

---

## Capturas mínimas requeridas (figuras del documento)

| # | Descripción | Responsable |
|---|---|---|
| Fig. 1 | git branch -a mostrando ramas feature de la Entrega 3 | Andrés |
| Fig. 2 | Dashboard de Travis CI con el repositorio conectado | Katherine |
| Fig. 3 | Build de Travis CI en ejecución (running) | Katherine |
| Fig. 4 | Build de Travis CI completado en verde (passed) | Katherine |
| Fig. 5 | Log de consola de Travis CI con ambas imágenes construidas | Katherine |
| Fig. 6 | Configuración del proyecto en Codeship (Setup Commands) | Eddy |
| Fig. 7 | Dashboard de Codeship con el build completado en verde | Eddy |
| Fig. 8 | Log de consola del build de Codeship | Eddy |
| Fig. 9 | Historial de commits en develop (git log --oneline) | Andrés |
| Fig. 10 | Estado final del repositorio en GitHub (rama main con .travis.yml) | Andrés |

---

## Cronograma sugerido

| Día | Actividad |
|---|---|
| **Día 1** | Cada integrante crea su rama feature y comienza la configuración técnica |
| **Día 2** | Katherine sube `.travis.yml` y verifica build verde en Travis CI |
| **Día 2** | Eddy configura Codeship y verifica build verde |
| **Día 3** | Nikolas actualiza README y redacta historial de cambios |
| **Día 3** | Andrés integra merges hacia develop |
| **Día 4** | Andrés hace develop → main, redacta introducción y conclusiones |
| **Día 4-5** | Ensamblaje del documento Word y revisión final APA |
| **Semana 8** | Sustentación |

---

## Notas importantes

- Travis CI requiere que el repositorio sea **público** (ya lo es) para usar el plan gratuito.
- Codeship Basic (gratuito) no soporta Docker nativo; usar comandos `docker build` directamente en los Setup Commands puede fallar. Si ocurre, documentar el error como evidencia y usar los Test Commands para verificar las imágenes. Alternativamente, Codeship Pro tiene soporte Docker pero requiere tarjeta de crédito.
- Si Codeship presenta problemas con Docker, la alternativa académicamente válida es documentar el intento, mostrar la configuración y explicar la limitación de la herramienta en la sección correspondiente.
- Todas las capturas deben tener título encima (**Figura N.**) y nota al pie en formato APA: `Nota. Descripción. Elaboración propia (2026).`
