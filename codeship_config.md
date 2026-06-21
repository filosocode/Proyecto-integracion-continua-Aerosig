\# Configuración Codeship — AeroSIG



\## Herramienta

Codeship Basic (plan gratuito)



\## Propósito

Pipeline de integración continua alternativo a Jenkins y Travis CI.

Ejecuta las pruebas unitarias del backend automáticamente en cada push.



\## Setup Commands (configurados en la interfaz web de Codeship)

pip install -r backend/requirements.txt



\## Test Commands (configurados en la interfaz web de Codeship)

cd backend \&\& pytest test\_api.py -v



\## Resultado esperado

5 tests ejecutados — todos en verde (PASSED)

